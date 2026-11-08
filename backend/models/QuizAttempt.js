const mongoose = require('mongoose');

const attemptAnswerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuizQuestion',
    required: true
  },
  selectedOptionId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  marksAwarded: {
    type: Number,
    default: 0
  }
});

const quizAttemptSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Quiz reference is required'],
      index: true
    },
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Learner reference is required'],
      index: true
    },
    attemptNumber: {
      type: Number,
      required: true,
      default: 1,
      min: [1, 'Attempt number must be at least 1']
    },
    isTestAttempt: {
      type: Boolean,
      default: false
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    submittedAt: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['in_progress', 'submitted', 'expired'],
      default: 'in_progress'
    },
    answers: [attemptAnswerSchema],
    score: {
      type: Number,
      default: 0
    },
    totalPossibleMarks: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    passed: {
      type: Boolean,
      default: false
    },
    timeExpired: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index ensuring only one attempt per number per quiz per learner
quizAttemptSchema.index({ quiz: 1, learner: 1, attemptNumber: 1 }, { unique: true });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
