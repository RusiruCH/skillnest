/**
 * Module 3: Code Playground - Execution Service
 * Contributor: Member 3 (B.S.D.P. Wickramasingha - SEU/IS/22/ICT/013)
 * 
 * Provides secure, isolated execution of arbitrary code via sandboxed API services
 * (Judge0 CE / Piston). NEVER executes submitted code using Node child_process or host shell.
 * Includes base64 payload encoding/decoding, resource quotas, timeouts, and a transparent
 * Demonstration Mode fallback when external execution engines are offline.
 */

const SUPPORTED_LANGUAGES = {
  javascript: {
    id: 'javascript',
    label: 'JavaScript (Node.js)',
    version: 'Node.js 18+',
    extension: 'js',
    judge0Id: 63,
    pistonLang: 'javascript',
    pistonVersion: '18.15.0',
    defaultCode: `// SkillNest Code Playground - JavaScript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const terms = 10;
console.log(\`First \${terms} Fibonacci numbers:\`);
const series = Array.from({ length: terms }, (_, i) => fibonacci(i));
console.log(series.join(', '));
`,
  },
  python: {
    id: 'python',
    label: 'Python',
    version: 'Python 3.10+',
    extension: 'py',
    judge0Id: 71,
    pistonLang: 'python',
    pistonVersion: '3.10.0',
    defaultCode: `# SkillNest Code Playground - Python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

numbers = [64, 34, 25, 12, 22, 11, 90]
print("Original list:", numbers)
sorted_numbers = bubble_sort(numbers.copy())
print("Sorted list:  ", sorted_numbers)
`,
  },
  java: {
    id: 'java',
    label: 'Java',
    version: 'OpenJDK 15+',
    extension: 'java',
    judge0Id: 62,
    pistonLang: 'java',
    pistonVersion: '15.0.2',
    defaultCode: `// SkillNest Code Playground - Java
// Note: Class name must be Main
public class Main {
    public static void main(String[] args) {
        System.out.println("SkillNest Online Code Execution");
        System.out.println("===============================");
        
        int[] primes = {2, 3, 5, 7, 11, 13, 17, 19, 23, 29};
        System.out.print("Prime numbers: ");
        for (int p : primes) {
            System.out.print(p + " ");
        }
        System.out.println();
    }
}
`,
  },
  c: {
    id: 'c',
    label: 'C',
    version: 'GCC 10.2+',
    extension: 'c',
    judge0Id: 50,
    pistonLang: 'c',
    pistonVersion: '10.2.0',
    defaultCode: `// SkillNest Code Playground - C
#include <stdio.h>

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    printf("SkillNest C Playground\\n");
    int num = 6;
    printf("Factorial of %d is: %d\\n", num, factorial(num));
    return 0;
}
`,
  },
  cpp: {
    id: 'cpp',
    label: 'C++',
    version: 'GCC 10.2+ (C++17)',
    extension: 'cpp',
    judge0Id: 54,
    pistonLang: 'c++',
    pistonVersion: '10.2.0',
    defaultCode: `// SkillNest Code Playground - C++
#include <iostream>
#include <vector>
#include <numeric>

int main() {
    std::cout << "SkillNest C++ Playground\\n";
    std::vector<int> data = {10, 20, 30, 40, 50};
    
    int sum = std::accumulate(data.begin(), data.end(), 0);
    double avg = static_cast<double>(sum) / data.size();
    
    std::cout << "Data size: " << data.size() << std::endl;
    std::cout << "Sum:       " << sum << std::endl;
    std::cout << "Average:   " << avg << std::endl;
    return 0;
}
`,
  },
};

function encodeB64(str) {
  return Buffer.from(str || '', 'utf-8').toString('base64');
}

function decodeB64(str) {
  if (!str) return '';
  return Buffer.from(str, 'base64').toString('utf-8');
}

/**
 * Execute code using Judge0 CE Isolated Sandbox API
 */
async function executeWithJudge0(languageMeta, sourceCode, stdin, timeoutMs) {
  const serviceUrl = process.env.EXECUTION_SERVICE_URL || 'https://ce.judge0.com';
  const apiKey = process.env.EXECUTION_API_KEY || '';

  const headers = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['X-RapidAPI-Key'] = apiKey;
    try {
      headers['X-RapidAPI-Host'] = new URL(serviceUrl).host;
    } catch (_) {}
  }

  const endpoint = `${serviceUrl.replace(/\/+$/, '')}/submissions?base64_encoded=true&wait=true`;

  const payload = {
    language_id: languageMeta.judge0Id,
    source_code: encodeB64(sourceCode),
    stdin: encodeB64(stdin),
    cpu_time_limit: Math.min(Math.max(timeoutMs / 1000, 1), 10),
    wall_time_limit: Math.min(Math.max((timeoutMs / 1000) * 1.5, 2), 15),
    memory_limit: 128000, // 128 MB maximum
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs + 4000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`Judge0 responded with HTTP ${response.status}`);
    }

    const data = await response.json();
    const stdout = decodeB64(data.stdout);
    const stderr = decodeB64(data.stderr);
    const compileOutput = decodeB64(data.compile_output);
    const message = decodeB64(data.message) || data.message || '';

    const timeSeconds = parseFloat(data.time) || 0;
    const executionTimeMs = Math.round(timeSeconds * 1000);

    const statusId = data.status?.id;
    const statusDesc = data.status?.description || 'Unknown';

    let status = 'success';
    let errorMessage = '';

    if (statusId === 3) {
      status = 'success';
      if (stderr) errorMessage = stderr;
    } else if (statusId === 5) {
      status = 'timeout';
      errorMessage = `Execution timed out (exceeded ${payload.cpu_time_limit}s limit). ${message}`.trim();
    } else if (statusId === 6) {
      status = 'error';
      errorMessage = compileOutput || stderr || 'Compilation Error';
    } else if (statusId >= 7 && statusId <= 12) {
      status = 'error';
      errorMessage = stderr || message || `Runtime Error: ${statusDesc}`;
    } else {
      status = 'error';
      errorMessage = stderr || compileOutput || message || `Status: ${statusDesc}`;
    }

    return {
      output: stdout || (status === 'success' && !errorMessage ? '(Program executed with no output)' : ''),
      errorMessage,
      status,
      executionTimeMs,
      isDemo: false,
      provider: 'Judge0 Sandbox Engine',
      rawStatus: statusDesc,
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Execute code using Piston API (alternative provider)
 */
async function executeWithPiston(languageMeta, sourceCode, stdin, timeoutMs) {
  const serviceUrl = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston/execute';
  const apiKey = process.env.PISTON_API_KEY || '';

  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = apiKey;

  const payload = {
    language: languageMeta.pistonLang,
    version: languageMeta.pistonVersion,
    files: [
      {
        name: `main.${languageMeta.extension}`,
        content: sourceCode,
      },
    ],
    stdin: stdin || '',
    run_timeout: timeoutMs,
    compile_timeout: timeoutMs,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs + 3000);

  try {
    const res = await fetch(serviceUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`Piston responded with HTTP ${res.status}`);
    }

    const data = await res.json();
    const compile = data.compile;
    const run = data.run;

    let status = 'success';
    let errorMessage = '';
    let output = '';

    if (compile && compile.code !== 0) {
      status = 'error';
      errorMessage = compile.stderr || compile.output || 'Compilation error';
    } else if (run) {
      if (run.signal === 'SIGKILL' || run.code === 137) {
        status = 'timeout';
        errorMessage = 'Execution timed out.';
      } else if (run.code !== 0) {
        status = 'error';
        errorMessage = run.stderr || run.output || `Program exited with code ${run.code}`;
        output = run.stdout || '';
      } else {
        status = 'success';
        output = run.stdout || (run.stderr ? '' : '(Program executed with no output)');
        errorMessage = run.stderr || '';
      }
    }

    return {
      output,
      errorMessage,
      status,
      executionTimeMs: 140,
      isDemo: false,
      provider: 'Piston Sandbox Engine',
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Transparent Demonstration Mode
 * Invoked ONLY when external sandbox credentials/service are offline or unreachable.
 * Never executes code on the host shell.
 */
function executeDemonstrationMode(languageMeta, sourceCode, stdin, reason = '') {
  let simulatedOutput = '';
  let simulatedError = '';
  let status = 'demo';

  const lines = sourceCode.split('\n');
  const codeTrimmed = sourceCode.trim();

  if (!codeTrimmed) {
    simulatedError = 'Error: Source code cannot be empty.';
    status = 'error';
  } else if (languageMeta.id === 'java' && !sourceCode.includes('class Main')) {
    simulatedError = 'Compilation Error (Demo Check):\nMain.java: public class Main not found. Class name must be "Main".';
    status = 'error';
  } else if ((languageMeta.id === 'c' || languageMeta.id === 'cpp') && !sourceCode.includes('main')) {
    simulatedError = `Compilation Error (Demo Check):\nUndefined reference to 'main'. Entry point function main() is required.`;
    status = 'error';
  } else {
    const detectedPrints = [];
    for (const line of lines) {
      const matchPrint = line.match(/(?:console\.log|print|System\.out\.println|printf|std::cout\s*<<)\s*\(?["'`]([^"'`]+)["'`]/);
      if (matchPrint && matchPrint[1]) {
        detectedPrints.push(matchPrint[1]);
      }
    }

    if (detectedPrints.length > 0) {
      simulatedOutput = detectedPrints.join('\n');
      if (stdin) {
        simulatedOutput = `[Standard input received: ${stdin.trim()}]\n` + simulatedOutput;
      }
    } else {
      simulatedOutput = `[Demonstration Mode]\nProgram structure validated for ${languageMeta.label}.\nLines of code: ${lines.length}\nCharacters: ${sourceCode.length}\nStandard input provided: ${stdin ? `"${stdin}"` : 'None'}`;
    }
  }

  return {
    output: simulatedOutput,
    errorMessage: simulatedError,
    status,
    executionTimeMs: 40,
    isDemo: true,
    provider: 'Demonstration Engine (Offline Simulation)',
    demoNotice: `DEMONSTRATION MODE: ${reason || 'Sandbox service unavailable or offline'}. Execution is simulated for educational testing. Live sandbox execution was not performed.`,
  };
}

/**
 * Main execution dispatcher
 */
async function executeCode({ language, sourceCode, stdin = '' }) {
  const languageMeta = SUPPORTED_LANGUAGES[language];
  if (!languageMeta) {
    throw new Error(`Unsupported programming language: "${language}". Supported: ${Object.keys(SUPPORTED_LANGUAGES).join(', ')}`);
  }

  if (!sourceCode || typeof sourceCode !== 'string' || !sourceCode.trim()) {
    throw new Error('Source code cannot be empty.');
  }

  if (sourceCode.length > 60000) {
    throw new Error('Source code exceeds maximum allowed size (60 KB).');
  }

  if (stdin && stdin.length > 15000) {
    throw new Error('Standard input exceeds maximum allowed size (15 KB).');
  }

  const timeoutMs = parseInt(process.env.EXECUTION_TIMEOUT_MS, 10) || 10000;
  const preferredService = (process.env.EXECUTION_SERVICE_TYPE || 'judge0').toLowerCase();

  try {
    if (preferredService === 'piston' && process.env.PISTON_API_URL) {
      return await executeWithPiston(languageMeta, sourceCode, stdin, timeoutMs);
    } else {
      return await executeWithJudge0(languageMeta, sourceCode, stdin, timeoutMs);
    }
  } catch (err) {
    console.warn(`[ExecutionService] Sandbox API failed (${err.message}). Falling back to demonstration mode.`);

    if (preferredService !== 'piston' && process.env.PISTON_API_URL) {
      try {
        return await executeWithPiston(languageMeta, sourceCode, stdin, timeoutMs);
      } catch (pistonErr) {
        console.warn(`[ExecutionService] Piston fallback also failed (${pistonErr.message}).`);
      }
    }

    return executeDemonstrationMode(
      languageMeta,
      sourceCode,
      stdin,
      `Sandbox service reached timeout or error: ${err.message}`
    );
  }
}

module.exports = {
  SUPPORTED_LANGUAGES,
  executeCode,
};

