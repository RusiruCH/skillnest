import React, { useState } from 'react';

const QuizForm = ({ initialData = {}, onSubmit, isSubmitting = false }) => {
  const formatDatetimeForInput = (dateVal) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    instructions: initialData.instructions || 'Read each question carefully and select the best answer option. Submit before the timer expires.',
    courseId: initialData.courseId || '',
    duration: initialData.duration || 30,
    passMark: initialData.passMark || 50,
    availableFrom: formatDatetimeForInput(initialData.availableFrom || new Date()),
    availableUntil: formatDatetimeForInput(
      initialData.availableUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    )
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || formData.title.trim().length < 3) {
      setError('Quiz title must be at least 3 characters long');
      return;
    }

    if (!formData.duration || Number(formData.duration) < 1 || Number(formData.duration) > 300) {
      setError('Duration must be between 1 and 300 minutes');
      return;
    }

    if (!formData.passMark || Number(formData.passMark) < 0 || Number(formData.passMark) > 100) {
      setError('Pass mark must be between 0% and 100%');
      return;
    }

    if (!formData.availableFrom || !formData.availableUntil) {
      setError('Please provide both available from and until dates');
      return;
    }

    const start = new Date(formData.availableFrom);
    const end = new Date(formData.availableUntil);

    if (start >= end) {
      setError('Available From date must be earlier than Available Until date');
      return;
    }

    onSubmit({
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      instructions: formData.instructions.trim(),
      courseId: formData.courseId ? formData.courseId : null,
      duration: Number(formData.duration),
      passMark: Number(formData.passMark)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="form-group">
        <label className="form-label" htmlFor="title">
          Quiz Title *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          className="form-input"
          placeholder="e.g. Fullstack React & Node.js Assessment"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          className="form-textarea"
          placeholder="Brief summary of the quiz topic and target audience..."
          value={formData.description}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="instructions">
          Learner Instructions
        </label>
        <textarea
          id="instructions"
          name="instructions"
          className="form-textarea"
          placeholder="Detailed test instructions presented to students before starting..."
          value={formData.instructions}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="form-group">
          <label className="form-label" htmlFor="duration">
            Duration (Minutes) *
          </label>
          <input
            id="duration"
            name="duration"
            type="number"
            min="1"
            max="300"
            className="form-input"
            value={formData.duration}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="passMark">
            Pass Mark Percentage (%) *
          </label>
          <input
            id="passMark"
            name="passMark"
            type="number"
            min="0"
            max="100"
            className="form-input"
            value={formData.passMark}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="form-group">
          <label className="form-label" htmlFor="availableFrom">
            Available From *
          </label>
          <input
            id="availableFrom"
            name="availableFrom"
            type="datetime-local"
            className="form-input"
            value={formData.availableFrom}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="availableUntil">
            Available Until *
          </label>
          <input
            id="availableUntil"
            name="availableUntil"
            type="datetime-local"
            className="form-input"
            value={formData.availableUntil}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="courseId">
          Course ID (Optional - Member 02 Integration)
        </label>
        <input
          id="courseId"
          name="courseId"
          type="text"
          className="form-input"
          placeholder="MongoDB Course ObjectId (leave empty if standalone)"
          value={formData.courseId}
          onChange={handleChange}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving Quiz...' : 'Save Quiz Details'}
        </button>
      </div>
    </form>
  );
};

export default QuizForm;
