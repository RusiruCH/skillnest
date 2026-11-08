import React, { useState, useEffect } from 'react';
import ChallengeCard from '../components/ChallengeCard';
import { challengeService } from '../services/challengeService';
import { submissionService } from '../services/submissionService';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Trophy, Filter, RefreshCw, AlertCircle, Search, Database } from 'lucide-react';

export default function ChallengesPage() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [userSubmissions, setUserSubmissions] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'not_completed' | 'completed'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [seeding, setSeeding] = useState(false);

  const fetchChallengesAndSubmissions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await challengeService.getChallenges({
        search: searchTerm,
        difficulty: selectedDifficulty !== 'All' ? selectedDifficulty : undefined,
      });
      setChallenges(res.data || []);

      if (user?.role === 'learner') {
        try {
          const subRes = await submissionService.getMySubmissions();
          const subMap = {};
          (subRes.data || []).forEach((sub) => {
            const cid = sub.challengeId?._id || sub.challengeId;
            if (cid) {
              subMap[cid] = sub.status;
            }
          });
          setUserSubmissions(subMap);
        } catch (e) {
          console.warn('Could not load learner submissions map', e);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load challenges. Please make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallengesAndSubmissions();
  }, [searchTerm, selectedDifficulty, user?.role]);

  const handleSeed = async () => {
    if (confirm('Load demo hackathon challenges into the database?')) {
      setSeeding(true);
      try {
        await challengeService.seedDatabase();
        alert('Hackathon challenges loaded successfully!');
        fetchChallengesAndSubmissions();
      } catch (err) {
        alert('Seed request error: ' + (err.response?.data?.message || err.message));
      } finally {
        setSeeding(false);
      }
    }
  };

  const filteredChallenges = challenges.filter((c) => {
    const status = userSubmissions[c._id];
    if (filterTab === 'completed') {
      return status === 'Accepted' || status === 'Submitted';
    }
    if (filterTab === 'not_completed') {
      return !status || status === 'Rejected' || status === 'Needs Revision';
    }
    return true;
  });

  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'not_completed', label: 'Not completed' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <div className="bg-[#0b0f17] text-slate-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Banner matching BigDevSoon style */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-500/20 p-8 shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SkillNest Hackathon Arena • Module 04</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Sharpen your coding skills with technical challenges.
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Explore instructor-crafted algorithmic and frontend challenges. Submit your clean solutions, track evaluations in real time, and level up your software engineering credentials.
              </p>
            </div>

            <div className="flex md:flex-col gap-3">
              <div className="bg-[#121a2c]/80 backdrop-blur-md border border-slate-700/60 rounded-2xl p-4 text-center min-w-[120px]">
                <span className="text-2xl font-black text-white block">
                  {challenges.length}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Total Challenges
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Filter and Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search challenges, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#161d2d] border border-slate-700/60 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Tabs matching screenshot */}
            <div className="flex items-center bg-[#151c2c] p-1 rounded-xl border border-slate-800">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id)}
                  className={`px-3.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    filterTab === tab.id
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Seed button */}
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-purple-300 border border-purple-500/30 transition-all"
            >
              <Database className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
              <span>{seeding ? 'Seeding...' : 'Load Demo Challenges'}</span>
            </button>
          </div>
        </div>

        {/* Difficulty Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5" />
              Difficulty:
            </span>
            {difficulties.map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedDifficulty === diff
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-[#151c2c] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          <button
            onClick={fetchChallengesAndSubmissions}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-[#151c2c] border border-slate-800"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Challenge Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-[#151c2c] border border-slate-800 rounded-2xl p-4 h-96 animate-pulse flex flex-col justify-between"
              >
                <div className="w-full h-48 bg-slate-800 rounded-xl" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-800 rounded w-1/2" />
                </div>
                <div className="h-10 bg-slate-800 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="bg-[#151c2c] border border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No challenges found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search criteria or click "Load Demo Challenges" to load sample hackathons.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map((challenge) => (
              <ChallengeCard
                key={challenge._id}
                challenge={challenge}
                submissionStatus={userSubmissions[challenge._id]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
