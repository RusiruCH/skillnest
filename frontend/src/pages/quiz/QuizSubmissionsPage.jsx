import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, Award, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import apiClient from '../../api/apiClient';

const QuizSubmissionsPage = () => {
  const { id: quizId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await apiClient.get(`/quizzes/${quizId}/attempts`);
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load quiz submissions');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [quizId]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading student submissions...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container" style={{ maxWidth: 700 }}>
        <div className="alert alert-danger">{error || 'Submissions not found'}</div>
        <Link to="/quizzes" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Quizzes
        </Link>
      </div>
    );
  }

  const { quiz, stats, submissions } = data;

  return (
    <div className="container" style={{ maxWidth: 1000 }}>
      <Link to="/quizzes" className="btn btn-secondary" style={{ marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back to Quizzes
      </Link>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{quiz.title} – Student Submissions</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
          Pass Mark: {quiz.passMark}% • Total Marks: {quiz.totalMarks}
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 12, borderRadius: 8, background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.totalSubmissions}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Submissions</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 12, borderRadius: 8, background: 'var(--success-light)', color: 'var(--success)' }}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.passRate}%</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Pass Rate ({stats.passedCount} / {stats.totalSubmissions})
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 12, borderRadius: 8, background: '#fef3c7', color: '#b45309' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stats.avgPercentage}%</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Average Score ({stats.avgScore} pts)
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '1.1rem' }}>
          Completed Attempts ({submissions.length})
        </div>

        {submissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            No students have attempted this quiz yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 20px' }}>Learner</th>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Score</th>
                  <th style={{ padding: '12px 16px' }}>Percentage</th>
                  <th style={{ padding: '12px 20px' }}>Result</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 600 }}>
                      <div>{sub.learner?.name || 'Anonymous Student'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                        {sub.learner?.email}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        className="badge"
                        style={{
                          background: sub.status === 'submitted' ? 'var(--success-light)' : '#fef2f2',
                          color: sub.status === 'submitted' ? '#065f46' : '#991b1b',
                          textTransform: 'capitalize'
                        }}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                      {sub.score} / {sub.totalPossibleMarks}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                      {sub.percentage}%
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {sub.passed ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--success)', fontWeight: 700 }}>
                          <CheckCircle size={16} /> PASS
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--danger)', fontWeight: 700 }}>
                          <XCircle size={16} /> FAIL
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizSubmissionsPage;
