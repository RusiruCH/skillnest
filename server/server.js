const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static directory for file and material uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root endpoint - Welcome & API Navigation
app.get('/', (req, res) => {
  res.json({
    success: true,
    platform: 'SkillNest - Open Course-ware and Technical Skill Development Platform',
    modules: {
      module1: 'Course & Learning Material Management — L.M.R.C.Bandara (SEU/IS/22/ICT/113)',
      module2: 'Instructor & Course Approval Management — Member 02',
      module4: 'Hackathon Challenge Management — H.A.K. Madushan (feature/member-04-hackathon)',
    },
    status: 'Backend API Server is Running Successfully',
    frontendUrl: 'http://localhost:5173',
    message: 'To access the interactive visual interface, open http://localhost:5173 in your browser.',
    endpoints: {
      health: 'GET /api/health',
      // Module 1
      coursesPublic: 'GET /api/courses',
      instructorCourses: 'GET /api/courses/my-courses',
      categories: 'GET /api/courses/categories',
      courseDetails: 'GET /api/courses/:id',
      createCourse: 'POST /api/courses',
      updateCourse: 'PUT /api/courses/:id',
      deleteCourse: 'DELETE /api/courses/:id',
      submitCourse: 'PUT /api/courses/:id/submit',
      addTopic: 'POST /api/courses/:courseId/topics',
      uploadMaterial: 'POST /api/topics/:topicId/materials',
      // Module 2
      adminDashboard: 'GET /api/admin/dashboard',
      instructorApplications: 'GET /api/admin/instructor-applications',
      approveCourse: 'PUT /api/admin/courses/:id/approve',
      applyInstructor: 'POST /api/instructor-applications',
      myApplicationStatus: 'GET /api/instructor-applications/my-status',
    },
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'SkillNest API',
    modules: ['Module 1 - Course & Learning Material Management', 'Module 2 - Instructor & Course Approval Management', 'Module 4 - Hackathon Challenge Management — H.A.K. Madushan'],
    timestamp: new Date().toISOString(),
  });
});

// Import route modules — Module 1
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const topicRoutes = require('./routes/topicRoutes');
const materialRoutes = require('./routes/materialRoutes');
const playgroundRoutes = require('./routes/playgroundRoutes');

// Import route modules — Module 2 (Instructor & Course Approval Management)
const adminApprovalRoutes = require('./routes/adminApprovalRoutes');
const instructorApplicationRoutes = require('./routes/instructorApplicationRoutes');

// Mount routes — Module 1
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/playground', playgroundRoutes);

// Nested routes for topics & materials
app.use('/api/courses/:courseId/topics', topicRoutes);
app.use('/api/topics', topicRoutes);

app.use('/api/topics/:topicId/materials', materialRoutes);
app.use('/api/materials', materialRoutes);

// Mount routes — Module 2 (Instructor & Course Approval Management)
app.use('/api/admin', adminApprovalRoutes);
app.use('/api/instructor-applications', instructorApplicationRoutes);

// Module 04: Hackathon Challenge Management Routes (Member 04)
const challengeRoutes = require('./routes/challengeRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const seedChallenges = require('./utils/challengeSeeder');

app.use('/api/challenges', challengeRoutes);
app.use('/api/submissions', submissionRoutes);

// Module 06: Forum & Q&A Management Routes (Member 06)
const forumRoutes = require('./routes/forumRoutes');
app.use('/api/forum', forumRoutes);

// Module 05: Quiz & Assessment Management Routes (Member 05)
const quizRoutes = require('./routes/quizRoutes');
const attemptRoutes = require('./routes/attemptRoutes');
app.use('/api/quizzes', quizRoutes);
app.use('/api/attempts', attemptRoutes);

// Module 04 Demo Seeder
app.post('/api/challenges/seed', async (req, res) => {
  try {
    await seedChallenges();
    res.json({ success: true, message: 'Hackathon challenges seeded successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 404 handler for undefined API routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[SkillNest Server Error]:', err.stack || err);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log('================================================================');
    console.log(` SkillNest API Server`);
    console.log(` Module 1: Course & Learning Material Management — L.M.R.C.Bandara`);
    console.log(` Module 2: Instructor & Course Approval Management — Member 02`);
    console.log(` Module 4: Hackathon Challenge Management — H.A.K. Madushan`);
    console.log(` Server running on: http://localhost:${PORT}`);
    console.log('================================================================');
  });
}

module.exports = app;
