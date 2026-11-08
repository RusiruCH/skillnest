const Course = require('../models/Course');
const CourseStructure = require('../models/CourseStructure');
const LearningMaterial = require('../models/LearningMaterial');

// @desc    Get all approved courses for learners/public
// @route   GET /api/courses
// @access  Public
const getPublicCourses = async (req, res) => {
  try {
    const { category, level, search, page = 1, limit = 9, sort = 'newest' } = req.query;

    const query = { status: 'approved' };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (level && level !== 'All Levels') {
      query.level = level;
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { subtitle: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { tags: { $in: [new RegExp(search.trim(), 'i')] } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'popular') sortOption = { enrolledCount: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Course.countDocuments(query);

    const courses = await Course.find(query)
      .populate('instructor', 'name avatar bio')
      .populate({
        path: 'structures',
        select: 'title order durationMinutes',
      })
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: courses.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching course list.',
    });
  }
};

// @desc    Get all courses created by the authenticated instructor
// @route   GET /api/courses/my-courses
// @access  Private (Instructor only)
const getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id })
      .populate({
        path: 'structures',
        select: 'title order durationMinutes',
        populate: {
          path: 'materials',
          select: 'title materialType order',
        },
      })
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching instructor courses.',
    });
  }
};

// @desc    Get single course with its syllabus and learning materials
// @route   GET /api/courses/:id
// @access  Public / Authenticated
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar bio email')
      .populate({
        path: 'structures',
        options: { sort: { order: 1 } },
        populate: {
          path: 'materials',
          options: { sort: { order: 1 } },
        },
      });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found with the requested ID.',
      });
    }

    // Role check: If not approved, only the course owner or admin can view
    const isOwner = req.user && course.instructor._id.toString() === req.user.id;
    const isAdmin = req.user && req.user.role === 'admin';

    if (course.status !== 'approved' && !isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'This course is currently undergoing review and is not published yet.',
      });
    }

    res.json({
      success: true,
      course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching course details.',
    });
  }
};

// @desc    Create a new course (draft mode)
// @route   POST /api/courses
// @access  Private (Instructor / Admin)
const createCourse = async (req, res) => {
  try {
    // Business Rule: Only approved instructors (or admin) can create courses
    if (req.user.role === 'instructor' && req.user.instructorStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: "Only approved instructors can create courses. Your instructor status is '" + (req.user.instructorStatus || 'none') + "'. Please obtain administrator approval first.",
      });
    }
    const {
      title,
      subtitle,
      description,
      category,
      level,
      thumbnail,
      prerequisites,
      learningOutcomes,
      tags,
    } = req.body;

    const course = await Course.create({
      title,
      subtitle,
      description,
      category,
      level,
      thumbnail: thumbnail || undefined,
      prerequisites: prerequisites || [],
      learningOutcomes: learningOutcomes || [],
      tags: tags || [],
      instructor: req.user.id,
      status: 'draft',
    });

    res.status(201).json({
      success: true,
      message: 'Course created in draft mode. You can now build the curriculum.',
      course,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create course.',
    });
  }
};

// @desc    Update course details
// @route   PUT /api/courses/:id
// @access  Private (Instructor Owner / Admin)
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    // Authorization check
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this course.',
      });
    }

    const {
      title,
      subtitle,
      description,
      category,
      level,
      thumbnail,
      prerequisites,
      learningOutcomes,
      tags,
    } = req.body;

    if (title) course.title = title;
    if (subtitle !== undefined) course.subtitle = subtitle;
    if (description) course.description = description;
    if (category) course.category = category;
    if (level) course.level = level;
    if (thumbnail) course.thumbnail = thumbnail;
    if (prerequisites) course.prerequisites = prerequisites;
    if (learningOutcomes) course.learningOutcomes = learningOutcomes;
    if (tags) course.tags = tags;

    // If previously rejected, editing allows switching back to draft
    if (course.status === 'rejected') {
      course.status = 'draft';
    }

    await course.save();

    res.json({
      success: true,
      message: 'Course updated successfully.',
      course,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update course.',
    });
  }
};

// @desc    Delete a course and all associated structures and materials
// @route   DELETE /api/courses/:id
// @access  Private (Instructor Owner / Admin)
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this course.',
      });
    }

    // Cascade delete materials and course structures
    await LearningMaterial.deleteMany({ course: course._id });
    await CourseStructure.deleteMany({ course: course._id });
    await Course.findByIdAndDelete(course._id);

    res.json({
      success: true,
      message: 'Course and all associated curriculum and materials have been deleted.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete course.',
    });
  }
};

// @desc    Submit course for administrator approval
// @route   PATCH /api/courses/:id/submit
// @access  Private (Instructor Owner)
const submitCourseForApproval = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to submit this course.',
      });
    }

    // Validation: Course must have at least 1 topic and 1 learning material
    const topicCount = await CourseStructure.countDocuments({ course: course._id });
    const materialCount = await LearningMaterial.countDocuments({ course: course._id });

    if (topicCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please add at least one topic to the course before submitting for approval.',
      });
    }

    if (materialCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please attach at least one learning material (video, notes, document, code) to your topics before submission.',
      });
    }

    course.status = 'pending_approval';
    course.submissionDate = new Date();
    course.rejectionReason = ''; // Clear previous rejection remarks
    await course.save();

    res.json({
      success: true,
      message: 'Course submitted successfully! It is now in the review queue for administrator approval.',
      course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit course for approval.',
    });
  }
};

// @desc    Admin review: Approve or reject course (Module 02 integration hook)
// @route   PATCH /api/courses/:id/status
// @access  Private (Admin only)
const updateCourseStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected', 'draft'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'approved', 'rejected', or 'draft'.",
      });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    course.status = status;
    course.reviewedBy = req.user.id;
    course.reviewedDate = new Date();

    if (status === 'rejected') {
      course.rejectionReason = rejectionReason || 'Course content requires revision.';
    } else if (status === 'approved') {
      course.rejectionReason = '';
    }

    await course.save();

    res.json({
      success: true,
      message: `Course has been ${status}.`,
      course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update course status.',
    });
  }
};

// @desc    Get categories with counts
// @route   GET /api/courses/categories
// @access  Public
const getCourseCategories = async (req, res) => {
  try {
    const categories = await Course.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to aggregate categories.',
    });
  }
};

// @desc    Get instructor dashboard metrics
// @route   GET /api/courses/stats/summary
// @access  Private (Instructor only)
const getInstructorStats = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const [totalCourses, approvedCourses, pendingCourses, draftCourses, rejectedCourses] =
      await Promise.all([
        Course.countDocuments({ instructor: instructorId }),
        Course.countDocuments({ instructor: instructorId, status: 'approved' }),
        Course.countDocuments({ instructor: instructorId, status: 'pending_approval' }),
        Course.countDocuments({ instructor: instructorId, status: 'draft' }),
        Course.countDocuments({ instructor: instructorId, status: 'rejected' }),
      ]);

    const instructorCourseIds = await Course.find({ instructor: instructorId }).distinct('_id');
    const totalTopics = await CourseStructure.countDocuments({ course: { $in: instructorCourseIds } });
    const totalMaterials = await LearningMaterial.countDocuments({ course: { $in: instructorCourseIds } });

    res.json({
      success: true,
      stats: {
        totalCourses,
        approvedCourses,
        pendingCourses,
        draftCourses,
        rejectedCourses,
        totalTopics,
        totalMaterials,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve stats.',
    });
  }
};

module.exports = {
  getPublicCourses,
  getInstructorCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  submitCourseForApproval,
  updateCourseStatus,
  getCourseCategories,
  getInstructorStats,
};

