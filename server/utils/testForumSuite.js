/**
 * testForumSuite.js — Comprehensive Test Suite for Member 06: Forum & Q&A
 * Verifies all acceptance criteria, authentication, RBAC, validations, and edge cases.
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000/api';

const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
};

const results = [];
const test = async (name, fn) => {
  try {
    await fn();
    console.log(`[PASS] ${name}`);
    results.push({ name, pass: true });
  } catch (err) {
    console.error(`[FAIL] ${name}: ${err.message}`);
    results.push({ name, pass: false, error: err.message });
  }
};

const assert = (condition, msg) => {
  if (!condition) throw new Error(msg || 'Assertion failed');
};

async function runTests() {
  console.log('========================================================');
  console.log(' Running Member 06: Forum & Q&A Test Suite');
  console.log('========================================================\n');

  // 1. Authentication Setup
  let learnerToken, instructorToken, adminToken;
  let learnerUser, instructorUser, adminUser;

  await test('Auth: Login as Learner', async () => {
    const res = await request('/auth/login', 'POST', {
      email: 'learner@skillnest.edu',
      password: 'password123',
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.token, 'Token missing');
    learnerToken = res.data.token;
    learnerUser = res.data.user;
  });

  await test('Auth: Login as Instructor', async () => {
    const res = await request('/auth/login', 'POST', {
      email: 'instructor@skillnest.edu',
      password: 'password123',
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.token, 'Token missing');
    instructorToken = res.data.token;
    instructorUser = res.data.user;
  });

  await test('Auth: Login as Admin', async () => {
    const res = await request('/auth/login', 'POST', {
      email: 'admin@skillnest.edu',
      password: 'password123',
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.token, 'Token missing');
    adminToken = res.data.token;
    adminUser = res.data.user;
  });

  // 2. Validation & Security: Empty and Oversized Rejections
  await test('Security: Reject question creation without token (401)', async () => {
    const res = await request('/forum/posts', 'POST', {
      title: 'Valid Question Title',
      body: 'Valid detailed body content',
    });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test('Validation: Reject question with empty title or body (400)', async () => {
    const res = await request(
      '/forum/posts',
      'POST',
      { title: '', body: '' },
      learnerToken
    );
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await test('Validation: Reject question with oversized title > 150 chars (500/400 validation error)', async () => {
    const oversizedTitle = 'A'.repeat(160);
    const res = await request(
      '/forum/posts',
      'POST',
      { title: oversizedTitle, body: 'Valid body description' },
      learnerToken
    );
    assert(res.status >= 400, `Expected error status >= 400, got ${res.status}`);
  });

  // 3. Question Creation (Acceptance Criterion 1)
  let createdPostId;
  await test('Acceptance: Learner can create a question', async () => {
    const res = await request(
      '/forum/posts',
      'POST',
      {
        title: 'How do I optimize MongoDB indexing for large datasets?',
        body: 'I am building an analytics feature and looking for strategies to index compound fields effectively without memory bloat.',
        category: 'Course Help',
        tags: ['mongodb', 'database', 'performance'],
      },
      learnerToken
    );
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.data.post && res.data.post._id, 'Post creation returned invalid object');
    assert(res.data.post.title.includes('MongoDB indexing'), 'Title mismatch');
    createdPostId = res.data.post._id;
  });

  let secondPostId;
  await test('Acceptance: Instructor can create a question/discussion', async () => {
    const res = await request(
      '/forum/posts',
      'POST',
      {
        title: 'Announcing Web Development Hackathon 2026',
        body: 'Welcome to this semester’s hackathon challenge! Check out guidelines and ask questions here.',
        category: 'Announcement',
        tags: ['hackathon', 'announcement'],
      },
      instructorToken
    );
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    secondPostId = res.data.post._id;
  });

  // 4. View All Questions (Acceptance Criterion 2)
  await test('Acceptance: Users can view all questions (Public)', async () => {
    const res = await request('/forum/posts', 'GET');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.posts && res.data.posts.length >= 2, 'Should return at least 2 questions');
    assert(res.data.total >= 2, 'Total count mismatch');
  });

  // 5. Category Filtering (Acceptance Criterion 3)
  await test('Acceptance: Filter questions by category (Course Help)', async () => {
    const res = await request('/forum/posts?category=Course Help', 'GET');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(
      res.data.posts.every((p) => p.category === 'Course Help'),
      'All filtered posts must have category "Course Help"'
    );
  });

  await test('Acceptance: Filter questions by category (Announcement)', async () => {
    const res = await request('/forum/posts?category=Announcement', 'GET');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(
      res.data.posts.every((p) => p.category === 'Announcement'),
      'All filtered posts must have category "Announcement"'
    );
  });

  // 6. Search Discussions (Acceptance Criterion 4)
  await test('Acceptance: Search discussions by keyword', async () => {
    const res = await request('/forum/posts?search=indexing', 'GET');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.posts.length >= 1, 'Should find at least 1 post matching "indexing"');
    assert(
      res.data.posts[0].title.toLowerCase().includes('indexing'),
      'Search result title should contain keyword'
    );
  });

  // 7. Open a Discussion & View Count Increment (Acceptance Criterion 5)
  await test('Acceptance: Open discussion details by ID and verify view count', async () => {
    const res1 = await request(`/forum/posts/${createdPostId}`, 'GET');
    assert(res1.status === 200, `Expected 200, got ${res1.status}`);
    assert(res1.data.post._id === createdPostId, 'Post ID mismatch');
    const firstViewCount = res1.data.post.viewCount;

    // View again to ensure increment
    const res2 = await request(`/forum/posts/${createdPostId}`, 'GET');
    assert(res2.status === 200, `Expected 200, got ${res2.status}`);
    assert(res2.data.post.viewCount === firstViewCount + 1, 'View count must increment');
  });

  // 8. Post Answers & Validation (Acceptance Criterion 6, 7)
  let answerId;
  await test('Validation: Reject answer with less than 5 characters (400)', async () => {
    const res = await request(
      `/forum/posts/${createdPostId}/answers`,
      'POST',
      { body: 'Hey' },
      instructorToken
    );
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await test('Acceptance: Users can post answers and replies', async () => {
    const res = await request(
      `/forum/posts/${createdPostId}/answers`,
      'POST',
      {
        body: 'Make sure to follow the Equality, Sort, Range (ESR) rule when defining compound indexes in Mongoose schemas!',
      },
      instructorToken
    );
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.data.answer && res.data.answer._id, 'Answer creation failed');
    assert(res.data.answer.post === createdPostId, 'Answer post reference mismatch');
    answerId = res.data.answer._id;
  });

  await test('Verification: Post answerCount is incremented', async () => {
    const res = await request(`/forum/posts/${createdPostId}`, 'GET');
    assert(res.data.post.answerCount >= 1, 'Post answerCount should be at least 1');
  });

  await test('Acceptance: Users can view all answers for a question', async () => {
    const res = await request(`/forum/posts/${createdPostId}/answers`, 'GET');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.answers.length >= 1, 'Should return at least 1 answer');
    assert(res.data.answers[0].author.name, 'Author information must be populated');
  });

  // 9. Upvoting Post & Answer
  await test('Feature: Upvote question', async () => {
    const res = await request(
      `/forum/posts/${createdPostId}/vote`,
      'PATCH',
      { direction: 'up' },
      instructorToken
    );
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.voteCount === 1, `Expected voteCount 1, got ${res.data.voteCount}`);
  });

  await test('Feature: Upvote answer', async () => {
    const res = await request(
      `/forum/answers/${answerId}/vote`,
      'PATCH',
      { direction: 'up' },
      learnerToken
    );
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.voteCount === 1, `Expected voteCount 1, got ${res.data.voteCount}`);
  });

  // 10. Accept Answer as Solution (Question Author Only)
  await test('Security: Non-author cannot accept answer (403)', async () => {
    const res = await request(
      `/forum/answers/${answerId}/accept`,
      'PATCH',
      {},
      instructorToken
    );
    assert(res.status === 403, `Expected 403, got ${res.status}`);
  });

  await test('Acceptance: Question author (Learner) can accept answer as solution', async () => {
    const res = await request(
      `/forum/answers/${answerId}/accept`,
      'PATCH',
      {},
      learnerToken
    );
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.acceptedAnswer === answerId, 'acceptedAnswer ID mismatch');
  });

  // 11. Ownership Protection (Acceptance Criterion 9)
  await test("Security: User cannot edit another user's question (403)", async () => {
    const res = await request(
      `/forum/posts/${createdPostId}`,
      'PUT',
      { title: 'Hacked Title Attempt' },
      instructorToken // instructor is not the author of createdPostId (learner is)
    );
    assert(res.status === 403, `Expected 403, got ${res.status}`);
  });

  await test("Security: User cannot delete another user's question (403)", async () => {
    const res = await request(
      `/forum/posts/${createdPostId}`,
      'DELETE',
      null,
      instructorToken // instructor is not the author or admin
    );
    assert(res.status === 403, `Expected 403, got ${res.status}`);
  });

  await test("Security: User cannot edit another user's answer (403)", async () => {
    const res = await request(
      `/forum/answers/${answerId}`,
      'PUT',
      { body: 'Unauthorized Answer Modification' },
      learnerToken // learner is not the author of answerId (instructor is)
    );
    assert(res.status === 403, `Expected 403, got ${res.status}`);
  });

  await test("Security: User cannot delete another user's answer (403)", async () => {
    const res = await request(
      `/forum/answers/${answerId}`,
      'DELETE',
      null,
      learnerToken // learner is not author or admin
    );
    assert(res.status === 403, `Expected 403, got ${res.status}`);
  });

  // 12. Author Edit Own Content
  await test('Acceptance: Author can update their own question', async () => {
    const res = await request(
      `/forum/posts/${createdPostId}`,
      'PUT',
      {
        title: 'How do I optimize MongoDB indexing for large datasets? [Solved]',
      },
      learnerToken
    );
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.post.title.includes('[Solved]'), 'Title should be updated');
  });

  await test('Acceptance: Author can update their own answer', async () => {
    const res = await request(
      `/forum/answers/${answerId}`,
      'PUT',
      {
        body: 'Updated recommendation: Always test compound indexes with .explain("executionStats") in MongoDB Compass or shell.',
      },
      instructorToken
    );
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.answer.body.includes('executionStats'), 'Body should be updated');
  });

  // 13. Administrator Moderation (Acceptance Criterion 10)
  await test('Security: Non-admin cannot pin question (403)', async () => {
    const res = await request(
      `/forum/posts/${createdPostId}/pin`,
      'PATCH',
      {},
      learnerToken
    );
    assert(res.status === 403, `Expected 403, got ${res.status}`);
  });

  await test('Acceptance: Administrator can pin question', async () => {
    const res = await request(
      `/forum/posts/${createdPostId}/pin`,
      'PATCH',
      {},
      adminToken
    );
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.isPinned === true, 'isPinned should be true');
  });

  await test('Acceptance: Administrator can access forum stats', async () => {
    const res = await request('/forum/stats', 'GET', null, adminToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.stats.totalPosts >= 2, 'Stats totalPosts mismatch');
    assert(res.data.stats.pinnedCount >= 1, 'Stats pinnedCount mismatch');
  });

  await test('Acceptance: Administrator can close discussion', async () => {
    const res = await request(
      `/forum/posts/${createdPostId}/close`,
      'PATCH',
      {},
      adminToken
    );
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.isClosed === true, 'isClosed should be true');
  });

  await test('Security: Closed discussion rejects new answers (400)', async () => {
    const res = await request(
      `/forum/posts/${createdPostId}/answers`,
      'POST',
      { body: 'Attempting to reply to a closed thread' },
      instructorToken
    );
    assert(res.status === 400, `Expected 400, got ${res.status}`);
    assert(res.data.message.includes('closed'), 'Message should indicate thread is closed');
  });

  await test('Acceptance: Administrator can moderate (delete) any answer', async () => {
    const res = await request(
      `/forum/answers/${answerId}`,
      'DELETE',
      null,
      adminToken
    );
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  await test('Acceptance: Administrator can moderate (delete) any question', async () => {
    const res = await request(
      `/forum/posts/${secondPostId}`,
      'DELETE',
      null,
      adminToken
    );
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  console.log('\n========================================================');
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  console.log(` Test Summary: Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal test error:', e);
  process.exit(1);
});

