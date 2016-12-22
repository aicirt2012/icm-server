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

  router.route('/boards')
    .get(taskCtrl.getAllBoardsForMember);

  router.route('/boards/:boardId/lists')
    .get(taskCtrl.getAllListsForBoard);

  router.route('/lists/:listId/cards')
    .get(taskCtrl.getAllCardsForList);

  /** GET, PUT, DELETE /api/task/:idTask - Protected route */
  router.route('/:idTask')
    .get(taskCtrl.taskGet)
    .put(taskCtrl.taskUpdate)
    .delete(taskCtrl.taskDelete);

  router.route('/sociocortex/register')
    .post(taskCtrl.registerSociocortex);
  router.route('/sociocortex/connect')
    .get(taskCtrl.connectSociocortex);
  /* Task routes related to emails */
  router.route('/email/:emailId/addTask')
    .post(taskCtrl.taskCreate);

  return router;
}

export default routeProvider;
