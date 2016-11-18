import {
  OAuth2Strategy as GoogleStrategy
} from 'passport-google-oauth';
import User from '../../server/models/user.model';
import config from '../env';

// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
function verifyGoogle(accessToken, refreshToken, profile, done) {
  User.find({
    googleId: profile.id
  }, (err, user) => {
    if (err) {
      return done(err);
    }
    if (user.length > 0) {
      return done(null, user[0]);
    } else {
      user = new User();
      user.googleId = profile.id;
      user.username = profile.displayName;
      user.email = profile.emails[0].value;
      user.password = profile.id;
      user.save((err) => {
        if (err) {
          return done(err);
        }
        return done(null, user)
      });
    }
  });
}

export function googleAuthentication(passport) {
  passport.use(new GoogleStrategy({
      clientID: config.oauth.google.clientID,
      clientSecret: config.oauth.google.clientSecret,
      callbackURL: config.oauth.google.callbackURL
    },
    verifyGoogle
  ));
};
