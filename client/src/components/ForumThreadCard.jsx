import React from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  ThumbsUp,
  Eye,
  CheckCircle2,
  Pin,
  Lock,
  Clock,
  Tag,
  BookOpen,
} from 'lucide-react';

const CATEGORY_COLORS = {
  'General': 'bg-slate-100 text-slate-700 border-slate-200',
  'Course Help': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Career': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Bug Report': 'bg-rose-50 text-rose-700 border-rose-200',
  'Announcement': 'bg-purple-50 text-purple-700 border-purple-200',
};

export default function ForumThreadCard({ thread, onVote }) {
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

  const categoryBadgeClass =
    CATEGORY_COLORS[thread.category] || CATEGORY_COLORS['General'];

  return (
    <div
      className={`bg-white rounded-2xl border p-5 transition-all duration-200 hover:shadow-md ${
        thread.isPinned
          ? 'border-indigo-300 ring-1 ring-indigo-200 bg-indigo-50/20'
          : 'border-slate-200/80 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Left Stats column: Votes & Answers */}
        <div className="flex flex-col items-center gap-2 min-w-[64px] text-center pt-0.5">
          <div className="w-full py-1 px-2 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col items-center">
            <span className="text-sm font-bold text-slate-800">
              {thread.voteCount || 0}
            </span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
              votes
            </span>
          </div>

          <div
            className={`w-full py-1 px-2 rounded-xl border flex flex-col items-center ${
              thread.acceptedAnswer
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold'
                : thread.answerCount > 0
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                : 'bg-slate-50 border-slate-200/70 text-slate-400'
            }`}
          >
            <span className="text-sm">
              {thread.acceptedAnswer && (
                <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-emerald-600 -mt-0.5" />
              )}
              {thread.answerCount || 0}
            </span>
            <span className="text-[10px] uppercase tracking-wider">answers</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Header Badges & Pin/Lock */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {thread.isPinned && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-600 text-white shadow-sm">
                <Pin className="w-3 h-3" /> Pinned
              </span>
            )}
            {thread.isClosed && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-700 text-white">
                <Lock className="w-3 h-3" /> Closed
              </span>
            )}
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${categoryBadgeClass}`}
            >
              {thread.category}
            </span>
            {thread.courseRef && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 border border-slate-200">
                <BookOpen className="w-3 h-3 text-indigo-500" />
                {typeof thread.courseRef === 'object'
                  ? thread.courseRef.title
                  : 'Linked Course'}
              </span>
            )}
          </div>

          {/* Title */}
          <Link
            to={`/forum/${thread._id}`}
            className="text-base sm:text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2 block leading-snug"
          >
            {thread.title}
          </Link>

          {/* Body snippet */}
          <p className="text-sm text-slate-600 mt-1 line-clamp-2 leading-relaxed">
            {thread.body}
          </p>

          {/* Tags */}
          {thread.tags && thread.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              {thread.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <Tag className="w-2.5 h-2.5 text-slate-400" />
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Footer Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            {/* Author info */}
            <div className="flex items-center gap-2">
              <img
                src={
                  thread.author?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                }
                alt={thread.author?.name || 'User'}
                className="w-5 h-5 rounded-full object-cover border border-slate-200"
              />
              <span className="font-semibold text-slate-700">
                {thread.author?.name || 'Anonymous'}
              </span>
              {thread.author?.role && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-indigo-600">
                  {thread.author.role}
                </span>
              )}
            </div>

            {/* Time & Views */}
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1 text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                {timeAgo(thread.createdAt)}
              </span>
              <span className="inline-flex items-center gap-1 text-slate-400">
                <Eye className="w-3.5 h-3.5" />
                {thread.viewCount || 0} views
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

