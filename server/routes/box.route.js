import express from 'express';
import config from '../../config/env';
import boxCtrl from '../controllers/box.controller';

function routeProvider(passport) {
  const router = express.Router();
  const mw = passport.authenticate('jwt', {
    session: false
  });
  router.use(mw);

  router.route('/').get(boxCtrl.getBoxes);
  router.route('/').post(boxCtrl.addBox);
  router.route('/:boxId').delete(boxCtrl.delBox);
  router.route('/:boxId/rename').post(boxCtrl.renameBox);  
  router.route('/syncAll').get(boxCtrl.syncIMAP);

  return router;
}

export default routeProvider;
