import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';

const QuizForm = ({ initialData = {}, onSubmit, isSubmitting = false }) => {
  const formatDatetimeForInput = (dateVal) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // Normalize courseId: if it's a populated object, extract _id string
  const normalizeCourseId = (val) => {
    if (!val) return '';
    if (typeof val === 'object' && val._id) return val._id;
    return String(val);
  };

  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    instructions: initialData.instructions || 'Read each question carefully and select the best answer option. Submit before the timer expires.',
    courseId: normalizeCourseId(initialData.courseId),
    duration: initialData.duration || 30,
    passMark: initialData.passMark || 50,
    maxAttempts: initialData.maxAttempts || 1,
    availableFrom: formatDatetimeForInput(initialData.availableFrom || new Date()),
    availableUntil: formatDatetimeForInput(
      initialData.availableUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    )
  });

  const [error, setError] = useState('');
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // Fetch instructor's own courses for the dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCoursesLoading(true);
        const res = await apiClient.get('/courses/my-courses');
        if (res.data.success) {
          setCourses(res.data.courses || res.data.data || []);
        }
      } catch {
        // Courses API unavailable — degrade gracefully (manual ID entry fallback)
        setCourses([]);
      } finally {
        setCoursesLoading(false);
      }
    };
    fetchCourses();
  }, []);

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

    if (!formData.maxAttempts || Number(formData.maxAttempts) < 1 || Number(formData.maxAttempts) > 20) {
      setError('Maximum attempts must be between 1 and 20');
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
      passMark: Number(formData.passMark),
      maxAttempts: Number(formData.maxAttempts || 1)
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
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

        <div className="form-group">
          <label className="form-label" htmlFor="maxAttempts">
            Max Allowed Attempts *
          </label>
          <input
            id="maxAttempts"
            name="maxAttempts"
            type="number"
            min="1"
            max="20"
            className="form-input"
            value={formData.maxAttempts}
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
          Linked Course (Optional)
        </label>
        {coursesLoading ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading courses…</p>
        ) : courses.length > 0 ? (
          <select
            id="courseId"
            name="courseId"
            className="form-input"
            value={formData.courseId}
            onChange={handleChange}
          >
            <option value="">— No linked course (standalone quiz) —</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}{c.category ? ` · ${c.category}` : ''}
              </option>
            ))}
          </select>
        ) : (
          <input
            id="courseId"
            name="courseId"
            type="text"
            className="form-input"
            placeholder="MongoDB Course ObjectId (leave empty if standalone)"
            value={formData.courseId}
            onChange={handleChange}
          />
        )}
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
          Linking a quiz to a course lets learners find it from the course page.
        </p>
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
