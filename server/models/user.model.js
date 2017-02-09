import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../core/error/APIError';
import bcrypt from 'bcrypt';
import mongoosePaginate from 'mongoose-paginate';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
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
    sociocortex: mongoose.Schema.Types.Mixed,
    /* sociocortex: { email: 'adsasdf@dsafdsf.de', password: 'adsfadf'}*/
    displayName: String,
    boxList: [{
        id: Number,
        name: String,
        shortName: String,
        level: Number,
        parent: mongoose.Schema.Types.Mixed,
        unseen: Number,
        new: Number,
        total: Number,
    }, ],
    /*boxList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Box'
    }],*/
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

UserSchema.plugin(mongoosePaginate);

export default mongoose.model('User', UserSchema);