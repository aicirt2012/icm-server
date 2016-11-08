import Imap from 'imap';
import mailParser from 'mailparser';
import moment from 'moment';
import util from 'util';
import events from 'events';

const MailParser = mailParser.MailParser;

const SimpleImap = function imapCall(options) {
  this.options = options;
  this.imap = null;

  this.start = () => {
    if (this.imap === null) {
      this.imap = new Imap(this.options);

      const selfImap = this.imap;
      const self = this;

      selfImap.on('ready', () => {
        self.emit('ready');

        selfImap.openBox(self.options.mailbox, false, () => {
          self.emit('open');
        });
      });

      selfImap.on('mail', (num) => {
        selfImap.search(['ALL'], (err, result) => {
          if (result.length) {
            const f = selfImap.fetch(result, {
              markSeen: false,
              struct: true,
              bodies: ''
            });

            f.on('message', (msg, seqNo) => {
              msg.on('body', (stream, info) => {
                let buffer = '';

                stream.on('data', (chunk) => {
                  buffer += chunk.toString('utf8');
                });

                stream.on('end', () => {
                  const mailParser = new MailParser();

                  mailParser.on('end', (mailObject) => {
                    console.log('Parsed mail obj', JSON.stringify(mailObject));
                    self.emit('mail', {
                      messageId: mailObject.messageId,
                      from: mailObject.from,
                      to: mailObject.to,
                      subject: mailObject.subject,
                      text: mailObject.text,
                      html: mailObject.html,
                      date: moment(mailObject.date).format('YYYY-MM-DD HH:mm:ss')
                    });
                  });

                  mailParser.write(buffer);
                  mailParser.end();
                });
              });
            });
          }
        });
      });

      selfImap.on('end', () => {
        self.emit('end');
      });

      selfImap.on('error', (err) => {
        self.emit('error', err);
      });

      selfImap.on('close', (hadError) => {
        self.emit('close', hadError);
      });
    }

    this.imap.connect();
  };

  this.stop = () => {
    this.imap.destroy();
  };

  this.restart = () => {
    this.stop();

    if (arguments.length >= 1) {
      this.options = arguments[0];
    }

    this.start();
  };

  this.getImap = () => {
    return this.imap;
  };
};

util.inherits(SimpleImap, events.EventEmitter);

export default SimpleImap;
