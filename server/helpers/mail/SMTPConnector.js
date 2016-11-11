import Promise from 'bluebird';
import moment from 'moment';
import nodemailer from 'nodemailer';

class SMTPConnector {

  constructor() {
    let transporter = nodemailer.createTransport(smtpConfig);
  }
  sendMail(smtpConfig,sendMailOptions ){
      transporter.sendMail(sendMailOptions, function(error, info){
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
