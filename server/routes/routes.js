import 'babel-polyfill';
import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import authCtrl from '../controllers/auth.controller';
import userCtrl from '../controllers/user.controller';
import importCtrl from '../controllers/import.controller';
import emailCtrl from '../controllers/email.controller';
import boxCtrl from '../controllers/box.controller';
import attachmentCtrl from '../controllers/attachment.controller';
import taskCtrl from '../controllers/task.controller'
import taskTrelloCtrl from '../controllers/task.trello.controller'
import taskSociocortexCtrl from '../controllers/task.sociocortex.controller'
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
  r.route('/auth/trello/callback').get(passport.authenticate('trello', {
    failureRedirect: '/login',
    session: false
  }), authCtrl.oauthCallback);

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
  r.route('/emails/appendEnron').post(emailCtrl.appendEnron);
  /* API Endpoint for testing Enron*/
  r.route('/emails/append').post(emailCtrl.append);
  /* IMAP API Endpoints */
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

  /** Task Routes **/
  r.route('/tasks/providers/:id/configure').post(taskCtrl.configure);                                            //
  r.route('/tasks/providers/:id/setup').post(taskCtrl.setup);                                                    //
  r.route('/tasks/providers/:id/teardown').post(taskCtrl.teardown);                                              //
  r.route('/tasks/providers/:provider/tasks/:providerId').get(taskCtrl.readExternalTask);                                              //
  r.route('/tasks').get(taskCtrl.listTasks);                                                                     //
  r.route('/tasks').post(taskCtrl.createNewTask);                                                                //
  r.route('/tasks/:id').get(taskCtrl.readTask);                                                                  //
  r.route('/tasks/:id').put(taskCtrl.updateTask);                                                                //
  r.route('/tasks/:id').delete(taskCtrl.deleteTask);                                                             //
  r.route('/tasks/link').post(taskCtrl.createLinkedTask);                                                        //
  r.route('/tasks/:id/unlink').post(taskCtrl.unlinkTask);                                                        //
  /* Trello Task Routes */                                                                                       //
  r.route('/tasks/providers/trello/boards').get(taskTrelloCtrl.listBoards);                                      //
  r.route('/tasks/providers/trello/boards/:id/members').get(taskTrelloCtrl.listMembers);                         //
  r.route('/tasks/providers/trello/lists/:id/tasks').get(taskTrelloCtrl.getTasks);                         //
  r.route('/tasks/providers/trello/archive/:id').get(taskTrelloCtrl.archiveTask);                                //
  /* Sociocortex Task Routes */                                                                                  //
  r.route('/tasks/providers/sociocortex/workspaces').get(taskSociocortexCtrl.listWorkspaces);                    //
  r.route('/tasks/providers/sociocortex/workspaces/:id/cases').get(taskSociocortexCtrl.getCases);                    //
  r.route('/tasks/providers/sociocortex/tasks/:id/members').get(taskSociocortexCtrl.getPossibleOwners);           //
  r.route('/tasks/providers/sociocortex/cases/:id/tasks').get(taskSociocortexCtrl.getTasks);           //
  r.route('/tasks/providers/sociocortex/complete/:id').get(taskSociocortexCtrl.completeTask);                    //
  r.route('/tasks/providers/sociocortex/terminate/:id').get(taskSociocortexCtrl.terminateTask);                  //
  /* Unused Task Routes (only for development) */                                                                //
  r.route('/tasks/query').post(taskCtrl.searchTasks);                                                            //
  r.route('/tasks/providers/:id/tasks').get(taskCtrl.listExternalTasks);                                         //

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
