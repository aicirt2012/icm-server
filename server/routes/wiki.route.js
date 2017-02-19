import express from 'express';
import wikiCtrl from '../controllers/wiki.controller';

function routeProvider(passport) {
  const router = express.Router();
  const mw = passport.authenticate('jwt', {
    session: false
  });

  //TODO remove comment below - only for testing purpose
  //router.use(mw);

  /** GET /api/wiki/search - Protected route */
  router.route('/search')
      .get(wikiCtrl.search);

  return router;
}

export default routeProvider;
