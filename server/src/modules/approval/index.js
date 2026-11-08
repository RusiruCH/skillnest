import express from 'express';
import instructorAppRoutes from './instructorApplication.routes.js';
import courseRoutes from './course.routes.js';
import instructorDashRoutes from './instructorDashboard.routes.js';

const router = express.Router();

// Admin routes
router.use(instructorAppRoutes);
router.use(courseRoutes);

// Instructor dashboard routes (protected by requireAuth)
router.use(instructorDashRoutes);

export default router;

