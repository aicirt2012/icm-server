import fs from "fs";
import Email from '../models/email.model';
import User from '../models/user.model';
import moment from 'moment';
import mongoose from 'mongoose';
import request from 'request';
import Promise from 'bluebird';
var ObjectId = mongoose.Types.ObjectId;


/** This controller is only of importing the
 * ENRON Mail Corpus to the mongoDB for analytic purpose
 * https://www.cs.cmu.edu/~./enron/ */

exports.importEnronData = (req, res) => {
  /** hardcoded to local disc */
  // const path = __dirname + '/../../../../enron_mail_20150507/maildir/';
  console.log('inside import enron');
  const path = './../enron_mail_20150507/maildir/';
  new EnronDataSet(path)
    .importAccounts(req.body.filter)
    .then(()=>{
      res.status(200).send();
  });
}

exports.importEnronDataAll = (req, res) => {
  const accounts = ['allen-p']; // wildcards
  Promise.each(accounts,a=>{
    return new Promise((resolve, reject)=>{
      request.post('http://localhost:4000/api/import/enron',{form:{filter:a}}, function (err, resp) {
        if (!err && resp.statusCode == 200)
          resolve();
        else
          reject(err);
      });
    });
  })
  .then(()=>{
    res.status(200).send();
  });
}












/**
 * Helper classes for data set import
 * const file = __dirname + "/../../../../enron_mail_20150507/maildir/allen-p/inbox/13_";
 * const f = fs.readFileSync(file).toString();
 * const em = new EnronMail(f).analyze();
 */
class EnronMail {

  lines; /* all lines of file */
  line;  /* cursor is at current line */
  email = {
    from:[],
    to:[],
    cc: [],
    bcc: []
  };

  constructor(file){
    this.lines = file.split('\n')
  }

  setLine(line){
    this.line = line;
    // console.log(line);
  }

  isFromAddress(){
    return this.line.startsWith('From:') && this.line.indexOf('@') != -1 && this.email.from.length == 0
  }

  setFromAddress(i){
    this.concatLinesOfAttr(i).replace('From:','').split(',').forEach((addr) =>{
      if(addr.trim() != '')
        this.email.from.push({address: addr.trim(), name: ''});
    });
  }

  isToAddress(){
    return this.line.startsWith('To:') && this.line.indexOf('@') != -1 && this.email.to.length == 0
  }

  setToAddress(i){
    this.concatLinesOfAttr(i).replace('To:','').split(',').forEach((addr) =>{
      if(addr.trim() != '')
        this.email.to.push({address: addr.trim(), name: ''});
    });
  }

  isCcAddress(){
    return this.line.startsWith('Cc:') && this.line.indexOf('@') != -1 && this.email.cc.length == 0
  }

  setCcAddress(i){
    this.concatLinesOfAttr(i).replace('Cc:','').split(',').forEach((addr) =>{
      if(addr.trim() != '')
        this.email.cc.push({address: addr.trim(), name: ''});
    });
  }

  isBccAddress(){
    return this.line.startsWith('Bcc:') && this.line.indexOf('@') != -1 && this.email.bcc.length == 0
  }

  setBccAddress(i){
    this.concatLinesOfAttr(i).replace('Bcc:','').split(',').forEach((addr) =>{
      if(addr.trim() != '')
        this.email.bcc.push({address: addr.trim(), name: ''});
    });
  }

  isXToAddress(){
    return this.line.startsWith('X-To:') && this.email.to.length > 0
  }

  setXToAddress(i){
    var line = this.concatLinesOfAttr(i).replace('X-To:','');
    this.extractPersonFormXTags(line).forEach((name, i)=>{
      if(this.email.to[i] != undefined)
        this.email.to[i].name = name;
    });
  }

  isXFromAddress(){
    return this.line.startsWith('X-From:') && this.email.from.length > 0
  }

  setXFromAddress(i){
    var line = this.concatLinesOfAttr(i).replace('X-From:','');
    this.extractPersonFormXTags(line).forEach((name, i)=>{
      if(this.email.from[i] != undefined)
        this.email.from[i].name = name;
    });
  }

  isXCcAddress(){
    return this.line.startsWith('X-cc:') && this.email.cc.length > 0
  }

  setXCcAddress(i){
    var line = this.concatLinesOfAttr(i).replace('X-cc:','');
    this.extractPersonFormXTags(line).forEach((name, i)=>{
      if(this.email.cc[i] != undefined)
        this.email.cc[i].name = name;
    });
  }

  isXBccAddress(){
    return this.line.startsWith('X-bcc:') && this.email.bcc.length > 0
  }

  setXBccAddress(i){
    var line = this.concatLinesOfAttr(i).replace('X-bcc:','');
    this.extractPersonFormXTags(line).forEach((name, i)=>{
      if(this.email.bcc[i] != undefined)
        this.email.bcc[i].name = name;
    });
  }


  isSubject(){
    return this.line.startsWith('Subject:') && this.email.subject == undefined;
  }

  setSubject(i){
    this.email.subject = this.concatLinesOfAttr(i).replace('Subject:','').trim();
  }

  isDate(){
    return this.line.startsWith('Date:') && this.email.date == undefined;
  }

  setDate(){
    this.email.date = new Date(this.line.replace('Date:',''));
  }

  isMessageId(){
    return this.line.startsWith('Message-ID:') && this.email.messageId == undefined;
  }

  setMessageId(){
    this.email.messageId = this.line.replace('Message-ID:','').trim().replace('<','').replace('>','');
  }

  isBody(i){
    return i>1 && this.lines[i-1].indexOf('X-FileName:') != -1;
  }

  setBody(i){
    let body ='';
    for(let j=i; j<this.lines.length; j++){
      body += this.lines[j]+'\n';
    }
    this.email.text = body;
  }

  concatLinesOfAttr(i){
    let cl = this.lines[i++];
    while(this.lines[i].indexOf(':')==-1)
      cl += this.lines[i++];
    return cl;
  }

  extractPersonFormXTags(xTagStr){
    let ps = [];
    let str = xTagStr.replace(/(\<.*?\>)/gi,'|').replace(/([\w.]+@[\w.]+)/gi, '|');
    if(str == xTagStr)
      str = str.replace(/,/gi, '|');
    str.split('|').forEach((p)=>{
      p = p.replace(/,/g,'').replace(/"/gi,'').trim();
      //TODO remove this cut function
      if(p.length>60 && p.split(' ').length>1)
        p = p.split(' ').splice(0,1);
      if(p != '' && p != "'")
        ps.push(p);
    });
    return ps;
  }

  analyze(){
    this.lines.forEach((line, i)=> {
      this.setLine(line);
      if(this.isFromAddress())
        this.setFromAddress(i);
      if(this.isXFromAddress())
        this.setXFromAddress(i);
      if(this.isToAddress())
        this.setToAddress(i);
      if(this.isXToAddress())
        this.setXToAddress(i);
      if(this.isCcAddress())
        this.setCcAddress(i);
      if(this.isXCcAddress())
        this.setXCcAddress(i);
      if(this.isBccAddress())
        this.setBccAddress(i);
      if(this.isXBccAddress())
        this.setXBccAddress(i);
      if(this.isSubject())
        this.setSubject(i);
      if(this.isDate())
        this.setDate();
      if(this.isMessageId())
        this.setMessageId();
      if(this.isBody(i))
        this.setBody(i);
    });

    // console.log(this.email);
    return this.email;
  }
}

class EnronDataSet{

  /** path to the enron data set */
  basePath;

  /** counter of imported accounts and emails in mongodb */
  mailCount = 0;
  accountCount = 0;
  start = new Date();

  /** Email Threads */
  mailThreats = new MailThreads();

  /**
   * @param path need to end with '/'
   */
  constructor(path){
    this.basePath = path;
  }

  importAccounts(filter){
    return Promise.each(this.getDirectoriesSync(this.basePath), account=>{
      if(account.startsWith(filter))
        return this.importAccount(account);
      else
        return Promise.resolve();
    });
  }

  importAccount(accountName){
    this.mailThreats = new MailThreads();
    return this.createUser(accountName)
      .then((userId)=>{
        return this.importMails(this.basePath+accountName+'/', userId, []);
      })
      .then(()=>{
        this.mailThreats.mergeMailsToThreads();
        return this.mailThreats.persistMailThreads();
      });
  }

  createUser(accountName){
    return new Promise((resolve,reject)=>{
      const user = new User({
        username: accountName,
        email: accountName+'@enron.com', //TODO this email should match with the send email addresses of the user
        password: '1234'
      });
      user.save((err)=> {
        if (err) {
          console.log(err);
          reject(err);
        }else{
          this.accountCount++;
          resolve(user._id);
        }
      });
    })
  }

  /**
   * @param path need ending '/'
   * @param user from mongodb
   */
  importMails(path, userId, labels){
    //console.log('EnronMail Import: '+path.replace(this.basePath,''));
    return Promise.each(fs.readdirSync(path), fileName=>{
      if(fs.statSync(path+"/"+fileName).isDirectory()) {
        labels.push(fileName.replace(/_/g,' '));
        return this.importMails(path+fileName+'/', userId, labels);
      }else{
        return this.createEmail(path+fileName, userId, labels);
      }
    });
  }

  createEmail(file, userId, labels){
    return this.readFile(file)
      .then((file)=>{
        const e = new Email(new EnronMail(file).analyze());
        e.user = ObjectId(userId);
        e.labels = labels;
        return e.save()
      }).then(e=>{
        this.mailThreats.addSubject(e.subject, e._id);
        this.mailCount++
        this.debugInfo();
      })
      .catch(err=>{
        console.log(err);
      });
  }

  readFile(filePath){
    return new Promise((resolve, reject)=> {
      fs.readFile(filePath, function (err, file) {
        if (err)
          reject(err);
        else
          resolve(file.toString());
      });
    });
  }

  debugInfo(){
    if(this.mailCount%100 == 0)
      console.log(this.mailCount + ' Mails imported  |  '+this.accountCount+ ' Accounts imported  |  '+moment(moment(new Date()).diff(moment(this.start))).format('m:ss'));
  }

  getDirectoriesSync(path){
    return fs.readdirSync(path).filter(f => fs.statSync(path+"/"+f).isDirectory());
  }

  getFilesSync(path){
    return fs.readdirSync(path).filter(f => fs.statSync(path+"/"+f).isFile());
  }

}


class MailThreads{

  /** contains all subjects as key and maps
   *  an array with related emailIds */
  subjects = new Map();

  /** adds a subject to the subject map */
  addSubject(subject, emailId){
    /** invert subject to reduce number of compare
     *  operations to merge mails to threads*/
    let rsubject = subject.split('').reverse().join('');
    if(this.subjects.has(rsubject)){
      let ids = this.subjects.get(rsubject);
      ids.push(emailId);
      this.subjects.set(rsubject, ids);
    }else{
      this.subjects.set(rsubject, [emailId]);
    }
  }

  /** Merge mails to threads based on their subjects */
  mergeMailsToThreads(){

    /** flatten list of map used to sort */
    let list =  [];
    for (var [key, value] of this.subjects)
      list.push(key);

    /** sort to reduce number of compare
     *  operations due to lexical ordering
     *  works only due to permuted subjects characters*/
    list.sort();

    /** find matches
     *  the shorter subject need to be included in the longer one*/
    for(let i=0; i<list.length; i++){
      for(let j=i+1; j<list.length; j++){
        if(list[j] != '' && list[i] != '' && list[j].includes(list[i]) && this.subjects.has(list[j]) && this.subjects.has(list[i])){
          /** merge to shorter subject */
          let ids = this.subjects.get(list[i]);
          ids =ids.concat(this.subjects.get(list[j]));
          this.subjects.set(list[i], ids);
          this.subjects.delete(list[j]);
        }else{
          break;
        }
      }
    }
  }

  persistMailThreads(){
    let result = Promise.resolve();
    for (var [key, emailIds] of this.subjects) {
      let thrId = 'thr_'+emailIds[0];
      let eIds = emailIds;
      result = result.then(() => {
        return new Promise((resolve, reject)=>{
          Email.update({_id: {$in: eIds}}, {$set: {thrid: thrId}},{multi:true}, function(err){
            if(err)
              reject(err);
            else
              resolve();
          });
        });
      });
    }
    return result;
  }
}
