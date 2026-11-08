import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Users, Award, TrendingUp, CheckCircle, XCircle,
  TrendingDown, BarChart2, Search
} from 'lucide-react';
import apiClient from '../../api/apiClient';

const QuizSubmissionsPage = () => {
  const { id: quizId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'passed' | 'failed'

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

  // Filter submissions based on search + status
  const filteredSubmissions = submissions.filter((sub) => {
    const name = (sub.learner?.name || '').toLowerCase();
    const email = (sub.learner?.email || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || name.includes(q) || email.includes(q);
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'passed' && sub.passed) ||
      (filterStatus === 'failed' && !sub.passed);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container" style={{ maxWidth: 1050 }}>
      <Link to="/quizzes" className="btn btn-secondary" style={{ marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back to Quizzes
      </Link>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{quiz.title} – Analytics</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
          Pass Mark: {quiz.passMark}% • Total Marks: {quiz.totalMarks} •{' '}
          <span style={{ color: '#6b7280', fontStyle: 'italic' }}>
            Instructor test attempts are excluded from all statistics
          </span>
        </p>
      </div>

      {/* ── KPI Row 1: Submissions, Pass Rate, Avg Score ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
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

      {/* ── KPI Row 2: Highest / Lowest Marks ── */}
      {stats.highestScore !== null && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ padding: 12, borderRadius: 8, background: '#ecfdf5', color: '#059669' }}>
              <BarChart2 size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669' }}>
                {stats.highestScore} <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ {quiz.totalMarks}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Highest Score ({stats.highestPercentage}%)
              </div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ padding: 12, borderRadius: 8, background: '#fef2f2', color: '#dc2626' }}>
              <TrendingDown size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626' }}>
                {stats.lowestScore} <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ {quiz.totalMarks}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Lowest Score ({stats.lowestPercentage}%)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Search + Filter Bar ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search learner name or email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'passed', 'failed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`btn ${filterStatus === f ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Submissions Table ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Individual Learner Performance</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>
            Showing {filteredSubmissions.length} of {submissions.length} record{submissions.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filteredSubmissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            {submissions.length === 0
              ? 'No students have attempted this quiz yet.'
              : 'No results match your search or filter.'}
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
                  <th style={{ padding: '12px 16px' }}>Result</th>
                  <th style={{ padding: '12px 20px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((sub) => (
                  <tr key={sub._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 600 }}>
                      <div>{sub.learner?.name || 'Anonymous Student'}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                        {sub.learner?.email}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                      <div>{new Date(sub.createdAt).toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
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
                      <span style={{ color: sub.percentage >= quiz.passMark ? '#059669' : '#dc2626' }}>
                        {sub.percentage}%
                      </span>
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
                    <td style={{ padding: '14px 20px' }}>
                      <Link
                        to={`/attempts/${sub._id}/result`}
                        className="btn btn-outline"
                        style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                      >
                        View Review
                      </Link>
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
