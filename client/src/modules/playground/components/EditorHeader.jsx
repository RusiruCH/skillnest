import React from 'react';
import {
  Play,
  RotateCcw,
  AlignLeft,
  Sun,
  Moon,
  Bookmark,
  Share2,
  GitFork,
  Download,
  FolderOpen,
  Sparkles,
  Laptop,
  Globe,
  Loader2,
  Type
} from 'lucide-react';

export default function EditorHeader({
  languages = [],
  selectedLanguage,
  onLanguageChange,
  theme,
  onThemeChange,
  fontSize,
  onFontSizeChange,
  onFormatCode,
  onResetCode,
  onRunCode,
  isRunning,
  onOpenSaveModal,
  onOpenShareModal,
  onForkSnippet,
  onOpenVaultModal,
  onOpenTemplateModal,
  onDownloadCode,
  isWebMode,
  onToggleWebMode,
  snippetTitle,
  activeSnippet
}) {
  return (
    <div className="bg-[#161b22] border-b border-gray-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 select-none">
      {/* Left section: Language & Mode Selectors */}
      <div className="flex items-center flex-wrap gap-2.5">
        {/* Workspace Mode Pill */}
        <div className="bg-[#0d1117] p-1 rounded-lg border border-gray-800 flex items-center">
          <button
            onClick={() => onToggleWebMode(false)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
              !isWebMode
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            title="Multi-language code runner (Python, JS, C++, Java)"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Code Runner</span>
          </button>
          <button
            onClick={() => onToggleWebMode(true)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
              isWebMode
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            title="Live sandboxed HTML/CSS/JS preview"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Live Web Preview</span>
          </button>
        </div>

        {/* Language dropdown (active in Code Runner mode) */}
        {!isWebMode ? (
          <div className="flex items-center">
            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-[#0d1117] text-gray-200 text-xs font-medium border border-gray-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {languages
                .filter((lang) => !lang.isWebPreview)
                .map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name} ({lang.version})
                  </option>
                ))}
            </select>
          </div>
        ) : (
          <span className="text-xs text-blue-400 font-medium px-2.5 py-1 rounded bg-blue-950/40 border border-blue-800/40 font-mono">
            HTML5 / CSS3 / ES6
          </span>
        )}

        {/* Snippet Title indicator (if editing saved snippet) */}
        {snippetTitle && (
          <div className="hidden md:flex items-center text-xs text-gray-400 border-l border-gray-800 pl-3">
            <span className="text-gray-500 mr-1.5">Editing:</span>
            <span className="text-white font-medium truncate max-w-[150px]">{snippetTitle}</span>
          </div>
        )}
      </div>

      {/* Center / Right section: Controls & Run button */}
      <div className="flex items-center flex-wrap gap-2">
        {/* Templates Picker */}
        <button
          onClick={onOpenTemplateModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0d1117] hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white text-xs transition"
          title="Browse starter templates & algorithms"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Templates</span>
        </button>

        {/* Snippet Vault */}
        <button
          onClick={onOpenVaultModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0d1117] hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white text-xs transition"
          title="Browse community & personal snippets"
        >
          <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Snippets</span>
        </button>

        {/* Editor Settings (Theme, Font, Format) */}
        <div className="hidden lg:flex items-center gap-1 bg-[#0d1117] p-1 rounded-lg border border-gray-800">
          {/* Format */}
          <button
            onClick={onFormatCode}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition"
            title="Auto-format code (Shift+Alt+F)"
          >
            <AlignLeft className="w-4 h-4" />
          </button>

          {/* Theme Switcher */}
          <select
            value={theme}
            onChange={(e) => onThemeChange(e.target.value)}
            className="bg-transparent text-gray-300 text-xs px-2 py-0.5 focus:outline-none cursor-pointer"
            title="Editor color theme"
          >
            <option value="vs-dark">VS Dark</option>
            <option value="light">Light</option>
            <option value="monokai">Monokai</option>
          </select>

          {/* Font Resizer */}
          <div className="flex items-center border-l border-gray-800 pl-1 ml-1 text-xs text-gray-400">
            <button
              onClick={() => onFontSizeChange(Math.max(11, fontSize - 1))}
              className="px-1.5 py-0.5 hover:text-white"
              title="Decrease font size"
            >
              -
            </button>
            <span className="text-[11px] font-mono text-gray-300 px-1">{fontSize}px</span>
            <button
              onClick={() => onFontSizeChange(Math.min(22, fontSize + 1))}
              className="px-1.5 py-0.5 hover:text-white"
              title="Increase font size"
            >
              +
            </button>
          </div>
        </div>

        {/* Actions: Save, Share, Download */}
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenSaveModal}
            className="p-1.5 rounded-lg bg-[#0d1117] hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-emerald-400 transition"
            title="Save snippet to vault"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenShareModal}
            className="p-1.5 rounded-lg bg-[#0d1117] hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-blue-400 transition"
            title="Share snippet link"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {activeSnippet && (
            <button
              onClick={onForkSnippet}
              className="p-1.5 rounded-lg bg-[#0d1117] hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-purple-400 transition"
              title="Fork this snippet (create your own copy)"
            >
              <GitFork className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onDownloadCode}
            className="p-1.5 rounded-lg bg-[#0d1117] hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white transition"
            title="Download source file"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={onResetCode}
            className="p-1.5 rounded-lg bg-[#0d1117] hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-red-400 transition"
            title="Reset to starter boilerplate"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Main Run Button */}
        <button
          onClick={onRunCode}
          disabled={isRunning}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-medium text-xs text-white transition shadow-lg ${
            isRunning
              ? 'bg-emerald-700/50 cursor-not-allowed opacity-80'
              : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40 active:scale-95'
          }`}
          title="Run code (Ctrl+Enter or Cmd+Enter)"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Executing...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isWebMode ? 'Refresh Preview' : 'Run'}</span>
              <kbd className="hidden sm:inline bg-emerald-800/60 text-[10px] px-1 py-0.5 rounded font-mono text-emerald-200">
                Ctrl+↵
              </kbd>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
