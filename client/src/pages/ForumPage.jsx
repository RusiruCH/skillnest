import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { forumService } from '../services/forumService';
import ForumThreadCard from '../components/ForumThreadCard';
import ForumNewThreadModal from '../components/ForumNewThreadModal';
import {
  MessageSquare,
  Search,
  Filter,
  PlusCircle,
  Sparkles,
  HelpCircle,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'General',
  'Course Help',
  'Career',
  'Bug Report',
  'Announcement',
];

export default function ForumPage() {
  const { user, isAuthenticated } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('latest'); // latest, votes, unanswered
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await forumService.getPosts({
        search: searchTerm || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        sort: sortOption,
        page: currentPage,
        limit: 10,
      });

      if (res && res.success) {
        setPosts(res.posts || []);
        setTotalPages(res.totalPages || 1);
        setTotalPosts(res.total || 0);
      }
    } catch (err) {
      console.error('Forum load error:', err);
      setError('Unable to load discussions. Make sure the backend API is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, sortOption, currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPosts();
  };

  const handleCreatePost = async (postData) => {
    await forumService.createPost(postData);
    fetchPosts();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-4 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Member 06 • Community Q&A & Discussion Forum
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              SkillNest Community Forum
            </h1>
            <p className="mt-2 text-indigo-100 text-sm sm:text-base leading-relaxed">
              Ask technical questions, share insights, solve challenges together,
              and connect with fellow learners and instructors.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  alert('Please sign in or switch to a demo role to ask a question.');
                  return;
                }
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm bg-white text-indigo-900 hover:bg-indigo-50 transition shadow-lg active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              Ask a Question
            </button>

            <button
              onClick={fetchPosts}
              title="Refresh questions"
              className="p-3 rounded-2xl bg-indigo-800/60 hover:bg-indigo-800 border border-indigo-700/60 text-indigo-200 hover:text-white transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search form */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative w-full md:w-96 flex-1"
          >
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by keywords, tags, or question..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </form>

          {/* Filter tabs & Sort */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Category Select */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort options */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/70 text-xs">
              <button
                onClick={() => {
                  setSortOption('latest');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  sortOption === 'latest'
                    ? 'bg-white text-indigo-600 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Latest
              </button>
              <button
                onClick={() => {
                  setSortOption('votes');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  sortOption === 'votes'
                    ? 'bg-white text-indigo-600 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Most Voted
              </button>
              <button
                onClick={() => {
                  setSortOption('unanswered');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  sortOption === 'unanswered'
                    ? 'bg-white text-indigo-600 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Unanswered
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-sm text-slate-500 font-medium">
              Loading community discussions...
            </p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button
              onClick={fetchPosts}
              className="text-xs text-rose-600 underline font-semibold hover:text-rose-800"
            >
              Try again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              No questions found
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              {searchTerm || selectedCategory !== 'All'
                ? 'Try tweaking your search or category filters to find what you are looking for.'
                : 'Be the first to start a conversation in the community!'}
            </p>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  alert('Please sign in or switch to a demo role to ask a question.');
                  return;
                }
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition"
            >
              <PlusCircle className="w-4 h-4" />
              Ask a Question Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>
                Showing <strong>{posts.length}</strong> of <strong>{totalPosts}</strong> discussions
              </span>
            </div>

            <div className="space-y-3">
              {posts.map((post) => (
                <ForumThreadCard key={post._id} thread={post} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-slate-600 px-3">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Question Modal */}
      <ForumNewThreadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
}

