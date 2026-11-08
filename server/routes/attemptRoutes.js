const express = require('express');
const router = express.Router();

const {
  startAttempt,
  submitAttempt,
  getAttemptById,
  getMyAttempts
} = require('../controllers/attemptController');

// Reuse Member 01's authentication and authorization middleware
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/start', protect, authorize('learner', 'admin', 'administrator'), startAttempt);
router.post('/:id/submit', protect, authorize('learner', 'admin', 'administrator'), submitAttempt);
router.get('/my', protect, authorize('learner', 'admin', 'administrator'), getMyAttempts);
router.get('/:id', protect, getAttemptById);

module.exports = router;
