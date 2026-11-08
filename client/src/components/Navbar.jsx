import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  BookOpen,
  LayoutDashboard,
  PlusCircle,
  LogOut,
  UserCheck,
  Code,
  Shield,
  MessageSquare,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, switchRole } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      {/* Top Banner highlighting developer identity from proposal */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 text-center flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-semibold text-white">SkillNest Open Course-ware</span>
          <span className="text-slate-400 hidden sm:inline">| South Eastern University of Sri Lanka</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-amber-400 font-mono text-[11px]">
            Module 1: Course & Learning Material Management (L.M.R.C.Bandara - 113)
          </span>
          {/* Quick role switcher for testing */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-[11px]">
            <span className="text-slate-400">Test Role:</span>
            <button
              onClick={() => switchRole('instructor')}
              className={`px-1.5 py-0.5 rounded transition ${
                user?.role === 'instructor' ? 'bg-indigo-600 text-white font-bold' : 'hover:text-white'
              }`}
            >
              Instructor
            </button>
            <button
              onClick={() => switchRole('learner')}
              className={`px-1.5 py-0.5 rounded transition ${
                user?.role === 'learner' ? 'bg-indigo-600 text-white font-bold' : 'hover:text-white'
              }`}
            >
              Learner
            </button>
            <button
              onClick={() => switchRole('admin')}
              className={`px-1.5 py-0.5 rounded transition ${
                user?.role === 'admin' ? 'bg-indigo-600 text-white font-bold' : 'hover:text-white'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
              Skill<span className="text-indigo-600">Nest</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium tracking-wide">
              COURSE-WARE PLATFORM
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            to="/courses"
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
              isActive('/courses')
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Course Catalog
          </Link>

          {/* Module 04: Hackathon Challenges */}
          <Link
            to="/challenges"
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
              isActive('/challenges')
                ? 'bg-purple-50 text-purple-600 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Code className="w-4 h-4 text-purple-500" />
            Challenges
          </Link>

          {/* Module 06: Community Forum & Q&A */}
          <Link
            to="/forum"
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
              isActive('/forum') || location.pathname.startsWith('/forum')
                ? 'bg-indigo-50 text-indigo-600 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            Forum & Q&A
          </Link>

          {user?.role === 'learner' && (
            <Link
              to="/challenges/my-submissions"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                isActive('/challenges/my-submissions')
                  ? 'bg-purple-50 text-purple-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              My Submissions
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link
              to="/admin/dashboard"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                isActive('/admin/dashboard') || location.pathname.startsWith('/admin')
                  ? 'bg-rose-50 text-rose-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Shield className="w-4 h-4 text-rose-500" />
              Admin Portal
            </Link>
          )}

          {(user?.role === 'instructor' || user?.role === 'admin') && (
            <>
              <Link
                to="/instructor/dashboard"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                  isActive('/instructor/dashboard')
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Instructor Studio
              </Link>
              <Link
                to="/instructor/challenges"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                  isActive('/instructor/challenges')
                    ? 'bg-purple-50 text-purple-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Code className="w-4 h-4 text-purple-500" />
                Challenge Studio
              </Link>
              <Link
                to="/instructor/courses/new"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                  isActive('/instructor/courses/new')
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-indigo-600" />
                Create Course
              </Link>
            </>
          )}
        </nav>

        {/* Right side auth/user action */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 ring-2 ring-indigo-50"
                />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-indigo-600">
                    {user.role}
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

