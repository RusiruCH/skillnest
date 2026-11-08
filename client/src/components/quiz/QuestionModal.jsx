import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const QuestionModal = ({ isOpen, onClose, onSave, editingQuestion = null }) => {
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);
  const [marks, setMarks] = useState(1);
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingQuestion) {
      setQuestionText(editingQuestion.questionText || '');
      const optTexts = editingQuestion.options.map((o) => (typeof o === 'string' ? o : o.text));
      setOptions(optTexts);

      // Find index of editingQuestion.correctOptionId
      let correctIdx = 0;
      if (editingQuestion.correctOptionId && editingQuestion.options) {
        const foundIdx = editingQuestion.options.findIndex(
          (o) => o._id === editingQuestion.correctOptionId
        );
        if (foundIdx !== -1) correctIdx = foundIdx;
      }
      setCorrectOptionIndex(correctIdx);
      setMarks(editingQuestion.marks || 1);
      setExplanation(editingQuestion.explanation || '');
    } else {
      setQuestionText('');
      setOptions(['', '']);
      setCorrectOptionIndex(0);
      setMarks(1);
      setExplanation('');
    }
    setError('');
  }, [editingQuestion, isOpen]);

  if (!isOpen) return null;

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOption = () => {
    if (options.length >= 6) {
      setError('A question cannot have more than 6 options');
      return;
    }
    setOptions([...options, '']);
    setError('');
  };

  const removeOption = (index) => {
    if (options.length <= 2) {
      setError('A question must have at least 2 options');
      return;
    }
    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);
    if (correctOptionIndex >= updated.length) {
      setCorrectOptionIndex(0);
    }
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!questionText.trim()) {
      setError('Question text is required');
      return;
    }

    if (options.length < 2 || options.length > 6) {
      setError('Please provide between 2 and 6 options');
      return;
    }

    const hasEmptyOption = options.some((opt) => !opt.trim());
    if (hasEmptyOption) {
      setError('All option fields must have text');
      return;
    }

    if (correctOptionIndex < 0 || correctOptionIndex >= options.length) {
      setError('Please designate one option as the correct answer');
      return;
    }

    onSave({
      questionText: questionText.trim(),
      options: options.map((opt) => ({ text: opt.trim() })),
      correctOptionIndex,
      marks: Number(marks) || 1,
      explanation: explanation.trim()
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            {editingQuestion ? 'Edit Question' : 'Add Multiple Choice Question'}
          </h3>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Question Text *</label>
            <textarea
              className="form-textarea"
              placeholder="Enter your question here..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label className="form-label" style={{ margin: 0 }}>
                Answer Options (Select the correct one) *
              </label>
              <button
                type="button"
                onClick={addOption}
                className="btn btn-outline"
                style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                disabled={options.length >= 6}
              >
                <Plus size={14} /> Add Option
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {options.map((opt, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input
                    type="radio"
                    name="correct-option"
                    checked={correctOptionIndex === idx}
                    onChange={() => setCorrectOptionIndex(idx)}
                    title="Mark as correct answer"
                    className="option-radio"
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder={`Option ${idx + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    required
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      style={{ color: 'var(--danger)', padding: 6 }}
                      title="Remove Option"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
              Click the radio circle next to the option that is the correct answer.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Marks Allocation *</label>
              <input
                type="number"
                min="1"
                max="100"
                className="form-input"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Explanation (Optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Why is this answer correct? (Displayed to learners upon submission review)"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={2}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingQuestion ? 'Update Question' : 'Save Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionModal;
