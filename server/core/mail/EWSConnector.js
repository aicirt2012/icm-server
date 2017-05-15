import Promise from 'bluebird';
import moment from 'moment';
import EWS from 'node-ews';
import Box from '../../models/box.model';

/*
 https://msdn.microsoft.com/en-us/library/office/dn440952(v=exchg.150).aspx
 https://msdn.microsoft.com/en-us/library/aa563967(v=exchg.150).aspx
 https://msdn.microsoft.com/en-us/library/office/aa566013(v=exchg.150).aspx
 https://blogs.msdn.microsoft.com/exchangedev/2010/03/16/loading-properties-for-multiple-items-with-one-call-to-exchange-web-services/
 */

class EWSConnector {

  excludedBoxes = ['Conversation Action Settings', 'Files'];

  constructor(options, user) {

    this.user = user;

    console.log('Hallo EWSConnector');
    console.log(options);
    console.log(user);

    // exchange server connection info
    this.ewsConfig = {
      username: options.user,
      password: options.password,
      host: 'https://xmail.mwn.de',
      temp: './'
    };

    // initialize node-ews
    this.ews = new EWS(this.ewsConfig);

    console.log(this.ews);
    console.log(this.ewsConfig);

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

      this.ews.run(ewsFunction, ewsArgs)
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
    console.log('fetchBoxes from the EWSConnector...');
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
      const MAX_CHANGES_RETURNED = '10';
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

      this.ews.run(ewsFunction, ewsArgs)
        .then(changes => {
          console.log('Fetching Emails...');
          console.log(JSON.stringify(changes));
          syncState = this._getBoxSyncState(changes);
          return this._processChangesAndStoreEmails(changes, box, storeEmail);
        })
        .then(() => {
          console.log('now update box SyncState');
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

  // SyncFolderItems is similar to the FindItem operation in that it cannot return properties like Body or Attachments.
  // so it is necessary to call GetItem :(
  _processChangesAndStoreEmails(result, box, storeEmail) {
    return new Promise((resolve, reject) => {
      const items = result.ResponseMessages.SyncFolderItemsResponseMessage.Changes ? result.ResponseMessages.SyncFolderItemsResponseMessage.Changes.Create : [];
      this._getParseAndStoreEmails(items, box, storeEmail)
        .then(emails => {
          // TODO store emails
          console.log(emails);
          resolve();
        }).catch(err => {
        console.log(err);
        reject();
      });
    });
  }

  _getParseAndStoreEmails(items, box, storeEmail) {
    console.log('calling Email EWS GetItem batch...');
    return new Promise((resolve, reject) => {

      if (items.length == 0) {
        resolve();
        return;
      }

      const ewsFunction = 'GetItem';
      const ewsArgs = {
        "ItemShape": {
          "BaseShape": "Default"
        },
        "ItemIds": {
          "ItemId": this._structureItemIds(items)
        }
      };

      console.log('ewsARgs');
      console.log(JSON.stringify(ewsArgs));

      this.ews.run(ewsFunction, ewsArgs)
        .then(result => {
          console.log(' ---- > Raw Emails...');
          const email = this._parseAndStoreEmails(result, box, storeEmail);
          // resolve(email)
          resolve();
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
      itemIds.push(
        {
          "attributes": {
            "Id": item.Message.ItemId.attributes.Id,
            "ChangeKey": item.Message.ItemId.attributes.ChangeKey
          }
        }
      )
    });
    return itemIds;
  }

  _parseAndStoreEmails(result, box, storeEmail) {
    console.log('inside parseEmails');
    console.log(result);
    const rawEmails = result.ResponseMessages.GetItemResponseMessage || [];
    console.log(rawEmails);
    let emails = [];
    rawEmails.forEach(rawEmail => {
      const message = rawEmail.Items.Message;
      console.log(message);
      const email = {
        messageId: message.ItemId.attributes.Id,
        // ewsChangeKey: message.ItemId.attributes.ChangeKey,
        from: message.From.Mailbox, // this._formatMessageFromOrTo(message.From.Mailbox),
        to: message.ToRecipients ? message.ToRecipients.Mailbox : [], // this._formatMessageFromOrTo(message.From.Mailbox),
        subject: message.Subject,
        text: message.TextBody || '',
        html: message.Body['$value'],
        date: moment(message.DateTimeSent).format('YYYY-MM-DD HH:mm:ss'),
        flags: [message.isRead],
        box: box._id,
        user: this.user._id
      }
      console.log('parsedEmail');
      console.log(email);
    });
    return emails;
  }

  _formatMessageFromOrTo(mailbox) {
    // TODO
  }

}

export default EWSConnector;
