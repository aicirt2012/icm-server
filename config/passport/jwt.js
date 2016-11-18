import {Strategy as JwtStrategy, ExtractJwt} from 'passport-jwt';
import User from '../../server/models/user.model';
import config from '../env';

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeader(),
    secretOrKey: config.jwt.secret
};

function verifyJwt(jwtPayload, done) {
    User.findOne({_id: jwtPayload.user._id}, (err, user) => {
        if (err) {
            return done(err, user);
        }
        if (user) {
            done(null, user);
        } else {
            done(null, false);
            // or you could create a new account
        }
    });
}

export function jwtAuthentication(passport) {
    passport.use(new JwtStrategy(opts, verifyJwt));
};
