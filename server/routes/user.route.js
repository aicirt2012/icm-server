import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import userCtrl from '../controllers/user.controller';

function routeProvider(passport) {

  const router = express.Router(); // eslint-disable-line new-cap

  router.route('/')
    .get(userCtrl.list)
    .post(userCtrl.create);

  router.route('/:userId')
    .get(userCtrl.get)
    .delete(userCtrl.remove);

  router.param('userId', userCtrl.load);

  return router;
}
export default routeProvider;
