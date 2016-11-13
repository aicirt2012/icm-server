import Email from '../models/email.model';
import GmailConnector from '../helpers/mail/GmailConnector';
import SMTPConnector from '../helpers/mail/SMTPConnector';
import config from '../../config/env';
import Promise from 'bluebird';
import nodemailer from 'nodemailer';

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
  const smtpConnector = new SMTPConnector(smtpConfig,sendMailOptions);
  let result = smtpConnector.sendMail();
  console.log("email send");
  if(result) {
    res.status(200).send("Email was sent");
  }
  /*need to trigger mailsync process here
*/
}

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
  sendEmail
};
