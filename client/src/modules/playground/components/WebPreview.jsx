import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCcw,
  Smartphone,
  Tablet,
  Monitor,
  ShieldCheck,
  ExternalLink,
  Code2,
  Terminal,
  Maximize2
} from 'lucide-react';

export default function WebPreview({ htmlCode, onRunPreview }) {
  const [deviceView, setDeviceView] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [previewLogs, setPreviewLogs] = useState([]);
  const [showConsole, setShowConsole] = useState(false);
  const [key, setKey] = useState(0);

  // Sandboxed document injecting safe console message relay
  const generateSandboxedDoc = (sourceCode) => {
    const consoleBridge = `
      <script>
        (function() {
          const originalLog = console.log;
          const originalError = console.error;
          const originalWarn = console.warn;

          function sendLog(type, args) {
            try {
              const msg = Array.from(args).map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
              window.parent.postMessage({ type: 'PREVIEW_CONSOLE', logType: type, message: msg }, '*');
            } catch(e) {}
          }

          console.log = function() { sendLog('log', arguments); originalLog.apply(console, arguments); };
          console.error = function() { sendLog('error', arguments); originalError.apply(console, arguments); };
          console.warn = function() { sendLog('warn', arguments); originalWarn.apply(console, arguments); };

          window.onerror = function(msg, url, line) {
            sendLog('error', [msg + ' (line ' + line + ')']);
          };
        })();
      <\/script>
    `;

    if (sourceCode.includes('<head>')) {
      return sourceCode.replace('<head>', `<head>${consoleBridge}`);
    }
    return `${consoleBridge}\n${sourceCode}`;
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'PREVIEW_CONSOLE') {
        setPreviewLogs((prev) => [
          ...prev.slice(-49), // keep last 50 logs
          {
            type: event.data.logType,
            message: event.data.message,
            time: new Date().toLocaleTimeString()
          }
        ]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleRefresh = () => {
    setPreviewLogs([]);
    setKey((prev) => prev + 1);
    if (onRunPreview) onRunPreview();
  };

  const getDeviceWidthClass = () => {
    switch (deviceView) {
      case 'mobile':
        return 'max-w-[375px] h-[667px] my-auto';
      case 'tablet':
        return 'max-w-[768px] h-[90%] my-auto';
      default:
        return 'w-full h-full';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#090d13] border-t md:border-t-0 md:border-l border-gray-800">
      {/* Web Preview Toolbar */}
      <div className="bg-[#161b22] border-b border-gray-800 px-4 py-2 flex items-center justify-between">
        {/* Device View Mode Switchers */}
        <div className="flex items-center space-x-1 bg-[#0d1117] p-1 rounded-lg border border-gray-800">
          <button
            onClick={() => setDeviceView('desktop')}
            className={`p-1.5 rounded transition ${
              deviceView === 'desktop' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
            title="Desktop view (100%)"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeviceView('tablet')}
            className={`p-1.5 rounded transition ${
              deviceView === 'tablet' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
            title="Tablet view (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeviceView('mobile')}
            className={`p-1.5 rounded transition ${
              deviceView === 'mobile' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
            title="Mobile view (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Security Badge & Controls */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-800/40">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sandboxed Iframe</span>
          </div>

          <button
            onClick={() => setShowConsole(!showConsole)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition border ${
              showConsole
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                : 'bg-[#0d1117] text-gray-400 border-gray-800 hover:text-white'
            }`}
            title="Toggle iframe console messages"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Logs</span>
            {previewLogs.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-mono">
                {previewLogs.length}
              </span>
            )}
          </button>

          <button
            onClick={handleRefresh}
            className="p-1.5 rounded bg-[#0d1117] hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white transition"
            title="Refresh preview"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-3 overflow-hidden bg-dot-pattern">
        <div
          className={`relative transition-all duration-300 rounded-lg overflow-hidden border border-gray-800 shadow-2xl bg-white flex flex-col ${getDeviceWidthClass()}`}
        >
          {/* SECURE SANDBOXED IFRAME:
              - sandbox="allow-scripts" ensures scripts execute in a separate null origin.
              - Omitting "allow-same-origin" prevents the preview from accessing local storage, cookies, or the host DOM.
          */}
          <iframe
            key={key}
            srcDoc={generateSandboxedDoc(htmlCode)}
            title="SkillNest Web Sandbox"
            sandbox="allow-scripts"
            className="w-full h-full border-0 bg-white"
          />
        </div>
      </div>

      {/* Embedded Live Console Drawer */}
      {showConsole && (
        <div className="h-44 bg-[#0d1117] border-t border-gray-800 flex flex-col">
          <div className="bg-[#161b22] px-3 py-1.5 border-b border-gray-800 flex items-center justify-between text-xs text-gray-400">
            <span className="font-semibold text-gray-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              Web Preview Console Logs ({previewLogs.length})
            </span>
            <button
              onClick={() => setPreviewLogs([])}
              className="text-[11px] hover:text-red-400 transition"
            >
              Clear
            </button>
          </div>
          <div className="flex-1 p-3 overflow-auto font-mono text-xs space-y-1.5">
            {previewLogs.length === 0 ? (
              <p className="text-gray-500 text-[11px] italic">No console logs yet.</p>
            ) : (
              previewLogs.map((log, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 py-0.5 ${
                    log.type === 'error'
                      ? 'text-red-400'
                      : log.type === 'warn'
                      ? 'text-amber-400'
                      : 'text-gray-300'
                  }`}
                >
                  <span className="text-[10px] text-gray-500 shrink-0 font-mono">[{log.time}]</span>
                  <span className="font-medium shrink-0 uppercase text-[9px] px-1 rounded bg-gray-800">
                    {log.type}
                  </span>
                  <span className="whitespace-pre-wrap break-all">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
