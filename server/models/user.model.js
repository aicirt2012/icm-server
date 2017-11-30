import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import mongoosePaginate from 'mongoose-paginate';
import GmailConnector from '../core/mail/GmailConnector';
import SMTPConnector from '../core/mail/SMTPConnector';
import EWSConnector from '../core/mail/EWSConnector';
import Attachment from './attachment.model';
import Box from './box.model';
import Contact from './contact.model';
import Email from './email.model';
import Pattern from './pattern.model';
import Task from './task.model';
import TrainingData from './trainingData.model';

const UserSchema = new mongoose.Schema({
  username: {type: String, required: true, index: true},
  email: String,
  password: {type: String, required: true},
  provider: {
    name: String,
    user: String,
    password: String,
    host: String,
    port: Number,
    smtpHost: String,
    smtpPort: Number,
    smtpDomains: [String]
  },
  highestmodseq: String,
  google: {
    googleAccessToken: String,
    googleId: String
  },
  trello: {
    trelloAccessTokenSecret: String,
    trelloAccessToken: String,
    trelloId: String
  },
  sociocortex: {
    email: String,
    password: String
  },
  //  TODO like below for task providers
  contactProvider:{
    socioCortex:{
      isEnabled: {type: Boolean, default: false},
      email: String,
      password: String,
      baseURL: String
    }
  },
  displayName: String,
  lastSync: {type: Date, default: null}
}, {
  timestamps: true
});

UserSchema.pre('save', function (next) {
  let user = this;
  if (!user.isModified('password')) return next();

  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

UserSchema.method({
  comparePassword: function (password, cb) {
    bcrypt.compare(password, this.password, (err, isMatch) => {
      if (err) {
        return cb(err);
      }
      cb(null, isMatch);
    });
  },
  createIMAPConnector: function() {
    const imapOptions = {
      user: this.provider.user,
      password: this.provider.password,
      host: this.provider.host,
      port: this.provider.port,
      tls: true,
      mailbox: 'INBOX'
    };
    switch (this.provider.name) {
      case 'Gmail': return new GmailConnector(imapOptions, this); break;
      case 'Exchange': return new EWSConnector(imapOptions, this); break;
      default: return new GmailConnector(imapOptions, this);
    }
  },
  createSMTPConnector: function(){
    return new SMTPConnector({
      host: this.provider.smtpHost,
      port: this.provider.smtpPort,
      secure: true,
      domains: this.provider.smtpDomains,
      auth: {
        user: this.provider.user,
        pass: this.provider.password
      },
      currentUser: this
    });
  }
});

UserSchema.plugin(mongoosePaginate);

UserSchema.statics.removeById = (userId) => {
  return Contact.removeByUserId(userId)
    .then(()=>{
      return Pattern.removeByUserId(userId);
    })
    .then(()=>{
      return TrainingData.removeByUserId(userId);
    })
    .then(()=>{
      return Task.removeByUserId(userId);
    })
    .then(()=>{
      return Attachment.removeByUserId(userId);
    })
    .then(()=>{
      return Email.removeByUserId(userId);
    })
    .then(()=>{
      return Box.removeByUserId(userId);
    });
}

let User = mongoose.model('User', UserSchema);
export default User;
