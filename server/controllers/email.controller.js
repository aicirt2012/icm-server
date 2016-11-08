import Email from '../models/email.model';
import ImapConnector from '../helpers/ImapConnector';
import config from '../../config/env';

function fetchMails(req, res) {
  const options = {
    user: config.email.user,
    password: config.email.pass,
    host: config.email.host,
    port: config.email.port,
    tls: true,
    mailbox: 'INBOX'
  };

  const imapConnector = new ImapConnector(options);
  imapConnector.fetchEmails(storeEmail).then((messages) => {
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
  fetchMails
};
