const mongoose = require('mongoose');

const learningMaterialSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
      index: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CourseStructure',
      required: [true, 'Topic/Structure reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Material title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    materialType: {
      type: String,
      required: [true, 'Material type is required'],
      enum: ['video', 'document', 'notes', 'link', 'code'],
      default: 'notes',
    },
    // Used for uploaded file path, PDF URL, or video stream link
    resourceLocation: {
      type: String,
      default: '',
    },
    // Used for markdown lecture notes, rich text summary, or source code content
    content: {
      type: String,
      default: '',
    },
    // Programming language if type is 'code'
    codeLanguage: {
      type: String,
      default: 'javascript',
    },
    // External link if type is 'link' or external video URL
    externalUrl: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 1,
    },
    fileSize: {
      type: Number, // in bytes
      default: 0,
    },
    durationMinutes: {
      type: Number,
      default: 10,
    },
    downloadable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LearningMaterial', learningMaterialSchema);

