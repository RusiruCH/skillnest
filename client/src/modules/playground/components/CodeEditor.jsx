import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Loader2 } from 'lucide-react';

export default function CodeEditor({
  language = 'javascript',
  value,
  onChange,
  theme = 'vs-dark',
  fontSize = 14,
  onRunCode,
  editorRef
}) {
  const internalRef = useRef(null);

  const handleEditorWillMount = (monaco) => {
    // Define Monokai custom theme
    monaco.editor.defineTheme('monokai', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '75715e' },
        { token: 'string', foreground: 'e6db74' },
        { token: 'keyword', foreground: 'f92672' },
        { token: 'number', foreground: 'ae81ff' },
        { token: 'type', foreground: '66d9ef' }
      ],
      colors: {
        'editor.background': '#272822',
        'editor.foreground': '#f8f8f2',
        'editorCursor.foreground': '#f8f8f0',
        'editor.lineHighlightBackground': '#3e3d32',
        'editorLineNumber.foreground': '#75715e',
        'editor.selectionBackground': '#49483e'
      }
    });
  };

  const handleEditorDidMount = (editor, monaco) => {
    internalRef.current = editor;
    if (editorRef) {
      editorRef.current = editor;
    }

    // Add Ctrl+Enter or Cmd+Enter keyboard shortcut to execute code
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRunCode) {
        onRunCode();
      }
    });

    // Add Shift+Alt+F format command listener
    editor.addCommand(
      monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
      () => {
        const action = editor.getAction('editor.action.formatDocument');
        if (action) action.run();
      }
    );
  };

  // Map application language ids to Monaco language ids
  const getMonacoLanguage = (lang) => {
    switch (lang) {
      case 'javascript':
      case 'js':
        return 'javascript';
      case 'python':
      case 'py':
        return 'python';
      case 'cpp':
      case 'c++':
        return 'cpp';
      case 'java':
        return 'java';
      case 'html':
      case 'web':
        return 'html';
      case 'css':
        return 'css';
      default:
        return 'plaintext';
    }
  };

  return (
    <div className="relative w-full h-full min-h-[350px] bg-[#0d1117]">
      <Editor
        height="100%"
        width="100%"
        language={getMonacoLanguage(language)}
        value={value}
        onChange={onChange}
        theme={theme}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        loading={
          <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            <span className="text-xs">Initializing Monaco Editor...</span>
          </div>
        }
        options={{
          fontSize,
          fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, 'Courier New', monospace",
          fontLigatures: true,
          minimap: { enabled: true, maxColumn: 80 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          renderWhitespace: 'selection',
          tabSize: 2,
          automaticLayout: true,
          wordWrap: 'on',
          bracketPairColorization: { enabled: true },
          lineNumbers: 'on',
          overviewRulerBorder: false,
          padding: { top: 12, bottom: 12 }
        }}
      />
    </div>
  );
}
