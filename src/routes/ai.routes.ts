import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';

const router = Router();

router.post('/generate/stream', aiController.generateStream);

export default router;
