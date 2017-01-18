import express from 'express';
import patternCtrl from '../controllers/pattern.controller';

function routeProvider(passport) {
  const router = express.Router();
  const mw = passport.authenticate('jwt', {
    session: false
  });
  router.use(mw);

  /** GET, PUT, DELETE /api/pattern/:patternId - Protected route */
  router.route('/:patternId')
    .get(patternCtrl.getSinglePattern)
    .put(patternCtrl.updatePattern)
    .delete(patternCtrl.deletePattern);

  /** POST, GET /api/pattern - Protected route */
  router.route('/')
    .post(patternCtrl.createPattern)
    .get(patternCtrl.getAllPatterns);

  return router;
}

export default routeProvider;
