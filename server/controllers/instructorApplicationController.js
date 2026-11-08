const InstructorApplication = require('../models/InstructorApplication');
const User = require('../models/User');

// @desc    Submit instructor application
// @route   POST /api/instructor-applications
// @access  Private (Learner)
const submitApplication = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      expertiseArea,
      qualifications,
      experienceYears,
      bio,
      portfolioUrl,
      resumeUrl,
      sampleCourseProposal,
    } = req.body;

    if (!fullName || !email || !expertiseArea || !bio) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: Full Name, Email, Expertise Area, and Bio.',
      });
    }

    // Check if user already has an active pending application
    const existingPending = await InstructorApplication.findOne({
      applicant: req.user._id,
      status: 'pending',
    });

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending instructor application under review.',
        application: existingPending,
      });
    }

    // Create the instructor application
    const application = await InstructorApplication.create({
      applicant: req.user._id,
      fullName,
      email,
      phone: phone || '',
      expertiseArea,
      qualifications: Array.isArray(qualifications) ? qualifications : qualifications ? [qualifications] : [],
      experienceYears: Number(experienceYears) || 0,
      bio,
      portfolioUrl: portfolioUrl || '',
      resumeUrl: resumeUrl || '',
      sampleCourseProposal: sampleCourseProposal || {
        title: '',
        targetAudience: '',
        briefOutline: '',
      },
      status: 'pending',
      submittedAt: new Date(),
    });

    // Update user instructorStatus to pending
    await User.findByIdAndUpdate(req.user._id, {
      instructorStatus: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Instructor application submitted successfully. It is now pending administrative review.',
      data: application,
    });
  } catch (error) {
    console.error('[Module 2] Error submitting application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit instructor application.',
      error: error.message,
    });
  }
};

// @desc    Get current user's instructor application status
// @route   GET /api/instructor-applications/my-status
// @access  Private
const getMyApplicationStatus = async (req, res) => {
  try {
    const application = await InstructorApplication.findOne({
      applicant: req.user._id,
    }).sort({ submittedAt: -1 });

    if (!application) {
      return res.json({
        success: true,
        hasApplied: false,
        status: 'none',
      });
    }

    res.json({
      success: true,
      hasApplied: true,
      data: application,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching application status.',
      error: error.message,
    });
  }
};

module.exports = {
  submitApplication,
  getMyApplicationStatus,
};

