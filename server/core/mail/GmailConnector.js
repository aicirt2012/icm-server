import Promise from 'bluebird';
import moment from 'moment';
import {
  MailParser
} from 'mailparser';
import ImapConnector from './ImapConnector';
import User from '../../models/user.model';

class GmailConnector extends ImapConnector {

  constructor(options) {
    super(options);
  }

  fetchEmails(storeEmail, boxName) {
    return this.openBoxAsync(boxName).then((box) => {
        return this.imap.getMailAsync(this.imap.seq.fetch('1:*', {
          bodies: '',
          struct: true,
          markSeen: false,
          extensions: ['X-GM-LABELS'],
          modifiers: {
            changedsince: this.options.currentUser.highestmodseq || '0'
          },
        }), (mail) => {
          if (box && box.highestmodseq) {
            this.options.currentUser.highestmodseq = box.highestmodseq;
            User.findOneAndUpdate({
              _id: this.options.currentUser._id
            }, this.options.currentUser, {
              new: true
            }, (err, user) => {
            });
          }
          return this.parseDataFromEmail(mail, boxName, storeEmail);
        });
      })
      .then((messages) => {
        return messages;
      })
      .catch((error) => {
        console.error('Error: ', error.message);
      });
  }

  parseDataFromEmail(mail, box, storeEmail) {
    return new Promise((resolve, reject) => {
      const mailParser = new MailParser();
      let attributes;

      mailParser.on('end', (mailObject) => {
        mailObject.html = mailObject.html && mailObject.html.includes('<body') ? mailObject.html.substring(mailObject.html.indexOf('<body')) : mailObject.html;

        const email = {
          messageId: mailObject.messageId,
          from: mailObject.from,
          to: mailObject.to,
          subject: mailObject.subject,
          text: mailObject.text,
          html: mailObject.html,
          date: moment(mailObject.date).format('YYYY-MM-DD HH:mm:ss'),
          flags: attributes.flags,
          labels: attributes['x-gm-labels'],
          uid: attributes.uid,
          attrs: attributes,
          thrid: attributes['x-gm-thrid'],
          box: this.options.currentUser.boxList.find((b) => box === b.name),
          user: this.options.currentUser
        };
        storeEmail(email).then((msg) => {
          resolve(msg);
        }).catch((err) => {
          reject(err);
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
        attributes = attrs;
      }).once('end', () => {
        mailParser.end();
      }).on('error', (err) => reject(err));
    });
  }

}

export default GmailConnector;
