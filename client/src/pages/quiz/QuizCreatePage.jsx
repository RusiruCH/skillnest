import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import apiClient from '../../api/apiClient';
import QuizForm from '../../components/quiz/QuizForm';

const QuizCreatePage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (formData) => {
    try {
      setSubmitting(true);
      setError('');
      const res = await apiClient.post('/quizzes', formData);
      if (res.data.success) {
        // Redirect to edit page so instructor can immediately add questions
        navigate(`/quizzes/${res.data.data._id}/edit`, {
          state: { message: 'Quiz created! Now add multiple choice questions.' }
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to create quiz');
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 800 }}>
      <Link to="/quizzes" className="btn btn-secondary" style={{ marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back to Quizzes
      </Link>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Create New Assessment</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
          Define the title, time limits, passing score, and availability schedule for your assessment.
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <QuizForm onSubmit={handleCreate} isSubmitting={submitting} />
    </div>
  );
};

export default QuizCreatePage;
