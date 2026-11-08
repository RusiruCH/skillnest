const express = require('express');
const router = express.Router();
const {
  getLearnerSubmissions,
  getChallengeSubmissions,
  getSubmissionById,
  gradeSubmission,
} = require('../controllers/submissionController');
const { protect } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');

// Learner personal submission history
router.get('/my-submissions', protect, requireRoles('learner'), getLearnerSubmissions);

// Instructor view all submissions for a challenge
router.get('/challenge/:challengeId', protect, requireRoles('instructor', 'admin'), getChallengeSubmissions);

// View single submission
router.get('/:id', protect, getSubmissionById);

// Grade / update feedback on submission
router.put('/:id/grade', protect, requireRoles('instructor', 'admin'), gradeSubmission);

module.exports = router;
