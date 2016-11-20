import {
  Strategy as TrelloStrategy
} from 'passport-trello';
import config from '../env';

function verifyTrello(req, token, tokenSecret, profile, done) {
  // TODO
}

export function trelloAuthentication(passport) {
  passport.use(new TrelloStrategy({
      consumerKey: config.oauth.trello.consumerKey,
      consumerSecret: config.oauth.trello.consumerSecret,
      callbackURL: config.oauth.google.callbackURL,
      passReqToCallback: true,
      trelloParams: {
        scope: 'read,write',
        name: config.oauth.trello.appName,
        expiration: 'never'
      }
    },
    verifyTrello
  ));
}
