import Promise from 'bluebird';
import Email from '../models/email.model';
import GmailConnector from '../helpers/mail/GmailConnector';
import SMTPConnector from '../helpers/mail/SMTPConnector';
import config from '../../config/env';
import User from '../models/user.model';

const imapOptions = (user) => {
  return {
    user: config.email.user,
    password: config.email.pass,
    host: config.email.host,
    port: config.email.port,
    tls: true,
    mailbox: 'INBOX',
    currentUser: user
  };
};

const smtpOptions = (user) => {
  return {
    host: config.smtp.host,
    port: config.smtp.port,
    secure: true,
    auth: {
      user: config.smtp.auth.user,
      pass: config.smtp.auth.pass
    },
    currentUser: user
  };
};

function getInitialImapStatus(req, res) {
  getBoxes(req.user, true).then((boxes) => {
    res.status(200).send(boxes);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function sendEmail(req, res) {
  const smtpConnector = new SMTPConnector(smtpOptions(req.user));
  smtpConnector.sendMail(req.body).then((result) => {
    /*  At the moment all mails are fetched when we start the synch process
    TO DO: write new function/endpoint to just fetch last couple of mails from sendBox  */
    const imapConnectorAllMessages = new GmailConnector(imapOptions(req.user));
    imapConnectorAllMessages.fetchEmails(storeEmail, config.gmail.allMessages).then((messages) => {
      res.status(200).send(messages);
    }).catch((err) => {
      res.status(400).send(err);
    });
  });
}

function fetchMails(req, res) {
  let promises = [];
  req.body.boxes.forEach((box) => {
    const imapConnector = new GmailConnector(imapOptions(req.user));
    promises.push(imapConnector.fetchEmails(storeEmail, box));
  })
  Promise.all(promises).then((results) => {
    req.user.lastSync = new Date();
    req.user.save().then(() => {
      res.status(200).send(results);
    })
  }).catch((err) => {
    res.status(400).send(err);
  });
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

function getBoxes(user, details = false) {
  return new Promise((resolve, reject) => {
    const imapConnector = new GmailConnector(imapOptions(user));
    imapConnector.getBoxes(details).then((boxes) => {
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

function addBox(req, res) {
  const imapConnector = new GmailConnector(imapOptions(req.user));
  imapConnector.addBox(req.body.boxName).then((boxName) => {
    getBoxes(req.user).then(() => {
      res.status(200).send(`Created new box: ${boxName}`);
    });
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function delBox(req, res) {
  const imapConnector = new GmailConnector(imapOptions(req.user));
  imapConnector.delBox(req.body.boxName).then((boxName) => {
    getBoxes(req.user).then(() => {
      res.status(200).send(`Deleted box: ${boxName}`);
    });
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function renameBox(req, res) {
  const imapConnector = new GmailConnector(imapOptions(req.user));
  imapConnector.renameBox(req.body.oldBoxName, req.body.newBoxName).then((boxName) => {
    getBoxes(req.user).then(() => {
      res.status(200).send(`Renamed box to: ${boxName}`);
    });
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function append(req, res) {
  const imapConnector = new GmailConnector(imapOptions(req.user));
  imapConnector.append(req.body.box, req.body.args, req.body.to, req.body.from, req.body.subject, req.body.msgData).then((msgData) => {
    imapConnector.fetchEmails(storeEmail, req.body.box).then(() => {
      res.status(200).send(msgData);
    })
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function move(req, res) {
  const imapConnector = new GmailConnector(imapOptions(req.user));
  imapConnector.move(req.body.msgId, req.body.srcBox, req.body.box).then((messages) => {
    imapConnector.fetchEmails(storeEmail, req.body.box).then(() => {
      res.status(200).send(messages);
    })
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function copy(req, res) {
  const imapConnector = new GmailConnector(imapOptions(req.user));
  imapConnector.copy(req.body.msgId, req.body.srcBox, req.body.box).then((messages) => {
    res.status(200).send(messages);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function addFlags(req, res) {
  const imapConnector = new GmailConnector(imapOptions(req.user));
  imapConnector.addFlags(req.body.msgId, req.body.flags, req.body.box).then((messages) => {
    res.status(200).send(messages);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function delFlags(req, res) {
  const imapConnector = new GmailConnector(imapOptions(req.user));
  imapConnector.delFlags(req.body.msgId, req.body.flags, req.body.box).then((messages) => {
    res.status(200).send(messages);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function setFlags(req, res) {
  const imapConnector = new GmailConnector(imapOptions(req.user));
  imapConnector.setFlags(req.body.msgId, req.body.flags, req.body.box).then((messages) => {
    res.status(200).send(messages);
  }).catch((err) => {
    res.status(400).send(err);
  });
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

function getPaginatedEmails(req, res)  {
  const options = {
    page: req.query.page ? req.query.page : 1,
    limit: req.query.limit ? req.query.limit : 10
  };
  const query = {
    user: req.user,
    box: req.query.box
  };
  Email.paginate(query, options).then((err, emails) => {
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
  Email.paginate(query, options).then((err, emails) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send(emails);
    }
  })
}

export default {
  fetchMails,
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
  getPaginatedEmails,
  searchPaginatedEmails
};
