import {
  OAuth2Strategy as GoogleStrategy
} from 'passport-google-oauth';
import User from '../../server/models/user.model';
import config from '../env';

function verifyGoogle(accessToken, refreshToken, profile, done) {
  User.findOne({
    'google.googleId': profile.id
  }, (err, user) => {
    if (err) {
      return done(err);
    }
    if (!user) {
      user = new User();
      user.google = {
        googleId: profile.id,
        googleAccessToken: accessToken,
        googleRefreshToken: refreshToken
      };
      user.username = profile.displayName;
      user.email = profile.emails[0].value;
      user.password = profile.id;
      user.save((err) => {
        if (err) {
          return done(err);
        }
        return done(null, user)
      });
  } else {
      return done(null, user);
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
