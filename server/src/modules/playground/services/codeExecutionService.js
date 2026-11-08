import axios from 'axios';
import { performance } from 'perf_hooks';

/**
 * External Isolated Sandboxed Code Execution Service
 *
 * Supported execution providers:
 * 1. Wandbox Sandbox API (Open, zero-auth, rate-guarded, multi-language)
 * 2. Piston Sandbox API (Configurable for self-hosted or authenticated instances via PISTON_API_URL / PISTON_API_KEY)
 *
 * CRITICAL SECURITY PRINCIPLE:
 * NO untrusted user code is EVER executed locally on this host application server.
 * All executions take place inside remote, isolated container sandboxes.
 */

const PISTON_API_URL = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston';
const PISTON_API_KEY = process.env.PISTON_API_KEY || null;
const WANDBOX_API_URL = 'https://wandbox.org/api/compile.json';

// Language runtime configurations for external providers
export const LANGUAGE_RUNTIME_MAP = {
  javascript: {
    language: 'javascript',
    version: '20.17.0',
    wandboxCompiler: 'nodejs-20.17.0',
    pistonLanguage: 'javascript',
    pistonVersion: '18.15.0',
    extension: 'js',
    fileName: 'index.js'
  },
  python: {
    language: 'python',
    version: '3.14.0',
    wandboxCompiler: 'cpython-3.14.0',
    pistonLanguage: 'python',
    pistonVersion: '3.10.0',
    extension: 'py',
    fileName: 'main.py'
  },
  cpp: {
    language: 'cpp',
    version: '13.2.0',
    wandboxCompiler: 'gcc-13.2.0',
    pistonLanguage: 'c++',
    pistonVersion: '10.2.0',
    extension: 'cpp',
    fileName: 'main.cpp'
  },
  java: {
    language: 'java',
    version: '21.0.0',
    wandboxCompiler: 'openjdk-jdk-21+35',
    pistonLanguage: 'java',
    pistonVersion: '15.0.2',
    extension: 'java',
    fileName: 'Main.java'
  }
};

/**
 * Validates code execution payload and parameters
 */
export const validateExecutionPayload = ({ language, code, stdin }) => {
  if (!language || typeof language !== 'string') {
    return { valid: false, error: 'Language is required and must be a string.' };
  }

  const normalizedLang = language.toLowerCase().trim();

  // HTML / CSS / JS web preview check
  if (normalizedLang === 'html' || normalizedLang === 'web') {
    return {
      valid: false,
      isWeb: true,
      error: 'HTML/CSS/JS web code runs safely client-side in the sandboxed preview iframe.'
    };
  }

  if (!LANGUAGE_RUNTIME_MAP[normalizedLang]) {
    const supported = Object.keys(LANGUAGE_RUNTIME_MAP).join(', ');
    return {
      valid: false,
      error: `Unsupported language: '${language}'. Supported languages: ${supported}, html (client sandboxed preview).`
    };
  }

  if (typeof code !== 'string' || !code.trim()) {
    return { valid: false, error: 'Code content cannot be empty.' };
  }

  if (code.length > 50000) {
    return { valid: false, error: 'Code size limit exceeded (maximum 50,000 characters).' };
  }

  if (stdin && typeof stdin === 'string' && stdin.length > 10000) {
    return { valid: false, error: 'Input (stdin) size limit exceeded (maximum 10,000 characters).' };
  }

  return { valid: true, normalizedLang };
};

/**
 * Execute code via Wandbox Sandbox Provider
 */
async function executeViaWandbox(langConfig, code, stdin) {
  let sourceCode = code;

  // In Java on Wandbox, file is compiled as prog.java.
  // Transform 'public class' to 'class' and remove package declarations so prog.java compiles cleanly.
  if (langConfig.language === 'java') {
    sourceCode = code
      .replace(/\bpackage\s+[a-zA-Z0-9_.]+;\s*/g, '')
      .replace(/\bpublic\s+class\b/g, 'class');
  }

  const payload = {
    compiler: langConfig.wandboxCompiler,
    code: sourceCode,
    stdin: typeof stdin === 'string' ? stdin : ''
  };

  const response = await axios.post(WANDBOX_API_URL, payload, {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'SkillNest-Runner/1.0'
    },
    timeout: 45000 // 45 seconds HTTP network timeout guard (generous buffer for remote JVM compilation)
  });

  const data = response.data;
  const exitCode = parseInt(data.status, 10);
  const isCompileError = Boolean(data.compiler_error && data.compiler_error.trim());
  const isRuntimeError = !isCompileError && exitCode !== 0;

  let status = 'success';
  if (isCompileError) {
    status = 'compile_error';
  } else if (isRuntimeError) {
    status = 'runtime_error';
  }

  const stdout = data.program_output || data.program_message || '';
  const stderr = data.compiler_error || data.program_error || '';

  return {
    success: exitCode === 0 && !isCompileError,
    status,
    stdout,
    stderr,
    exitCode: isNaN(exitCode) ? (isCompileError ? 1 : 0) : exitCode,
    provider: 'Wandbox Sandbox Engine',
    version: langConfig.version
  };
}

/**
 * Execute code via Piston Sandbox Provider (when configured)
 */
async function executeViaPiston(langConfig, code, stdin) {
  const payload = {
    language: langConfig.pistonLanguage,
    version: langConfig.pistonVersion,
    files: [{ name: langConfig.fileName, content: code }],
    stdin: typeof stdin === 'string' ? stdin : '',
    run_timeout: 5000,
    compile_timeout: 10000
  };

  const headers = { 'Content-Type': 'application/json' };
  if (PISTON_API_KEY) {
    headers['Authorization'] = PISTON_API_KEY;
  }

  const response = await axios.post(`${PISTON_API_URL}/execute`, payload, {
    headers,
    timeout: 15000
  });

  const data = response.data;

  if (data.compile && data.compile.code !== 0) {
    return {
      success: false,
      status: 'compile_error',
      stdout: '',
      stderr: data.compile.output || data.compile.stderr || 'Compilation failed',
      exitCode: data.compile.code,
      provider: 'Piston Sandbox Engine',
      version: data.version || langConfig.pistonVersion
    };
  }

  const runResult = data.run || {};
  let status = 'success';
  if (runResult.signal === 'SIGKILL' || runResult.signal === 'SIGTERM') {
    status = 'time_limit_exceeded';
  } else if (runResult.code !== 0) {
    status = 'runtime_error';
  }

  return {
    success: runResult.code === 0,
    status,
    stdout: runResult.stdout || '',
    stderr: runResult.stderr || '',
    exitCode: runResult.code !== undefined ? runResult.code : 0,
    provider: 'Piston Sandbox Engine',
    version: data.version || langConfig.pistonVersion
  };
}

/**
 * Main Code Execution Orchestrator
 * Dispatches code to external sandbox with fallback resilience and duration tracking.
 *
 * @param {Object} params
 * @param {string} params.language
 * @param {string} params.code
 * @param {string} [params.stdin]
 * @returns {Promise<Object>} Execution result
 */
export const executeCode = async ({ language, code, stdin = '' }) => {
  const validation = validateExecutionPayload({ language, code, stdin });
  if (!validation.valid) {
    const error = new Error(validation.error);
    error.status = 400;
    error.isWeb = validation.isWeb || false;
    throw error;
  }

  const langConfig = LANGUAGE_RUNTIME_MAP[validation.normalizedLang];
  const startTime = performance.now();

  try {
    let result = null;

    // If PISTON_API_KEY is supplied or custom private instance configured, try Piston first
    if (PISTON_API_KEY || (process.env.PISTON_API_URL && !process.env.PISTON_API_URL.includes('emkc.org'))) {
      try {
        result = await executeViaPiston(langConfig, code, stdin);
      } catch (pistonErr) {
        console.warn(`[Piston Runner Warning]: ${pistonErr.message}. Falling back to Wandbox Sandbox.`);
        result = await executeViaWandbox(langConfig, code, stdin);
      }
    } else {
      // Default to reliable zero-auth Wandbox Sandbox
      result = await executeViaWandbox(langConfig, code, stdin);
    }

    const executionTimeMs = Math.round(performance.now() - startTime);

    return {
      ...result,
      executionTimeMs,
      language: validation.normalizedLang
    };
  } catch (error) {
    const executionTimeMs = Math.round(performance.now() - startTime);

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return {
        success: false,
        status: 'time_limit_exceeded',
        stdout: '',
        stderr: 'Execution timed out. Code execution exceeded the safe duration limit (45 seconds).',
        exitCode: -1,
        executionTimeMs,
        language: validation.normalizedLang,
        version: langConfig.version,
        provider: 'Timeout Guard'
      };
    }

    if (error.response) {
      const providerMsg = error.response.data?.message || error.response.data || error.response.statusText;
      return {
        success: false,
        status: 'provider_error',
        stdout: '',
        stderr: `Execution provider error: ${typeof providerMsg === 'string' ? providerMsg : JSON.stringify(providerMsg)}`,
        exitCode: error.response.status,
        executionTimeMs,
        language: validation.normalizedLang,
        version: langConfig.version,
        provider: 'External Runner Gateway'
      };
    }

    return {
      success: false,
      status: 'service_unavailable',
      stdout: '',
      stderr: `Code execution service is temporarily unreachable: ${error.message}`,
      exitCode: -1,
      executionTimeMs,
      language: validation.normalizedLang,
      version: langConfig.version,
      provider: 'Gateway'
    };
  }
};

export default {
  executeCode,
  validateExecutionPayload,
  LANGUAGE_RUNTIME_MAP
};
