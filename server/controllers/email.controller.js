import Email from '../models/email.model';
import GmailConnector from '../helpers/mail/GmailConnector';
import SMTPConnector from '../helpers/mail/SMTPConnector';
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

const smtpConfig = {
  host: config.smtp.host,
  port: config.smtp.port,
  secure: true,
  auth: {
    user: config.smtp.auth.user,
    pass: config.smtp.auth.pass
  }
};

// mail data from frontend
const sendMailOptions = {
  from: 'sebisng2@gmail.com',
  to: 'sebisng2@gmail.com', // list of receivers
  subject: 'Subject',
  text: 'some random text',
  html: '<b>some random text</b>'
};

function sendEmail(req, res) {
  const smtpConnector = new SMTPConnector(smtpConfig, sendMailOptions);
  smtpConnector.sendMail().then((result) => {
    /*  At the moment all mails are fetched when we start the synch process
    TO DO: write new function/endpoint to just fetch last couple of mails from sendBox  */
    const imapConnectorAllMessages = new GmailConnector(options);
    imapConnectorAllMessages.fetchEmails(storeEmail, config.gmail.allMessages).then((messages) => {
      res.status(200).send(messages);
    }).catch((err) => {
      res.status(400).send(err);
    });
  });
}

function fetchMails(req, res) {
  const imapConnector = new GmailConnector(options);
  imapConnector.fetchEmails(storeEmail, req.body.box).then((messages) => {
    res.status(200).send(messages);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function fetchAllMails(req, res) {
  const imapConnectorAllMessages = new GmailConnector(options);
  imapConnectorAllMessages.fetchEmails(storeEmail, config.gmail.allMessages).then((messages) => {
    res.status(200).send(messages);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function fetchInboxMails(req, res) {
  const imapConnectorInbox = new GmailConnector(options);
  imapConnectorInbox.fetchEmails(storeEmail, config.gmail.inbox).then((messages) => {
    res.status(200).send(messages);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function fetchSendMails(req, res) {
  const imapConnectorSend = new GmailConnector(options);
  imapConnectorSend.fetchEmails(storeEmail, config.gmail.send).then((messages) => {
    res.status(200).send(messages);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function fetchDraftMails(req, res) {
  const imapConnectorDraft = new GmailConnector(options);
  imapConnectorDraft.fetchEmails(storeEmail, config.gmail.draft).then((messages) => {
    res.status(200).send(messages);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function fetchDeletedMails(req, res) {
  const imapConnectorDeleted = new GmailConnector(options);
  imapConnectorDeleted.fetchEmails(storeEmail, config.gmail.deleted).then((messages) => {
    res.status(200).send(messages);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function getBoxes(req, res) {
  const imapConnector = new GmailConnector(options);
  imapConnector.getBoxes().then((boxes) => {
    console.log(boxes);
    res.status(200).send(boxes);
  }).catch((err) => {
    res.status(400).send(err);
  });
}
// ToDo: Add Path/Prefix to Boxname automatically
function addBox(req, res) {
  const imapConnector = new GmailConnector(options);
  imapConnector.addBox(req.body.boxName).then((boxName) => {
    res.status(200).send(`Created new box: ${boxName}`);
  }).catch((err) => {
    res.status(400).send(err);
  });
}
// ToDo: Add Path/Prefix to Boxname automatically
function delBox(req, res) {
  const imapConnector = new GmailConnector(options);
  imapConnector.delBox(req.body.boxName).then((boxName) => {
    res.status(200).send(`Deleted box: ${boxName}`);
  }).catch((err) => {
    res.status(400).send(err);
  });
}
// ToDo: Add Path/Prefix to Boxname automatically
function renameBox(req, res) {
  const imapConnector = new GmailConnector(options);
  imapConnector.renameBox(req.body.oldBoxName, req.body.newBoxName).then((boxName) => {
    res.status(200).send(`Renamed box to: ${boxName}`);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function append(req, res) {
  const imapConnector = new GmailConnector(options);
  imapConnector.append(req.body.box, req.body.args, req.body.to, req.body.from, req.body.subject, req.body.msgData).then((msgData) => {
    res.status(200).send(msgData);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function move(req, res) {
  const imapConnector = new GmailConnector(options);
  imapConnector.move(req.body.msgId, req.body.srcBox, req.body.box).then((messages) => {
    imapConnector.fetchEmails(storeEmail, req.body.box).then(() => {
      res.status(200).send(messages);
    })
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function copy(req, res) {
  const imapConnector = new GmailConnector(options);
  imapConnector.copy(req.body.msgId, req.body.srcBox, req.body.box).then((messages) => {
    res.status(200).send(messages);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function addFlags(req, res) {
  const imapConnector = new GmailConnector(options);
  imapConnector.addFlags(req.body.msgId, req.body.flags, req.body.box).then((messages) => {
    res.status(200).send(messages);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function delFlags(req, res) {
  const imapConnector = new GmailConnector(options);
  imapConnector.delFlags(req.body.msgId, req.body.flags, req.body.box).then((messages) => {
    res.status(200).send(messages);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function setFlags(req, res) {
  const imapConnector = new GmailConnector(options);
  imapConnector.setFlags(req.body.msgId, req.body.flags, req.body.box).then((messages) => {
    res.status(200).send(messages);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function storeEmail(mail) {
  return new Promise((resolve, reject) => {
    Email.find({
      messageId: mail.messageId
    }, (err, mails) => {
      if (err) {
        reject(err);
      }
      if (mails.length && mails[0].flags.length === mail.flags.length &&
        mails[0].flags.reduce((a, b) => a && mail.flags.includes(b), true) &&
        mails[0].labels.length === mail.labels.length &&
        mails[0].labels.reduce((a, b) => a && mail.labels.includes(b), true) &&
        mails[0].uid === mail.uid && mails[0].box === mail.box) {
        resolve(mails[0]);
      } else if (mails.length) {
        Email.findByIdAndUpdate(mails[0]._id, mail, {
          new: true,
          runValidators: true
        }, (error, msg) => {
          error ? reject(error) : resolve(msg);
        });
      } else {
        Email.create(mail, (error, msg) => {
          error ? reject(error) : resolve(msg);
        });
      }
    });
  });
}

export default {
  fetchAllMails,
  fetchMails,
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
  copy,
  sendEmail,
  addFlags,
  delFlags,
  setFlags
};
