import Promise from 'bluebird';
import EWS from 'node-ews';
import E from './ExchangeMethods';

class ExchangeConnector {

  constructor(options) {
    this.options = {
      username: 'ga63bot',
      password: 'Alabama2015',
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
    //   const email = {
    //     messageId: mailObject.messageId,
    //     from: mailObject.from,
    //     to: mailObject.to,
    //     subject: mailObject.subject,
    //     text: mailObject.text,
    //     html: mailObject.html,
    //     date: moment(mailObject.date).format('YYYY-MM-DD HH:mm:ss'),
    //     flags: attributes.flags,
    //     labels: attributes['x-gm-labels'],
    //     uid: attributes.uid,
    //     attrs: attributes,
    //     thrid: attributes['x-gm-thrid'],
    //     box: box,
    //     user: this.options.currentUser
    //   };
  }

}

export default ExchangeConnector;

//
// "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
// "<soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\"\n" +
// "   xmlns:t=\"http://schemas.microsoft.com/exchange/services/2006/types\">\n" +
// "<soap:Header>\n" +
// "    <t:RequestServerVersion Version=\"Exchange2007_SP1\" />\n" +
// "  </soap:Header>\n" +
// "  <soap:Body>\n" +
// "    <GetFolder xmlns=\"http://schemas.microsoft.com/exchange/services/2006/messages\"\n" +
// "               xmlns:t=\"http://schemas.microsoft.com/exchange/services/2006/types\">\n" +
// "      <FolderShape>\n" +
// "        <t:BaseShape>Default</t:BaseShape>\n" +
// "      </FolderShape>\n" +
// "      <FolderIds>\n" +
// "        <t:DistinguishedFolderId Id=\"inbox\"/>\n" +
// "      </FolderIds>\n" +
// "    </GetFolder>\n" +
// "  </soap:Body>\n" +
// "</soap:Envelope>\n";
