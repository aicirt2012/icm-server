import express from 'express';
import config from '../../config/env';
import emailCtrl from '../controllers/email.controller';

function routeProvider(passport) {
  const router = express.Router();
  const mw = passport.authenticate('jwt', {
    session: false
  });
  router.use(mw);
  /* IMAP API Endpoints */ 
  router.route('/append')
    .post(emailCtrl.append);

  router.route('/:emailId/move')
    .post(emailCtrl.move);

  router.route('/send')
    .post(emailCtrl.sendEmail);

  router.route('/:emailId/flags')
    .post(emailCtrl.addFlags);

  router.route('/:emailId/flags')
    .delete(emailCtrl.delFlags);

  router.route('/search')
    .get(emailCtrl.searchMails);

  router.route('/:emailId')
    .get(emailCtrl.getSingleMail);

  return router;
}

export default routeProvider;
