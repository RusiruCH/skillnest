import { useEffect, useState, useCallback } from 'react';
import { Search, RefreshCw, ClipboardList } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { adminAPI } from '../services/adminApi';

const actionMeta = {
  approved: { label: 'Approved', cls: 'bg-green-100 text-green-700 border-green-200' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700 border-red-200' },
  reset: { label: 'Reset', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
};

export default function ApprovalHistoryPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchHistory = useCallback(() => {
    setLoading(true);
    setError('');
    adminAPI
      .getApprovalHistory()
      .then((res) => setRecords(res.data.data || []))
      .catch(() => setError('Failed to load approval history.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch =
      r.reviewer?.name?.toLowerCase().includes(q) ||
      r.remarks?.toLowerCase().includes(q) ||
      r.targetType?.toLowerCase().includes(q);
    const matchesType = typeFilter === 'all' || r.targetType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Approval History</h1>
            <p className="text-sm text-gray-500 mt-1">
              Full audit log of all approval actions taken
            </p>
          </div>
          <button
            onClick={fetchHistory}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 bg-white rounded-lg px-3 py-2 transition-colors"
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-2.5 text-sm">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-5 p-4 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search remarks, reviewer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
          >
            <option value="all">All Types</option>
            <option value="InstructorApplication">Instructor Applications</option>
            <option value="Course">Courses</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-400 text-sm">Loading history…</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center">
              <ClipboardList size={36} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400 text-sm">No approval records found.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Date</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Type</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Action</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Status Change</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Reviewer</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((record) => {
                  const meta = actionMeta[record.action] || actionMeta.reset;
                  return (
                    <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                        {record.createdAt
                          ? new Date(record.createdAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
                          {record.targetType === 'InstructorApplication' ? 'Application' : record.targetType || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border capitalize ${meta.cls}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 text-xs">
                        <span className="capitalize">{record.previousStatus || '—'}</span>
                        {' → '}
                        <span className="font-medium capitalize">{record.newStatus || '—'}</span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-700">
                        {record.reviewer?.name || record.reviewer?.email || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 max-w-[220px] truncate" title={record.remarks}>
                        {record.remarks || <span className="italic text-gray-300">None</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Count */}
        {!loading && (
          <p className="mt-3 text-xs text-gray-400 text-right">
            Showing {filtered.length} of {records.length} records
          </p>
        )}
      </main>
    </div>
  );
}
