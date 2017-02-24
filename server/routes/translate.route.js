import express from 'express';
import translationCtrl from '../controllers/translation.controller';

function routeProvider(passport) {
  const router = express.Router();
  const mw = passport.authenticate('jwt', {
    session: false
  });

  router.use(mw);

  /** GET /api/translation/translate - Protected route */
  router.route('/')
      .get(translationCtrl.translate);

  return router;
}

export default routeProvider;
