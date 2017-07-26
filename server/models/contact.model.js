import mongoose from 'mongoose';
import Promise from 'bluebird';
import config from '../../config/env';
const ObjectId = mongoose.Schema.Types.ObjectId;
mongoose.Promise = Promise;

const ContactSchema = new mongoose.Schema({
  title: {type: String, index: true},
  firstname: {type: String, index: true},
  lastname: {type: String, index: true},
  company: {type: String, index: true},
  department: {type: String, index: true},
  zip: {type: String, index: true},
  city: {type: String, index: true},
  street: {type: String, index: true},
  email: {type: String, index: true},
  phone: {type: String, index: true},
  mobile: {type: String, index: true},
  user: {type: ObjectId, ref: 'User'},
}, {timestamps: true});



let Contact = mongoose.model('Contact', ContactSchema)
export default Contact;
