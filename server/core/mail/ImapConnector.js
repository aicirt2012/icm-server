import IPromise from 'imap-promise';
import Promise from 'bluebird';

class ImapConnector {

  constructor(options) {
    this.options = options;
    this.options['debug'] = function(err) {
      console.log(err)
    };
    this.options['authTimeout'] = 10000;
    this.imap = new IPromise(options);
    this.imap.on('error', (err) => {
        console.log(err);
    })
  }

  connect() {
    return this.imap.connectAsync();
  }

  openBoxAsync(box) {
    return this.connect().then(() => this.imap.openBoxAsync(box, false));
  }

  statusBoxAsync(box, readOnly = false) {
    return new Promise((resolve, reject) => {
      this.imap.status(box, (err, mailbox) => {
        if (err) {
          reject(err);
        } else {
          resolve(mailbox);
        }
      });
    });
  }

  getBoxes(details = false) {
    return this.connect().then(() => new Promise((resolve, reject) => {
      this.imap.getBoxes((err, boxes) => {
        if (err) {
          reject(err);
        } else {
          let boxList = [];
          this._generateBoxList(boxes, null, boxList, null);
          if (details) {
            let promises = [];
            let boxListDetails = [];
            boxList.forEach((box, index) => {
              promises.push(new Promise((resolve, reject) => {
                this.statusBoxAsync(box.name, false).then((res) => {
                  boxListDetails.push({
                    id: index,
                    name: res.name,
                    shortName: res.name.substr(res.name.lastIndexOf('/') + 1, res.name.length),
                    total: res.messages.total,
                    new: res.messages.new,
                    unseen: res.messages.unseen,
                    parent: box.parent
                  });
                  resolve(res);
                })
              }));
            });
            Promise.all(promises).then((results) => {
              this._populateFamilyTree(boxListDetails);
              resolve(boxListDetails);
            });
          } else {
            resolve(boxList);
          }
        }
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

  _generateBoxList(boxes, parentPath, arr, parent) {
    Object.keys(boxes).forEach((key, i) => {
      const path = parentPath ? `${parentPath}/${key}` : key;
      let box = null;
      if (key != '[Gmail]') {
        box = {
          name: path,
          shortName: path.substr(path.lastIndexOf('/') + 1, path.length),
          parent: parent
        };
        arr.push(box);
      }
      if (boxes[key].children) {
        this._generateBoxList(boxes[key].children, path, arr, box);
      }
    })
  }

  _populateFamilyTree(boxes) {
    boxes.forEach((box, index) => {
      if (box.parent != null) {
        let parent = boxes.filter((b) => b.name == box.parent.name)[0];
        box.parent = parent;
      }
    });
  }

}

export default ImapConnector;
