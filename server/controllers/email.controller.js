import Promise from 'bluebird';
import Email from '../models/email.model';
import GmailConnector from '../core/mail/GmailConnector';
import SMTPConnector from '../core/mail/SMTPConnector';
import ExchangeConnector from '../core/mail/ExchangeConnector';
import config from '../../config/env';
import User from '../models/user.model';
import Analyzer from '../core/engine/analyzer';

const imapOptions = (user) => {
  return {
    user: user.provider.user,
    password: user.provider.password,
    host: user.provider.host,
    port: user.provider.port,
    tls: true,
    mailbox: 'INBOX',
    currentUser: user
  };
};

const smtpOptions = (user) => {
  return {
    host: user.provider.smtpHost,
    port: user.provider.smtpPort,
    secure: true,
    domains: user.provider.smtpDomains,
    auth: {
      user: user.provider.user,
      pass: user.provider.password
    },
    currentUser: user
  };
};

function getInitialImapStatus(req, res) {
  getBoxes(req.user, true, req.query.provider).then((boxes) => {
    res.status(200).send(boxes);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function sendEmail(req, res) {
  const smtpConnector = new SMTPConnector(smtpOptions(req.user));
  smtpConnector.sendMail(req.body).then((result) => {
    createEmailConnector(req.query.provider, req.user).fetchEmails(storeEmail, config.gmail.send).then((messages) => {
      res.status(200).send(messages);
    }).catch((err) => {
      res.status(400).send(err);
    });
  });
}

function syncMails(req, res) {
  let promises = [];
  let subPromises = [];
  if (!req.body.boxes || req.body.boxes.length < 1) {
    req.body.boxes = req.user.boxList.filter((box) => box.total != 0 && box.name != '[Gmail]/Important' && box.name != '[Gmail]/All Mail').map((box) => box.name);
  }
  req.body.boxes.forEach((box, index) => {
    if (subPromises.length == 10) {
      promises.push(subPromises);
      subPromises = [];
    }
    subPromises.push(createEmailConnector(req.query.provider, req.user).fetchEmails(storeEmail, box));
    if (index + 1 == req.body.boxes.length) {
      promises.push(subPromises);
    }
  });
  recursivePromises(promises, () => {
    req.user.lastSync = new Date();
    req.user.save().then(() => {
      res.status(200).send({
        message: 'Finished fetching'
      });
    });
  });
}

function addBox(req, res) {
  createEmailConnector(req.query.provider, req.user).addBox(req.body.boxName).then((boxName) => {
    getBoxes(req.user, false, req.query.provider).then(() => {
      res.status(200).send(`Created new box: ${boxName}`);
    });
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function delBox(req, res) {
  createEmailConnector(req.query.provider, req.user).delBox(req.body.boxName).then((boxName) => {
    getBoxes(req.user, false, req.query.provider).then(() => {
      res.status(200).send(`Deleted box: ${boxName}`);
    });
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function renameBox(req, res) {
  createEmailConnector(req.query.provider, req.user).renameBox(req.body.oldBoxName, req.body.newBoxName).then((boxName) => {
    getBoxes(req.user, false, req.query.provider).then(() => {
      res.status(200).send(`Renamed box to: ${boxName}`);
    });
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function append(req, res) {
  const imapConnector = createEmailConnector(req.query.provider, req.user);
  imapConnector.append(req.body.box, req.body.args, req.body.to, req.body.from, req.body.subject, req.body.msgData).then((msgData) => {
    imapConnector.fetchEmails(storeEmail, req.body.box).then(() => {
      res.status(200).send(msgData);
    })
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function move(req, res) {
  const imapConnector = createEmailConnector(req.query.provider, req.user);
  imapConnector.move(req.body.msgId, req.body.srcBox, req.body.destBox).then((messages) => {
    imapConnector.fetchEmails(storeEmail, req.body.destBox).then(() => {
      res.status(200).send(messages);
    })
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function copy(req, res) {
  createEmailConnector(req.query.provider, req.user).copy(req.body.msgId, req.body.srcBox, req.body.box).then((messages) => {
    res.status(200).send(messages);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function addFlags(req, res) {
  createEmailConnector(req.query.provider, req.user).addFlags(req.body.msgId, req.body.flags, req.body.box).then((messages) => {
    res.status(200).send(messages);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function delFlags(req, res) {
  createEmailConnector(req.query.provider, req.user).delFlags(req.body.msgId, req.body.flags, req.body.box).then((messages) => {
    res.status(200).send(messages);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function setFlags(req, res) {
  createEmailConnector(req.query.provider, req.user).setFlags(req.body.msgId, req.body.flags, req.body.box).then((messages) => {
    res.status(200).send(messages);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function getPaginatedEmailsForBox(req, res)  {
  const options = {
    page: req.query.page ? parseInt(req.query.page) : 1,
    limit: req.query.limit ? parseInt(req.query.limit) : 10,
    sort: {
      date: -1
    },
  };
  const query = {
    user: req.user,
    'box.name': req.query.box || req.user.boxList[0].name
  };
  Email.paginate(query, options).then((emails, err) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send(emails);
    }
  })

}

function searchPaginatedEmails(req, res) {
  const options = {
    page: req.query.page ? req.query.page : 1,
    limit: req.query.limit ? req.query.limit : 10
  };
  const query = {
    user: req.user,
    $text: {
      $search: req.query.q ? req.query.q : ''
    }
  };
  Email.paginate(query, options).then((emails, err) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send(emails);
    }
  })
}

function getSingleMail(req, res) {
  Email.findOne({
    _id: req.params.id
  }).lean().then((mail, err) => {
    // call analyzer with emailObject and append suggested task and already linked tasks
    new Analyzer(mail, req.user).getEmailTasks().then((email) => {
      res.status(200).send(email);
    }).catch((err) => {
      res.status(400).send(err);
    });
  })
}

/* EMAIL HELPER */
function createEmailConnector(provider, user) {
  switch (provider) {
    case 'gmail':
      return new GmailConnector(imapOptions(user));
      break;
    case 'exchange':
      return new ExchangeConnector(imapOptions(user));
      break;
    default:
      return new GmailConnector(imapOptions(user));
  }
}

function storeEmail(mail) {
  return new Promise((resolve, reject) => {
    Email.findOneAndUpdate({
      messageId: mail.messageId
    }, mail, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }, (err, email) => {
      if (err) {
        reject(err);
      }
      resolve(email);
    });
  });
}

function syncDeletedMails(syncTime, boxes) {
  return new Promise((resolve, reject) => {
    Email.remove({
      box: {
        "$in": boxes
      },
      updatedAt: {
        "$lt": syncTime
      }
    }, (err) => {
      err ? reject(err) : resolve();
    })
  });
}

function recursivePromises(promises, callback) {
  if (promises.length > 0) {
    Promise.all(promises[0]).then(() => {
      promises = promises.slice(1, promises.length);
      recursivePromises(promises, callback);
    })
  } else {
    callback();
  }
}

function generateBoxList(boxes, parent, arr) {
  Object.keys(boxes).forEach((key, i) => {
    const path = parent ? `${parent}/${key}` : key;
    if (key != '[Gmail]') {
      arr.push(path);
    }
    if (boxes[key].children) {
      generateBoxList(boxes[key].children, path, arr);
    }
  })
}

function getBoxes(user, details = false, provider) {
  return new Promise((resolve, reject) => {
    createEmailConnector(provider, user).getBoxes(details).then((boxes) => {
      User.findOne({
        _id: user._id
      }, (err, user) => {
        if (err) {
          reject(err);
        }
        user.boxList = boxes;
        user.save().then(() => {
          resolve(boxes);
        })
      });
    }).catch((err) => {
      reject(err);
    });
  })
}

export default {
  syncMails,
  addBox,
  delBox,
  renameBox,
  append,
  move,
  copy,
  sendEmail,
  addFlags,
  delFlags,
  setFlags,
  getInitialImapStatus,
  getPaginatedEmailsForBox,
  searchPaginatedEmails,
  getSingleMail
};
