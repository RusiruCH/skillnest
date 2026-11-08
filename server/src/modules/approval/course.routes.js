import express from 'express';
import { adminAuth } from './middleware/adminAuth.js';
import {
  getPendingCourses,
  getCourseById,
  approveCourse,
  rejectCourse,
} from './controllers/course.controller.js';

const router = express.Router();

router.get('/admin/courses/pending', adminAuth, getPendingCourses);
router.get('/admin/courses/:id', adminAuth, getCourseById);
router.patch('/admin/courses/:id/approve', adminAuth, approveCourse);
router.patch('/admin/courses/:id/reject', adminAuth, rejectCourse);

export default router;
