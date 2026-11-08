const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  votePost,
  togglePinPost,
  toggleClosePost,
  getAnswers,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  voteAnswer,
  acceptAnswer,
  getForumStats,
} = require('../controllers/forumController');

const { protect, optionalProtect } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');

// ─── Post (Question/Thread) Routes ──────────────────────────────────────────

// Public read with optional token (for identifying user if logged in)
router.get('/posts', optionalProtect, getPosts);
router.get('/posts/:id', optionalProtect, getPostById);

// Admin stats
router.get('/stats', protect, requireRoles('admin'), getForumStats);

// Protected post actions (Any authenticated role: learner, instructor, admin)
router.post('/posts', protect, createPost);
router.put('/posts/:id', protect, updatePost);
router.delete('/posts/:id', protect, deletePost);
router.patch('/posts/:id/vote', protect, votePost);
router.patch('/posts/:id/close', protect, toggleClosePost);

// Admin-only post actions
router.patch('/posts/:id/pin', protect, requireRoles('admin'), togglePinPost);

// ─── Answer Routes ─────────────────────────────────────────────────────────

// Public read answers for a post
router.get('/posts/:id/answers', optionalProtect, getAnswers);

// Protected answer actions
router.post('/posts/:id/answers', protect, createAnswer);
router.put('/answers/:answerId', protect, updateAnswer);
router.delete('/answers/:answerId', protect, deleteAnswer);
router.patch('/answers/:answerId/vote', protect, voteAnswer);
router.patch('/answers/:answerId/accept', protect, acceptAnswer);

module.exports = router;

