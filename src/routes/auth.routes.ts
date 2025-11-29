import express, { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate, authenticateLocal } from '../middlewares/auth.middleware';

const router: Router = express.Router();

router.post('/register', authController.register);
router.post('/login', authenticateLocal, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);

export default router;
