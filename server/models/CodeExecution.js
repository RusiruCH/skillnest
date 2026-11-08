const mongoose = require('mongoose');

/**
 * Module 3: Code Playground - CodeExecution Model
 * Stores programming execution records executed by learners.
 * Contributor: Member 3 (B.S.D.P. Wickramasingha - SEU/IS/22/ICT/013)
 */
const codeExecutionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required for tracking execution ownership'],
      index: true,
    },
    language: {
      type: String,
      required: [true, 'Programming language is required'],
      enum: {
        values: ['javascript', 'python', 'java', 'c', 'cpp'],
        message: '{VALUE} is not a supported programming language',
      },
      lowercase: true,
      trim: true,
    },
    sourceCode: {
      type: String,
      required: [true, 'Source code cannot be empty'],
      maxlength: [60000, 'Source code cannot exceed 60,000 characters'],
    },
    stdin: {
      type: String,
      default: '',
      maxlength: [15000, 'Standard input cannot exceed 15,000 characters'],
    },
    output: {
      type: String,
      default: '',
    },
    errorMessage: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['success', 'error', 'timeout', 'demo'],
      default: 'success',
      index: true,
    },
    executionTimeMs: {
      type: Number,
      default: 0,
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
    executionDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index to ensure efficient retrieval of a user's recent execution history
codeExecutionSchema.index({ user: 1, executionDate: -1 });

module.exports = mongoose.model('CodeExecution', codeExecutionSchema);

