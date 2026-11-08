const mongoose = require('mongoose');

/**
 * InstructorApplication Schema - Module 2 (Member 02)
 * Manages applicant credentials, teaching backgrounds, and administrative review states
 */
const instructorApplicationSchema = new mongoose.Schema(
  {
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant user reference is required'],
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    expertiseArea: {
      type: String,
      required: [true, 'Expertise area is required'],
      trim: true,
    },
    qualifications: {
      type: [String],
      default: [],
    },
    experienceYears: {
      type: Number,
      default: 0,
      min: [0, 'Experience years cannot be negative'],
    },
    bio: {
      type: String,
      required: [true, 'Bio is required'],
    },
    portfolioUrl: {
      type: String,
      default: '',
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    sampleCourseProposal: {
      title: { type: String, default: '' },
      targetAudience: { type: String, default: '' },
      briefOutline: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewDate: {
      type: Date,
      default: null,
    },
    remarks: {
      type: String,
      default: '',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

instructorApplicationSchema.index({ status: 1, submittedAt: -1 });

module.exports = mongoose.model('InstructorApplication', instructorApplicationSchema);

