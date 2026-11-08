import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  LogOut,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  {
    to: '/admin/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
  },
  {
    to: '/admin/applications',
    icon: Users,
    label: 'Instructor Applications',
  },
  {
    to: '/admin/courses',
    icon: BookOpen,
    label: 'Course Approvals',
  },
  {
    to: '/admin/history',
    icon: ClipboardList,
    label: 'Approval History',
  },
];

export default function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('skillnest_token');
    localStorage.removeItem('skillnest_user');
    navigate('/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col shadow-xl">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white tracking-tight">
          Skill<span className="text-blue-400">Nest</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">Admin Control Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            <span className="flex-1">{label}</span>
            <ChevronRight size={14} className="opacity-50" />
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
