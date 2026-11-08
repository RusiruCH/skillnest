const express = require('express');
const router = express.Router();
const {
  createChallenge,
  getChallenges,
  getChallengeById,
  updateChallenge,
  deleteChallenge,
  getInstructorChallenges,
  getChallengeStats,
} = require('../controllers/challengeController');
const { submitSolution } = require('../controllers/submissionController');
const { protect } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');
const {
  validateChallengeInput,
  validateSubmissionInput,
} = require('../middleware/validateChallengeMiddleware');

// Public route to view challenges
router.get('/', getChallenges);

// Instructor / Admin stats & dashboard list
router.get('/stats/summary', protect, requireRoles('instructor', 'admin'), getChallengeStats);
router.get('/instructor/my-challenges', protect, requireRoles('instructor', 'admin'), getInstructorChallenges);

// Specific challenge details
router.get('/:id', getChallengeById);

// Create challenge
router.post(
  '/',
  protect,
  requireRoles('instructor', 'admin'),
  validateChallengeInput,
  createChallenge
);

// Update challenge
router.put(
  '/:id',
  protect,
  requireRoles('instructor', 'admin'),
  validateChallengeInput,
  updateChallenge
);

// Delete challenge
router.delete(
  '/:id',
  protect,
  requireRoles('instructor', 'admin'),
  deleteChallenge
);

// Learner submits solution to challenge
router.post(
  '/:id/submit',
  protect,
  requireRoles('learner'),
  validateSubmissionInput,
  submitSolution
);

module.exports = router;
