import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import userCtrl from '../controllers/user.controller';

function routeProvider(passport) {

  const router = express.Router();

  router.route('/')
    .get(passport.authenticate('jwt', {
      session: false
    }), userCtrl.list)
    .post(userCtrl.create);

  router.route('/:id')
    .get(passport.authenticate('jwt', {
      session: false
    }), userCtrl.get)
    .put(passport.authenticate('jwt', {
      session: false
    }), userCtrl.update)
    .delete(passport.authenticate('jwt', {
      session: false
    }), userCtrl.remove);

  return router;
}
export default routeProvider;
