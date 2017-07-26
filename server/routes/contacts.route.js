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

  return router;
}
export default routeProvider;
