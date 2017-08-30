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
    const r = express.Router();

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////// Unprotected Routes ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /** Authentication Routes unprotected */
    r.route('/auth/login').post(validate(paramValidation.login), authCtrl.login);
    r.route('/auth/google').get(passport.authenticate('google', {scope: ['email', 'profile']}));
    r.route('/auth/google/callback').get(passport.authenticate('google', {failureRedirect: '/login'}), authCtrl.oauthCallback);
    r.route('/auth/trello').get(passport.authenticate('trello', {session: false}));
    r.route('/auth/trello/callback').get(passport.authenticate('trello', {failureRedirect: '/login', session: false}), authCtrl.oauthCallback);

    /** User Routes unprotected */
    r.route('/users/').post(userCtrl.create); 

    /** Route Protection - all routes below are protected */
    r.use(passport.authenticate('jwt', {session: false}));       


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////// Protected Routes //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /** User Routes */
    r.route('/users/:id').get(userCtrl.get);
    r.route('/users/:id').put(userCtrl.update);
    r.route('/users/:id').delete(userCtrl.remove);

    /** Email Routes */
    r.route('/emails/appendEnron').post(emailCtrl.appendEnron); /* API Endpoint for testing Enron*/
    r.route('/emails/append').post(emailCtrl.append); /* IMAP API Endpoints */
    r.route('/emails/send').post(emailCtrl.sendEmail);
    r.route('/emails/search').get(emailCtrl.searchEmails);
    r.route('/emails/:id/move').post(emailCtrl.move);
    r.route('/emails/:id/trash').post(emailCtrl.moveToTrash);
    r.route('/emails/:id/flags').post(emailCtrl.addFlags);
    r.route('/emails/:id/flags').delete(emailCtrl.delFlags);
    r.route('/emails/:id').get(emailCtrl.getSingleMail);

    /** Box Routes */
    r.route('/box/').get(boxCtrl.getBoxes);
    r.route('/box/').post(boxCtrl.addBox);
    r.route('/box/:boxId').delete(boxCtrl.delBox);
    r.route('/box/:boxId/rename').post(boxCtrl.renameBox);  
    r.route('/box/syncAll').get(boxCtrl.syncIMAP);

    /** Task Routes */
    r.route('/task/search/members').get(taskCtrl.searchMembers);
    r.route('/task/search').get(taskCtrl.searchTasks);
    r.route('/task/cards').post(taskCtrl.searchCardsForMembers);
    r.route('/task/boards').get(taskCtrl.getAllBoardsForMember);
    r.route('/task/boards/:boardId/lists').get(taskCtrl.getAllListsForBoard);
    r.route('/task/lists/:listId/cards').get(taskCtrl.getAllCardsForList);
    r.route('/task/:taskId').get(taskCtrl.getSingleTask);
    r.route('/task/:taskId').put(taskCtrl.updateTask);
    r.route('/task/:taskId').delete(taskCtrl.deleteTask);
    r.route('/task/:taskId/unlink').put(taskCtrl.unlinkTask);
    r.route('/task/').post(taskCtrl.createTask);
    r.route('/task/sociocortex/register').post(taskCtrl.registerSociocortex);
    r.route('/task/sociocortex/connect').get(taskCtrl.connectSociocortex);
    r.route('/task/email/:emailId/linkTask').post(taskCtrl.linkTaskToMail);
    r.route('/task/email/:emailId/addTask').post(taskCtrl.createTask);

    /** Wiki Routes */
    r.route('/wiki/search').get(wikiCtrl.search);

    /** Translate Routes */
    r.route('/translate/').get(translationCtrl.translate);

    /** Dashboard Routes */
    r.route('/dashboard/summary').get(dashboardCtrl.getSummary);
    r.route('/dashboard/timeline').get(dashboardCtrl.getTimeline);
    r.route('/dashboard/network').get(dashboardCtrl.getNetwork);
    r.route('/dashboard/structure').get(dashboardCtrl.getStructure);

    /** Import Routes - for testing */
    r.route('/import/enron').post(importCtrl.importEnronData);
    r.route('/import/enronall').post(importCtrl.importEnronDataAll);

    /** Pattern Routes */
    r.route('/pattern/:patternId').get(patternCtrl.getSinglePattern);
    r.route('/pattern/:patternId').put(patternCtrl.updatePattern);
    r.route('/pattern/:patternId').delete(patternCtrl.deletePattern);
    r.route('/pattern/').post(patternCtrl.createPattern);
    r.route('/pattern/').get(patternCtrl.getAllPatterns);

    /** Attachment Routs */
    r.route('/attachment/:attachmentId').get(attachmentCtrl.getAttachment);
    r.route('/attachment/:attachmentId/download').get(attachmentCtrl.downloadAttachment);
    
    /** Contact Routes */
    r.route('/contacts/').get(contactsCtrl.list);

    return r;
}


export default routeProvider;
