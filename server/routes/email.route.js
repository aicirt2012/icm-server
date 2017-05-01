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

  router.route('/addFlags')
    .post(emailCtrl.addFlags);

  router.route('/delFlags')
    .post(emailCtrl.delFlags);

  /* MongoDB API Endpoints */
  router.route('/search')
    .get(emailCtrl.searchMails);

  router.route('/:emailId')
    .get(emailCtrl.getSingleMail);
    
  router.route('/syncAll') // boxes
    .get(emailCtrl.syncIMAP);

  return router;
}

export default routeProvider;
