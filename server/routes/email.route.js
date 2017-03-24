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
  router.route('/addBox')
    .post(emailCtrl.addBox);

  router.route('/delBox')
    .post(emailCtrl.delBox);

  router.route('/renameBox')
    .post(emailCtrl.renameBox);

  router.route('/append')
    .post(emailCtrl.append);

  router.route('/move')
    .post(emailCtrl.move);

  router.route('/send')
    .post(emailCtrl.sendEmail);

  router.route('/addFlags')
    .post(emailCtrl.addFlags);

  router.route('/delFlags')
    .post(emailCtrl.delFlags);

  /* MongoDB API Endpoints */
  router.route('/')
    .get(emailCtrl.getPaginatedEmailsForBox);
  router.route('/search')
    .get(emailCtrl.searchPaginatedEmails2);
  router.route('/single/:id')
    .get(emailCtrl.getSingleMail);
  router.route('/box')
    .get(emailCtrl.getBoxes2);
  router.route('/syncAll') // boxes
    .get(emailCtrl.syncViaIMAP2);

  return router;
}

export default routeProvider;
