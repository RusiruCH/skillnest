import React from 'react';
import Playground from '../components/Playground/Playground';
import { Terminal, Shield, Cpu, Code2 } from 'lucide-react';

/**
 * Module 3: Code Playground Page
 * Contributor: Member 3 (B.S.D.P. Wickramasingha - SEU/IS/22/ICT/013)
 */
export default function PlaygroundPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Module Title Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
            <Code2 className="w-3.5 h-3.5" />
            <span>Module 3: Code Playground</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Interactive Code Playground
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Write, test, and execute programs across multiple languages in an isolated, secure sandbox.
          </p>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-medium">
          <span className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <Cpu className="w-3.5 h-3.5 text-indigo-600" /> Multi-Language Sandbox
          </span>
          <span className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <Terminal className="w-3.5 h-3.5 text-emerald-600" /> Stdin & Console
          </span>
          <span className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <Shield className="w-3.5 h-3.5 text-amber-600" /> Resource Quotas
          </span>
        </div>
      </div>

      {/* Main Interactive Playground Component */}
      <Playground />
    </div>
  );
}

