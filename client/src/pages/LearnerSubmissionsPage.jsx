import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Clock,
  Award,
  Code2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import DifficultyBadge from '../components/DifficultyBadge';
import { submissionService } from '../services/submissionService';
import { useAuth } from '../context/AuthContext';

export default function LearnerSubmissionsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubmissionCode, setSelectedSubmissionCode] = useState(null);

  const fetchMySubmissions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await submissionService.getMySubmissions();
      setSubmissions(res.data || []);
    } catch (err) {
      setError('Could not load submission history: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMySubmissions();
  }, [user]);

  return (
    <div className="bg-[#0b0f17] text-slate-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
              <History className="w-3.5 h-3.5" />
              <span>Learner Portfolio • Module 04</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              My Hackathon Submissions & Results
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Track your challenge attempts, review instructor grades, and inspect algorithmic feedback.
            </p>
          </div>

          <button
            onClick={fetchMySubmissions}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#151c2c] border border-slate-800 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Submissions count summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#121927] border border-slate-800 rounded-2xl p-5 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Submissions
            </span>
            <span className="text-2xl font-black text-white block">
              {submissions.length}
            </span>
          </div>

          <div className="bg-[#121927] border border-slate-800 rounded-2xl p-5 space-y-1">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
              Accepted / Passed
            </span>
            <span className="text-2xl font-black text-emerald-400 block">
              {submissions.filter((s) => s.status === 'Accepted').length}
            </span>
          </div>

          <div className="bg-[#121927] border border-slate-800 rounded-2xl p-5 space-y-1">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
              Under Evaluation
            </span>
            <span className="text-2xl font-black text-amber-400 block">
              {submissions.filter((s) => s.status === 'Submitted' || s.status === 'Evaluating').length}
            </span>
          </div>

          <div className="bg-[#121927] border border-slate-800 rounded-2xl p-5 space-y-1">
            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">
              Needs Revision
            </span>
            <span className="text-2xl font-black text-purple-400 block">
              {submissions.filter((s) => s.status === 'Needs Revision').length}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">
              Loading your submissions...
            </div>
          ) : submissions.length === 0 ? (
            <div className="bg-[#121927] border border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <History className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No submissions recorded</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You haven't participated in any hackathon challenges yet. Browse active challenges and submit your code solutions!
              </p>
              <button
                onClick={() => navigate('/challenges')}
                className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl"
              >
                Browse Challenges
              </button>
            </div>
          ) : (
            submissions.map((sub) => {
              const challenge = sub.challengeId;
              return (
                <div
                  key={sub._id}
                  className="bg-[#121927] border border-slate-800 hover:border-purple-500/40 rounded-2xl p-6 transition-all space-y-4 shadow-xl"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-purple-400 uppercase">
                          DAY {challenge?.dayNumber || 1}
                        </span>
                        {challenge?.difficulty && (
                          <DifficultyBadge difficulty={challenge.difficulty} size="xs" />
                        )}
                      </div>
                      <h3
                        onClick={() => challenge?._id && navigate(`/challenges/${challenge._id}`)}
                        className="text-lg font-bold text-white hover:text-purple-300 cursor-pointer transition-colors"
                      >
                        {challenge?.title || 'Coding Challenge'}
                      </h3>
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Submitted on {new Date(sub.submissionDate).toLocaleString()}</span>
                        <span>•</span>
                        <span className="font-mono text-purple-300">Lang: {sub.language}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                          sub.status === 'Accepted'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : sub.status === 'Needs Revision'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : sub.status === 'Rejected'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {sub.status}
                      </span>

                      {sub.result?.score !== null && sub.result?.score !== undefined && (
                        <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                          Score: {sub.result.score}/100
                        </span>
                      )}

                      <button
                        onClick={() =>
                          setSelectedSubmissionCode(
                            selectedSubmissionCode === sub._id ? null : sub._id
                          )
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                      >
                        <Code2 className="w-3.5 h-3.5 text-purple-400" />
                        <span>{selectedSubmissionCode === sub._id ? 'Hide Code' : 'View Code'}</span>
                      </button>
                    </div>
                  </div>

                  {sub.result?.feedback && (
                    <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                        <Award className="w-4 h-4" />
                        <span>Instructor Feedback ({sub.result.gradedBy?.name || 'Faculty Instructor'}):</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed font-sans pl-5">
                        {sub.result.feedback}
                      </p>
                    </div>
                  )}

                  {selectedSubmissionCode === sub._id && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">
                        Submitted Source Code
                      </span>
                      <pre className="p-4 bg-[#090d16] border border-slate-800 rounded-xl text-xs font-mono text-slate-200 overflow-x-auto max-h-60 whitespace-pre leading-relaxed">
                        {sub.sourceCode}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
