import jwt from 'jsonwebtoken';
import { validateExecutionPayload } from '../modules/playground/services/codeExecutionService.js';
import Snippet from '../modules/playground/models/Snippet.js';
import * as playgroundController from '../modules/playground/controllers/playgroundController.js';

async function runTests() {
  console.log('--- STARTING PHASE 2 BACKEND TEST SUITE ---\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Validation tests
  console.log('1. Testing Execution Payload Validation:');
  const validPy = validateExecutionPayload({ language: 'python', code: 'print("hi")' });
  assert(validPy.valid === true && validPy.normalizedLang === 'python', 'Valid Python payload accepted');

  const validJs = validateExecutionPayload({ language: 'javascript', code: 'console.log("hi")' });
  assert(validJs.valid === true && validJs.normalizedLang === 'javascript', 'Valid JavaScript payload accepted');

  const validCpp = validateExecutionPayload({ language: 'cpp', code: 'int main(){return 0;}' });
  assert(validCpp.valid === true && validCpp.normalizedLang === 'cpp', 'Valid C++ payload accepted');

  const validJava = validateExecutionPayload({ language: 'java', code: 'class Main{}' });
  assert(validJava.valid === true && validJava.normalizedLang === 'java', 'Valid Java payload accepted');

  const htmlValidation = validateExecutionPayload({ language: 'html', code: '<h1>test</h1>' });
  assert(htmlValidation.valid === false && htmlValidation.isWeb === true, 'HTML is flagged as client-side web preview');

  const invalidLang = validateExecutionPayload({ language: 'rust', code: 'fn main(){}' });
  assert(invalidLang.valid === false && invalidLang.error.includes('Unsupported language'), 'Unsupported language rejected');

  const emptyCode = validateExecutionPayload({ language: 'python', code: '   ' });
  assert(emptyCode.valid === false && emptyCode.error.includes('empty'), 'Empty code rejected');

  const hugeCode = validateExecutionPayload({ language: 'python', code: 'a'.repeat(60000) });
  assert(hugeCode.valid === false && hugeCode.error.includes('limit exceeded'), 'Excessive code payload (>50KB) rejected');

  // 2. Language Registry
  console.log('\n2. Testing Supported Languages Registry:');
  assert(playgroundController.SUPPORTED_LANGUAGES.length === 5, 'Contains 5 registered languages (JS, Python, C++, Java, Web)');
  const langIds = playgroundController.SUPPORTED_LANGUAGES.map(l => l.id);
  assert(langIds.includes('javascript') && langIds.includes('python') && langIds.includes('cpp') && langIds.includes('java') && langIds.includes('html'), 'All required languages present');

  // 3. Status Endpoint Controller
  console.log('\n3. Testing Status Endpoint:');
  const mockRes = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.data = data; return this; }
  };
  playgroundController.getPlaygroundStatus({}, mockRes);
  assert(mockRes.data.success === true, 'getPlaygroundStatus returned success: true');
  assert(mockRes.data.module === 'Member 03 - Code Playground', 'Correct module identity returned');
  assert(mockRes.data.status === 'operational', 'Status is operational');

  // 4. Mongoose Snippet Schema Validation
  console.log('\n4. Testing Snippet Schema Constraints:');
  const validSnippetDoc = new Snippet({
    title: 'Bubble Sort Algorithm',
    description: 'Basic sorting algorithm in Python',
    code: 'def bubble_sort(): pass',
    language: 'python',
    tags: ['algorithm', 'dsa', 'sorting'],
    isPublic: true
  });
  const valErr = validSnippetDoc.validateSync();
  assert(!valErr, 'Valid snippet passes Mongoose schema validation');

  const invalidLangDoc = new Snippet({
    code: 'some code',
    language: 'unsupported_lang'
  });
  const invalidLangErr = invalidLangDoc.validateSync();
  assert(invalidLangErr && invalidLangErr.errors.language, 'Invalid language fails Mongoose enum validation');

  const missingCodeDoc = new Snippet({
    language: 'python'
  });
  const missingCodeErr = missingCodeDoc.validateSync();
  assert(missingCodeErr && missingCodeErr.errors.code, 'Missing code fails Mongoose required validation');

  // 5. Auth & Ownership Logic Simulation
  console.log('\n5. Testing Ownership & Auth Access Control:');
  const secret = process.env.JWT_SECRET || 'test_jwt_secret_placeholder_only';
  const token = jwt.sign({ id: 'user_12345', name: 'Alice Dev', email: 'alice@skillnest.edu' }, secret, { expiresIn: '1h' });
  const decoded = jwt.verify(token, secret);
  assert(decoded.id === 'user_12345' && decoded.name === 'Alice Dev', 'JWT token decoded and user identity extracted');

  // Test guest creating private snippet protection
  const guestPrivateReq = {
    body: { code: 'test', language: 'python', isPublic: false },
    user: null
  };
  const guestPrivateRes = {
    statusCode: 200,
    status(c) { this.statusCode = c; return this; },
    json(d) { this.data = d; return this; }
  };
  await playgroundController.createSnippet(guestPrivateReq, guestPrivateRes);
  assert(guestPrivateRes.statusCode === 400 && guestPrivateRes.data.error.includes('Guest users can only create public snippets'), 'Guest users blocked from creating private snippets');

  console.log(`\n--- SUMMARY: ${passed} PASSED, ${failed} FAILED ---`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
