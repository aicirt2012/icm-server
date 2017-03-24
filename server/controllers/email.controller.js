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

function sendEmail(req, res) {
  const smtpConnector = new SMTPConnector(smtpOptions(req.user));
  const emailConnector = createEmailConnector(req.query.provider, req.user);
  smtpConnector.sendMail(req.body)
    .then((result) => {
      return Box.findOne({name: config.gmail.send, user: req.user});
    })
    .then(box => {
      return emailConnector.fetchBoxes(storeEmail, [box]);
    })
    .then(() => {
      res.status(200).send({message: 'Finished fetching'});
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send(err);
    });
}

function addBox(req, res) {
  const user = req.user;
  const emailConnector = createEmailConnector(req.query.provider, user);
  emailConnector.addBox(req.body.boxName)
    .then(() => {
      return syncBoxes2(user, true, emailConnector);
    })
    .then(() => {
      return Box.getBoxesByUser(user._id);
    })
    .then(boxes => {
      res.status(200).send(boxes);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send(err);
    });
}

function delBox(req, res) {
  const user = req.user;
  const emailConnector = createEmailConnector(req.query.provider, user);
  emailConnector.delBox(req.body.boxName)
    .then(() => {
      // TODO emailConnector.delBox working but syncBoxes2 does not delete box id DB
      return syncBoxes2(user, true, emailConnector);
    })
    .then(() => {
      return Box.getBoxesByUser(user._id);
    })
    .then(boxes => {
      res.status(200).send(boxes);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}

// TODO refactor. req.user.boxList not used anymore
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
  Box.findOne({name: req.body.box, user: req.user})
    .then(box => {
      return [box, emailConnector.append(req.body.box, req.body.args, req.body.to, req.body.from, req.body.subject, req.body.msgData)]
    })
    .spread((box, msgData) => {
      return [msgData, emailConnector.fetchBoxes(storeEmail, [box])]
    })
    .spread((msgData, result) => {
      res.status(200).send({msgData: msgData});
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send(err);
    });
}

function move(req, res) {
  const emailConnector = createEmailConnector(req.query.provider, req.user);
  Email.findOne({_id: req.body.emailId}).populate('box')
    .then(email => {
      return [email, Box.findOne({_id: req.body.newBoxId, user: req.user})]
    })
    .spread((email, destBox) => {
      const srcBox = email.box;
      return [srcBox, destBox, emailConnector.move(email.uid, srcBox.name, destBox.name)]
    })
    .spread((srcBox, destBox, msgId) => {
      return emailConnector.fetchBoxes(storeEmail, [srcBox, destBox])
    })
    .then((messages) => {
      res.status(200).send({messages: messages});
    })
    .catch(err => {
      console.log(err);
      res.status(400).send(err);
    });
}

function addFlags(req, res) {
  const emailConnector = createEmailConnector(req.query.provider, req.user);
  Box.findOne({_id: req.body.boxId, user: req.user})
    .then(box => {
      return [box, emailConnector.addFlags(req.body.msgId, req.body.flags, box.name)]
    })
    .spread((box, msgId) => {
      return Email.findOne({uid: req.body.msgId, box: box})
    })
    .then((email) => {
      email.flags = email.flags.concat(req.body.flags);
      return email.save();
    })
    .then(() => {
      res.status(200).send({message: 'Successfully added Flags'});
    })
    .catch(err => {
      res.status(400).send(err);
    });
}

function delFlags(req, res) {
  Box.findOne({
    _id: req.body.boxId,
    user: req.user
  }, (err, box) => {
    const emailConnector = createEmailConnector(req.query.provider, req.user);
    emailConnector.delFlags(req.body.msgId, req.body.flags, box.name)
      .then((msgId) => {
        Email.findOne({
          uid: req.body.msgId,
          box: box
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
  searchPaginatedEmails2(req, res);
}

function getSingleMail(req, res) {
  Email.findOne({
    _id: req.params.id
  }).lean()
    .then((mail) => {
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
    Email.updateAndGetOldAndUpdated(mail)
      .spread((emailOld, boxOld, emailUpdated, boxUpdated) => {
        // TODO new box numbers do not work properly
        console.log('inside storeEmail...');
        console.log(JSON.stringify(boxOld));
        console.log(JSON.stringify(boxUpdated));
        Socket.pushEmailUpdateToClient(emailOld, boxOld, emailUpdated, boxUpdated);
        resolve(emailUpdated);
      })
      .catch(err => {
        reject(err);
      });
  });
}

/*
 // TODO syncDeletedMails
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

/** ------------------ for new local interface ---------------------------------------- */

/**
 * Returns the searched email, this is meant to return also a simple mail list for every box
 * @param sort fild that will be used to sort e.g. {date: -1}
 * @param boxId
 * @param search string to searchs
 * @param lastEmailDate
 */
function searchPaginatedEmails2(req, res) {

  console.log('inside searchPaginatedEmails2');

  const boxId = req.query.boxId;
  const sort = req.query.sort; // ASC or DESC
  const search = req.query.search;
  const lastEmailDate = new Date(req.query.lastEmailDate);

  console.log(sort);
  console.log(boxId);
  console.log(search);
  console.log(lastEmailDate);

  /* default params */
  const query = {
    user: req.user,
    date: {$lt: lastEmailDate}
  };
  const select = {}; // only necessary
  const options = {
    limit: 15,
    sort: {
      date: sort == 'DESC' ? -1 : 1
    },
  };

  if (boxId != 'NONE') {
    console.log('boxId: ' + boxId);
    query.box = boxId;
  }

  if (search != null && search != '') {
    const fromSearch = search.match(/from: ?"([a-zA-Z0-9 ]*)"([a-zA-Z0-9 ]*)/);
    console.log('from search');
    console.log(fromSearch);
    const from = fromSearch != null ? fromSearch[1] : null;
    const searchTerm = fromSearch != null ? fromSearch[2] : null;

    console.log(from);
    console.log(searchTerm);

    if (from != null) {
      query['from.name'] = new RegExp('.*' + from + '.*', "i")
    }

    if (searchTerm != null && searchTerm != ' ' && searchTerm != '') {
      query.$text = {$search: searchTerm};
    }
  }

  // von:max mysubject -> max
  // von: max mysubject -> max
  // from:max mysubject -> max
  // from: max mysubject -> max
  /*
   if (search.includes('von:')) {
   search.splice(' ')
   query.from =
   }
   */

  // an:max mysubject -> max
  // an: max mysubject -> max
  // to:max mysubject -> max

  console.log('final query');
  console.log(query);

  Email.find(query, select, options)
    .then(emails => {
      console.log('results');
      emails.forEach(email => {
        console.log(email.subject + ' ' + email.box);
      })
      res.status(200).send(emails);
    })
    .catch(err => {
      console.log(err);
      res.status(400).send(err);
    });


}

/** Returns the current boxes form the database */
function getBoxes2(req, res) {
  Box.getBoxesByUser(req.user._id)
    .then(boxes => {
      res.status(200).send(boxes);
    })
    .catch(err => {
      res.status(500).send(err);
    });
}

/** Syncs the box strucure via IMAP */
function syncBoxes2(user, details = false, emailConnector) {
  return new Promise((resolve, reject) => {
    emailConnector
      .getBoxes(details)
      .then(boxes => {
        const sortedBoxes = Box.sortByLevel(boxes, user);
        return Promise.each(sortedBoxes, (box) => {
          return Box.updateAndGetOldAndUpdated(box, user);
        })
          .spread((oldBox, updatedBox) => {
            //TODO create batch push socket push mechanism
            //Socket.pushBoxUpdateToClient(oldBox, updatedBox);
            resolve()
          })
          .catch(err => {
            reject(err);
          });
      })
      .catch(err => {
        reject(err);
      });
  })
}


/** Syncs the emails via IMAP */
function syncMails2(user, emailConnector) {
  const before = new Date();
  console.log('--> syncMails2');
  return new Promise((resolve, reject) => {
    Box.find({user: user})
      .then(boxes => {
        return emailConnector.fetchBoxes(storeEmail, boxes)
      })
      .then(() => {
        console.log('Time for fetching: ', new Date() - before);
        resolve();
      })
      .catch(err => {
        reject(err)
      });
  })
}

/** Sync wrapper (boxes and mails) */
function syncViaIMAP2(req, res) {
  console.log('-> syncViaIMAP2');
  const user = req.user;
  const provider = req.query.provider;
  const emailConnector = createEmailConnector(provider, user);
  syncBoxes2(user, true, emailConnector)
    .then(() => {
      return syncMails2(user, emailConnector);
    })
    .then(() => {
      console.log('all synced!');
      res.status(200).send({message: 'Finished syncing'});
    })
    .catch(err => {
      res.status(500).send(err);
    });
}

function autocomplete(req, res) {
  Email.autocomplete(req.user._id)
    .then(suggestions => {
      res.status(200).send(suggestions);
    })
    .catch(err => {
      res.status(500).send(err);
    });
}

export default {
  addBox,
  delBox,
  renameBox,
  append,
  move,
  sendEmail,
  addFlags,
  delFlags,
  setFlags,
  getPaginatedEmailsForBox,
  searchPaginatedEmails2,
  getSingleMail,
  getBoxes2,
  syncViaIMAP2
};
