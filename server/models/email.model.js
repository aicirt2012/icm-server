import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
import Promise from 'bluebird';
import Box from './box.model';
import config from '../../config/env';
import _ from 'lodash';

const ObjectId = mongoose.Schema.Types.ObjectId;
const Mixed = mongoose.Schema.Types.Mixed;


const EmailSchema = new mongoose.Schema({
  user: {type: ObjectId, ref: 'User'},
  messageId: {type: String, index: true},
  ewsItemId: {type: String, index: true},
  ewsChangeKey: {type: String, index: true},
  uid: Number,
  // TODO Delete box, use array of Boxes
  box: {type: ObjectId, ref: 'Box'},
  boxes: [{type: ObjectId, ref: 'Box'}],
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
  // TODO review why you got _id here
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
  date: {type: Date, index: true},
  flags: [String],
  labels: [String],
  attachments: [{type: ObjectId, ref: 'Attachment'}],
  /// isInTrash: Boolean,
  inTrashbox: {type: ObjectId, ref: 'Box'},
}, {
  timestamps: true
});


EmailSchema.pre('findOneAndUpdate', function (next) {
  Box.findOne({name: config.gmail.deleted, user: this._update.user})
    .then((trashBox) => {

      if (trashBox) {

        let trashBoxId = null;

        // if the trashbox is in the email's boxes, filter it
        for (let i = 0, n = this._update.boxes.length; i < n; i++) {
          if (this._update.boxes[i].toString() === trashBox._id.toString()) {
            trashBoxId = trashBox._id;
            break;
          }
        }

        // NOTE: I need the trashbox ID when making the email light
        this._update.inTrashbox = trashBoxId;
      } else {

        // for exchange
        this._update.inTrashbox = null;
      }

      next();

    })
    .catch(err => {
      console.log(err);
      next();
    });
});


EmailSchema.virtual('timestamp').get(function () {
  return this.date !== null ? this.date.getTime() : null;
});

EmailSchema.plugin(mongoosePaginate);

EmailSchema.index({
  text: 'text',
  subject: 'text'
});

EmailSchema.statics.isUnseen = (email) => {
  return email.flags.indexOf("\\Seen") == -1;
}

EmailSchema.statics.isSeenUnseenChanged = (emailOld, emailNew) => {
  return emailOld.flags != null && emailNew.flags != null
    && Email.isUnseen(emailOld) != Email.isUnseen(emailNew);
}


/**
 * Updates or creates an email and
 * returns the old- and updated email
 * @param email
 * @return Promise resolve([oldMail, oldBox, updatedMail, , updatedBox])
 */
EmailSchema.statics.updateAndGetOldAndUpdated = (mail) => {
  return new Promise((resolve, reject) => {
    const res = [];
    Email.findOne({messageId: mail.messageId})
      .then(emailOld => {
        res.push(emailOld);
        return emailOld != null ? Box.findWithUnseenCountById(emailOld.boxes[0]) : Box.findOne({_id: mail.boxes[0]});
      })
      .then(boxOld => {
        res.push(boxOld);
        return Email.findOneAndUpdate({
          messageId: mail.messageId
        }, mail, {
          new: true, // returns new doc
          upsert: true,
          setDefaultsOnInsert: true
        });
      })
      .then(emailUpdated => {
        res.push(emailUpdated);
        return emailUpdated != null ? Box.findWithUnseenCountById(emailUpdated.boxes[0]) : Promise.resolve(null);
      })
      .then(boxUpdated => {
        res.push(boxUpdated);
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
  });
}


/**
 * Returns autocomplete suggestions for email addresses
 * @param userId only consider emails of this user
 */
EmailSchema.statics.autocomplete = (userId) => {
  return Email.getCollection('emails').aggregate([
    {$match: {user: userId}},
    {$project: {address: {$setUnion: ["$from", "$to", "$cc", "$bcc"]}}},
    {$unwind: '$address'},
    {$group: {_id: {address: {$toLower: '$address.address'}, name: '$address.name'}}},
    {$project: {_id: 0, address: '$_id.address', name: '$_id.name'}},
    //{$match: {$or:[{address: /+search+/},{address: /fe/}]}} //TODO add vars
  ]);
}


/**
 * Reduce email size by choosing only necessary attributes
 * @param email
 */
EmailSchema.statics.lightEmail = (email) => {
  return {
    _id: email._id,
    box: email.box,
    boxes: email.inTrashbox !== null ? [email.inTrashbox] : email.boxes,
    from: email.from,
    date: email.date,
    timestamp: email.timestamp,
    subject: email.subject,
    flags: email.flags,
    text: email.text ? email.text.substring(0, 70) : null
  }
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
  const lastEmailDate = new Date(opt.lastEmailDate);
  const query = {user: new mongoose.Types.ObjectId(userId), date: {$lt: lastEmailDate}};

  // list only parameters you want to show in UI
  const select = {
    box: 1, boxes: 1, from: 1, date: 1, subject: 1,
    text: {$substrCP: ["$text", 0, 70]}, flags: 1,
    inTrashbox: 1,
    timestamp: {$subtract: ["$date", new Date("1970-01-01")]}
  };

  if (boxId !== 'NONE' && boxId !== '0') {
    query.boxes = {$in: [new mongoose.Types.ObjectId(boxId)]};
  }

  if (search != null && search != '') {
    // von:"mySubject" searchTerm
    // von: "mySubject" searchTerm
    // from:"mySubject" searchTerm
    // from: "mySubject" searchTerm
    // an:"mySubject" searchTerm
    // an: "mySubject" searchTerm
    // to:"mySubject" searchTerm
    // to: "mySubject" searchTerm
    const parsedSearch = search.match(/(\bfrom\b|\bvon\b|\bto\b|\ban\b): ?"([a-zA-Z\u00C0-\u017F0-9 ]*)"([a-zA-Z\u00C0-\u017F0-9 ]*)/);

    if (parsedSearch !== null) {
      const from = (parsedSearch[1] == 'from' || parsedSearch[1] == 'von') ? parsedSearch[2] : null;
      const to = (parsedSearch[1] == 'to' || parsedSearch[1] == 'an') ? parsedSearch[2] : null;
      const searchTerm = parsedSearch[3];

      if (from != null)
        query['from.name'] = new RegExp('.*' + from + '.*', "i")
      if (to != null)
        query['to.name'] = new RegExp('.*' + to + '.*', "i")
      if (searchTerm != null && searchTerm != ' ' && searchTerm != '')
        query.$text = {$search: searchTerm};
    } else {
      query.$text = {$search: search};
    }
  }

  return Email.aggregate([
    {$match: query},
    {$project: select},
    {$sort: {date: sort == 'DESC' ? -1 : 1}},
    {$limit: 15}
  ]);
}

EmailSchema.statics.filterNonTrash = (user, boxId, emails) => {
  return new Promise((resolve, reject) => {

    if (boxId !== 'NONE' && boxId !== '0') {
      Box.findOne({_id: boxId})
        .then((box) => {

          // if it is the trashBox just send emails else filter the ones not with trash label
          if (box.shortName === 'Trash') {
            resolve(emails);
          } else {
            resolve(emails.filter(e => e.inTrashbox === null));
          }

        })
        .catch(err => {
          reject(err);
        });

    } else { // it is a search
      resolve(emails)
    }

  });
}

EmailSchema.statics.removeByUserId = (userId) => {
  return Email.find({user:userId}).remove().exec();
}

let Email = mongoose.model('Email', EmailSchema);
export default Email;
