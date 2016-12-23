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
  router.route('/box')
    .post(emailCtrl.syncMails);

  router.route('/init')
    .get(emailCtrl.getInitialImapStatus);

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

  router.route('/copy')
    .post(emailCtrl.copy);

  router.route('/send')
    .post(emailCtrl.sendEmail);

  router.route('/addFlags')
    .post(emailCtrl.addFlags);

  router.route('/delFlags')
    .post(emailCtrl.delFlags);

  router.route('/setFlags')
    .post(emailCtrl.setFlags);

  /* MongoDB API Endpoints */
  router.route('/')
    .get(emailCtrl.getPaginatedEmails);
  router.route('/search')
    .get(emailCtrl.searchPaginatedEmails);
  router.route('/single/:id')
    .get(emailCtrl.getSingleMail);

  return router;
}

export default routeProvider;
