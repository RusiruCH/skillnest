import React, { useState } from 'react';
import {
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  Trash2,
  Edit2,
  Check,
  X,
  Clock,
  Shield,
} from 'lucide-react';

export default function ForumAnswerCard({
  answer,
  postAuthorId,
  currentUser,
  onAccept,
  onVote,
  onDelete,
  onUpdate,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBody, setEditedBody] = useState(answer.body);
  const [submitting, setSubmitting] = useState(false);

  const isPostAuthor =
    currentUser &&
    (currentUser.id === postAuthorId || currentUser._id === postAuthorId);

  const isAnswerAuthor =
    currentUser &&
    (currentUser.id === (answer.author?._id || answer.author?.id) ||
      currentUser._id === (answer.author?._id || answer.author?.id));

  const isAdmin = currentUser && currentUser.role === 'admin';

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

  const handleSaveEdit = async () => {
    if (!editedBody.trim() || editedBody.trim().length < 5) return;
    setSubmitting(true);
    try {
      await onUpdate(answer._id, { body: editedBody });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-200 ${
        answer.isAccepted
          ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-200'
          : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Left Voting & Accept Controls */}
        <div className="flex flex-col items-center gap-2 min-w-[48px]">
          <button
            onClick={() => onVote(answer._id, 'up')}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Upvote"
          >
            <ThumbsUp className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-slate-800">
            {answer.voteCount || 0}
          </span>
          <button
            onClick={() => onVote(answer._id, 'down')}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Downvote"
          >
            <ThumbsDown className="w-4 h-4" />
          </button>

          {/* Accept badge or accept button */}
          {answer.isAccepted ? (
            <div
              className="mt-2 flex flex-col items-center text-emerald-600"
              title="Accepted Solution"
            >
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">
                Solution
              </span>
            </div>
          ) : isPostAuthor ? (
            <button
              onClick={() => onAccept(answer._id)}
              className="mt-2 p-1.5 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              title="Mark as accepted solution"
            >
              <CheckCircle2 className="w-6 h-6" />
            </button>
          ) : null}
        </div>

        {/* Answer Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <img
                src={
                  answer.author?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                }
                alt={answer.author?.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-200"
              />
              <div>
                <span className="text-sm font-bold text-slate-800">
                  {answer.author?.name || 'Anonymous'}
                </span>
                {answer.author?.role && (
                  <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-100 text-indigo-600">
                    {answer.author.role}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeAgo(answer.createdAt)}</span>
            </div>
          </div>

          {/* Answer Body / Edit mode */}
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                rows={4}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={submitting || editedBody.trim().length < 5}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition"
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {answer.body}
            </div>
          )}

          {/* Actions (Edit / Delete) */}
          {!isEditing && (isAnswerAuthor || isAdmin) && (
            <div className="flex items-center gap-2 justify-end mt-4 pt-2 border-t border-slate-100 text-xs text-slate-500">
              {isAnswerAuthor && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1 hover:text-indigo-600 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
              )}
              <button
                onClick={() => onDelete(answer._id)}
                className="inline-flex items-center gap-1 hover:text-rose-600 transition ml-2"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

