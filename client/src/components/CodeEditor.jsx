import React, { useState } from 'react';
import { Play, Copy, Check, RotateCcw, Code2, Terminal } from 'lucide-react';

export default function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  onLanguageChange,
  readOnly = false,
  starterCode = null,
}) {
  const [copied, setCopied] = useState(false);
  const [testOutput, setTestOutput] = useState(null);
  const [running, setRunning] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    if (starterCode && confirm('Reset code editor to starter template?')) {
      onChange(starterCode);
    }
  };

  const handleRunMockTest = () => {
    setRunning(true);
    setTestOutput(null);
    setTimeout(() => {
      setRunning(false);
      setTestOutput({
        passed: true,
        message: 'Compilation Succeeded: 2/2 sample test cases passed locally.',
        time: '18 ms',
        memory: '14.2 MB',
      });
    }, 800);
  };

  const lineCount = (value || '').split('\n').length;

  return (
    <div className="rounded-2xl border border-slate-700/80 bg-[#0d131f] overflow-hidden shadow-2xl flex flex-col">
      <div className="h-11 bg-[#141b2b] border-b border-slate-700/60 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>

          <div className="h-4 w-px bg-slate-700" />

          <div className="flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-purple-400" />
            <select
              value={language}
              disabled={readOnly}
              onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="javascript" className="bg-slate-900 text-white">JavaScript (Node.js)</option>
              <option value="python" className="bg-slate-900 text-white">Python 3.10</option>
              <option value="cpp" className="bg-slate-900 text-white">C++ (GCC 12)</option>
              <option value="java" className="bg-slate-900 text-white">Java 17</option>
              <option value="typescript" className="bg-slate-900 text-white">TypeScript</option>
              <option value="html_css" className="bg-slate-900 text-white">HTML / CSS / React</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {starterCode && !readOnly && (
            <button
              type="button"
              onClick={handleReset}
              title="Reset to starter template"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {!readOnly && (
            <button
              type="button"
              onClick={handleRunMockTest}
              disabled={running}
              className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-purple-200 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 rounded-lg transition-all"
            >
              <Play className={`w-3 h-3 text-purple-400 ${running ? 'animate-spin' : ''}`} />
              <span>{running ? 'Running...' : 'Run Test'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex relative font-mono text-xs overflow-hidden min-h-[300px] max-h-[500px]">
        <div className="w-12 py-3 bg-[#0a0f19] text-slate-500 select-none text-right pr-3 font-mono border-r border-slate-800/80">
          {Array.from({ length: Math.max(lineCount, 12) }).map((_, i) => (
            <div key={i} className="leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        <textarea
          value={value}
          readOnly={readOnly}
          onChange={(e) => onChange && onChange(e.target.value)}
          spellCheck="false"
          placeholder="// Paste or type your solution source code here..."
          className="flex-1 p-3 bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none resize-none font-mono leading-6 whitespace-pre overflow-y-auto"
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              const start = e.target.selectionStart;
              const end = e.target.selectionEnd;
              const newValue = value.substring(0, start) + '  ' + value.substring(end);
              onChange(newValue);
              setTimeout(() => {
                e.target.selectionStart = e.target.selectionEnd = start + 2;
              }, 0);
            }
          }}
        />
      </div>

      {testOutput && (
        <div className="bg-[#090d16] border-t border-slate-800 p-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
            <Terminal className="w-3.5 h-3.5" />
            <span>{testOutput.message}</span>
          </div>
          <div className="text-slate-400 flex gap-4 text-[11px]">
            <span>Runtime: <strong className="text-slate-200">{testOutput.time}</strong></span>
            <span>Memory: <strong className="text-slate-200">{testOutput.memory}</strong></span>
          </div>
        </div>
      )}

      <div className="h-7 bg-[#111726] border-t border-slate-800/80 px-4 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>Lines: {lineCount} | Chars: {(value || '').length}</span>
        <span>UTF-8 • {language}</span>
      </div>
    </div>
  );
}
