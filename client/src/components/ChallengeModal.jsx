import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle, Save, Sparkles } from 'lucide-react';
import { challengeService } from '../services/challengeService';

export default function ChallengeModal({
  isOpen,
  onClose,
  challengeToEdit = null,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'Medium',
    deadline: '',
    description: '',
    inputRequirements: '',
    outputRequirements: '',
    constraints: '',
    sampleInput: '',
    sampleOutput: '',
    sampleExplanation: '',
    tags: 'Algorithms, Frontend',
    coverImage: '',
    dayNumber: 1,
    status: 'Active',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (challengeToEdit) {
      let formattedDeadline = '';
      if (challengeToEdit.deadline) {
        const d = new Date(challengeToEdit.deadline);
        formattedDeadline = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
      }

      setFormData({
        title: challengeToEdit.title || '',
        difficulty: challengeToEdit.difficulty || 'Medium',
        deadline: formattedDeadline,
        description: challengeToEdit.description || '',
        inputRequirements: challengeToEdit.inputRequirements || '',
        outputRequirements: challengeToEdit.outputRequirements || '',
        constraints: challengeToEdit.constraints || '',
        sampleInput: challengeToEdit.sampleTestCase?.input || '',
        sampleOutput: challengeToEdit.sampleTestCase?.output || '',
        sampleExplanation: challengeToEdit.sampleTestCase?.explanation || '',
        tags: Array.isArray(challengeToEdit.tags) ? challengeToEdit.tags.join(', ') : '',
        coverImage: challengeToEdit.coverImage || '',
        dayNumber: challengeToEdit.dayNumber || 1,
        status: challengeToEdit.status || 'Active',
      });
    } else {
      const defaultDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const formattedDefault = new Date(defaultDate.getTime() - defaultDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

      setFormData({
        title: '',
        difficulty: 'Medium',
        deadline: formattedDefault,
        description: '',
        inputRequirements: 'Function receives parameters (e.g. array, string, target).',
        outputRequirements: 'Return the evaluated result as specified.',
        constraints: '• 1 <= N <= 10^5\n• Memory limit: 256MB\n• Time limit: 2.0s',
        sampleInput: 'nums = [2, 7, 11, 15], target = 9',
        sampleOutput: '[0, 1]',
        sampleExplanation: 'Indices of the two numbers such that they add up to target.',
        tags: 'Algorithms, Web Development',
        coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=80',
        dayNumber: 1,
        status: 'Active',
      });
    }
    setError('');
  }, [challengeToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Please provide a challenge title.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please provide a detailed problem description.');
      return;
    }
    if (!formData.constraints.trim()) {
      setError('Please provide constraints.');
      return;
    }
    if (!formData.deadline) {
      setError('Please set a submission deadline.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        difficulty: formData.difficulty,
        deadline: new Date(formData.deadline).toISOString(),
        description: formData.description,
        inputRequirements: formData.inputRequirements,
        outputRequirements: formData.outputRequirements,
        constraints: formData.constraints,
        sampleTestCase: {
          input: formData.sampleInput,
          output: formData.sampleOutput,
          explanation: formData.sampleExplanation,
        },
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        coverImage: formData.coverImage,
        dayNumber: Number(formData.dayNumber) || 1,
        status: formData.status,
      };

      if (challengeToEdit) {
        await challengeService.updateChallenge(challengeToEdit._id, payload);
      } else {
        await challengeService.createChallenge(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#121927] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#162032]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white">
              {challengeToEdit ? 'Edit Programming Challenge' : 'Create New Hackathon Challenge'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Challenge Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Profile Card Component, LRU Cache..."
                className="w-full bg-[#172033] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Difficulty Level *
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full bg-[#172033] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                Submission Deadline *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full bg-[#172033] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Challenge Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#172033] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="Active">Active (Submissions Open)</option>
                <option value="Draft">Draft</option>
                <option value="Closed">Closed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Day Number (e.g. DAY 1)
              </label>
              <input
                type="number"
                min="1"
                value={formData.dayNumber}
                onChange={(e) => setFormData({ ...formData, dayNumber: e.target.value })}
                className="w-full bg-[#172033] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Detailed Problem Description *
            </label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the challenge scenario, objectives, edge cases, and expected solution..."
              className="w-full bg-[#172033] border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Input Requirements
              </label>
              <textarea
                rows={2}
                value={formData.inputRequirements}
                onChange={(e) => setFormData({ ...formData, inputRequirements: e.target.value })}
                placeholder="Format of input parameters..."
                className="w-full bg-[#172033] border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Output Requirements
              </label>
              <textarea
                rows={2}
                value={formData.outputRequirements}
                onChange={(e) => setFormData({ ...formData, outputRequirements: e.target.value })}
                placeholder="Format of returned value or output..."
                className="w-full bg-[#172033] border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Constraints *
            </label>
            <textarea
              rows={2}
              required
              value={formData.constraints}
              onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
              placeholder="e.g. 1 <= N <= 10^5, Time limit: 2.0s..."
              className="w-full bg-[#172033] border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">
              Sample Test Case & Explanation
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Sample Input</label>
                <input
                  type="text"
                  value={formData.sampleInput}
                  onChange={(e) => setFormData({ ...formData, sampleInput: e.target.value })}
                  placeholder="nums = [2, 7, 11, 15], target = 9"
                  className="w-full bg-[#172033] border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Sample Output</label>
                <input
                  type="text"
                  value={formData.sampleOutput}
                  onChange={(e) => setFormData({ ...formData, sampleOutput: e.target.value })}
                  placeholder="[0, 1]"
                  className="w-full bg-[#172033] border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Explanation</label>
              <input
                type="text"
                value={formData.sampleExplanation}
                onChange={(e) => setFormData({ ...formData, sampleExplanation: e.target.value })}
                placeholder="Why nums[0] + nums[1] gives target..."
                className="w-full bg-[#172033] border border-slate-700 rounded-lg p-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Preview / Cover Image URL
              </label>
              <input
                type="url"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-[#172033] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="Algorithms, Frontend, React"
                className="w-full bg-[#172033] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/30"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : challengeToEdit ? 'Update Challenge' : 'Publish Challenge'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
