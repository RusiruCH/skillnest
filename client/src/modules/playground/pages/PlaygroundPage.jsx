import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import EditorHeader from '../components/EditorHeader';
import CodeEditor from '../components/CodeEditor';
import OutputPanel from '../components/OutputPanel';
import WebPreview from '../components/WebPreview';
import SaveSnippetModal from '../components/SaveSnippetModal';
import ShareSnippetModal from '../components/ShareSnippetModal';
import SnippetVaultModal from '../components/SnippetVaultModal';
import TemplateSelectorModal from '../components/TemplateSelectorModal';
import {
  fetchSupportedLanguages,
  executeCodeApi,
  fetchSnippetByIdApi,
  forkSnippetApi,
  getCurrentAuthUser
} from '../services/playgroundService';
import { STARTER_TEMPLATES } from '../data/starterTemplates';
import { CheckCircle2, AlertTriangle, Info, Terminal, Globe, Code2 } from 'lucide-react';

export default function PlaygroundPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const editorRef = useRef(null);

  // Core Workspace State
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState({
    stdout: '',
    stderr: '',
    status: 'idle',
    executionTimeMs: null,
    exitCode: null,
    provider: ''
  });
  const [isRunning, setIsRunning] = useState(false);
  const [theme, setTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [isWebMode, setIsWebMode] = useState(false);
  const [activeSnippet, setActiveSnippet] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Responsive mobile active view
  const [mobileView, setMobileView] = useState('editor'); // 'editor' | 'output'

  // Modals state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // Toast Notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Initial Load: Languages & User
  useEffect(() => {
    const user = getCurrentAuthUser();
    setCurrentUser(user);

    async function initPlayground() {
      try {
        const langData = await fetchSupportedLanguages();
        const langs = langData.languages || [];
        setLanguages(langs);

        // Check if loading snippet from URL (?snippet=id)
        const snippetId = searchParams.get('snippet');
        if (snippetId) {
          try {
            const res = await fetchSnippetByIdApi(snippetId);
            if (res.data) {
              loadSnippetIntoWorkspace(res.data);
              return;
            }
          } catch (err) {
            console.error('Could not load snippet from URL:', err);
            showToast('Could not load shared snippet from URL.', 'error');
          }
        }

        // Default initial code template
        const defaultJs = langs.find((l) => l.id === 'javascript')?.defaultCode;
        setCode(defaultJs || STARTER_TEMPLATES.javascript[0].code);
      } catch (err) {
        console.error('Failed to load supported languages:', err);
        showToast('Connecting to playground backend...', 'warning');
      }
    }

    initPlayground();
  }, []);

  // 2. Language Change Handler
  const handleLanguageChange = (newLangId) => {
    setSelectedLanguage(newLangId);
    setActiveSnippet(null); // Detach previous saved snippet context

    // Pick starter code for the new language
    const langObj = languages.find((l) => l.id === newLangId);
    const starterTemplate = STARTER_TEMPLATES[newLangId]?.[0]?.code;
    const initialCode = starterTemplate || langObj?.defaultCode || '// Start coding here...';
    setCode(initialCode);
    setOutput({
      stdout: '',
      stderr: '',
      status: 'idle',
      executionTimeMs: null,
      exitCode: null
    });

    showToast(`Switched language to ${langObj?.name || newLangId}`, 'info');
  };

  // 3. Web Mode Switcher
  const handleToggleWebMode = (enableWeb) => {
    setIsWebMode(enableWeb);
    setActiveSnippet(null);
    if (enableWeb) {
      setSelectedLanguage('html');
      const webTemplate = STARTER_TEMPLATES.html[0].code;
      setCode(webTemplate);
      showToast('Switched to Live Web Preview mode', 'info');
    } else {
      handleLanguageChange('javascript');
    }
  };

  // 4. Run / Execute Code Handler
  const handleRunCode = async () => {
    if (isRunning) return;

    if (!code || !code.trim()) {
      showToast('Please enter some code before running.', 'warning');
      return;
    }

    // In Web Mode, the iframe will simply re-render
    if (isWebMode) {
      setOutput({
        stdout: 'Web Preview refreshed successfully.',
        stderr: '',
        status: 'success',
        executionTimeMs: 12,
        exitCode: 0,
        provider: 'Client Sandboxed Iframe'
      });
      showToast('Web Preview refreshed', 'success');
      return;
    }

    try {
      setIsRunning(true);
      setOutput({
        stdout: '',
        stderr: '',
        status: 'running',
        executionTimeMs: null,
        exitCode: null
      });

      const res = await executeCodeApi({
        language: selectedLanguage,
        code,
        stdin
      });

      if (res.success && res.data) {
        setOutput(res.data);
        if (res.data.status === 'success') {
          showToast(`Execution finished in ${res.data.executionTimeMs}ms`, 'success');
        } else if (res.data.status === 'compile_error') {
          showToast('Compilation error detected', 'error');
        } else {
          showToast(`Execution status: ${res.data.status}`, 'warning');
        }
      } else {
        setOutput({
          stdout: '',
          stderr: res.error || 'Execution returned an error',
          status: 'runtime_error',
          executionTimeMs: 0,
          exitCode: 1
        });
        showToast('Execution error', 'error');
      }

      // On mobile, auto-switch to output panel to see results
      if (window.innerWidth < 768) {
        setMobileView('output');
      }
    } catch (err) {
      console.error('Code execution failed:', err);
      const errMsg = err.response?.data?.error || err.message || 'Execution failed';
      setOutput({
        stdout: '',
        stderr: errMsg,
        status: 'runtime_error',
        executionTimeMs: 0,
        exitCode: 1
      });
      showToast(errMsg, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  // 5. Code Formatting (Shift+Alt+F)
  const handleFormatCode = () => {
    if (editorRef.current) {
      const action = editorRef.current.getAction('editor.action.formatDocument');
      if (action) {
        action.run();
        showToast('Document formatted', 'info');
      }
    }
  };

  // 6. Reset Code to Boilerplate
  const handleResetCode = () => {
    if (window.confirm('Reset code to the original starter template? Any unsaved edits will be lost.')) {
      if (isWebMode) {
        setCode(STARTER_TEMPLATES.html[0].code);
      } else {
        const langObj = languages.find((l) => l.id === selectedLanguage);
        setCode(STARTER_TEMPLATES[selectedLanguage]?.[0]?.code || langObj?.defaultCode || '');
      }
      setActiveSnippet(null);
      setSearchParams({});
      setOutput({ stdout: '', stderr: '', status: 'idle' });
      showToast('Reset to starter template', 'info');
    }
  };

  // 7. Fork Current Snippet
  const handleForkSnippet = async () => {
    if (!activeSnippet?._id) {
      showToast('No saved snippet is currently loaded to fork.', 'warning');
      return;
    }
    try {
      showToast('Forking snippet...', 'info');
      const res = await forkSnippetApi(activeSnippet._id);
      if (res.success && res.data) {
        loadSnippetIntoWorkspace(res.data);
        showToast(`Forked snippet as "${res.data.title}"`, 'success');
      }
    } catch (err) {
      console.error('Fork snippet failed:', err);
      showToast(err.response?.data?.error || 'Failed to fork snippet.', 'error');
    }
  };

  // 7. Download Source Code File
  const handleDownloadCode = () => {
    const extMap = {
      javascript: 'js',
      python: 'py',
      cpp: 'cpp',
      java: 'java',
      html: 'html'
    };
    const ext = extMap[selectedLanguage] || 'txt';
    const fileName = `${(activeSnippet?.title || 'skillnest_snippet').toLowerCase().replace(/\s+/g, '_')}.${ext}`;

    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Downloaded ${fileName}`, 'success');
  };

  // 8. Load Snippet into Workspace
  const loadSnippetIntoWorkspace = (snippet) => {
    setActiveSnippet(snippet);
    setSelectedLanguage(snippet.language);
    setCode(snippet.code);
    setStdin(snippet.stdin || '');
    if (snippet.language === 'html') {
      setIsWebMode(true);
    } else {
      setIsWebMode(false);
    }
    setOutput({
      stdout: snippet.output || '',
      stderr: '',
      status: snippet.output ? 'success' : 'idle',
      executionTimeMs: null,
      exitCode: null
    });
    setSearchParams({ snippet: snippet._id });
    showToast(`Loaded snippet: "${snippet.title}"`, 'success');
  };

  // 9. Load Template
  const handleSelectTemplate = (template, langId) => {
    if (langId === 'html') {
      setIsWebMode(true);
      setSelectedLanguage('html');
    } else {
      setIsWebMode(false);
      setSelectedLanguage(langId);
    }
    setCode(template.code);
    setActiveSnippet(null);
    showToast(`Loaded template: "${template.title}"`, 'info');
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0d1117] text-gray-100 overflow-hidden select-none">
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-medium border animate-fadeIn transition-all backdrop-blur-md bg-[#161b22]/90 border-gray-700">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-400" />}
          {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
          <span className="text-gray-200">{toast.message}</span>
        </div>
      )}

      {/* Top Application Header & Toolbar */}
      <EditorHeader
        languages={languages}
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        theme={theme}
        onThemeChange={setTheme}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        onFormatCode={handleFormatCode}
        onResetCode={handleResetCode}
        onRunCode={handleRunCode}
        isRunning={isRunning}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onForkSnippet={handleForkSnippet}
        onOpenVaultModal={() => setIsVaultModalOpen(true)}
        onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
        onDownloadCode={handleDownloadCode}
        isWebMode={isWebMode}
        onToggleWebMode={handleToggleWebMode}
        snippetTitle={activeSnippet?.title}
        activeSnippet={activeSnippet}
      />

      {/* Mobile Tab Switcher (Visible only on small viewports) */}
      <div className="flex md:hidden bg-[#161b22] border-b border-gray-800 text-xs">
        <button
          onClick={() => setMobileView('editor')}
          className={`flex-1 py-2 text-center font-medium border-b-2 transition ${
            mobileView === 'editor'
              ? 'border-emerald-500 text-emerald-400 bg-gray-900/40'
              : 'border-transparent text-gray-400'
          }`}
        >
          <Code2 className="w-3.5 h-3.5 inline mr-1" />
          Code Editor
        </button>
        <button
          onClick={() => setMobileView('output')}
          className={`flex-1 py-2 text-center font-medium border-b-2 transition ${
            mobileView === 'output'
              ? 'border-blue-500 text-blue-400 bg-gray-900/40'
              : 'border-transparent text-gray-400'
          }`}
        >
          {isWebMode ? <Globe className="w-3.5 h-3.5 inline mr-1" /> : <Terminal className="w-3.5 h-3.5 inline mr-1" />}
          {isWebMode ? 'Web Preview' : 'Output Console'}
        </button>
      </div>

      {/* Main Split Workspace Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Side: Monaco Code Editor */}
        <div
          className={`h-full flex-1 min-w-0 flex flex-col ${
            mobileView !== 'editor' ? 'hidden md:flex' : 'flex'
          }`}
        >
          <CodeEditor
            language={selectedLanguage}
            value={code}
            onChange={(val) => setCode(val || '')}
            theme={theme}
            fontSize={fontSize}
            onRunCode={handleRunCode}
            editorRef={editorRef}
          />
        </div>

        {/* Right Side: Output Console OR Sandboxed Web Preview */}
        <div
          className={`h-full flex-1 min-w-0 flex flex-col ${
            mobileView !== 'output' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {isWebMode ? (
            <WebPreview htmlCode={code} onRunPreview={handleRunCode} />
          ) : (
            <OutputPanel
              output={output}
              isRunning={isRunning}
              stdin={stdin}
              onStdinChange={setStdin}
              onClearConsole={() =>
                setOutput({ stdout: '', stderr: '', status: 'idle', executionTimeMs: null, exitCode: null })
              }
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <SaveSnippetModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        currentCode={code}
        currentLanguage={selectedLanguage}
        currentStdin={stdin}
        currentOutput={output}
        currentUser={currentUser}
        activeSnippet={activeSnippet}
        onSnippetSaved={(saved) => {
          setActiveSnippet(saved);
          setSearchParams({ snippet: saved._id });
          showToast(`Snippet "${saved.title}" saved successfully!`, 'success');
        }}
      />

      <ShareSnippetModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        activeSnippet={activeSnippet}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
      />

      <SnippetVaultModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        currentUser={currentUser}
        onLoadSnippet={loadSnippetIntoWorkspace}
      />

      <TemplateSelectorModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        currentLanguage={selectedLanguage}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
}
