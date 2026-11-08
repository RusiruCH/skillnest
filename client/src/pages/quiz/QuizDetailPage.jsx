import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, Award, Calendar, AlertTriangle, ArrowLeft, Play, BookOpen } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';

const QuizDetailPage = ({ userRole: propRole }) => {
  // Read authenticated user's role from AuthContext, with prop override support
  const { user } = useAuth();
  const userRole = propRole || user?.role || 'learner';
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await apiClient.get(`/quizzes/${id}`);
        if (res.data.success) {
          setQuiz(res.data.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load quiz details');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizDetails();
  }, [id]);

  const handleStartAttempt = async () => {
    try {
      setStarting(true);
      setError('');
      const res = await apiClient.post('/attempts/start', { quizId: id });
      if (res.data.success) {
        navigate(`/quizzes/${id}/attempt`, {
          state: res.data.data
        });
      }
    } catch (err) {
      setError(err.message || 'Could not start quiz attempt');
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading assessment details...</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="container" style={{ maxWidth: 700 }}>
        <div className="alert alert-danger">
          <AlertTriangle size={18} />
          <span>{error || 'Quiz not found'}</span>
        </div>
        <Link to="/quizzes" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Quizzes
        </Link>
      </div>
    );
  }

  const isClosed = quiz.status === 'closed';
  const isUpcoming = quiz.status === 'upcoming';
  const isActive = quiz.status === 'active';

  return (
    <div className="container" style={{ maxWidth: 800 }}>
      <Link to="/quizzes" className="btn btn-secondary" style={{ marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back to Quizzes
      </Link>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {quiz.title}
          </h1>
          <span
            className="badge"
            style={{
              background: isActive ? 'var(--success-light)' : isUpcoming ? 'var(--warning-light)' : '#f1f5f9',
              color: isActive ? '#065f46' : isUpcoming ? '#92400e' : '#475569',
              fontSize: '0.85rem'
            }}
          >
            {quiz.status ? quiz.status.toUpperCase() : 'PUBLISHED'}
          </span>
        </div>

        {quiz.description && (
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: 24, lineHeight: 1.6 }}>
            {quiz.description}
          </p>
        )}

        {/* Linked Course */}
        {quiz.courseId && (quiz.courseId.title || quiz.courseId._id) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '10px 14px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, fontSize: '0.9rem' }}>
            <BookOpen size={16} color="#0369a1" />
            <span style={{ color: '#0369a1', fontWeight: 600 }}>
              Linked Course: {quiz.courseId.title || String(quiz.courseId)}
              {quiz.courseId.category && <span style={{ fontWeight: 400, color: '#0284c7' }}> · {quiz.courseId.category}</span>}
            </span>
          </div>
        )}

        {/* Quiz Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28, background: '#f8fafc', padding: 18, borderRadius: 8 }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Duration</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontWeight: 700, fontSize: '1.1rem' }}>
              <Clock size={18} color="var(--primary)" />
              <span>{quiz.duration} Minutes</span>
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Passing Criteria</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontWeight: 700, fontSize: '1.1rem' }}>
              <Award size={18} color="var(--primary)" />
              <span>{quiz.passMark}% ({quiz.totalMarks} Total Marks)</span>
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Schedule Window</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: '0.9rem', fontWeight: 600 }}>
              <Calendar size={18} color="var(--primary)" />
              <span>{new Date(quiz.availableFrom).toLocaleDateString()} – {new Date(quiz.availableUntil).toLocaleDateString()}</span>
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Max Attempts</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontWeight: 700, fontSize: '1.1rem' }}>
              <Award size={18} color="var(--primary)" />
              <span>{quiz.maxAttempts || 1} Allowed</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 12 }}>
            Assessment Rules & Instructions
          </h3>
          <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: 8, padding: 16, whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.95rem' }}>
            {quiz.instructions}
          </div>
        </div>

        {/* Status Messages & Action Button */}
        {isUpcoming && (
          <div className="alert alert-info">
            This quiz is scheduled to open on {new Date(quiz.availableFrom).toLocaleString()}. You cannot start it yet.
          </div>
        )}

        {isClosed && (
          <div className="alert alert-danger">
            This quiz closed on {new Date(quiz.availableUntil).toLocaleString()}. Attempts are no longer accepted.
          </div>
        )}

        {userRole === 'learner' ? (
          <button
            onClick={handleStartAttempt}
            disabled={!isActive || starting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1.1rem' }}
          >
            <Play size={20} />
            <span>{starting ? 'Starting Assessment...' : 'Start Quiz Attempt'}</span>
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={handleStartAttempt}
              disabled={starting}
              className="btn btn-primary"
              style={{ flex: 1, padding: '12px' }}
            >
              <Play size={18} />
              <span>{starting ? 'Launching Preview...' : 'Preview & Test Quiz (Instructor Mode)'}</span>
            </button>
            <Link
              to={`/quizzes/${quiz._id}/edit`}
              className="btn btn-outline"
              style={{ flex: 1, padding: '12px', textAlign: 'center' }}
            >
              Manage Quiz & Questions
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizDetailPage;
