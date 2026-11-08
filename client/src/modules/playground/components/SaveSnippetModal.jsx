import React, { useState, useEffect } from 'react';
import { X, Bookmark, Lock, Globe, Tag, Loader2, AlertCircle } from 'lucide-react';
import { createSnippetApi, updateSnippetApi } from '../services/playgroundService';

export default function SaveSnippetModal({
  isOpen,
  onClose,
  currentCode,
  currentLanguage,
  currentStdin,
  currentOutput,
  currentUser,
  activeSnippet,
  onSnippetSaved
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (activeSnippet) {
      setTitle(activeSnippet.title || '');
      setDescription(activeSnippet.description || '');
      setTags(activeSnippet.tags || []);
      setIsPublic(activeSnippet.isPublic !== undefined ? activeSnippet.isPublic : true);
    } else {
      setTitle('');
      setDescription('');
      setTags([]);
      setIsPublic(true);
    }
    setErrorMessage(null);
  }, [activeSnippet, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = tagInput.trim().replace(/^,+|,+$/g, '');
      if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
        setTags([...tags, trimmed]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Please provide a title for your snippet.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const payload = {
        title: title.trim(),
        description: description.trim(),
        code: currentCode,
        language: currentLanguage,
        stdin: currentStdin || '',
        output: currentOutput?.stdout || '',
        isPublic,
        tags
      };

      let result;
      if (activeSnippet && activeSnippet._id && activeSnippet.userId === currentUser?.id) {
        result = await updateSnippetApi(activeSnippet._id, payload);
      } else {
        result = await createSnippetApi(payload);
      }

      if (onSnippetSaved) {
        onSnippetSaved(result.data);
      }
      onClose();
    } catch (err) {
      console.error('Save snippet failed:', err);
      const msg = err.response?.data?.error || err.message || 'Failed to save snippet.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOwner = activeSnippet && currentUser && String(activeSnippet.userId) === String(currentUser.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#161b22] border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                {activeSnippet && isOwner ? 'Update Snippet' : 'Save Snippet to Vault'}
              </h3>
              <p className="text-xs text-gray-400">
                {currentUser ? `Saving as ${currentUser.name}` : 'Saving in Guest Mode (Public)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-gray-300 font-medium mb-1.5">
              Snippet Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Binary Search in Python"
              maxLength={100}
              required
              className="w-full bg-[#0d1117] text-white border border-gray-800 rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-300 font-medium mb-1.5">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add short notes or problem description..."
              rows={3}
              maxLength={500}
              className="w-full bg-[#0d1117] text-white border border-gray-800 rounded-lg px-3.5 py-2 focus:outline-none focus:border-emerald-500 transition resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-gray-300 font-medium mb-1.5">
              Tags (press Enter or comma)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-emerald-950/50 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded-md text-[11px] flex items-center gap-1"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-400 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="e.g. algorithm, dsa, sorting"
              className="w-full bg-[#0d1117] text-white border border-gray-800 rounded-lg px-3.5 py-2 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Visibility / Privacy Toggle */}
          <div className="pt-2 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-200 flex items-center gap-1.5">
                  {isPublic ? (
                    <>
                      <Globe className="w-4 h-4 text-emerald-400" />
                      Public Snippet
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-amber-400" />
                      Private Snippet
                    </>
                  )}
                </span>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {currentUser
                    ? isPublic
                      ? 'Visible to everyone in community search and shared links.'
                      : 'Only visible to you when logged in.'
                    : 'Guest users can only save public snippets.'}
                </p>
              </div>

              {currentUser && (
                <button
                  type="button"
                  onClick={() => setIsPublic(!isPublic)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    isPublic ? 'bg-emerald-600' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      isPublic ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-gray-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#0d1117] hover:bg-gray-800 text-gray-300 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{activeSnippet && isOwner ? 'Save Changes' : 'Save Snippet'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
