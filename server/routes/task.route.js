import express from 'express';
import taskCtrl from '../controllers/task.controller';

function routeProvider(passport) {
  const router = express.Router();
  const mw = passport.authenticate('jwt', {
    session: false
  });
  router.use(mw);

  /** GET /api/task/search - Protected route */
  router.route('/search')
    .get(taskCtrl.taskSearch);

  /** GET, POST /api/task/ - Protected route */
  router.route('')
    .get(taskCtrl.taskGetAll);

  /** GET, PUT, DELETE /api/task/:idTask - Protected route */
  router.route('/:idTask')
    .get(taskCtrl.taskGet)
    .put(taskCtrl.taskUpdate)
    .delete(taskCtrl.taskDelete);

  router.route('/sociocortex/register')
    .post(taskCtrl.registerSociocortex);
  router.route('/sociocortex/get')
    .get(taskCtrl.getMeSociocortex);
  /* Task routes related to emails */
  router.route('/email/:emailId/addTask')
    .post(taskCtrl.taskCreate);

  return router;
}

export default routeProvider;
