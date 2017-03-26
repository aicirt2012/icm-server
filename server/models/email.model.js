import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
import Promise from 'bluebird';
import Box from './box.model';
const ObjectId = mongoose.Schema.Types.ObjectId;
const Mixed = mongoose.Schema.Types.Mixed;


const EmailSchema = new mongoose.Schema({
  user: {type: ObjectId, ref: 'User'},
  messageId: {type: String, index: true},
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


/**
 * Returns autocomplete suggestions for email addresses
 * @param userId only consider emails of this user
 */
EmailSchema.statics.autocomplete = (userId)=>{
  return Email.getCollection('emails').aggregate([
    {$match: {user: userId}},
    {$project: {address: {$setUnion: [ "$from", "$to", "$cc", "$bcc"]}}},
    {$unwind: '$address'},
    {$group: {_id: {address:{$toLower:'$address.address'}, name:'$address.name'}}},    
    {$project: {_id: 0, address: '$_id.address', name: '$_id.name'}},
    //{$match: {$or:[{address: /+search+/},{address: /fe/}]}} //TODO add vars
 ]);
}

/**
 * Returns the searched email, this is meant to return also a simple mail list for every box
 * @param userId 
 * @param opt.sort fild that will be used to sort e.g. ASC or DESC
 * @param opt.boxId
 * @param opt.search string to searchs
 * @param opt.lastEmailDate
 */
EmailSchema.statics.search = (userId, opt) => {

  const boxId = opt.boxId;
  const sort = opt.sort; 
  const search = opt.search;
  const lastEmailDate = opt.lastEmailDate;

  /* default params */
  const query = {
    user: userId,
    date: {$lt: lastEmailDate}
  };
  const select = {}; // only necessary
  const options = {
    limit: 15,
    sort: {
      date: sort == 'DESC' ? -1 : 1
    },
  };

  if (boxId != 'NONE') {
    //console.log('boxId: ' + boxId);
    query.box = boxId;
  }

  if (search != null && search != '') {
    const fromSearch = search.match(/from: ?"([a-zA-Z0-9 ]*)"([a-zA-Z0-9 ]*)/);
    //console.log('from search');
    //console.log(fromSearch);
    const from = fromSearch != null ? fromSearch[1] : null;
    const searchTerm = fromSearch != null ? fromSearch[2] : null;

    //console.log(from);
    //console.log(searchTerm);

    if (from != null) {
      query['from.name'] = new RegExp('.*' + from + '.*', "i")
    }

    if (searchTerm != null && searchTerm != ' ' && searchTerm != '') {
      query.$text = {$search: searchTerm};
    }
  }

  // von:max mysubject -> max
  // von: max mysubject -> max
  // from:max mysubject -> max
  // from: max mysubject -> max
  /*
   if (search.includes('von:')) {
   search.splice(' ')
   query.from =
   }
   */

  // an:max mysubject -> max
  // an: max mysubject -> max
  // to:max mysubject -> max

  //console.log('final query');
  //console.log(query);

  return Email.find(query, select, options)
}

let Email = mongoose.model('Email', EmailSchema)
export default Email;
