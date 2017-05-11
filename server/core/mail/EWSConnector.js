import EWS from 'node-ews';

class EWSConnector {

  excludedBoxes = ['Calendar', 'Contacts', 'Companies'];

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

      console.log('--- Get ongoing list of folders');

      /// ----- Get the initial list of items (messages)
      // ewsFunction = 'SyncFolderHierarchy';
      // ewsFunction = 'GetFolder';
      const ewsFunction = 'SyncFolderItems';

      const ewsArgs = {
        "ItemShape": {
          "BaseShape": "AllProperties"
        },
        "SyncFolderId": {
          "DistinguishedFolderId": {
            "attributes": {
              "Id": "sentitems"
            }
          }
        },
        //"SyncState": "H4sIAAAAAAAEAGNgYGcAAotqE0tHE2NTA0ddZ3NHC10TR2djXSdnJ2ddNyMnC2cnczdLU1OD2vBgveDKvOTgksSSVOfEvMSiSgYr0nW65eekpBZ5pjBYkq43LLWoODM/j8GaaK3+QMuKS4JSk1Mzy1JTQjJzU0nwrU9icYlnXnFJYl5yqncqKb71zS9K9SxJzS32zwtOLSpLLSLByXDfhgNxUW5iUTYklrgYGISA0tDwAxkOUskgCJQyAGI9kBrHjZvehIbEe+5fJrXqbVrtc0YG26WX7OcuYXHrzYgNaD2TmApSxcgDxAx8DMwgDjeD7ZdztjemXfFgEAKK8gIx0DodRgYGX8cAT19HP5AiBjdTtzCQ8gAgVmVAgPVAbIXEL0Xjw8BLIDZH4idZpJqnGFta6hpZGhnpmpgbGuhaWBqb6yabGBubW1iYAYkUDLczMTCwcK45O4eFd/KzN8yy7pVBtnYBjK7MPav7mOcw1Qcw+4rwBPkHBQRg17mWTYiFd4ouD1DnwaCAQLDO70uZ5wQ0g3QWBx0/hUUnI0MQOMgYr15IVwxguBfCvlutnsN3sv6/qrlKP/aygX3DyGDIwNAAAEwxjyFOAwAA",
        "SyncState": "H4sIAAAAAAAEAJWRX0gUURTG73QXtSQh6anCB2FNitFt/82M2x9mVpa22vZ6d9VCIsadW0ntLMyOgoVUD4lC0kPQQ6FYVkJUpND6YGoIvZhBrLlkD1b4UFAhFEFRSGdWKcGM9sJv4Mw5Z777fYNQPoIjnnFLstvlcci8X5BF3i37XbziV/x8wKmIfkUISB6Po60+UhFp1WMRUzWZX9VVoxVV5b4ZSJzSmBHUkJT7bh0zkk0JHfn+ezUMYkmTshhramFatCnOcnB7QE2aQT1pqnqM7We5uA0lDBY0WTwZ1iPMaGFGDlf+7bYeMOKqcXLxL61DqBjaS/lZH7cm0QZoOYAKa0YeGPxYGz0aHLu96c6nY23vOLTrVnpP901boOvEEXJhUmXWFLcWQEUIW0UhevPz88WZKy/2omJ4ux4AucNrEArJJBiSD1pDKOAJ1FnjBLCjP6eXQ6hkWT0K9SW08jQD3mV1o8gEzSVJvFNyOnm3sMPBi5JL4GNul0sQRS88tBV3p9lVDnHTz+OFaDaaP1x2tiB0uXLhdHfpt5G8pa7XR/D2GQedyhDb7n19Oq5+P0nt5QTXNqg0XENww70RKisEH/9QQNs7CE4uxKi9jODUxqvK9c2EkBXCIIlsgze0p3hitIeWbyM4Pfda6TvE3SW2+e+VDYTjcOmwlwo7QXq2k7Z3gnRNHoer55upWwDpxil6/wFIP9To2GOQ/lJFX74i2Mwbp6khkC7pUWyrSGddc1nPZFXT/47q7356r/XTiUf9Y8A4Tr89r3QVgZ2vAxmwQ0tTQS/goxDlFJDJZkkhSztQTiHMMFBDIU0ZUCjE2Q50UMjTDpQtBuojtmdb5rbS6Sc/0kAGPMoInfsFpL51H3sEAAA=",
        "MaxChangesReturned": "40",
        "SyncScope": "NormalItems"
      };

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
       "Mailbox": {
       'Address' : 'ws01.sebis@tum.de'
       },
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

      // query EWS and print resulting JSON to console
      this.ews.run(ewsFunction, ewsArgs)
        .then(result => {
          console.log('Get Changes since last sync');
          console.log(JSON.stringify(result));
          resolve();
        })
        .catch(err => {
          console.log(err.message);
        });

    });
  }

  getBoxes(details = false) {
    console.log('inside getBoxes from EWS connector');
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
          console.log('SyncFolderHierarchy');
          //console.log(JSON.stringify(result));
          const boxes = this._getOnlyEmailBoxes(result);
          console.log('here the boxes');
          console.log(boxes);

          let boxList = [];
          this._generateBoxList(boxes, null, boxList, null);
          console.log('here the boxList');
          console.log(boxList);
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
    let emailBoxes = [];
    let parentIdx = [];
    allBoxes.forEach(box => {
      if (box.Folder) {
        emailBoxes.push(box.Folder);
        if (box.Folder.ChildFolderCount > 0) {
          parentIdx.push(emailBoxes.length - 1);
        }
      }
    })
    emailBoxes = this._relateParentChildren(parentIdx, emailBoxes);
    return emailBoxes;
  }

  _relateParentChildren(parentIdx, emailBoxes) {
    let childrenIdx = [];

    // push children into parent
    parentIdx.forEach(idx => {
      emailBoxes[idx].children = [];
      const parentId = emailBoxes[idx].FolderId.attributes.Id;

      emailBoxes.forEach((box, i) => {
        if (box.ParentFolderId.attributes.Id == parentId) {
          emailBoxes[idx].children.push(box);
          childrenIdx.push(i);
        }
      })
    })

    // remove children from emailBoxes
    // they are now contained in the parent
    childrenIdx.reverse();
    childrenIdx.forEach(idx => {
      emailBoxes.splice(idx, 1);
    })

    return emailBoxes;
  }

  _generateBoxList(boxes, parentPath, arr, parent) {
    Object.keys(boxes).forEach((key, i) => {
      const path = parentPath ? `${parentPath}/${boxes[key].DisplayName}` : boxes[key].DisplayName;
      let box = null;
      if (this.excludedBoxes.indexOf(boxes[key].DisplayName) < 0) {
        box = {
          name: path,
          shortName: path.substr(path.lastIndexOf('/') + 1, path.length),
          parent: parent ? parent.name : null,
        };
        arr.push(box);
      }
      if (boxes[key].ChildFolderCount > 0) {
        this._generateBoxList(boxes[key].children, path, arr, box);
      }
    })
  }

}

export default EWSConnector;
