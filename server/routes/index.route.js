import express from 'express';
import userRoutes from './user.route';
import authRoutes from './auth.route';
import taskRoutes from './task.route';
import importRoutes from './import.route';
import patternRoutes from './pattern.route';
import contactsRoutes from './contacts.route';

import emailCtrl from '../controllers/email.controller';
import boxCtrl from '../controllers/box.controller';
import attachmentCtrl from '../controllers/attachment.controller';
import wikiCtrl from '../controllers/wiki.controller';
import translationCtrl from '../controllers/translation.controller';
import dashboardCtrl from '../controllers/dashboard.controller';

function routeProvider(passport) {
    const router = express.Router();
    router.use('/users', userRoutes(passport));
    router.use('/auth', authRoutes(passport));

    const mw = passport.authenticate('jwt', {session: false});
    router.use(mw);       

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

    router.use('/task', taskRoutes(passport));

    /** Wiki Routes */
    router.route('/wiki/search').get(wikiCtrl.search);

    /** Translate Routes */
    router.route('/translate/').get(translationCtrl.translate);

    /** Dashboard Routes */
    router.route('/dashboard/summary').get(dashboardCtrl.getSummary);
    router.route('/dashboard/timeline').get(dashboardCtrl.getTimeline);
    router.route('/dashboard/network').get(dashboardCtrl.getNetwork);
    router.route('/dashboard/structure').get(dashboardCtrl.getStructure);

    router.use('/import', importRoutes(passport));
    router.use('/pattern', patternRoutes(passport));

    /** Attachment Routs */
    router.route('/attachment/:attachmentId').get(attachmentCtrl.getAttachment);
    router.route('/attachment/:attachmentId/download').get(attachmentCtrl.downloadAttachment);
    
    router.use('/contacts', contactsRoutes(passport));
    return router;
}


export default routeProvider;
