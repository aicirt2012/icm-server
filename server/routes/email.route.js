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

router.route('/boxes')
.get(expressJwt({
    secret: config.jwt.secret
  }), emailCtrl.getBoxes);

export default router;
