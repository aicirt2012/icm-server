import express from 'express';
import config from '../../config/env';
import emailCtrl from '../controllers/email.controller';

function routeProvider(passport) {
  const router = express.Router();
  const mw = passport.authenticate('jwt', {
    session: false
  });
  router.use(mw);
  /** GET /api/email - Protected route,
   * needs token returned by the above as header. Authorization: JWT {token} */
  router.route('/box')
    .post(emailCtrl.fetchMails);

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


  return router;
}

export default routeProvider;
