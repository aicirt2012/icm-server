import express from 'express';
import userRoutes from './user.route';
import authRoutes from './auth.route';
import emailRoutes from './email.route';
import taskRoutes from './task.route';

const router = express.Router();

/** GET /health-check - API service health */
router.get('/health-check', (req, res) =>
  res.send('EmailAppServer is up and running.')
);

// mount routes
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/email', emailRoutes);
router.use('/task', taskRoutes);

export default router;
