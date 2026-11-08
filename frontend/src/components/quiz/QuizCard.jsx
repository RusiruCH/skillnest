import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Award, Calendar, Users, Edit3, Trash2, ArrowRight } from 'lucide-react';

const QuizCard = ({ quiz, userRole, onDelete, onTogglePublish }) => {
  const isInstructorOrAdmin = userRole === 'instructor' || userRole === 'administrator';

  const getStatusBadge = () => {
    switch (quiz.status) {
      case 'active':
        return <span className="badge badge-active">Active</span>;
      case 'upcoming':
        return <span className="badge badge-upcoming">Upcoming</span>;
      case 'closed':
        return <span className="badge badge-closed">Closed</span>;
      default:
        return <span className="badge badge-draft">Draft</span>;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        {getStatusBadge()}
        {isInstructorOrAdmin && (
          <button
            onClick={() => onTogglePublish(quiz._id)}
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '4px 8px',
              borderRadius: 4,
              border: '1px solid var(--border)',
              background: quiz.isPublished ? '#f1f5f9' : '#e0e7ff',
              color: quiz.isPublished ? '#475569' : '#3730a3'
            }}
          >
            {quiz.isPublished ? 'Unpublish' : 'Publish'}
          </button>
        )}
      </div>

      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-main)' }}>
        {quiz.title}
      </h3>

      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 16, flex: 1 }}>
        {quiz.description || 'No description provided.'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={15} />
          <span>Duration: <strong>{quiz.duration} mins</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Award size={15} />
          <span>Pass Mark: <strong>{quiz.passMark}%</strong> ({quiz.totalMarks} total marks)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={15} />
          <span>Available: {formatDate(quiz.availableFrom)} – {formatDate(quiz.availableUntil)}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
        {isInstructorOrAdmin ? (
          <>
            <Link
              to={`/quizzes/${quiz._id}/edit`}
              className="btn btn-outline"
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem' }}
            >
              <Edit3 size={14} /> Edit
            </Link>
            <Link
              to={`/quizzes/${quiz._id}/submissions`}
              className="btn btn-secondary"
              style={{ padding: '8px 12px', fontSize: '0.8rem' }}
              title="View Submissions"
            >
              <Users size={14} />
            </Link>
            <button
              onClick={() => onDelete(quiz._id, quiz.title)}
              className="btn btn-outline"
              style={{ color: 'var(--danger)', padding: '8px 12px' }}
              title="Delete Quiz"
            >
              <Trash2 size={14} />
            </button>
          </>
        ) : (
          <Link
            to={`/quizzes/${quiz._id}`}
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px 14px' }}
          >
            <span>View Quiz Details</span>
            <ArrowRight size={15} />
          </Link>
        )}
      </div>
    </div>
  );
};

export default QuizCard;
