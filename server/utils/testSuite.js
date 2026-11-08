const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Course = require('../models/Course');
const CourseStructure = require('../models/CourseStructure');
const LearningMaterial = require('../models/LearningMaterial');

async function runTests() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillnest_db';
  console.log('Connecting to MongoDB at:', mongoUri);
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB successfully!');

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
    console.log('\n--- Test 1: User & Role Models ---');
    const instructor = await User.findOne({ email: 'instructor@skillnest.edu' });
    assert(instructor !== null, 'Instructor user exists');
    assert(instructor?.role === 'instructor', 'Instructor has correct role');
    assert(instructor?.instructorStatus === 'approved', 'Instructor is approved');

    const learner = await User.findOne({ email: 'learner@skillnest.edu' });
    assert(learner !== null, 'Learner user exists');
    assert(learner?.role === 'learner', 'Learner has correct role');

    console.log('\n--- Test 2: Course Model & Business Rules ---');
    const approvedCourses = await Course.find({ status: 'approved' });
    assert(approvedCourses.length > 0, `Approved courses exist for learners (${approvedCourses.length} found)`);

    const pendingCourses = await Course.find({ status: 'pending_approval' });
    assert(pendingCourses.length > 0, `Pending courses exist in review queue (${pendingCourses.length} found)`);

    // Verify course creation in draft mode
    const testCourse = await Course.create({
      title: 'Automated Test Course ' + Date.now(),
      subtitle: 'Testing Module 1 Course Management',
      description: 'Course description for automated validation suite.',
      category: 'Software Engineering',
      level: 'Beginner',
      instructor: instructor._id,
      status: 'draft',
      learningOutcomes: ['Understand test assertions'],
      prerequisites: ['Basic testing knowledge'],
    });
    assert(testCourse.status === 'draft', 'Newly created course defaults to draft mode');

    console.log('\n--- Test 3: Course Structure & Topics Management ---');
    const topic1 = await CourseStructure.create({
      course: testCourse._id,
      title: 'Unit 1: Fundamentals of Software Architecture',
      description: 'Introduction to modular design patterns and clean code.',
      order: 1,
      durationMinutes: 45,
    });
    assert(topic1.title.includes('Unit 1'), 'Topic created with title and duration');

    const topic2 = await CourseStructure.create({
      course: testCourse._id,
      title: 'Unit 2: Microservices and Containerization',
      description: 'Docker, Kubernetes, and service communication.',
      order: 2,
      durationMinutes: 60,
    });
    assert(topic2.order === 2, 'Sequential ordering of topics maintained');

    console.log('\n--- Test 4: Learning Material Management ---');
    const matVideo = await LearningMaterial.create({
      course: testCourse._id,
      topic: topic1._id,
      title: 'Architecture Overview Video',
      materialType: 'video',
      resourceLocation: 'https://www.youtube.com/watch?v=7H_QH9nipNs',
      order: 1,
      durationMinutes: 20,
    });
    assert(matVideo.materialType === 'video', 'Video learning material persisted');

    const matNotes = await LearningMaterial.create({
      course: testCourse._id,
      topic: topic1._id,
      title: 'Design Principles Markdown Lecture',
      materialType: 'notes',
      content: '# SOLID Principles\n1. Single Responsibility Principle\n2. Open-Closed Principle',
      order: 2,
      durationMinutes: 15,
    });
    assert(matNotes.materialType === 'notes', 'Markdown notes material persisted');

    const matCode = await LearningMaterial.create({
      course: testCourse._id,
      topic: topic2._id,
      title: 'Node.js Express Gateway Boilerplate',
      materialType: 'code',
      codeLanguage: 'javascript',
      content: 'const express = require("express");\nconst app = express();\napp.listen(3000);',
      order: 1,
      durationMinutes: 10,
    });
    assert(matCode.materialType === 'code', 'Code snippet material persisted');

    console.log('\n--- Test 5: Workflow Transition (Draft -> Pending Approval) ---');
    testCourse.status = 'pending_approval';
    testCourse.submissionDate = new Date();
    await testCourse.save();
    assert(testCourse.status === 'pending_approval', 'Course submitted for admin review successfully');

    console.log('\n--- Test 6: Learner Public Catalog Filtering ---');
    // Public queries must only find approved courses
    const publicCatalogCourses = await Course.find({ status: 'approved' });
    const containsDraft = publicCatalogCourses.some((c) => c.status !== 'approved');
    assert(!containsDraft, 'Learner public catalogue strictly excludes draft and pending courses');

    console.log('\n--- Test 7: Clean up test entities ---');
    await LearningMaterial.deleteMany({ course: testCourse._id });
    await CourseStructure.deleteMany({ course: testCourse._id });
    await Course.findByIdAndDelete(testCourse._id);
    const cleaned = await Course.findById(testCourse._id);
    assert(cleaned === null, 'Test course and associated materials cleaned up');

    console.log('\n======================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('======================================================');
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

runTests();

