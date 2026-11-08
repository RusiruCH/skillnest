import React, { useState, useEffect } from 'react';
import {
  X,
  FolderOpen,
  Search,
  Tag,
  Clock,
  User,
  ArrowRight,
  Trash2,
  Globe,
  Lock,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { fetchSnippetsApi, fetchSnippetByIdApi, deleteSnippetApi } from '../services/playgroundService';

export default function SnippetVaultModal({
  isOpen,
  onClose,
  currentUser,
  onLoadSnippet
}) {
  const [activeTab, setActiveTab] = useState('community'); // 'community' | 'mine'
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [errorMessage, setErrorMessage] = useState(null);

  const loadSnippets = async (page = 1) => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const params = {
        page,
        limit: 8,
        language: selectedLanguage !== 'all' ? selectedLanguage : undefined,
        search: searchTerm.trim() || undefined,
        mySnippets: activeTab === 'mine'
      };

      const res = await fetchSnippetsApi(params);
      setSnippets(res.data || []);
      setPagination(res.pagination || { page: 1, pages: 1, total: 0 });
    } catch (err) {
      console.error('Failed to load snippets:', err);
      const msg = err.response?.data?.error || err.message || 'Failed to fetch snippets.';
      setErrorMessage(msg);
      setSnippets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSnippets(1);
    }
  }, [isOpen, activeTab, selectedLanguage]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadSnippets(1);
  };

  const handleSelectSnippet = async (id) => {
    try {
      setLoading(true);
      const res = await fetchSnippetByIdApi(id);
      if (res.data) {
        onLoadSnippet(res.data);
        onClose();
      }
    } catch (err) {
      setErrorMessage('Could not load selected snippet.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this snippet?')) return;

    try {
      await deleteSnippetApi(id);
      setSnippets((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete snippet.');
    }
  };

  const languagesList = [
    { id: 'all', label: 'All Languages' },
    { id: 'javascript', label: 'JavaScript' },
    { id: 'python', label: 'Python' },
    { id: 'cpp', label: 'C++' },
    { id: 'java', label: 'Java' },
    { id: 'html', label: 'HTML/Web' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#161b22] border border-gray-800 rounded-2xl w-full max-w-3xl h-[85vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Snippet Vault</h3>
              <p className="text-xs text-gray-400">Browse, search, and load technical snippets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Filter Bar */}
        <div className="p-4 border-b border-gray-800 space-y-3 bg-[#0d1117] shrink-0 text-xs">
          {/* Main Tabs */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('community')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'community'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Community Vault</span>
            </button>

            <button
              onClick={() => {
                if (!currentUser) {
                  alert('Please sign in to view your personal snippets.');
                  return;
                }
                setActiveTab('mine');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === 'mine'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>My Saved Snippets</span>
              {!currentUser && (
                <span className="text-[10px] text-gray-500 ml-1">(Login required)</span>
              )}
            </button>
          </div>

          {/* Search bar & Language pills */}
          <div className="flex flex-col sm:flex-row gap-2">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search snippets by title, keywords or tags..."
                className="w-full bg-[#161b22] text-gray-200 border border-gray-800 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-blue-500"
              />
            </form>

            <div className="flex items-center overflow-x-auto gap-1 pb-1 sm:pb-0">
              {languagesList.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLanguage(lang.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition ${
                    selectedLanguage === lang.id
                      ? 'bg-gray-800 text-white font-medium border border-gray-700'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Snippets List Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-2.5 text-xs">
          {errorMessage && (
            <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              <span>Loading snippets...</span>
            </div>
          ) : snippets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <FolderOpen className="w-10 h-10 text-gray-600 mb-2 stroke-[1.5]" />
              <p className="text-gray-400 font-medium">No snippets found</p>
              <p className="text-[11px] text-gray-500 mt-1">
                {activeTab === 'mine'
                  ? 'You have not saved any snippets yet.'
                  : 'Try adjusting your search or language filter.'}
              </p>
            </div>
          ) : (
            snippets.map((snippet) => {
              const isOwner = currentUser && String(snippet.userId) === String(currentUser.id);
              return (
                <div
                  key={snippet._id}
                  onClick={() => handleSelectSnippet(snippet._id)}
                  className="bg-[#0d1117] hover:bg-[#111620] border border-gray-800 hover:border-gray-700 rounded-xl p-4 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white group-hover:text-blue-400 transition truncate">
                        {snippet.title}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-mono">
                        {snippet.language}
                      </span>
                      {!snippet.isPublic && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          Private
                        </span>
                      )}
                    </div>

                    {snippet.description && (
                      <p className="text-gray-400 text-[11px] line-clamp-1">{snippet.description}</p>
                    )}

                    <div className="flex items-center gap-3 text-[10px] text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {snippet.userName || 'Guest'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(snippet.createdAt).toLocaleDateString()}
                      </span>
                      {snippet.tags && snippet.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          <span>{snippet.tags.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    {isOwner && (
                      <button
                        onClick={(e) => handleDelete(e, snippet._id)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-gray-800 transition"
                        title="Delete snippet"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 group-hover:bg-blue-600 group-hover:text-white transition font-medium">
                      <span>Load</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <div className="px-6 py-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400 bg-[#0d1117] shrink-0">
            <span>
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => loadSnippets(pagination.page - 1)}
                className="px-3 py-1 rounded bg-[#161b22] border border-gray-800 disabled:opacity-50 hover:text-white transition"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => loadSnippets(pagination.page + 1)}
                className="px-3 py-1 rounded bg-[#161b22] border border-gray-800 disabled:opacity-50 hover:text-white transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
