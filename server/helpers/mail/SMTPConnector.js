import Promise from 'bluebird';
import moment from 'moment';
import nodemailer from 'nodemailer';

class SMTPConnector {

  constructor(smtpConfig, sendMailOptions) {
    this.options = smtpConfig;
    this.sendMailOptions = sendMailOptions;
  }
  sendMail() {
    return new Promise((resolve, reject) => {
      let transporter = nodemailer.createTransport(this.options);
      transporter.sendMail(this.sendMailOptions, function(error, info) {
        error ? reject(error) : resolve(info);
      });
    });
  }
}
export default SMTPConnector;
