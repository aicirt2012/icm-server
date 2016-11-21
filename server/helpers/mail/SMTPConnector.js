import Promise from 'bluebird';
import moment from 'moment';
import nodemailer from 'nodemailer';

class SMTPConnector {

  constructor(smtpConfig) {
      this.options = smtpConfig;
    }
  /* Request Body Syntax for sendMail
  {
	  "from" : "peter@niedermeier-ed.de",
    "to" : "sebisng2@gmail.com",       In order to send to a list of receivers, just add the mail addresses separated by "," e.g. "to" : "sebisng2@gmail.com, myMail@gmail.com"
    "subject" : "Important Meeting",
    "text" : "some random text",
    "html" : "<b>some random text</b>"
  }*/
  sendMail(requestBody) {
    return new Promise((resolve, reject) => {
      let transporter = nodemailer.createTransport(this.options);
      transporter.sendMail(requestBody, function(error, info) {
        error ? reject(error) : resolve(info);
      });
    });
  }
}
export default SMTPConnector;
