import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import authCtrl from '../controllers/auth.controller';
import userCtrl from '../controllers/user.controller';
import importCtrl from '../controllers/import.controller';
import emailCtrl from '../controllers/email.controller';
import boxCtrl from '../controllers/box.controller';
import attachmentCtrl from '../controllers/attachment.controller';
import taskLegacyCtrl from '../controllers/task.legacy.controller';
import taskCtrl from '../controllers/task.controller'
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
    r.route('/users/signup').post(userCtrl.signUp);

    /** Route Protection - all routes below are protected */
    r.use(passport.authenticate('jwt', {session: false}));


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////// Protected Routes //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /** User Routes */
    r.route('/users/me/provider/email/gmail').post(userCtrl.setEmailProviderGMail);
    r.route('/users/me/provider/email/exchange').post(userCtrl.setEmailProviderExchange);
    r.route('/users/me/provider/contacts/sociocortex').post(userCtrl.setContactProviderSocioCortex);
    r.route('/users/me').get(userCtrl.get);
    r.route('/users/me').put(userCtrl.update);
    r.route('/users/me').delete(userCtrl.remove);

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
    r.route('/boxes/').get(boxCtrl.getBoxes);
    r.route('/boxes/').post(boxCtrl.addBox);
    r.route('/boxes/:id').delete(boxCtrl.delBox);
    r.route('/boxes/:id/rename').post(boxCtrl.renameBox);
    r.route('/boxes/:id/move').post(boxCtrl.moveBox);
    r.route('/boxes/syncAll').get(boxCtrl.syncIMAP);

    /** Task Routes */
    r.route('/tasks/search/members').get(taskLegacyCtrl.searchMembers);
    r.route('/tasks/search').get(taskLegacyCtrl.searchTasks);
    r.route('/tasks/cards').post(taskLegacyCtrl.searchCardsForMembers);
    r.route('/tasks/boards').get(taskLegacyCtrl.getAllBoardsForMember);
    r.route('/tasks/boards/:boardId/lists').get(taskLegacyCtrl.getAllListsForBoard);
    r.route('/tasks/lists/:listId/cards').get(taskLegacyCtrl.getAllCardsForList);
    r.route('/tasks/:taskId').get(taskLegacyCtrl.getSingleTask);
    r.route('/tasks/:taskId').put(taskLegacyCtrl.updateTask);
    r.route('/tasks/:taskId').delete(taskLegacyCtrl.deleteTask);
    r.route('/tasks/:taskId/unlink').put(taskLegacyCtrl.unlinkTask);
    r.route('/tasks/').post(taskLegacyCtrl.createTask);
    r.route('/tasks/sociocortex/register').post(taskLegacyCtrl.registerSociocortex);
    r.route('/tasks/sociocortex/connect').get(taskLegacyCtrl.connectSociocortex);
    r.route('/tasks/email/:emailId/linkTask').post(taskLegacyCtrl.linkTaskToMail);
    r.route('/tasks/email/:emailId/addTask').post(taskLegacyCtrl.createTask);

    /** Task Routes v2 **/
    r.route('/tasks-ng/providers/:id/configure').post(taskCtrl.configure);
    r.route('/tasks-ng/providers/:id/setup').post(taskCtrl.setup);
    r.route('/tasks-ng/providers/:id/teardown').post(taskCtrl.teardown);
    r.route('/tasks-ng/query').post(taskCtrl.searchTasks);
    r.route('/tasks-ng').post(taskCtrl.createTask);
    r.route('/tasks-ng/:id').get(taskCtrl.readTask);
    r.route('/tasks-ng/:id').put(taskCtrl.updateTask);
    r.route('/tasks-ng/:id').delete(taskCtrl.deleteTask);

    /** SocioCortex Test Routes */
    r.route('/sc-test/cases').get(taskLegacyCtrl.testGetCases);
    r.route('/sc-test/tasks').get(taskLegacyCtrl.testGetTasks);
    r.route('/sc-test/activate-human').get(taskLegacyCtrl.testActivateHumanTask);
    r.route('/sc-test/activate-dual').get(taskLegacyCtrl.testActivateDualTask);

    /** Wiki Routes */
    r.route('/wikis/search').get(wikiCtrl.search);

    /** Translate Routes */
    r.route('/translate/').get(translationCtrl.translate);

    /** Dashboard Routes */
    r.route('/dashboards/summary').get(dashboardCtrl.getSummary);
    r.route('/dashboards/timeline').get(dashboardCtrl.getTimeline);
    r.route('/dashboards/network').get(dashboardCtrl.getNetwork);
    r.route('/dashboards/structure').get(dashboardCtrl.getStructure);

    /** Import Routes - for testing */
    r.route('/import/enron').post(importCtrl.importEnronData);
    r.route('/import/enronall').post(importCtrl.importEnronDataAll);

    /** Pattern Routes */
    r.route('/patterns/:id').get(patternCtrl.getSinglePattern);
    r.route('/patterns/:id').put(patternCtrl.updatePattern);
    r.route('/patterns/:id').delete(patternCtrl.deletePattern);
    r.route('/patterns').post(patternCtrl.createPattern);
    r.route('/patterns').get(patternCtrl.getAllPatterns);

    /** Attachment Routs */
    r.route('/attachments/:attachmentId').get(attachmentCtrl.getAttachment);
    r.route('/attachments/:attachmentId/download').get(attachmentCtrl.downloadAttachment);

    /** Contact Routes */
    r.route('/contacts/sync').post(contactsCtrl.sync);
    r.route('/contacts/search').get(contactsCtrl.search);
    r.route('/contacts/:id').get(contactsCtrl.get);
    r.route('/contacts').get(contactsCtrl.list);

    return r;
}


export default routeProvider;
