import Promise from 'bluebird';
import moment from 'moment';
import nodemailer from 'nodemailer';

class SMTPConnector {

  constructor(smtpConfig, sendMailOptions) {
    this.options = smtpConfig;
    this.sendMailOptions = sendMailOptions;
  }
  //we could implement nodemailer-promise for using promises
  /*sendMail(){
  //  let transporter = nodemailer.createTransport(this.options);
     return new Promise(function(resolve,reject){
      let transporter = nodemailer.createTransport(this.options);
      console.log(transporter);
      transporter.sendMail(this.sendMailOptions, function(error, info){
        if(error){
          reject(error);
          return false;
        }else{
          console.log('Message sent: ' + info.response);
          console.log("resolve promise");
          resolve(transporter);
          return true;
        };
      });
    });
  }
*/
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
      return true;
  }
}
export default SMTPConnector;
