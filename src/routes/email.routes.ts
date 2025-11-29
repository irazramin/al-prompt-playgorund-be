import express, { Router } from 'express';
import * as emailController from '../controllers/email.controller';

const router: Router = express.Router();

router.get('/verify', emailController.verifyEmail);
router.post('/resend-verification', emailController.resendVerification);

export default router;
