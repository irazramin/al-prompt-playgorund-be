import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/generate/stream', aiController.generateStream);
router.get('/chats', authenticate, aiController.getChats);
router.get('/chats/:chatId', authenticate, aiController.getChatMessages);

export default router;
