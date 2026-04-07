import { Router } from 'express';
import { sendMessage, getHistory, clearHistory } from '../controllers/chatController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(verifyToken, requireRole('parent'));

router.post('/message', sendMessage);
router.get('/history', getHistory);
router.delete('/history', clearHistory);

export default router;
