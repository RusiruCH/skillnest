const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
      minlength: [3, 'Quiz title must be at least 3 characters'],
      maxlength: [150, 'Quiz title cannot exceed 150 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: ''
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: [2000, 'Instructions cannot exceed 2000 characters'],
      default: 'Please read all questions carefully. Choose the best answer for each question and submit before the timer expires.'
    },
    // Integration reference to Member 02 (Course Management) - nullable until courses exist
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null
    },
    // Integration reference to Member 01 (User Management)
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor ID is required'],
      index: true
    },
    duration: {
      type: Number,
      required: [true, 'Quiz duration in minutes is required'],
      min: [1, 'Duration must be at least 1 minute'],
      max: [300, 'Duration cannot exceed 300 minutes (5 hours)']
    },
    passMark: {
      type: Number,
      required: [true, 'Pass mark percentage is required'],
      min: [0, 'Pass mark cannot be less than 0%'],
      max: [100, 'Pass mark cannot exceed 100%'],
      default: 50
    },
    totalMarks: {
      type: Number,
      default: 0
    },
    availableFrom: {
      type: Date,
      required: [true, 'Available from date/time is required']
    },
    availableUntil: {
      type: Date,
      required: [true, 'Available until date/time is required']
    },
    isPublished: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual property for dynamic quiz window state
quizSchema.virtual('status').get(function () {
  const now = new Date();
  if (!this.isPublished) return 'draft';
  if (now < new Date(this.availableFrom)) return 'upcoming';
  if (now > new Date(this.availableUntil)) return 'closed';
  return 'active';
});

module.exports = mongoose.model('Quiz', quizSchema);
