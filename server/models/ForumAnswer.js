const mongoose = require('mongoose');

/**
 * ForumAnswer Model — Module 06: Forum & Q&A
 * Represents an answer or reply to a ForumPost thread.
 * Author: Member 06 (SEU/IS/22/ICT/___) — Feature branch: feature/member-06-forum
 */
const forumAnswerSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ForumPost',
      required: [true, 'Parent forum post is required'],
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Answer author is required'],
      index: true,
    },
    body: {
      type: String,
      required: [true, 'Answer body is required'],
      minlength: [5, 'Answer must be at least 5 characters'],
    },
    isAccepted: {
      type: Boolean,
      default: false,
      index: true,
    },
    voteCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast per-thread answer queries
forumAnswerSchema.index({ post: 1, createdAt: 1 });
// Accepted answers floated to the top
forumAnswerSchema.index({ post: 1, isAccepted: -1, voteCount: -1 });

module.exports = mongoose.model('ForumAnswer', forumAnswerSchema);

