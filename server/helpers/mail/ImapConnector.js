import IPromise from 'imap-promise';
import Promise from 'bluebird';

class ImapConnector {
  imap;

  constructor(options) {
    this.options = options;
    this.imap = new IPromise(options);
  }

  connect() {
    return this.imap.connectAsync();
  }

  openBoxAsync(box) {
    return this.connect().then(() => this.imap.openBoxAsync(box, false));
  }

  getBoxes() {
    return this.connect().then(() => new Promise((resolve, reject) => {
      this.imap.getBoxes((err, boxes) => {
        err ? reject() : resolve(boxes);
      });
    }));
  }

  addBox(boxName) {
    return this.connect().then(() => new Promise((resolve, reject) => {
      this.imap.addBox(boxName, (err) => {
        err ? reject() : resolve(boxName);
      })
    }))
  }

  append(box, msgData, args) {
    const options = {
      mailbox: box,
      ...args
    };

    return this.connect().then(() => new Promise((resolve, reject) => {
      this.imap.append(msgData, options, (err) => {
        err ? reject() : resolve(msgData);
      })
    }));
  }

  fetchAttachment(mail) {
    return this.imap.collectEmailAsync(mail)
      .then((msg) => {
        msg.attachments = this.imap.findAttachments(msg);
        msg.downloads = Promise.all(msg.attachments.map((attachment) => {
          const emailId = msg.attributes.uid;
          const saveAsFilename = attachment.params.name;
          return this.imap.downloadAttachmentAsync(emailId, attachment, saveAsFilename);
        }));
        return Promise.props(msg);
      });
  }

}

export default ImapConnector;
