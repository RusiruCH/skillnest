import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BookOpen,
  Layers,
  Clock,
  CheckCircle2,
  PlayCircle,
  FileText,
  Code2,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  User,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { courseService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import MaterialViewerModal from '../components/MaterialViewerModal';

const CourseDetailPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTopicIndex, setActiveTopicIndex] = useState(0);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const data = await courseService.getCourseById(id);
        if (data?.course) {
          setCourse(data.course);
        }
      } catch (err) {
        console.error('Failed to load course details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-8">
        <div className="h-10 w-48 bg-slate-200 rounded-lg" />
        <div className="h-64 bg-slate-200 rounded-3xl" />
        <div className="h-96 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-md mx-auto my-20 text-center p-8 bg-white rounded-3xl border border-slate-200 space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Course Not Found</h2>
        <p className="text-sm text-slate-500">
          The requested course does not exist or has not been approved yet.
        </p>
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </Link>
      </div>
    );
  }

  const structures = course.structures || [];
  const totalMaterials = structures.reduce((acc, top) => acc + (top.materials?.length || 0), 0);

  const getMaterialIcon = (type) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="w-4 h-4 text-rose-500" />;
      case 'code':
        return <Code2 className="w-4 h-4 text-emerald-500" />;
      case 'notes':
        return <FileText className="w-4 h-4 text-amber-500" />;
      default:
        return <FileText className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back button */}
      <div>
        <Link
          to="/courses"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Course Catalog
        </Link>
      </div>

      {/* Hero Course Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
              {course.category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {course.level}
            </span>
            {course.status !== 'approved' && <StatusBadge status={course.status} />}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            {course.title}
          </h1>

          <p className="text-base text-slate-600 leading-relaxed">{course.subtitle || course.description}</p>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>{structures.length} Curriculum Topics</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>{totalMaterials} Learning Materials</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Rating: {course.rating || 4.8} / 5.0</span>
            </div>
          </div>
        </div>

        {/* Thumbnail Preview */}
        <div className="lg:col-span-4">
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg border border-slate-100">
            <img
              src={
                course.thumbnail ||
                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
              }
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Syllabus (Left) & Sidebar Information (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Course Syllabus & Topics */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Structured Course Syllabus
            </h2>
            <span className="text-xs font-medium text-slate-500">
              {structures.length} Topics • Click topic to view materials
            </span>
          </div>

          {structures.length > 0 ? (
            <div className="space-y-4">
              {structures.map((topic, index) => {
                const isOpen = activeTopicIndex === index;
                const materials = topic.materials || [];

                return (
                  <div
                    key={topic._id || index}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition"
                  >
                    {/* Topic Accordion Trigger */}
                    <button
                      onClick={() => setActiveTopicIndex(isOpen ? -1 : index)}
                      className="w-full text-left p-5 flex items-center justify-between hover:bg-slate-50/80 transition"
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isOpen ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {topic.order || index + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{topic.title}</h3>
                          {topic.description && (
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                              {topic.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-400">
                          {materials.length} {materials.length === 1 ? 'item' : 'items'}
                        </span>
                        {isOpen ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Materials List under Topic */}
                    {isOpen && (
                      <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-2.5 bg-slate-50/50">
                        {materials.length > 0 ? (
                          materials.map((mat, mIdx) => (
                            <div
                              key={mat._id || mIdx}
                              className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between hover:border-indigo-300 transition"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-slate-50">
                                  {getMaterialIcon(mat.materialType)}
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-slate-800">
                                    {mat.title}
                                  </div>
                                  <div className="text-[11px] font-mono text-slate-400 uppercase">
                                    {mat.materialType} • {mat.durationMinutes || 15} mins
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => setSelectedMaterial(mat)}
                                className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-lg transition"
                              >
                                View Material
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-slate-400 text-center py-4 font-italic">
                            No learning materials uploaded for this topic yet.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
              The curriculum structure is being built by the instructor.
            </div>
          )}
        </div>

        {/* Right Column: Instructor Profile & Learning Outcomes */}
        <div className="lg:col-span-4 space-y-6">
          {/* Instructor Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Course Instructor
            </h3>
            <div className="flex items-center gap-3">
              <img
                src={
                  course.instructor?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
                }
                alt={course.instructor?.name || 'Instructor'}
                className="w-12 h-12 rounded-full object-cover border border-slate-200"
              />
              <div>
                <div className="font-bold text-slate-900 text-sm">
                  {course.instructor?.name || 'L.M.R.C. Bandara'}
                </div>
                <div className="text-xs text-slate-500">
                  {course.instructor?.email || 'instructor@skillnest.edu'}
                </div>
              </div>
            </div>
            {course.instructor?.bio && (
              <p className="text-xs text-slate-600 leading-relaxed">{course.instructor.bio}</p>
            )}
          </div>

          {/* Learning Outcomes */}
          {course.learningOutcomes?.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                What You Will Learn
              </h3>
              <ul className="space-y-2">
                {course.learningOutcomes.map((outcome, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prerequisites */}
          {course.prerequisites?.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Prerequisites
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {course.prerequisites.map((req, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium"
                  >
                    {req}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Material Viewer Modal */}
      <MaterialViewerModal
        isOpen={Boolean(selectedMaterial)}
        material={selectedMaterial}
        onClose={() => setSelectedMaterial(null)}
      />
    </div>
  );
};

export default CourseDetailPage;

