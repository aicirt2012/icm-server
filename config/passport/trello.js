import {
  Strategy as TrelloStrategy
} from 'passport-trello';
import config from '../env';
import User from '../../server/models/user.model';

function verifyTrello(req, token, tokenSecret, profile, done) {
  User.findOne({
    'trello.trelloId': profile.id
  }, (err, user) => {
    if (err) {
      return done(err);
    }
    if (!user) {
      user = new User();
      user.trello = {
        trelloId: profile.id,
        trelloAccessToken: token,
        trelloAccessTokenSecret: tokenSecret
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

export function trelloAuthentication(passport) {
  passport.use(new TrelloStrategy({
      consumerKey: config.oauth.trello.consumerKey,
      consumerSecret: config.oauth.trello.consumerSecret,
      callbackURL: config.oauth.trello.callbackURL,
      passReqToCallback: true,
      trelloParams: {
        scope: 'read,write,account',
        name: config.oauth.trello.appName,
        expiration: 'never'
      }
    },
    verifyTrello
  ));
}
