import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, BookOpen, AlertCircle } from 'lucide-react';
import apiClient from '../../api/apiClient';
import QuizCard from '../../components/quiz/QuizCard';

const QuizListPage = ({ userRole = 'learner' }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiClient.get('/quizzes');
      if (res.data.success) {
        setQuizzes(res.data.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [userRole]);

  const handleDelete = async (quizId, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"? All questions and attempts will be removed.`)) {
      return;
    }
    try {
      await apiClient.delete(`/quizzes/${quizId}`);
      setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
    } catch (err) {
      alert(err.message || 'Failed to delete quiz');
    }
  };

  const handleTogglePublish = async (quizId) => {
    try {
      const res = await apiClient.patch(`/quizzes/${quizId}/publish`);
      if (res.data.success) {
        setQuizzes((prev) =>
          prev.map((q) => (q._id === quizId ? { ...q, isPublished: res.data.data.isPublished, status: res.data.data.status } : q))
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle publish status');
    }
  };

  const filteredQuizzes = quizzes.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.description && q.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && q.status === statusFilter;
  });

  const isInstructorOrAdmin = userRole === 'instructor' || userRole === 'administrator';

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {isInstructorOrAdmin ? 'Quiz & Assessment Management' : 'Available Quizzes'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            {isInstructorOrAdmin
              ? 'Create, manage, schedule, and grade student assessments'
              : 'Browse scheduled tests, take assessments, and review past performance'}
          </p>
        </div>

        {isInstructorOrAdmin && (
          <Link to="/quizzes/create" className="btn btn-primary">
            <Plus size={18} />
            <span>Create New Quiz</span>
          </Link>
        )}
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 38 }}
            placeholder="Search quizzes by title or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'active', 'upcoming', 'closed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`btn ${statusFilter === status ? 'btn-primary' : 'btn-outline'}`}
              style={{ textTransform: 'capitalize', padding: '8px 14px', fontSize: '0.85rem' }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Loading & Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>Loading quizzes...</div>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-main)' }}>
            No Quizzes Found
          </h3>
          <p style={{ maxWidth: 450, margin: '0 auto 20px', fontSize: '0.9rem' }}>
            {searchQuery
              ? 'No quizzes match your filter criteria. Try adjusting your search term.'
              : isInstructorOrAdmin
              ? 'You have not created any quizzes yet. Get started by clicking "Create New Quiz".'
              : 'There are currently no active quizzes available for you to take.'}
          </p>
          {isInstructorOrAdmin && !searchQuery && (
            <Link to="/quizzes/create" className="btn btn-primary">
              <Plus size={16} /> Create Your First Quiz
            </Link>
          )}
        </div>
      ) : (
        <div className="grid-cards">
          {filteredQuizzes.map((quiz) => (
            <QuizCard
              key={quiz._id}
              quiz={quiz}
              userRole={userRole}
              onDelete={handleDelete}
              onTogglePublish={handleTogglePublish}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizListPage;
