const InstructorApplication = require('../models/InstructorApplication');
const Course = require('../models/Course');
const ApprovalRecord = require('../models/ApprovalRecord');
const User = require('../models/User');

// =========================================================================
// 1. DASHBOARD OVERVIEW STATISTICS
// =========================================================================
// @desc    Retrieve administrator dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalLearners,
      totalInstructors,
      totalAdmins,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      pendingCourses,
      approvedCourses,
      rejectedCourses,
      recentApprovals,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'learner' }),
      User.countDocuments({ role: 'instructor' }),
      User.countDocuments({ role: 'admin' }),
      InstructorApplication.countDocuments({ status: 'pending' }),
      InstructorApplication.countDocuments({ status: 'approved' }),
      InstructorApplication.countDocuments({ status: 'rejected' }),
      Course.countDocuments({ status: { $in: ['pending_approval', 'pending'] } }),
      Course.countDocuments({ status: 'approved' }),
      Course.countDocuments({ status: 'rejected' }),
      ApprovalRecord.find()
        .populate('reviewer', 'name email avatar')
        .sort({ createdAt: -1 })
        .limit(6),
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          learners: totalLearners,
          instructors: totalInstructors,
          admins: totalAdmins,
        },
        instructorApplications: {
          pending: pendingApplications,
          approved: approvedApplications,
          rejected: rejectedApplications,
          total: pendingApplications + approvedApplications + rejectedApplications,
        },
        courses: {
          pending: pendingCourses,
          approved: approvedCourses,
          rejected: rejectedCourses,
          total: pendingCourses + approvedCourses + rejectedCourses,
        },
        recentApprovals,
      },
    });
  } catch (error) {
    console.error('[Module 2] Error fetching dashboard statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics.',
      error: error.message,
    });
  }
};

// =========================================================================
// 2. INSTRUCTOR APPLICATIONS MANAGEMENT
// =========================================================================
// @desc    Retrieve all instructor applications with filtering & search
// @route   GET /api/admin/applications
// @access  Private (Admin only)
const getAllInstructorApplications = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status.toLowerCase();
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { expertiseArea: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [applications, total] = await Promise.all([
      InstructorApplication.find(query)
        .populate('applicant', 'name email avatar role createdAt')
        .populate('reviewedBy', 'name email')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      InstructorApplication.countDocuments(query),
    ]);

    // Counts for status pills
    const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
      InstructorApplication.countDocuments({ status: 'pending' }),
      InstructorApplication.countDocuments({ status: 'approved' }),
      InstructorApplication.countDocuments({ status: 'rejected' }),
    ]);

    res.json({
      success: true,
      counts: {
        total,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: applications,
    });
  } catch (error) {
    console.error('[Module 2] Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve instructor applications.',
      error: error.message,
    });
  }
};

// @desc    Retrieve individual instructor application by ID
// @route   GET /api/admin/applications/:id
// @access  Private (Admin only)
const getInstructorApplicationById = async (req, res) => {
  try {
    const application = await InstructorApplication.findById(req.params.id)
      .populate('applicant', 'name email avatar role createdAt')
      .populate('reviewedBy', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Instructor application not found.',
      });
    }

    // Historical audit trail for this application
    const history = await ApprovalRecord.find({
      targetType: 'InstructorApplication',
      targetId: application._id,
    })
      .populate('reviewer', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: application,
      history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve application details.',
      error: error.message,
    });
  }
};

// @desc    Approve instructor application
// @route   PUT /api/admin/applications/:id/approve
// @access  Private (Admin only)
const approveInstructorApplication = async (req, res) => {
  try {
    const { remarks } = req.body;
    const application = await InstructorApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Instructor application not found.',
      });
    }

    const previousStatus = application.status;

    // Update Application
    application.status = 'approved';
    application.reviewedBy = req.user._id;
    application.reviewDate = new Date();
    application.remarks = remarks || 'Application approved by administrator.';
    await application.save();

    // Update Applicant User: Upgrade role to instructor & instructorStatus to approved
    const user = await User.findById(application.applicant);
    if (user) {
      user.role = 'instructor';
      user.instructorStatus = 'approved';
      if (!user.bio && application.bio) {
        user.bio = application.bio;
      }
      await user.save();
    }

    // Create Audit Approval Record
    const record = await ApprovalRecord.create({
      targetType: 'InstructorApplication',
      targetId: application._id,
      reviewer: req.user._id,
      action: 'approved',
      previousStatus,
      newStatus: 'approved',
      remarks: application.remarks,
      metadata: {
        targetName: application.fullName,
        email: application.email,
        expertiseArea: application.expertiseArea,
      },
    });

    const populatedApp = await InstructorApplication.findById(application._id)
      .populate('applicant', 'name email avatar role')
      .populate('reviewedBy', 'name email');

    res.json({
      success: true,
      message: `Instructor application for ${application.fullName} has been approved.`,
      data: populatedApp,
      approvalRecord: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to approve instructor application.',
      error: error.message,
    });
  }
};

// @desc    Reject instructor application
// @route   PUT /api/admin/applications/:id/reject
// @access  Private (Admin only)
const rejectInstructorApplication = async (req, res) => {
  try {
    const { remarks } = req.body;

    if (!remarks || !remarks.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rejection remarks/reason are required.',
      });
    }

    const application = await InstructorApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Instructor application not found.',
      });
    }

    const previousStatus = application.status;

    application.status = 'rejected';
    application.reviewedBy = req.user._id;
    application.reviewDate = new Date();
    application.remarks = remarks.trim();
    await application.save();

    // Update User status
    const user = await User.findById(application.applicant);
    if (user) {
      user.instructorStatus = 'rejected';
      if (user.role === 'instructor') {
        user.role = 'learner';
      }
      await user.save();
    }

    // Create Audit Approval Record
    const record = await ApprovalRecord.create({
      targetType: 'InstructorApplication',
      targetId: application._id,
      reviewer: req.user._id,
      action: 'rejected',
      previousStatus,
      newStatus: 'rejected',
      remarks: application.remarks,
      metadata: {
        targetName: application.fullName,
        email: application.email,
        expertiseArea: application.expertiseArea,
      },
    });

    const populatedApp = await InstructorApplication.findById(application._id)
      .populate('applicant', 'name email avatar role')
      .populate('reviewedBy', 'name email');

    res.json({
      success: true,
      message: `Instructor application for ${application.fullName} has been rejected.`,
      data: populatedApp,
      approvalRecord: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reject instructor application.',
      error: error.message,
    });
  }
};

// @desc    Undo / Reset instructor application status to pending
// @route   PUT /api/admin/applications/:id/undo
// @access  Private (Admin only)
const undoInstructorApplicationStatus = async (req, res) => {
  try {
    const application = await InstructorApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Instructor application not found.',
      });
    }

    const previousStatus = application.status;
    application.status = 'pending';
    application.reviewedBy = null;
    application.reviewDate = null;
    application.remarks = 'Decision reverted by administrator.';
    await application.save();

    // Revert user role back to learner
    const user = await User.findById(application.applicant);
    if (user) {
      user.role = 'learner';
      user.instructorStatus = 'pending';
      await user.save();
    }

    const record = await ApprovalRecord.create({
      targetType: 'InstructorApplication',
      targetId: application._id,
      reviewer: req.user._id,
      action: 'reset',
      previousStatus,
      newStatus: 'pending',
      remarks: 'Application status reset back to Pending review.',
      metadata: {
        targetName: application.fullName,
        email: application.email,
      },
    });

    const populatedApp = await InstructorApplication.findById(application._id)
      .populate('applicant', 'name email avatar role')
      .populate('reviewedBy', 'name email');

    res.json({
      success: true,
      message: `Application for ${application.fullName} has been reverted to Pending.`,
      data: populatedApp,
      approvalRecord: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reset application status.',
      error: error.message,
    });
  }
};

// =========================================================================
// 3. COURSE APPROVAL MANAGEMENT
// =========================================================================
// @desc    Retrieve courses with status filter and search
// @route   GET /api/admin/courses
// @access  Private (Admin only)
const getAllCourses = async (req, res) => {
  try {
    const { status, search, category, page = 1, limit = 50 } = req.query;

    const query = {};

    if (status && status !== 'all') {
      if (status === 'pending') {
        query.status = { $in: ['pending_approval', 'pending'] };
      } else {
        query.status = status.toLowerCase();
      }
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate('instructor', 'name email avatar bio')
        .populate('reviewedBy', 'name email')
        .populate({
          path: 'structures',
          populate: { path: 'materials' },
        })
        .sort({ submissionDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Course.countDocuments(query),
    ]);

    const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
      Course.countDocuments({ status: { $in: ['pending_approval', 'pending'] } }),
      Course.countDocuments({ status: 'approved' }),
      Course.countDocuments({ status: 'rejected' }),
    ]);

    res.json({
      success: true,
      counts: {
        total,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: courses,
    });
  } catch (error) {
    console.error('[Module 2] Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve courses.',
      error: error.message,
    });
  }
};

// @desc    Retrieve pending courses specifically
// @route   GET /api/admin/courses/pending
// @access  Private (Admin only)
const getPendingCourses = async (req, res) => {
  try {
    const pendingCourses = await Course.find({
      status: { $in: ['pending_approval', 'pending'] },
    })
      .populate('instructor', 'name email avatar')
      .populate({
        path: 'structures',
        populate: { path: 'materials' },
      })
      .sort({ submissionDate: -1, createdAt: -1 });

    res.json({
      success: true,
      count: pendingCourses.length,
      data: pendingCourses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pending courses.',
      error: error.message,
    });
  }
};

// @desc    Retrieve individual course by ID with detailed syllabus and materials
// @route   GET /api/admin/courses/:id
// @access  Private (Admin only)
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email avatar bio')
      .populate('reviewedBy', 'name email')
      .populate({
        path: 'structures',
        populate: { path: 'materials' },
      });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    // Historical audit trail for this course
    const history = await ApprovalRecord.find({
      targetType: 'Course',
      targetId: course._id,
    })
      .populate('reviewer', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: course,
      history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve course details.',
      error: error.message,
    });
  }
};

// @desc    Approve submitted course
// @route   PUT /api/admin/courses/:id/approve
// @access  Private (Admin only)
const approveCourse = async (req, res) => {
  try {
    const { remarks } = req.body;
    const course = await Course.findById(req.params.id).populate('instructor', 'name email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    const previousStatus = course.status;

    course.status = 'approved';
    course.reviewedBy = req.user._id;
    course.reviewedDate = new Date();
    course.rejectionReason = ''; // Clear previous rejection if any
    await course.save();

    // Create Audit Approval Record
    const record = await ApprovalRecord.create({
      targetType: 'Course',
      targetId: course._id,
      reviewer: req.user._id,
      action: 'approved',
      previousStatus,
      newStatus: 'approved',
      remarks: remarks || 'Course approved for publication on SkillNest.',
      metadata: {
        title: course.title,
        category: course.category,
        targetName: course.instructor?.name || 'Instructor',
      },
    });

    const populatedCourse = await Course.findById(course._id)
      .populate('instructor', 'name email avatar')
      .populate('reviewedBy', 'name email');

    res.json({
      success: true,
      message: `Course "${course.title}" has been approved and published to learners.`,
      data: populatedCourse,
      approvalRecord: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to approve course.',
      error: error.message,
    });
  }
};

// @desc    Reject submitted course with reasons
// @route   PUT /api/admin/courses/:id/reject
// @access  Private (Admin only)
const rejectCourse = async (req, res) => {
  try {
    const { remarks } = req.body;

    if (!remarks || !remarks.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason/remarks are required.',
      });
    }

    const course = await Course.findById(req.params.id).populate('instructor', 'name email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    const previousStatus = course.status;

    course.status = 'rejected';
    course.reviewedBy = req.user._id;
    course.reviewedDate = new Date();
    course.rejectionReason = remarks.trim();
    await course.save();

    // Create Audit Approval Record
    const record = await ApprovalRecord.create({
      targetType: 'Course',
      targetId: course._id,
      reviewer: req.user._id,
      action: 'rejected',
      previousStatus,
      newStatus: 'rejected',
      remarks: remarks.trim(),
      metadata: {
        title: course.title,
        category: course.category,
        targetName: course.instructor?.name || 'Instructor',
      },
    });

    const populatedCourse = await Course.findById(course._id)
      .populate('instructor', 'name email avatar')
      .populate('reviewedBy', 'name email');

    res.json({
      success: true,
      message: `Course "${course.title}" has been rejected.`,
      data: populatedCourse,
      approvalRecord: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reject course.',
      error: error.message,
    });
  }
};

// @desc    Undo / Reset course approval status to pending_approval
// @route   PUT /api/admin/courses/:id/undo
// @access  Private (Admin only)
const undoCourseStatus = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    const previousStatus = course.status;
    course.status = 'pending_approval';
    course.reviewedBy = null;
    course.reviewedDate = null;
    course.rejectionReason = '';
    await course.save();

    const record = await ApprovalRecord.create({
      targetType: 'Course',
      targetId: course._id,
      reviewer: req.user._id,
      action: 'reset',
      previousStatus,
      newStatus: 'pending_approval',
      remarks: 'Course review status reverted back to Pending Review.',
      metadata: {
        title: course.title,
        category: course.category,
      },
    });

    const populatedCourse = await Course.findById(course._id)
      .populate('instructor', 'name email avatar')
      .populate('reviewedBy', 'name email');

    res.json({
      success: true,
      message: `Course "${course.title}" status reverted to Pending Review.`,
      data: populatedCourse,
      approvalRecord: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reset course status.',
      error: error.message,
    });
  }
};

// =========================================================================
// 4. APPROVAL HISTORY AUDIT LOGS
// =========================================================================
// @desc    Retrieve approval history
// @route   GET /api/admin/approvals/history
// @access  Private (Admin only)
const getApprovalHistory = async (req, res) => {
  try {
    const { targetType, action, page = 1, limit = 20 } = req.query;

    const query = {};

    if (targetType && targetType !== 'all') {
      query.targetType = targetType;
    }

    if (action && action !== 'all') {
      query.action = action;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [records, total] = await Promise.all([
      ApprovalRecord.find(query)
        .populate('reviewer', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ApprovalRecord.countDocuments(query),
    ]);

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: records,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve approval history.',
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllInstructorApplications,
  getInstructorApplicationById,
  approveInstructorApplication,
  rejectInstructorApplication,
  undoInstructorApplicationStatus,
  getAllCourses,
  getPendingCourses,
  getCourseById,
  approveCourse,
  rejectCourse,
  undoCourseStatus,
  getApprovalHistory,
};

