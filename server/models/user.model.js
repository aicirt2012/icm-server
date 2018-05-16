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

const provider = {
  GMAIL: 'Gmail',
  EXCHANGE: 'Exchange'
}

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, index: true, unique: true},
  email: {type: String, unique: true, sparse: true}, //TODO check if can be removed
  password: { type: String, required: true },
  provider: { type: String, enum: [provider.GMAIL, provider.EXCHANGE], default: provider.GMAIL},
  // TODO refactor these provider. Put them inside taskProviders
  trello: {
    trelloAccessTokenSecret: String,
    trelloAccessToken: String,
    trelloId: String,
    userEmail: String
  },
  sociocortex: {
    email: String,
    password: String
  },
  emailProvider: {
    gmail: {
      user: String,
      password: String,
      host: { type: String, default: 'imap.gmail.com' },
      port: { type: Number, default: 993 },
      smtpHost: { type: String, default: 'smtp.gmail.com' },
      smtpPort: { type: Number, default: 465 },
      smtpDomains: { type: [String], default: ['gmail.com', 'googlemail.com'] },
      highestmodseq: String,
      googleId: String,
      googleAccessToken: String,
      googleRefreshToken: String
    },
    exchange: {
      user: String,
      password: String,
      host: { type: String, default: 'xmail.mwn.de' },
    }
  },
  // TODO put providers here
  taskProviders: {
    trello: {
      isEnabled: { type: Boolean, default: false },
      trelloAccessTokenSecret: String,
      trelloAccessToken: String,
      trelloId: String,
      registrationEmail: String,
      registrationStarted: Date
    },
    sociocortex: {
      isEnabled: { type: Boolean, default: false },
      email: String,
      password: String
    },
  },
  contactProvider: {
    socioCortex: {
      isEnabled: { type: Boolean, default: false },
      email: String,
      password: String,
      baseURL: {type: String, default: 'https://wwwmatthes.in.tum.de/api/v1'},
    }
  },
  displayName: String,
  lastSync: { type: Date, default: null }
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
  createIMAPConnector: function () {
    if(this.isGMailProvider()){
      return new GmailConnector(this);
    }else if(this.isExchangeProvider()){
      return new EWSConnector(this);
    }else{
      throw new Error('EMail provider not defined!');
    }
  },
  createSMTPConnector: function () {
    if(this.isGMailProvider()){
      return new SMTPConnector(this);
    }else{
      throw new Error("SMTP provider not specified!");
    }
  },
  isExchangeProvider() {
    return this.provider === provider.EXCHANGE;
  },
  isGMailProvider() {
    return this.provider === provider.GMAIL;
  }
});

UserSchema.plugin(mongoosePaginate);

UserSchema.statics.removeById = (userId) => {
  return Contact.removeByUserId(userId)
    .then(() => {
      return Pattern.removeByUserId(userId);
    })
    .then(() => {
      return TrainingData.removeByUserId(userId);
    })
    .then(() => {
      return Task.removeByUserId(userId);
    })
    .then(() => {
      return Attachment.removeByUserId(userId);
    })
    .then(() => {
      return Email.removeByUserId(userId);
    })
    .then(() => {
      return Box.removeByUserId(userId);
    });
}

let User = mongoose.model('User', UserSchema);
export default User;
