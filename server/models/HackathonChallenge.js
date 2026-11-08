const mongoose = require('mongoose');

const hackathonChallengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Challenge title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Problem description is required'],
    },
    inputRequirements: {
      type: String,
      default: 'Standard input / function parameters as specified in problem statement.',
    },
    outputRequirements: {
      type: String,
      default: 'Return or log output matching the expected format.',
    },
    constraints: {
      type: String,
      required: [true, 'Constraints are required'],
      default: '1 <= N <= 10^5\nTime limit: 2.0 seconds\nMemory limit: 256 MB',
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty level is required'],
      enum: {
        values: ['Easy', 'Medium', 'Hard'],
        message: 'Difficulty must be Easy, Medium, or Hard',
      },
      default: 'Medium',
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Instructor ID is required'],
    },
    deadline: {
      type: Date,
      required: [true, 'Submission deadline is required'],
    },
    status: {
      type: String,
      enum: ['Draft', 'Active', 'Closed', 'Archived'],
      default: 'Active',
    },
    sampleTestCase: {
      input: { type: String, default: 'nums = [2, 7, 11, 15], target = 9' },
      output: { type: String, default: '[0, 1]' },
      explanation: { type: String, default: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
    },
    tags: {
      type: [String],
      default: ['Algorithms', 'Data Structures'],
    },
    starterCode: {
      javascript: {
        type: String,
        default: '// Write your JavaScript solution here\nfunction solution() {\n  // TODO\n}\n',
      },
      python: {
        type: String,
        default: '# Write your Python solution here\ndef solution():\n    pass\n',
      },
      cpp: {
        type: String,
        default: '// Write your C++ solution here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}\n',
      },
    },
    coverImage: {
      type: String,
      default: '',
    },
    dayNumber: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to determine if deadline has passed
hackathonChallengeSchema.virtual('isExpired').get(function () {
  return this.deadline ? new Date() > new Date(this.deadline) : false;
});

// Virtual for submission count
hackathonChallengeSchema.virtual('submissionsCount', {
  ref: 'ChallengeSubmission',
  localField: '_id',
  foreignField: 'challengeId',
  count: true,
});

module.exports = mongoose.model('HackathonChallenge', hackathonChallengeSchema);
