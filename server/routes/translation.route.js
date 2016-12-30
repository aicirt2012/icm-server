import express from 'express';
import translationCtrl from '../controllers/translation.controller';

function routeProvider(passport) {
  const router = express.Router();
  const mw = passport.authenticate('jwt', {
    session: false
  });

  //TODO remove comment below - only for testing purpose
  //router.use(mw);

  /** GET /api/wiki/search - Protected route */
  router.route('/translate')
      .get(translationCtrl.translate);

  return router;
}

export default routeProvider;
