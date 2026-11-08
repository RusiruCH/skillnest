import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { BookOpen, User, Shield, GraduationCap, Compass } from 'lucide-react';

import QuizListPage from './pages/quiz/QuizListPage';
import QuizDetailPage from './pages/quiz/QuizDetailPage';
import QuizCreatePage from './pages/quiz/QuizCreatePage';
import QuizEditPage from './pages/quiz/QuizEditPage';
import QuizAttemptPage from './pages/quiz/QuizAttemptPage';
import QuizResultPage from './pages/quiz/QuizResultPage';
import QuizSubmissionsPage from './pages/quiz/QuizSubmissionsPage';
import MyAttemptsPage from './pages/quiz/MyAttemptsPage';

function App() {
  // Support three roles: Administrator, Instructor, Learner
  // Allows testing and demonstration across all three roles seamlessly
  const [currentRole, setCurrentRole] = useState('learner');

  const getRoleBadgeClass = () => {
    if (currentRole === 'administrator') return 'role-admin';
    if (currentRole === 'instructor') return 'role-instructor';
    return 'role-learner';
  };

  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Navigation Bar */}
        <header className="navbar">
          <div className="nav-container">
            <Link to="/quizzes" className="brand">
              <BookOpen size={24} />
              <span>SkillNest</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                | Member 05: Quiz & Assessment Management
              </span>
            </Link>

            <div className="nav-links">
              <Link to="/quizzes" className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                <Compass size={15} /> All Quizzes
              </Link>
              <Link to="/my-attempts" className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                My Attempts
              </Link>

              {/* Role Switcher for Testing Acceptance Scenarios */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', padding: '4px 10px', borderRadius: 8, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Active Role:
                </span>
                <select
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: 'var(--text-main)',
                    outline: 'none'
                  }}
                >
                  <option value="learner">Learner</option>
                  <option value="instructor">Instructor</option>
                  <option value="administrator">Administrator</option>
                </select>
                <span className={`role-badge ${getRoleBadgeClass()}`}>
                  {currentRole}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main style={{ flex: 1, paddingBottom: 40 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/quizzes" replace />} />
            <Route path="/quizzes" element={<QuizListPage userRole={currentRole} />} />
            <Route path="/quizzes/create" element={<QuizCreatePage userRole={currentRole} />} />
            <Route path="/quizzes/:id" element={<QuizDetailPage userRole={currentRole} />} />
            <Route path="/quizzes/:id/edit" element={<QuizEditPage userRole={currentRole} />} />
            <Route path="/quizzes/:id/attempt" element={<QuizAttemptPage userRole={currentRole} />} />
            <Route path="/attempts/:id/result" element={<QuizResultPage userRole={currentRole} />} />
            <Route path="/quizzes/:id/submissions" element={<QuizSubmissionsPage userRole={currentRole} />} />
            <Route path="/my-attempts" element={<MyAttemptsPage userRole={currentRole} />} />
            <Route path="/quizzes/my-attempts" element={<MyAttemptsPage userRole={currentRole} />} />
            <Route path="*" element={<Navigate to="/quizzes" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid var(--border)', background: '#ffffff', padding: '16px 0', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <div className="container">
            SkillNest MERN Platform • Member 05: Quiz & Assessment Management (SEU/IS/22/ICT/087)
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
