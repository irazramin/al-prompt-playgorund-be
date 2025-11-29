import express, { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import emailRoutes from './email.routes';
import aiRoutes from './ai.routes';

const router: Router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/email', emailRoutes);
router.use('/ai', aiRoutes);

export default router;
