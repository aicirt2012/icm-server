import express from 'express';
import taskCtrl from '../controllers/task.controller';

const router = express.Router();

/** GET /api/task - Protected route */
router.route('/login')
  .get(taskCtrl.getTrelloLogin);
/* needs token returned by the above  */
router.route('/callback')
  .get(taskCtrl.getTrelloCallback);

router.route('/search')
  .get(taskCtrl.getTrelloSearch);

export default router;
