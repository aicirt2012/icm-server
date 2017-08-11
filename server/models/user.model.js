import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import mongoosePaginate from 'mongoose-paginate';
import GmailConnector from '../core/mail/GmailConnector';
import SMTPConnector from '../core/mail/SMTPConnector';
import EWSConnector from '../core/mail/EWSConnector';

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

export default mongoose.model('User', UserSchema);
