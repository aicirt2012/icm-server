import fs from "fs";
import Email from '../models/email.model';
import User from '../models/user.model';

/** This controller is only of importing the
 * ENRON Mail Corpus to the mongoDB for analytic purpose
 * https://www.cs.cmu.edu/~./enron/ */

function post(req, res){

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
      xTagStr.replace(/(\<.*?\>)/gi,'|').split('|').forEach((p)=>{
        p =  p.replace(/,/g,'').trim();
        if(p != '')
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

    /** counter of imported emails in mongodb */
    mailCount = 0;

    /**
     * @param path need to end with '/'
     */
    constructor(path){
      this.basePath = path;
    }

    importAccounts(){
      var result = Promise.resolve();
      this.getDirectoriesSync(this.basePath).forEach((account)=>{
        result = result.then(() => {
         // if(account.startsWith('a'))
            return this.importAccount(account);
        });

      });
      return result;
    }

    importAccount(accountName){
      let user = new User({
        username: accountName,
        email: accountName+'@enron.com', //TODO this email should match with the send email addresses of the user
        password: '1234'
      });

      return user.save((err)=> {
        if (err)
          console.log(err);
        return this.importMails(this.basePath+accountName+'/' );
      });
    }

    /**
     * @param path need ending '/'
     * @param user from mongodb
     */
    importMails(path, user){
      //console.log('EnronMail Import: '+path.replace(this.basePath,''));
      let p = [];
      this.getFilesSync(path).forEach((fileName)=>{
        const file = fs.readFileSync(path+fileName).toString();
        const em = new EnronMail(file).analyze();
        let e = new Email(em)
        e = e.save((err)=>{
          if (err)
            console.log(err);
          else
            console.log(this.mailCount++ + 'Mails imported');
        })
        p.push(e);
      });
      this.getDirectoriesSync(path).forEach((dir)=>{
        this.importMails(path+dir+'/', user);
      });
      return Promise.all(p);
    }


    getDirectoriesSync(path){
      return fs.readdirSync(path).filter(f => fs.statSync(path+"/"+f).isDirectory());
    }

    getFilesSync(path){
      return fs.readdirSync(path).filter(f => fs.statSync(path+"/"+f).isFile());
    }

  }

  const path = __dirname + '/../../../../enron_mail_20150507/maildir/';
  new EnronDataSet(path)
    .importAccounts()
    .then(()=>{
      res.status(200).send();
    });



  /*
  const file = __dirname + "/../../../../enron_mail_20150507/maildir/allen-p/inbox/13_";
  const f = fs.readFileSync(file).toString();
  const em = new EnronMail(f).analyze();
  */

}






export default {
  post
};
