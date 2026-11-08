import React, { useState } from 'react';
import {
  Terminal,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Trash2,
  Copy,
  Check,
  CornerDownLeft,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function OutputPanel({
  output = {},
  isRunning,
  stdin,
  onStdinChange,
  onClearConsole
}) {
  const [activeTab, setActiveTab] = useState('output'); // 'output' | 'stdin'
  const [copied, setCopied] = useState(false);

  const {
    stdout = '',
    stderr = '',
    status = 'idle',
    executionTimeMs = null,
    exitCode = null,
    provider = ''
  } = output;

  const handleCopy = () => {
    const textToCopy = [stdout, stderr].filter(Boolean).join('\n');
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    if (isRunning) {
      return (
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
          Running...
        </span>
      );
    }

    switch (status) {
      case 'success':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Success (Exit: {exitCode ?? 0})
          </span>
        );
      case 'compile_error':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            Compilation Error
          </span>
        );
      case 'runtime_error':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3.5 h-3.5" />
            Runtime Error (Exit: {exitCode})
          </span>
        );
      case 'time_limit_exceeded':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Clock className="w-3.5 h-3.5" />
            Time Limit Exceeded
          </span>
        );
      default:
        return (
          <span className="text-[11px] text-gray-500 font-mono">Ready</span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] border-t md:border-t-0 md:border-l border-gray-800">
      {/* Console Header Bar */}
      <div className="bg-[#161b22] border-b border-gray-800 px-4 py-2 flex items-center justify-between">
        {/* Left Tabs */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('output')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
              activeTab === 'output'
                ? 'bg-[#0d1117] text-white border border-gray-700 shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Terminal Output</span>
            {(stdout || stderr) && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('stdin')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
              activeTab === 'stdin'
                ? 'bg-[#0d1117] text-white border border-gray-700 shadow-sm'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <CornerDownLeft className="w-3.5 h-3.5 text-blue-400" />
            <span>Standard Input</span>
            {stdin && stdin.trim() && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            )}
          </button>
        </div>

        {/* Right Tools (Status, Duration, Copy, Clear) */}
        <div className="flex items-center space-x-2">
          {getStatusBadge()}

          {executionTimeMs !== null && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-gray-400 font-mono bg-gray-900/60 px-2 py-0.5 rounded border border-gray-800">
              <Clock className="w-3 h-3 text-gray-500" />
              {executionTimeMs}ms
            </span>
          )}

          <div className="h-4 w-px bg-gray-800" />

          <button
            onClick={handleCopy}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition"
            title="Copy output"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={onClearConsole}
            className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-gray-800 transition"
            title="Clear console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Console Body */}
      <div className="flex-1 p-4 font-mono text-xs overflow-auto bg-[#0d1117]">
        {activeTab === 'output' ? (
          <div className="h-full space-y-3">
            {isRunning ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12 space-y-2">
                <span className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span>Running code in remote sandbox...</span>
              </div>
            ) : !stdout && !stderr ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12 select-none">
                <Terminal className="w-8 h-8 text-gray-600 mb-2 stroke-[1.5]" />
                <p className="text-gray-400 font-medium">Console is empty</p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Click <span className="text-emerald-400">Run</span> or press <kbd className="bg-gray-800 px-1 py-0.5 rounded text-[10px]">Ctrl+Enter</kbd> to execute
                </p>
              </div>
            ) : (
              <>
                {/* Standard Output (stdout) */}
                {stdout && (
                  <div className="bg-[#11161d] rounded-lg p-3 border border-gray-800/80">
                    <div className="text-[10px] text-emerald-400 uppercase tracking-wider mb-1 font-semibold flex items-center justify-between">
                      <span>Standard Output (stdout)</span>
                      {provider && <span className="text-gray-500 font-normal">{provider}</span>}
                    </div>
                    <pre className="text-gray-100 whitespace-pre-wrap break-words leading-relaxed font-mono">
                      {stdout}
                    </pre>
                  </div>
                )}

                {/* Standard Error / Compilation Errors (stderr) */}
                {stderr && (
                  <div className="bg-red-950/20 rounded-lg p-3 border border-red-900/40">
                    <div className="text-[10px] text-red-400 uppercase tracking-wider mb-1 font-semibold">
                      Standard Error / Traceback (stderr)
                    </div>
                    <pre className="text-red-300 whitespace-pre-wrap break-words leading-relaxed font-mono">
                      {stderr}
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          /* Stdin Tab */
          <div className="h-full flex flex-col space-y-2">
            <div className="text-[11px] text-gray-400 flex items-center justify-between">
              <span>Standard Input (stdin passed to program at runtime):</span>
              <span className="text-[10px] text-gray-500">For input(), cin &gt;&gt;, Scanner</span>
            </div>
            <textarea
              value={stdin}
              onChange={(e) => onStdinChange(e.target.value)}
              placeholder="Enter standard input values here (e.g. numbers, words, lines)..."
              className="flex-1 w-full bg-[#11161d] text-gray-200 border border-gray-800 rounded-lg p-3 font-mono text-xs focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
        )}
      </div>

      {/* Console Footer Status */}
      <div className="bg-[#161b22] border-t border-gray-800 px-4 py-1.5 flex items-center justify-between text-[11px] text-gray-500 select-none">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>External Sandbox Active</span>
        </span>
        <span className="font-mono">UTF-8</span>
      </div>
    </div>
  );
}
