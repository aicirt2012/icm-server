import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
import Promise from 'bluebird';
import Box from './box.model';
const ObjectId = mongoose.Schema.Types.ObjectId;
const Mixed = mongoose.Schema.Types.Mixed;


const EmailSchema = new mongoose.Schema({
  user: {type: ObjectId, ref: 'User'},
  messageId: String,
  uid: Number,
  box: {type: ObjectId, ref: 'Box'},
  thrid: String,
  attrs: {
    'x-gm-thrid': String,
    'x-gm-msgid': String,
    modseq: String,
    uid: Number,
    flags: [String],
    date: Date,
    struct: Mixed,
    /*[{
     language: mongoose.Schema.Types.Mixed,
     disposition: mongoose.Schema.Types.Mixed,
     md5: mongoose.Schema.Types.Mixed,
     lines: Number,
     size: Number,
     encoding: String,
     description: mongoose.Schema.Types.Mixed,
     id: mongoose.Schema.Types.Mixed,
     params: mongoose.Schema.Types.Mixed,
     subtype: String,
     type: String,
     partID: String,
     }]*/
    'x-gm-labels': [String]
  },
  from: [{
    address: String,
    name: String
  }],
  to: [{
    address: String,
    name: String
  }],
  cc: [{
    address: String,
    name: String
  }],
  bcc: [{
    address: String,
    name: String
  }],
  subject: String,
  html: String,
  text: String,
  date: Date,
  flags: [String],
  labels: [String]
}, {
  timestamps: true
});

EmailSchema.plugin(mongoosePaginate);
// TODO: add index for To and From
EmailSchema.index({
  text: 'text',
  subject: 'text'
});



EmailSchema.statics.isUnseen = (email)=>{
  return email.flags.indexOf("\\Seen") == -1;
}

EmailSchema.statics.isSeenUnseenChanged = (emailOld, emailNew)=>{
  return emailOld.flags != null && emailNew.flags != null 
    && Email.isUnseen(emailOld) != Email.isUnseen(emailNew);
}



/**
 * Updates or creates an email and 
 * returns the old- and updated email
 * @param email 
 * @return Promise resolve([oldMail, oldBox, updatedMail, , updatedBox])
 */
EmailSchema.statics.updateAndGetOldAndUpdated = (mail)=>{
  return new Promise((resolve, reject) => {
    const res = [];
    Email.findOne({messageId: mail.messageId})
      .then(emailOld => {  
        res.push(emailOld);
        return emailOld!=null ? Box.findWithUnseenCountById(emailOld.box) : Promise.resolve(null);
      })
      .then(boxOld =>{
        res.push(boxOld);
        return Email.findOneAndUpdate({
          messageId: mail.messageId
        }, mail, {
          new: true, // returns new doc
          upsert: true,
          setDefaultsOnInsert: true
        });
      })
      .then(emailUpdated =>{     
        res.push(emailUpdated);
        return emailUpdated!=null ? Box.findWithUnseenCountById(emailUpdated.box) : Promise.resolve(null);  
      })
      .then(boxUpdated =>{
        res.push(boxUpdated);
        resolve(res);  
      })   
      .catch(err=>{
        reject(err);
      });
  });
} 

let Email = mongoose.model('Email', EmailSchema)
export default Email;
