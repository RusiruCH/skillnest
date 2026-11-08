import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ForumAnswerForm({
  postId,
  onSubmit,
  isClosed,
  isAuthenticated,
}) {
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (isClosed) {
    return (
      <div className="bg-slate-100 border border-slate-200 rounded-2xl p-5 text-center text-sm text-slate-600">
        This discussion has been marked as <strong>closed</strong>. No further answers or replies can be posted.
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 text-center space-y-3">
        <h4 className="text-base font-bold text-slate-900">
          Want to join the discussion?
        </h4>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          You must be logged in to post an answer or reply to this question.
        </p>
        <div className="flex items-center justify-center gap-3 pt-1">
          <Link
            to="/login"
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm"
          >
            Sign In to Answer
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 border border-slate-200 bg-white rounded-xl transition"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!body.trim() || body.trim().length < 5) {
      setError('Your answer must be at least 5 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ body: body.trim() });
      setBody('');
      setSuccess('Your answer was posted successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to post answer. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-base font-bold text-slate-900 mb-2">
        Your Answer or Reply
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        Be clear, constructive, and helpful. Format code blocks or steps clearly.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          placeholder="Type your response here... (min. 5 characters)"
          className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder:text-slate-400"
          disabled={submitting}
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {body.length} characters
          </span>

          <button
            type="submit"
            disabled={submitting || body.trim().length < 5}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? 'Posting...' : 'Post Answer'}
          </button>
        </div>
      </form>
    </div>
  );
}

