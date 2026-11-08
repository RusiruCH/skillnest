const LearningMaterial = require('../models/LearningMaterial');
const CourseStructure = require('../models/CourseStructure');
const Course = require('../models/Course');
const path = require('path');
const fs = require('fs');

// @desc    Get all materials for a topic
// @route   GET /api/topics/:topicId/materials
// @access  Public / Private
const getTopicMaterials = async (req, res) => {
  try {
    const { topicId } = req.params;

    const materials = await LearningMaterial.find({ topic: topicId }).sort({ order: 1 });

    res.json({
      success: true,
      count: materials.length,
      materials,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching learning materials.',
    });
  }
};

// @desc    Get single material by ID
// @route   GET /api/materials/:id
// @access  Public / Private
const getMaterialById = async (req, res) => {
  try {
    const material = await LearningMaterial.findById(req.params.id)
      .populate('topic', 'title order')
      .populate('course', 'title instructor status');

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Learning material not found.',
      });
    }

    res.json({
      success: true,
      material,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching material.',
    });
  }
};

// @desc    Create a learning material under a topic
// @route   POST /api/topics/:topicId/materials
// @access  Private (Instructor Owner / Admin)
const createMaterial = async (req, res) => {
  try {
    const { topicId } = req.params;
    const {
      title,
      materialType,
      resourceLocation,
      content,
      codeLanguage,
      externalUrl,
      durationMinutes,
      downloadable,
    } = req.body;

    const topic = await CourseStructure.findById(topicId);
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
        message: 'Unauthorized: You do not own this course.',
      });
    }

    // Determine order
    const lastMaterial = await LearningMaterial.findOne({ topic: topicId }).sort({ order: -1 });
    const nextOrder = lastMaterial ? lastMaterial.order + 1 : 1;

    let finalResource = resourceLocation || '';
    let fileSize = 0;

    // Check if a file was uploaded via Multer
    if (req.file) {
      finalResource = `/uploads/${req.file.filename}`;
      fileSize = req.file.size;
    }

    const material = await LearningMaterial.create({
      course: course._id,
      topic: topicId,
      title,
      materialType: materialType || 'notes',
      resourceLocation: finalResource,
      content: content || '',
      codeLanguage: codeLanguage || 'javascript',
      externalUrl: externalUrl || '',
      durationMinutes: durationMinutes ? Number(durationMinutes) : 10,
      downloadable: downloadable !== undefined ? downloadable : true,
      fileSize,
      order: nextOrder,
    });

    res.status(201).json({
      success: true,
      message: 'Learning material added successfully.',
      material,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create learning material.',
    });
  }
};

// @desc    Update learning material
// @route   PUT /api/materials/:id
// @access  Private (Instructor Owner / Admin)
const updateMaterial = async (req, res) => {
  try {
    const material = await LearningMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Learning material not found.',
      });
    }

    const course = await Course.findById(material.course);
    if (course && course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this learning material.',
      });
    }

    const {
      title,
      materialType,
      resourceLocation,
      content,
      codeLanguage,
      externalUrl,
      durationMinutes,
      downloadable,
      order,
    } = req.body;

    if (title) material.title = title;
    if (materialType) material.materialType = materialType;
    if (content !== undefined) material.content = content;
    if (codeLanguage !== undefined) material.codeLanguage = codeLanguage;
    if (externalUrl !== undefined) material.externalUrl = externalUrl;
    if (durationMinutes !== undefined) material.durationMinutes = durationMinutes;
    if (downloadable !== undefined) material.downloadable = downloadable;
    if (order !== undefined) material.order = order;

    if (req.file) {
      material.resourceLocation = `/uploads/${req.file.filename}`;
      material.fileSize = req.file.size;
    } else if (resourceLocation !== undefined) {
      material.resourceLocation = resourceLocation;
    }

    await material.save();

    res.json({
      success: true,
      message: 'Learning material updated successfully.',
      material,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update material.',
    });
  }
};

// @desc    Delete learning material
// @route   DELETE /api/materials/:id
// @access  Private (Instructor Owner / Admin)
const deleteMaterial = async (req, res) => {
  try {
    const material = await LearningMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Learning material not found.',
      });
    }

    const course = await Course.findById(material.course);
    if (course && course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this material.',
      });
    }

    // If there is an uploaded local file, remove it
    if (material.resourceLocation && material.resourceLocation.startsWith('/uploads/')) {
      const fullPath = path.join(__dirname, '../../', material.resourceLocation);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (e) {
          console.error('Error removing local file:', e.message);
        }
      }
    }

    await LearningMaterial.findByIdAndDelete(material._id);

    res.json({
      success: true,
      message: 'Learning material deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete material.',
    });
  }
};

module.exports = {
  getTopicMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
};

