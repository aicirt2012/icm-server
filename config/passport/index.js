import {
  jwtAuthentication
} from './jwt';
import {
  googleAuthentication
} from './google';
import {
 trelloAuthentication
} from './trello';

export function config(passport) {
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  jwtAuthentication(passport);
  googleAuthentication(passport);
  trelloAuthentication(passport);

}
