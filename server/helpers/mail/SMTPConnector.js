import Promise from 'bluebird';
import moment from 'moment';
import nodemailer from 'nodemailer';

class SMTPConnector {

  constructor(smtpConfig, sendMailOptions) {
    this.options = smtpConfig;
    this.sendMailOptions = sendMailOptions;
  }
  sendMail(){
      let transporter = nodemailer.createTransport(this.options);
      transporter.sendMail(this.sendMailOptions, function(error, info){
        if(error){
          return false;
        }else{
          console.log('Message sent: ' + info.response);
          return true;
        };
      });
  }
}
export default SMTPConnector;
