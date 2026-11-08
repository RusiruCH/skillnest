import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { forumService } from '../services/forumService';
import ForumAnswerCard from '../components/ForumAnswerCard';
import ForumAnswerForm from '../components/ForumAnswerForm';
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Clock,
  Eye,
  Tag,
  Pin,
  Lock,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  BookOpen,
  Share2,
} from 'lucide-react';

const CATEGORY_COLORS = {
  'General': 'bg-slate-100 text-slate-700 border-slate-200',
  'Course Help': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Career': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Bug Report': 'bg-rose-50 text-rose-700 border-rose-200',
  'Announcement': 'bg-purple-50 text-purple-700 border-purple-200',
};

export default function ForumThreadPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [post, setPost] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [voteCount, setVoteCount] = useState(0);

  // Edit thread state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchThreadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [postRes, answersRes] = await Promise.all([
        forumService.getPostById(id),
        forumService.getAnswers(id),
      ]);

      if (postRes && postRes.success) {
        setPost(postRes.post);
        setVoteCount(postRes.post.voteCount || 0);
        setEditTitle(postRes.post.title);
        setEditBody(postRes.post.body);
        setEditCategory(postRes.post.category);
      }
      if (answersRes && answersRes.success) {
        setAnswers(answersRes.answers || []);
      }
    } catch (err) {
      console.error(err);
      setError('Could not load discussion. It may have been removed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreadData();
  }, [id]);

  const isPostAuthor =
    user &&
    post &&
    (user.id === (post.author?._id || post.author?.id) ||
      user._id === (post.author?._id || post.author?.id));

  const isAdmin = user && user.role === 'admin';

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 30) return `${diffDay}d ago`;
    return date.toLocaleDateString();
  };

  const handleVotePost = async (direction) => {
    if (!isAuthenticated) {
      alert('Please log in or switch to a demo role to vote.');
      return;
    }
    try {
      const res = await forumService.votePost(id, direction);
      if (res && res.success) {
        setVoteCount(res.voteCount);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVoteAnswer = async (answerId, direction) => {
    if (!isAuthenticated) {
      alert('Please log in to vote.');
      return;
    }
    try {
      const res = await forumService.voteAnswer(answerId, direction);
      if (res && res.success) {
        setAnswers((prev) =>
          prev.map((ans) =>
            ans._id === answerId ? { ...ans, voteCount: res.voteCount } : ans
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    try {
      const res = await forumService.acceptAnswer(answerId);
      if (res && res.success) {
        fetchThreadData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept answer.');
    }
  };

  const handleCreateAnswer = async (answerData) => {
    await forumService.createAnswer(id, answerData);
    fetchThreadData();
  };

  const handleUpdateAnswer = async (answerId, answerData) => {
    await forumService.updateAnswer(answerId, answerData);
    fetchThreadData();
  };

  const handleDeleteAnswer = async (answerId) => {
    if (confirm('Are you sure you want to delete this answer?')) {
      await forumService.deleteAnswer(answerId);
      fetchThreadData();
    }
  };

  const handleDeletePost = async () => {
    if (
      confirm(
        'Are you sure you want to delete this discussion and all its replies? This cannot be undone.'
      )
    ) {
      try {
        await forumService.deletePost(id);
        navigate('/forum');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete question.');
      }
    }
  };

  const handleTogglePin = async () => {
    try {
      const res = await forumService.pinPost(id);
      if (res && res.success) {
        setPost((prev) => ({ ...prev, isPinned: res.isPinned }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Pin action failed.');
    }
  };

  const handleToggleClose = async () => {
    try {
      const res = await forumService.closePost(id);
      if (res && res.success) {
        setPost((prev) => ({ ...prev, isClosed: res.isClosed }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Close action failed.');
    }
  };

  const handleSaveEditPost = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await forumService.updatePost(id, {
        title: editTitle,
        body: editBody,
        category: editCategory,
      });
      if (res && res.success) {
        setPost(res.post);
        setIsEditing(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading discussion...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Discussion Not Found</h2>
          <p className="text-sm text-slate-600">{error}</p>
          <Link
            to="/forum"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Forum
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/forum"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Discussions
          </Link>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={handleTogglePin}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  post.isPinned
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Pin className="w-3.5 h-3.5" />
                {post.isPinned ? 'Pinned' : 'Pin Thread'}
              </button>
            )}

            {(isPostAuthor || isAdmin) && (
              <button
                onClick={handleToggleClose}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  post.isClosed
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                {post.isClosed ? 'Reopen Thread' : 'Close Discussion'}
              </button>
            )}
          </div>
        </div>

        {/* Main Thread Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
          <div className="flex items-start gap-5">
            {/* Left Votes Column */}
            <div className="flex flex-col items-center gap-2 min-w-[48px]">
              <button
                onClick={() => handleVotePost('up')}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition"
                title="Upvote question"
              >
                <ThumbsUp className="w-5 h-5" />
              </button>
              <span className="text-base font-extrabold text-slate-900">
                {voteCount}
              </span>
              <button
                onClick={() => handleVotePost('down')}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-xl transition"
                title="Downvote question"
              >
                <ThumbsDown className="w-5 h-5" />
              </button>
            </div>

            {/* Thread Details Area */}
            <div className="flex-1 min-w-0">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {post.isPinned && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-600 text-white">
                    <Pin className="w-3 h-3" /> Pinned
                  </span>
                )}
                {post.isClosed && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-700 text-white">
                    <Lock className="w-3 h-3" /> Closed
                  </span>
                )}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    CATEGORY_COLORS[post.category] || CATEGORY_COLORS['General']
                  }`}
                >
                  {post.category}
                </span>

                {post.courseRef && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 border border-slate-200">
                    <BookOpen className="w-3 h-3 text-indigo-500" />
                    {typeof post.courseRef === 'object'
                      ? post.courseRef.title
                      : 'Linked Course'}
                  </span>
                )}
              </div>

              {/* Title / Edit form */}
              {isEditing ? (
                <form onSubmit={handleSaveEditPost} className="space-y-3 mb-4">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-base font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={6}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                    >
                      {updating ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight mb-4">
                    {post.title}
                  </h1>

                  <div className="text-sm sm:text-base text-slate-700 whitespace-pre-wrap leading-relaxed mb-6 font-normal">
                    {post.body}
                  </div>
                </>
              )}

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mb-6">
                  {post.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700"
                    >
                      <Tag className="w-3 h-3 text-slate-400" />
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Author & Footer Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-2.5">
                  <img
                    src={
                      post.author?.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                    }
                    alt={post.author?.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">
                      {post.author?.name || 'Anonymous'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Asked {timeAgo(post.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    <Eye className="w-3.5 h-3.5" />
                    {post.viewCount || 0} views
                  </span>

                  {(isPostAuthor || isAdmin) && !isEditing && (
                    <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                      {isPostAuthor && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="inline-flex items-center gap-1 hover:text-indigo-600 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                      )}
                      <button
                        onClick={handleDeletePost}
                        className="inline-flex items-center gap-1 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answers / Discussion List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
            </h2>
          </div>

          {answers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-700">
                No answers or replies yet.
              </p>
              <p className="text-xs text-slate-400">
                Know the solution? Be the first to help out below!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {answers.map((answer) => (
                <ForumAnswerCard
                  key={answer._id}
                  answer={answer}
                  postAuthorId={post.author?._id || post.author?.id}
                  currentUser={user}
                  onAccept={handleAcceptAnswer}
                  onVote={handleVoteAnswer}
                  onDelete={handleDeleteAnswer}
                  onUpdate={handleUpdateAnswer}
                />
              ))}
            </div>
          )}
        </div>

        {/* Reply Form */}
        <div className="pt-2">
          <ForumAnswerForm
            postId={id}
            onSubmit={handleCreateAnswer}
            isClosed={post.isClosed}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>
    </div>
  );
}

