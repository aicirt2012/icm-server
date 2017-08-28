import express from 'express';
import userRoutes from './user.route';
import authRoutes from './auth.route';
import boxRoutes from './box.route';
import taskRoutes from './task.route';
import wikiRoutes from './wiki.route';
import translateRoutes from './translate.route';
import dashboardRoutes from './dashboard.route';
import importRoutes from './import.route';
import patternRoutes from './pattern.route';
import attachmentRoutes from './attachment.route';
import contactsRoutes from './contacts.route';

import emailCtrl from '../controllers/email.controller';


function routeProvider(passport) {
    const router = express.Router();
    router.use('/users', userRoutes(passport));
    router.use('/auth', authRoutes(passport));
   // router.use('/email', emailRoutes(passport));

    const mw = passport.authenticate('jwt', {session: false});
    router.use(mw);

    /* API Endpoint for testing Enron*/
    /* IMAP API Endpoints */
    router.route('/email/appendEnron').post(emailCtrl.appendEnron);
    router.route('/email/append').post(emailCtrl.append);
    router.route('/email/:emailId/move').post(emailCtrl.move);
    router.route('/email/:emailId/trash').post(emailCtrl.trash);
    router.route('/email/send').post(emailCtrl.sendEmail);
    router.route('/email/:emailId/flags').post(emailCtrl.addFlags);
    router.route('/email/:emailId/flags').delete(emailCtrl.delFlags);
    router.route('/email/search').get(emailCtrl.searchMails);
    router.route('/email/:emailId').get(emailCtrl.getSingleMail);

    router.use('/box', boxRoutes(passport));
    router.use('/task', taskRoutes(passport));
    router.use('/wiki', wikiRoutes(passport));
    router.use('/translate', translateRoutes(passport));
    router.use('/dashboard', dashboardRoutes(passport));
    router.use('/import', importRoutes(passport));
    router.use('/pattern', patternRoutes(passport));
    router.use('/attachment', attachmentRoutes(passport));
    router.use('/contacts', contactsRoutes(passport));
    return router;
}


export default routeProvider;
