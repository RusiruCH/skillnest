const CourseStructure = require('../models/CourseStructure');
const Course = require('../models/Course');
const LearningMaterial = require('../models/LearningMaterial');

// @desc    Get all topics for a course
// @route   GET /api/courses/:courseId/topics
// @access  Public / Private
const getCourseTopics = async (req, res) => {
  try {
    const { courseId } = req.params;

    const topics = await CourseStructure.find({ course: courseId })
      .populate({
        path: 'materials',
        options: { sort: { order: 1 } },
      })
      .sort({ order: 1 });

    res.json({
      success: true,
      count: topics.length,
      topics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching course topics.',
    });
  }
};

// @desc    Add a topic to a course
// @route   POST /api/courses/:courseId/topics
// @access  Private (Instructor Owner / Admin)
const addTopic = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, durationMinutes } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this course curriculum.',
      });
    }

    // Determine next order number
    const lastTopic = await CourseStructure.findOne({ course: courseId }).sort({ order: -1 });
    const nextOrder = lastTopic ? lastTopic.order + 1 : 1;

    const topic = await CourseStructure.create({
      course: courseId,
      title,
      description: description || '',
      durationMinutes: durationMinutes || 45,
      order: nextOrder,
    });

    res.status(201).json({
      success: true,
      message: 'Topic created successfully.',
      topic,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create topic.',
    });
  }
};

// @desc    Update a topic
// @route   PUT /api/topics/:id
// @access  Private (Instructor Owner / Admin)
const updateTopic = async (req, res) => {
  try {
    const topic = await CourseStructure.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found.',
      });
    }

    const course = await Course.findById(topic.course);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Associated course not found.',
      });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this topic.',
      });
    }

    const { title, description, durationMinutes, order } = req.body;

    if (title) topic.title = title;
    if (description !== undefined) topic.description = description;
    if (durationMinutes !== undefined) topic.durationMinutes = durationMinutes;
    if (order !== undefined) topic.order = order;

    await topic.save();

    res.json({
      success: true,
      message: 'Topic updated successfully.',
      topic,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update topic.',
    });
  }
};

// @desc    Delete a topic & cascade delete its materials
// @route   DELETE /api/topics/:id
// @access  Private (Instructor Owner / Admin)
const deleteTopic = async (req, res) => {
  try {
    const topic = await CourseStructure.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found.',
      });
    }

    const course = await Course.findById(topic.course);
    if (course && course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this topic.',
      });
    }

    // Delete associated materials
    await LearningMaterial.deleteMany({ topic: topic._id });
    await CourseStructure.findByIdAndDelete(topic._id);

    res.json({
      success: true,
      message: 'Topic and associated materials deleted.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete topic.',
    });
  }
};

// @desc    Reorder topics
// @route   PUT /api/courses/:courseId/topics/reorder
// @access  Private (Instructor Owner / Admin)
const reorderTopics = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { orderedTopicIds } = req.body; // Array of IDs in new order

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to reorder topics.',
      });
    }

    if (!Array.isArray(orderedTopicIds)) {
      return res.status(400).json({
        success: false,
        message: 'orderedTopicIds array is required.',
      });
    }

    const bulkOps = orderedTopicIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, course: courseId },
        update: { order: index + 1 },
      },
    }));

    await CourseStructure.bulkWrite(bulkOps);

    const updatedTopics = await CourseStructure.find({ course: courseId }).sort({ order: 1 });

    res.json({
      success: true,
      message: 'Curriculum topics reordered successfully.',
      topics: updatedTopics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reorder topics.',
    });
  }
};

module.exports = {
  getCourseTopics,
  addTopic,
  updateTopic,
  deleteTopic,
  reorderTopics,
};

