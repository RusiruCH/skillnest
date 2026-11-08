import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle, HelpCircle } from 'lucide-react';
import apiClient from '../../api/apiClient';
import QuizForm from '../../components/quiz/QuizForm';
import QuestionItem from '../../components/quiz/QuestionItem';
import QuestionModal from '../../components/quiz/QuestionModal';

const QuizEditPage = () => {
  const { id } = useParams();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('questions'); // 'questions' | 'settings'

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const fetchQuizAndQuestions = async () => {
    try {
      setLoading(true);
      setError('');
      const [quizRes, questionsRes] = await Promise.all([
        apiClient.get(`/quizzes/${id}`),
        apiClient.get(`/quizzes/${id}/questions`)
      ]);

      if (quizRes.data.success) {
        setQuiz(quizRes.data.data);
      }
      if (questionsRes.data.success) {
        setQuestions(questionsRes.data.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizAndQuestions();
  }, [id]);

  const handleUpdateQuiz = async (formData) => {
    try {
      setError('');
      setSuccessMsg('');
      const res = await apiClient.put(`/quizzes/${id}`, formData);
      if (res.data.success) {
        setQuiz(res.data.data);
        setSuccessMsg('Quiz settings updated successfully!');
      }
    } catch (err) {
      setError(err.message || 'Failed to update quiz settings');
    }
  };

  const handleTogglePublish = async () => {
    try {
      setError('');
      const res = await apiClient.patch(`/quizzes/${id}/publish`);
      if (res.data.success) {
        setQuiz((prev) => ({
          ...prev,
          isPublished: res.data.data.isPublished,
          status: res.data.data.status
        }));
        setSuccessMsg(`Quiz ${res.data.data.isPublished ? 'published' : 'unpublished'} successfully!`);
      }
    } catch (err) {
      setError(err.message || 'Failed to toggle publish state');
    }
  };

  const handleSaveQuestion = async (questionData) => {
    try {
      setError('');
      if (editingQuestion) {
        // Update question
        const res = await apiClient.put(
          `/quizzes/${id}/questions/${editingQuestion._id}`,
          questionData
        );
        if (res.data.success) {
          setQuestions((prev) =>
            prev.map((q) => (q._id === editingQuestion._id ? res.data.data : q))
          );
          setQuiz((prev) => ({ ...prev, totalMarks: res.data.quizTotalMarks }));
          setIsModalOpen(false);
          setEditingQuestion(null);
          setSuccessMsg('Question updated successfully!');
        }
      } else {
        // Create question
        const res = await apiClient.post(`/quizzes/${id}/questions`, questionData);
        if (res.data.success) {
          setQuestions((prev) => [...prev, res.data.data]);
          setQuiz((prev) => ({ ...prev, totalMarks: res.data.quizTotalMarks }));
          setIsModalOpen(false);
          setSuccessMsg('Question added successfully!');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to save question');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      setError('');
      const res = await apiClient.delete(`/quizzes/${id}/questions/${questionId}`);
      if (res.data.success) {
        setQuestions((prev) => prev.filter((q) => q._id !== questionId));
        setQuiz((prev) => ({ ...prev, totalMarks: res.data.quizTotalMarks }));
        setSuccessMsg('Question deleted successfully!');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete question');
    }
  };

  const openAddModal = () => {
    setEditingQuestion(null);
    setIsModalOpen(true);
  };

  const openEditModal = (question) => {
    setEditingQuestion(question);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading editor...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container" style={{ maxWidth: 700 }}>
        <div className="alert alert-danger">{error || 'Quiz not found'}</div>
        <Link to="/quizzes" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Quizzes
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 850 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Link to="/quizzes" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Quizzes
        </Link>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={handleTogglePublish}
            className={`btn ${quiz.isPublished ? 'btn-outline' : 'btn-primary'}`}
          >
            {quiz.isPublished ? 'Unpublish Quiz' : 'Publish Quiz'}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{quiz.title}</h1>
          <span
            className="badge"
            style={{
              background: quiz.isPublished ? 'var(--success-light)' : '#fef3c7',
              color: quiz.isPublished ? '#065f46' : '#78350f'
            }}
          >
            {quiz.isPublished ? 'PUBLISHED' : 'DRAFT'}
          </span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
          {questions.length} questions • {quiz.totalMarks} total marks • {quiz.duration} mins • pass mark {quiz.passMark}%
        </p>
      </div>

      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 24, gap: 12 }}>
        <button
          onClick={() => setActiveTab('questions')}
          style={{
            padding: '10px 16px',
            fontWeight: 600,
            fontSize: '0.95rem',
            borderBottom: activeTab === 'questions' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'questions' ? 'var(--primary)' : 'var(--text-muted)'
          }}
        >
          Questions ({questions.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          style={{
            padding: '10px 16px',
            fontWeight: 600,
            fontSize: '0.95rem',
            borderBottom: activeTab === 'settings' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'settings' ? 'var(--primary)' : 'var(--text-muted)'
          }}
        >
          Quiz Settings & Timing
        </button>
      </div>

      {/* Tab: Questions */}
      {activeTab === 'questions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Question Bank</h3>
            <button onClick={openAddModal} className="btn btn-primary" style={{ padding: '8px 14px' }}>
              <Plus size={16} /> Add MCQ Question
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <HelpCircle size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <h4 style={{ fontWeight: 600, marginBottom: 6 }}>No Questions Added Yet</h4>
              <p style={{ fontSize: '0.875rem', marginBottom: 16 }}>
                Click "Add MCQ Question" to create your first question with 2 to 6 options.
              </p>
              <button onClick={openAddModal} className="btn btn-primary">
                <Plus size={16} /> Add First Question
              </button>
            </div>
          ) : (
            <div>
              {questions.map((q, idx) => (
                <QuestionItem
                  key={q._id}
                  question={q}
                  index={idx}
                  mode="manage"
                  onEdit={openEditModal}
                  onDelete={handleDeleteQuestion}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Settings */}
      {activeTab === 'settings' && (
        <QuizForm initialData={quiz} onSubmit={handleUpdateQuiz} />
      )}

      {/* Add / Edit Question Modal */}
      <QuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveQuestion}
        editingQuestion={editingQuestion}
      />
    </div>
  );
};

export default QuizEditPage;
