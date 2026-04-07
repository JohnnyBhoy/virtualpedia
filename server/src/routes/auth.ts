import { Router } from 'express';
import passport from 'passport';
import { googleCallback, adminLogin, getMe, logout } from '../controllers/authController';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}?error=auth_failed` }),
  googleCallback
);

router.post('/admin/login', adminLogin);
router.get('/me', verifyToken, getMe);
router.post('/logout', verifyToken, logout);

export default router;
