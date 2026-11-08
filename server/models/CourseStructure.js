const mongoose = require('mongoose');

const courseStructureSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Topic title is required'],
      trim: true,
      maxlength: [150, 'Topic title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      required: true,
      default: 1,
    },
    durationMinutes: {
      type: Number,
      default: 45,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual relationship to LearningMaterials
courseStructureSchema.virtual('materials', {
  ref: 'LearningMaterial',
  localField: '_id',
  foreignField: 'topic',
  options: { sort: { order: 1 } },
});

module.exports = mongoose.model('CourseStructure', courseStructureSchema);

