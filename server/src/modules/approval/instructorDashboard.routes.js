import express from 'express';
import { instructorAuth } from './middleware/instructorAuth.js';
import { getMyApplications, getMyCourses } from './controllers/instructorDashboard.controller.js';

const router = express.Router();

router.get('/instructor/applications', instructorAuth, getMyApplications);
router.get('/instructor/courses', instructorAuth, getMyCourses);

export default router;
