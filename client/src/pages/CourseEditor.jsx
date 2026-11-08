import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Layers,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { courseService } from '../services/api';

const CATEGORIES = [
  'Web Development',
  'Programming',
  'Database',
  'Software Engineering',
  'Algorithms',
  'Data Science & AI',
  'Cyber Security',
];

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

const SAMPLE_THUMBNAILS = [
  { label: 'Web / Code', url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80' },
  { label: 'Software / Java', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80' },
  { label: 'Algorithms / Python', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80' },
  { label: 'Database / SQL', url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80' },
];

const CourseEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    category: 'Web Development',
    level: 'Beginner',
    thumbnail: SAMPLE_THUMBNAILS[0].url,
    prerequisites: ['Basic computer literacy'],
    learningOutcomes: ['Understand key architectural concepts'],
    tags: ['Web', 'Programming'],
  });

  const [newPrereq, setNewPrereq] = useState('');
  const [newOutcome, setNewOutcome] = useState('');
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      const fetchCourse = async () => {
        try {
          const res = await courseService.getCourseById(id);
          if (res?.course) {
            setFormData({
              title: res.course.title || '',
              subtitle: res.course.subtitle || '',
              description: res.course.description || '',
              category: res.course.category || 'Web Development',
              level: res.course.level || 'Beginner',
              thumbnail: res.course.thumbnail || SAMPLE_THUMBNAILS[0].url,
              prerequisites: res.course.prerequisites || [],
              learningOutcomes: res.course.learningOutcomes || [],
              tags: res.course.tags || [],
            });
          }
        } catch (err) {
          setError('Failed to fetch course details for editing.');
        }
      };
      fetchCourse();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addPrereq = () => {
    if (!newPrereq.trim()) return;
    setFormData((prev) => ({
      ...prev,
      prerequisites: [...prev.prerequisites, newPrereq.trim()],
    }));
    setNewPrereq('');
  };

  const removePrereq = (index) => {
    setFormData((prev) => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index),
    }));
  };

  const addOutcome = () => {
    if (!newOutcome.trim()) return;
    setFormData((prev) => ({
      ...prev,
      learningOutcomes: [...prev.learningOutcomes, newOutcome.trim()],
    }));
    setNewOutcome('');
  };

  const removeOutcome = (index) => {
    setFormData((prev) => ({
      ...prev,
      learningOutcomes: prev.learningOutcomes.filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    if (!formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Course title is required.');
      return;
    }

    if (!formData.description.trim()) {
      setError('Course description is required.');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await courseService.updateCourse(id, formData);
        navigate(`/instructor/courses/${id}/curriculum`);
      } else {
        const res = await courseService.createCourse(formData);
        if (res?.course?._id) {
          navigate(`/instructor/courses/${res.course._id}/curriculum`);
        } else {
          navigate('/instructor/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || 'Error saving course.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/instructor/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Instructor Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 space-y-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
            Module 1 • Course Builder
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isEditing ? 'Edit Course Details' : 'Create New Technical Course'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Define course metadata, prerequisites, and learning objectives before structuring curriculum.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Course Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Modern Full-Stack Web Development with MERN"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              required
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Course Subtitle
            </label>
            <input
              type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              placeholder="e.g. Master React, Node, Express & MongoDB step by step."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Category & Level row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Target Difficulty Level
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Detailed Description *
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Explain the scope of this course, technical concepts covered, and practical applications..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              required
            />
          </div>

          {/* Thumbnail Image */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Course Thumbnail URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                placeholder="https://..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Quick presets */}
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-slate-400">Sample presets:</span>
              {SAMPLE_THUMBNAILS.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setFormData((prev) => ({ ...prev, thumbnail: preset.url }))}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {formData.thumbnail && (
              <div className="mt-3 w-40 aspect-video rounded-xl overflow-hidden border border-slate-200">
                <img
                  src={formData.thumbnail}
                  alt="Thumbnail Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Learning Outcomes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Learning Outcomes
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newOutcome}
                onChange={(e) => setNewOutcome(e.target.value)}
                placeholder="e.g. Architect modular REST APIs with Express & MongoDB"
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm"
              />
              <button
                type="button"
                onClick={addOutcome}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 font-semibold text-xs text-slate-700 rounded-xl transition"
              >
                Add
              </button>
            </div>
            <ul className="mt-3 space-y-2">
              {formData.learningOutcomes.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {item}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeOutcome(idx)}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Prerequisites */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Prerequisites
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPrereq}
                onChange={(e) => setNewPrereq(e.target.value)}
                placeholder="e.g. Basic JavaScript ES6 syntax"
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm"
              />
              <button
                type="button"
                onClick={addPrereq}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 font-semibold text-xs text-slate-700 rounded-xl transition"
              >
                Add
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.prerequisites.map((req, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-700"
                >
                  {req}
                  <button
                    type="button"
                    onClick={() => removePrereq(idx)}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <Link
              to="/instructor/dashboard"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : isEditing ? 'Update Course & Proceed' : 'Create & Proceed to Curriculum'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseEditor;

