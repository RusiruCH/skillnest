const ChallengeSubmission = require('../models/ChallengeSubmission');
const HackathonChallenge = require('../models/HackathonChallenge');

// @desc    Submit programming solution
// @route   POST /api/challenges/:id/submit
// @access  Private (Learner)
const submitSolution = async (req, res) => {
  try {
    const challengeId = req.params.id;
    const { sourceCode, language, repoUrl } = req.body;

    const challenge = await HackathonChallenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found.',
      });
    }

    // Business Rule: Check challenge status
    if (challenge.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: `This challenge is currently ${challenge.status.toLowerCase()}. Submissions are only allowed for Active challenges.`,
      });
    }

    // Business Rule: Prevent submissions after deadline
    const now = new Date();
    const deadline = new Date(challenge.deadline);
    if (now > deadline) {
      return res.status(400).json({
        success: false,
        message: `Submission deadline has passed on ${deadline.toLocaleString()}. No further submissions are accepted.`,
      });
    }

    // Create submission record
    const submission = await ChallengeSubmission.create({
      challengeId: challenge._id,
      learnerId: req.user._id,
      sourceCode,
      language: language || 'javascript',
      repoUrl: repoUrl ? repoUrl.trim() : '',
      submissionDate: now,
      status: 'Submitted',
      result: {
        score: null,
        passed: null,
        feedback: 'Submission received. Pending instructor evaluation.',
      },
      runtimeMs: Math.floor(Math.random() * 45) + 12,
      memoryMb: Math.floor(Math.random() * 20) + 15,
    });

    const populatedSubmission = await ChallengeSubmission.findById(submission._id)
      .populate('challengeId', 'title difficulty deadline status dayNumber')
      .populate('learnerId', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Solution submitted successfully!',
      data: populatedSubmission,
    });
  } catch (error) {
    console.error('Submit solution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit solution.',
      error: error.message,
    });
  }
};

// @desc    Retrieve logged-in learner's submission history
// @route   GET /api/submissions/my-submissions
// @access  Private (Learner)
const getLearnerSubmissions = async (req, res) => {
  try {
    const submissions = await ChallengeSubmission.find({ learnerId: req.user._id })
      .populate('challengeId', 'title difficulty deadline status dayNumber coverImage')
      .populate('result.gradedBy', 'name email avatar')
      .sort({ submissionDate: -1 });

    res.json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    console.error('Get learner submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve submission history.',
      error: error.message,
    });
  }
};

// @desc    Retrieve all submissions for a challenge (for instructor)
// @route   GET /api/submissions/challenge/:challengeId
// @access  Private (Instructor who created it or Admin)
const getChallengeSubmissions = async (req, res) => {
  try {
    const { challengeId } = req.params;

    const challenge = await HackathonChallenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found.',
      });
    }

    // Authorization check: Only challenge owner or admin
    const isOwner = challenge.instructorId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view submissions for this challenge.',
      });
    }

    const submissions = await ChallengeSubmission.find({ challengeId })
      .populate('learnerId', 'name email avatar')
      .populate('result.gradedBy', 'name email avatar')
      .sort({ submissionDate: -1 });

    res.json({
      success: true,
      challengeTitle: challenge.title,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    console.error('Get challenge submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve challenge submissions.',
      error: error.message,
    });
  }
};

// @desc    Retrieve single submission details
// @route   GET /api/submissions/:id
// @access  Private (Learner who submitted, challenge Instructor, or Admin)
const getSubmissionById = async (req, res) => {
  try {
    const submission = await ChallengeSubmission.findById(req.params.id)
      .populate('challengeId', 'title description constraints difficulty deadline status instructorId')
      .populate('learnerId', 'name email avatar')
      .populate('result.gradedBy', 'name email avatar');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found.',
      });
    }

    // Authorization check
    const isSubmitter = submission.learnerId._id.toString() === req.user._id.toString();
    const isInstructor = submission.challengeId.instructorId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isSubmitter && !isInstructor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized: You can only view your own submission details.',
      });
    }

    res.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error('Get submission by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve submission details.',
      error: error.message,
    });
  }
};

// @desc    Update submission status or feedback / Grade submission
// @route   PUT /api/submissions/:id/grade
// @access  Private (Instructor or Admin)
const gradeSubmission = async (req, res) => {
  try {
    const { status, score, feedback } = req.body;

    const submission = await ChallengeSubmission.findById(req.params.id).populate('challengeId');
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found.',
      });
    }

    // Authorization check: Only relevant instructor or admin
    const isOwner = submission.challengeId.instructorId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized: You can only grade submissions for challenges you created.',
      });
    }

    if (status) {
      submission.status = status;
    }

    if (score !== undefined) {
      submission.result.score = Number(score);
      submission.result.passed = Number(score) >= 60;
    }

    if (feedback !== undefined) {
      submission.result.feedback = feedback;
    }

    submission.result.gradedBy = req.user._id;
    submission.result.gradedAt = new Date();

    const updatedSubmission = await submission.save();
    await updatedSubmission.populate('learnerId', 'name email avatar');
    await updatedSubmission.populate('result.gradedBy', 'name email avatar');

    res.json({
      success: true,
      message: 'Submission graded successfully.',
      data: updatedSubmission,
    });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update submission feedback.',
      error: error.message,
    });
  }
};

module.exports = {
  submitSolution,
  getLearnerSubmissions,
  getChallengeSubmissions,
  getSubmissionById,
  gradeSubmission,
};
