import React from 'react';
import { CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react';

const QuestionItem = ({
  question,
  index,
  mode = 'attempt', // 'attempt' | 'review' | 'manage'
  selectedOptionId = null,
  onSelectOption = null,
  onEdit = null,
  onDelete = null
}) => {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
          <span style={{ color: 'var(--primary)', marginRight: 6 }}>Q{index + 1}.</span>
          {question.questionText}
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>
            {question.marks || 1} mark{question.marks > 1 ? 's' : ''}
          </span>
          {mode === 'manage' && (
            <>
              <button
                onClick={() => onEdit(question)}
                className="btn btn-outline"
                style={{ padding: '4px 8px' }}
                title="Edit Question"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={() => onDelete(question._id)}
                className="btn btn-outline"
                style={{ color: 'var(--danger)', padding: '4px 8px' }}
                title="Delete Question"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
        {question.options.map((opt) => {
          const isSelected = selectedOptionId === opt._id;

          if (mode === 'attempt') {
            return (
              <label
                key={opt._id}
                className={`option-label ${isSelected ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name={`question-${question._id}`}
                  value={opt._id}
                  checked={isSelected}
                  onChange={() => onSelectOption && onSelectOption(question._id, opt._id)}
                  className="option-radio"
                />
                <span style={{ fontSize: '0.95rem' }}>{opt.text}</span>
              </label>
            );
          }

          if (mode === 'review') {
            const isCorrectOption = question.correctOptionId === opt._id;
            let reviewStyle = {
              border: '1.5px solid var(--border)',
              borderRadius: 8,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#ffffff'
            };

            if (isCorrectOption) {
              reviewStyle.borderColor = '#10b981';
              reviewStyle.background = '#ecfdf5';
            } else if (isSelected && !isCorrectOption) {
              reviewStyle.borderColor = '#ef4444';
              reviewStyle.background = '#fef2f2';
            }

            return (
              <div key={opt._id} style={reviewStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '0.95rem' }}>{opt.text}</span>
                  {isSelected && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isCorrectOption ? '#065f46' : '#991b1b' }}>
                      (Your choice)
                    </span>
                  )}
                </div>
                {isCorrectOption && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                    <CheckCircle size={16} /> Correct
                  </span>
                )}
                {isSelected && !isCorrectOption && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>
                    <XCircle size={16} /> Incorrect
                  </span>
                )}
              </div>
            );
          }

          // mode === 'manage'
          const isCorrect = question.correctOptionId === opt._id;
          return (
            <div
              key={opt._id}
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                background: isCorrect ? '#ecfdf5' : '#f8fafc',
                border: isCorrect ? '1.5px solid #a7f3d0' : '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span style={{ fontSize: '0.9rem' }}>{opt.text}</span>
              {isCorrect && (
                <span style={{ color: '#059669', fontSize: '0.75rem', fontWeight: 600 }}>
                  ✓ Correct Answer
                </span>
              )}
            </div>
          );
        })}
      </div>

      {mode === 'review' && question.explanation && (
        <div style={{ marginTop: 14, padding: 12, borderRadius: 6, background: '#f8fafc', borderLeft: '4px solid var(--primary)', fontSize: '0.875rem' }}>
          <strong>Explanation:</strong> {question.explanation}
        </div>
      )}
    </div>
  );
};

export default QuestionItem;
