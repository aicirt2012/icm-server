import Promise from 'bluebird';
import moment from 'moment';
import {
  MailParser
} from 'mailparser';
import ImapConnector from './ImapConnector';

class ExchangeConnector extends ImapConnector {

  constructor(options, user) {
    super(options, user);
  }

  fetchBoxes(storeEmail, boxes = []) {
    console.log('inside fetchBoxes Exchange...');
    return this.connect().then(() => new Promise((resolve, reject) => {
      let highestmodseq = [];
      Promise.each(boxes, (box) => {
        console.log('inside the promise');
        console.log(box);
        return this.fetchEmails(storeEmail, box).then((hms) => {
          highestmodseq.push(hms);
        });
      }).then(() => {
        this.user.highestmodseq = this.user.highestmodseq && parseInt(this.user.highestmodseq) > parseInt(highestmodseq[0]) ? this.user.highestmodseq : highestmodseq[0];
        this.user.lastSync = new Date();
        this.user.save().then(() => {
          this.end().then(() => {
            resolve();
          });
        });
      }).catch(reject)
    })) 
  }

  fetchEmails(storeEmail, newBox) {
    console.log('inside fetchEmails');
    console.log
    return this.openBox(newBox.name).then((box) => {
        return new Promise((resolve, reject) => {
          let options = {
            bodies: '',
            struct: true,
            markSeen: false
          };

          if (this.user.highestmodseq) {
            options.modifiers = {
              changedsince: this.user.highestmodseq
            };
          }

          const f = this.imap.seq.fetch('1:*', options);

          let promises = [];

          f.on('message', (mail, seqno) => {
            promises.push(this.parseDataFromEmail(mail, newBox, storeEmail));
          });

          f.once('error', (err) => {
            console.log('Fetch error: ', err);
            this.end().then(reject);
          });

          f.once('end', () => {
            console.log('Done fetching all messages!');
            Promise.all(promises).then(() => {
              resolve(box.highestmodseq);
            });
          });
        });
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
        console.log('inside parseDataFromEmail');
        console.log(mailObject);
        mailObject.html = mailObject.html && mailObject.html.includes('<body') ? mailObject.html.substring(mailObject.html.indexOf('<body')) : mailObject.html;

        const email = {
          messageId: mailObject.messageId,
          //attrs: mailObject,
          thrid: mailObject.headers['thread-index'],
          from: mailObject.from,
          to: mailObject.to,
          subject: mailObject.headers.subject,
          html: mailObject.html,
          text: mailObject.text,
          date: mailObject.headers.date,
          user: this.user
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

export default ExchangeConnector;
