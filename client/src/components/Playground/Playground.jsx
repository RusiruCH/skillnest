import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Play,
  RotateCcw,
  Trash2,
  Terminal,
  History,
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Download,
  Code2,
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
  X,
  FileCode,
  ShieldCheck,
  AlertTriangle,
  Lock,
  LogIn,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './playground.css';

// Default templates for supported languages
const DEFAULT_TEMPLATES = {
  javascript: `// SkillNest Code Playground - JavaScript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const terms = 10;
console.log(\`First \${terms} Fibonacci numbers:\`);
const series = Array.from({ length: terms }, (_, i) => fibonacci(i));
console.log(series.join(', '));
`,
  python: `# SkillNest Code Playground - Python
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
  java: `// SkillNest Code Playground - Java
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
  c: `// SkillNest Code Playground - C
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
  cpp: `// SkillNest Code Playground - C++
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
`
};

const LANGUAGE_CONFIG = {
  javascript: { label: 'JavaScript (Node.js)', monaco: 'javascript', ext: 'js' },
  python: { label: 'Python (3.10+)', monaco: 'python', ext: 'py' },
  java: { label: 'Java (OpenJDK)', monaco: 'java', ext: 'java' },
  c: { label: 'C (GCC 10.2)', monaco: 'c', ext: 'c' },
  cpp: { label: 'C++ (GCC 10.2)', monaco: 'cpp', ext: 'cpp' }
};

export default function Playground() {
  const navigate = useNavigate();
  const { user, isAuthenticated, switchRole } = useAuth();

  // State
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(DEFAULT_TEMPLATES.javascript);
  const [stdin, setStdin] = useState('');
  const [showStdin, setShowStdin] = useState(false);
  const [output, setOutput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [authError, setAuthError] = useState(false);
  const [execStatus, setExecStatus] = useState('idle'); // idle | running | success | error | timeout | demo
  const [execTime, setExecTime] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoNotice, setDemoNotice] = useState('');
  const [provider, setProvider] = useState('');

  // History state
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Editor configuration
  const [editorTheme, setEditorTheme] = useState('vs-dark'); // vs-dark | light
  const [fontSize, setFontSize] = useState(13);
  const [copied, setCopied] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState('output'); // output | errors
  const [monacoAvailable, setMonacoAvailable] = useState(true);

  const editorRef = useRef(null);

  // Load execution history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  // Fetch execution history from backend
  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await api.get('/playground/history?limit=25');
      setHistory(res.data.items || []);
    } catch (err) {
      if (err.response?.status === 401) {
        setHistory([]);
      } else {
        console.warn('Could not load execution history:', err.message);
      }
    } finally {
      setHistoryLoading(false);
    }
  };

  // Switch programming language
  const handleLanguageChange = (newLang) => {
    if (newLang === language) return;

    // Check if current code matches standard template before overwriting
    const isCurrentDefault = Object.values(DEFAULT_TEMPLATES).some(
      tmpl => tmpl.trim() === code.trim()
    );

    setLanguage(newLang);
    if (isCurrentDefault || !code.trim()) {
      setCode(DEFAULT_TEMPLATES[newLang] || '');
    }
  };

  // Reset code to selected language default
  const handleResetCode = () => {
    if (window.confirm('Reset code to the default starter template for ' + LANGUAGE_CONFIG[language].label + '?')) {
      setCode(DEFAULT_TEMPLATES[language] || '');
    }
  };

  // Clear code editor
  const handleClearCode = () => {
    if (window.confirm('Clear all code in the editor?')) {
      setCode('');
    }
  };

  // Clear console output and error panels
  const handleClearConsole = () => {
    setOutput('');
    setErrorMessage('');
    setAuthError(false);
    setExecStatus('idle');
    setExecTime(null);
    setIsDemoMode(false);
    setDemoNotice('');
  };

  // Format code (Monaco action or indentation cleanup)
  const handleFormatCode = () => {
    if (editorRef.current) {
      try {
        editorRef.current.getAction('editor.action.formatDocument')?.run();
      } catch (e) {
        // Fallback simple line trim
        const lines = code.split('\n').map(l => l.trimEnd());
        setCode(lines.join('\n'));
      }
    }
  };

  // Copy output to clipboard
  const handleCopyOutput = () => {
    const textToCopy = errorMessage ? `Error:\n${errorMessage}\n\nOutput:\n${output}` : output;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download source code file
  const handleDownloadCode = () => {
    const ext = LANGUAGE_CONFIG[language]?.ext || 'txt';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `main.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Execute Code via backend API
  const handleRunCode = async () => {
    if (!code.trim()) {
      setErrorMessage('Please enter source code to run.');
      setActiveConsoleTab('errors');
      setExecStatus('error');
      return;
    }

    setExecStatus('running');
    setErrorMessage('');
    setAuthError(false);
    setOutput('');
    setIsDemoMode(false);
    setDemoNotice('');

    try {
      const res = await api.post('/playground/execute', {
        language,
        sourceCode: code,
        stdin
      });

      const { execution, isDemo, demoNotice: notice, provider: prov } = res.data;

      setOutput(execution.output || '');
      setErrorMessage(execution.errorMessage || '');
      setExecStatus(execution.status || 'success');
      setExecTime(execution.executionTimeMs || 0);
      setIsDemoMode(Boolean(isDemo));
      setDemoNotice(notice || '');
      setProvider(prov || 'Sandbox Service');

      if (execution.errorMessage && !execution.output) {
        setActiveConsoleTab('errors');
      } else {
        setActiveConsoleTab('output');
      }

      // Refresh history list
      loadHistory();
    } catch (err) {
      setExecStatus('error');
      if (err.response?.status === 401) {
        // Dedicated handling for unauthorized/expired token
        setAuthError(true);
        setErrorMessage('');
        setActiveConsoleTab('errors');
      } else {
        const errText = err.response?.data?.message || err.message || 'Execution request failed.';
        setErrorMessage(errText);
        setActiveConsoleTab('errors');
      }
    }
  };

  // Load a historical execution back into the editor
  const handleLoadFromHistory = (item) => {
    if (item.language && DEFAULT_TEMPLATES[item.language]) {
      setLanguage(item.language);
    }
    setCode(item.sourceCode || '');
    if (item.stdin) {
      setStdin(item.stdin);
      setShowStdin(true);
    }
    setOutput(item.output || '');
    setErrorMessage(item.errorMessage || '');
    setExecStatus(item.status || 'success');
    setExecTime(item.executionTimeMs || null);
    setIsDemoMode(Boolean(item.isDemo));
    setShowHistory(false);
  };

  // Delete a single history item
  const handleDeleteHistory = async (e, id) => {
    e.stopPropagation();
    try {
      await api.delete(`/playground/history/${id}`);
      setHistory(prev => prev.filter(h => h._id !== id));
    } catch (err) {
      console.error('Delete failed:', err.message);
    }
  };

  // Clear all history
  const handleClearAllHistory = async () => {
    if (window.confirm('Delete your entire code execution history? This cannot be undone.')) {
      try {
        await api.delete('/playground/history');
        setHistory([]);
      } catch (err) {
        console.error('Clear history failed:', err.message);
      }
    }
  };

  // Keyboard shortcut listener (Ctrl+Enter or Cmd+Enter to run)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, language, stdin]);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  return (
    <div className="pg-container">
      {/* Top Banner Header */}
      <div className="pg-topbar">
        <div className="pg-brand-meta">
          <div className="art-book" style={{ width: 40, height: 40, borderRadius: 12 }}>
            <Code2 size={22} color="#fff" />
          </div>
          <div>
            <h2>
              Code Playground
              {isDemoMode && (
                <span className="pg-status-badge pg-status-demo" title="Execution in demonstration mode">
                  DEMO MODE
                </span>
              )}
            </h2>
            <p>Write, compile, and execute code in an isolated sandbox with instant output & diagnostics.</p>
          </div>
        </div>

        <div className="pg-top-actions">
          {/* Theme Selector */}
          <button
            type="button"
            className="pg-btn pg-btn-secondary"
            onClick={() => setEditorTheme(t => t === 'vs-dark' ? 'light' : 'vs-dark')}
            title="Toggle Editor Dark/Light Theme"
          >
            <Sliders size={14} />
            <span>Theme: {editorTheme === 'vs-dark' ? 'Dark' : 'Light'}</span>
          </button>

          {/* History Toggle Button */}
          <button
            type="button"
            className={`pg-btn pg-btn-secondary ${showHistory ? 'pg-btn-active' : ''}`}
            onClick={() => setShowHistory(!showHistory)}
            title="View Past Executions"
          >
            <History size={14} />
            <span>History ({history.length})</span>
          </button>
        </div>
      </div>

      {/* Main Action Toolbar */}
      <div className="pg-toolbar">
        <div className="pg-toolbar-left">
          {/* Programming Language Selection */}
          <div className="pg-lang-selector">
            <FileCode size={16} color="#8c7be4" />
            <label htmlFor="language-select" className="sr-only">Language:</label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              aria-label="Select Programming Language"
            >
              {Object.entries(LANGUAGE_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          {/* Run Code Button */}
          <button
            type="button"
            className="pg-btn pg-btn-run"
            onClick={handleRunCode}
            disabled={execStatus === 'running'}
            title="Execute Code (Ctrl + Enter)"
          >
            <Play size={15} fill={execStatus === 'running' ? 'none' : 'currentColor'} />
            <span>{execStatus === 'running' ? 'Executing...' : 'Run Code'}</span>
          </button>

          {/* Format Code Button */}
          <button
            type="button"
            className="pg-btn pg-btn-secondary"
            onClick={handleFormatCode}
            title="Format Source Code"
          >
            <Sparkles size={14} />
            <span>Format</span>
          </button>

          {/* Clear Code Button */}
          <button
            type="button"
            className="pg-btn pg-btn-secondary"
            onClick={handleClearCode}
            title="Clear Code Area"
          >
            <Trash2 size={14} />
            <span>Clear</span>
          </button>

          {/* Reset Code Button */}
          <button
            type="button"
            className="pg-btn pg-btn-secondary"
            onClick={handleResetCode}
            title="Reset to Language Boilerplate Template"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>

          {/* Stdin Toggle */}
          <button
            type="button"
            className={`pg-btn pg-btn-secondary ${showStdin ? 'pg-btn-active' : ''}`}
            onClick={() => setShowStdin(!showStdin)}
            title="Toggle Program Input (stdin)"
          >
            <Terminal size={14} />
            <span>Input {showStdin ? <ChevronUp size={12} /> : <ChevronDown size={12} />}</span>
          </button>
        </div>

        <div className="pg-toolbar-right">
          {/* Execution Status Indicator */}
          <div className="pg-status-indicator">
            {authError ? (
              <span className="pg-status-badge pg-status-auth-error">
                <Lock size={13} /> Unauthorized (401)
              </span>
            ) : (
              <>
                {execStatus === 'idle' && (
                  <span className="pg-status-badge pg-status-idle">
                    <span className="pg-pulse-dot" /> Ready
                  </span>
                )}
                {execStatus === 'running' && (
                  <span className="pg-status-badge pg-status-running">
                    <span className="pg-pulse-dot" /> Executing in Sandbox...
                  </span>
                )}
                {execStatus === 'success' && (
                  <span className="pg-status-badge pg-status-success">
                    <CheckCircle2 size={13} /> Completed {execTime !== null ? `(${execTime}ms)` : ''}
                  </span>
                )}
                {execStatus === 'error' && (
                  <span className="pg-status-badge pg-status-error">
                    <AlertCircle size={13} /> Execution Error
                  </span>
                )}
                {execStatus === 'timeout' && (
                  <span className="pg-status-badge pg-status-timeout">
                    <Clock size={13} /> Time Limit Exceeded
                  </span>
                )}
                {execStatus === 'demo' && (
                  <span className="pg-status-badge pg-status-demo">
                    <AlertTriangle size={13} /> Demo Execution
                  </span>
                )}
              </>
            )}
          </div>

          {/* Download code */}
          <button
            type="button"
            className="pg-btn pg-btn-secondary"
            onClick={handleDownloadCode}
            title="Download source code"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* History Drawer (Collapsible) */}
      {showHistory && (
        <div className="pg-history-drawer">
          <div className="pg-history-header">
            <h3>
              <History size={18} color="#735ce0" />
              <span>My Execution History</span>
            </h3>
            <div style={{ display: 'flex', gap: 8 }}>
              {history.length > 0 && (
                <button
                  type="button"
                  className="pg-btn pg-btn-danger"
                  onClick={handleClearAllHistory}
                >
                  <Trash2 size={13} /> Clear All
                </button>
              )}
              <button
                type="button"
                className="pg-btn pg-btn-secondary"
                onClick={() => setShowHistory(false)}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="pg-history-list">
            {history.length === 0 ? (
              <div className="pg-empty-history">
                {historyLoading ? 'Loading history...' : 'No past executions recorded yet. Run some code to see history here!'}
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item._id}
                  className="pg-history-item"
                  onClick={() => handleLoadFromHistory(item)}
                  title="Click to load this code into editor"
                  role="button"
                  tabIndex={0}
                >
                  <div className="pg-history-meta">
                    <span className={`pg-lang-badge ${item.language}`}>
                      {item.language}
                    </span>
                    <div className="pg-history-info">
                      <b>{item.sourceCode.slice(0, 55).replace(/\n/g, ' ')}...</b>
                      <small>
                        {new Date(item.executionDate || item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · {item.executionTimeMs || 0}ms · {item.status}
                      </small>
                    </div>
                  </div>

                  <div className="pg-history-actions">
                    <button
                      type="button"
                      className="pg-btn pg-btn-secondary"
                      onClick={(e) => { e.stopPropagation(); handleLoadFromHistory(item); }}
                      style={{ padding: '5px 10px', fontSize: 11 }}
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      className="pg-btn pg-btn-danger"
                      onClick={(e) => handleDeleteHistory(e, item._id)}
                      style={{ padding: '5px 8px' }}
                      title="Delete record"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Auth Alert Banner */}
      {authError && (
        <div className="pg-auth-banner" role="alert">
          <div className="pg-auth-banner-icon">
            <Lock size={20} />
          </div>
          <div className="pg-auth-banner-content">
            <div className="pg-auth-banner-title">
              Authentication Required for Code Execution
            </div>
            <p className="pg-auth-banner-text">
              Your authorization session is invalid or has expired. The Code Playground executes programs in an isolated, secure sandbox and requires a valid learner or instructor session.
            </p>
            <div className="pg-auth-banner-actions">
              <button
                type="button"
                className="pg-btn pg-btn-primary"
                onClick={() => navigate('/login')}
              >
                <LogIn size={13} />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                className="pg-btn pg-btn-secondary"
                onClick={async () => {
                  await switchRole('learner');
                  setAuthError(false);
                  loadHistory();
                }}
              >
                <KeyRound size={13} />
                <span>Quick Login as Learner</span>
              </button>
              <button
                type="button"
                className="pg-btn pg-btn-secondary"
                onClick={() => setAuthError(false)}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Split Layout: Editor on Left, Console/Output on Right */}
      <div className="pg-workspace-grid">
        {/* Left Side: Code Editor */}
        <div className="pg-editor-box">
          <div className="pg-editor-header">
            <div className="pg-tab-pill">
              <span className="dot" />
              <span>main.{LANGUAGE_CONFIG[language]?.ext || 'txt'}</span>
            </div>
            <div className="pg-editor-controls">
              <span>Font: {fontSize}px</span>
              <button
                type="button"
                className="pg-icon-action"
                onClick={() => setFontSize(s => Math.max(s - 1, 11))}
                title="Decrease font size"
              >
                A-
              </button>
              <button
                type="button"
                className="pg-icon-action"
                onClick={() => setFontSize(s => Math.min(s + 1, 20))}
                title="Increase font size"
              >
                A+
              </button>
            </div>
          </div>

          {/* Monaco Editor Canvas */}
          <div className="pg-editor-canvas">
            {monacoAvailable ? (
              <Editor
                height="100%"
                language={LANGUAGE_CONFIG[language]?.monaco || 'javascript'}
                theme={editorTheme}
                value={code}
                onChange={(val) => setCode(val || '')}
                onMount={handleEditorDidMount}
                options={{
                  fontSize: fontSize,
                  fontFamily: "'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  wordWrap: 'on',
                  automaticLayout: true,
                  tabSize: 2,
                  renderLineHighlight: 'all',
                  padding: { top: 12, bottom: 12 }
                }}
                loading={
                  <div style={{ padding: 24, color: '#888', fontStyle: 'italic' }}>
                    Loading Monaco Editor...
                  </div>
                }
              />
            ) : (
              /* Fallback Accessible Editor */
              <div className="pg-fallback-editor">
                <div className="pg-fallback-lines">
                  {code.split('\n').map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <textarea
                  className="pg-fallback-textarea"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck="false"
                  aria-label="Source code editor"
                />
              </div>
            )}
          </div>

          {/* Optional Interactive Stdin (Input) Section */}
          {showStdin && (
            <div className="pg-stdin-panel">
              <div className="pg-stdin-header">
                <span>Standard Input (stdin)</span>
                <small style={{ color: '#64748b', fontSize: 10 }}>
                  Passed to program for input() / Scanner / cin
                </small>
              </div>
              <textarea
                className="pg-stdin-textarea"
                placeholder="Enter input data here (each line will be fed sequentially to standard input)..."
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                rows={3}
                aria-label="Standard input area"
              />
            </div>
          )}

          {/* Editor Footer */}
          <div className="pg-editor-footer">
            <span>UTF-8 · {code.length} characters · {code.split('\n').length} lines</span>
            <span>Shortcut: Ctrl + Enter to run</span>
          </div>
        </div>

        {/* Right Side: Output and Error Console */}
        <div className="pg-console-box">
          {/* Console Header Tabs */}
          <div className="pg-console-tabs">
            <div className="pg-tab-group">
              <button
                type="button"
                className={`pg-tab-btn ${activeConsoleTab === 'output' ? 'active' : ''}`}
                onClick={() => setActiveConsoleTab('output')}
              >
                <Terminal size={14} />
                <span>Program Output</span>
              </button>
              <button
                type="button"
                className={`pg-tab-btn ${activeConsoleTab === 'errors' ? 'active' : ''}`}
                onClick={() => setActiveConsoleTab('errors')}
              >
                <AlertCircle size={14} />
                <span>Diagnostics & Errors</span>
                {(errorMessage || authError) && (
                  <span className="pg-tab-badge">!</span>
                )}
              </button>
            </div>

            <div className="pg-console-actions">
              <button
                type="button"
                className="pg-icon-action"
                onClick={handleCopyOutput}
                title="Copy Console Output"
              >
                {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                type="button"
                className="pg-icon-action"
                onClick={handleClearConsole}
                title="Clear Console Output"
              >
                <Trash2 size={13} />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Console Viewport */}
          <div className="pg-console-viewport">
            {/* Demo Notice Banner */}
            {isDemoMode && demoNotice && (
              <div className="pg-demo-banner">
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <b>Demonstration Mode</b>
                  <p>{demoNotice}</p>
                </div>
              </div>
            )}

            {/* Error Display Panel */}
            {activeConsoleTab === 'errors' && (
              <div>
                {authError ? (
                  <div className="pg-auth-error-card">
                    <div className="pg-auth-error-card-header">
                      <Lock size={15} color="#f87171" />
                      <span>Authorization Error (HTTP 401)</span>
                    </div>
                    <p className="pg-auth-error-card-body">
                      Invalid or expired authorization token. This request was blocked by the SkillNest authentication gateway.
                      Your submitted source code was not executed. Please sign in to establish a valid session.
                    </p>
                    <div className="pg-auth-error-card-actions">
                      <button
                        type="button"
                        className="pg-btn pg-btn-primary"
                        onClick={() => navigate('/login')}
                        style={{ fontSize: 12, padding: '6px 12px' }}
                      >
                        <LogIn size={13} /> Sign In
                      </button>
                      <button
                        type="button"
                        className="pg-btn pg-btn-secondary"
                        onClick={async () => {
                          await switchRole('learner');
                          setAuthError(false);
                          loadHistory();
                        }}
                        style={{ fontSize: 12, padding: '6px 12px' }}
                      >
                        <KeyRound size={13} /> Re-authenticate Session
                      </button>
                    </div>
                  </div>
                ) : errorMessage ? (
                  <div className="pg-stderr-box">
                    <div className="pg-stderr-header">
                      <AlertCircle size={15} />
                      <span>Diagnostics / Compiler Error</span>
                    </div>
                    <pre className="pg-stderr-content">{errorMessage}</pre>
                  </div>
                ) : (
                  <div className="pg-stdout empty">
                    No compilation or runtime errors detected. Program executed cleanly.
                  </div>
                )}
              </div>
            )}

            {/* Program Output Panel */}
            {activeConsoleTab === 'output' && (
              <div>
                {authError && (
                  <div className="pg-auth-error-card" style={{ marginBottom: 12 }}>
                    <div className="pg-auth-error-card-header">
                      <Lock size={14} color="#f87171" />
                      <span>Authorization Required (401)</span>
                    </div>
                    <p className="pg-auth-error-card-body">
                      Your session token is invalid or expired. Please sign in to run code in the sandbox.
                    </p>
                  </div>
                )}

                {errorMessage && (
                  <div className="pg-stderr-box">
                    <div className="pg-stderr-header">
                      <AlertCircle size={14} />
                      <span>Error occurred during execution:</span>
                    </div>
                    <pre className="pg-stderr-content">{errorMessage}</pre>
                  </div>
                )}

                {output ? (
                  <pre className="pg-stdout">{output}</pre>
                ) : (
                  !errorMessage && !authError && (
                    <div className="pg-stdout empty">
                      {execStatus === 'running'
                        ? 'Executing program in secure sandbox...'
                        : 'Your program output will appear here after clicking "Run Code".'}
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Footer Security / Sandbox Callout */}
          <div style={{ background: '#121824', padding: '10px 16px', borderTop: '1px solid #21262d', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#64748b' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={14} color="#10b981" />
              <span>Isolated Sandbox Security · Strict CPU & Memory Limits</span>
            </span>
            <span>{provider || 'Judge0 Engine'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

