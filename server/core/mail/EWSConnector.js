import EWS from 'node-ews';

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

    //this.initialSyncFolderHierarchy();
  }

  initialSyncFolderHierarchy() {
    return new Promise((resolve, reject) => {

      console.log('--- Get the initial list of folders');

      // define ews api function
      const ewsFunction = 'SyncFolderHierarchy';

      // define ews api function args
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

      // query EWS and print resulting JSON to console
      this.ews.run(ewsFunction, ewsArgs)
        .then(result => {
          console.log('SyncFolderHierarchy');
          console.log(JSON.stringify(result));
          resolve();
        })
        .catch(err => {
          console.log(err.message);
        });
    });
  }

  syncFolderItems(syncState) {
    return new Promise((resolve, reject) => {

      /// ----- Get the initial list of items (messages)
      // ewsFunction = 'SyncFolderHierarchy';
      // ewsFunction = 'GetFolder';


      /*
       ewsArgs = {
       "FolderShape": {
       "BaseShape": "AllProperties"
       },
       "SyncFolder": {
       "DistinguishedFolderId": {
       "attributes": {
       "Id": "root"
       }
       }
       },
       "SyncState": "H4sIAAAAAAAEAGNgYGUAAotqE0tHE2NTA0ddZ3NHC10TR2djXSdnJ2ddNyMnC2cnczdLU1OD2vBgveDKvOTgksSSVOfEvMSiSgYr0nW65eekpBZ5pjBYkq43LLWoODM/j8HAOSczNa8ELBbvbG7gYmhmYKJrYOlqrmtiYZmm62Ro4aTr4mRsbO5k6WjsZuDGYOZcWhScWlSWWuSbmJeZllpcQpw+cPhwMTCIAZ0BcblHZmpRYlFyRiXIVQyCQGkDINYDqXPcuOlNaEi85/5lUqveptU+Z2SwXXrJfu4SFrfejNiA1jOJqSBVjBxAzMAHxEAAZDNIgRgkm8LLwMBEui4+BgZm0nUpkqVLiWRdjNtEKlvJskuZLLtayNLVTJYLFcjSJQ9KKyTr4iJLFz/JukChkURWGJaT5UIesnQJMDCwka5Ljiy7gOUBK+m6uMmyi5MsXUIMDCyk61IhK23Uk6WriSxdDWTpagTpIq8ABhfjYkAWFoPlOjq0jk/ZQm1DuzY5L04iq9DHYSgQ8Eyr3Bl5jNqGzlvucOYoNQ0Fej8xbueKn4XUdulGaw0DW2q71OLwD9kb1DZUu1ln/R2qGhq9TSExfnL5fWqmU1CYtsa23IuiauK/eqHmV1npD3kq56il1xJTcnZQ2dAYTVX7FcbUNnSfPFPiRSqHac47S10eLiq79KhovmukJLUNFZP9mqdObUPFZ+9hekJtQyWmhTc8onJE1Qos7LA4SG2XSupc2krVMAXl/Z2Jzp111E7832NufF9GZvsDl6Gx/E98bjVR2dCY/2umz+CmtkvZ/7ZefsnAyYAEANAZG/C7DwAA"
       };
       */

      /*
       ewsArgs = {
       "FolderShape": {
       "BaseShape": "Default"
       },
       "FolderIds": {
       "DistinguishedFolderId": {
       "attributes": {
       "Id": "inbox"
       }
       }
       }
       }
       */

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
            name: child.ParentFolderId.attributes.Name ? child.ParentFolderId.attributes.Name  + '/' + child.DisplayName : child.DisplayName,
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
      let highestmodseq = [];
      Promise.each(boxes, (box) => {
        console.log(box);
        // TODO: change highestmodseq name to SyncState (EWS standard)
        return this.fetchEmails(storeEmail, box).then(hms => {
          highestmodseq.push(hms)
        })
      }).then(() => {
        this.user.highestmodseq = this.user.highestmodseq && parseInt(this.user.highestmodseq) > parseInt(highestmodseq[0]) ? this.user.highestmodseq : highestmodseq[0];
        this.user.save().then(() => {
          resolve();
        });
      }).catch(err => {
        console.log(err);
        reject();
      });
    });
  }

  fetchEmails(storeEmail, box) {
    return new Promise((resolve, reject) => {
      const ewsFunction = 'SyncFolderItems';
      const ewsArgs = {
        "ItemShape": {
          "BaseShape": "AllProperties"
        },
        "SyncFolderId": {
          "FolderId": {
            "attributes": {
              "Id": box.ewsId
            }
          }
        },
        "SyncState": box.ewsSyncState,
        "MaxChangesReturned": "10",
        "SyncScope": "NormalItems"
      };

      console.log(ewsArgs)

      // query EWS and print resulting JSON to console
      this.ews.run(ewsFunction, ewsArgs)
        .then(result => {
          console.log('Fetching Emails...');
          console.log(JSON.stringify(result));
          resolve();
        })
        .catch(err => {
          console.log(err);
          reject();
        });
    })
  }

}

export default EWSConnector;
