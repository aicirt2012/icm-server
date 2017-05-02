import Promise from 'bluebird';
import Email from '../models/email.model';
import Box from '../models/box.model';
import config from '../../config/env';
import User from '../models/user.model';
import fs from 'fs';
import Socket from '../routes/socket';
import EmailController from './email.controller';

/** Adds a box and updates the client via socket */
function addBox(req, res) {
  const user = req.user;
  const emailConnector = user.createIMAPConnector();
  console.log(req.body.parentBoxId, req.body.boxName);
  const parentBoxId = req.body.parentBoxId != 'NONE' ? req.body.parentBoxId : null;
  Box.findOne({_id: parentBoxId})
    .then((parentBox) => {
      const newBoxName = parentBox ? parentBox.name + '/' + req.body.boxName : req.body.boxName;
      return emailConnector.addBox(newBoxName);
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
  const boxId = req.params.boxId;
  const emailConnector = user.createIMAPConnector();
  Box.findOne({_id: boxId}).populate('parent')
    .then(boxToDelete => {
      return [boxToDelete, emailConnector.delBox(boxToDelete.name)]
    })
    .spread(boxToDelete => {
      return [boxToDelete, Box.cascadeDeleteBoxById(boxToDelete._id, user._id, false)]
    })
    .spread((boxDeleted, msg) => {
      Socket.deleteBox(user._id, boxDeleted);
    })
    .then(() => {
      res.status(200).send({message: 'Box deleted'});
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}

function renameBox(req, res) {
  const user = req.user;
  const boxId = req.params.boxId;
  const newShortName = req.body.newBoxShortName;
  const emailConnector = user.createIMAPConnector();
  Box.findOne({_id: boxId}).populate('parent')
    .then(oldBox => {
      const newBoxName = oldBox.parent != null ? oldBox.parent.name + '/' + newShortName : newShortName;
      return [oldBox, emailConnector.renameBox(oldBox.name, newBoxName)]
    })
    .spread((oldBox, newBoxName) => {
      return Box.rename(oldBox._id, newBoxName);
    })
    .then(box => {
      Socket.updateBox(user._id, box);
      res.status(200).send({message: `Renamed box: ${box.name}`});
    })
    .catch((err) => {
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
        return emailConnector.fetchBoxes(EmailController.storeEmail, boxes)
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

export default {
  addBox,
  delBox,
  renameBox,
  getBoxes,
  syncIMAP
};
