const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllInstructorApplications,
  getInstructorApplicationById,
  approveInstructorApplication,
  rejectInstructorApplication,
  undoInstructorApplicationStatus,
  getAllCourses,
  getPendingCourses,
  getCourseById,
  approveCourse,
  rejectCourse,
  undoCourseStatus,
  getApprovalHistory,
} = require('../controllers/adminApprovalController');
const { protect } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');

// All endpoints in this router require authentication and administrator role
router.use(protect, requireRoles('admin'));

// 1. Dashboard Overview Statistics
router.get('/stats', getDashboardStats);

// 2. Instructor Applications
router.get('/applications', getAllInstructorApplications);
router.get('/applications/:id', getInstructorApplicationById);
router.put('/applications/:id/approve', approveInstructorApplication);
router.post('/applications/:id/approve', approveInstructorApplication);
router.put('/applications/:id/reject', rejectInstructorApplication);
router.post('/applications/:id/reject', rejectInstructorApplication);
router.put('/applications/:id/undo', undoInstructorApplicationStatus);

// 3. Course Approvals
router.get('/courses', getAllCourses);
router.get('/courses/pending', getPendingCourses);
router.get('/courses/:id', getCourseById);
router.put('/courses/:id/approve', approveCourse);
router.post('/courses/:id/approve', approveCourse);
router.put('/courses/:id/reject', rejectCourse);
router.post('/courses/:id/reject', rejectCourse);
router.put('/courses/:id/undo', undoCourseStatus);

// 4. Approval Audit History
router.get('/approvals/history', getApprovalHistory);

module.exports = router;

