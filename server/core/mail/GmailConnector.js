import Promise from 'bluebird';
import moment from 'moment';
import {
  MailParser
} from 'mailparser';
import ImapConnector from './ImapConnector';
import User from '../../models/user.model';
import Box from '../../models/box.model';

class GmailConnector extends ImapConnector {

  constructor(options, user) {
    super(options, user);
  }

  static staticBoxNames = {
      allMessages: '[Gmail]/All Mail',
      inbox: 'INBOX',
      send: '[Gmail]/Sent Mail',
      draft: '[Gmail]/Drafts',
      deleted: '[Gmail]/Trash'
  }

  fetchBoxes(storeEmail, boxes = []) {
    return this.connect().then(() => new Promise((resolve, reject) => {
      let highestmodseq = [];
      Promise.each(boxes, (box) => {
        return this.fetchEmails(storeEmail, box).then((hms) => {
          highestmodseq.push(hms);
        });
      }).then(() => {
        this.user.highestmodseq = this.user.highestmodseq && parseInt(this.user.highestmodseq) > parseInt(highestmodseq[0]) ? this.user.highestmodseq : highestmodseq[0];
        //this.user.lastSync = new Date();
        this.user.save().then(() => {
          this.end().then(() => {
            resolve();
          });
        });
      }).catch(reject)
    }))
  }

  fetchEmails(storeEmail, newBox) {
    return this.openBox(newBox.name).then((box) => {
      return new Promise((resolve, reject) => {
        let options = {
          bodies: '',
          struct: true,
          markSeen: false,
          extensions: ['X-GM-LABELS']
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

  // TODO multiple boxes
  //
  parseDataFromEmail(mail, box, storeEmail) {
    return new Promise((resolve, reject) => {
      const mailParser = new MailParser();
      let attributes;

      mailParser.on('end', (mailObject) => {

        console.log('Gmail mailObject');
        console.log(mailObject);

        mailObject.html = mailObject.html && mailObject.html.includes('<body') ? mailObject.html.substring(mailObject.html.indexOf('<body')) : mailObject.html;

        Box.findByNames(attributes['x-gm-labels'])
          .then(moreBoxes => {

            let boxesId = [box._id]; // current original box

            moreBoxes.forEach(box => { // more boxes
              boxesId.push(box._id);
            })

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
              // TODO Delete box, we are using boxes
              box: box._id,
              boxes: boxesId,
              user: this.user._id
            };
            storeEmail(email).then((msg) => {
              resolve(msg);
            }).catch((err) => {
              reject(err);
            });

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
