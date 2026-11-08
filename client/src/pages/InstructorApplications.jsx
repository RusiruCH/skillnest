import { useEffect, useState, useCallback } from 'react';
import { Search, CheckCircle, XCircle, Eye, Undo2, RefreshCw } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import ApprovalActionModal from '../components/ApprovalActionModal';
import ApplicationDetailModal from '../components/ApplicationDetailModal';
import { adminAPI } from '../services/adminApi';

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected'];

const statusBadge = {
  pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  approved: 'bg-green-100 text-green-700 border border-green-200',
  rejected: 'bg-red-100 text-red-700 border border-red-200',
};

function Avatar({ name = '' }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500',
    'bg-pink-500', 'bg-indigo-500', 'bg-orange-500',
  ];
  const color = colors[name.charCodeAt(0) % colors.length] || 'bg-gray-500';
  return (
    <div
      className={`w-9 h-9 rounded-full ${color} text-white flex items-center justify-center text-xs font-bold shrink-0`}
    >
      {initials || '?'}
    </div>
  );
}

export default function InstructorApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [modalAction, setModalAction] = useState(null); // { type: 'approve'|'reject', app }
  const [detailApp, setDetailApp] = useState(null);

  const fetchApplications = useCallback(() => {
    setLoading(true);
    setError('');
    adminAPI
      .getAllInstructorApplications()
      .then((res) => setApplications(res.data.data || []))
      .catch(() => setError('Failed to load applications.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleAction = async (remarks) => {
    if (!modalAction) return;
    const { type, app } = modalAction;
    setActionLoading(true);
    try {
      if (type === 'approve') {
        await adminAPI.approveInstructorApplication(app._id, remarks);
        showToast(`${app.applicant?.name}'s application approved.`);
      } else {
        await adminAPI.rejectInstructorApplication(app._id, remarks);
        showToast(`${app.applicant?.name}'s application rejected.`);
      }
      fetchApplications();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
      setModalAction(null);
    }
  };

  const handleUndo = async (app) => {
    setActionLoading(true);
    try {
      await adminAPI.undoInstructorApplicationStatus(app._id);
      showToast(`${app.applicant?.name}'s status reset to pending.`);
      fetchApplications();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Undo failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter
  const filtered = applications.filter((app) => {
    const name = app.applicant?.name?.toLowerCase() || '';
    const email = app.applicant?.email?.toLowerCase() || '';
    const q = search.toLowerCase();
    const matchesSearch = name.includes(q) || email.includes(q);
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    pending: applications.filter((a) => a.status === 'pending').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Instructor Applications</h1>
            <p className="text-sm text-gray-500 mt-1">
              Review and manage instructor access requests
            </p>
          </div>
          <button
            onClick={fetchApplications}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 bg-white rounded-lg px-3 py-2 transition-colors"
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {/* Toast */}
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

        {/* Filters bar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-5">
          {/* Tab-style status filters */}
          <div className="flex items-center border-b border-gray-100 px-4 gap-1 overflow-x-auto">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-3 text-sm font-medium capitalize whitespace-nowrap border-b-2 transition-colors ${
                  statusFilter === s
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {s === 'all' ? 'All Applications' : s}
                {s !== 'all' && (
                  <span
                    className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 font-semibold ${
                      s === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : s === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {counts[s] ?? 0}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="px-4 py-3">
            <div className="relative max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search applicants..."
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
            <div className="p-10 text-center text-gray-400 text-sm">Loading applications…</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">No applications found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Name</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Date</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Expertise</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Submission</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Status / Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((app) => (
                  <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                    {/* Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={app.applicant?.name} />
                        <div>
                          <p className="font-medium text-gray-900">{app.applicant?.name}</p>
                          <p className="text-xs text-gray-400">{app.applicant?.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                      {app.submittedAt
                        ? new Date(app.submittedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>

                    {/* Expertise */}
                    <td className="px-5 py-3.5 text-gray-600 max-w-[160px] truncate">
                      {app.expertiseArea || '—'}
                    </td>

                    {/* View link */}
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setDetailApp(app)}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>

                    {/* Status / Actions */}
                    <td className="px-5 py-3.5">
                      {app.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setModalAction({ type: 'approve', app })}
                            disabled={actionLoading}
                            title="Approve"
                            className="text-green-600 hover:text-green-800 disabled:opacity-40 transition-colors"
                          >
                            <CheckCircle size={20} />
                          </button>
                          <button
                            onClick={() => setModalAction({ type: 'reject', app })}
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
                            className={`px-2.5 py-1 text-xs font-semibold rounded-full border capitalize ${
                              statusBadge[app.status] || ''
                            }`}
                          >
                            {app.status}
                          </span>
                          <button
                            onClick={() => handleUndo(app)}
                            disabled={actionLoading}
                            title="Undo — reset to pending"
                            className="text-gray-400 hover:text-blue-600 disabled:opacity-40 transition-colors flex items-center gap-1 text-xs"
                          >
                            <Undo2 size={14} /> Undo
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
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
        targetLabel={`${modalAction?.app?.applicant?.name}'s application`}
        loading={actionLoading}
      />
      <ApplicationDetailModal
        isOpen={!!detailApp}
        onClose={() => setDetailApp(null)}
        application={detailApp}
      />
    </div>
  );
}
