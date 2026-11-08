import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  BookOpen,
  AlertCircle,
  Search,
  TrendingUp,
  FileText
} from 'lucide-react';
import apiClient from '../../api/apiClient';

const MyAttemptsPage = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'passed' | 'failed' | 'in_progress'

  const fetchMyAttempts = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiClient.get('/attempts/my');
      if (res.data.success) {
        setAttempts(res.data.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load your quiz attempts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAttempts();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtered attempts
  const filteredAttempts = attempts.filter((att) => {
    const quizTitle = att.quiz?.title || 'Untitled Assessment';
    const matchesSearch = quizTitle.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'passed') return matchesSearch && att.passed && att.status !== 'in_progress';
    if (filterStatus === 'failed') return matchesSearch && !att.passed && att.status !== 'in_progress';
    if (filterStatus === 'in_progress') return matchesSearch && att.status === 'in_progress';
    return matchesSearch;
  });

  // Calculate high-level summary statistics
  const completedAttempts = attempts.filter((a) => a.status === 'submitted' || a.status === 'expired');
  const passedCount = completedAttempts.filter((a) => a.passed).length;
  const failedCount = completedAttempts.length - passedCount;
  const avgPercentage = completedAttempts.length > 0
    ? (completedAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / completedAttempts.length).toFixed(1)
    : 0;

  return (
    <div className="container" style={{ maxWidth: 1050 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            My Quiz Attempts & Assessment Records
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Review your historical test performance, scores, feedback, and completed assessments.
          </p>
        </div>

        <Link to="/quizzes" className="btn btn-primary">
          <BookOpen size={16} />
          <span>Browse Available Quizzes</span>
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button
            onClick={fetchMyAttempts}
            className="btn btn-outline"
            style={{ marginLeft: 'auto', padding: '4px 10px', fontSize: '0.8rem' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
              {attempts.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginTop: 4 }}>
              Total Attempts
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success)', lineHeight: 1.1 }}>
              {passedCount}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginTop: 4 }}>
              Passed Quizzes
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--danger-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)' }}>
            <XCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--danger)', lineHeight: 1.1 }}>
              {failedCount}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginTop: 4 }}>
              Not Passed
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#b45309', lineHeight: 1.1 }}>
              {avgPercentage}%
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginTop: 4 }}>
              Average Score
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 38 }}
            placeholder="Search attempts by quiz title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'passed', label: 'Passed' },
            { id: 'failed', label: 'Not Passed' },
            { id: 'in_progress', label: 'In Progress' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`btn ${filterStatus === tab.id ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Attempts List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Loading your assessment records...</p>
        </div>
      ) : filteredAttempts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-main)' }}>
            No Assessment Attempts Found
          </h3>
          <p style={{ maxWidth: 450, margin: '0 auto 20px', fontSize: '0.9rem' }}>
            {searchQuery
              ? 'No attempts match your search keyword. Try clearing your query.'
              : 'You have not taken any quizzes yet. Explore the course-ware catalog to take your first assessment.'}
          </p>
          <Link to="/quizzes" className="btn btn-primary">
            Explore Quizzes
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredAttempts.map((att) => {
            const quizTitle = att.quiz?.title || 'Quiz Assessment';
            const isInProgress = att.status === 'in_progress';
            const isPassed = att.passed;

            return (
              <div
                key={att._id}
                className="card"
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16,
                  borderLeft: `5px solid ${
                    isInProgress
                      ? '#3b82f6'
                      : isPassed
                      ? 'var(--success)'
                      : 'var(--danger)'
                  }`
                }}
              >
                {/* Left: Quiz Info */}
                <div style={{ flex: '1 1 300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span
                      className="badge"
                      style={{
                        background: isInProgress
                          ? '#dbeafe'
                          : isPassed
                          ? 'var(--success-light)'
                          : 'var(--danger-light)',
                        color: isInProgress
                          ? '#1e40af'
                          : isPassed
                          ? '#065f46'
                          : '#991b1b',
                        fontSize: '0.75rem'
                      }}
                    >
                      {isInProgress ? 'IN PROGRESS' : isPassed ? 'PASSED' : 'NOT PASSED'}
                    </span>

                    {att.attemptNumber && (
                      <span className="badge" style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.75rem' }}>
                        Attempt #{att.attemptNumber}
                      </span>
                    )}

                    {att.timeExpired && (
                      <span className="badge" style={{ background: '#fef2f2', color: '#991b1b', fontSize: '0.75rem' }}>
                        Time Expired
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                    {quizTitle}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.825rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={14} />
                      <span>Started: {formatDate(att.startedAt)}</span>
                    </div>
                    {att.submittedAt && (
                      <div>Submitted: {formatDate(att.submittedAt)}</div>
                    )}
                    {att.quiz?.duration && (
                      <div>Duration: {att.quiz.duration} mins</div>
                    )}
                  </div>
                </div>

                {/* Middle: Score Summary (if completed) */}
                {!isInProgress ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '0 16px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          fontSize: '1.75rem',
                          fontWeight: 800,
                          color: isPassed ? 'var(--success)' : 'var(--danger)',
                          lineHeight: 1.1
                        }}
                      >
                        {att.percentage}%
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginTop: 2 }}>
                        Final Score
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>
                        {att.score} / {att.totalPossibleMarks || att.quiz?.totalMarks || 0}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginTop: 2 }}>
                        Marks Earned
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '0 16px', color: '#1e40af', fontSize: '0.9rem', fontWeight: 600 }}>
                    In progress — answers pending submission
                  </div>
                )}

                {/* Right: Action Button */}
                <div>
                  {isInProgress ? (
                    <Link
                      to={`/quizzes/${att.quiz?._id || att.quiz}/attempt`}
                      className="btn btn-primary"
                      style={{ padding: '10px 18px', fontSize: '0.9rem' }}
                    >
                      <RotateCcw size={16} />
                      <span>Resume Attempt</span>
                    </Link>
                  ) : (
                    <Link
                      to={`/attempts/${att._id}/result`}
                      className="btn btn-outline"
                      style={{ padding: '10px 18px', fontSize: '0.9rem' }}
                    >
                      <span>View Results & Review</span>
                      <ArrowRight size={16} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAttemptsPage;
