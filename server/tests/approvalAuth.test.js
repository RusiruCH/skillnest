const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { protect, authorize } = require('../middleware/authMiddleware');
const { requireRoles } = require('../middleware/roleMiddleware');
const User = require('../models/User');

// Helper to mock Express req and res objects for middleware unit testing
function mockReqRes(options = {}) {
  const req = {
    headers: options.headers || {},
    user: options.user || null,
  };
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  return { req, res };
}

// Executes an Express middleware function asynchronously and captures the outcome
function runMiddleware(middleware, req, res) {
  return new Promise((resolve) => {
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
      resolve({ nextCalled: true, statusCode: res.statusCode, body: res.body });
    };

    const originalJson = res.json.bind(res);
    res.json = (data) => {
      originalJson(data);
      if (!nextCalled) {
        resolve({ nextCalled: false, statusCode: res.statusCode, body: res.body });
      }
    };

    try {
      const result = middleware(req, res, next);
      if (result && typeof result.catch === 'function') {
        result.catch((err) => {
          if (!nextCalled) {
            resolve({ nextCalled: false, statusCode: 500, error: err });
          }
        });
      }
    } catch (err) {
      resolve({ nextCalled: false, statusCode: 500, error: err });
    }
  });
}

async function runApprovalAuthTests() {
  console.log('======================================================');
  console.log('  SKILLNEST: MEMBER 02 AUTH & RBAC MIDDLEWARE TESTS   ');
  console.log('======================================================\n');

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

  // Preserve exact original environment state
  const originalEnvHasNodeEnv = Object.prototype.hasOwnProperty.call(process.env, 'NODE_ENV');
  const originalNodeEnv = process.env.NODE_ENV;
  const originalEnvHasJwtSecret = Object.prototype.hasOwnProperty.call(process.env, 'JWT_SECRET');
  const originalJwtSecret = process.env.JWT_SECRET;

  const secret = process.env.JWT_SECRET || 'skillnest_jwt_secret_key_member01_bandara_2026';

  // Create isolated mock user IDs and objects for testing
  const adminId = new mongoose.Types.ObjectId();
  const instructorId = new mongoose.Types.ObjectId();
  const learnerId = new mongoose.Types.ObjectId();

  const mockAdminUser = { _id: adminId, name: 'Admin User', role: 'admin' };
  const mockInstructorUser = { _id: instructorId, name: 'Instructor User', role: 'instructor' };
  const mockLearnerUser = { _id: learnerId, name: 'Learner User', role: 'learner' };

  // Stub User.findById for zero-database unit test isolation
  const originalFindById = User.findById;
  User.findById = (id) => ({
    select: () => {
      const idStr = id ? id.toString() : '';
      if (idStr === adminId.toString()) return Promise.resolve(mockAdminUser);
      if (idStr === instructorId.toString()) return Promise.resolve(mockInstructorUser);
      if (idStr === learnerId.toString()) return Promise.resolve(mockLearnerUser);
      return Promise.resolve(null);
    },
  });

  try {
    const adminToken = jwt.sign({ id: adminId }, secret, { expiresIn: '1h' });
    const instructorToken = jwt.sign({ id: instructorId }, secret, { expiresIn: '1h' });
    const learnerToken = jwt.sign({ id: learnerId }, secret, { expiresIn: '1h' });
    const wrongSecretToken = jwt.sign({ id: adminId }, 'wrong_secret_key', { expiresIn: '1h' });
    const tamperedToken = adminToken.slice(0, -6) + 'abcdef';

    // 1. Unauthenticated access rejected by protect middleware
    const { req: req1, res: res1 } = mockReqRes();
    const result1 = await runMiddleware(protect, req1, res1);
    assert(!result1.nextCalled && result1.statusCode === 401, 'Middleware unit test: protect rejects unauthenticated request with HTTP 401');

    // 2. Invalid / tampered token rejected by protect middleware
    const { req: req2, res: res2 } = mockReqRes({
      headers: { authorization: `Bearer ${tamperedToken}` },
    });
    const result2 = await runMiddleware(protect, req2, res2);
    assert(!result2.nextCalled && result2.statusCode === 401, 'Middleware unit test: protect rejects tampered token with HTTP 401');

    // 3. Wrong secret token rejected by protect middleware
    const { req: req3, res: res3 } = mockReqRes({
      headers: { authorization: `Bearer ${wrongSecretToken}` },
    });
    const result3 = await runMiddleware(protect, req3, res3);
    assert(!result3.nextCalled && result3.statusCode === 401, 'Middleware unit test: protect rejects invalid signature with HTTP 401');

    // 4. Valid admin token authenticated and populates req.user
    const { req: req4, res: res4 } = mockReqRes({
      headers: { authorization: `Bearer ${adminToken}` },
    });
    const result4 = await runMiddleware(protect, req4, res4);
    assert(result4.nextCalled && req4.user && req4.user.role === 'admin', 'Middleware unit test: protect authenticates valid admin token and populates req.user');

    // 5. Admin allowed on admin-only route guard
    const adminGuard = requireRoles('admin');
    const { req: req5, res: res5 } = mockReqRes({ user: mockAdminUser });
    const result5 = await runMiddleware(adminGuard, req5, res5);
    assert(result5.nextCalled, 'Middleware unit test: requireRoles("admin") allows admin role');

    // 6. Instructor rejected from admin-only route guard (403)
    const { req: req6, res: res6 } = mockReqRes({ user: mockInstructorUser });
    const result6 = await runMiddleware(adminGuard, req6, res6);
    assert(!result6.nextCalled && result6.statusCode === 403, 'Middleware unit test: requireRoles("admin") forbids instructor role with HTTP 403');

    // 7. Learner rejected from admin-only route guard (403)
    const { req: req7, res: res7 } = mockReqRes({ user: mockLearnerUser });
    const result7 = await runMiddleware(adminGuard, req7, res7);
    assert(!result7.nextCalled && result7.statusCode === 403, 'Middleware unit test: requireRoles("admin") forbids learner role with HTTP 403');

    // 8. Instructor allowed on instructor-authorized route guard
    const instructorGuard = authorize('instructor', 'admin');
    const { req: req8, res: res8 } = mockReqRes({ user: mockInstructorUser });
    const result8 = await runMiddleware(instructorGuard, req8, res8);
    assert(result8.nextCalled, 'Middleware unit test: authorize("instructor", "admin") allows instructor role');

    // 9. Learner rejected from instructor-only route guard (403)
    const instructorOnlyGuard = requireRoles('instructor');
    const { req: req9, res: res9 } = mockReqRes({ user: mockLearnerUser });
    const result9 = await runMiddleware(instructorOnlyGuard, req9, res9);
    assert(!result9.nextCalled && result9.statusCode === 403, 'Middleware unit test: requireRoles("instructor") forbids learner role with HTTP 403');

    // 10. Production security guard: fail if JWT_SECRET is missing in production environment
    try {
      process.env.NODE_ENV = 'production';
      delete process.env.JWT_SECRET;

      const { req: req10, res: res10 } = mockReqRes({
        headers: { authorization: `Bearer ${adminToken}` },
      });
      const result10 = await runMiddleware(protect, req10, res10);
      assert(!result10.nextCalled && result10.statusCode === 500, 'Middleware unit test: protect strictly rejects with HTTP 500 if JWT_SECRET is missing in production');
    } finally {
      // Guaranteed restoration of inner environment changes
      if (originalEnvHasNodeEnv) {
        process.env.NODE_ENV = originalNodeEnv;
      } else {
        delete process.env.NODE_ENV;
      }

      if (originalEnvHasJwtSecret) {
        process.env.JWT_SECRET = originalJwtSecret;
      } else {
        delete process.env.JWT_SECRET;
      }
    }
  } finally {
    // Guaranteed restoration of User.findById stub and outer environment variables
    User.findById = originalFindById;

    if (originalEnvHasNodeEnv) {
      process.env.NODE_ENV = originalNodeEnv;
    } else {
      delete process.env.NODE_ENV;
    }

    if (originalEnvHasJwtSecret) {
      process.env.JWT_SECRET = originalJwtSecret;
    } else {
      delete process.env.JWT_SECRET;
    }
  }

  console.log('\n======================================================');
  console.log(`APPROVAL AUTH RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) process.exit(1);
}

runApprovalAuthTests();
