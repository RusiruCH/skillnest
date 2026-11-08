import { useEffect, useState, useCallback } from 'react';
import { Search, CheckCircle, XCircle, Eye, Undo2, RefreshCw, BookOpen } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import ApprovalActionModal from '../components/ApprovalActionModal';
import CourseReviewModal from '../components/CourseReviewModal';
import { adminAPI } from '../services/adminApi';

const STATUS_FILTERS = ['all', 'pending_approval', 'approved', 'rejected'];

const statusMeta = {
  draft: { label: 'Draft', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
  pending_approval: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  approved: { label: 'Approved', cls: 'bg-green-100 text-green-700 border-green-200' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700 border-red-200' },
  archived: { label: 'Archived', cls: 'bg-purple-100 text-purple-700 border-purple-200' },
};

export default function CourseApprovals() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [modalAction, setModalAction] = useState(null); // { type, course }
  const [reviewCourse, setReviewCourse] = useState(null);

  const fetchCourses = useCallback(() => {
    setLoading(true);
    setError('');
    adminAPI
      .getAllCourses()
      .then((res) => setCourses(res.data.data || []))
      .catch(() => setError('Failed to load courses.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleAction = async (remarks) => {
    if (!modalAction) return;
    const { type, course } = modalAction;
    setActionLoading(true);
    try {
      if (type === 'approve') {
        await adminAPI.approveCourse(course._id, remarks);
        showToast(`"${course.title}" approved.`);
      } else {
        await adminAPI.rejectCourse(course._id, remarks);
        showToast(`"${course.title}" rejected.`);
      }
      fetchCourses();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
      setModalAction(null);
    }
  };

  const handleUndo = async (course) => {
    setActionLoading(true);
    try {
      await adminAPI.undoCourseStatus(course._id);
      showToast(`"${course.title}" reset to pending.`);
      fetchCourses();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Undo failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = courses.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      c.title?.toLowerCase().includes(q) ||
      c.instructor?.name?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    pending_approval: courses.filter((c) => c.status === 'pending_approval').length,
    approved: courses.filter((c) => c.status === 'approved').length,
    rejected: courses.filter((c) => c.status === 'rejected').length,
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Course Approvals</h1>
            <p className="text-sm text-gray-500 mt-1">
              Review and approve courses before they go live
            </p>
          </div>
          <button
            onClick={fetchCourses}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 bg-white rounded-lg px-3 py-2 transition-colors"
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {toast && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-4 py-2.5 text-sm">
            {toast}
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-5">
          <div className="flex items-center border-b border-gray-100 px-4 gap-1 overflow-x-auto">
            {STATUS_FILTERS.map((s) => {
              const meta = statusMeta[s];
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-3 text-sm font-medium capitalize whitespace-nowrap border-b-2 transition-colors ${
                    statusFilter === s
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {s === 'all' ? 'All Courses' : meta?.label || s}
                  {s !== 'all' && (
                    <span className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 font-semibold ${meta?.cls || ''}`}>
                      {counts[s] ?? 0}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="px-4 py-3">
            <div className="relative max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses, instructors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-400 text-sm">Loading courses…</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">No courses found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Course</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Instructor</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Category</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Submitted</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Review</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Status / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((course) => {
                  const meta = statusMeta[course.status] || statusMeta.draft;
                  return (
                    <tr key={course._id} className="hover:bg-gray-50 transition-colors">
                      {/* Title */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                            <BookOpen size={16} className="text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">{course.title}</p>
                            <p className="text-xs text-gray-400 capitalize">{course.level || '—'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Instructor */}
                      <td className="px-5 py-3.5 text-gray-600">
                        {course.instructor?.name || course.instructor?.email || '—'}
                      </td>

                      {/* Category */}
                      <td className="px-5 py-3.5 text-gray-600">{course.category || '—'}</td>

                      {/* Date */}
                      <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                        {course.submissionDate
                          ? new Date(course.submissionDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>

                      {/* View */}
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setReviewCourse(course)}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        {course.status === 'pending_approval' ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setModalAction({ type: 'approve', course })}
                              disabled={actionLoading}
                              title="Approve"
                              className="text-green-600 hover:text-green-800 disabled:opacity-40 transition-colors"
                            >
                              <CheckCircle size={20} />
                            </button>
                            <button
                              onClick={() => setModalAction({ type: 'reject', course })}
                              disabled={actionLoading}
                              title="Reject"
                              className="text-red-500 hover:text-red-700 disabled:opacity-40 transition-colors"
                            >
                              <XCircle size={20} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${meta.cls}`}
                            >
                              {meta.label}
                            </span>
                            {(course.status === 'approved' || course.status === 'rejected') && (
                              <button
                                onClick={() => handleUndo(course)}
                                disabled={actionLoading}
                                title="Undo — reset to pending"
                                className="text-gray-400 hover:text-blue-600 disabled:opacity-40 transition-colors flex items-center gap-1 text-xs"
                              >
                                <Undo2 size={14} /> Undo
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Modals */}
      <ApprovalActionModal
        isOpen={!!modalAction}
        onClose={() => setModalAction(null)}
        onConfirm={handleAction}
        action={modalAction?.type}
        targetLabel={`"${modalAction?.course?.title}"`}
        loading={actionLoading}
      />
      <CourseReviewModal
        isOpen={!!reviewCourse}
        onClose={() => setReviewCourse(null)}
        course={reviewCourse}
      />
    </div>
  );
}
