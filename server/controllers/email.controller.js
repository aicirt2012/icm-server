import Promise from 'bluebird';
import Email from '../models/email.model';
import Box from '../models/box.model';
import config from '../../config/env';
import User from '../models/user.model';
import Analyzer from '../core/engine/analyzer';
import fs from 'fs';
import Socket from '../routes/socket';
import authCtrl from './auth.controller';

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
  const boxId = req.body.boxId;
  const emailConnector = user.createIMAPConnector();

  if (req.user.provider.name == 'Exchange') {

    // Box.findOne({name: config.exchange.draft, user: user})
    Box.findOne({_id: boxId, user: user})
      .then(box => {
        return [box, emailConnector.append(req.body, box.ewsId)]
      })
      .spread((box, msgData) => {
        return [msgData, emailConnector.fetchBoxes(storeEmail, [box])]
      })
      .spread((msgData, result) => {
        res.status(200).send({msgData: 'ok'});
      })
      .catch((err) => {
        console.log(err);
        res.status(400).send(err);
      });

  } else {

    // Box.findOne({name: config.gmail.draft, user: user})
    Box.findOne({_id: boxId, user: user})
      .then(box => {
        return [box, emailConnector.append(box.name, user.email, req.body.to, req.body.subject, req.body.msgData)]
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

function trash(req, res) {
  const userProvider = req.user.provider.name;

  if (userProvider === 'Exchange') {
    Box.findOne({name: config.exchange.deleted, user: req.user})
      .then(box => {
        req.body.newBoxId = box._id;
        move(req, res);
      });
  } else if (userProvider === 'Gmail') {
    Box.findOne({name: config.gmail.deleted, user: req.user})
      .then(box => {
        req.body.newBoxId = box._id;
        move(req, res);
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
  Email.findOne({_id: emailId}).populate('attachments')
    .lean()
    .then((mail) => {
      console.log('retrieving email id...');
      console.log(mail);
      mail = replaceInlineAttachmentsSrc(mail, req.user);
      return (mail && (req.user.trello || req.user.sociocortex)) ? new Analyzer(mail, req.user).getEmailTasks() : mail;
    })
    .then(email => {
      res.status(200).send(email);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}

function replaceInlineAttachmentsSrc(email, user) {
  const URL = `${config.domain}:${config.port}/api/attachment/`
  const token = authCtrl.createToken(user);
  email.attachments.forEach((a) => {
    if (a.contentDispositionInline) {
      email.html = email.html.replace(`cid:${a.contentId}`, `${URL}${a._id}?token=${token}`);
    }
  })

  return email;
}


/** Stores an email in the database and
 *  pushs upates via socket to the client */
// TODO
function storeEmail(mail) {
  return new Promise((resolve, reject) => {
    Email.updateAndGetOldAndUpdated(mail)
      .spread((emailOld, boxOld, emailUpdated, boxUpdated) => {
        // TODO new box numbers do not work properly
        console.log('inside storeEmail...');
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

function appendEnron(req, res) {

  const emailConnector = req.user.createIMAPConnector();

  // find enron user e.g Allen
  User.findOne({username: 'allen-p'})
    .then((user) => {
      console.log('this is the user');
      console.log(user);

      // get all emails for this user;
      Email.find({user: user}).limit(3)
        .then((emails) => {

          // in which box to store these emails?
          Box.findOne({name: config.exchange.inbox, user: req.user})
            .then(box => {

              // filter emails without ewsItemId (exchange)
              const emailsToAppend = emails.filter(email => !email.ewsItemId);
              //console.log(emailsToAppend);

              Promise.each(emails, (email) => {

                req.body.boxId = box._id;
                req.body.subject = email.subject;
                req.body.msgData = email.text;
                req.body.to = email.to;

                return emailConnector.append(req.body, box.ewsId)
                  .then(result => {
                    // Pair ewsItemId to the Enron email, already in DB
                    console.log('resultado...');
                    console.log(JSON.stringify(result));

                    email.box = box._id;
                    email.ewsItemId = result.Id;
                    email.ewsChangeKey = result.ChangeKey;
                  })
                  .then(() => {
                    return storeEmail(email);
                  });
              })
                .then(() => {
                  res.status(200).send({msgData: 'ok'});
                })
                .catch((err) => {
                  console.log(err);
                  res.status(400).send(err);
                });

            });

        });

    });

}

export default {
  append,
  appendEnron,
  move,
  trash,
  sendEmail,
  addFlags,
  delFlags,
  searchMails,
  getSingleMail,
  storeEmail
};
