import React, { useState, useEffect } from 'react';
import { X, Award, MessageSquare, Code, Copy, Check } from 'lucide-react';
import { submissionService } from '../services/submissionService';

export default function GradeSubmissionModal({
  isOpen,
  onClose,
  submission,
  onGraded,
}) {
  const [status, setStatus] = useState('Accepted');
  const [score, setScore] = useState(90);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (submission) {
      setStatus(submission.status || 'Accepted');
      setScore(
        submission.result?.score !== null && submission.result?.score !== undefined
          ? submission.result.score
          : 85
      );
      setFeedback(
        submission.result?.feedback || 'Great solution! Clean logic and good coding style.'
      );
    }
  }, [submission, isOpen]);

  if (!isOpen || !submission) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(submission.sourceCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submissionService.gradeSubmission(submission._id, {
        status,
        score: Number(score),
        feedback,
      });
      if (onGraded) onGraded();
      onClose();
    } catch (err) {
      alert('Failed to update submission feedback: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#121927] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#172033]">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              Evaluate Learner Submission
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Learner: <strong className="text-slate-200">{submission.learnerId?.name || 'Learner'}</strong> ({submission.learnerId?.email})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-purple-400" />
                Submitted Code ({submission.language || 'javascript'})
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-[11px] text-purple-300 hover:text-purple-200"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="p-3 bg-[#0a0f19] border border-slate-800 rounded-xl text-xs font-mono text-slate-200 overflow-x-auto max-h-48 leading-relaxed whitespace-pre">
              {submission.sourceCode}
            </pre>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Evaluation Decision *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#172033] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
              >
                <option value="Accepted">Accepted (Passed)</option>
                <option value="Needs Revision">Needs Revision</option>
                <option value="Rejected">Rejected</option>
                <option value="Evaluating">Evaluating (In Progress)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Score (0 - 100) *
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full bg-[#172033] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
              Instructor Feedback / Review Comments *
            </label>
            <textarea
              rows={4}
              required
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide constructive feedback on code structure, time complexity, design patterns, or improvement suggestions..."
              className="w-full bg-[#172033] border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans leading-relaxed"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/30"
            >
              {loading ? 'Submitting Evaluation...' : 'Save Evaluation & Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
