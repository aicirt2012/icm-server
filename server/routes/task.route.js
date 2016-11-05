import express from 'express';
import expressJwt from 'express-jwt';
import config from '../../config/env';
import taskCtrl from '../controllers/task.controller';

const router = express.Router();

/** GET /api/task - Protected route,
 * needs token returned by the above as header. Authorization: Bearer {token} */
router.route('/board')
  .get(expressJwt({ secret: config.jwt.secret }), taskCtrl.getTrelloBoard);

export default router;
