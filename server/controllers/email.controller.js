import Promise from 'bluebird';
import Email from '../models/email.model';
import Box from '../models/box.model';
import GmailConnector from '../core/mail/GmailConnector';
import SMTPConnector from '../core/mail/SMTPConnector';
import ExchangeConnector from '../core/mail/ExchangeConnector';
import config from '../../config/env';
import User from '../models/user.model';
import Analyzer from '../core/engine/analyzer';
import fs from 'fs';
import Socket from '../routes/socket';


const imapOptions = (user) => {
  return {
    user: user.provider.user,
    password: user.provider.password,
    host: user.provider.host,
    port: user.provider.port,
    tls: true,
    mailbox: 'INBOX'
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
    const emailConnector = createEmailConnector(req.query.provider, req.user);
    emailConnector.fetchBoxes(storeEmail, [config.gmail.send]).then(() => {
      res.status(200).send({
        message: 'Finished fetching'
      });
    }).catch((err) => {
      res.status(400).send(err);
    });
  });
}

function syncMails(req, res) {
  const before = new Date();
  const emailConnector = createEmailConnector(req.query.provider, req.user);
  emailConnector.fetchBoxes(storeEmail, req.body.boxes).then(() => {
    console.log('Time for fetching: ', new Date() - before);
    res.status(200).send({
      message: 'Finished fetching'
    });
  }).catch((err) => {
    res.status(400).send(err);
  })
}

function addBox(req, res) {
  const emailConnector = createEmailConnector(req.query.provider, req.user);
  emailConnector.addBox(req.body.boxName).then((boxName) => {
    req.user.boxList.push({
      id: req.user.boxList.length,
      name: boxName,
      shortName: boxName.substr(boxName.lastIndexOf('/') + 1, boxName.length),
      total: 0,
      new: 0,
      unseen: 0,
      parent: null
    });
    res.status(200).send({
      message: `Created new box: ${boxName}`,
      boxList: req.user.boxList
    });
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function delBox(req, res) {
  const emailConnector = createEmailConnector(req.query.provider, req.user);
  emailConnector.delBox(req.body.boxName).then((boxName) => {
    req.user.boxList.splice(req.user.boxList.findIndex((el) => el.name == boxName), 1);
    res.status(200).send({
      message: `Deleted box: ${boxName}`,
      boxList: req.user.boxList
    });
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function renameBox(req, res) {
  const emailConnector = createEmailConnector(req.query.provider, req.user);
  emailConnector.renameBox(req.body.oldBoxName, req.body.newBoxName).then((boxName) => {
    let box = req.user.boxList.find((el) => el.name == req.body.oldBoxName);
    box.name = req.body.newBoxName;
    box.shortName = box.name.substr(box.name.lastIndexOf('/') + 1, box.name.length);
    res.status(200).send({
      message: `Renamed box: ${boxName}`,
      boxList: req.user.boxList
    });
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function append(req, res) {
  const emailConnector = createEmailConnector(req.query.provider, req.user);
  emailConnector.append(req.body.box, req.body.args, req.body.to, req.body.from, req.body.subject, req.body.msgData).then((msgData) => {
    emailConnector.fetchBoxes(storeEmail, [req.body.box]).then(() => {
      res.status(200).send({msgData: msgData});
    })
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function move(req, res) {
  const emailConnector = createEmailConnector(req.query.provider, req.user);
  emailConnector.move(req.body.msgId, req.body.srcBox, req.body.destBox).then((msgId) => {
    emailConnector.fetchBoxes(storeEmail, [req.body.srcBox, req.body.destBox]).then((messages) => {
      res.status(200).send({messages: messages});
    })
  }).catch((err) => {
    res.status(400).send(err);
  });
}

/* DEPRECATED - DO NOT USE */
function copy(req, res) {
  createEmailConnector(req.query.provider, req.user).copy(req.body.msgId, req.body.srcBox, req.body.box).then((messages) => {
    res.status(200).send(messages);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function addFlags(req, res) {
  const emailConnector = createEmailConnector(req.query.provider, req.user);
  emailConnector.addFlags(req.body.msgId, req.body.flags, req.body.box).then((msgId) => {
    Email.findOne({
      uid: req.body.msgId,
      'box.name': req.body.box
    }).then((email) => {
      email.flags = email.flags.concat(req.body.flags);
      email.save().then(() => {
        res.status(200).send({
          message: 'Successfully added Flags',
          msgId: msgId,
          box: req.body.box
        });
      })
    })
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function delFlags(req, res) {
  const emailConnector = createEmailConnector(req.query.provider, req.user);
  emailConnector.delFlags(req.body.msgId, req.body.flags, req.body.box).then((msgId) => {
    Email.findOne({
      uid: req.body.msgId,
      'box.name': req.body.box
    }).then((email) => {
      req.body.flags.forEach((f) => {
        const index = email.flags.indexOf(f);
        if (index > -1) {
          email.flags.splice(index, 1);
        }
      });
      email.save().then(() => {
        res.status(200).send({
          message: 'Successfully deleted Flags',
          msgId: msgId,
          box: req.body.box
        });
      })
    });
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function setFlags(req, res) {
  const emailConnector = createEmailConnector(req.query.provider, req.user);
  emailConnector.setFlags(req.body.msgId, req.body.flags, req.body.box).then((messages) => {
    res.status(200).send(messages);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function getPaginatedEmailsForBox(req, res) {
  const options = {
    page: req.query.page ? parseInt(req.query.page) : 1,
    limit: req.query.limit ? parseInt(req.query.limit) : 25,
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
    page: req.query.page ? parseInt(req.query.page) : 1,
    limit: req.query.limit ? parseInt(req.query.limit) : 25,
    sort: {
      date: -1
    },
  };
  const query = {
    user: req.user,
    'box.name': req.query.box || req.user.boxList[0].name,
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
  }).lean().then((mail) => {
    // call analyzer with emailObject and append suggested task and already linked tasks
    if (mail && (req.user.trello || req.user.sociocortex)) {
      new Analyzer(mail, req.user).getEmailTasks().then((email) => {
        res.status(200).send(email);
      });
    } else {
      res.status(200).send(mail);
    }
  }).catch((err) => {
    res.status(400).send(err);
  });
}

/* EMAIL HELPER */
function createEmailConnector(provider, user) {
  switch (provider) {
    case 'gmail':
      return new GmailConnector(imapOptions(user), user);
      break;
    case 'exchange':
      return new ExchangeConnector(imapOptions(user, user));
      break;
    default:
      return new GmailConnector(imapOptions(user), user);
  }
}

function storeEmail(mail) {
  return new Promise((resolve, reject) => {
    Email.findOneAndUpdate({
      messageId: mail.messageId
    }, mail, {
      new: false,
      upsert: true,
      setDefaultsOnInsert: true
    }, (err, emailOld) => {
      if (err) {
        reject(err);
      } else {
        Email.findOne({
          messageId: mail.messageId
        }).then(emailUpdated => {
          console.log('UPDATEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE');
          //fs.writeFileSync('D:/email.old.txt', JSON.stringify(emailOld, undefined, 2));
          //fs.writeFileSync('D:/email.new.txt', JSON.stringify(emailUpdated, undefined, 2));
          Socket.pushUpdateToClient(emailOld, emailUpdated);
          resolve(emailUpdated);
        });
      }
    });
  })
}

function storeEmail2(mail) {
  console.log('==> storeEmail2');
  console.log(mail.box);
  return new Promise((resolve, reject) => {
    Box.findOne({user: mail.user, boxId: mail.box})
      .then(box => {
        console.log(box)
        mail.box2 = box._id;
        return storeEmail(mail);
      })
      .then(email => {
        resolve(email);
      })
  })
}

/*
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
 console.log('delete not updated mails +++++++++++++++++++++++++++');
 err ? reject(err) : resolve();
 })
 });
 }
 */

/*
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
 */


function getBoxes(user, details = false, provider) {
  const emailConnector = createEmailConnector(provider, user);
  return new Promise((resolve, reject) => {
    emailConnector.getBoxes(details).then((boxes) => {
      user.boxList = boxes;
      user.save().then(() => {
        resolve(boxes);
      })
    }).catch((err) => {
      reject(err);
    });
  })
}

/** ------------------ for new local interface ---------------------------------------- */

/** Returns the current boxes form the database */
//TODO enhance with unread mails
function getBoxes2(req, res) {
  console.log('--> getBoxes2');
  Box.find({user: req.user._id})
    .then(boxes => {
      console.log(boxes);
      res.status(200).send(boxes);
    });
}

// pagination
//function getEmails2(req, res) {
function getEmails2(user, boxId, dateLastEmail, order) {
  Email.find({user: user, box: boxId}) // careful with boxId
    .then(emails => {
      console.log('--> getEmails2');
      console.log(emails);
    });
}

/*FIRST*/
/** Syncs the box strucure via IMAP */
//TODO create push socket push mechanism
function syncBoxes2(user, details = false, provider) {
  console.log('--> syncBoxes2');
  const emailConnector = createEmailConnector(provider, user);
  return new Promise((resolve, reject) => {
    emailConnector.getBoxes(details).then((boxes) => {
      return Promise.each(boxes, (box) => {
        return Box.update2(box, user);
      }).then(() => {
        resolve()
      });
    }).catch((err) => {
      reject(err);
    });
  })
}


/** Syncs the emails via IMAP */
function syncMails2(user, provider) {
  const before = new Date();
  const emailConnector = createEmailConnector(provider, user);
  console.log('--> syncMails2');
  // use boxes from db
  return new Promise((resolve, reject) => {
    Box.find({user: user})
      .then(boxes => {
        /* retrieving all boxes */
        emailConnector.fetchBoxes2(storeEmail2, boxes)
          .then(() => {
            console.log('Time for fetching: ', new Date() - before);
            resolve();
          })
          .catch((err) => {
          })
      });
  })
}

/** Sync wrapper (boxes and mails) */
function syncViaIMAP2(req, res) {
  console.log('-> syncViaIMAP2');
  const user = req.user;
  const provider = req.query.provider;

  syncBoxes2(user, true, provider)
    .then(() => {
      syncMails2(user, provider).then(() => {
        console.log('all synced!');
        res.status(200).send({
          message: 'Finished syncing'
        });
      });
    });
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
  getSingleMail,
  getBoxes2,
  syncViaIMAP2
};
