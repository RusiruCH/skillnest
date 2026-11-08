import express from 'express';
import { adminAuth } from './middleware/adminAuth.js';
import {
  getAllApplications,
  getApplicationById,
  approveApplication,
  rejectApplication,
} from './controllers/instructorApplication.controller.js';

const router = express.Router();

router.get('/admin/instructor-applications', adminAuth, getAllApplications);
router.get('/admin/instructor-applications/:id', adminAuth, getApplicationById);
router.patch('/admin/instructor-applications/:id/approve', adminAuth, approveApplication);
router.patch('/admin/instructor-applications/:id/reject', adminAuth, rejectApplication);

export default router;
