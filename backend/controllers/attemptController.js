const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const QuizQuestion = require('../models/QuizQuestion');
const QuizAttempt = require('../models/QuizAttempt');

// @desc    Start a quiz attempt
// @route   POST /api/attempts/start
// @access  Protected (Learner, Instructor [self-test on own quiz], Administrator)
const startAttempt = async (req, res, next) => {
  try {
    const { quizId } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!quizId) {
      return res.status(400).json({
        success: false,
        message: 'Quiz ID is required'
      });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // TASK 2: Instructor Self-Test Permission
    const isInstructor = userRole === 'instructor';
    const isOwnerInstructor = isInstructor && quiz.instructor.toString() === userId.toString();

    // Security Rule: Instructors can NEVER access or attempt another instructor's quizzes
    if (isInstructor && !isOwnerInstructor) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Instructors are only permitted to preview and test quizzes they own'
      });
    }

    // Availability validation on server (owner instructors can preview drafts before publishing or opening)
    if (!isOwnerInstructor) {
      if (!quiz.isPublished) {
        return res.status(400).json({
          success: false,
          message: 'This quiz is not published and cannot be attempted'
        });
      }

      const now = new Date();
      if (now < new Date(quiz.availableFrom)) {
        return res.status(400).json({
          success: false,
          message: `This quiz is not available yet. It will open on ${new Date(quiz.availableFrom).toLocaleString()}`
        });
      }

      if (now > new Date(quiz.availableUntil)) {
        return res.status(400).json({
          success: false,
          message: `This quiz has expired. It closed on ${new Date(quiz.availableUntil).toLocaleString()}`
        });
      }
    }

    // 1. Check if an active attempt is currently in progress for this user & quiz
    const activeAttempt = await QuizAttempt.findOne({
      quiz: quiz._id,
      learner: userId,
      status: 'in_progress'
    });

    if (activeAttempt) {
      // Return ongoing attempt so the learner or instructor can continue
      // CRITICAL SECURITY: questions without correctOptionId or explanation!
      const sanitizedQuestions = await QuizQuestion.find({ quiz: quiz._id }).sort({ order: 1 });
      return res.status(200).json({
        success: true,
        message: isOwnerInstructor
          ? 'Resuming active instructor preview test attempt'
          : 'Resuming existing active attempt',
        data: {
          attempt: activeAttempt,
          quiz: {
            _id: quiz._id,
            title: quiz.title,
            instructions: quiz.instructions,
            duration: quiz.duration,
            totalMarks: quiz.totalMarks,
            passMark: quiz.passMark,
            maxAttempts: quiz.maxAttempts || 1
          },
          questions: sanitizedQuestions
        }
      });
    }

    // 2. Count completed non-test attempts for this user and quiz
    const completedAttemptsCount = await QuizAttempt.countDocuments({
      quiz: quiz._id,
      learner: userId,
      status: { $in: ['submitted', 'expired'] },
      isTestAttempt: false
    });

    const maxAllowed = quiz.maxAttempts || 1;

    // TASK 3: Configurable Maximum Attempts enforcement for learners
    if (!isOwnerInstructor && completedAttemptsCount >= maxAllowed) {
      return res.status(409).json({
        success: false,
        message: `Maximum attempt limit reached. You have completed ${completedAttemptsCount} of ${maxAllowed} allowed attempt(s).`,
        completedAttempts: completedAttemptsCount,
        maxAttempts: maxAllowed
      });
    }

    // Fetch questions securely without answer keys (zero answer leakage before submission)
    const sanitizedQuestions = await QuizQuestion.find({ quiz: quiz._id }).sort({ order: 1 });

    if (sanitizedQuestions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'This quiz has no questions and cannot be attempted'
      });
    }

    const nextAttemptNumber = isOwnerInstructor ? 1 : (completedAttemptsCount + 1);

    // Create new attempt
    const newAttempt = await QuizAttempt.create({
      quiz: quiz._id,
      learner: userId,
      attemptNumber: nextAttemptNumber,
      isTestAttempt: isOwnerInstructor,
      startedAt: new Date(),
      status: 'in_progress',
      totalPossibleMarks: quiz.totalMarks,
      answers: []
    });

    res.status(201).json({
      success: true,
      message: isOwnerInstructor
        ? 'Instructor test attempt started successfully'
        : 'Quiz attempt started successfully',
      data: {
        attempt: newAttempt,
        quiz: {
          _id: quiz._id,
          title: quiz.title,
          instructions: quiz.instructions,
          duration: quiz.duration,
          totalMarks: quiz.totalMarks,
          passMark: quiz.passMark,
          maxAttempts: quiz.maxAttempts || 1
        },
        questions: sanitizedQuestions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit answers & auto-grade quiz attempt
// @route   POST /api/attempts/:id/submit
// @access  Protected (Learner [owner])
const submitAttempt = async (req, res, next) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.id);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found'
      });
    }

    // Ownership check: only the attempting learner can submit
    if (attempt.learner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only submit your own quiz attempt'
      });
    }

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: `This attempt has already been ${attempt.status}`
      });
    }

    const quiz = await Quiz.findById(attempt.quiz);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Associated quiz not found' });
    }

    // Server-side duration validation with 1-minute latency grace period
    const submissionTime = new Date();
    const elapsedMinutes = (submissionTime - new Date(attempt.startedAt)) / (1000 * 60);
    const maxAllowedMinutes = quiz.duration + 1; // 1-minute network grace
    const isExpired = elapsedMinutes > maxAllowedMinutes;

    const submittedAnswers = req.body.answers || [];

    // Fetch questions with correctOptionId and explanation for grading
    const questions = await QuizQuestion.find({ quiz: quiz._id }).select('+correctOptionId +explanation');

    let totalScore = 0;
    const gradedAnswers = [];

    // Auto-scoring logic
    for (const q of questions) {
      const userSubmission = submittedAnswers.find(
        (a) => a.question && a.question.toString() === q._id.toString()
      );

      const selectedId = userSubmission ? userSubmission.selectedOptionId : null;
      const isCorrect =
        selectedId &&
        q.correctOptionId &&
        selectedId.toString() === q.correctOptionId.toString();

      const marksAwarded = isCorrect ? (q.marks || 1) : 0;
      totalScore += marksAwarded;

      gradedAnswers.push({
        question: q._id,
        selectedOptionId: selectedId,
        isCorrect: Boolean(isCorrect),
        marksAwarded
      });
    }

    const totalPossible = quiz.totalMarks > 0
      ? quiz.totalMarks
      : questions.reduce((sum, q) => sum + (q.marks || 1), 0);

    const percentage = totalPossible > 0
      ? Math.round((totalScore / totalPossible) * 100)
      : 0;

    const passed = percentage >= quiz.passMark;

    // Update attempt
    attempt.submittedAt = submissionTime;
    attempt.status = isExpired ? 'expired' : 'submitted';
    attempt.timeExpired = isExpired;
    attempt.answers = gradedAnswers;
    attempt.score = totalScore;
    attempt.totalPossibleMarks = totalPossible;
    attempt.percentage = percentage;
    attempt.passed = passed;

    await attempt.save();

    // Now safe to return full detailed breakdown including correct options & explanations
    res.status(200).json({
      success: true,
      message: isExpired
        ? 'Quiz submitted, but time limit was exceeded.'
        : 'Quiz submitted and graded successfully',
      data: {
        attempt,
        quiz: {
          _id: quiz._id,
          title: quiz.title,
          passMark: quiz.passMark
        },
        questionsReview: questions.map((q) => {
          const ans = gradedAnswers.find((a) => a.question.toString() === q._id.toString());
          return {
            _id: q._id,
            questionText: q.questionText,
            options: q.options,
            correctOptionId: q.correctOptionId,
            explanation: q.explanation,
            marks: q.marks,
            userSelectedOptionId: ans?.selectedOptionId || null,
            isCorrect: ans?.isCorrect || false,
            marksAwarded: ans?.marksAwarded || 0
          };
        })
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attempt details & result
// @route   GET /api/attempts/:id
// @access  Protected
const getAttemptById = async (req, res, next) => {
  try {
    let attemptQuery = QuizAttempt.findById(req.params.id)
      .populate('quiz', 'title duration passMark totalMarks availableFrom availableUntil instructor');

    // Safe populate only if Member 01 User model has been registered
    if (mongoose.models.User) {
      attemptQuery = attemptQuery.populate('learner', 'name email');
    }

    const attempt = await attemptQuery;

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }

    const isOwner = attempt.learner?._id?.toString() === req.user._id.toString() ||
      attempt.learner?.toString() === req.user._id.toString();
    const isInstructor = req.user.role === 'instructor' &&
      attempt.quiz?.instructor?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'administrator';

    if (!isOwner && !isInstructor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this attempt'
      });
    }

    // If still in progress and accessed by learner, never leak correct answers
    if (attempt.status === 'in_progress') {
      const sanitizedQuestions = await QuizQuestion.find({ quiz: attempt.quiz._id }).sort({ order: 1 });
      return res.status(200).json({
        success: true,
        data: {
          attempt,
          questions: sanitizedQuestions
        }
      });
    }

    // If completed/expired, reveal full review with correct answers
    const questions = await QuizQuestion.find({ quiz: attempt.quiz._id })
      .select('+correctOptionId +explanation')
      .sort({ order: 1 });

    const questionsReview = questions.map((q) => {
      const ans = attempt.answers.find((a) => a.question.toString() === q._id.toString());
      return {
        _id: q._id,
        questionText: q.questionText,
        options: q.options,
        correctOptionId: q.correctOptionId,
        explanation: q.explanation,
        marks: q.marks,
        userSelectedOptionId: ans?.selectedOptionId || null,
        isCorrect: ans?.isCorrect || false,
        marksAwarded: ans?.marksAwarded || 0
      };
    });

    res.status(200).json({
      success: true,
      data: {
        attempt,
        questionsReview
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all attempts for the logged-in learner
// @route   GET /api/attempts/my
// @access  Protected (Learner)
const getMyAttempts = async (req, res, next) => {
  try {
    const attempts = await QuizAttempt.find({ learner: req.user._id })
      .populate('quiz', 'title duration passMark totalMarks maxAttempts availableFrom availableUntil')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all student attempts for a quiz (Instructor/Admin)
// @route   GET /api/quizzes/:quizId/attempts
// @access  Protected (Instructor [owner], Administrator)
const getQuizSubmissions = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Ownership check
    if (
      req.user.role === 'instructor' &&
      quiz.instructor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only view submissions for your own quizzes'
      });
    }

    // Exclude instructor preview test attempts so student class statistics remain 100% accurate
    let attemptsQuery = QuizAttempt.find({ quiz: quiz._id, isTestAttempt: { $ne: true } }).sort({ createdAt: -1 });

    // Safe populate only if Member 01 User model has been registered
    if (mongoose.models.User) {
      attemptsQuery = attemptsQuery.populate('learner', 'name email');
    }

    const attempts = await attemptsQuery;

    // Calculate aggregated statistics
    const completed = attempts.filter((a) => a.status === 'submitted' || a.status === 'expired');
    const totalSubmissions = completed.length;
    const passedCount = completed.filter((a) => a.passed).length;
    const avgScore = totalSubmissions > 0
      ? (completed.reduce((acc, a) => acc + a.score, 0) / totalSubmissions).toFixed(1)
      : 0;
    const avgPercentage = totalSubmissions > 0
      ? (completed.reduce((acc, a) => acc + a.percentage, 0) / totalSubmissions).toFixed(1)
      : 0;

    // Task 4: Highest / Lowest per-learner marks
    const scores = completed.map((a) => a.score);
    const percentages = completed.map((a) => a.percentage);
    const highestScore = scores.length > 0 ? Math.max(...scores) : null;
    const lowestScore = scores.length > 0 ? Math.min(...scores) : null;
    const highestPercentage = percentages.length > 0 ? Math.max(...percentages) : null;
    const lowestPercentage = percentages.length > 0 ? Math.min(...percentages) : null;

    res.status(200).json({
      success: true,
      data: {
        quiz: {
          _id: quiz._id,
          title: quiz.title,
          passMark: quiz.passMark,
          totalMarks: quiz.totalMarks
        },
        stats: {
          totalSubmissions,
          passedCount,
          failedCount: totalSubmissions - passedCount,
          passRate: totalSubmissions > 0 ? ((passedCount / totalSubmissions) * 100).toFixed(1) : 0,
          avgScore,
          avgPercentage,
          highestScore,
          lowestScore,
          highestPercentage,
          lowestPercentage
        },
        submissions: attempts
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startAttempt,
  submitAttempt,
  getAttemptById,
  getMyAttempts,
  getQuizSubmissions
};
