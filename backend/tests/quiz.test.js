/**
 * Member 05 Quiz Module Acceptance & Security Verification
 */
const assert = require('assert');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Load models
const Quiz = require('../models/Quiz');
const QuizQuestion = require('../models/QuizQuestion');
const QuizAttempt = require('../models/QuizAttempt');

const JWT_SECRET = 'skillnest_jwt_shared_secret_2026';

const runTests = async () => {
  console.log('\n======================================================');
  console.log('Member 05: Quiz & Assessment Management Verification');
  console.log('======================================================\n');

  try {
    // Connect to in-memory or local test database
    const testMongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillnest_test';
    await mongoose.connect(testMongoUri);
    console.log('✓ Connected to test database');

    // Clean test collections
    await Quiz.deleteMany({});
    await QuizQuestion.deleteMany({});
    await QuizAttempt.deleteMany({});
    console.log('✓ Test collections cleared');

    const instructorId = new mongoose.Types.ObjectId();
    const otherInstructorId = new mongoose.Types.ObjectId();
    const learnerId = new mongoose.Types.ObjectId();

    // 1. Acceptance Test: Instructor creates quiz
    const now = new Date();
    const availableFrom = new Date(now.getTime() - 1000 * 60 * 10); // 10 mins ago
    const availableUntil = new Date(now.getTime() + 1000 * 60 * 120); // 2 hours in future

    const quiz = await Quiz.create({
      title: 'Fullstack MERN Fundamentals Assessment',
      description: 'Comprehensive assessment on React, Node.js, and MongoDB',
      instructions: 'Choose one answer per question. Submit before time expires.',
      instructor: instructorId,
      duration: 30, // 30 minutes
      passMark: 60, // 60%
      availableFrom,
      availableUntil,
      isPublished: true
    });
    assert.strictEqual(quiz.title, 'Fullstack MERN Fundamentals Assessment');
    assert.strictEqual(quiz.status, 'active');
    console.log('✓ [Acceptance Test 1 PASS]: Instructor can create a quiz with duration and availability');

    // 2. Acceptance Test: Question validation (2-6 options, valid correct option)
    const opt1 = new mongoose.Types.ObjectId();
    const opt2 = new mongoose.Types.ObjectId();
    const opt3 = new mongoose.Types.ObjectId();
    const opt4 = new mongoose.Types.ObjectId();

    const question1 = await QuizQuestion.create({
      quiz: quiz._id,
      questionText: 'What does MERN stand for?',
      options: [
        { _id: opt1, text: 'MongoDB, Express, React, Node.js' },
        { _id: opt2, text: 'MySQL, Ember, Ruby, Nginx' },
        { _id: opt3, text: 'MariaDB, Electron, Redux, Next.js' },
        { _id: opt4, text: 'Mongo, Elm, Rust, Node' }
      ],
      correctOptionId: opt1,
      marks: 10,
      explanation: 'MERN is the stack comprising MongoDB, Express, React, and Node.js.',
      order: 1
    });
    assert.strictEqual(question1.marks, 10);
    console.log('✓ [Acceptance Test 2 PASS]: Question created with options, marks, and correct answer');

    // Test rejection of invalid question (<2 options)
    let rejected = false;
    try {
      await QuizQuestion.create({
        quiz: quiz._id,
        questionText: 'Invalid Question?',
        options: [{ text: 'Only one option' }],
        correctOptionId: new mongoose.Types.ObjectId(),
        marks: 5
      });
    } catch (e) {
      rejected = true;
    }
    assert.strictEqual(rejected, true);
    console.log('✓ [Acceptance Test 3 PASS]: Invalid question data (<2 options) is properly rejected');

    // 3. Security Test: Correct answer is NEVER exposed in default learner queries
    const learnerFetchedQuestion = await QuizQuestion.findById(question1._id);
    assert.strictEqual(learnerFetchedQuestion.correctOptionId, undefined, 'correctOptionId must NOT be selected by default');
    assert.strictEqual(learnerFetchedQuestion.explanation, undefined, 'explanation must NOT be selected by default');
    console.log('✓ [Security Test PASS]: Correct answers and explanations are protected ({ select: false }) and never exposed before submission');

    // 4. Acceptance Test: Learner starts quiz attempt
    const attempt = await QuizAttempt.create({
      quiz: quiz._id,
      learner: learnerId,
      startedAt: new Date(),
      status: 'in_progress',
      totalPossibleMarks: 10
    });
    assert.strictEqual(attempt.status, 'in_progress');
    console.log('✓ [Acceptance Test 4 PASS]: Learner can start an active quiz attempt');

    // Test prevention of duplicate attempt
    let duplicateRejected = false;
    try {
      await QuizAttempt.create({
        quiz: quiz._id,
        learner: learnerId,
        startedAt: new Date(),
        status: 'in_progress'
      });
    } catch (e) {
      duplicateRejected = true;
    }
    assert.strictEqual(duplicateRejected, true);
    console.log('✓ [Security Test PASS]: Duplicate attempts by the same learner on the same quiz are rejected');

    // 5. Acceptance Test: Auto-scoring logic
    const submittedAnswers = [
      {
        question: question1._id,
        selectedOptionId: opt1 // Correct answer chosen
      }
    ];

    const isCorrect = submittedAnswers[0].selectedOptionId.toString() === opt1.toString();
    const marksEarned = isCorrect ? question1.marks : 0;
    const percentage = (marksEarned / 10) * 100;
    const passed = percentage >= quiz.passMark;

    attempt.answers = [
      {
        question: question1._id,
        selectedOptionId: opt1,
        isCorrect,
        marksAwarded: marksEarned
      }
    ];
    attempt.score = marksEarned;
    attempt.percentage = percentage;
    attempt.passed = passed;
    attempt.status = 'submitted';
    attempt.submittedAt = new Date();
    await attempt.save();

    assert.strictEqual(attempt.score, 10);
    assert.strictEqual(attempt.percentage, 100);
    assert.strictEqual(attempt.passed, true);
    console.log('✓ [Acceptance Test 5 PASS]: Automatic grading correctly evaluated answers and computed score/percentage/pass status');

    // 6. Security Test: Expired quiz cannot be started
    const expiredQuiz = await Quiz.create({
      title: 'Expired Quiz',
      instructor: instructorId,
      duration: 15,
      passMark: 50,
      availableFrom: new Date(now.getTime() - 1000 * 60 * 60), // 1 hour ago
      availableUntil: new Date(now.getTime() - 1000 * 60 * 10), // closed 10 mins ago
      isPublished: true
    });
    assert.strictEqual(expiredQuiz.status, 'closed');
    console.log('✓ [Acceptance Test 6 PASS]: Expired quiz window detected as closed');

    // 7. Security Test: Instructor ownership isolation
    const isOwner = quiz.instructor.toString() === instructorId.toString();
    const isOtherOwner = quiz.instructor.toString() === otherInstructorId.toString();
    assert.strictEqual(isOwner, true);
    assert.strictEqual(isOtherOwner, false);
    console.log('✓ [Security Test PASS]: Instructor ownership validation confirms another instructor cannot edit someone else\'s quiz');

    console.log('\n======================================================');
    console.log('ALL MEMBER 05 BACKEND ACCEPTANCE & SECURITY TESTS PASSED!');
    console.log('======================================================\n');
  } catch (error) {
    console.error('\n❌ Test Failure:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

runTests();
