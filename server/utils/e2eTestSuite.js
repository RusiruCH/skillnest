const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Course = require('../models/Course');
const CourseStructure = require('../models/CourseStructure');
const LearningMaterial = require('../models/LearningMaterial');

// Import the Express app for in-process HTTP supertest/direct testing
const app = require('../server');

async function runE2ETests() {
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    console.log('\n======================================================');
    console.log('   SkillNest Module 01 Comprehensive E2E Verification  ');
    console.log('======================================================\n');

    // 1. Auth Tokens Generation
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'skillnest_jwt_secret_key_member01_bandara_2026';

    const instructor = await User.findOne({ email: 'instructor@skillnest.edu' });
    const learner = await User.findOne({ email: 'learner@skillnest.edu' });
    const admin = await User.findOne({ email: 'admin@skillnest.edu' });

    assert(instructor && learner && admin, 'Found seeded users (Instructor, Learner, Admin)');

    const instructorToken = jwt.sign({ id: instructor._id, role: instructor.role }, secret, { expiresIn: '1d' });
    const learnerToken = jwt.sign({ id: learner._id, role: learner.role }, secret, { expiresIn: '1d' });
    const adminToken = jwt.sign({ id: admin._id, role: admin.role }, secret, { expiresIn: '1d' });

    // Test unapproved instructor creation restriction
    const unapprovedInstructor = await User.create({
      name: 'Unapproved Instructor',
      email: `unapproved_${Date.now()}@skillnest.edu`,
      password: 'password123',
      role: 'instructor',
      instructorStatus: 'pending',
    });
    const unapprovedToken = jwt.sign({ id: unapprovedInstructor._id, role: 'instructor' }, secret, { expiresIn: '1d' });

    // 2. HTTP test helper using fetch
    const baseUrl = `http://localhost:${process.env.PORT || 5000}`;

    console.log('\n--- Section 1: Security & RBAC Enforcement ---');

    // Test Learner cannot create course
    const learnerCreateRes = await fetch(`${baseUrl}/api/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${learnerToken}`,
      },
      body: JSON.stringify({
        title: 'Unauthorized Course by Learner',
        description: 'Should be rejected',
        category: 'Programming',
      }),
    });
    assert(learnerCreateRes.status === 403, `Learner forbidden from creating courses (HTTP ${learnerCreateRes.status})`);

    // Test Unapproved instructor cannot create course
    const unapprovedCreateRes = await fetch(`${baseUrl}/api/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${unapprovedToken}`,
      },
      body: JSON.stringify({
        title: 'Unauthorized Course by Pending Instructor',
        description: 'Should be rejected',
        category: 'Programming',
      }),
    });
    assert(unapprovedCreateRes.status === 403, `Unapproved instructor cannot create courses (HTTP ${unapprovedCreateRes.status})`);

    console.log('\n--- Section 2: Course Creation & Ownership ---');
    // Approved instructor creates course
    const createRes = await fetch(`${baseUrl}/api/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${instructorToken}`,
      },
      body: JSON.stringify({
        title: 'Cloud Computing & Microservices with Docker',
        subtitle: 'Enterprise application deployment and container orchestration',
        description: 'Comprehensive practical guide to scalable cloud applications.',
        category: 'Software Engineering',
        level: 'Intermediate',
        prerequisites: ['Basic Linux CLI', 'Node.js Fundamentals'],
        learningOutcomes: ['Build Docker containers', 'Deploy microservices architecture'],
      }),
    });
    const createData = await createRes.json();
    assert(createRes.status === 201 && createData.success, 'Approved instructor successfully created draft course');
    const courseId = createData.course._id;
    assert(createData.course.status === 'draft', 'Course status initialized to draft');

    // Update course details
    const updateRes = await fetch(`${baseUrl}/api/courses/${courseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${instructorToken}`,
      },
      body: JSON.stringify({
        subtitle: 'Updated Subtitle for Enterprise Microservices',
        level: 'Advanced',
      }),
    });
    const updateData = await updateRes.json();
    assert(updateRes.status === 200 && updateData.course.level === 'Advanced', 'Instructor updated course metadata');

    console.log('\n--- Section 3: Topic / Curriculum Management ---');
    // Add Topic 1
    const topicRes1 = await fetch(`${baseUrl}/api/courses/${courseId}/topics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${instructorToken}`,
      },
      body: JSON.stringify({
        title: 'Topic 1: Docker Containers & Virtualization',
        description: 'Images, layers, containers and registries',
        durationMinutes: 45,
      }),
    });
    const topicData1 = await topicRes1.json();
    assert(topicRes1.status === 201 && topicData1.success, 'Topic 1 created successfully');
    const topicId1 = topicData1.topic._id;

    // Add Topic 2
    const topicRes2 = await fetch(`${baseUrl}/api/courses/${courseId}/topics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${instructorToken}`,
      },
      body: JSON.stringify({
        title: 'Topic 2: Kubernetes Orchestration & Ingress',
        description: 'Pods, services, deployments and load balancers',
        durationMinutes: 60,
      }),
    });
    const topicData2 = await topicRes2.json();
    assert(topicRes2.status === 201 && topicData2.topic.order === 2, 'Topic 2 created with sequential order 2');

    console.log('\n--- Section 4: Learning Materials Attachment & File Upload ---');
    // Material 1: Markdown notes
    const matNotesRes = await fetch(`${baseUrl}/api/topics/${topicId1}/materials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${instructorToken}`,
      },
      body: JSON.stringify({
        title: 'Containerization Lecture Notes',
        materialType: 'notes',
        content: '# Docker Containers\nContainers package code with its dependencies.',
        durationMinutes: 15,
      }),
    });
    const matNotesData = await matNotesRes.json();
    assert(matNotesRes.status === 201 && matNotesData.material.materialType === 'notes', 'Markdown notes material created');

    // Material 2: Source Code
    const matCodeRes = await fetch(`${baseUrl}/api/topics/${topicId1}/materials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${instructorToken}`,
      },
      body: JSON.stringify({
        title: 'Dockerfile for Express Microservice',
        materialType: 'code',
        codeLanguage: 'dockerfile',
        content: 'FROM node:20-alpine\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD ["npm", "start"]',
        durationMinutes: 10,
      }),
    });
    const matCodeData = await matCodeRes.json();
    assert(matCodeRes.status === 201 && matCodeData.material.materialType === 'code', 'Code snippet material created');

    // Material 3: File Upload via Multer (multipart/form-data)
    const testFilePath = path.join(__dirname, 'sample_test_doc.pdf');
    fs.writeFileSync(testFilePath, '%PDF-1.4 sample PDF document content for testing file uploads');

    const form = new FormData();
    form.append('title', 'Kubernetes Architecture Whitepaper');
    form.append('materialType', 'document');
    form.append('durationMinutes', '25');
    form.append('file', new Blob([fs.readFileSync(testFilePath)], { type: 'application/pdf' }), 'sample_test_doc.pdf');

    const uploadRes = await fetch(`${baseUrl}/api/topics/${topicId1}/materials`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${instructorToken}`,
      },
      body: form,
    });
    const uploadData = await uploadRes.json();
    assert(uploadRes.status === 201 && uploadData.material.resourceLocation.startsWith('/uploads/'), 'Document file uploaded and saved to /uploads directory');
    assert(uploadData.material.fileSize > 0, `File size recorded properly (${uploadData.material.fileSize} bytes)`);

    // Clean up local temp test file
    if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);

    console.log('\n--- Section 5: Course Submission & Approval Pipeline ---');
    // Submit course for approval
    const submitRes = await fetch(`${baseUrl}/api/courses/${courseId}/submit`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${instructorToken}`,
      },
    });
    const submitData = await submitRes.json();
    assert(submitRes.status === 200 && submitData.course.status === 'pending_approval', 'Course submitted and transitioned to pending_approval');

    console.log('\n--- Section 6: Learner Visibility & Access Control ---');
    // Learner catalog query
    const publicCatalogRes = await fetch(`${baseUrl}/api/courses`);
    const publicCatalogData = await publicCatalogRes.json();
    const hasPendingInPublic = publicCatalogData.courses.some(c => c._id.toString() === courseId.toString());
    assert(!hasPendingInPublic, 'Pending course is NOT visible in public learner catalog');

    // Learner direct access to pending course must be rejected
    const directLearnerRes = await fetch(`${baseUrl}/api/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${learnerToken}` },
    });
    assert(directLearnerRes.status === 403, `Learner blocked from viewing unapproved course details (HTTP ${directLearnerRes.status})`);

    // Instructor owner CAN view own pending course details
    const ownerRes = await fetch(`${baseUrl}/api/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${instructorToken}` },
    });
    assert(ownerRes.status === 200, 'Course instructor owner CAN inspect own course under review');

    console.log('\n--- Section 7: Module 02 Admin Approval Contract Integration ---');
    // Admin approves course using Member 02 approval endpoint
    const adminApproveRes = await fetch(`${baseUrl}/api/admin/courses/${courseId}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        remarks: 'Curriculum meets university quality guidelines.',
      }),
    });
    const adminApproveData = await adminApproveRes.json();
    assert(adminApproveRes.status === 200 && adminApproveData.success, 'Admin approved course via Member 02 endpoint');

    // Now learner MUST be able to view course and materials
    const approvedLearnerRes = await fetch(`${baseUrl}/api/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${learnerToken}` },
    });
    const approvedLearnerData = await approvedLearnerRes.json();
    assert(approvedLearnerRes.status === 200 && approvedLearnerData.course.status === 'approved', 'Learner can now access approved course');
    assert(approvedLearnerData.course.structures.length === 2, 'Learner can view all course syllabus topics');
    assert(approvedLearnerData.course.structures[0].materials.length === 3, 'Learner can view all attached learning materials');

    console.log('\n--- Section 8: Cascade Deletion Verification ---');
    // Delete course
    const deleteRes = await fetch(`${baseUrl}/api/courses/${courseId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${instructorToken}` },
    });
    assert(deleteRes.status === 200, 'Instructor successfully deleted course');

    // Verify cascade deletion
    const remainingCourse = await Course.findById(courseId);
    const remainingTopics = await CourseStructure.find({ course: courseId });
    const remainingMaterials = await LearningMaterial.find({ course: courseId });
    assert(!remainingCourse, 'Course document deleted');
    assert(remainingTopics.length === 0, 'Associated course structures cascade deleted');
    assert(remainingMaterials.length === 0, 'Associated learning materials cascade deleted');

    // Clean up unapproved user
    await User.findByIdAndDelete(unapprovedInstructor._id);

    console.log('\n--- Section 9: Cross-Module Verification ---');
    // Member 02 Stats
    const adminStatsRes = await fetch(`${baseUrl}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminStatsRes.status === 200, `Member 02 Admin Stats endpoint operational (HTTP ${adminStatsRes.status})`);

    // Member 04 Challenges
    const challengesRes = await fetch(`${baseUrl}/api/challenges`);
    assert(challengesRes.status === 200, `Member 04 Challenges endpoint operational (HTTP ${challengesRes.status})`);

    console.log('\n======================================================');
    console.log(`FINAL RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('E2E Test Execution Error:', err);
    failed++;
  } finally {
    process.exit(failed > 0 ? 1 : 0);
  }
}

// Ensure server is running or start it
const server = app.listen(0, async () => {
  const port = server.address().port;
  process.env.PORT = port;
  await runE2ETests();
});
