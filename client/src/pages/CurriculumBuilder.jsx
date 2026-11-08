import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Layers,
  Trash2,
  Video,
  FileText,
  Code2,
  Send,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { courseService, topicService, materialService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';
import MaterialViewerModal from '../components/MaterialViewerModal';

const CurriculumBuilder = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  // Modal / Form state for Adding Topic
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);
  const [topicForm, setTopicForm] = useState({ title: '', description: '', durationMinutes: 45 });

  // Modal / Form state for Adding Material
  const [activeTopicForMaterial, setActiveTopicForMaterial] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [materialForm, setMaterialForm] = useState({
    title: '',
    materialType: 'notes',
    resourceLocation: '',
    content: '',
    codeLanguage: 'javascript',
    durationMinutes: 15,
  });

  // Preview & Delete state
  const [previewMaterial, setPreviewMaterial] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    type: null, // 'topic' or 'material'
    id: null,
    title: '',
  });

  const loadCourse = async () => {
    try {
      const res = await courseService.getCourseById(id);
      if (res?.course) setCourse(res.course);
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ type: 'error', text: 'Failed to load course curriculum.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourse();
  }, [id]);

  const showFeedback = (type, text) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg({ type: '', text: '' }), 4000);
  };

  // Add Topic Handler
  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!topicForm.title.trim()) return;

    try {
      await topicService.addTopic(course._id, topicForm);
      showFeedback('success', `Topic "${topicForm.title}" added to course syllabus.`);
      setTopicForm({ title: '', description: '', durationMinutes: 45 });
      setIsAddTopicModalOpen(false);
      loadCourse();
    } catch (err) {
      showFeedback('error', err.message || 'Error creating topic.');
    }
  };

  // Add Material Handler
  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    if (!materialForm.title.trim()) return;

    try {
      let payload;
      if (selectedFile) {
        payload = new FormData();
        payload.append('title', materialForm.title);
        payload.append('materialType', materialForm.materialType);
        payload.append('content', materialForm.content || '');
        payload.append('codeLanguage', materialForm.codeLanguage || 'javascript');
        payload.append('durationMinutes', materialForm.durationMinutes || 15);
        payload.append('resourceLocation', materialForm.resourceLocation || '');
        payload.append('file', selectedFile);
      } else {
        payload = materialForm;
      }

      await materialService.createMaterial(activeTopicForMaterial._id, payload);
      showFeedback('success', `Material "${materialForm.title}" attached to topic.`);
      setMaterialForm({
        title: '',
        materialType: 'notes',
        resourceLocation: '',
        content: '',
        codeLanguage: 'javascript',
        durationMinutes: 15,
      });
      setSelectedFile(null);
      setActiveTopicForMaterial(null);
      loadCourse();
    } catch (err) {
      showFeedback('error', err.message || 'Error creating learning material.');
    }
  };

  // Delete Confirm execution
  const executeDelete = async () => {
    const { type, id: targetId } = deleteConfirm;
    try {
      if (type === 'topic') {
        await topicService.deleteTopic(targetId);
        showFeedback('success', 'Topic and all its materials deleted.');
      } else if (type === 'material') {
        await materialService.deleteMaterial(targetId);
        showFeedback('success', 'Learning material deleted.');
      }
      setDeleteConfirm({ isOpen: false, type: null, id: null, title: '' });
      loadCourse();
    } catch (err) {
      showFeedback('error', err.message || 'Error during deletion.');
    }
  };

  // Submit Course for Admin Approval
  const handleSubmitCourse = async () => {
    const topics = course.structures || [];
    const totalMats = topics.reduce((acc, t) => acc + (t.materials?.length || 0), 0);

    if (topics.length === 0) {
      showFeedback('error', 'Cannot submit: Please add at least 1 topic to the syllabus.');
      return;
    }

    if (totalMats === 0) {
      showFeedback('error', 'Cannot submit: Please attach at least 1 learning material to your topics.');
      return;
    }

    try {
      await courseService.submitCourseForApproval(course._id);
      showFeedback('success', 'Course submitted for administrator review (Module 02 approval pipeline)!');
      loadCourse();
    } catch (err) {
      showFeedback('error', err.message || 'Submission failed.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-8 w-40 bg-slate-200 rounded-lg" />
        <div className="h-32 bg-slate-200 rounded-3xl" />
        <div className="h-64 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-md mx-auto my-20 text-center p-8 bg-white rounded-3xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">Course Not Found</h2>
        <Link to="/instructor/dashboard" className="text-indigo-600 font-semibold text-sm mt-3 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const structures = course.structures || [];
  const totalMaterials = structures.reduce((acc, t) => acc + (t.materials?.length || 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Toast Feedback */}
      {feedbackMsg.text && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border text-sm font-semibold animate-slide-up ${
            feedbackMsg.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          {feedbackMsg.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Navigation header */}
      <div className="flex items-center justify-between">
        <Link
          to="/instructor/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <Link
          to={`/courses/${course._id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline"
        >
          <Eye className="w-4 h-4" />
          Preview Learner View
        </Link>
      </div>

      {/* Course Context Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <StatusBadge status={course.status} />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {course.category}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {course.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">{course.subtitle || course.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {course.status === 'draft' ? (
              <button
                onClick={handleSubmitCourse}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-100 flex items-center gap-2 transition"
              >
                <Send className="w-4 h-4" />
                Submit for Admin Approval
              </button>
            ) : course.status === 'pending_approval' ? (
              <div className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 animate-spin" />
                In Administrator Review (Module 02)
              </div>
            ) : (
              <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Live on Public Catalog
              </div>
            )}
          </div>
        </div>

        {/* Rejection message notice if any */}
        {course.status === 'rejected' && course.rejectionReason && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <div className="font-bold mb-1">Administrator Review Feedback:</div>
            <div>{course.rejectionReason}</div>
          </div>
        )}

        {/* Quick summary stats */}
        <div className="flex items-center gap-6 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>{structures.length} Topics Configured</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>{totalMaterials} Learning Materials Attached</span>
          </div>
        </div>
      </div>

      {/* Syllabus Topic List & Materials Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Course Curriculum Structure
            </h2>
            <p className="text-xs text-slate-500">
              Organize syllabus into ordered topics and attach videos, notes, or code exercises.
            </p>
          </div>

          <button
            onClick={() => setIsAddTopicModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            Add Topic / Unit
          </button>
        </div>

        {/* Topic Accordions */}
        {structures.length > 0 ? (
          <div className="space-y-4">
            {structures.map((topic, index) => {
              const materials = topic.materials || [];

              return (
                <div
                  key={topic._id || index}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
                >
                  {/* Topic Header bar */}
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 border-b border-slate-100">
                    <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                        {topic.order || index + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{topic.title}</h3>
                        {topic.description && (
                          <p className="text-xs text-slate-500">{topic.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveTopicForMaterial(topic)}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 text-indigo-600 font-bold text-xs transition flex items-center gap-1 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Material
                      </button>

                      <button
                        onClick={() =>
                          setDeleteConfirm({
                            isOpen: true,
                            type: 'topic',
                            id: topic._id,
                            title: topic.title,
                          })
                        }
                        title="Delete topic"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Materials under this Topic */}
                  <div className="p-5 space-y-3">
                    {materials.length > 0 ? (
                      materials.map((mat, mIdx) => (
                        <div
                          key={mat._id || mIdx}
                          className="bg-slate-50/60 p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between hover:bg-white transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white border border-slate-200">
                              {mat.materialType === 'video' ? (
                                <Video className="w-4 h-4 text-rose-500" />
                              ) : mat.materialType === 'code' ? (
                                <Code2 className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <FileText className="w-4 h-4 text-amber-500" />
                              )}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-800">{mat.title}</div>
                              <div className="text-[11px] font-mono text-slate-400 uppercase">
                                {mat.materialType} • {mat.durationMinutes || 15} mins
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setPreviewMaterial(mat)}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition"
                            >
                              Preview
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  isOpen: true,
                                  type: 'material',
                                  id: mat._id,
                                  title: mat.title,
                                })
                              }
                              className="p-1 text-slate-400 hover:text-rose-600 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-5 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                        No materials in this topic yet. Click <strong>Add Material</strong> to attach videos, notes, or code.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
            <Layers className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Topics Created Yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Start building your course syllabus by creating sequential topics (e.g., Module 1: Introduction, Module 2: Advanced Topics).
            </p>
            <button
              onClick={() => setIsAddTopicModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add First Topic
            </button>
          </div>
        )}
      </div>

      {/* Add Topic Modal */}
      {isAddTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <h3 className="text-lg font-bold text-slate-900">Add Syllabus Topic</h3>
            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Topic Title *
                </label>
                <input
                  type="text"
                  value={topicForm.title}
                  onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                  placeholder="e.g. Chapter 1: Introduction to Architecture"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description / Topic Summary
                </label>
                <textarea
                  rows={2}
                  value={topicForm.description}
                  onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
                  placeholder="Key concepts to be learned in this topic..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Estimated Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  value={topicForm.durationMinutes}
                  onChange={(e) =>
                    setTopicForm({ ...topicForm, durationMinutes: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddTopicModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
                >
                  Save Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Learning Material Modal */}
      {activeTopicForMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div>
              <span className="text-xs text-indigo-600 font-bold uppercase tracking-wider">
                Topic: {activeTopicForMaterial.title}
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">Attach Learning Material</h3>
            </div>

            <form onSubmit={handleCreateMaterial} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Material Title *
                </label>
                <input
                  type="text"
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                  placeholder="e.g. Express Routing Patterns & Middleware"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Material Format Type *
                </label>
                <select
                  value={materialForm.materialType}
                  onChange={(e) =>
                    setMaterialForm({ ...materialForm, materialType: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="notes">Lecture Notes (Rich Markdown)</option>
                  <option value="video">Video Lecture (YouTube or MP4 Stream)</option>
                  <option value="code">Source Code Snippet / Exercise</option>
                  <option value="document">PDF / External Document</option>
                </select>
              </div>

              {materialForm.materialType === 'video' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Video Stream or YouTube URL
                    </label>
                    <input
                      type="text"
                      value={materialForm.resourceLocation}
                      onChange={(e) =>
                        setMaterialForm({ ...materialForm, resourceLocation: e.target.value })
                      }
                      placeholder="https://www.youtube.com/watch?v=... or https://..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Or Upload MP4 / WebM Video File (Max 50MB)
                    </label>
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-slate-200 rounded-xl p-1"
                    />
                    {selectedFile && (
                      <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                </div>
              )}

              {materialForm.materialType === 'document' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Upload Document File (PDF, DOCX, PPT, TXT)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                      onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-slate-200 rounded-xl p-1"
                    />
                    {selectedFile && (
                      <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Or External Document / Reference URL
                    </label>
                    <input
                      type="text"
                      value={materialForm.resourceLocation}
                      onChange={(e) =>
                        setMaterialForm({ ...materialForm, resourceLocation: e.target.value })
                      }
                      placeholder="https://docs.example.com/guide.pdf"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              )}

              {materialForm.materialType === 'code' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Programming Language
                  </label>
                  <select
                    value={materialForm.codeLanguage}
                    onChange={(e) =>
                      setMaterialForm({ ...materialForm, codeLanguage: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="python">Python</option>
                    <option value="sql">SQL</option>
                    <option value="html">HTML</option>
                    <option value="cpp">C++</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {materialForm.materialType === 'code'
                    ? 'Source Code Content'
                    : materialForm.materialType === 'notes'
                    ? 'Lecture Notes (Markdown Supported)'
                    : 'Notes / Summary'}
                </label>
                <textarea
                  rows={4}
                  value={materialForm.content}
                  onChange={(e) => setMaterialForm({ ...materialForm, content: e.target.value })}
                  placeholder={
                    materialForm.materialType === 'code'
                      ? 'function solve() { ... }'
                      : '### Lecture Overview\nKey points and concepts covered...'
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Estimated Reading/Viewing Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={materialForm.durationMinutes}
                  onChange={(e) =>
                    setMaterialForm({ ...materialForm, durationMinutes: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTopicForMaterial(null);
                    setSelectedFile(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
                >
                  Attach Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title={`Delete ${deleteConfirm.type === 'topic' ? 'Topic' : 'Learning Material'}?`}
        message={`Are you sure you want to delete "${deleteConfirm.title}"?`}
        confirmText="Confirm Delete"
        confirmColor="bg-rose-600"
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, type: null, id: null, title: '' })}
      />

      {/* Material Preview Modal */}
      <MaterialViewerModal
        isOpen={Boolean(previewMaterial)}
        material={previewMaterial}
        onClose={() => setPreviewMaterial(null)}
      />
    </div>
  );
};

export default CurriculumBuilder;

