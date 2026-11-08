const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Option text is required'],
    trim: true,
    maxlength: [500, 'Option text cannot exceed 500 characters']
  }
});

const quizQuestionSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Quiz reference is required'],
      index: true
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
      minlength: [3, 'Question text must be at least 3 characters'],
      maxlength: [1000, 'Question text cannot exceed 1000 characters']
    },
    options: {
      type: [optionSchema],
      validate: [
        {
          validator: function (val) {
            return Array.isArray(val) && val.length >= 2 && val.length <= 6;
          },
          message: 'A question must contain between 2 and 6 answer options'
        }
      ]
    },
    /**
     * CRITICAL SECURITY ATTRIBUTE:
     * `correctOptionId` is hidden by default ({ select: false }) so that learner-facing queries
     * can NEVER leak correct answers over the network prior to submission.
     * Only instructor operations and backend auto-grading will explicitly request this field.
     */
    correctOptionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Correct option reference is required'],
      select: false
    },
    marks: {
      type: Number,
      required: [true, 'Marks are required'],
      min: [1, 'Marks must be at least 1'],
      max: [100, 'Marks cannot exceed 100'],
      default: 1
    },
    explanation: {
      type: String,
      trim: true,
      maxlength: [1000, 'Explanation cannot exceed 1000 characters'],
      default: '',
      select: false // Revealed only upon submission review
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Validate that correctOptionId references an existing option subdocument
quizQuestionSchema.pre('validate', function (next) {
  if (this.options && this.options.length > 0 && this.correctOptionId) {
    const exists = this.options.some((opt) =>
      opt._id.toString() === this.correctOptionId.toString()
    );
    if (!exists) {
      this.invalidate('correctOptionId', 'The correct option ID must match one of the defined options');
    }
  }
  next();
});

module.exports = mongoose.model('QuizQuestion', quizQuestionSchema);
