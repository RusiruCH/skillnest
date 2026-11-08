// Course Approval Controllers
// Admin‑only actions for managing course approval status.

import Course from '../../../models/Course.js';

// GET /api/admin/courses/pending
export const getPendingCourses = async (req, res) => {
  try {
    const courses = await Course.find({ approvalStatus: 'pending' }).populate('instructorId', 'name email');
    res.json({ success: true, data: courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error while fetching pending courses.' });
  }
};

// GET /api/admin/courses/:id
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructorId', 'name email');
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found.' });
    }
    res.json({ success: true, data: course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error while fetching the course.' });
  }
};

// PATCH /api/admin/courses/:id/approve
export const approveCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found.' });
    }
    if (course.approvalStatus !== 'pending') {
      return res.status(400).json({ success: false, error: 'Only pending courses can be approved.' });
    }
    course.approvalStatus = 'approved';
    await course.save();
    res.json({ success: true, data: course, message: 'Course approved.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error while approving the course.' });
  }
};

// PATCH /api/admin/courses/:id/reject
export const rejectCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found.' });
    }
    if (course.approvalStatus !== 'pending') {
      return res.status(400).json({ success: false, error: 'Only pending courses can be rejected.' });
    }
    course.approvalStatus = 'rejected';
    await course.save();
    res.json({ success: true, data: course, message: 'Course rejected.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error while rejecting the course.' });
  }
};
