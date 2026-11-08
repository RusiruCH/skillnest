const mongoose = require('mongoose');

const challengeSubmissionSchema = new mongoose.Schema(
  {
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HackathonChallenge',
      required: [true, 'Challenge ID is required'],
      index: true,
    },
    learnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Learner ID is required'],
      index: true,
    },
    sourceCode: {
      type: String,
      required: [true, 'Source code or solution content is required'],
    },
    language: {
      type: String,
      default: 'javascript',
      enum: ['javascript', 'python', 'cpp', 'java', 'typescript', 'html_css', 'other'],
    },
    repoUrl: {
      type: String,
      trim: true,
      default: '',
    },
    submissionDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Submitted', 'Evaluating', 'Accepted', 'Rejected', 'Needs Revision'],
      default: 'Submitted',
    },
    result: {
      score: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },
      passed: {
        type: Boolean,
        default: null,
      },
      feedback: {
        type: String,
        default: '',
      },
      gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      gradedAt: {
        type: Date,
        default: null,
      },
    },
    runtimeMs: {
      type: Number,
      default: 0,
    },
    memoryMb: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to help query learner submissions for specific challenges
challengeSubmissionSchema.index({ challengeId: 1, learnerId: 1 });

module.exports = mongoose.model('ChallengeSubmission', challengeSubmissionSchema);
