const express = require('express');
const router = express.Router();
const {
  submitApplication,
  getMyApplicationStatus,
} = require('../controllers/instructorApplicationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, submitApplication);
router.get('/my-status', protect, getMyApplicationStatus);

module.exports = router;

