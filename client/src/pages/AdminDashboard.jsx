import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { adminAPI } from '../services/adminApi';

function StatCard({ icon: Icon, label, value, color, to }) {
  const card = (
    <div
      className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow ${
        to ? 'cursor-pointer' : ''
      }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">
          {value ?? <span className="text-gray-300 text-lg">—</span>}
        </p>
      </div>
    </div>
  );
  return to ? <Link to={to}>{card}</Link> : card;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminAPI
      .getDashboardStats()
      .then((res) => setStats(res.data.data))
      .catch(() => setError('Failed to load dashboard statistics.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of platform activity — Instructor & Course Approval Management
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-5 h-24 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              <StatCard
                icon={Users}
                label="Total Registered Users"
                value={stats?.users?.total}
                color="bg-blue-500"
              />
              <StatCard
                icon={Clock}
                label="Pending Applications"
                value={stats?.applications?.pending}
                color="bg-yellow-500"
                to="/admin/applications"
              />
              <StatCard
                icon={CheckCircle}
                label="Approved Instructors"
                value={stats?.applications?.approved}
                color="bg-green-500"
                to="/admin/applications"
              />
              <StatCard
                icon={XCircle}
                label="Rejected Applications"
                value={stats?.applications?.rejected}
                color="bg-red-500"
                to="/admin/applications"
              />
              <StatCard
                icon={BookOpen}
                label="Pending Course Approvals"
                value={stats?.courses?.pending}
                color="bg-indigo-500"
                to="/admin/courses"
              />
              <StatCard
                icon={TrendingUp}
                label="Approved Courses"
                value={stats?.courses?.approved}
                color="bg-teal-500"
                to="/admin/courses"
              />
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-base font-semibold text-gray-900 mb-1">Instructor Applications</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Review pending applications from learners requesting instructor access.
                </p>
                <Link
                  to="/admin/applications"
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Manage Applications <ArrowRight size={15} />
                </Link>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-base font-semibold text-gray-900 mb-1">Course Approvals</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Review and approve courses submitted by instructors before publication.
                </p>
                <Link
                  to="/admin/courses"
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Manage Courses <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Summary row */}
            {stats && (
              <div className="mt-5 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Platform Summary</h2>
                <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                  <span>
                    Total applications:{' '}
                    <strong className="text-gray-900">{stats.applications?.total ?? 0}</strong>
                  </span>
                  <span>
                    Total courses:{' '}
                    <strong className="text-gray-900">{stats.courses?.total ?? 0}</strong>
                  </span>
                  <span>
                    Rejected courses:{' '}
                    <strong className="text-gray-900">{stats.courses?.rejected ?? 0}</strong>
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
