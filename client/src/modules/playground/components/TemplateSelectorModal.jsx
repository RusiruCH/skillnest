import React, { useState } from 'react';
import { X, Sparkles, Code2, ArrowRight } from 'lucide-react';
import { STARTER_TEMPLATES } from '../data/starterTemplates';

export default function TemplateSelectorModal({
  isOpen,
  onClose,
  currentLanguage,
  onSelectTemplate
}) {
  const [selectedLangTab, setSelectedLangTab] = useState(currentLanguage || 'javascript');

  if (!isOpen) return null;

  const languages = [
    { id: 'javascript', label: 'JavaScript' },
    { id: 'python', label: 'Python' },
    { id: 'cpp', label: 'C++' },
    { id: 'java', label: 'Java' },
    { id: 'html', label: 'HTML / Web' }
  ];

  const currentTemplates = STARTER_TEMPLATES[selectedLangTab] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#161b22] border border-gray-800 rounded-2xl w-full max-w-2xl h-[75vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Starter Code & Algorithms</h3>
              <p className="text-xs text-gray-400">Jumpstart your practice with curated technical templates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Tabs */}
        <div className="px-6 py-2.5 border-b border-gray-800 bg-[#0d1117] flex items-center gap-1.5 overflow-x-auto shrink-0 text-xs">
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setSelectedLangTab(lang.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                selectedLangTab === lang.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Templates List */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
          {currentTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-[#0d1117] border border-gray-800 hover:border-gray-700 rounded-xl p-4 transition space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white text-sm">{template.title}</h4>
                  <p className="text-gray-400 text-xs mt-0.5">{template.description}</p>
                </div>
                <button
                  onClick={() => {
                    onSelectTemplate(template, selectedLangTab);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black font-medium transition text-xs"
                >
                  <span>Load</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Code preview snippet */}
              <div className="bg-[#161b22] p-3 rounded-lg border border-gray-800/80 font-mono text-[11px] text-gray-300 max-h-32 overflow-hidden relative">
                <pre>{template.code.trim().split('\n').slice(0, 5).join('\n')} ...</pre>
                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#161b22] to-transparent pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
