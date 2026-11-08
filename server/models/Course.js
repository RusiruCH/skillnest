const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [200, 'Subtitle cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
    },
    category: {
      type: String,
      required: [true, 'Course category is required'],
      enum: [
        'Programming',
        'Web Development',
        'Database',
        'Software Engineering',
        'Networking',
        'Algorithms',
        'Data Science & AI',
        'Cyber Security',
      ],
      default: 'Programming',
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
      default: 'Beginner',
    },
    thumbnail: {
      type: String,
      default: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Course instructor is required'],
    },
    prerequisites: {
      type: [String],
      default: [],
    },
    learningOutcomes: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'pending_approval', 'approved', 'rejected', 'archived'],
      default: 'draft',
      index: true,
    },
    submissionDate: {
      type: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    enrolledCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.8,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual relationship to CourseStructures (Topics)
courseSchema.virtual('structures', {
  ref: 'CourseStructure',
  localField: '_id',
  foreignField: 'course',
  options: { sort: { order: 1 } },
});

module.exports = mongoose.model('Course', courseSchema);

