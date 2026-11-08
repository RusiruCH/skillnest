import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Award, CheckCircle, XCircle, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';
import apiClient from '../../api/apiClient';
import QuestionItem from '../../components/quiz/QuestionItem';

const QuizResultPage = () => {
  const { id: attemptId } = useParams();
  const location = useLocation();

  const [attempt, setAttempt] = useState(location.state?.attempt || null);
  const [quiz, setQuiz] = useState(location.state?.quiz || null);
  const [questionsReview, setQuestionsReview] = useState(location.state?.questionsReview || []);
  const [loading, setLoading] = useState(!location.state?.attempt);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!attempt || questionsReview.length === 0) {
      const fetchAttemptResult = async () => {
        try {
          setLoading(true);
          setError('');
          const res = await apiClient.get(`/attempts/${attemptId}`);
          if (res.data.success) {
            setAttempt(res.data.data.attempt);
            setQuiz(res.data.data.attempt.quiz);
            setQuestionsReview(res.data.data.questionsReview || []);
          }
        } catch (err) {
          setError(err.message || 'Failed to load attempt result');
        } finally {
          setLoading(false);
        }
      };

      fetchAttemptResult();
    }
  }, [attemptId, attempt, questionsReview.length]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Calculating score breakdown...</p>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="container" style={{ maxWidth: 700 }}>
        <div className="alert alert-danger">
          <AlertTriangle size={18} />
          <span>{error || 'Attempt result not found'}</span>
        </div>
        <Link to="/quizzes" className="btn btn-secondary">
          <ArrowLeft size={16} /> Back to Quizzes
        </Link>
      </div>
    );
  }

  const passed = attempt.passed;
  const percentage = attempt.percentage ?? 0;
  const score = attempt.score ?? 0;
  const total = attempt.totalPossibleMarks ?? 0;

  return (
    <div className="container" style={{ maxWidth: 850 }}>
      <Link to="/quizzes" className="btn btn-secondary" style={{ marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back to Quizzes
      </Link>

      {/* Score Card Header */}
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '40px 24px',
          marginBottom: 28,
          borderTop: `6px solid ${passed ? 'var(--success)' : 'var(--danger)'}`
        }}
      >
        <div style={{ display: 'inline-flex', padding: 16, borderRadius: '50%', background: passed ? 'var(--success-light)' : 'var(--danger-light)', marginBottom: 16 }}>
          {passed ? (
            <CheckCircle size={48} color="var(--success)" />
          ) : (
            <XCircle size={48} color="var(--danger)" />
          )}
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 6 }}>
          {passed ? 'Assessment Passed!' : 'Assessment Not Passed'}
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: 24 }}>
          {quiz?.title || 'Quiz Assessment'}
        </p>

        {attempt.timeExpired && (
          <div className="alert alert-danger" style={{ maxWidth: 500, margin: '0 auto 20px', display: 'inline-flex' }}>
            <Clock size={16} />
            <span>Time limit was exceeded during this attempt.</span>
          </div>
        )}

        {/* Score Statistics */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', marginTop: 12 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: passed ? 'var(--success)' : 'var(--danger)' }}>
              {percentage}%
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Your Score
            </div>
          </div>

          <div style={{ width: 1, background: 'var(--border)' }} />

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {score} / {total}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Marks Earned
            </div>
          </div>

          <div style={{ width: 1, background: 'var(--border)' }} />

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {quiz?.passMark || 50}%
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Passing Threshold
            </div>
          </div>
        </div>
      </div>

      {/* Review Section */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 8 }}>
          Answer Review & Explanations
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
          Review the questions below to inspect your selections, the correct answers, and feedback.
        </p>

        {questionsReview.map((q, idx) => (
          <QuestionItem
            key={q._id}
            question={{
              _id: q._id,
              questionText: q.questionText,
              options: q.options,
              correctOptionId: q.correctOptionId,
              marks: q.marks,
              explanation: q.explanation
            }}
            index={idx}
            mode="review"
            selectedOptionId={q.userSelectedOptionId}
          />
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 32, marginBottom: 40 }}>
        <Link to="/quizzes" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '1rem' }}>
          Return to Quizzes
        </Link>
      </div>
    </div>
  );
};

export default QuizResultPage;
