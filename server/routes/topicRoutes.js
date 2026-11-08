const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  getCourseTopics,
  addTopic,
  updateTopic,
  deleteTopic,
  reorderTopics,
} = require('../controllers/topicController');

const { protect } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');

// Nested under /api/courses/:courseId/topics
router.get('/', getCourseTopics);
router.post('/', protect, requireRoles('instructor', 'admin'), addTopic);
router.put('/reorder', protect, requireRoles('instructor', 'admin'), reorderTopics);

// Direct topic operations under /api/topics
router.put('/:id', protect, requireRoles('instructor', 'admin'), updateTopic);
router.delete('/:id', protect, requireRoles('instructor', 'admin'), deleteTopic);

module.exports = router;

