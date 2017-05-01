import Promise from 'bluebird';
import Email from '../models/email.model';
import Box from '../models/box.model';
import config from '../../config/env';
import User from '../models/user.model';
import fs from 'fs';
import Socket from '../routes/socket';

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
  const emailConnector = user.createIMAPConnector();
  Box.findOne({_id: req.body.boxId}).populate('parent')
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
  const boxId = req.params.id;
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


export default {
  addBox,
  delBox,
  renameBox,  
  getBoxes
};
