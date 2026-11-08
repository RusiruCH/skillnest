const HackathonChallenge = require('../models/HackathonChallenge');
const ChallengeSubmission = require('../models/ChallengeSubmission');

// @desc    Create a new hackathon challenge
// @route   POST /api/challenges
// @access  Private (Instructor or Admin)
const createChallenge = async (req, res) => {
  try {
    const {
      title,
      description,
      inputRequirements,
      outputRequirements,
      constraints,
      difficulty,
      deadline,
      sampleTestCase,
      tags,
      starterCode,
      coverImage,
      dayNumber,
      status,
    } = req.body;

    // Business rule: Instructor status check if specified in user schema
    if (
      req.user.role === 'instructor' &&
      req.user.instructorStatus &&
      req.user.instructorStatus === 'rejected'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Your instructor account is not approved to publish challenges.',
      });
    }

    const challenge = await HackathonChallenge.create({
      title: title.trim(),
      description,
      inputRequirements: inputRequirements || 'Standard input via function parameter.',
      outputRequirements: outputRequirements || 'Return result matching specification.',
      constraints,
      difficulty,
      instructorId: req.user._id,
      deadline,
      sampleTestCase: sampleTestCase || {
        input: 'sampleInput = [1, 2, 3]',
        output: 'sampleOutput = 6',
        explanation: 'Sum of elements is 6',
      },
      tags: Array.isArray(tags)
        ? tags
        : typeof tags === 'string'
        ? tags.split(',').map((t) => t.trim())
        : ['Algorithms'],
      starterCode: starterCode || {},
      coverImage: coverImage || '',
      dayNumber: dayNumber || 1,
      status: status || 'Active',
    });

    const populatedChallenge = await HackathonChallenge.findById(challenge._id).populate(
      'instructorId',
      'name email avatar role'
    );

    res.status(201).json({
      success: true,
      message: 'Challenge created successfully.',
      data: populatedChallenge,
    });
  } catch (error) {
    console.error('Create challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create challenge.',
      error: error.message,
    });
  }
};

// @desc    Retrieve all active challenges (with search & filters)
// @route   GET /api/challenges
// @access  Public
const getChallenges = async (req, res) => {
  try {
    const { search, difficulty, status, tag, sort } = req.query;

    const query = {};

    // Filter by status (default to Active if not specified, or show all if status='all')
    if (status && status !== 'all') {
      query.status = status;
    } else if (!status) {
      query.status = 'Active';
    }

    // Filter by difficulty
    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    // Filter by tag
    if (tag) {
      query.tags = { $in: [tag] };
    }

    // Keyword search in title or description
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { tags: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'deadline_asc') sortOption = { deadline: 1 };
    if (sort === 'deadline_desc') sortOption = { deadline: -1 };
    if (sort === 'difficulty_asc') sortOption = { difficulty: 1 };

    const challenges = await HackathonChallenge.find(query)
      .populate('instructorId', 'name email avatar role')
      .populate('submissionsCount')
      .sort(sortOption);

    res.json({
      success: true,
      count: challenges.length,
      data: challenges,
    });
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve challenges.',
      error: error.message,
    });
  }
};

// @desc    Retrieve single challenge details
// @route   GET /api/challenges/:id
// @access  Public
const getChallengeById = async (req, res) => {
  try {
    const challenge = await HackathonChallenge.findById(req.params.id)
      .populate('instructorId', 'name email avatar role')
      .populate('submissionsCount');

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found.',
      });
    }

    res.json({
      success: true,
      data: challenge,
    });
  } catch (error) {
    console.error('Get challenge by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve challenge details.',
      error: error.message,
    });
  }
};

// @desc    Update challenge
// @route   PUT /api/challenges/:id
// @access  Private (Instructor who created it or Admin)
const updateChallenge = async (req, res) => {
  try {
    let challenge = await HackathonChallenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found.',
      });
    }

    // Authorization check: Only relevant instructor or admin
    const isOwner = challenge.instructorId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized: You can only edit challenges that you created.',
      });
    }

    const {
      title,
      description,
      inputRequirements,
      outputRequirements,
      constraints,
      difficulty,
      deadline,
      sampleTestCase,
      tags,
      starterCode,
      coverImage,
      dayNumber,
      status,
    } = req.body;

    if (title) challenge.title = title.trim();
    if (description) challenge.description = description;
    if (inputRequirements) challenge.inputRequirements = inputRequirements;
    if (outputRequirements) challenge.outputRequirements = outputRequirements;
    if (constraints) challenge.constraints = constraints;
    if (difficulty) challenge.difficulty = difficulty;
    if (deadline) challenge.deadline = deadline;
    if (sampleTestCase) challenge.sampleTestCase = sampleTestCase;
    if (tags) {
      challenge.tags = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim());
    }
    if (starterCode) challenge.starterCode = starterCode;
    if (coverImage !== undefined) challenge.coverImage = coverImage;
    if (dayNumber !== undefined) challenge.dayNumber = dayNumber;
    if (status) challenge.status = status;

    const updatedChallenge = await challenge.save();
    await updatedChallenge.populate('instructorId', 'name email avatar role');

    res.json({
      success: true,
      message: 'Challenge updated successfully.',
      data: updatedChallenge,
    });
  } catch (error) {
    console.error('Update challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update challenge.',
      error: error.message,
    });
  }
};

// @desc    Delete challenge
// @route   DELETE /api/challenges/:id
// @access  Private (Instructor who created it or Admin)
const deleteChallenge = async (req, res) => {
  try {
    const challenge = await HackathonChallenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found.',
      });
    }

    // Authorization check: Only relevant instructor or admin
    const isOwner = challenge.instructorId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized: You can only delete challenges that you created.',
      });
    }

    // Cascade delete associated submissions
    await ChallengeSubmission.deleteMany({ challengeId: challenge._id });
    await challenge.deleteOne();

    res.json({
      success: true,
      message: 'Challenge and all related submissions deleted successfully.',
    });
  } catch (error) {
    console.error('Delete challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete challenge.',
      error: error.message,
    });
  }
};

// @desc    Retrieve challenges created by the logged-in instructor
// @route   GET /api/challenges/instructor/my-challenges
// @access  Private (Instructor or Admin)
const getInstructorChallenges = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { instructorId: req.user._id };

    const challenges = await HackathonChallenge.find(query)
      .populate('instructorId', 'name email avatar role')
      .populate('submissionsCount')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: challenges.length,
      data: challenges,
    });
  } catch (error) {
    console.error('Get instructor challenges error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve instructor challenges.',
      error: error.message,
    });
  }
};

// @desc    Get summary statistics for instructor dashboard
// @route   GET /api/challenges/stats/summary
// @access  Private (Instructor or Admin)
const getChallengeStats = async (req, res) => {
  try {
    const instructorQuery = req.user.role === 'admin' ? {} : { instructorId: req.user._id };

    const challenges = await HackathonChallenge.find(instructorQuery);
    const challengeIds = challenges.map((c) => c._id);

    const totalChallenges = challenges.length;
    const activeChallenges = challenges.filter((c) => c.status === 'Active').length;

    const totalSubmissions = await ChallengeSubmission.countDocuments({
      challengeId: { $in: challengeIds },
    });

    const pendingEvaluations = await ChallengeSubmission.countDocuments({
      challengeId: { $in: challengeIds },
      status: { $in: ['Submitted', 'Evaluating'] },
    });

    const acceptedSubmissions = await ChallengeSubmission.countDocuments({
      challengeId: { $in: challengeIds },
      status: 'Accepted',
    });

    res.json({
      success: true,
      data: {
        totalChallenges,
        activeChallenges,
        totalSubmissions,
        pendingEvaluations,
        acceptedSubmissions,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load challenge statistics.',
      error: error.message,
    });
  }
};

module.exports = {
  createChallenge,
  getChallenges,
  getChallengeById,
  updateChallenge,
  deleteChallenge,
  getInstructorChallenges,
  getChallengeStats,
};
