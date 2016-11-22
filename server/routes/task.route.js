import express from 'express';
import taskCtrl from '../controllers/task.controller';

function routeProvider(passport) {
  const router = express.Router();
  const mw = passport.authenticate('jwt', {
    session: false
  });
  router.use(mw);

  /** POST /api/task/create - Protected route */
  router.route('/create')
    .post(taskCtrl.postTrelloCreate);

  /** PUT /api/task/update/id - Protected route */
  router.route('/update/*')
    .put(taskCtrl.putTrelloUpdate);

  /** DELETE /api/task/delete/id - Protected route */
  router.route('/delete/*')
    .delete(taskCtrl.deleteTrelloDelete);

  /** GET /api/task/search - Protected route */
  router.route('/search')
    .get(taskCtrl.getTrelloSearch);

  return router;
}

export default routeProvider;
