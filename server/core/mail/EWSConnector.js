import Promise from 'bluebird';
import moment from 'moment';
import EWS from 'node-ews';
import Box from '../../models/box.model';
import base64 from 'base-64';
import utf8 from 'utf8';
import {MailParser} from 'mailparser';
import {Readable, Stream, PassThrough} from 'stream';
import Attachment from '../../models/attachment.model';

/*
 https://msdn.microsoft.com/en-us/library/office/dn440952(v=exchg.150).aspx
 https://msdn.microsoft.com/en-us/library/aa563967(v=exchg.150).aspx
 https://msdn.microsoft.com/en-us/library/office/aa566013(v=exchg.150).aspx
 https://blogs.msdn.microsoft.com/exchangedev/2010/03/16/loading-properties-for-multiple-items-with-one-call-to-exchange-web-services/
 https://msdn.microsoft.com/en-us/library/microsoft.exchange.webservices.data.textbody(v=exchg.80).aspx
 https://msdn.microsoft.com/en-us/library/office/aa580800(v=exchg.150).aspx
 https://msdn.microsoft.com/en-us/library/office/dn600291(v=exchg.150).aspx#bk_moveews
 https://msdn.microsoft.com/en-us/library/office/aa563789(v=exchg.150).aspx
 */

class EWSConnector {

  excludedBoxes = ['Conversation Action Settings', 'Files'];

  constructor(options, user) {

    console.log('Hallo EWSConnector');

    this.user = user;

    // exchange server connection info
    this.ewsConfig = {
      username: options.user,
      password: options.password,
      host: 'https://xmail.mwn.de',
      temp: './'
    };

    this.ewsSoapHeader = {
      't:RequestServerVersion': {
        attributes: {
          Version: "Exchange2013",
          xmlns: "http://schemas.microsoft.com/exchange/services/2006/t‌​ypes"
        }
      }
    };

    // initialize node-ews
    this.ews = new EWS(this.ewsConfig);

  }


  /**
   * @param emailObject - {
    "to" : ["sebisng2@gmail.com", ...],
    "subject" : "Important Meeting",
    "text" : "some random text",
  * }
   **/
  sendMail(emailObject) {
    return new Promise((resolve, reject) => {

      const ewsFunction = 'CreateItem';
      const ewsArgs = {
        attributes: {
          MessageDisposition: 'SendAndSaveCopy'
        },
        SavedItemFolderId: {
          DistinguishedFolderId: {
            attributes: {
              Id: 'sentitems'
            }
          }
        },
        Items: {
          Message: {
            ItemClass: 'IPM.Note',
            Subject: emailObject.subject,
            Body: {
              '$value': emailObject.text,
              attributes: {
                BodyType: 'Text'
              }
            },
            ToRecipients: {
              Mailbox: this._formatRecipients(emailObject.to)
            },
            IsRead: 'false'
          }
        }
      };

      this.ews.run(ewsFunction, ewsArgs, this.ewsSoapHeader)
        .then(result => {
          // TODO find if returning this result is important
          console.log('email sent...');
          resolve(JSON.stringify(result));
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  // TODO unify email from/to format
  // now it is ["email", "email"];
  // or [{name, address, _id}, {...}]
  _formatRecipients(rawRecipients) {
    let recipients = [];
    rawRecipients.forEach((recipient) => {
      let emailAddress = '';
      if (typeof recipient === 'string' || recipient instanceof String) {
        emailAddress = recipient;
      } else {
        emailAddress = recipient.address;
      }

      recipients.push({
        EmailAddress: emailAddress
      });
    });
    return recipients;
  }

  /**
   * @param emailObject - {
    "to" : ["sebisng2@gmail.com", ...],
    "subject" : "Important Meeting",
    "msgData" : "some random text",
  * }
   **/
  append(emailObject, boxEwsId) {
    return new Promise((resolve, reject) => {

      const ewsFunction = 'CreateItem';
      const ewsArgs = {
        attributes: {
          MessageDisposition: 'SaveOnly'
        },
        SavedItemFolderId: {
          FolderId: {
            attributes: {
              Id: boxEwsId
            }
          }
        },
        Items: {
          Message: {
            ItemClass: 'IPM.Note',
            Subject: emailObject.subject,
            Body: {
              '$value': emailObject.msgData,
              attributes: {
                BodyType: 'Text'
              }
            },
            ToRecipients: {
              Mailbox: this._formatRecipients(emailObject.to)
            },
            IsRead: 'false'
          }
        }
      };

      this.ews.run(ewsFunction, ewsArgs, this.ewsSoapHeader)
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          reject(err);
        });

    });
  }

  move(email, boxEwsId) {
    return new Promise((resolve, reject) => {
      const ewsFunction = 'MoveItem';
      const ewsArgs = {
        'ToFolderId': {
          't:FolderId': { // hack for bug. Use 't:FolderId'
            attributes: {
              Id: boxEwsId
            }
          }
        },
        'ItemIds': {
          't:ItemId': { // hack for bug. Use 't:ItemId'
            attributes: {
              Id: email.ewsItemId
            }
          }
        }
      };

      this.ews.run(ewsFunction, ewsArgs, this.ewsSoapHeader)
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          reject(err);
        });

    });
  };

  // TODO: process more flags. Now only working for SEEN
  addFlags(mail, flags) {
    return new Promise((resolve, reject) => {

      const ewsFunction = 'UpdateItem';
      const ewsArgs = {
        attributes: {
          MessageDisposition: 'SaveOnly',
          ConflictResolution: 'AutoResolve'
        },
        ItemChanges: {
          ItemChange: {
            ItemId: {
              attributes: {
                Id: mail.ewsItemId,
                ChangeKey: mail.ewsChangeKey
              }
            },
            Updates: {
              SetItemField: {
                FieldURI: {
                  attributes: {
                    FieldURI: "message:IsRead"
                  }
                },
                Message: {
                  IsRead: 'true'
                }
              }
            }
          }
        }
      };

      this.ews.run(ewsFunction, ewsArgs, this.ewsSoapHeader)
        .then(result => {
          resolve(JSON.stringify(result));
        })
        .catch(err => {
          console.log(err);
          reject(err);
        });

    });
  }

  // TODO: process more flags. Now only working for SEEN
  delFlags(mail, flags) {

    return new Promise((resolve, reject) => {

      const ewsFunction = 'UpdateItem';
      const ewsArgs = {
        attributes: {
          MessageDisposition: 'SaveOnly',
          ConflictResolution: 'AutoResolve'
        },
        ItemChanges: {
          ItemChange: {
            ItemId: {
              attributes: {
                Id: mail.ewsItemId,
                ChangeKey: mail.ewsChangeKey
              }
            },
            Updates: {
              SetItemField: {
                FieldURI: {
                  attributes: {
                    FieldURI: "message:IsRead"
                  }
                },
                Message: {
                  IsRead: 'false'
                }
              }
            }
          }
        }
      };

      this.ews.run(ewsFunction, ewsArgs, this.ewsSoapHeader)
        .then(result => {
          resolve(JSON.stringify(result));
        })
        .catch(err => {
          console.log(err);
          reject(err);
        });

    });

  }

  getBoxes(details = false) {
    return new Promise((resolve, reject) => {
      const ewsFunction = 'SyncFolderHierarchy';
      const ewsArgs = {
        FolderShape: {
          BaseShape: 'AllProperties'
        },
        SyncFolder: {
          DistinguishedFolderId: {
            attributes: {
              Id: 'root'
            }
          }
        }
      };

      this.ews.run(ewsFunction, ewsArgs, this.ewsSoapHeader)
        .then(result => {
          const boxes = this._getOnlyEmailBoxes(result);
          const boxList = this._generateBoxList(boxes);
          resolve(boxList);
        })
        .catch(err => {
          console.log(err);
          reject(err);
        });
    })
  }

  _getOnlyEmailBoxes(result) {
    const allBoxes = result.ResponseMessages.SyncFolderHierarchyResponseMessage.Changes.Create;
    let emailBoxNames = new Map();
    let emailBoxes = new Map();
    allBoxes.forEach(box => {
      if (box.Folder) {
        const folderId = box.Folder.FolderId.attributes.Id;
        const parentId = box.Folder.ParentFolderId.attributes.Id;

        emailBoxNames.set(folderId, box.Folder.DisplayName);
        box.Folder.ParentFolderId.attributes.Name = emailBoxNames.get(parentId) || null;

        let boxArray = emailBoxes.get(parentId) ? emailBoxes.get(parentId) : [];
        boxArray.push(box.Folder);
        emailBoxes.set(parentId, boxArray);
      }
    })
    return emailBoxes;
  }

  _generateBoxList(boxes) {
    let boxList = []
    boxes.forEach(children => {
      children.forEach(child => {
        if (this.excludedBoxes.indexOf(child.DisplayName) < 0) {
          let box = {
            ewsId: child.FolderId.attributes.Id,
            name: child.ParentFolderId.attributes.Name ? child.ParentFolderId.attributes.Name + '/' + child.DisplayName : child.DisplayName,
            shortName: child.DisplayName,
            parent: child.ParentFolderId.attributes.Name,
          };
          boxList.push(box);
        }
      })
    });
    return boxList;
  }

  fetchBoxes(storeEmail, boxes = []) {
    return new Promise((resolve, reject) => {
      Promise.each(boxes, (box) => {
        return this.fetchEmails(storeEmail, box).then(syncState => {
          box.ewsSyncState = syncState;
          return Box._updateBox(box);
        });
      }).then(() => {
        resolve();
      }).catch(err => {
        console.log(err);
        reject();
      });
    });
  }

  fetchEmails(storeEmail, box) {
    return new Promise((resolve, reject) => {
      let syncState = box.ewsSyncState;
      const MAX_CHANGES_RETURNED = '20';
      const ewsFunction = 'SyncFolderItems';
      const ewsArgs = {
        ItemShape: {
          BaseShape: 'IdOnly'
        },
        SyncFolderId: {
          FolderId: {
            attributes: {
              Id: box.ewsId
            }
          }
        },
        SyncState: syncState,
        MaxChangesReturned: MAX_CHANGES_RETURNED,
        SyncScope: 'NormalItems'
      };

      this.ews.run(ewsFunction, ewsArgs, this.ewsSoapHeader)
        .then(changes => {
          syncState = this._getBoxSyncState(changes);
          return this._processChangesAndStoreEmails(changes, box, storeEmail);
        })
        .then(() => {
          resolve(syncState);
        })
        .catch(err => {
          console.log(err);
          reject();
        });
    })
  }

  _getBoxSyncState(result) {
    return result.ResponseMessages.SyncFolderItemsResponseMessage.SyncState;
  }

  _processChangesAndStoreEmails(changes, box, storeEmail) {
    return new Promise((resolve, reject) => {
      const items = this._getChangeItems(changes);
      this._getEmailsFromItems(items.createUpdate, box)
        .then(emails => {
          return Promise.each(emails, (email) => {
            return storeEmail(email);
          });
        })
        .then(() => {
          resolve();
        })
        .catch(err => {
          console.log(err);
          reject();
        });
    });
  }

  _getChangeItems(changes) {
    let items = {
      createUpdate: [],
      delete: []
    };
    if (changes.ResponseMessages.SyncFolderItemsResponseMessage.Changes) {
      items.createUpdate = items.createUpdate.concat(changes.ResponseMessages.SyncFolderItemsResponseMessage.Changes.Create || []);
      items.createUpdate = items.createUpdate.concat(changes.ResponseMessages.SyncFolderItemsResponseMessage.Changes.Update || []);
      items.createUpdate = items.createUpdate.concat(changes.ResponseMessages.SyncFolderItemsResponseMessage.Changes.ReadFlagChange || []);
      items.delete = items.delete.concat(changes.ResponseMessages.SyncFolderItemsResponseMessage.Changes.Delete || []);
    }
    return items;
  }

  _getEmailsFromItems(items, box) {
    return new Promise((resolve, reject) => {

      if (items.length == 0) {
        resolve([]);
        return;
      }

      const ewsFunction = 'GetItem';
      const ewsArgs = {
        ItemShape: {
          BaseShape: 'Default',
          AdditionalProperties: {
            FieldURI: [
              {
                attributes: {
                  FieldURI: 'item:HasAttachments'
                }
              },
              {
                attributes: {
                  FieldURI: 'item:TextBody'
                }
              },
              {
                attributes: {
                  FieldURI: 'item:MimeContent'
                }
              }
            ]
          }
        },
        ItemIds: {
          ItemId: this._structureItemIds(items)
        }
      };

      this.ews.run(ewsFunction, ewsArgs, this.ewsSoapHeader)
        .then(result => {
          const emails = this._parseEmails(result, box);
          resolve(emails);
        })
        .catch(err => {
          console.log(err);
          reject();
        });

    });
  }

  _structureItemIds(items) {
    let itemIds = []
    items.forEach(item => {
      if (item.Message) { // only allow messages and not MeetingRequest, etc
        itemIds.push(
          {
            attributes: {
              Id: item.Message.ItemId.attributes.Id,
              ChangeKey: item.Message.ItemId.attributes.ChangeKey
            }
          }
        )
      } else if (item.ItemId) { // hack for ReadFlagChange object
        itemIds.push(
          {
            attributes: {
              Id: item.ItemId.attributes.Id,
              ChangeKey: item.ItemId.attributes.ChangeKey
            }
          }
        )
      }
    });
    return itemIds;
  }

  _parseEmails(result, box) {
    return new Promise((resolve, reject) => {

      const rawResponse = result.ResponseMessages.GetItemResponseMessage || [];
      const rawEmails = Array.isArray(rawResponse) ? rawResponse : [rawResponse]; // Hack! if single message
      let emails = [];

      Promise.each(rawEmails, (rawEmail) => {
        const message = rawEmail.Items.Message;
        const mimeContent = message.MimeContent['$value'];
        return this._getTextAndAttachmentsFromMimeContent(mimeContent)
          .then(messageIdAndtextAndAttachments => {

            const email = {
              messageId: messageIdAndtextAndAttachments[0],
              ewsItemId: message.ItemId.attributes.Id,
              ewsChangeKey: message.ItemId.attributes.ChangeKey,
              from: this._formatContacts(message.From ? message.From.Mailbox : null),
              to: this._formatContacts(message.ToRecipients ? message.ToRecipients.Mailbox : null),
              subject: message.Subject,
              text: messageIdAndtextAndAttachments[1],
              html: message.Body['$value'],
              date: moment(message.DateTimeSent).format('YYYY-MM-DD HH:mm:ss'),
              flags: message.IsRead == 'false' ? [] : ['\\Seen'],
              box: box._id,
              user: this.user._id,
              attachments: messageIdAndtextAndAttachments[2]
            }

            emails.push(email);
          });
      }).then(() => {
        resolve(emails);
      }).catch(err => {
        console.log(err);
        reject(err);
      });
    });
  }

  _formatContacts(mailbox) {
    let contacts = [];
    if (mailbox) {
      if (mailbox instanceof Array) {
        mailbox.forEach(item => {
          contacts.push({
            address: item.EmailAddress,
            name: item.Name
          })
        })
      } else {
        contacts.push({
          address: mailbox.EmailAddress,
          name: mailbox.Name
        });
      }
    }
    return contacts;
  }

  _getTextAndAttachmentsFromMimeContent(mimeContent) {
    return new Promise((resolve, reject) => {

      const bytes = base64.decode(mimeContent);
      const text = utf8.decode(bytes);
      const mailParser = new MailParser();
      let attachments = [];

      let s = new Readable();
      s._read = function noop() {
      };
      s.push(text);
      s.push(null);

      s.pipe(mailParser);

      mailParser.on('end', (mailObject) => {

        if (mailObject.attachments) {
          mailObject.attachments.forEach(m => {

            let readStream = new PassThrough();
            readStream.end(m.content);

            Attachment.create(m.fileName, m.contentId, m.contentType,
              m.contentDisposition == 'inline' ? true : false,
              readStream)
              .then(attachment => {
                console.log('attachment created');
                attachments.push(attachment._id);
              })
              .catch(err => {
                console.log(err);
              })
          });
        }

        resolve([mailObject.messageId, mailObject.text, attachments]);
      }).on('error', (err) => {
        console.log(err);
        reject(err);
      });

    })
  }
}

export default EWSConnector;
