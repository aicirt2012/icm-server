import Imap from 'imap';
import Promise from 'bluebird';
import config from '../../../config/env'

/**
 * Usefull documentation sources:
 * https://github.com/mscdex/node-imap
 * https://tools.ietf.org/html/rfc4549
 * https://tools.ietf.org/html/rfc4551#page-6
 * https://www.skytale.net/blog/archives/23-Manual-IMAP.html
 * http://stackoverflow.com/questions/9956324/imap-synchronization
 * http://www.imapwiki.org/ClientImplementation/Synchronization
 * http://stackoverflow.com/questions/10076690/ruby-imap-changes-since-last-check
 */

class ImapConnector {

  excludedBoxes = ['[Gmail]', '[Google Mail]', 'Important', 'All Mail', 'Alle Nachrichten', 'Wichtig'];
  // staticBoxes = [GmailConnector.staticBoxNames.allMessages, GmailConnector.staticBoxNames.inbox, GmailConnector.staticBoxNames.send, GmailConnector.staticBoxNames.draft, GmailConnector.staticBoxNames.deleted];
  // TODO: Multilanguage
  staticBoxes = ['INBOX', 'Sent Mail', 'Drafts', 'Sent Mail', 'Starred', 'Trash', 'Spam'];

  constructor(options, user) {
    this.user = user;
    this.options = options;
    this.options.debug = (err) => {
      console.log(err)
    };
    this.options.connTimeout = 30000;
    this.options.authTimeout = 30000;
    this.options.keepAlive = false;
    this.imap = new Imap(options);

    this.imap.once('error', (err) => {
      console.log(err);
    });
  }

  connect() {
    return new Promise((resolve, reject) => {
      if (this.imap.state == 'connected') {
        resolve();
      } else {
        this.imap.on('ready', resolve);
        this.imap.connect();
      }
    });
  }

  end() {
    return new Promise((resolve, reject) => {
      this.imap.once('end', resolve);
      this.imap.end();
    })
  }

  destroy() {
    this.imap.destroy();
  }

  openBoxAndConnect(box, openReadOnly = false) {
    return this.connect().then(() => {
      return new Promise((resolve, reject) => {
        this.imap.openBox(box, openReadOnly, (err, box) => {
          err ? reject(err) : resolve(box);
        });
      })
    });
  }

  openBox(box, openReadOnly = false) {
    return new Promise((resolve, reject) => {
      this.imap.openBox(box, openReadOnly, (err, box) => {
        err ? reject(err) : resolve(box);
      });
    })
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

  /** returns boxes in array sorted, that the parent is before the child */
  getBoxes(details = false) {
    return this.connect().then(() => new Promise((resolve, reject) => {
      this.imap.getBoxes((err, boxes) => {
        if (err) {
          this.end().then(() => {
            reject(err);
          });
        } else {
          let boxList = [];
          this._generateBoxList(boxes, null, boxList, null);
          if (details) {
            let promises = [];
            let boxListDetails = [];
            boxList.forEach((box, index) => {
              promises.push(new Promise((yay, nay) => {
                this.statusBoxAsync(box.name, false).then((res) => {
                  boxListDetails.push({
                    // TODO: it appears this block is never reached
                    name: res.name, // unique name used as id
                    shortName: res.name.substr(res.name.lastIndexOf('/') + 1, res.name.length),
                    total: res.messages.total, // TODO: are we using this?
                    parent: box.parent,
                    uidvalidity: res.uidvalidity, // currently not used
                    static: this.staticBoxes.indexOf(key) > -1
                  });
                  yay(res);
                })
              }));
            });
            Promise.all(promises).then((results) => {
              this.end().then(() => {
                resolve(boxListDetails);
              });
            });
          } else {
            this.end().then(() => {
              resolve(boxList);
            });
          }
        }
      });
    }));
  }

  addBox(boxName) {
    return this.connect().then(() => new Promise((resolve, reject) => {
      this.imap.addBox(boxName, (err) => {
        this.end().then(() => {
          if (err) {
            reject(err);
          } else {
            resolve(boxName);
          }
        });
      })
    }))
  }

  delBox(boxName) {
    return this.connect().then(() => new Promise((resolve, reject) => {
      this.imap.delBox(boxName, (err) => {
        this.end().then(() => {
          if (err) {
            reject(err);
          } else {
            resolve(boxName);
          }
        })
      })
    }))
  }

  renameBox(oldBoxName, newBoxName) {
    return this.connect().then(() => new Promise((resolve, reject) => {
      this.imap.renameBox(oldBoxName, newBoxName, (err) => {
        this.end().then(() => {
          if (err) {
            reject(err);
          } else {
            resolve(newBoxName);
          }
        });
      })
    }))
  }

  append(boxName, from, to, subject, msgData) {
    let options = { mailbox: boxName };

    //TODO to must be an array of recipients
    const msg = this.createRfcMessage(from, to, subject, msgData);

    return this.connect().then(() => new Promise((resolve, reject) => {
      this.imap.append(msg, options, (err) => {
        this.end().then(() => {
          if (err) {
            reject(err);
          } else {
            resolve(msgData);
          }
        });
      })
    }));
  }

  move(msgId, srcBox, box) {
    return this.openBoxAndConnect(srcBox).then((srcBox) => new Promise((resolve, reject) => {
      this.imap.move(msgId, box, (err) => {
        this.end().then(() => {
          if (err) {
            reject(err);
          } else {
            resolve(msgId);
          }
        });
      })
    }));
  }

  copy(msgId, srcBox, box) {
    return this.openBoxAndConnect(srcBox).then((srcBox) => new Promise((resolve, reject) => {
      this.imap.copy(msgId, box, (err) => {
        this.end().then(() => {
          if (err) {
            reject(err);
          } else {
            resolve(msgId);
          }
        });
      })
    }));
  }

  addFlags(msgId, flags, box) {
    return this.openBoxAndConnect(box).then((box) => new Promise((resolve, reject) => {
      this.imap.addFlags(msgId, flags, (err) => {
        this.end().then(() => {
          if (err) {
            reject(err);
          } else {
            resolve(msgId);
          }
        });
      })
    }));
  }

  delFlags(msgId, flags, box) {
    return this.openBoxAndConnect(box).then((box) => new Promise((resolve, reject) => {
      this.imap.delFlags(msgId, flags, (err) => {
        this.end().then(() => {
          if (err) {
            reject(err);
          } else {
            resolve(msgId);
          }
        });
      })
    }));
  }

  // TODO fetchAttachment
  /*fetchAttachment(mail) {
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
  }*/

  // IMPORTANT: preserve RFC line break \r\n
  // TODO to must be an array of recipients
  createRfcMessage(from, to, subject, msgData) {
    return `From: ${from}\r\nTo: ${to}\r\nSubject: ${subject}\r\n${msgData}`;
  }

  _generateBoxList(boxes, parentPath, arr, parent) {
    Object.keys(boxes).forEach((key, i) => {
      const path = parentPath ? `${parentPath}/${key}` : key;
      let box = null;
      if (this.excludedBoxes.indexOf(key) < 0) {
        box = {
          name: path,
          shortName: path.substr(path.lastIndexOf('/') + 1, path.length),
          parent: parent ? parent.name : null,
          static: this.staticBoxes.indexOf(key) > -1
        };
        arr.push(box);
      }
      if (boxes[key].children) {
        this._generateBoxList(boxes[key].children, path, arr, box);
      }
    })
  }


}

export default ImapConnector;
