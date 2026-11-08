const ForumPost = require('../models/ForumPost');
const ForumAnswer = require('../models/ForumAnswer');

/**
 * forumController.js — Module 06: Forum & Q&A
 * Handles all CRUD operations, voting, pinning, closing, and answer acceptance.
 * Reuses existing protect / requireRoles middleware — no new auth code.
 * Author: Member 06 (SEU/IS/22/ICT/___) — Branch: feature/member-06-forum
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

const POSTS_PER_PAGE = 10;

const populatePost = (query) =>
  query
    .populate('author', 'name email avatar role')
    .populate('acceptedAnswer')
    .populate('courseRef', 'title');

// ─── FORUM POST (THREAD) CONTROLLERS ─────────────────────────────────────────

// @desc    Get all forum posts (paginated, filterable)
// @route   GET /api/forum/posts
// @access  Public
const getPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = POSTS_PER_PAGE,
      category,
      tag,
      search,
      sort = 'latest',
      unanswered,
    } = req.query;

    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }
    if (tag) {
      filter.tags = { $in: [tag] };
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    if (unanswered === 'true') {
      filter.answerCount = 0;
    }

    const sortMap = {
      latest: { isPinned: -1, createdAt: -1 },
      votes: { isPinned: -1, voteCount: -1, createdAt: -1 },
      unanswered: { isPinned: -1, answerCount: 1, createdAt: -1 },
    };
    const sortOrder = sortMap[sort] || sortMap.latest;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await ForumPost.countDocuments(filter);

    const posts = await ForumPost.find(filter)
      .populate('author', 'name email avatar role')
      .populate('courseRef', 'title')
      .sort(sortOrder)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      count: posts.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      posts,
    });
  } catch (error) {
    console.error('[Forum] getPosts error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get a single forum post by ID (increments viewCount)
// @route   GET /api/forum/posts/:id
// @access  Public
const getPostById = async (req, res) => {
  try {
    const post = await populatePost(
      ForumPost.findByIdAndUpdate(
        req.params.id,
        { $inc: { viewCount: 1 } },
        { new: true }
      )
    );

    if (!post) {
      return res.status(404).json({ success: false, message: 'Forum thread not found.' });
    }

    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new forum thread
// @route   POST /api/forum/posts
// @access  Private (all authenticated roles)
const createPost = async (req, res) => {
  try {
    const { title, body, category, tags, courseRef } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Title and body are required.',
      });
    }

    const parsedTags = Array.isArray(tags)
      ? tags.map((t) => t.trim()).filter(Boolean)
      : typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const post = await ForumPost.create({
      title: title.trim(),
      body: body.trim(),
      category: category || 'General',
      tags: parsedTags,
      author: req.user._id,
      courseRef: courseRef || null,
    });

    const populated = await populatePost(ForumPost.findById(post._id));

    res.status(201).json({
      success: true,
      message: 'Forum thread created successfully.',
      post: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a forum post (author only)
// @route   PUT /api/forum/posts/:id
// @access  Private (author only)
const updatePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Thread not found.' });
    }

    const isAuthor = post.author.toString() === req.user._id.toString();
    if (!isAuthor && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the thread author or an admin can edit this post.',
      });
    }

    const { title, body, category, tags } = req.body;
    if (title) post.title = title.trim();
    if (body) post.body = body.trim();
    if (category) post.category = category;
    if (tags !== undefined) {
      post.tags = Array.isArray(tags)
        ? tags.map((t) => t.trim()).filter(Boolean)
        : typeof tags === 'string'
        ? tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];
    }

    await post.save();
    const populated = await populatePost(ForumPost.findById(post._id));
    res.json({ success: true, message: 'Thread updated.', post: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a forum post and all its answers
// @route   DELETE /api/forum/posts/:id
// @access  Private (author or admin)
const deletePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Thread not found.' });
    }

    const isAuthor = post.author.toString() === req.user._id.toString();
    if (!isAuthor && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the thread author or an admin can delete this post.',
      });
    }

    await ForumAnswer.deleteMany({ post: post._id });
    await post.deleteOne();

    res.json({ success: true, message: 'Thread and all its answers deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Vote on a forum post (up or down)
// @route   PATCH /api/forum/posts/:id/vote
// @access  Private (authenticated)
const votePost = async (req, res) => {
  try {
    const { direction } = req.body; // 'up' | 'down'
    if (!['up', 'down'].includes(direction)) {
      return res.status(400).json({ success: false, message: "Direction must be 'up' or 'down'." });
    }

    const delta = direction === 'up' ? 1 : -1;
    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { voteCount: delta } },
      { new: true }
    ).populate('author', 'name avatar role');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Thread not found.' });
    }

    res.json({ success: true, voteCount: post.voteCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle pin on a forum post
// @route   PATCH /api/forum/posts/:id/pin
// @access  Private (admin only)
const togglePinPost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Thread not found.' });

    post.isPinned = !post.isPinned;
    await post.save();

    res.json({
      success: true,
      message: post.isPinned ? 'Thread pinned.' : 'Thread unpinned.',
      isPinned: post.isPinned,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle close on a forum post (no more answers)
// @route   PATCH /api/forum/posts/:id/close
// @access  Private (author or admin)
const toggleClosePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Thread not found.' });

    const isAuthor = post.author.toString() === req.user._id.toString();
    if (!isAuthor && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorised to close this thread.' });
    }

    post.isClosed = !post.isClosed;
    await post.save();

    res.json({
      success: true,
      message: post.isClosed ? 'Thread closed.' : 'Thread reopened.',
      isClosed: post.isClosed,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── FORUM ANSWER CONTROLLERS ─────────────────────────────────────────────────

// @desc    Get all answers for a post
// @route   GET /api/forum/posts/:id/answers
// @access  Public
const getAnswers = async (req, res) => {
  try {
    const answers = await ForumAnswer.find({ post: req.params.id })
      .populate('author', 'name email avatar role')
      .sort({ isAccepted: -1, voteCount: -1, createdAt: 1 })
      .lean();

    res.json({ success: true, count: answers.length, answers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Post an answer to a thread
// @route   POST /api/forum/posts/:id/answers
// @access  Private (authenticated)
const createAnswer = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Thread not found.' });
    if (post.isClosed) {
      return res.status(400).json({ success: false, message: 'This thread is closed. No new answers are allowed.' });
    }

    const { body } = req.body;
    if (!body || body.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Answer must be at least 5 characters.' });
    }

    const answer = await ForumAnswer.create({
      post: post._id,
      author: req.user._id,
      body: body.trim(),
    });

    // Increment the denormalized answer count on the parent post
    await ForumPost.findByIdAndUpdate(post._id, { $inc: { answerCount: 1 } });

    const populated = await ForumAnswer.findById(answer._id).populate(
      'author',
      'name email avatar role'
    );

    res.status(201).json({
      success: true,
      message: 'Answer posted successfully.',
      answer: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an answer (author only)
// @route   PUT /api/forum/answers/:answerId
// @access  Private (author only)
const updateAnswer = async (req, res) => {
  try {
    const answer = await ForumAnswer.findById(req.params.answerId);
    if (!answer) return res.status(404).json({ success: false, message: 'Answer not found.' });

    const isAuthor = answer.author.toString() === req.user._id.toString();
    if (!isAuthor && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the answer author or an admin can edit this answer.' });
    }

    const { body } = req.body;
    if (!body || body.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Answer must be at least 5 characters.' });
    }
    answer.body = body.trim();
    await answer.save();

    const populated = await ForumAnswer.findById(answer._id).populate(
      'author',
      'name email avatar role'
    );
    res.json({ success: true, message: 'Answer updated.', answer: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an answer (author or admin)
// @route   DELETE /api/forum/answers/:answerId
// @access  Private (author or admin)
const deleteAnswer = async (req, res) => {
  try {
    const answer = await ForumAnswer.findById(req.params.answerId);
    if (!answer) return res.status(404).json({ success: false, message: 'Answer not found.' });

    const isAuthor = answer.author.toString() === req.user._id.toString();
    if (!isAuthor && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the answer author or an admin can delete this answer.' });
    }

    // If the deleted answer was accepted, clear it from parent post
    await ForumPost.updateOne(
      { _id: answer.post, acceptedAnswer: answer._id },
      { $set: { acceptedAnswer: null } }
    );
    // Also unset isAccepted on this answer (soft consistency)
    await ForumAnswer.updateOne({ _id: answer._id, isAccepted: true }, { $set: { isAccepted: false } });

    await answer.deleteOne();

    // Decrement answer count on parent post
    await ForumPost.findByIdAndUpdate(answer.post, { $inc: { answerCount: -1 } });

    res.json({ success: true, message: 'Answer deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Vote on an answer (up or down)
// @route   PATCH /api/forum/answers/:answerId/vote
// @access  Private (authenticated)
const voteAnswer = async (req, res) => {
  try {
    const { direction } = req.body;
    if (!['up', 'down'].includes(direction)) {
      return res.status(400).json({ success: false, message: "Direction must be 'up' or 'down'." });
    }

    const delta = direction === 'up' ? 1 : -1;
    const answer = await ForumAnswer.findByIdAndUpdate(
      req.params.answerId,
      { $inc: { voteCount: delta } },
      { new: true }
    );

    if (!answer) return res.status(404).json({ success: false, message: 'Answer not found.' });

    res.json({ success: true, voteCount: answer.voteCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Accept an answer as the solution (thread author only)
// @route   PATCH /api/forum/answers/:answerId/accept
// @access  Private (thread author only)
const acceptAnswer = async (req, res) => {
  try {
    const answer = await ForumAnswer.findById(req.params.answerId);
    if (!answer) return res.status(404).json({ success: false, message: 'Answer not found.' });

    const post = await ForumPost.findById(answer.post);
    if (!post) return res.status(404).json({ success: false, message: 'Parent thread not found.' });

    const isPostAuthor = post.author.toString() === req.user._id.toString();
    if (!isPostAuthor && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the thread author can accept an answer.',
      });
    }

    // If clicking the same answer again, toggle it off
    const alreadyAccepted = post.acceptedAnswer?.toString() === answer._id.toString();

    // Unaccept all answers for this post first
    await ForumAnswer.updateMany({ post: post._id }, { $set: { isAccepted: false } });

    if (alreadyAccepted) {
      post.acceptedAnswer = null;
    } else {
      answer.isAccepted = true;
      await answer.save();
      post.acceptedAnswer = answer._id;
    }

    await post.save();

    res.json({
      success: true,
      message: alreadyAccepted ? 'Answer acceptance removed.' : 'Answer accepted as solution.',
      acceptedAnswer: post.acceptedAnswer,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get forum statistics (admin only)
// @route   GET /api/forum/stats
// @access  Private (admin)
const getForumStats = async (req, res) => {
  try {
    const [totalPosts, totalAnswers, unanswered, pinnedCount] = await Promise.all([
      ForumPost.countDocuments(),
      ForumAnswer.countDocuments(),
      ForumPost.countDocuments({ answerCount: 0 }),
      ForumPost.countDocuments({ isPinned: true }),
    ]);

    const categoryBreakdown = await ForumPost.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalPosts,
        totalAnswers,
        unanswered,
        pinnedCount,
        categoryBreakdown,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  votePost,
  togglePinPost,
  toggleClosePost,
  getAnswers,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  voteAnswer,
  acceptAnswer,
  getForumStats,
};

