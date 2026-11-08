import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import playgroundRoutes from './modules/playground/playground.routes.js';

dotenv.config();

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

// Base health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'SkillNest API Server',
    uptime: process.uptime()
  });
});

app.listen(PORT, () => {
  console.log(`[SkillNest Server] Running on http://localhost:${PORT}`);
  console.log(`[Member 03] Code Playground routes mounted at http://localhost:${PORT}/api/playground`);
});

export default app;
