import { Router } from 'express';
import {
  getStats,
  getUsers,
  getUserById,
  updateUserStatus,
  getUserChat,
} from '../controllers/adminController';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(verifyToken, requireRole('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/status', updateUserStatus);
router.get('/users/:id/chat', getUserChat);

export default router;
