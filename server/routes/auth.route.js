import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import authCtrl from '../controllers/auth.controller';

function routeProvider(passport) {

  const router = express.Router();

  router.route('/login')
    .post(validate(paramValidation.login), authCtrl.login);

  return router;
}
export default routeProvider;
