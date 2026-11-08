const express = require('express');
const router = express.Router();
const {
  getPublicCourses,
  getInstructorCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  submitCourseForApproval,
  updateCourseStatus,
  getCourseCategories,
  getInstructorStats,
} = require('../controllers/courseController');

const { protect, optionalProtect } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');

// Public endpoints
router.get('/', getPublicCourses);
router.get('/categories', getCourseCategories);

// Instructor dashboards & statistics
router.get('/my-courses', protect, requireRoles('instructor', 'admin'), getInstructorCourses);
router.get('/stats/summary', protect, requireRoles('instructor', 'admin'), getInstructorStats);

// Single course details (learners view approved; instructors view their own drafts)
router.get('/:id', optionalProtect, getCourseById);

// Instructor course management
router.post('/', protect, requireRoles('instructor', 'admin'), createCourse);
router.put('/:id', protect, requireRoles('instructor', 'admin'), updateCourse);
router.delete('/:id', protect, requireRoles('instructor', 'admin'), deleteCourse);

// Course workflow: submit for admin approval
router.put('/:id/submit', protect, requireRoles('instructor', 'admin'), submitCourseForApproval);
router.patch('/:id/submit', protect, requireRoles('instructor', 'admin'), submitCourseForApproval);

// Admin workflow: approve or reject course (Module 02 integration contract)
router.patch('/:id/status', protect, requireRoles('admin'), updateCourseStatus);

module.exports = router;

