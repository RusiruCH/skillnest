import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Send, AlertTriangle, CheckSquare } from 'lucide-react';
import apiClient from '../../api/apiClient';
import QuestionItem from '../../components/quiz/QuestionItem';
import CountdownTimer from '../../components/quiz/CountdownTimer';

const QuizAttemptPage = () => {
  const { id: quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [attempt, setAttempt] = useState(location.state?.attempt || null);
  const [quiz, setQuiz] = useState(location.state?.quiz || null);
  const [questions, setQuestions] = useState(location.state?.questions || []);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: selectedOptionId }
  const [loading, setLoading] = useState(!location.state?.attempt);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // If state was not passed via navigation, fetch or start attempt
  useEffect(() => {
    if (!attempt) {
      const initAttempt = async () => {
        try {
          setLoading(true);
          setError('');
          const res = await apiClient.post('/attempts/start', { quizId });
          if (res.data.success) {
            setAttempt(res.data.data.attempt);
            setQuiz(res.data.data.quiz);
            setQuestions(res.data.data.questions || []);

            // Pre-populate any existing answers if resuming
            if (res.data.data.attempt.answers) {
              const existingMap = {};
              res.data.data.attempt.answers.forEach((ans) => {
                if (ans.selectedOptionId) {
                  existingMap[ans.question] = ans.selectedOptionId;
                }
              });
              setSelectedAnswers(existingMap);
            }
          }
        } catch (err) {
          setError(err.message || 'Failed to start or resume quiz attempt');
        } finally {
          setLoading(false);
        }
      };

      initAttempt();
    }
  }, [quizId, attempt]);

  const handleSelectOption = (questionId, optionId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmit = async (forceSubmit = false) => {
    if (submitting) return;

    const answeredCount = Object.keys(selectedAnswers).length;
    const totalCount = questions.length;

    if (!forceSubmit && answeredCount < totalCount) {
      const confirmSubmit = window.confirm(
        `You have answered ${answeredCount} of ${totalCount} questions. Are you sure you want to submit your answers now?`
      );
      if (!confirmSubmit) return;
    }

    try {
      setSubmitting(true);
      setError('');

      const formattedAnswers = Object.entries(selectedAnswers).map(
        ([questionId, optionId]) => ({
          question: questionId,
          selectedOptionId: optionId
        })
      );

      const res = await apiClient.post(`/attempts/${attempt._id}/submit`, {
        answers: formattedAnswers
      });

      if (res.data.success) {
        navigate(`/attempts/${attempt._id}/result`, {
          state: res.data.data
        });
      }
    } catch (err) {
      setError(err.message || 'Submission failed');
      setSubmitting(false);
    }
  };

  const handleTimeExpire = () => {
    alert('Time limit has expired! Submitting your answers automatically.');
    handleSubmit(true);
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Preparing quiz session...</p>
      </div>
    );
  }

  if (error && !attempt) {
    return (
      <div className="container" style={{ maxWidth: 700 }}>
        <div className="alert alert-danger">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  return (
    <div className="container" style={{ maxWidth: 850 }}>
      {/* Sticky Top Bar with Title, Progress and Countdown */}
      <div
        className="card"
        style={{
          position: 'sticky',
          top: 10,
          zIndex: 40,
          marginBottom: 20,
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{quiz?.title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>
            <CheckSquare size={14} />
            <span>Answered {answeredCount} of {questions.length} questions</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <CountdownTimer
            startedAt={attempt?.startedAt}
            durationMinutes={quiz?.duration}
            onTimeExpire={handleTimeExpire}
          />
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="btn btn-primary"
            style={{ padding: '8px 16px' }}
          >
            <Send size={16} />
            <span>{submitting ? 'Submitting...' : 'Submit Quiz'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: 6, background: 'var(--border)', borderRadius: 3, marginBottom: 24, overflow: 'hidden' }}>
        <div
          style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: 'var(--primary)',
            transition: 'width 0.3s ease'
          }}
        />
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Question List */}
      <div>
        {questions.map((q, idx) => (
          <QuestionItem
            key={q._id}
            question={q}
            index={idx}
            mode="attempt"
            selectedOptionId={selectedAnswers[q._id]}
            onSelectOption={handleSelectOption}
          />
        ))}
      </div>

      {/* Bottom Submit Bar */}
      <div className="card" style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Review all answers before submitting. You cannot re-attempt this quiz after submission.
        </span>
        <button
          onClick={() => handleSubmit(false)}
          disabled={submitting}
          className="btn btn-primary"
          style={{ padding: '12px 24px', fontSize: '1rem' }}
        >
          <Send size={18} />
          <span>{submitting ? 'Submitting Assessment...' : 'Submit Answers'}</span>
        </button>
      </div>
    </div>
  );
};

export default QuizAttemptPage;
