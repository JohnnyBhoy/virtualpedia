import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import passport from 'passport';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

import { connectDB } from './config/db';
import { configurePassport } from './config/passport';
import authRoutes from './routes/auth';
import chatRoutes from './routes/chat';
import adminRoutes from './routes/admin';
import guestChatRoutes from './routes/guestChat';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Connect DB
connectDB();

// Configure passport
configurePassport(passport);

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // No origin = server-to-server / Postman / mobile — allow
    if (!origin) return callback(null, true);
    // Allow any localhost port in development
    if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    // In production, restrict to CLIENT_URL
    if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/guest-chat', guestChatRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'VirtualPedia API is running' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
