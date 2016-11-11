import Email from '../models/email.model';
import GmailConnector from '../helpers/mail/GmailConnector';
import config from '../../config/env';
import Promise from 'bluebird';
import nodemailer from 'nodemailer';
import xoauth2 from 'xoauth2';

/* This is just for developing, will be retrieved from user later */
const options = {
    user: config.email.user,
    password: config.email.pass,
    host: config.email.host,
    port: config.email.port,
    tls: true,
    mailbox: 'INBOX'
  };

/* This has to be replaced with OAuth later on
Just fix values*/
const smtpConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'sebisng2@gmail.com',
      pass: 's3b1sng2'
    }
  };

  // setup e-mail data with unicode symbols
const sendMailOptions = {
      from: '<foo@blurdybloop.com>', // sender address
      to: 'sebisng2@gmail.com', // list of receivers
      subject: 'Hello', // Subject line
      text: '<3 ', // plaintext body
      html: '<b>Hello world </b>' // html body
  };

var sendEmail = function(smtpConfig){

var transporter = nodemailer.createTransport(smtpConfig);
// replace hardcoded options with data passed (somedata)

transporter.sendMail(sendMailOptions, function(error, info){
  if(error){
    console.log("error occured");
    console.log(error);
    return false;
  }else{
    console.log('Message sent: ' + info.response);
    return true;
  };
});
}
//just added this for testing
//sendEmail();

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
  getBoxes
};
