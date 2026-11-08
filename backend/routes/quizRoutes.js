const express = require('express');
const router = express.Router();

const {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  togglePublishQuiz
} = require('../controllers/quizController');

const {
  getQuizQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion
} = require('../controllers/questionController');

const { getQuizSubmissions } = require('../controllers/attemptController');

// Reuse Member 01's authentication and authorization middleware
const { protect, authorize } = require('../middleware/authMiddleware');

// Quiz CRUD routes
router
  .route('/')
  .get(protect, getQuizzes)
  .post(protect, authorize('instructor', 'admin', 'administrator'), createQuiz);

router
  .route('/:id')
  .get(protect, getQuizById)
  .put(protect, authorize('instructor', 'admin', 'administrator'), updateQuiz)
  .delete(protect, authorize('instructor', 'admin', 'administrator'), deleteQuiz);

router
  .route('/:id/publish')
  .patch(protect, authorize('instructor', 'admin', 'administrator'), togglePublishQuiz);

// Quiz Questions routes
router
  .route('/:quizId/questions')
  .get(protect, getQuizQuestions)
  .post(protect, authorize('instructor', 'admin', 'administrator'), addQuestion);

router
  .route('/:quizId/questions/:questionId')
  .put(protect, authorize('instructor', 'admin', 'administrator'), updateQuestion)
  .delete(protect, authorize('instructor', 'admin', 'administrator'), deleteQuestion);

// Quiz Submissions for Instructors/Admins
router
  .route('/:quizId/attempts')
  .get(protect, authorize('instructor', 'admin', 'administrator'), getQuizSubmissions);

module.exports = router;
