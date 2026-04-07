import { Router } from 'express';
import { sendGuestMessage } from '../controllers/guestChatController';

const router = Router();

router.post('/message', sendGuestMessage);

export default router;
