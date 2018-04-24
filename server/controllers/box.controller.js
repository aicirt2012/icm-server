import Promise from 'bluebird';
import Email from '../models/email.model';
import Box from '../models/box.model';
import config from '../../config/env';
import User from '../models/user.model';
import fs from 'fs';
import Socket from '../routes/socket';
import EmailController from './email.controller';


/**
 * @api {post} /box/ Add box
 * @apiDescription Adds a box and updates the client via socket.
 * @apiName AddBox
 * @apiGroup Box
 * @apiParam {String} [parentBoxId=null] Unique ID of parent box.
 * @apiParam {String} boxName name of new box.
 * @apiSuccessExample Success-Response:
 *    {message: 'Box added'}
 */
exports.addBox = (req, res) => {
  const user = req.user;
  const emailConnector = user.createIMAPConnector();
  console.log(req.body.parentBoxId, req.body.boxName);
  const parentBoxId = req.body.parentBoxId != 'NONE' ? req.body.parentBoxId : null;
  Box.findOne({ _id: parentBoxId })
    .then((parentBox) => {
      const newBoxName = parentBox ? parentBox.name + '/' + req.body.boxName : req.body.boxName;
      return emailConnector.addBox(newBoxName);
    })
    .then(() => {
      return syncIMAPBoxes(user, emailConnector);
    })
    .then(() => {
      res.status(200).send({ message: 'Box added' });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}

/**
 * @api {delete} /box/:id Delete box
 * @apiDescription Deletes a box and updates the client via Socket.
 * @apiName DeleteBox
 * @apiGroup Box
 * @apiParam {String} id Box unique ID.
 * @apiSuccessExample Success-Response:
 *    {message: 'Box deleted'}
 */
exports.delBox = (req, res) => {
  const user = req.user;
  const boxId = req.params.id;
  const emailConnector = user.createIMAPConnector();
  Box.findOne({ _id: boxId }).populate('parent')
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
      res.status(200).send({ message: 'Box deleted' });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}

/**
 * @api {post} /box/:id/rename Rename box
 * @apiDescription Rename box.
 * @apiName RenameBox
 * @apiGroup Box
 * @apiParam {String} id Box unique ID.
 * @apiParam {String} newBoxShortName new short name of box.
 * @apiSuccessExample Success-Response:
 *    {message: 'Renamed box: new box name'}
 */
exports.renameBox = (req, res) => {
  const user = req.user;
  const boxId = req.params.id;
  const newShortName = req.body.newBoxShortName;
  const emailConnector = user.createIMAPConnector();
  Box.findOne({ _id: boxId }).populate('parent')
    .then(oldBox => {
      const newBoxName = oldBox.parent != null ? oldBox.parent.name + '/' + newShortName : newShortName;
      return [oldBox, emailConnector.renameBox(oldBox.name, newBoxName)]
    })
    .spread((oldBox, newBoxName) => {
      return Box.rename(oldBox._id, newBoxName);
    })
    .then(box => {
      Socket.updateBox(user._id, box);
      res.status(200).send({ message: `Renamed box: ${box.name}` });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}

/**
 * @api {post} /box/:id/move Move box
 * @apiDescription Move box.
 * @apiName MoveBox
 * @apiGroup Box
 * @apiParam {String} id Box unique ID.
 * @apiParam {String} newParentBoxId new parent of box.
 * @apiSuccessExample Success-Response:
 *    {message: 'Moved box: new box name'}
 */
exports.moveBox = (req, res) => {
  const user = req.user;
  const boxId = req.params.id;
  const newParentBoxId = req.body.newParentBoxId;
  const emailConnector = user.createIMAPConnector();

  Box.findOne({ _id: boxId })
    .then(box => {
      if (newParentBoxId === 'ROOT') {
        const newParentBox = {_id: null, name: ''};
        return [box, newParentBox ];
      } else {
        return [box, Box.findOne({ _id: newParentBoxId })];
      }
    })
    .spread((box, newParentBox) => {
      const newBoxName = newParentBox.name !== '' ? newParentBox.name + '/' + box.shortName : box.shortName;
      return [box, emailConnector.renameBox(box.name, newBoxName), newParentBox]
    })
    .spread((box, newBoxName, newParentBox) => {
      return Box.move(box._id, newBoxName, newParentBox._id);
    })
    .then(box => {
      Socket.updateBox(user._id, box);
      res.status(200).send({ message: `Moved box: ${box.name}` });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}

/**
 * @api {get} /box/ Get all boxes
 * @apiDescription Returns all boxes of a user.
 * @apiName GetBoxes
 * @apiGroup Box
 * @apiSuccessExample Success-Response:
 * //TODO
 * {}
 */
exports.getBoxes = (req, res) => {
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
    Box.find({ user: user })
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


/**
 * @api {get} /box/syncAll Syncronize all boxes
 * @apiDescription Syncronizes the boxes and emails of the user via IMAP.
 * @apiName SyncBoxes
 * @apiGroup Box
 * @apiSuccessExample Success-Response:
 *     {message: 'Finished syncing'}
 */
exports.syncIMAP = (req, res, next) => {
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
      res.status(200).send({ message: 'Finished syncing' });
    })
    .catch(err => {
      next(err);
    });
}
