import Promise from 'bluebird';
import Email from '../models/email.model';
import Box from '../models/box.model';
import config from '../../config/env';
import User from '../models/user.model';
import Analyzer from '../core/engine/analyzer';
import fs from 'fs';
import Socket from '../routes/socket';

function sendEmail(req, res) {
  req.user.createSMTPConnector().sendMail(req.body)
    .then(result => {
      return Box.findOne({name: config.gmail.send, user: req.user});
    })
    .then(box => {
      return req.user.createIMAPConnector().fetchBoxes(storeEmail, [box]);
    })
    .then(() => {
      res.status(200).send({message: 'Finished fetching'});
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send(err);
    });
}

/** Adds a box and updates the client via socket */
function addBox(req, res) {
  const user = req.user;
  const emailConnector = user.createIMAPConnector();
  emailConnector.addBox(req.body.boxName)
    .then(() => {
      user.lastSync = new Date();
      return user.save();
    })
    .then(() => {
      return syncIMAPBoxes(user, emailConnector);
    })
    .then(() => {
      res.status(200).send({message: 'Box added'});
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}

/** Deletes a box and updates the client via Socket */
function delBox(req, res) {
  const user = req.user;
  const emailConnector = user.createIMAPConnector();
  emailConnector.delBox(req.body.boxName)
    .then(() => {
      user.lastSync = new Date();
      return user.save();
    })
    .then(() => {
      return syncIMAPBoxes(user, emailConnector)
    })
    .then(() => {
      res.status(200).send({message: 'Box deleted'});
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}

// TODO refactor. req.user.boxList not used anymore
function renameBox(req, res) {
  const emailConnector = req.user.createIMAPConnector();
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
  const emailConnector = req.user.createIMAPConnector();
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
  const emailConnector = req.user.createIMAPConnector();
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
  const emailConnector = req.user.createIMAPConnector();
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
  const emailConnector = req.user.createIMAPConnector();
  Box.findOne({_id: req.body.boxId, user: req.user})
    .then(box => {
      return [box, emailConnector.delFlags(req.body.msgId, req.body.flags, box.name)]
    })
    .spread((box, msgId) => {
      return Email.findOne({uid: req.body.msgId, box: box})
    })
    .then((email) => {
      req.body.flags.forEach((f) => {
        const index = email.flags.indexOf(f);
        if (index > -1)
          email.flags.splice(index, 1);
      });
      return email.save()
    })
    .then(() => {
      res.status(200).send({message: 'Successfully deleted Flags'});
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}

/** Returns one single mail with all details */
function getSingleMail(req, res) {
  Email.findOne({_id: req.params.id}).lean()
    .then((mail) => {
      return (mail && (req.user.trello || req.user.sociocortex)) ? new Analyzer(mail, req.user).getEmailTasks() : mail;
    })
    .then(email => {
      res.status(200).send(email);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}


/** Stores an email in the database and
 *  pushs upates via socket to the client */
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


/** Search emails either for box or user serach */
function searchMails(req, res) {

  const options = {
    boxId: req.query.boxId,
    sort: req.query.sort, // ASC or DESC
    search: req.query.search,
    lastEmailDate: new Date(req.query.lastEmailDate)
  };

  Email.search(req.user._id, options)
    .then(emails => {
      res.status(200).send(emails);
    })
    .catch(err => {
      res.status(400).send(err);
    });
}

/** Returns the current boxes from the database */
function getBoxes(req, res) {
  Box.getBoxesByUserId(req.user._id)
    .then(boxes => {
      res.status(200).send(boxes);
    })
    .catch(err => {
      res.status(500).send(err);
    });
}

/** Syncronizes the boxes of the user via IMAP */
function syncIMAPBoxes(user, emailConnector) {
  return new Promise((resolve, reject) => {
    emailConnector
      .getBoxes(false)
      .then(boxes => {
        console.log(boxes);
        return Promise.each(boxes, (box) => {
          return new Promise((resolve, reject) => {
            Box.updateAndGetOldAndUpdated(box, user)
              .spread((oldBox, updatedBox) => {
                Socket.pushBoxUpdateToClient(oldBox, updatedBox);
                resolve()
              })
              .catch(err => {
                reject(err);
              });
          });
        });
      })
      .then(() => {
        return Box.deleteUpdatedAtOlderThan(user._id, user.lastSync);
      })
      .then(delBoxes => {
        delBoxes.forEach(box => {
          Socket.pushBoxUpdateToClient(box, null);
        });
        resolve();
      })
      .catch(err => {
        reject(err);
      });
  })
}

/** Syncronizes the emails of the user via IMAP */
function syncIMAPMails(user, emailConnector) {
  const before = new Date();
  console.log('--> syncIMAPMails');
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


/** Syncronizes the boxes and emails of the user via IMAP */
function syncIMAP(req, res) {
  console.log('-> syncIMAP');
  const user = req.user;
  const emailConnector = user.createIMAPConnector();
  user.lastSync = new Date();
  user.save()
    .then(() => {
      return syncIMAPBoxes(user, emailConnector)
    })
    .then(() => {
      return syncIMAPMails(user, emailConnector);
    })
    .then(() => {
      console.log('all synced!');
      res.status(200).send({message: 'Finished syncing'});
    })
    .catch(err => {
      res.status(500).send(err);
    });
}

/** Creates autocomplete suggestions for email addresses */
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
  searchMails,
  getSingleMail,
  getBoxes,
  syncIMAP
};
