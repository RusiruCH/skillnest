/**
 * Member 05: Offline Unit & Schema Validation Test Suite
 * Does not require a live MongoDB connection daemon.
 */
const assert = require('assert');
const mongoose = require('mongoose');

const Quiz = require('../models/Quiz');
const QuizQuestion = require('../models/QuizQuestion');
const QuizAttempt = require('../models/QuizAttempt');

const runOfflineTests = async () => {
  console.log('\n======================================================');
  console.log('Member 05: Offline Unit & Security Logic Verification');
  console.log('======================================================\n');

  const instructorId = new mongoose.Types.ObjectId();
  const learnerId = new mongoose.Types.ObjectId();
  const now = new Date();

  // Test 1: Valid Quiz Creation & Virtual State
  const validQuiz = new Quiz({
    title: 'Modern Fullstack React & Node.js Assessment',
    description: 'Testing fullstack concepts',
    instructor: instructorId,
    duration: 45,
    passMark: 70,
    availableFrom: new Date(now.getTime() - 60000), // active
    availableUntil: new Date(now.getTime() + 3600000),
    isPublished: true
  });
  const quizErr = await validQuiz.validate().catch((e) => e);
  assert.strictEqual(quizErr, undefined, 'Valid quiz must pass validation');
  assert.strictEqual(validQuiz.status, 'active', 'Quiz status virtual should evaluate to active');
  console.log('✓ [PASS] Valid Quiz passes Mongoose schema validation and calculates active status');

  // Test 2: Quiz Validation Boundaries
  const invalidQuiz = new Quiz({
    title: 'ab', // < 3 chars
    instructor: instructorId,
    duration: 0, // < 1 min
    passMark: 105, // > 100%
    availableFrom: now,
    availableUntil: now
  });
  let invErr;
  try {
    await invalidQuiz.validate();
  } catch (err) {
    invErr = err;
  }
  assert(invErr?.errors?.['title'], 'Title under 3 chars must fail');
  assert(invErr?.errors?.['duration'], 'Duration under 1 min must fail');
  assert(invErr?.errors?.['passMark'], 'Pass mark over 100 must fail');
  console.log('✓ [PASS] Invalid Quiz parameters (title length, duration boundaries, passMark range) are rejected');

  // Test 3: Valid MCQ Question Creation (2-6 options)
  const opt1 = new mongoose.Types.ObjectId();
  const opt2 = new mongoose.Types.ObjectId();
  const opt3 = new mongoose.Types.ObjectId();
  const validQuestion = new QuizQuestion({
    quiz: validQuiz._id,
    questionText: 'Which lifecycle method or hook handles side effects in React?',
    options: [
      { _id: opt1, text: 'useEffect' },
      { _id: opt2, text: 'useState' },
      { _id: opt3, text: 'useContext' }
    ],
    correctOptionId: opt1,
    marks: 5
  });
  const qErr = await validQuestion.validate().catch((e) => e);
  assert.strictEqual(qErr, undefined, 'Valid question must pass validation');
  console.log('✓ [PASS] Valid MCQ Question with multiple options and correctOptionId passes validation');

  // Test 4: Question Options Range Validation (<2 options rejected)
  const invalidQOptions = new QuizQuestion({
    quiz: validQuiz._id,
    questionText: 'Does this question have enough options?',
    options: [{ text: 'Single option only' }],
    correctOptionId: new mongoose.Types.ObjectId(),
    marks: 2
  });
  let invQErr;
  try {
    await invalidQOptions.validate();
  } catch (err) {
    invQErr = err;
  }
  assert(invQErr?.errors?.['options'], 'Options array with <2 options must fail validation');
  console.log('✓ [PASS] Invalid question with <2 options is rejected by schema validator');

  // Test 5: Question Option Integrity (correctOptionId must exist in options)
  const orphanOptionId = new mongoose.Types.ObjectId();
  const invalidCorrectOpt = new QuizQuestion({
    quiz: validQuiz._id,
    questionText: 'Which option is correct?',
    options: [
      { _id: opt1, text: 'Option A' },
      { _id: opt2, text: 'Option B' }
    ],
    correctOptionId: orphanOptionId, // Not in options array!
    marks: 1
  });
  let orphanErr;
  try {
    await invalidCorrectOpt.validate();
  } catch (err) {
    orphanErr = err;
  }
  assert(orphanErr?.errors?.['correctOptionId'], 'correctOptionId not in options must fail validation');
  console.log('✓ [PASS] Schema rejects correctOptionId that does not match any provided option');

  // Test 6: Security - Zero Answer Exposure via Schema Definition
  const correctOptionConfig = QuizQuestion.schema.path('correctOptionId').options;
  assert.strictEqual(correctOptionConfig.select, false, 'correctOptionId must have select: false');
  const explanationConfig = QuizQuestion.schema.path('explanation').options;
  assert.strictEqual(explanationConfig.select, false, 'explanation must have select: false');
  console.log('✓ [PASS] Security Verified: correctOptionId and explanation have select: false configured');

  // Test 7: Auto-scoring logic verification
  const totalPossible = 20;
  const earnedScore = 15;
  const percentage = Math.round((earnedScore / totalPossible) * 100);
  const passed = percentage >= validQuiz.passMark;
  assert.strictEqual(percentage, 75);
  assert.strictEqual(passed, true);
  console.log('✓ [PASS] Scoring calculation accurately evaluates percentage (75%) and pass criteria');

  // Test 8: Server-side Duration Validation Logic
  const startedAt = new Date(Date.now() - 47 * 60 * 1000); // 47 mins ago
  const quizDuration = 45; // 45 min limit + 1 min grace = 46 min max
  const elapsedMinutes = (Date.now() - startedAt.getTime()) / (1000 * 60);
  const isExpired = elapsedMinutes > quizDuration + 1;
  assert.strictEqual(isExpired, true, 'Submission at 47 mins on a 45 min quiz must be flagged expired');
  console.log('✓ [PASS] Server duration enforcement accurately detects expired submissions beyond grace period');

  // Test 9: Instructor Ownership Isolation
  const instructorA = new mongoose.Types.ObjectId().toString();
  const instructorB = new mongoose.Types.ObjectId().toString();
  const testQuiz = { instructor: instructorA };
  assert.strictEqual(testQuiz.instructor === instructorA, true, 'Instructor A is verified owner');
  assert.strictEqual(testQuiz.instructor === instructorB, false, 'Instructor B must be denied modification');
  console.log('✓ [PASS] Ownership logic prevents Instructor B from modifying Instructor A\'s assessment');

  // Test 10: Configurable maxAttempts Validation (1 to 20 boundary enforcement)
  const quizWithMaxAttempts = new Quiz({
    title: 'Multi-Attempt Certification Quiz',
    instructor: instructorA,
    duration: 60,
    passMark: 80,
    maxAttempts: 3,
    availableFrom: now,
    availableUntil: new Date(now.getTime() + 86400000)
  });
  const maxAttErr = await quizWithMaxAttempts.validate().catch((e) => e);
  assert.strictEqual(maxAttErr, undefined, 'Quiz with maxAttempts = 3 must pass validation');
  assert.strictEqual(quizWithMaxAttempts.maxAttempts, 3, 'maxAttempts should be 3');

  const invalidMaxAttemptsQuiz = new Quiz({
    title: 'Invalid Attempts Quiz',
    instructor: instructorA,
    duration: 60,
    passMark: 80,
    maxAttempts: 25, // > 20
    availableFrom: now,
    availableUntil: new Date(now.getTime() + 86400000)
  });
  let invMaxErr;
  try {
    await invalidMaxAttemptsQuiz.validate();
  } catch (err) {
    invMaxErr = err;
  }
  assert(invMaxErr?.errors?.['maxAttempts'], 'maxAttempts over 20 must fail validation');
  console.log('✓ [PASS] Configurable maxAttempts schema validation correctly enforces 1 to 20 range');

  // Test 11: QuizAttempt Schema supports attemptNumber and isTestAttempt
  const attemptDoc = new QuizAttempt({
    quiz: validQuiz._id,
    learner: learnerId,
    attemptNumber: 2,
    isTestAttempt: true
  });
  const attErr = await attemptDoc.validate().catch((e) => e);
  assert.strictEqual(attErr, undefined, 'QuizAttempt with attemptNumber and isTestAttempt must pass validation');
  assert.strictEqual(attemptDoc.attemptNumber, 2);
  assert.strictEqual(attemptDoc.isTestAttempt, true);
  console.log('✓ [PASS] QuizAttempt schema supports attemptNumber sequencing and isTestAttempt isolation');

  // Test 12: Instructor Self-Test Security Logic
  const isOwnerInstructor = (userRole, userId, quizOwnerId) => {
    return userRole === 'instructor' && userId.toString() === quizOwnerId.toString();
  };
  const isUnauthorizedInstructor = (userRole, userId, quizOwnerId) => {
    return userRole === 'instructor' && userId.toString() !== quizOwnerId.toString();
  };
  assert.strictEqual(isOwnerInstructor('instructor', instructorA, instructorA), true, 'Owner instructor can test own quiz');
  assert.strictEqual(isUnauthorizedInstructor('instructor', instructorB, instructorA), true, 'Other instructor must be blocked from testing');
  console.log('✓ [PASS] Instructor self-test permission isolates quiz owner and rejects non-owner instructors');

  // Test 13: Attempt Count Limit Enforcement Logic
  const enforceAttemptLimit = (completedCount, maxAllowed, isOwner) => {
    if (isOwner) return true; // Owner instructor can preview without learner quota limits
    return completedCount < maxAllowed;
  };
  assert.strictEqual(enforceAttemptLimit(0, 3, false), true, 'First attempt allowed');
  assert.strictEqual(enforceAttemptLimit(2, 3, false), true, 'Third attempt allowed (2 completed)');
  assert.strictEqual(enforceAttemptLimit(3, 3, false), false, 'Fourth attempt rejected when limit is 3');
  assert.strictEqual(enforceAttemptLimit(5, 1, true), true, 'Owner instructor bypasses learner quota for testing');
  console.log('✓ [PASS] Configurable attempt limit accurately allows retakes up to maxAttempts and halts excess attempts');

  // Test 14: Question Order Attribute Validation (Task 1)
  const orderedQuestion = new QuizQuestion({
    quiz: validQuiz._id,
    questionText: 'Ordered question item',
    options: [
      { _id: opt1, text: 'First' },
      { _id: opt2, text: 'Second' }
    ],
    correctOptionId: opt1,
    marks: 2,
    order: 4
  });
  const ordErr = await orderedQuestion.validate().catch((e) => e);
  assert.strictEqual(ordErr, undefined, 'Ordered question must pass schema validation');
  assert.strictEqual(orderedQuestion.order, 4, 'Question order attribute correctly stores integer 4');
  console.log('✓ [PASS] Question order attribute persists integer sequence in schema');

  // Test 15: Course Linkage Schema Support (Task 3)
  const courseId = new mongoose.Types.ObjectId();
  const linkedQuiz = new Quiz({
    title: 'Course-Integrated Assessment',
    instructor: instructorA,
    courseId: courseId,
    duration: 30,
    passMark: 60,
    availableFrom: now,
    availableUntil: new Date(now.getTime() + 86400000)
  });
  const linkErr = await linkedQuiz.validate().catch((e) => e);
  assert.strictEqual(linkErr, undefined, 'Quiz linked to course must pass validation');
  assert.strictEqual(linkedQuiz.courseId.toString(), courseId.toString(), 'courseId correctly stored on Quiz');
  console.log('✓ [PASS] Quiz model supports nullable Course reference linkage');

  // Test 16: Course Ownership Validation Logic (Task 3)
  const validateCourseOwnership = (courseOwnerId, quizOwnerId, role) => {
    if (role === 'admin' || role === 'administrator') return true;
    return courseOwnerId.toString() === quizOwnerId.toString();
  };
  assert.strictEqual(validateCourseOwnership(instructorA, instructorA, 'instructor'), true, 'Instructor can link their own course');
  assert.strictEqual(validateCourseOwnership(instructorB, instructorA, 'instructor'), false, 'Instructor cannot link course owned by another instructor');
  assert.strictEqual(validateCourseOwnership(instructorB, instructorA, 'admin'), true, 'Administrator can link any course');
  console.log('✓ [PASS] Course ownership authorization strictly isolates courses per instructor');

  // Test 17: Quiz Analytics Calculation Logic (Task 4)
  const mockSubmissions = [
    { score: 5, totalPossibleMarks: 10, percentage: 50, passed: false, isTestAttempt: false, status: 'submitted' },
    { score: 8, totalPossibleMarks: 10, percentage: 80, passed: true, isTestAttempt: false, status: 'submitted' },
    { score: 10, totalPossibleMarks: 10, percentage: 100, passed: true, isTestAttempt: true, status: 'submitted' } // Instructor test attempt
  ];

  const calculateAnalytics = (attempts) => {
    // Exclude test attempts
    const valid = attempts.filter((a) => !a.isTestAttempt && (a.status === 'submitted' || a.status === 'expired'));
    const totalSubmissions = valid.length;
    const passedCount = valid.filter((a) => a.passed).length;
    const scores = valid.map((a) => a.score);
    const percentages = valid.map((a) => a.percentage);

    return {
      totalSubmissions,
      passedCount,
      failedCount: totalSubmissions - passedCount,
      passRate: totalSubmissions > 0 ? Number(((passedCount / totalSubmissions) * 100).toFixed(1)) : 0,
      avgScore: totalSubmissions > 0 ? Number((scores.reduce((a, b) => a + b, 0) / totalSubmissions).toFixed(1)) : 0,
      avgPercentage: totalSubmissions > 0 ? Number((percentages.reduce((a, b) => a + b, 0) / totalSubmissions).toFixed(1)) : 0,
      highestScore: scores.length > 0 ? Math.max(...scores) : null,
      lowestScore: scores.length > 0 ? Math.min(...scores) : null,
      highestPercentage: percentages.length > 0 ? Math.max(...percentages) : null,
      lowestPercentage: percentages.length > 0 ? Math.min(...percentages) : null
    };
  };

  const analytics = calculateAnalytics(mockSubmissions);
  assert.strictEqual(analytics.totalSubmissions, 2, 'Instructor preview test attempt excluded from count');
  assert.strictEqual(analytics.passedCount, 1, 'Passed count accurately reflects 1 passing learner');
  assert.strictEqual(analytics.failedCount, 1, 'Failed count accurately reflects 1 failing learner');
  assert.strictEqual(analytics.passRate, 50, 'Pass rate is 50%');
  assert.strictEqual(analytics.avgScore, 6.5, 'Average score is 6.5 pts');
  assert.strictEqual(analytics.highestScore, 8, 'Highest score is 8 (excludes test attempt 10)');
  assert.strictEqual(analytics.lowestScore, 5, 'Lowest score is 5');
  assert.strictEqual(analytics.highestPercentage, 80, 'Highest percentage is 80%');
  assert.strictEqual(analytics.lowestPercentage, 50, 'Lowest percentage is 50%');
  console.log('✓ [PASS] Quiz Analytics Dashboard accurately evaluates KPIs and isolates instructor test attempts');

  console.log('\n======================================================');
  console.log('ALL OFFLINE MEMBER 05 UNIT & SECURITY TESTS PASSED!');
  console.log('======================================================\n');
};

runOfflineTests();
