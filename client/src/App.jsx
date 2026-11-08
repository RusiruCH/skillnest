import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { PlaygroundPage } from './modules/playground';
import { Code2, ArrowRight } from 'lucide-react';

function LandingPlaceholder() {
  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-6 text-center">
      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl mb-4">
        <Code2 className="w-10 h-10 text-emerald-400" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">SkillNest Platform</h1>
      <p className="text-gray-400 max-w-md text-sm mb-6">
        Open Course-ware and Technical Skill Development Platform (MERN)
      </p>
      <Link
        to="/playground"
        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition shadow-lg shadow-emerald-900/30"
      >
        <span>Open Code Playground</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPlaceholder />} />
      <Route path="/playground" element={<PlaygroundPage />} />
      <Route path="*" element={<Navigate to="/playground" replace />} />
    </Routes>
  );
}
