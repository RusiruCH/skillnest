import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  SlidersHorizontal,
  Award,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import DifficultyBadge from '../components/DifficultyBadge';
import ChallengeModal from '../components/ChallengeModal';
import GradeSubmissionModal from '../components/GradeSubmissionModal';
import { challengeService } from '../services/challengeService';
import { submissionService } from '../services/submissionService';
import { useAuth } from '../context/AuthContext';

export default function InstructorChallengeDashboard() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [stats, setStats] = useState({
    totalChallenges: 0,
    activeChallenges: 0,
    totalSubmissions: 0,
    pendingEvaluations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [challengeModalOpen, setChallengeModalOpen] = useState(false);
  const [challengeToEdit, setChallengeToEdit] = useState(null);

  // Submissions drawer state
  const [selectedChallengeForSubmissions, setSelectedChallengeForSubmissions] = useState(null);
  const [submissionsList, setSubmissionsList] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Grade modal
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [submissionToGrade, setSubmissionToGrade] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const challRes = await challengeService.getInstructorChallenges();
      setChallenges(challRes.data || []);

      const statsRes = await challengeService.getChallengeStats();
      if (statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error(err);
      const isNetworkError = !err.response && (err.message === 'Network Error' || err.code === 'ERR_NETWORK');
      if (isNetworkError) {
        setError('Backend server is offline. Start the server (node server.js) and click Refresh to load your challenges.');
      } else {
        setError('Could not load instructor dashboard: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleOpenCreate = () => {
    setChallengeToEdit(null);
    setChallengeModalOpen(true);
  };

  const handleOpenEdit = (challenge) => {
    setChallengeToEdit(challenge);
    setChallengeModalOpen(true);
  };

  const handleDelete = async (id, title) => {
    if (confirm(`Are you sure you want to delete challenge "${title}"? This will also remove all associated learner submissions.`)) {
      try {
        await challengeService.deleteChallenge(id);
        fetchData();
        if (selectedChallengeForSubmissions?._id === id) {
          setSelectedChallengeForSubmissions(null);
        }
      } catch (err) {
        alert('Delete failed: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleViewSubmissions = async (challenge) => {
    setSelectedChallengeForSubmissions(challenge);
    setLoadingSubmissions(true);
    try {
      const res = await submissionService.getChallengeSubmissions(challenge._id);
      setSubmissionsList(res.data || []);
    } catch (err) {
      alert('Failed to load submissions: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleGradeSubmission = (sub) => {
    setSubmissionToGrade(sub);
    setGradeModalOpen(true);
  };

  return (
    <div className="bg-[#0b0f17] text-slate-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header & Stats Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <SlidersHorizontal className="w-7 h-7 text-purple-400" />
              Instructor Challenge Studio (Module 04)
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Create programming challenges, manage submission deadlines, and evaluate student code solutions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2.5 rounded-xl text-slate-400 hover:text-white bg-[#151c2c] border border-slate-800 hover:border-slate-700 transition-all"
              title="Refresh dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Challenge</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#121927] border border-slate-800 rounded-2xl p-5 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Challenges
            </span>
            <span className="text-2xl font-black text-white block">
              {stats.totalChallenges}
            </span>
            <span className="text-[10px] text-purple-400">Created in system</span>
          </div>

          <div className="bg-[#121927] border border-slate-800 rounded-2xl p-5 space-y-1">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
              Active Challenges
            </span>
            <span className="text-2xl font-black text-emerald-400 block">
              {stats.activeChallenges}
            </span>
            <span className="text-[10px] text-slate-400">Open for learner submissions</span>
          </div>

          <div className="bg-[#121927] border border-slate-800 rounded-2xl p-5 space-y-1">
            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">
              Total Submissions
            </span>
            <span className="text-2xl font-black text-white block">
              {stats.totalSubmissions}
            </span>
            <span className="text-[10px] text-slate-400">Received from students</span>
          </div>

          <div className="bg-[#121927] border border-slate-800 rounded-2xl p-5 space-y-1">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
              Pending Review
            </span>
            <span className="text-2xl font-black text-amber-400 block">
              {stats.pendingEvaluations}
            </span>
            <span className="text-[10px] text-amber-400/80">Awaiting grade & feedback</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Challenge Management Table */}
        <div className="bg-[#121927] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Challenge Records Management</span>
              <span className="text-xs bg-purple-500/15 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                {challenges.length}
              </span>
            </h2>
            <span className="text-xs text-slate-400">
              Rule: Only creating instructors and admins can edit or delete challenges
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">
              Loading challenges table...
            </div>
          ) : challenges.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <p className="text-sm font-semibold text-slate-300">No challenges created yet</p>
              <p className="text-xs">Click "Create New Challenge" to publish your first programming problem.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#172033] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-bold">
                  <tr>
                    <th className="py-3.5 px-6">Challenge</th>
                    <th className="py-3.5 px-4">Difficulty</th>
                    <th className="py-3.5 px-4">Deadline</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Submissions</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {challenges.map((c) => {
                    const isDeadlinePassed = c.deadline && new Date() > new Date(c.deadline);
                    return (
                      <tr
                        key={c._id}
                        className="hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="font-bold text-white text-sm">{c.title}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1 max-w-sm">
                            {c.description}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <DifficultyBadge difficulty={c.difficulty} size="xs" />
                        </td>

                        <td className="py-4 px-4 font-mono text-[11px]">
                          <div>{new Date(c.deadline).toLocaleDateString()}</div>
                          <div className={isDeadlinePassed ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                            {isDeadlinePassed ? 'Passed' : new Date(c.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              c.status === 'Active'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-700/40 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleViewSubmissions(c)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-all font-semibold"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{c.submissionsCount || 0} Submissions</span>
                          </button>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(c)}
                              title="Edit Challenge"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDelete(c._id, c.title)}
                              title="Delete Challenge"
                              className="p-1.5 rounded-lg text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Submissions Review Drawer */}
        {selectedChallengeForSubmissions && (
          <div className="bg-[#121927] border border-purple-500/30 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                  Student Submissions Review
                </div>
                <h3 className="text-xl font-bold text-white">
                  {selectedChallengeForSubmissions.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedChallengeForSubmissions(null)}
                className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Close Review
              </button>
            </div>

            {loadingSubmissions ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Loading challenge submissions...
              </div>
            ) : submissionsList.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                No learners have submitted solutions for this challenge yet.
              </div>
            ) : (
              <div className="space-y-4">
                {submissionsList.map((sub) => (
                  <div
                    key={sub._id}
                    className="bg-[#172033] border border-slate-700/80 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={sub.learnerId?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={sub.learnerId?.name || 'Learner'}
                        className="w-10 h-10 rounded-full border border-purple-500/40 object-cover"
                      />
                      <div>
                        <div className="font-bold text-white text-sm">
                          {sub.learnerId?.name || 'Learner'}
                        </div>
                        <div className="text-xs text-slate-400">
                          {sub.learnerId?.email} • Submitted: {new Date(sub.submissionDate).toLocaleString()}
                        </div>
                        <div className="text-[11px] font-mono text-purple-400 mt-0.5">
                          Language: {sub.language}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                          {sub.result.score}/100
                        </span>
                      )}

                      <button
                        onClick={() => handleGradeSubmission(sub)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-all shadow-md shadow-purple-600/30"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Grade & Feedback</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <ChallengeModal
          isOpen={challengeModalOpen}
          onClose={() => setChallengeModalOpen(false)}
          challengeToEdit={challengeToEdit}
          onSuccess={fetchData}
        />

        <GradeSubmissionModal
          isOpen={gradeModalOpen}
          onClose={() => setGradeModalOpen(false)}
          submission={submissionToGrade}
          onGraded={() => {
            fetchData();
            if (selectedChallengeForSubmissions) {
              handleViewSubmissions(selectedChallengeForSubmissions);
            }
          }}
        />
      </div>
    </div>
  );
}
