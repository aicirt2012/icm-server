import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';

const EmailSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  messageId: String,
  uid: Number,
  box: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Box'
  },
  thrid: String,
  attrs: {
    'x-gm-thrid': String,
    'x-gm-msgid': String,
    modseq: String,
    uid: Number,
    flags: [String],
    date: Date,
    struct: mongoose.Schema.Types.Mixed,
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


/**
 * Updates or creates an email and 
 * returns the old- and updated email
 * @param email 
 */
EmailSchema.statics.updateAndGetOldAndUpdated = (email)=>{
  return new Promise((resolve, reject) => {
    Email.findOneAndUpdate({
        messageId: mail.messageId
      }, email, {
        new: false,
        upsert: true,
        setDefaultsOnInsert: true
      })
      .populate('box')
      .exec((err, emailOld) => {
        if (err) {
          reject(err);
        } else {
          Email.findOne({messageId: mail.messageId})
            .populate('box')
            .then(emailUpdated => {
              resolve(emailOld, emailUpdated);
            });
        }
      });
  });
} 

let Email = mongoose.model('Email', EmailSchema)
export default Email;
