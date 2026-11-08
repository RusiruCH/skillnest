import { executeCode } from '../modules/playground/services/codeExecutionService.js';

async function testLiveExecution() {
  console.log('--- TESTING REAL PISTON CODE EXECUTION ---\n');

  // Test 1: Python
  console.log('1. Testing Python Execution:');
  const pyRes = await executeCode({
    language: 'python',
    code: 'a = 15\nb = 27\nprint(f"The sum is: {a + b}")'
  });
  console.log('Status:', pyRes.status, '| Success:', pyRes.success, '| Time:', pyRes.executionTimeMs + 'ms');
  console.log('Stdout:', pyRes.stdout.trim());
  console.log('Stderr:', pyRes.stderr.trim());

  // Test 2: JavaScript
  console.log('\n2. Testing JavaScript Execution:');
  const jsRes = await executeCode({
    language: 'javascript',
    code: 'const nums = [1, 2, 3, 4, 5]; console.log("Squares:", nums.map(x => x * x).join(", "));'
  });
  console.log('Status:', jsRes.status, '| Success:', jsRes.success, '| Time:', jsRes.executionTimeMs + 'ms');
  console.log('Stdout:', jsRes.stdout.trim());

  // Test 3: C++
  console.log('\n3. Testing C++ Execution:');
  const cppRes = await executeCode({
    language: 'cpp',
    code: '#include <iostream>\nint main() { std::cout << "SkillNest C++ Runner OK!" << std::endl; return 0; }'
  });
  console.log('Status:', cppRes.status, '| Success:', cppRes.success, '| Time:', cppRes.executionTimeMs + 'ms');
  console.log('Stdout:', cppRes.stdout.trim());

  // Test 4: Java
  console.log('\n4. Testing Java Execution:');
  const javaRes = await executeCode({
    language: 'java',
    code: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("SkillNest Java Runner OK!");\n    }\n}'
  });
  console.log('Status:', javaRes.status, '| Success:', javaRes.success, '| Time:', javaRes.executionTimeMs + 'ms');
  console.log('Stdout:', javaRes.stdout.trim());
  console.log('Stderr:', javaRes.stderr.trim());

  // Test 5: Runtime Error Handling (Division by Zero)
  console.log('\n5. Testing Python Runtime Error:');
  const errRes = await executeCode({
    language: 'python',
    code: 'print(10 / 0)'
  });
  console.log('Status:', errRes.status, '| Success:', errRes.success, '| ExitCode:', errRes.exitCode);
  console.log('Captured Stderr:', errRes.stderr.trim());

  console.log('\n--- LIVE EXECUTION TESTS COMPLETE ---');
}

testLiveExecution().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
