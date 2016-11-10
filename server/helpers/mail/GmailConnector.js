import Promise from 'bluebird';
import moment from 'moment';
import {
  MailParser
} from 'mailparser';
import ImapConnector from './ImapConnector';

class GmailConnector extends ImapConnector {

  constructor(options) {
    super(options);
  }

  fetchEmails(storeEmail, boxType) {
    return this.openBoxAsync(boxType).then((box) => {
        return this.imap.getMailAsync(this.imap.seq.fetch([1, box.messages.total].map(String).join(':'), {
          bodies: '',
          struct: true,
          markSeen: false,
          extensions: ['X-GM-LABELS']
        }), (mail) => {
          return this.parseDataFromEmail(mail, storeEmail);
        });
      })
      .then((messages) => {
        return messages;
      })
      .catch((error) => {
        console.error('Error: ', error.message);
      });
  }

  parseDataFromEmail(mail, storeEmail) {
    return new Promise((resolve, reject) => {
      const mailParser = new MailParser();
      let labels = {
        'x-gm-labels': [],
        flags: []
      };
      mailParser.on('end', (mailObject) => {
        const email = {
          messageId: mailObject.messageId,
          from: mailObject.from,
          to: mailObject.to,
          subject: mailObject.subject,
          text: mailObject.text,
          html: mailObject.html,
          date: moment(mailObject.date).format('YYYY-MM-DD HH:mm:ss'),
          flags: labels.flags,
          labels: labels['x-gm-labels']
        };
        storeEmail(email).then((msg) => {
          resolve(msg);
        });
      });
      mail.on('body', (stream, info) => {
        let buffer = '';
        stream.on('data', (chunk) => {
          buffer += chunk.toString('utf8');
        });
        stream.on('end', () => {
          mailParser.write(buffer);
        });
      }).once('attributes', (attrs) => {
        labels = attrs;
      }).once('end', () => {
        mailParser.end();
      }).on('error', () => reject());
    });
  }

}

export default GmailConnector;
