import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import contactsCtrl from '../controllers/contacts.controller';

function routeProvider(passport) {

  const router = express.Router();

  router.route('/')
    .get(passport.authenticate('jwt', {
      session: false
    }), contactsCtrl.list)

  return router;
}
export default routeProvider;
