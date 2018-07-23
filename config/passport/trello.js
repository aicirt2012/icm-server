import {Strategy as TrelloStrategy} from 'passport-trello';
import config from '../env';
import User from '../../server/models/user.model';
import TrelloService from "../../server/core/task/trello.service";

function verifyTrello(req, token, tokenSecret, profile, done) {
  User.findOne({
    'taskProviders.trello.isEnabled': false,
    'taskProviders.trello.registrationEmail': profile.emails[0].value
  }, (err, user) => {
    if (err) {
      return done(err);
    }
    if (!user) {
      //TODO logic from when icm login was possible through trello, can probably be removed
      user = new User();
      user.trello = {
        trelloId: profile.id,
        trelloAccessToken: token,
        trelloAccessTokenSecret: tokenSecret,
        userEmail: ""
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
      new TrelloService(user)
        .setup({token: token})
        .then(user => {
          return done(null, user);
        }).catch(err => {
        return done(err);
      });
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
