import Promise from 'bluebird';
import Email from '../models/email.model';
import Box from '../models/box.model';
import config from '../../config/env';
import User from '../models/user.model';
import Analyzer from '../core/engine/analyzer';
import fs from 'fs';
import Socket from '../routes/socket';

function sendEmail(req, res) {

  if (req.user.provider.name == 'Exchange') {

    const emailConnector = req.user.createIMAPConnector();
    emailConnector.sendMail(req.body)
      .then(result => {
        return Box.findOne({name: config.exchange.send, user: req.user});
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

  } else {

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
}

function append(req, res) {
  const user = req.user;
  const emailConnector = user.createIMAPConnector();

  if (req.user.provider.name == 'Exchange') {

    Box.findOne({name: config.exchange.draft, user: user})
      .then(boxDrafts => {
        return [boxDrafts, emailConnector.append(req.body)]
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

  } else {

    Box.findOne({name: config.gmail.draft, user: user})
      .then(boxDrafts => {
        return [boxDrafts, emailConnector.append(boxDrafts.name, user.email, req.body.to, req.body.subject, req.body.msgData)]
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
}

function move(req, res) {
  const emailId = req.params.emailId;
  const newBoxId = req.body.newBoxId;
  const user = req.user;

  const emailConnector = user.createIMAPConnector();

  if (req.user.provider.name == 'Exchange') {

    Email.findOne({_id: emailId}).populate('box')
      .then(email => {
        return [email, Box.findOne({_id: newBoxId, user: user})]
      })
      .spread((email, destBox) => {
        console.log(destBox);
        const srcBox = email.box;
        return [srcBox, destBox, emailConnector.move(email, destBox.ewsId)]
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

  } else {

    Email.findOne({_id: emailId}).populate('box')
      .then(email => {
        return [email, Box.findOne({_id: newBoxId, user: user})]
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
}

function addFlags(req, res) {
  const emailId = req.params.emailId;
  const flags = req.body.flags;
  const user = req.user;
  const emailConnector = req.user.createIMAPConnector();
  let email = null;

  if (req.user.provider.name == 'Exchange') {

    Email.findById(emailId).populate('box')
      .then(mail => {
        email = mail;
        return emailConnector.addFlags(mail, flags);
      })
      .then(() => {
        email.flags = email.flags.concat(flags);
        return email.save();
      })
      .then(() => {
        res.status(200).send({message: 'Successfully added Flags'});
      })
      .catch(err => {
        res.status(400).send(err);
      });

  } else {

    Email.findById(emailId).populate('box')
      .then(mail => {
        email = mail;
        return emailConnector.addFlags(mail.uid, flags, email.box.name);
      })
      .then(() => {
        email.flags = email.flags.concat(flags);
        return email.save();
      })
      .then(() => {
        res.status(200).send({message: 'Successfully added Flags'});
      })
      .catch(err => {
        res.status(400).send(err);
      });
  }
}

function delFlags(req, res) {
  const emailId = req.params.emailId;
  const flags = req.body.flags;
  const user = req.user;
  const emailConnector = req.user.createIMAPConnector();
  let email = null;

  if (req.user.provider.name == 'Exchange') {

    Email.findById(emailId).populate('box')
      .then(mail => {
        email = mail;
        return emailConnector.delFlags(mail, flags);
      })
      .then(() => {
        flags.forEach(f => {
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

  } else {

    Email.findById(emailId).populate('box')
      .then(mail => {
        email = mail;
        return emailConnector.delFlags(mail.uid, flags, mail.box.name);
      })
      .then(() => {
        flags.forEach(f => {
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
}

/** Returns one single mail with all details */
function getSingleMail(req, res) {
  const emailId = req.params.emailId;
  Email.findOne({_id: emailId}).lean()
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
  append,
  move,
  sendEmail,
  addFlags,
  delFlags,
  searchMails,
  getSingleMail,
  storeEmail
};
