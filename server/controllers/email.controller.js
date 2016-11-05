import Email from '../models/email.model';
import SimpleImap from '../helpers/SimpleImap';

const config = require('../../config/env');

function fetchMails(req, res) {
  Email.remove({}, () => {
    console.log('All Emails are removed')
  });

  const options = {
    user: config.email.user,
    password: config.email.pass,
    host: config.email.host,
    port: config.email.port,
    tls: true,
    mailbox: 'INBOX'
  };

  const simpleImap = new SimpleImap(options);

  simpleImap.on('error', (err) => {
    console.log(err);
  });

  simpleImap.on('mail', (mail) => {
    // console.log(mail);
    const e = {
      messageId: mail.messageId,
      from: mail.from,
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      date: mail.date
    };
    //console.log(JSON.stringify(mail));
    //mailconsole.log(JSON.stringify(e));
    Email.create(e, (err, email) => {
      if (err) {
        console.log(err);
      } else {
        console.log('created email');
      }
    });

  });

  simpleImap.start();

  //TODO: make this work with promises
  setTimeout(() => {
    Email.find({}).exec((err, emails) => {
      if (err) {
        res.send(err);
      } else {
        res.send(emails);
      }
    });
  }, 2000);
}

export default {
  fetchMails
};
