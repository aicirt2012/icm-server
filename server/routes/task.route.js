import express from 'express';
import config from '../../config/env';
import taskCtrl from '../controllers/task.controller';

function routeProvider(passport) {
  const router = express.Router();
  const mw = passport.authenticate('jwt', {
    session: false
  });
  router.use(mw);

  router.route('/board')
    .get(taskCtrl.getTrelloBoard);
  return router;
}

export default routeProvider;
