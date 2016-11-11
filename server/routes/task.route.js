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
  /* needs token returned by the above  */
  router.route('/callback')
    .get(taskCtrl.getTrelloCallback);

  router.route('/search')
    .get(taskCtrl.getTrelloSearch);

  return router;
}

export default routeProvider;
