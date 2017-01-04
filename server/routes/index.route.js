import express from 'express';
import userRoutes from './user.route';
import authRoutes from './auth.route';
import emailRoutes from './email.route';
import taskRoutes from './task.route';
import importRoutes from './import.route';

function routeProvider(passport) {
    const router = express.Router();
    router.use('/users', userRoutes(passport));
    router.use('/auth', authRoutes(passport));
    router.use('/email', emailRoutes(passport));
    router.use('/task', taskRoutes(passport));
    router.use('/import', importRoutes(passport));
    return router;
}


export default routeProvider;
