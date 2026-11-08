import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ArrowRight, Lock, Mail } from 'lucide-react';

const LoginPage = () => {
  const { login, switchRole } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('instructor@skillnest.edu');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(email, password);
    navigate('/instructor/dashboard');
  };

  const handleQuickLogin = (role) => {
    switchRole(role);
    if (role === 'instructor' || role === 'admin') {
      navigate('/instructor/dashboard');
    } else {
      navigate('/courses');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-100">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Sign in to SkillNest</h2>
          <p className="text-xs text-slate-500">
            Access Course & Learning Material Management (Module 01)
          </p>
        </div>

        {/* Quick Demo Login Pills */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2 text-xs">
          <div className="text-slate-500 font-semibold text-[11px] text-center">
            One-Click Evaluator Roles:
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('instructor')}
              className="py-1.5 px-2 bg-white rounded-xl border border-slate-200 hover:border-indigo-500 text-indigo-600 font-bold text-center transition"
            >
              Instructor
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('learner')}
              className="py-1.5 px-2 bg-white rounded-xl border border-slate-200 hover:border-indigo-500 text-slate-700 font-bold text-center transition"
            >
              Learner
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="py-1.5 px-2 bg-white rounded-xl border border-slate-200 hover:border-indigo-500 text-slate-700 font-bold text-center transition"
            >
              Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-100 transition flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 font-bold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

