// approvalAuth.test.js
// Approval Module Role-Based Security Tests
// Direct middleware unit tests – no HTTP server or TCP required.
// Tests the exact authorization logic used in production routes.

import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { adminAuth } from '../modules/approval/middleware/adminAuth.js';
import { instructorAuth } from '../modules/approval/middleware/instructorAuth.js';

// ── Environment setup ──────────────────────────────────────────────────────────
// Ensure a consistent test secret in development (matches playgroundAuth fallback).
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test_jwt_secret_placeholder_only';
}
const SECRET = process.env.JWT_SECRET;

// ── Token helpers ──────────────────────────────────────────────────────────────
// Use valid MongoDB ObjectIds so Mongoose query casts never fail.
const adminId      = new mongoose.Types.ObjectId().toString();
const instructorId = new mongoose.Types.ObjectId().toString();
const learnerId    = new mongoose.Types.ObjectId().toString();
const noRoleId     = new mongoose.Types.ObjectId().toString();

const makeToken = (payload) => jwt.sign(payload, SECRET, { expiresIn: '1h' });

const adminToken      = makeToken({ id: adminId,      role: 'admin' });
const instructorToken = makeToken({ id: instructorId, role: 'instructor' });
const learnerToken    = makeToken({ id: learnerId,    role: 'learner' });
const noRoleToken     = makeToken({ id: noRoleId });
const tamperedToken   = adminToken.split('.').map((seg, i) => (i === 2 ? 'tampered' : seg)).join('.');
const badToken        = jwt.sign({ id: adminId, role: 'admin' }, 'wrong_secret');

// ── Mock req/res builder ───────────────────────────────────────────────────────
function mockReq(token) {
  return {
    headers: token ? { authorization: `Bearer ${token}` } : {},
    user: undefined,
  };
}

function mockRes() {
  const res = {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; },
  };
  return res;
}

// ── Test runner ────────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

async function runTest(label, fn) {
  try {
    await fn();
    console.log(`[PASS] ${label}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${label}`);
    console.error(`       ${err.message}`);
    failed++;
  }
}

function assertEqual(actual, expected, hint) {
  if (actual !== expected) {
    throw new Error(`Expected status ${expected}, got ${actual}${hint ? ` (${hint})` : ''}`);
  }
}

// ── Helper: run a middleware and return the response status ───────────────────
// nextCalled=true means the middleware allowed the request through (simulates 200).
function runMiddleware(middleware, req) {
  return new Promise((resolve) => {
    const res = mockRes();
    middleware(req, res, () => {
      // next() was called → middleware approved the request
      resolve({ statusCode: 200, body: null });
    });
    // If middleware responded without calling next, the status is on res
    if (res.statusCode !== null) resolve(res);
  });
}

// ── Tests ──────────────────────────────────────────────────────────────────────
async function runApprovalAuthTests() {
  console.log('\n====================================================');
  console.log('  SKILLNEST: MEMBER 02 APPROVAL AUTH SECURITY TESTS');
  console.log('====================================================\n');

  // 1. Admin token → admin route → allowed (200)
  await runTest('Admin token can access admin routes (200)', async () => {
    const result = await runMiddleware(adminAuth, mockReq(adminToken));
    assertEqual(result.statusCode, 200, 'admin → adminAuth');
  });

  // 2. Instructor token → admin route → 403
  await runTest('Instructor token accessing admin route gets 403', async () => {
    const result = await runMiddleware(adminAuth, mockReq(instructorToken));
    assertEqual(result.statusCode, 403, 'instructor → adminAuth');
  });

  // 3. Learner token → admin route → 403
  await runTest('Learner token accessing admin route gets 403', async () => {
    const result = await runMiddleware(adminAuth, mockReq(learnerToken));
    assertEqual(result.statusCode, 403, 'learner → adminAuth');
  });

  // 4. Instructor token → instructor route → allowed (200)
  await runTest('Instructor token can access instructor routes (200)', async () => {
    const result = await runMiddleware(instructorAuth, mockReq(instructorToken));
    assertEqual(result.statusCode, 200, 'instructor → instructorAuth');
  });

  // 5. Learner token → instructor route → 403
  await runTest('Learner token accessing instructor route gets 403', async () => {
    const result = await runMiddleware(instructorAuth, mockReq(learnerToken));
    assertEqual(result.statusCode, 403, 'learner → instructorAuth');
  });

  // 6. Admin token → instructor route → 403 (admins must not access instructor routes)
  await runTest('Admin token accessing instructor route gets 403', async () => {
    const result = await runMiddleware(instructorAuth, mockReq(adminToken));
    assertEqual(result.statusCode, 403, 'admin → instructorAuth');
  });

  // 7. No token → instructor route → 401
  await runTest('Missing token returns 401 on instructor route', async () => {
    const result = await runMiddleware(instructorAuth, mockReq(null));
    assertEqual(result.statusCode, 401, 'no token → instructorAuth');
  });

  // 8. Tampered token → instructor route → 401
  await runTest('Invalid/tampered token returns 401', async () => {
    const result = await runMiddleware(instructorAuth, mockReq(tamperedToken));
    assertEqual(result.statusCode, 401, 'tampered → instructorAuth');
  });

  // 9. Valid token without role → instructor route → 403
  await runTest('Valid token without role returns 403 on protected routes', async () => {
    const result = await runMiddleware(instructorAuth, mockReq(noRoleToken));
    assertEqual(result.statusCode, 403, 'no-role token → instructorAuth');
  });

  // 10. Token signed with wrong secret → admin route → 401
  await runTest('Unverified token (wrong secret) containing role must be rejected with 401', async () => {
    const result = await runMiddleware(adminAuth, mockReq(badToken));
    assertEqual(result.statusCode, 401, 'bad-secret token → adminAuth');
  });

  console.log('\n====================================================');
  console.log(`  APPROVAL AUTH TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) process.exit(1);
}

runApprovalAuthTests();
