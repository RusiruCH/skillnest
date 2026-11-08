const mongoose = require('mongoose');

/**
 * ForumPost Model — Module 06: Forum & Q&A
 * Represents a forum thread / question posted by any authenticated user.
 * Author: Member 06 (SEU/IS/22/ICT/___) — Feature branch: feature/member-06-forum
 */
const forumPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Thread title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    body: {
      type: String,
      required: [true, 'Thread body / question content is required'],
    },
    category: {
      type: String,
      enum: ['General', 'Course Help', 'Career', 'Bug Report', 'Announcement'],
      default: 'General',
    },
    tags: {
      type: [String],
      default: [],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Post author is required'],
      index: true,
    },
    // Optional link to an existing Course (Module 01 integration)
    courseRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    voteCount: {
      type: Number,
      default: 0,
    },
    // Denormalized count — incremented / decremented on answer create/delete
    answerCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Reference to the accepted ForumAnswer (populated on thread detail)
    acceptedAnswer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ForumAnswer',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common query patterns
forumPostSchema.index({ category: 1 });
forumPostSchema.index({ tags: 1 });
forumPostSchema.index({ isPinned: -1, createdAt: -1 });
forumPostSchema.index({ voteCount: -1 });

module.exports = mongoose.model('ForumPost', forumPostSchema);

