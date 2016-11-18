import express from 'express';
import expressJwt from 'express-jwt';
import config from '../../config/env';
import emailCtrl from '../controllers/email.controller';

const router = express.Router();

/** GET /api/email - Protected route,
 * needs token returned by the above as header. Authorization: Bearer {token} */
router.route('/')
  .get(expressJwt({
    secret: config.jwt.secret
  }), emailCtrl.fetchAllMails);

router.route('/box')
  .post(expressJwt({
    secret: config.jwt.secret
  }), emailCtrl.fetchMails);

router.route('/sendBox')
  .get(expressJwt({
    secret: config.jwt.secret
  }), emailCtrl.fetchSendMails);

router.route('/draftBox')
  .get(expressJwt({
    secret: config.jwt.secret
  }), emailCtrl.fetchDraftMails);

router.route('/trashBox')
  .get(expressJwt({
    secret: config.jwt.secret
  }), emailCtrl.fetchDeletedMails);

router.route('/inBox')
  .get(expressJwt({
    secret: config.jwt.secret
  }), emailCtrl.fetchInboxMails);

router.route('/boxes')
  .get(expressJwt({
    secret: config.jwt.secret
  }), emailCtrl.getBoxes);

router.route('/addBox')
  .post(expressJwt({
    secret: config.jwt.secret
  }), emailCtrl.addBox);

router.route('/delBox')
  .post(expressJwt({
    secret: config.jwt.secret
  }), emailCtrl.delBox);

router.route('/renameBox')
  .post(expressJwt({
    secret: config.jwt.secret
  }), emailCtrl.renameBox);

router.route('/append')
  .post(expressJwt({
    secret: config.jwt.secret
  }), emailCtrl.append);

router.route('/move')
  .post(expressJwt({
    secret: config.jwt.secret
  }), emailCtrl.move);

router.route('/copy')
  .post(expressJwt({
    secret: config.jwt.secret
  }), emailCtrl.copy);

router.route('/send')
  .post(expressJwt({
    secret: config.jwt.secret
  }), emailCtrl.sendEmail);

export default router;
