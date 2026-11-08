// Instructor Dashboard Controllers
// Provides read‑only data for the logged‑in instructor.

import InstructorApplication from '../../../models/InstructorApplication.js';
import Course from '../../../models/Course.js';

// GET /api/instructor/applications
export const getMyApplications = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }
    const apps = await InstructorApplication.find({ userId: req.user.id }).select('-__v');
    res.json({ success: true, data: apps });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error while fetching applications.' });
  }
};

// GET /api/instructor/courses
export const getMyCourses = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }
    const courses = await Course.find({ instructorId: req.user.id }).select('-__v');
    res.json({ success: true, data: courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error while fetching courses.' });
  }
};

