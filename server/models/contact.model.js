import mongoose from 'mongoose';
import Promise from 'bluebird';
import config from '../../config/env';
const ObjectId = mongoose.Schema.Types.ObjectId;
mongoose.Promise = Promise;

const ContactSchema = new mongoose.Schema({
  title: {type: String, index: true},
  firstName: {type: String, index: true},
  lastName: {type: String, index: true},
  birthday: {type: Date, index: true},
  email: {type: String, index: true},
  email2: {type: String, index: true},
  url: {type: String, index: true},
  www: {type: String, index: true},
  linkedInUrl: {type: String, index: true},
  homeCountry: {type: String, index: true},
  homeState: {type: String, index: true},
  homeStreet: {type: String, index: true},
  homeZip: {type: String, index: true},
  homeCity: {type: String, index: true},
  homePhone: {type: String, index: true},
  homeMobile: {type: String, index: true},
  homeFax: {type: String, index: true},
  businessCompany: {type: String, index: true},
  businessCountry: {type: String, index: true},
  businessState: {type: String, index: true},
  businessZip: {type: String, index: true},
  businessCity: {type: String, index: true},  
  businessStreet: {type: String, index: true},
  businessPhone: {type: String, index: true},
  businessPhoneAssistant: {type: String, index: true},
  businessFax: {type: String, index: true},
  businessDepartment: {type: String, index: true},
  businessJobTitle: {type: String, index: true},
  groups: [{type: String, index: true}],
  provider: {type: String, index: true},
  providerId: {type: String, index: true},  
  user: {type: ObjectId, ref: 'User'},
  syncedAt: Date,
  lastModifiedAt: Date
}, {timestamps: true});

ContactSchema.index({'$**': 'text'},{"weights": { firstName:150, lastName:150 }});

ContactSchema.statics.removeByUserId = (userId) => {
  return Contact.find({user:userId}).remove().exec();
}

let Contact = mongoose.model('Contact', ContactSchema)
export default Contact;
