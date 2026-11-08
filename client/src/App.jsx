import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import CourseListPage from './pages/CourseListPage';
import CourseDetailPage from './pages/CourseDetailPage';
import InstructorDashboard from './pages/InstructorDashboard';
import CourseEditor from './pages/CourseEditor';
import CurriculumBuilder from './pages/CurriculumBuilder';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PlaygroundPage from './pages/PlaygroundPage';

// Module 2: Instructor & Course Approval Management — Member 02
import AdminDashboard from './pages/AdminDashboard';
import InstructorApplications from './pages/InstructorApplications';
import CourseApprovals from './pages/CourseApprovals';
import ApprovalHistoryPage from './pages/ApprovalHistoryPage';
import ApplyInstructorPage from './pages/ApplyInstructorPage';

// Module 04: Hackathon Challenge Management (Member 04)
import ChallengesPage from './pages/ChallengesPage';
import ChallengeDetailPage from './pages/ChallengeDetailPage';
import InstructorChallengeDashboard from './pages/InstructorChallengeDashboard';
import LearnerSubmissionsPage from './pages/LearnerSubmissionsPage';

// Module 06: Forum & Q&A Management (Member 06)
import ForumPage from './pages/ForumPage';
import ForumThreadPage from './pages/ForumThreadPage';

// Module 05: Quiz & Assessment Management (Member 05)
import QuizListPage from './pages/quiz/QuizListPage';
import QuizDetailPage from './pages/quiz/QuizDetailPage';
import QuizCreatePage from './pages/quiz/QuizCreatePage';
import QuizEditPage from './pages/quiz/QuizEditPage';
import QuizAttemptPage from './pages/quiz/QuizAttemptPage';
import QuizResultPage from './pages/quiz/QuizResultPage';
import QuizSubmissionsPage from './pages/quiz/QuizSubmissionsPage';
import MyAttemptsPage from './pages/quiz/MyAttemptsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-indigo-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public & Learner Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/courses" element={<CourseListPage />} />
              <Route path="/courses/:id" element={<CourseDetailPage />} />
              <Route path="/playground" element={<PlaygroundPage />} />

              {/* Instructor Routes for Module 01 */}
              <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
              <Route path="/instructor/courses/new" element={<CourseEditor />} />
              <Route path="/instructor/courses/:id/edit" element={<CourseEditor />} />
              <Route path="/instructor/courses/:id/curriculum" element={<CurriculumBuilder />} />

              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Module 04: Hackathon Challenge Management Routes (Member 04) */}
              <Route path="/challenges" element={<ChallengesPage />} />
              <Route path="/challenges/:id" element={<ChallengeDetailPage />} />
              <Route path="/challenges/my-submissions" element={<LearnerSubmissionsPage />} />
              <Route path="/instructor/challenges" element={<InstructorChallengeDashboard />} />

              {/* Module 06: Forum & Q&A Management Routes (Member 06) */}
              <Route path="/forum" element={<ForumPage />} />
              <Route path="/forum/:id" element={<ForumThreadPage />} />

              {/* Module 05: Quiz & Assessment Management Routes (Member 05) */}
              <Route path="/quizzes" element={<QuizListPage />} />
              <Route path="/quizzes/create" element={<QuizCreatePage />} />
              <Route path="/quizzes/:id" element={<QuizDetailPage />} />
              <Route path="/quizzes/:id/edit" element={<QuizEditPage />} />
              <Route path="/quizzes/:id/attempt" element={<QuizAttemptPage />} />
              <Route path="/attempts/:id/result" element={<QuizResultPage />} />
              <Route path="/quizzes/:id/submissions" element={<QuizSubmissionsPage />} />
              <Route path="/my-attempts" element={<MyAttemptsPage />} />
              <Route path="/quizzes/my-attempts" element={<MyAttemptsPage />} />

              {/* Module 2: Admin Approval Management Routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/applications" element={<InstructorApplications />} />
              <Route path="/admin/courses" element={<CourseApprovals />} />
              <Route path="/admin/history" element={<ApprovalHistoryPage />} />
              <Route path="/apply-instructor" element={<ApplyInstructorPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
