// Instructor Application Controllers
// Provides admin‑only CRUD for instructor applications.

import InstructorApplication from '../../../models/InstructorApplication.js';

// GET /api/admin/instructor-applications
export const getAllApplications = async (req, res) => {
  try {
    const apps = await InstructorApplication.find().populate('userId', 'name email');
    res.json({ success: true, data: apps });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error while fetching applications.' });
  }
};

// GET /api/admin/instructor-applications/:id
export const getApplicationById = async (req, res) => {
  try {
    const app = await InstructorApplication.findById(req.params.id).populate('userId', 'name email');
    if (!app) {
      return res.status(404).json({ success: false, error: 'Application not found.' });
    }
    res.json({ success: true, data: app });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error while fetching the application.' });
  }
};

// PATCH /api/admin/instructor-applications/:id/approve
export const approveApplication = async (req, res) => {
  try {
    const app = await InstructorApplication.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ success: false, error: 'Application not found.' });
    }
    if (app.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Only pending applications can be approved.' });
    }
    app.status = 'approved';
    await app.save();
    res.json({ success: true, data: app, message: 'Application approved.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error while approving the application.' });
  }
};

// PATCH /api/admin/instructor-applications/:id/reject
export const rejectApplication = async (req, res) => {
  try {
    const app = await InstructorApplication.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ success: false, error: 'Application not found.' });
    }
    if (app.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Only pending applications can be rejected.' });
    }
    app.status = 'rejected';
    await app.save();
    res.json({ success: true, data: app, message: 'Application rejected.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error while rejecting the application.' });
  }
};
