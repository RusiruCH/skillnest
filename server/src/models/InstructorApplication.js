// Instructor Application Model
// This model stores applications from users who want to become instructors.
// It reuses the existing User model via a reference (userId).

import mongoose from 'mongoose';

const InstructorApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // reference to the shared User model
      required: true,
    },
    profile: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model('InstructorApplication', InstructorApplicationSchema);

