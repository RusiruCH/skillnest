import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DifficultyBadge from '../components/DifficultyBadge';
import CountdownTimer from '../components/CountdownTimer';
import CodeEditor from '../components/CodeEditor';
import { challengeService } from '../services/challengeService';
import { submissionService } from '../services/submissionService';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Calendar,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  History,
  FileCode,
  Link as LinkIcon,
  Award,
} from 'lucide-react';

export default function ChallengeDetailPage() {
  const { id: challengeId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Submission Form State
  const [language, setLanguage] = useState('javascript');
  const [sourceCode, setSourceCode] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Past Submissions for this challenge
  const [challengeSubmissions, setChallengeSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState('problem'); // 'problem' | 'submissions'

  const fetchChallengeDetails = async () => {
    setLoading(true);

    // --- Block 1: Load the challenge (fatal — show error if this fails) ---
    let challengeData = null;
    try {
      const res = await challengeService.getChallengeById(challengeId);
      challengeData = res.data;
      setChallenge(res.data);

      const starter =
        res.data.starterCode?.[language] ||
        `// Solution for ${res.data.title}\nfunction solve() {\n  // Write your logic here\n}\n`;
      setSourceCode(starter);
    } catch (err) {
      setError('Could not load challenge details: ' + (err.response?.data?.message || err.message));
      setLoading(false);
      return;
    }

    // --- Block 2: Load past submissions (non-fatal — silently skipped if auth fails) ---
    if (isAuthenticated && user?.role === 'learner') {
      try {
        const subRes = await submissionService.getMySubmissions();
        const mySubsForThis = (subRes.data || []).filter(
          (s) => (s.challengeId?._id || s.challengeId) === challengeId
        );
        setChallengeSubmissions(mySubsForThis);
      } catch {
        // Demo tokens or expired sessions will 401 here — not fatal, just skip
        setChallengeSubmissions([]);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    if (challengeId) {
      fetchChallengeDetails();
    }
  }, [challengeId]);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (challenge?.starterCode?.[newLang]) {
      setSourceCode(challenge.starterCode[newLang]);
    }
  };

  const isExpired = challenge?.deadline && new Date() > new Date(challenge.deadline);

  const handleSubmitSolution = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (isExpired) {
      setSubmitError('Submissions are closed! The deadline for this challenge has passed.');
      return;
    }

    if (!sourceCode.trim()) {
      setSubmitError('Please write or paste your solution code before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      await submissionService.submitSolution(challengeId, {
        sourceCode,
        language,
        repoUrl,
      });

      setSubmitSuccess('Solution submitted successfully! It is now queued for evaluation.');
      fetchChallengeDetails();
      setActiveTab('submissions');
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || 'Failed to submit solution');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0b0f17] text-slate-100 min-h-screen p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-mono">Loading challenge specifications...</span>
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="bg-[#0b0f17] text-slate-100 min-h-screen p-8 max-w-3xl mx-auto space-y-4">
        <button
          onClick={() => navigate('/challenges')}
          className="flex items-center gap-2 text-xs font-semibold text-purple-400 hover:text-purple-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Challenges
        </button>
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error || 'Challenge not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0b0f17] text-slate-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back button & meta row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => navigate('/challenges')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#151c2c] border border-slate-800 hover:border-slate-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Catalog
          </button>

          <div className="flex items-center gap-3">
            <DifficultyBadge difficulty={challenge.difficulty} />
            <CountdownTimer deadline={challenge.deadline} />
          </div>
        </div>

        {/* Challenge Title Banner */}
        <div className="bg-[#121927] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                <span>DAY {challenge.dayNumber || 1} HACKATHON</span>
                <span>•</span>
                <span className="text-slate-400">{challenge.status}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                {challenge.title}
              </h1>
            </div>

            <div className="flex items-center gap-3 bg-[#172033] border border-slate-700/60 rounded-2xl p-3">
              <img
                src={challenge.instructorId?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={challenge.instructorId?.name || 'Instructor'}
                className="w-10 h-10 rounded-full border border-purple-500/30 object-cover"
              />
              <div className="text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Created By</span>
                <span className="font-bold text-white block">{challenge.instructorId?.name || 'Instructor'}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {challenge.tags && challenge.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {challenge.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-medium text-slate-300 bg-slate-800/80 border border-slate-700/60 px-2.5 py-1 rounded-lg"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Deadline Alert Banner if Expired */}
        {isExpired && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <div>
              <strong className="font-bold">Deadline Expired: </strong>
              The submission window for this challenge closed on {new Date(challenge.deadline).toLocaleString()}. New solution submissions are blocked according to business rules.
            </div>
          </div>
        )}

        {/* Navigation Tabs for Problem vs History */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('problem')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'problem'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-800/40'
            }`}
          >
            <FileCode className="w-4 h-4" />
            Problem & Submission
          </button>

          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'submissions'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-800/40'
            }`}
          >
            <History className="w-4 h-4" />
            My Submissions ({challengeSubmissions.length})
          </button>
        </div>

        {/* TAB 1: Problem Specifications & Submission Workspace */}
        {activeTab === 'problem' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#121927] border border-slate-800 rounded-2xl p-6 space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-purple-400">
                  Problem Statement
                </h3>
                <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {challenge.description}
                </div>
              </div>

              <div className="bg-[#121927] border border-slate-800 rounded-2xl p-6 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
                    Input Format
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {challenge.inputRequirements}
                  </p>
                </div>

                <div className="border-t border-slate-800/80 pt-3">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
                    Output Format
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {challenge.outputRequirements}
                  </p>
                </div>
              </div>

              <div className="bg-[#121927] border border-slate-800 rounded-2xl p-6 space-y-3">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Constraints
                </h3>
                <pre className="p-3 bg-[#0a0f19] border border-slate-800 rounded-xl text-xs font-mono text-slate-300 whitespace-pre-line leading-relaxed">
                  {challenge.constraints}
                </pre>
              </div>

              {challenge.sampleTestCase && (
                <div className="bg-[#121927] border border-slate-800 rounded-2xl p-6 space-y-3">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Sample Test Case
                  </h3>
                  <div className="space-y-2 text-xs font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Input:</span>
                      <pre className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-200 overflow-x-auto">
                        {challenge.sampleTestCase.input}
                      </pre>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Output:</span>
                      <pre className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-200 overflow-x-auto">
                        {challenge.sampleTestCase.output}
                      </pre>
                    </div>
                    {challenge.sampleTestCase.explanation && (
                      <p className="text-[11px] font-sans text-slate-400 italic pt-1">
                        {challenge.sampleTestCase.explanation}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-7 space-y-6">
              <form onSubmit={handleSubmitSolution} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-purple-400" />
                    Your Programming Solution
                  </h3>
                  <span className="text-xs text-slate-400">
                    Select language & write clean code
                  </span>
                </div>

                <CodeEditor
                  value={sourceCode}
                  onChange={setSourceCode}
                  language={language}
                  onLanguageChange={handleLanguageChange}
                  starterCode={challenge.starterCode?.[language]}
                  readOnly={isExpired}
                />

                <div className="bg-[#121927] border border-slate-800 rounded-2xl p-4 space-y-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-purple-400" />
                    Project Repository / Deployment URL (Optional)
                  </label>
                  <input
                    type="url"
                    disabled={isExpired}
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/project or https://deployed-app.vercel.app"
                    className="w-full bg-[#172033] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {submitSuccess && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                    <span>{submitSuccess}</span>
                  </div>
                )}

                {submitError && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] text-slate-400">
                    {!isAuthenticated ? (
                      <span className="text-blue-400 font-semibold">
                        Please log in with your account to submit solutions.
                      </span>
                    ) : user?.role !== 'learner' ? (
                      <span className="text-amber-400 font-semibold">
                        * Logged in as {user?.role}. Switch to 'Learner' to submit solutions.
                      </span>
                    ) : isExpired ? (
                      <span className="text-rose-400 font-semibold">
                        Submissions closed. Deadline passed.
                      </span>
                    ) : (
                      <span>Submissions are evaluated by instructors.</span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || isExpired || user?.role !== 'learner' || !isAuthenticated}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-600/30 active:scale-95"
                  >
                    <Send className={`w-4 h-4 ${submitting ? 'animate-pulse' : ''}`} />
                    <span>{submitting ? 'Submitting Solution...' : 'Submit Solution'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: Submissions History for this Challenge */}
        {activeTab === 'submissions' && (
          <div className="bg-[#121927] border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
            <h3 className="text-lg font-bold text-white">
              Submission History for {challenge.title}
            </h3>

            {challengeSubmissions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <History className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-xs">You have not submitted a solution for this challenge yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {challengeSubmissions.map((sub, idx) => (
                  <div
                    key={sub._id || idx}
                    className="bg-[#172033] border border-slate-700/70 rounded-2xl p-5 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white uppercase">
                          Attempt #{challengeSubmissions.length - idx}
                        </span>
                        <span className="text-xs font-mono text-purple-400">
                          ({sub.language})
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(sub.submissionDate).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
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
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Score: {sub.result.score}/100
                          </span>
                        )}
                      </div>
                    </div>

                    {sub.result?.feedback && (
                      <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs">
                        <div className="flex items-center gap-1.5 text-purple-300 font-semibold mb-1">
                          <Award className="w-3.5 h-3.5" />
                          <span>Instructor Evaluation & Feedback:</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                          {sub.result.feedback}
                        </p>
                      </div>
                    )}

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Submitted Code
                      </span>
                      <pre className="p-3 bg-[#0c121e] border border-slate-800 rounded-xl text-xs font-mono text-slate-300 max-h-40 overflow-y-auto whitespace-pre">
                        {sub.sourceCode}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
