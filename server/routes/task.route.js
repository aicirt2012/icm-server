import express from 'express';
import taskCtrl from '../controllers/task.controller';

function routeProvider(passport) {
  const router = express.Router();
  const mw = passport.authenticate('jwt', {
    session: false
  });
  router.use(mw);

  /** GET /api/task - Protected route */
  router.route('/login')
    .get(taskCtrl.getTrelloLogin);

  router.route('/search')
    .get(taskCtrl.getTrelloSearch);

  router.route('/create/*')
    .post(taskCtrl.postTrelloCreate);

  return router;
}

export default routeProvider;
