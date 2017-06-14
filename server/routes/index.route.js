import express from 'express';
import userRoutes from './user.route';
import authRoutes from './auth.route';
import emailRoutes from './email.route';
import boxRoutes from './box.route';
import taskRoutes from './task.route';
import wikiRoutes from './wiki.route';
import translateRoutes from './translate.route';
import dashboardRoutes from './dashboard.route';
import importRoutes from './import.route';
import patternRoutes from './pattern.route';
import attachmentRoutes from './attachment.route';

function routeProvider(passport) {
    const router = express.Router();
    router.use('/users', userRoutes(passport));
    router.use('/auth', authRoutes(passport));
    router.use('/email', emailRoutes(passport));
    router.use('/box', boxRoutes(passport));
    router.use('/task', taskRoutes(passport));
    router.use('/wiki', wikiRoutes(passport));
    router.use('/translate', translateRoutes(passport));
    router.use('/dashboard', dashboardRoutes(passport));
    router.use('/import', importRoutes(passport));
    router.use('/pattern', patternRoutes(passport));
    router.use('/attachment', attachmentRoutes(passport));
    return router;
}


export default routeProvider;
