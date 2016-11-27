import Promise from 'bluebird';
import EWS from 'node-ews';
import E from './ExchangeMethods';

class ExchangeConnector {

  constructor(options) {
    this.options = {
      username: '$EMAIL',
      password: '$PASSWORD',
      host: 'https://xmail.mwn.de',
      temp: 'exchangeTest'
    };
    this.ews = new EWS(this.options);
  }

  getBoxes() {
    const request = E.findFoldersDeep('root');
    return new Promise((resolve, reject) => {
      this.ews.run(request.name, request.query)
        .then(result => {
          resolve(JSON.stringify(result));
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  /*
   * subject, body - string
   * to - array of email addresses OR single email address
   */
  sendMail(subject, body, to) {
    const request = E.sendEmail(subject, body, to);
    return new Promise((resolve, reject) => {
      this.ews.run(request.name, request.query)
        .then(result => {
          resolve(JSON.stringify(result));
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  append() {

    }
    /*
     * boxType - name of the fetched box
     */
  fetchEmails(storeEmail, boxType) {
    console.log(boxType);
    const request = E.findEmailsInFolder(boxType);
    return new Promise((resolve, reject) => {
      this.ews.run(request.name, request.query).then((result) => {
          console.log(result);
          return result.ResponseMessages.FindItemResponseMessage.RootFolder
        })
        .then((box) => {
          let promises = [];
          console.log(box.Items.Message[0]);
          box.Items.Message.forEach((mail) => {
            const email = {
              messageId: mail.attributes.Id,
              from: mail.attributes.From.Mailbox.EmailAddress,
              attributes: mail.attributes,
              subject: mail.attributes.Subject,
            };
            promises.push(storeEmail(email));
          });
          Promise.all(promises).then((results) => {
            resolve(results);
          });
        }).catch((err) => {
          reject(err);
        })
    });
  }

}

export default ExchangeConnector;
