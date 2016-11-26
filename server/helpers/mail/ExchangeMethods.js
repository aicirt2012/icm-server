export default {
  findFoldersDeep: (root) => {
    return {
      name: 'FindFolder',
      query: {
        'attributes': {
          'Traversal': 'Deep'
        },
        'FolderShape': {
          'BaseShape': 'Default'
        },
        'ParentFolderIds': {
          'DistinguishedFolderId': {
            'attributes': {
              'Id': root
            }
          }
        }
      }
    }
  },
  findFoldersShallow: (root) => {
    return {
      name: 'FindFolder',
      query: {
        'attributes': {
          'Traversal': 'Shallow'
        },
        'FolderShape': {
          'BaseShape': 'Default'
        },
        'ParentFolderIds': {
          'DistinguishedFolderId': {
            'attributes': {
              'Id': root
            }
          }
        }
      }
    }
  },
  getFolder: (folder) => {
    return {
      name: 'GetFolder',
      query: {
        'FolderShape': {
          'BaseShape': 'Default'
        },
        'FolderIds': {
          'DistinguishedFolderId': {
            'attributes': {
              'Id': folder
            }
          }
        }
      }
    }
  },
  createFolder: (parent, name) => {
    return {
      name: 'CreateFolder',
      query: {
        'ParentFolderId': {
          'DistinguishedFolderId': {
            'attributes': {
              'Id': parent
            }
          }
        },
        'Folders': {
          'Folder': {
            'DisplayName': name
          }
        }
      }
    }
  },
  sendEmail: (subject, body, to) => {
    let recipients = [];
    if (Array.isArray(to)) {
      to.forEach((r) => {
        recipients.push({
          EmailAddress: r
        });
      })
    } else {
      recipients.push({
        EmailAddress: to
      });
    }
    return {
      name: 'CreateItem',
      query: {
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
            Subject: subject,
            Body: {
              '$value': body,
              attributes: {
                BodyType: 'Text'
              }
            },
            ToRecipients: {
              Mailbox: recipients
            },
            IsRead: 'false'
          }
        }
      }
    }
  },
  createDraft: (subject, body, to) => {
    let recipients = [];
    if (Array.isArray(to)) {
      to.forEach((r) => {
        recipients.push({
          EmailAddress: r
        });
      })
    } else {
      recipients.push({
        EmailAddress: to
      });
    }
    return {
      name: 'CreateItem',
      query: {
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
            Subject: subject,
            Body: {
              '$value': body,
              attributes: {
                BodyType: 'Text'
              }
            },
            ToRecipients: {
              Mailbox: recipients
            },
            IsRead: 'false'
          }
        }
      }
    }
  },
  findEmailsInFolder: (folder) => {
    return {
      name: 'FindItem',
      query: {
        attributes: {
          Traversal: 'Shallow'
        },
        ItemShape: {
          BaseShape: 'AllProperties'
        },
        ParentFolderIds: {
          DistinguishedFolderId: {
            attributes:  {
              Id: folder
            }
          }
        }
      }
    }
  }
};
