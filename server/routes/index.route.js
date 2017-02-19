import express from 'express';
import userRoutes from './user.route';
import authRoutes from './auth.route';
import emailRoutes from './email.route';
import taskRoutes from './task.route';
import wikiRoutes from './wiki.route';
import translateRoutes from './translation.route';
import dashboardRoutes from './dashboard.route';
import importRoutes from './import.route';
import patternRoutes from './pattern.route';

function routeProvider(passport) {
    const router = express.Router();
    router.use('/users', userRoutes(passport));
    router.use('/auth', authRoutes(passport));
    router.use('/email', emailRoutes(passport));
    router.use('/task', taskRoutes(passport));
    router.use('/wiki', wikiRoutes(passport));
    router.use('/translation', translateRoutes(passport));
    router.use('/dashboard', dashboardRoutes(passport));
    router.use('/import', importRoutes(passport));
    router.use('/pattern', patternRoutes(passport));
    return router;
}


export default routeProvider;
