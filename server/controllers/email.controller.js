import Email from '../models/email.model';
import GmailConnector from '../helpers/mail/GmailConnector';
import config from '../../config/env';
import Promise from 'bluebird';

/* This is just for developing, will be retrieved from user later */
const options = {
  user: config.email.user,
  password: config.email.pass,
  host: config.email.host,
  port: config.email.port,
  tls: true,
  mailbox: 'INBOX'
};

function fetchAllMails(req, res) {
  const imapConnectorAllMessages = new GmailConnector(options);
  imapConnectorAllMessages.fetchEmails(storeEmail, config.gmail.allMessages).then((messages) => {
    res.status(200).send(messages);
  });
}

function fetchInboxMails(req, res) {
  const imapConnectorInbox = new GmailConnector(options);
  imapConnectorInbox.fetchEmails(storeEmail, config.gmail.inbox).then((messages) => {
    res.status(200).send(messages);
  });
}

function fetchSendMails(req, res) {
  const imapConnectorSend = new GmailConnector(options);
  imapConnectorSend.fetchEmails(storeEmail, config.gmail.send).then((messages) => {
    res.status(200).send(messages);
  });
}

function fetchDraftMails(req, res) {
  const imapConnectorDraft = new GmailConnector(options);
  imapConnectorDraft.fetchEmails(storeEmail, config.gmail.draft).then((messages) => {
    res.status(200).send(messages);
  });
}

function fetchDeletedMails(req, res) {
  const imapConnectorDeleted = new GmailConnector(options);
  imapConnectorDeleted.fetchEmails(storeEmail, config.gmail.deleted).then((messages) => {
    res.status(200).send(messages);
  });
}

function getBoxes(req, res) {
  const options = {
    user: config.email.user,
    password: config.email.pass,
    host: config.email.host,
    port: config.email.port,
    tls: true,
    mailbox: 'INBOX'
  };

  const imapConnector = new GmailConnector(options);
  imapConnector.getBoxes().then((boxes) => {
    console.log(boxes);
  });
}
// ToDo: Add Path/Prefix to Boxname automatically
function addBox(req, res) {
  const imapConnector = new GmailConnector(options);
  imapConnector.addBox(req.body.boxName).then((boxName) => {
    res.status(200).send(`Created new box: ${boxName}`);
  });
}
// ToDo: Add Path/Prefix to Boxname automatically
function delBox(req, res) {
  const imapConnector = new GmailConnector(options);
  imapConnector.delBox(req.body.boxName).then((boxName) => {
    res.status(200).send(`Deleted box: ${boxName}`);
  });
}
// ToDo: Add Path/Prefix to Boxname automatically
function renameBox(req, res) {
  const imapConnector = new GmailConnector(options);
  imapConnector.renameBox(req.body.oldBoxName, req.body.newBoxName).then((boxName) => {
    res.status(200).send(`Renamed box to: ${boxName}`);
  });
}

function append(req, res) {
  const imapConnector = new GmailConnector(options);
  imapConnector.append(req.body.box, req.body.args, req.body.to, req.body.from, req.body.subject, req.body.msgData).then((msgData) => {
    res.status(200).send(msgData);
  });
}

function move(req, res) {
  const imapConnector = new GmailConnector(options);
  imapConnector.move(req.body.msgId, req.body.srcBox, req.body.box).then((messages) => {
    res.status(200).send(messages);
  });
}

function copy(req, res) {
  const imapConnector = new GmailConnector(options);
  imapConnector.copy(req.body.msgId, req.body.srcBox, req.body.box).then((messages) => {
    res.status(200).send(messages);
  });
}

function storeEmail(mail) {
  return new Promise((resolve, reject) => {
    Email.find({
      messageId: mail.messageId
    }, (err, mails) => {
      if (err) {
        reject();
      }
      if (mails.length && mails[0].flags.length === mail.flags.length &&
        mails[0].flags.reduce((a, b) => a && mail.flags.includes(b), true) &&
        mails[0].labels.length === mail.labels.length &&
        mails[0].labels.reduce((a, b) => a && mail.labels.includes(b), true)) {
        resolve(mails[0]);
      } else if (mails.length) {
        Email.findByIdAndUpdate(mails[0]._id, mail, {
          new: true,
          runValidators: true
        }, (error, msg) => {
          error ? reject() : resolve(msg);
        });
      } else {
        Email.create(mail, (error, msg) => {
          error ? reject() : resolve(msg);
        });
      }
    });
  });
}

export default {
  fetchAllMails,
  fetchInboxMails,
  fetchSendMails,
  fetchDraftMails,
  fetchDeletedMails,
  getBoxes,
  addBox,
  delBox,
  renameBox,
  append,
  move,
  copy
};
