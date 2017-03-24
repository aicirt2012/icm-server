import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../core/error/APIError';
import bcrypt from 'bcrypt';
import mongoosePaginate from 'mongoose-paginate';
import GmailConnector from '../core/mail/GmailConnector';
import SMTPConnector from '../core/mail/SMTPConnector';
import ExchangeConnector from '../core/mail/ExchangeConnector';

const UserSchema = new mongoose.Schema({
  username: {type: String, required: true},
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
  createEmailConnector: function() {
    switch (this.provider.name) {
      case 'gmail': return new GmailConnector(this.imapOptions(), this); break;
      case 'exchange': return new ExchangeConnector(this.imapOptions(), this); break;
      default: return new GmailConnector(this.imapOptions(), this);
    }
  },
  imapOptions: function(){
    return {
      user: this.provider.user,
      password: this.provider.password,
      host: this.provider.host,
      port: this.provider.port,
      tls: true,
      mailbox: 'INBOX'
    };
  },
  createSMTPConnector: function(){
    return new SMTPConnector(this.smtpOptions());
  },
  smtpOptions: function(){
    return {
      host: this.provider.smtpHost,
      port: this.provider.smtpPort,
      secure: true,
      domains: this.provider.smtpDomains,
      auth: {
        user: this.provider.user,
        pass: this.provider.password
      },
      currentUser: this
    };
  }
});

UserSchema.plugin(mongoosePaginate);

export default mongoose.model('User', UserSchema);
