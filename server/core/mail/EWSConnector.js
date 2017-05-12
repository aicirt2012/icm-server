import EWS from 'node-ews';
import Box from '../../models/box.model';

/*
 https://msdn.microsoft.com/en-us/library/office/dn440952(v=exchg.150).aspx
 https://msdn.microsoft.com/en-us/library/aa563967(v=exchg.150).aspx
 https://msdn.microsoft.com/en-us/library/office/aa566013(v=exchg.150).aspx
 https://blogs.msdn.microsoft.com/exchangedev/2010/03/16/loading-properties-for-multiple-items-with-one-call-to-exchange-web-services/
 */

class EWSConnector {

  excludedBoxes = ['Conversation Action Settings'];

  constructor(options, user) {

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
        .then(result => {
          console.log('Fetching Emails...');
          console.log(JSON.stringify(result));
          syncState = this._getBoxSyncState(result);
          return this._parseAndStoreEmails(result, box, storeEmail);
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
  _parseAndStoreEmails(result, box, storeEmail) {
    return new Promise((resolve, reject) => {
      const items = result.ResponseMessages.SyncFolderItemsResponseMessage.Changes ? result.ResponseMessages.SyncFolderItemsResponseMessage.Changes.Create : [];
      Promise.each(items, (item) => {
        return this._getAndParseEmail(item);
      }).then(email => {
        // TODO store email
        resolve();
      }).catch(err => {
        console.log(err);
        reject();
      });
    });
  }

  // TODO this will be slow
  // Find an alternative for batches
  // https://blogs.msdn.microsoft.com/exchangedev/2010/03/16/loading-properties-for-multiple-items-with-one-call-to-exchange-web-services/
  _getAndParseEmail(item) {
    console.log('calling Email EWS...');
    return new Promise((resolve, reject) => {
      const ewsFunction = 'GetItem';
      const ewsArgs = {
        "ItemShape": {
          "BaseShape": "Default"
        },
        "ItemIds": {
          "ItemId": {
            "attributes": {
              "Id": item.Message.ItemId.attributes.Id,
              "ChangeKey": item.Message.ItemId.attributes.ChangeKey
            }
          }
        }
      };

      this.ews.run(ewsFunction, ewsArgs)
        .then(rawEmail => {
          console.log('Raw Email...');
          console.log(JSON.stringify(rawEmail));
          //TODO parse raw Email for email.model
          // const email = _parseEmail(rawEmail);
          // resolve(email)
          resolve();
        })
        .catch(err => {
          console.log(err);
          reject();
        });

    });
  }

  _parseEmail(rawEmail) {
    //TODO
  }

}

export default EWSConnector;
