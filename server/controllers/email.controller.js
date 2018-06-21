import Promise from 'bluebird';
import Email from '../models/email.model';
import Box from '../models/box.model';
import User from '../models/user.model';
import Task from '../models/task.model'
import Socket from '../routes/socket';
import NERService from "../core/analysis/ner.service";
import GmailConnector from '../core/mail/GmailConnector';
import EWSConnector from '../core/mail/EWSConnector';
import Constants from '../../config/constants';
import TaskService from "../core/task/task.service";
import TrelloService from "../core/task/trello.service";
import SociocortexService from "../core/task/sociocortex.service";


exports.sendEmail = (req, res) => {

  if (req.user.isExchangeProvider()) {

    const emailConnector = req.user.createIMAPConnector();
    emailConnector.sendMail(req.body)
      .then(() => {
        return Box.findOne({name: EWSConnector.staticBoxNames.send, user: req.user});
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
      .then(() => {
        return Box.findOne({name: GmailConnector.staticBoxNames.send, user: req.user});
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
};

exports.append = (req, res) => {
  const user = req.user;
  const boxId = req.body.boxId;
  const emailConnector = user.createIMAPConnector();

  if (req.user.isExchangeProvider()) {

    // Box.findOne({name: EWSConnector.staticBoxNames.draft, user: user})
    Box.findOne({_id: boxId, user: user})
      .then(box => {
        return [box, emailConnector.append(req.body, box.ewsId)]
      })
      .spread((box, msgData) => {
        return [msgData, emailConnector.fetchBoxes(storeEmail, [box])]
      })
      .spread(() => {
        res.status(200).send({msgData: 'ok'});
      })
      .catch((err) => {
        console.log(err);
        res.status(400).send(err);
      });

  } else {

    // Box.findOne({name: GmailConnector.staticBoxNames.draft, user: user})
    Box.findOne({_id: boxId, user: user})
      .then(box => {
        return [box, emailConnector.append(box.name, user.email, req.body.to, req.body.subject, req.body.msgData)]
      })
      .spread((box, msgData) => {
        return [msgData, emailConnector.fetchBoxes(storeEmail, [box])]
      })
      .spread((msgData) => {
        res.status(200).send({msgData: msgData});
      })
      .catch((err) => {
        console.log(err);
        res.status(400).send(err);
      });

  }
};

exports.move = (req, res) => {
  const emailId = req.params.id;
  const newBoxId = req.body.newBoxId;
  const user = req.user;

  const emailConnector = user.createIMAPConnector();

  if (req.user.isExchangeProvider()) {

    Email.findOne({_id: emailId}).populate('boxes')
      .then(email => {
        return [email, Box.findOne({_id: newBoxId, user: user})]
      })
      .spread((email, destBox) => {
        const srcBox = email.boxes[0];
        return [srcBox, destBox, emailConnector.move(email, destBox.ewsId)]
      })
      .spread((srcBox, destBox) => {
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

    Email.findOne({_id: emailId}).populate('boxes')
      .then(email => {
        return [email, Box.findOne({_id: newBoxId, user: user})]
      })
      // TODO boxId from parameter
      .spread((email, destBox) => {
        const srcBox = email.boxes[0];
        return [srcBox, destBox, emailConnector.move(email.uid, srcBox.name, destBox.name)]
      })
      .spread((srcBox, destBox) => {
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
};

exports.moveToTrash = (req, res) => {
  if (req.user.isExchangeProvider()) {
    Box.findOne({name: EWSConnector.staticBoxNames.deleted, user: req.user})
      .then(box => {
        req.body.newBoxId = box._id;
        exports.move(req, res);
      });
  } else if (req.user.isGMailProvider()) {
    Box.findOne({name: GmailConnector.staticBoxNames.deleted, user: req.user})
      .then(box => {
        req.body.newBoxId = box._id;
        exports.move(req, res);
      });
  }
};

/**
 * @api {post} /email/:id/flags Add Email Flags
 * @apiDescription Add the specified flags to this email.
 * @apiName AddEmailFlags
 * @apiGroup Email
 * @apiParam {String} id Email unique ID.
 * @apiParam {String[]} flags Email flags.
 * @apiSuccessExample Success-Response:
 * //TODO
 *     {
 *       "firstname": "John",
 *       "lastname": "Doe"
 *     }
 */
exports.addFlags = (req, res) => {
  const emailId = req.params.id;
  const flags = req.body.flags;
  const emailConnector = req.user.createIMAPConnector();
  let email = null;

  if (req.user.isExchangeProvider()) {

    Email.findById(emailId)//.populate('box')
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

    Email.findById(emailId).populate('boxes')
      .then(mail => {
        email = mail;
        return emailConnector.addFlags(mail.uid, flags, email.boxes[0].name);
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
};

/**
 * @api {delete} /email/:id/flags Remove Email Flags
 * @apiDescription Removes the specified flags from this email.
 * @apiName RemoveEmailFlags
 * @apiGroup Email
 * @apiParam {String} id Email unique ID.
 * @apiParam {String[]} flags Email flags.
 * @apiSuccessExample Success-Response:
 * //TODO
 *     {
 *       "firstname": "John",
 *       "lastname": "Doe"
 *     }
 */
exports.delFlags = (req, res) => {
  const emailId = req.params.id;
  const flags = req.body.flags;
  const emailConnector = req.user.createIMAPConnector();
  let email = null;

  if (req.user.isExchangeProvider()) {

    Email.findById(emailId)//.populate('box')
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

    Email.findById(emailId).populate('boxes')
      .then(mail => {
        email = mail;
        return emailConnector.delFlags(mail.uid, flags, mail.boxes[0].name);
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
};


/**
 * @api {get} /email/:id Get Email
 * @apiDescription Returns one single mail with all details
 * @apiName GetEmail
 * @apiGroup Email
 * @apiParam {String} id Email unique ID.
 * @apiSuccessExample Success-Response:
 * //TODO
 *     {
 *       "firstname": "John",
 *       "lastname": "Doe"
 *     }
 */
exports.getSingleMail = (req, res) => {
  const emailId = req.params.id;
  let email;

  Email.findOne({_id: emailId}).populate('attachments')
    .lean()
    .then((mail) => {
      // replace attachments
      mail = replaceInlineAttachmentsSrc(mail);
      // inject linked tasks
      mail = loadAndAppendLinkedTasks(mail, req.user);
      return mail;
    })
    .then(mail => {
      // run ner on current mail
      email = mail;
      return new NERService().extractNamedEntities(mail);
    })
    .then(namedEntities => {
      email['annotations'] = namedEntities;
      let mentionedPersons = [];
      namedEntities.filter(annotation => annotation.nerType === Constants.nerTypes.person)
        .forEach(personAnnotation =>
          mentionedPersons.push({
            fullName: personAnnotation.formattedValue,
          })
        );
      email['suggestedData'] = {
        titles: resultDTO.annotations
          .filter(x => x.nerType === Constants.nerTypes.taskTitle)
          .map(x => x.formattedValue),
        dates: resultDTO.annotations
          .filter(x => x.nerType === Constants.nerTypes.date)
          .map(x => x.formattedValue)
          .sort((a, b) => new Date(b) - new Date(a)),
        mentionedPersons: mentionedPersons
      };
      email['suggestedData']['titles'].push(email.subject);
      return email;
    })
    .then(email => {
      res.status(200).send(email);
    })
    .catch((err) => {
      if (email) {
        // if at least loading of mail worked, reply with what we got
        res.status(200).send(email);
        return;
      }
      res.status(400).send(err);
    });
};


// Inline attachments URL and tokens are changed in the front-end
// they have the form AttachmentURL/attachmentId?token=JWTToken
function replaceInlineAttachmentsSrc(email) {
  email.attachments.forEach((a) => {
    if (a.contentDispositionInline) {
      email.html = email.html.replace(`cid:${a.contentId}`, `ATTACHMENT_POINT/${a._id}?token=TOKEN_POINT`);
    }
  });
  return email;
}


async function loadAndAppendLinkedTasks(email, user) {
  email.linkedTasks = [];
  const tasks = await Task.find({
    $or: [{
      email: email._id
    }, {
      thrid: email.thrid
    }],
    user: user._id
  });
  const promises = [];
  if (user.taskProviders.trello.isEnabled) {
    const trelloService = new TrelloService(user);
    tasks.filter(task => task.provider === Constants.taskProviders.trello)
      .forEach(task => {
        promises.push(
          trelloService.get(task.providerId)
            .then(trelloTask => {
              return TaskService.mergeTaskObjects(task, trelloTask)
            }));
      })
  }
  if (user.taskProviders.sociocortex.isEnabled) {
    const sociocortexService = new SociocortexService(user);
    tasks.filter(task => task.provider === Constants.taskProviders.sociocortex)
      .forEach(task => {
        promises.push(
          sociocortexService.get(task.providerId)
            .then(sociocortexTask => {
              return TaskService.mergeTaskObjects(task, sociocortexTask)
            }));
      })
  }
  Promise.all(promises).then(updatedTasks => email.linkedTasks = updatedTasks);
  return email;
}


/** Stores an email in the database and
 *  pushs upates via socket to the client */
// TODO
function storeEmail(mail) {
  return new Promise((resolve, reject) => {
    new NERService().extractNamedEntities(mail)
      .then(namedEntities => {
        mail.namedEntities = namedEntities;
        Email.updateAndGetOldAndUpdated(mail)
          .spread((emailOld, boxOld, emailUpdated, boxUpdated) => {
            // TODO new box numbers do not work properly
            console.log('inside storeEmail...');
            Socket.pushEmailUpdateToClient(emailOld, boxOld, emailUpdated, boxUpdated);
            resolve(emailUpdated);
          })
      }).catch(err => {
      reject(err);
    });
  });
}

exports.storeEmail = storeEmail;


/**
 * @api {get} /email/search Search Emails
 * @apiDescription Search emails either for box or custom search
 * @apiName SearchEmail
 * @apiGroup Email
 * @apiParam {String} [boxId] Box unique ID.
 * @apiParam {String{'ASC','DESC'}} [sort='ASC'] Result sort order.
 * @apiParam {String} [search] Search string.
 * @apiParam {String} [lastEmailDate] Date of last email loaded.
 * @apiSuccessExample Success-Response:
 * //TODO
 *     {
 *       "firstname": "John",
 *       "lastname": "Doe"
 *     }
 */
exports.searchEmails = (req, res) => {

  const options = {
    boxId: req.query.boxId,
    sort: req.query.sort, // ASC or DESC
    search: req.query.search,
    lastEmailDate: new Date(req.query.lastEmailDate)
  };

  Email.search(req.user._id, options)
    .then(emails => {
      return Email.filterNonTrash(req.user, req.query.boxId, emails);
    })
    .then(emails => {
      res.status(200).send(emails);
    })
    .catch(err => {
      res.status(400).send(err);
    });
};

/** Creates autocomplete suggestions for email addresses */
exports.autocomplete = (req, res) => {
  Email.autocomplete(req.user._id)
    .then(suggestions => {
      res.status(200).send(suggestions);
    })
    .catch(err => {
      res.status(500).send(err);
    });
};

exports.appendEnron = (req, res) => {
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
          // agregate boxes according to the folder names

          Box.findOne({name: EWSConnector.staticBoxNames.inbox, user: req.user})
            .then(box => {
              // filter emails without ewsItemId (exchange)
              emails.filter(email => !email.ewsItemId);

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
                    email.boxes = [box._id];
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
};
