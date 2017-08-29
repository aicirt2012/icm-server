import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import authCtrl from '../controllers/auth.controller';
import userCtrl from '../controllers/user.controller';
import importCtrl from '../controllers/import.controller';
import emailCtrl from '../controllers/email.controller';
import boxCtrl from '../controllers/box.controller';
import attachmentCtrl from '../controllers/attachment.controller';
import taskCtrl from '../controllers/task.controller';
import wikiCtrl from '../controllers/wiki.controller';
import translationCtrl from '../controllers/translation.controller';
import dashboardCtrl from '../controllers/dashboard.controller';
import contactsCtrl from '../controllers/contacts.controller';
import patternCtrl from '../controllers/pattern.controller';


function routeProvider(passport) {
    const router = express.Router();

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////// Unprotected Routes ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /** Authentication Routes unprotected */
    router.route('/auth/login').post(validate(paramValidation.login), authCtrl.login);
    router.route('/auth/google').get(passport.authenticate('google', {scope: ['email', 'profile']}));
    router.route('/auth/google/callback').get(passport.authenticate('google', {failureRedirect: '/login'}), authCtrl.oauthCallback);
    router.route('/auth/trello').get(passport.authenticate('trello', {session: false}));
    router.route('/auth/trello/callback').get(passport.authenticate('trello', {failureRedirect: '/login', session: false}), authCtrl.oauthCallback);

    /** User Routes unprotected */
    router.route('/users/').post(userCtrl.create); 

    /** Route Protection - all routes below are protected */
    router.use(passport.authenticate('jwt', {session: false}));       


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////// Protected Routes //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /** User Routes */
    router.route('/users/:id').get(userCtrl.get);
    router.route('/users/:id').put(userCtrl.update);
    router.route('/users/:id').delete(userCtrl.remove);

    /** Email Routes */
    router.route('/email/appendEnron').post(emailCtrl.appendEnron); /* API Endpoint for testing Enron*/
    router.route('/email/append').post(emailCtrl.append); /* IMAP API Endpoints */
    router.route('/email/:emailId/move').post(emailCtrl.move);
    router.route('/email/:emailId/trash').post(emailCtrl.trash);
    router.route('/email/send').post(emailCtrl.sendEmail);
    router.route('/email/:emailId/flags').post(emailCtrl.addFlags);
    router.route('/email/:emailId/flags').delete(emailCtrl.delFlags);
    router.route('/email/search').get(emailCtrl.searchMails);
    router.route('/email/:emailId').get(emailCtrl.getSingleMail);

    /** Box Routes */
    router.route('/box/').get(boxCtrl.getBoxes);
    router.route('/box/').post(boxCtrl.addBox);
    router.route('/box/:boxId').delete(boxCtrl.delBox);
    router.route('/box/:boxId/rename').post(boxCtrl.renameBox);  
    router.route('/box/syncAll').get(boxCtrl.syncIMAP);

    /** Task Routes */
    router.route('/task/search/members').get(taskCtrl.searchMembers);
    router.route('/task/search').get(taskCtrl.searchTasks);
    router.route('/task/cards').post(taskCtrl.searchCardsForMembers);
    router.route('/task/boards').get(taskCtrl.getAllBoardsForMember);
    router.route('/task/boards/:boardId/lists').get(taskCtrl.getAllListsForBoard);
    router.route('/task/lists/:listId/cards').get(taskCtrl.getAllCardsForList);
    router.route('/task/:taskId').get(taskCtrl.getSingleTask);
    router.route('/task/:taskId').put(taskCtrl.updateTask);
    router.route('/task/:taskId').delete(taskCtrl.deleteTask);
    router.route('/task/:taskId/unlink').put(taskCtrl.unlinkTask);
    router.route('/task/').post(taskCtrl.createTask);
    router.route('/task/sociocortex/register').post(taskCtrl.registerSociocortex);
    router.route('/task/sociocortex/connect').get(taskCtrl.connectSociocortex);
    router.route('/task/email/:emailId/linkTask').post(taskCtrl.linkTaskToMail);
    router.route('/task/email/:emailId/addTask').post(taskCtrl.createTask);

    /** Wiki Routes */
    router.route('/wiki/search').get(wikiCtrl.search);

    /** Translate Routes */
    router.route('/translate/').get(translationCtrl.translate);

    /** Dashboard Routes */
    router.route('/dashboard/summary').get(dashboardCtrl.getSummary);
    router.route('/dashboard/timeline').get(dashboardCtrl.getTimeline);
    router.route('/dashboard/network').get(dashboardCtrl.getNetwork);
    router.route('/dashboard/structure').get(dashboardCtrl.getStructure);

    /** Import Routes - for testing */
    router.route('/import/enron').post(importCtrl.importEnronData);
    router.route('/import/enronall').post(importCtrl.importEnronDataAll);

    /** Pattern Routes */
    router.route('/pattern/:patternId').get(patternCtrl.getSinglePattern);
    router.route('/pattern/:patternId').put(patternCtrl.updatePattern);
    router.route('/pattern/:patternId').delete(patternCtrl.deletePattern);
    router.route('/pattern/').post(patternCtrl.createPattern);
    router.route('/pattern/').get(patternCtrl.getAllPatterns);

    /** Attachment Routs */
    router.route('/attachment/:attachmentId').get(attachmentCtrl.getAttachment);
    router.route('/attachment/:attachmentId/download').get(attachmentCtrl.downloadAttachment);
    
    /** Contact Routes */
    router.route('/contacts/').get(contactsCtrl.list);

    return router;
}


export default routeProvider;
