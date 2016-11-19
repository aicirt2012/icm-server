import IPromise from 'imap-promise';
import Promise from 'bluebird';

class ImapConnector {

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
        err ? reject(err) : resolve(boxes);
      });
    }));
  }

  addBox(boxName) {
    return this.connect().then(() => new Promise((resolve, reject) => {
      this.imap.addBox(boxName, (err) => {
        err ? reject(err) : resolve(boxName);
      })
    }))
  }

  delBox(boxName) {
    return this.connect().then(() => new Promise((resolve, reject) => {
      this.imap.delBox(boxName, (err) => {
        err ? reject(err) : resolve(boxName);
      })
    }))
  }

  renameBox(oldBoxName, newBoxName) {
    return this.connect().then(() => new Promise((resolve, reject) => {
      this.imap.renameBox(oldBoxName, newBoxName, (err) => {
        err ? reject(err) : resolve(newBoxName);
      })
    }))
  }

  append(box, args, to, from, subject, msgData) {
    const options = {
      mailbox: box,
      ...args
    };

    const msg = this.createRfcMessage(from, to, subject, msgData);

    return this.connect().then(() => new Promise((resolve, reject) => {
      this.imap.append(msg, options, (err) => {
        err ? reject(err) : resolve(msgData);
      })
    }));
  }

  move(msgId, srcBox, box) {
    return this.openBoxAsync(srcBox).then((srcBox) => new Promise((resolve, reject) => {
      this.imap.move(msgId, box, (err) => {
        err ? reject(err) : resolve(msgId);
      })
    }));
  }

  copy(msgId, srcBox, box) {
    return this.openBoxAsync(srcBox).then((srcBox) => new Promise((resolve, reject) => {
      this.imap.copy(msgId, box, (err) => {
        err ? reject(err) : resolve(msgId);
      })
    }));
  }

  addFlags(msgId, flags, box) {
    return this.openBoxAsync(box).then((box) => new Promise((resolve, reject) => {
      this.imap.addFlags(msgId, flags, (err) => {
        err ? reject(err) : resolve(msgId);
      })
    }));
  }

  delFlags(msgId, flags, box) {
    return this.openBoxAsync(box).then((box) => new Promise((resolve, reject) => {
      this.imap.delFlags(msgId, flags, (err) => {
        err ? reject(err) : resolve(msgId);
      })
    }));
  }

  setFlags(msgId, flags, box) {
    return this.openBoxAsync(box).then((box) => new Promise((resolve, reject) => {
      this.imap.setFlags(msgId, flags, (err) => {
        err ? reject(err) : resolve(msgId);
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

  createRfcMessage(from, to, subject, msgData) {
    return `From: ${from}
To: ${to}
Subject: ${subject}
${msgData}`;
  }

}

export default ImapConnector;
