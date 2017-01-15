import express from 'express';
import taskCtrl from '../controllers/task.controller';

function routeProvider(passport) {
  const router = express.Router();
  const mw = passport.authenticate('jwt', {
    session: false
  });
  router.use(mw);

  /** GET /api/task/search/members - Protected route */
  router.route('/search/members')
    .get(taskCtrl.searchMembers);

  /** GET /api/task/search - Protected route */
  router.route('/search')
    .get(taskCtrl.searchTasks);

  router.route('/cards')
    .post(taskCtrl.searchCardsForMembers);

  router.route('/boards')
    .get(taskCtrl.getAllBoardsForMember);

  router.route('/boards/:boardId/lists')
    .get(taskCtrl.getAllListsForBoard);

  router.route('/lists/:listId/cards')
    .get(taskCtrl.getAllCardsForList);

  /** GET, PUT, DELETE /api/task/:taskId - Protected route */
  router.route('/:taskId')
    .get(taskCtrl.getSingleTask)
    .put(taskCtrl.updateTask)
    .delete(taskCtrl.deleteTask);

  router.route('/:taskId/unlink')
    .put(taskCtrl.unlinkTask);

  router.route('/')
    .post(taskCtrl.createTask);

  router.route('/sociocortex/register')
    .post(taskCtrl.registerSociocortex);
  router.route('/sociocortex/connect')
    .get(taskCtrl.connectSociocortex);

  /* Task routes related to emails */
  router.route('/email/:emailId/addTask')
    .post(taskCtrl.createTask);

  return router;
}

export default routeProvider;
