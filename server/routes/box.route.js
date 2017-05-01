import express from 'express';
import config from '../../config/env';
import boxCtrl from '../controllers/box.controller';

function routeProvider(passport) {
  const router = express.Router();
  const mw = passport.authenticate('jwt', {
    session: false
  });
  router.use(mw);

  router.route('/addBox')
    .post(boxCtrl.addBox);

  router.route('/delBox')
    .post(boxCtrl.delBox);

  router.route('/renameBox')
    .post(boxCtrl.renameBox);

  router.route('/box')
    .get(boxCtrl.getBoxes);

  return router;
}

export default routeProvider;
