const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const QuizQuestion = require('../models/QuizQuestion');
const QuizAttempt = require('../models/QuizAttempt');

let Course;
try {
  Course = require('../models/Course');
} catch (e) {
  if (mongoose.models && mongoose.models.Course) {
    Course = mongoose.model('Course');
  }
}

// @desc    Get all quizzes (role-filtered)
// @route   GET /api/quizzes
// @access  Protected (Administrator, Instructor, Learner)
const getQuizzes = async (req, res, next) => {
  try {
    const { role, _id: userId } = req.user;
    let filter = {};

    if (role === 'instructor') {
      // Instructors see only their own quizzes
      filter = { instructor: userId };
    } else if (role === 'learner') {
      // Learners see published quizzes (can filter by courseId or active status if provided)
      const now = new Date();
      filter = { isPublished: true };

      if (req.query.scope === 'active') {
        filter.availableFrom = { $lte: now };
        filter.availableUntil = { $gte: now };
      }
    }
    // Administrator sees all quizzes (filter = {})

    if (req.query.courseId) {
      filter.courseId = req.query.courseId;
    }

    let query = Quiz.find(filter).sort({ createdAt: -1 });
    if (Course || (mongoose.models && mongoose.models.Course)) {
      query = query.populate('courseId', 'title category level');
    }
    const quizzes = await query;

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single quiz details
// @route   GET /api/quizzes/:id
// @access  Protected
const getQuizById = async (req, res, next) => {
  try {
    let query = Quiz.findById(req.params.id);
    if (Course || (mongoose.models && mongoose.models.Course)) {
      query = query.populate('courseId', 'title category level');
    }
    const quiz = await query;

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Role-based view check: unpublished quizzes cannot be viewed by learners
    if (req.user.role === 'learner' && !quiz.isPublished) {
      return res.status(403).json({
        success: false,
        message: 'This quiz is not currently published'
      });
    }

    const questionCount = await QuizQuestion.countDocuments({ quiz: quiz._id });

    res.status(200).json({
      success: true,
      data: {
        ...quiz.toObject(),
        questionCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Protected (Instructor, Administrator)
const createQuiz = async (req, res, next) => {
  try {
    const {
      title,
      description,
      instructions,
      courseId,
      duration,
      passMark,
      maxAttempts,
      availableFrom,
      availableUntil
    } = req.body;

    if (!title || !duration || !availableFrom || !availableUntil) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, duration, availableFrom, and availableUntil'
      });
    }

    const startDate = new Date(availableFrom);
    const endDate = new Date(availableUntil);

    if (startDate >= endDate) {
      return res.status(400).json({
        success: false,
        message: 'availableFrom date must be earlier than availableUntil date'
      });
    }

    // Validate courseId if provided
    if (courseId) {
      const CourseModel = Course || (mongoose.models && mongoose.models.Course);
      if (CourseModel) {
        const course = await CourseModel.findById(courseId);
        if (!course) {
          return res.status(404).json({
            success: false,
            message: 'Linked course not found'
          });
        }
        if (
          req.user.role === 'instructor' &&
          course.instructor &&
          course.instructor.toString() !== req.user._id.toString()
        ) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: You can only link a quiz to a course you own'
          });
        }
      }
    }

    const quiz = await Quiz.create({
      title,
      description: description || '',
      instructions: instructions || undefined,
      courseId: courseId || null,
      instructor: req.user._id,
      duration: Number(duration),
      passMark: passMark !== undefined ? Number(passMark) : 50,
      maxAttempts: maxAttempts !== undefined ? Number(maxAttempts) : 1,
      availableFrom: startDate,
      availableUntil: endDate,
      isPublished: false
    });

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      data: quiz
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a quiz
// @route   PUT /api/quizzes/:id
// @access  Protected (Instructor [owner], Administrator)
const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Instructor ownership verification (Administrator bypasses)
    if (
      req.user.role === 'instructor' &&
      quiz.instructor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only edit your own quizzes'
      });
    }

    const {
      title,
      description,
      instructions,
      courseId,
      duration,
      passMark,
      maxAttempts,
      availableFrom,
      availableUntil
    } = req.body;

    const startDate = availableFrom ? new Date(availableFrom) : quiz.availableFrom;
    const endDate = availableUntil ? new Date(availableUntil) : quiz.availableUntil;

    if (startDate >= endDate) {
      return res.status(400).json({
        success: false,
        message: 'availableFrom date must be earlier than availableUntil date'
      });
    }

    if (courseId !== undefined && courseId) {
      const CourseModel = Course || (mongoose.models && mongoose.models.Course);
      if (CourseModel) {
        const course = await CourseModel.findById(courseId);
        if (!course) {
          return res.status(404).json({
            success: false,
            message: 'Linked course not found'
          });
        }
        if (
          req.user.role === 'instructor' &&
          course.instructor &&
          course.instructor.toString() !== req.user._id.toString()
        ) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: You can only link a quiz to a course you own'
          });
        }
      }
    }

    if (title) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (instructions !== undefined) quiz.instructions = instructions;
    if (courseId !== undefined) quiz.courseId = courseId || null;
    if (duration !== undefined) quiz.duration = Number(duration);
    if (passMark !== undefined) quiz.passMark = Number(passMark);
    if (maxAttempts !== undefined) quiz.maxAttempts = Number(maxAttempts);
    quiz.availableFrom = startDate;
    quiz.availableUntil = endDate;

    await quiz.save();

    res.status(200).json({
      success: true,
      message: 'Quiz updated successfully',
      data: quiz
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a quiz + cascade questions & attempts
// @route   DELETE /api/quizzes/:id
// @access  Protected (Instructor [owner], Administrator)
const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Ownership check
    if (
      req.user.role === 'instructor' &&
      quiz.instructor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete your own quizzes'
      });
    }

    // Cascade delete associated questions and attempts
    await QuizQuestion.deleteMany({ quiz: quiz._id });
    await QuizAttempt.deleteMany({ quiz: quiz._id });
    await quiz.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Quiz and all associated questions and attempts deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle quiz publish status
// @route   PATCH /api/quizzes/:id/publish
// @access  Protected (Instructor [owner], Administrator)
const togglePublishQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Ownership check
    if (
      req.user.role === 'instructor' &&
      quiz.instructor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only publish/unpublish your own quizzes'
      });
    }

    // If publishing, ensure there is at least 1 question
    if (!quiz.isPublished) {
      const questionCount = await QuizQuestion.countDocuments({ quiz: quiz._id });
      if (questionCount === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot publish a quiz with 0 questions. Please add questions first.'
        });
      }
    }

    quiz.isPublished = !quiz.isPublished;
    await quiz.save();

    res.status(200).json({
      success: true,
      message: `Quiz ${quiz.isPublished ? 'published' : 'unpublished'} successfully`,
      data: quiz
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  togglePublishQuiz
};
