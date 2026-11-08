import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
dotenv.config();

import { connectDB } from './config/db.js';
import playgroundRoutes from './modules/playground/playground.routes.js';
import approvalRoutes from './modules/approval/index.js';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('Fatal: JWT_SECRET is required in production.');
  process.exit(1);
}


const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiter for Playground endpoints to prevent abuse / resource flooding
const playgroundLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 30, // Limit each IP to 30 requests per minute
  message: {
    success: false,
    error: 'Too many requests. Please slow down and try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Member 03: Code Playground Module Routes
app.use('/api/playground', playgroundLimiter, playgroundRoutes);
app.use('/api', approvalRoutes);

// Base health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'SkillNest API Server',
    uptime: process.uptime()
  });
});

// Only start the HTTP server when this file is run directly (not imported by tests)
const isMain = process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('server.js');
if (isMain) {
  app.listen(PORT, () => {
    console.log(`[SkillNest Server] Running on http://localhost:${PORT}`);
    console.log(`[Member 03] Code Playground routes mounted at http://localhost:${PORT}/api/playground`);
  });
}

export default app;
