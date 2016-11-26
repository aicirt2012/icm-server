import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/error/APIError';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    //unique: true,
    //required: true
  },
  password: {
    type: String,
    required: true,
  },
  google: mongoose.Schema.Types.Mixed,
  trello: mongoose.Schema.Types.Mixed,
  sociocortex: mongoose.Schema.Types.Mixed,
  exchange: mongoose.Schema.Types.Mixed,
  displayName: String,
  boxList: [mongoose.Schema.Types.Mixed],
  lastSync: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

UserSchema.pre('save', function(next) {
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
  comparePassword: function(password, cb) {
    bcrypt.compare(password, this.password, (err, isMatch) => {
      if (err) {
        return cb(err);
      }
      cb(null, isMatch);
    });
  }
});


export default mongoose.model('User', UserSchema);
