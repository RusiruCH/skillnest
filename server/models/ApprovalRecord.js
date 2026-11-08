const mongoose = require('mongoose');

/**
 * ApprovalRecord Schema - Module 2 (Member 02)
 * Immutable audit log tracking administrative approvals, rejections, and reversions
 */
const approvalRecordSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      required: true,
      enum: ['InstructorApplication', 'Course'],
      index: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'targetType',
      index: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ['approved', 'rejected', 'reset'],
      index: true,
    },
    previousStatus: {
      type: String,
      default: 'pending',
    },
    newStatus: {
      type: String,
      required: true,
    },
    remarks: {
      type: String,
      default: '',
    },
    metadata: {
      title: { type: String, default: '' },
      targetName: { type: String, default: '' },
      email: { type: String, default: '' },
      category: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

approvalRecordSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

module.exports = mongoose.model('ApprovalRecord', approvalRecordSchema);

