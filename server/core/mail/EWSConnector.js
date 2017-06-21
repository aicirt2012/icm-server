import Promise from 'bluebird';
import moment from 'moment';
import EWS from 'node-ews';
import Box from '../../models/box.model';
import base64 from 'base-64';
import utf8 from 'utf8';
import {MailParser} from 'mailparser';
import {Readable, Stream, PassThrough} from 'stream';
import Buffer from 'buffer';
import Attachment from '../../models/attachment.model';
import fs from 'fs';

/*
 https://msdn.microsoft.com/en-us/library/office/dn440952(v=exchg.150).aspx
 https://msdn.microsoft.com/en-us/library/aa563967(v=exchg.150).aspx
 https://msdn.microsoft.com/en-us/library/office/aa566013(v=exchg.150).aspx
 https://blogs.msdn.microsoft.com/exchangedev/2010/03/16/loading-properties-for-multiple-items-with-one-call-to-exchange-web-services/
 https://msdn.microsoft.com/en-us/library/microsoft.exchange.webservices.data.textbody(v=exchg.80).aspx
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

      console.log(emailObject);

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

      this.ews.run(ewsFunction, ewsArgs)
        .then(result => {
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
      };
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
  append(emailObject) {
    return new Promise((resolve, reject) => {

      const ewsFunction = 'CreateItem';
      const ewsArgs = {
        attributes: {
          MessageDisposition: 'SaveOnly'
        },
        SavedItemFolderId: {
          DistinguishedFolderId: {
            attributes: {
              Id: 'drafts'
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

      this.ews.run(ewsFunction, ewsArgs)
        .then(result => {
          console.log('email draft...');
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
          't:FolderId': {
            attributes: {
              Id: boxEwsId
            }
          }
        },
        'ItemIds': {
          't:ItemId': {
            attributes: {
              Id: email.messageId
            }
          }
        }
      };

      var ewsSoapHeader = {
        't:RequestServerVersion': {
          attributes: {
            Version: "Exchange2013",
          }
        }
      };

      this.ews.run(ewsFunction, ewsArgs, ewsSoapHeader)
        .then(result => {
          console.log('email moved...');
          console.log(JSON.stringify(result));
          resolve(result);
        })
        .catch(err => {
          reject(err);
        });

    });
  };

  addFlags(mail, flags) {
    return new Promise((resolve, reject) => {

      console.log('Inside addFlags');
      // TODO: process flags. Now only working for SEEN
      console.log(flags);
      console.log(mail.messageId);
      console.log(mail.ewsChangeKey);

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
                Id: mail.messageId,
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

      var ewsSoapHeader = {
        't:RequestServerVersion': {
          attributes: {
            Version: "Exchange2013",
            xmlns: "http://schemas.microsoft.com/exchange/services/2006/t‌​ypes"
          }
        }
      };

      this.ews.run(ewsFunction, ewsArgs, ewsSoapHeader)
        .then(result => {
          console.log('email flags...');
          console.log(JSON.stringify(result));
          resolve(JSON.stringify(result));
        })
        .catch(err => {
          console.log(err);
          reject(err);
        });

    });
  }

  delFlags(mail, flags) {

    return new Promise((resolve, reject) => {

      console.log('Inside delFlags');
      // TODO: process flags. Now only working for SEEN
      console.log(flags);

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
                Id: mail.messageId,
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

      var ewsSoapHeader = {
        't:RequestServerVersion': {
          attributes: {
            Version: "Exchange2013",
            xmlns: "http://schemas.microsoft.com/exchange/services/2006/t‌​ypes"
          }
        }
      };

      this.ews.run(ewsFunction, ewsArgs, ewsSoapHeader)
        .then(result => {
          console.log('email flags...');
          console.log(JSON.stringify(result));
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
        "FolderShape": {
          "BaseShape": "AllProperties"
        },
        "SyncFolder": {
          "DistinguishedFolderId": {
            "attributes": {"Id": "root"}
          }
        }
      };

      const ewsSoapHeader = {
        't:RequestServerVersion': {
          attributes: {
            Version: "Exchange2013",
            xmlns: "http://schemas.microsoft.com/exchange/services/2006/t‌​ypes"
          }
        }
      };

      this.ews.run(ewsFunction, ewsArgs, ewsSoapHeader)
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
          console.log(box);
          return Box._updateBox(box);
        })
      }).then(() => {
        console.log('Box up to date!');
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
      const MAX_CHANGES_RETURNED = '5';
      const ewsFunction = 'SyncFolderItems';
      const ewsArgs = {
        "ItemShape": {
          "BaseShape": "IdOnly"
        },
        "SyncFolderId": {
          "FolderId": {
            "attributes": {
              "Id": box.ewsId
            }
          }
        },
        "SyncState": syncState,
        "MaxChangesReturned": MAX_CHANGES_RETURNED,
        "SyncScope": "NormalItems"
      };

      const ewsSoapHeader = {
        't:RequestServerVersion': {
          attributes: {
            Version: "Exchange2013",
            xmlns: "http://schemas.microsoft.com/exchange/services/2006/t‌​ypes"
          }
        }
      };

      this.ews.run(ewsFunction, ewsArgs, ewsSoapHeader)
        .then(changes => {
          // console.log('these are the changes');
          // console.log(JSON.stringify(changes));
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
      this._getEmailsFromItems(items, box)
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
    let items = [];
    if (changes.ResponseMessages.SyncFolderItemsResponseMessage.Changes) {
      items = items.concat(changes.ResponseMessages.SyncFolderItemsResponseMessage.Changes.Create || []);
      items = items.concat(changes.ResponseMessages.SyncFolderItemsResponseMessage.Changes.Update || []);
      // TODO Delete items: The current algorithm won't work. Only Ids are returned
      // items = items.concat(changes.ResponseMessages.SyncFolderItemsResponseMessage.Changes.Delete || []);
      // https://msdn.microsoft.com/en-us/library/office/aa580800(v=exchg.150).aspx
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
        "ItemShape": {
          "BaseShape": "Default",
          "AdditionalProperties": {
            "FieldURI": [
              {
                "attributes": {
                  "FieldURI": "item:HasAttachments"
                }
              },
              {
                "attributes": {
                  "FieldURI": "item:TextBody"
                }
              },
              {
                "attributes": {
                  "FieldURI": "item:MimeContent"
                }
              }
            ]
          }
        },
        "ItemIds": {
          "ItemId": this._structureItemIds(items)
        }
      };

      const ewsSoapHeader = {
        't:RequestServerVersion': {
          attributes: {
            Version: "Exchange2013",
            xmlns: "http://schemas.microsoft.com/exchange/services/2006/t‌​ypes"
          }
        }
      };

      this.ews.run(ewsFunction, ewsArgs, ewsSoapHeader)
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
      // TODO
      if (item.Message) { // only allow messages not MeetingRequest etc
        itemIds.push(
          {
            "attributes": {
              "Id": item.Message.ItemId.attributes.Id,
              "ChangeKey": item.Message.ItemId.attributes.ChangeKey
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
        return this._getTextAndAttachmentsFromMimeContent(message.MimeContent['$value']).then(textAndAttachments => {

          const email = {
            messageId: message.ItemId.attributes.Id,
            ewsChangeKey: message.ItemId.attributes.ChangeKey,
            from: this._formatContacts(message.From ? message.From.Mailbox : null),
            to: this._formatContacts(message.ToRecipients ? message.ToRecipients.Mailbox : null),
            subject: message.Subject,
            text: textAndAttachments[0],
            html: message.Body['$value'],
            date: moment(message.DateTimeSent).format('YYYY-MM-DD HH:mm:ss'),
            flags: message.IsRead == 'false' ? [] : ['\\Seen'],
            box: box._id,
            user: this.user._id,
            attachments: textAndAttachments[1]
          }

          emails.push(email);
        })
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

  truncateAttachments(mimeContent) {
    const bytes = base64.decode(mimeContent);
    const text = utf8.decode(bytes);
    return text;
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
        console.log('inside parseDataFromEmail');

        if (mailObject.attachments) {
          mailObject.attachments.forEach(m => {

            // TODO Real attachments into FileSystem
            // embedded content in DB
            console.log('attachment structure');
            console.log(m);

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


        resolve([mailObject.text, attachments]);
      }).on('error', (err) => {
        console.log(err);
        reject(err);
      });

      /*
       mailParser.on('data', data => {
       if (data.type === 'text') {
       Object.keys(data).forEach(key => {
       console.log(key);
       console.log('----');
       console.log(data[key]);
       });
       }

       if (data.type === 'attachment') {
       attachments.push(data);
       data.chunks = [];
       data.chunklen = 0;
       let size = 0;
       Object.keys(data).forEach(key => {
       if (typeof data[key] !== 'object' && typeof data[key] !== 'function') {
       console.log('%s: %s', key, JSON.stringify(data[key]));
       }
       });
       data.content.on('readable', () => {
       let chunk;
       while ((chunk = data.content.read()) !== null) {
       size += chunk.length;
       data.chunks.push(chunk);
       data.chunklen += chunk.length;
       }
       });

       data.content.on('end', () => {
       data.buf = Buffer.concat(data.chunks, data.chunklen);
       console.log('%s: %s B', 'size', size);
       // attachment needs to be released before next chunk of
       // message data can be processed
       data.release();
       });
       }
       });
       */


    })
  }
}

export default EWSConnector;
