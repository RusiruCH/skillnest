import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Layers,
  GraduationCap,
  Award,
  ShieldCheck,
  HelpCircle,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  RotateCw,
  UploadCloud,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  Crown,
  Smartphone,
  Settings,
  Grid,
  List,
  Edit3,
  Trash2,
  Send,
  Eye,
  Info,
  Sparkles,
  X,
  ExternalLink,
} from 'lucide-react';
import { courseService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/CourseCard';
import StatusBadge from '../components/StatusBadge';
import ConfirmModal from '../components/ConfirmModal';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All categories');
  const [selectedAuthor, setSelectedAuthor] = useState('All authors');

  // Sidebar collapsible sections
  const [othersOpen, setOthersOpen] = useState(true);
  const [topCoursesOpen, setTopCoursesOpen] = useState(true);

  // Modals
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    courseId: null,
    title: '',
  });
  const [submitModalState, setSubmitModalState] = useState({
    isOpen: false,
    courseId: null,
    title: '',
  });
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesRes, statsRes] = await Promise.all([
        courseService.getInstructorCourses(),
        courseService.getInstructorStats(),
      ]);

      if (coursesRes?.courses) setCourses(coursesRes.courses);
      if (statsRes?.stats) setStats(statsRes.stats);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleDeleteCourse = async () => {
    if (!deleteModalState.courseId) return;
    try {
      await courseService.deleteCourse(deleteModalState.courseId);
      showToast('Course and associated curriculum removed successfully.');
      setDeleteModalState({ isOpen: false, courseId: null, title: '' });
      loadData();
    } catch (err) {
      alert(err.message || 'Error deleting course');
    }
  };

  const handleSubmitForReview = async () => {
    if (!submitModalState.courseId) return;
    try {
      await courseService.submitCourseForApproval(submitModalState.courseId);
      showToast(
        'Course submitted for administrator review (Module 02 approval pipeline)!'
      );
      setSubmitModalState({ isOpen: false, courseId: null, title: '' });
      loadData();
    } catch (err) {
      alert(err.message || 'Error submitting course');
    }
  };

  // Filter calculations
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatusTab === 'all' || course.status === selectedStatusTab;

    const matchesCategory =
      selectedCategory === 'All categories' ||
      course.category === selectedCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Pagination slice
  const totalCoursesCount = filteredCourses.length;
  const totalPages = Math.max(1, Math.ceil(totalCoursesCount / perPage));
  const displayedCourses = filteredCourses.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* LEFT SIDEBAR (Matching the mockup) */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 hidden lg:flex sticky top-0 h-screen overflow-y-auto">
        <div className="p-5 space-y-6">
          {/* Logo / Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm font-bold text-lg">
                <span className="text-white font-extrabold text-base">C</span>
              </div>
              <span className="font-extrabold text-slate-900 text-sm tracking-tight">
                Courses & Programs
              </span>
            </div>
            <button className="text-slate-400 hover:text-slate-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Nav Items */}
          <nav className="space-y-1">
            <Link
              to="/instructor/dashboard"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-indigo-50/70 text-indigo-700 transition"
            >
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Courses</span>
            </Link>

            <Link
              to="/courses"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
            >
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>Programs</span>
            </Link>

            <button
              onClick={() => showToast('Subscriptions management')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition text-left"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Subscriptions</span>
            </button>

            <button
              onClick={() => showToast('Gradebook')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition text-left"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-400" />
              <span>Gradebook</span>
            </button>
          </nav>

          {/* Collapsible: Others */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <button
              onClick={() => setOthersOpen(!othersOpen)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-slate-700 py-1"
            >
              <span>Others</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  othersOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {othersOpen && (
              <div className="space-y-1 pl-1 pt-1">
                <button
                  onClick={() => showToast('Certificates view')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-50 transition"
                >
                  <Award className="w-4 h-4 text-cyan-500" />
                  <span>Certificates</span>
                </button>

                <button
                  onClick={() =>
                    setSelectedStatusTab('pending_approval')
                  }
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-50 transition"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Review Center</span>
                </button>

                <button
                  onClick={() => showToast('Question Banks (Module 05)')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-50 transition"
                >
                  <HelpCircle className="w-4 h-4 text-blue-500" />
                  <span>Question Banks</span>
                </button>

                <button
                  onClick={() => showToast('Course Forms')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-50 transition"
                >
                  <FileSpreadsheet className="w-4 h-4 text-purple-500" />
                  <span>Course Forms</span>
                </button>
              </div>
            )}
          </div>

          {/* Collapsible: Top Courses */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <button
              onClick={() => setTopCoursesOpen(!topCoursesOpen)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-slate-700 py-1"
            >
              <span>Top Courses</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  topCoursesOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {topCoursesOpen && (
              <div className="space-y-1.5 pl-2 pt-1 text-xs font-medium text-slate-600">
                <button
                  onClick={() => setSelectedCategory('Web Development')}
                  className="w-full flex items-center gap-2.5 py-1.5 hover:text-indigo-600 transition"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>UI/UX Design</span>
                </button>
                <button
                  onClick={() => setSelectedCategory('Programming')}
                  className="w-full flex items-center gap-2.5 py-1.5 hover:text-indigo-600 transition"
                >
                  <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                  <span>Brand Design</span>
                </button>
                <button
                  onClick={() => setSelectedCategory('Data Science & AI')}
                  className="w-full flex items-center gap-2.5 py-1.5 hover:text-indigo-600 transition"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Digital Marketing</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Upgrade Card & Utilities */}
        <div className="p-4 space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-b from-indigo-50/70 to-purple-50/40 border border-indigo-100 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Crown className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                AI-powered LMS ✨
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Create your course and Share it on this platform
              </p>
            </div>
            <button
              onClick={() => navigate('/instructor/courses/new')}
              className="w-full py-2 px-3 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl transition shadow-xs"
            >
              Upgrade Now
            </button>
            <div className="text-center">
              <button
                onClick={() => showToast('Reminder set for later.')}
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-600"
              >
                Remind me later
              </button>
            </div>
          </div>

          {/* Mini Utility Icons Dock */}
          <div className="flex items-center justify-around pt-2 text-slate-400 border-t border-slate-100">
            <button
              onClick={() => showToast('Help Center')}
              className="p-1.5 hover:text-slate-700 transition"
              title="Help Center"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => showToast('Mobile Responsive View Active')}
              className="p-1.5 hover:text-slate-700 transition"
              title="Devices"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => showToast('Platform Settings')}
              className="p-1.5 hover:text-slate-700 transition"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP BAR (Breadcrumbs & Profile) */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link
              to="/instructor/dashboard"
              className="hover:text-slate-800 transition"
            >
              Courses & Programs
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-bold">Courses</span>
          </div>

          {/* Utilities & User Avatar */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => loadData()}
              className="w-9 h-9 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-600 flex items-center justify-center transition hover:bg-slate-50"
              title="Refresh courses"
            >
              <RotateCw
                className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`}
              />
            </button>

            {/* Profile Pill */}
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <img
                src={
                  user?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
                }
                alt={user?.name || 'Instructor'}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-none">
                  {user?.name || 'Fillo Academy'}
                </div>
                <div className="text-[10px] text-slate-400 font-medium capitalize mt-0.5">
                  {user?.role || 'Instructor'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Page Heading & Main Action Buttons */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Course manager
                </h1>
                <Info
                  className="w-4 h-4 text-slate-400 cursor-pointer hover:text-indigo-600"
                  title="Create, organize syllabus, and manage courses for SkillNest"
                />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Review and manage your school courses.
              </p>
            </div>

            {/* Top Right Action Buttons (Mockup: Import Course, Manage Categories, Create Course) */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setImportModalOpen(true)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:text-slate-900 text-xs font-bold flex items-center gap-2 transition shadow-2xs"
              >
                <UploadCloud className="w-4 h-4 text-slate-500" />
                <span>Import Course</span>
              </button>

              <button
                onClick={() => setCategoryModalOpen(true)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:text-slate-900 text-xs font-bold flex items-center gap-2 transition shadow-2xs"
              >
                <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                <span>Manage Categories</span>
              </button>

              <Link
                to="/instructor/courses/new"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold flex items-center gap-2 transition shadow-sm shadow-indigo-200"
              >
                <Plus className="w-4 h-4" />
                <span>Create Course</span>
              </Link>
            </div>
          </div>

          {/* FILTER ROW (Mockup: Search input, dropdowns, layout toggle) */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search courses */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Dropdown Filters & Layout Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              {/* All courses / status filter */}
              <select
                value={selectedStatusTab}
                onChange={(e) => setSelectedStatusTab(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="all">All courses</option>
                <option value="draft">Drafts</option>
                <option value="pending_approval">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Needs Revision</option>
              </select>

              {/* All categories filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="All categories">All categories</option>
                <option value="Web Development">Web Development</option>
                <option value="Programming">Programming</option>
                <option value="Database">Database</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Algorithms">Algorithms</option>
                <option value="Data Science & AI">Data Science & AI</option>
                <option value="Cyber Security">Cyber Security</option>
              </select>

              {/* All authors filter */}
              <select
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="All authors">All authors</option>
                <option value="me">My Courses ({courses.length})</option>
              </select>

              {/* View Toggle */}
              <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50 ml-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-2xs text-indigo-600'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === 'list'
                      ? 'bg-white shadow-2xs text-indigo-600'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="List / Table view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* STATUS PILL TABS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold text-slate-600">
            {[
              { id: 'all', label: 'All Courses', count: courses.length },
              {
                id: 'draft',
                label: 'Drafts',
                count: courses.filter((c) => c.status === 'draft').length,
              },
              {
                id: 'pending_approval',
                label: 'Under Review',
                count: courses.filter((c) => c.status === 'pending_approval')
                  .length,
              },
              {
                id: 'approved',
                label: 'Approved & Live',
                count: courses.filter((c) => c.status === 'approved').length,
              },
              {
                id: 'rejected',
                label: 'Needs Revision',
                count: courses.filter((c) => c.status === 'rejected').length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatusTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl border transition flex items-center gap-1.5 whitespace-nowrap ${
                  selectedStatusTab === tab.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedStatusTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* COURSE CONTENT */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div
                  key={n}
                  className="h-72 bg-slate-200/60 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : displayedCourses.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                No courses found matching this criteria
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try clearing your search or status filter, or start by creating a
                new course.
              </p>
              <div className="pt-2">
                <Link
                  to="/instructor/courses/new"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create First Course
                </Link>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            /* GRID VIEW (Matching mockup with 4 columns + Expand catalog card) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {displayedCourses.map((course, idx) => (
                <CourseCard
                  key={course._id || idx}
                  course={course}
                  isInstructorView={true}
                  onEdit={() =>
                    navigate(`/instructor/courses/${course._id}/edit`)
                  }
                  onDelete={(target) =>
                    setDeleteModalState({
                      isOpen: true,
                      courseId: target._id,
                      title: target.title,
                    })
                  }
                  onSubmitReview={(id) =>
                    setSubmitModalState({
                      isOpen: true,
                      courseId: id,
                      title: course.title,
                    })
                  }
                />
              ))}

              {/* Promo Card: "Expand your catalog" (Mockup card 8) */}
              <div className="bg-white rounded-2xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 p-6 flex flex-col justify-between items-start transition shadow-2xs group">
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    Expand your catalog
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Build your own courses with our AI assistant or license
                    ready-made ones from verified providers.
                  </p>
                </div>

                <div className="w-full pt-4">
                  <Link
                    to="/instructor/courses/new"
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Create course</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            /* LIST / TABLE VIEW */
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Topics</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {displayedCourses.map((course) => (
                    <tr
                      key={course._id}
                      className="hover:bg-slate-50/60 transition"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-12 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900 leading-snug hover:text-indigo-600 transition">
                              <Link
                                to={`/instructor/courses/${course._id}/curriculum`}
                              >
                                {course.title}
                              </Link>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              by {course.instructor?.name || 'Instructor'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600">
                        {course.category}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={course.status} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {course.structures?.length || 0} Topics
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/instructor/courses/${course._id}/curriculum`}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 font-bold hover:bg-indigo-100 transition"
                          >
                            Curriculum
                          </Link>
                          <Link
                            to={`/instructor/courses/${course._id}/edit`}
                            className="p-1.5 text-slate-400 hover:text-slate-700"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() =>
                              setDeleteModalState({
                                isOpen: true,
                                courseId: course._id,
                                title: course.title,
                              })
                            }
                            className="p-1.5 text-slate-400 hover:text-rose-600"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* BOTTOM PAGINATION BAR (Mockup pagination) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-200/80 text-xs text-slate-500">
            {/* Page numbers */}
            <div className="flex items-center gap-1 font-semibold">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
              >
                &lt;
              </button>

              {[1, 2, 3, 4].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'border border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {page}
                </button>
              ))}

              <span className="px-1 text-slate-400">...</span>

              <button
                onClick={() => setCurrentPage(13)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center border border-slate-200 hover:bg-slate-100 text-slate-700 ${
                  currentPage === 13 ? 'bg-indigo-600 text-white font-bold' : ''
                }`}
              >
                13
              </button>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none"
              >
                &gt;
              </button>
            </div>

            {/* Show per page dropdown & counter */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span>Show:</span>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none"
                >
                  <option value={8}>08</option>
                  <option value={12}>12</option>
                  <option value={16}>16</option>
                </select>
                <span>Per Page</span>
              </div>

              <div className="text-slate-400">
                {displayedCourses.length > 0
                  ? `1 - ${String(displayedCourses.length).padStart(2, '0')} of ${totalCoursesCount || 150}`
                  : '0 of 0'}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL: Import Course */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Import Course Curriculum
              </h3>
              <button
                onClick={() => setImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Import a standard syllabus structure or predefined JSON package to
              quickly bootstrap topics and learning materials.
            </p>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center space-y-2 hover:border-indigo-300 transition">
              <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto" />
              <div className="text-xs font-semibold text-slate-700">
                Drop your syllabus template here, or{' '}
                <span className="text-indigo-600 underline cursor-pointer">
                  browse files
                </span>
              </div>
              <div className="text-[10px] text-slate-400">
                Supports .json, .csv, or .yaml course specifications
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setImportModalOpen(false);
                  showToast('Sample template imported successfully!');
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
              >
                Import Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Manage Categories */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Platform Categories
              </h3>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Approved subject classifications for SkillNest courses:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                'Programming',
                'Web Development',
                'Database',
                'Software Engineering',
                'Algorithms',
                'Data Science & AI',
                'Cyber Security',
                'Cloud Architecture',
              ].map((cat) => (
                <div
                  key={cat}
                  className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between"
                >
                  <span className="font-semibold text-slate-700">{cat}</span>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {courses.filter((c) => c.category === cat).length} Courses
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        title="Delete Course"
        message={`Are you sure you want to permanently delete "${deleteModalState.title}" along with its syllabus topics and materials?`}
        confirmLabel="Yes, Delete"
        onConfirm={handleDeleteCourse}
        onCancel={() =>
          setDeleteModalState({ isOpen: false, courseId: null, title: '' })
        }
      />

      {/* Confirm Submit Modal */}
      <ConfirmModal
        isOpen={submitModalState.isOpen}
        title="Submit Course for Administrator Approval"
        message={`Submitting "${submitModalState.title}" will change its status from Draft to Pending Approval. Administrators will review it in Module 02 before it appears on the public catalog.`}
        confirmLabel="Submit for Review"
        onConfirm={handleSubmitForReview}
        onCancel={() =>
          setSubmitModalState({ isOpen: false, courseId: null, title: '' })
        }
      />
    </div>
  );
};

export default InstructorDashboard;
