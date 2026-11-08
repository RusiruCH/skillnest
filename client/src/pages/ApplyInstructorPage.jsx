import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { applicationAPI } from '../services/adminApi';

function FormField({ label, required, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export default function ApplyInstructorPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null); // existing application status
  const [checkingStatus, setCheckingStatus] = useState(true);

  const [form, setForm] = useState({
    expertiseArea: '',
    qualifications: '',
    experienceYears: '',
    bio: '',
    portfolioUrl: '',
    resumeUrl: '',
    sampleCourseProposal: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');

  // Check if user already applied
  useEffect(() => {
    applicationAPI
      .getMyApplicationStatus()
      .then((res) => {
        if (res.data.data) setStatus(res.data.data.status);
      })
      .catch(() => {}) // 404 means no application yet
      .finally(() => setCheckingStatus(false));
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.expertiseArea.trim()) errs.expertiseArea = 'Expertise area is required.';
    if (!form.qualifications.trim()) errs.qualifications = 'Qualifications are required.';
    if (!form.experienceYears || isNaN(form.experienceYears) || Number(form.experienceYears) < 0)
      errs.experienceYears = 'Please enter a valid number of years.';
    if (!form.bio.trim() || form.bio.trim().length < 50)
      errs.bio = 'Bio must be at least 50 characters.';
    if (!form.sampleCourseProposal.trim())
      errs.sampleCourseProposal = 'Please describe a sample course you would create.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    setServerError('');
    try {
      await applicationAPI.submitApplication({
        ...form,
        experienceYears: Number(form.experienceYears),
      });
      setSubmitted(true);
    } catch (err) {
      setServerError(
        err?.response?.data?.message || 'Submission failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader size={28} className="text-blue-500 animate-spin" />
      </div>
    );
  }

  // Already applied — show status
  if (status || submitted) {
    const displayStatus = submitted ? 'pending' : status;
    const statusConfig = {
      pending: { color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', msg: 'Your application is under review. You will be notified once a decision is made.' },
      approved: { color: 'text-green-600', bg: 'bg-green-50 border-green-200', msg: 'Congratulations! Your instructor application has been approved. You can now create courses.' },
      rejected: { color: 'text-red-600', bg: 'bg-red-50 border-red-200', msg: 'Your application was not approved. Please contact support for more information.' },
    };
    const cfg = statusConfig[displayStatus] || statusConfig.pending;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className={`w-full max-w-md bg-white rounded-2xl shadow-md border p-8 ${cfg.bg}`}>
          <div className="flex flex-col items-center text-center gap-4">
            <CheckCircle size={48} className={cfg.color} />
            <h2 className="text-xl font-bold text-gray-900">Application {submitted ? 'Submitted!' : 'Status'}</h2>
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full border capitalize ${
                displayStatus === 'pending'
                  ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                  : displayStatus === 'approved'
                  ? 'bg-green-100 text-green-700 border-green-200'
                  : 'bg-red-100 text-red-700 border-red-200'
              }`}
            >
              {displayStatus}
            </span>
            <p className="text-sm text-gray-600">{cfg.msg}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-100 mb-4">
            <GraduationCap size={28} className="text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Apply to Become an Instructor</h1>
          <p className="text-sm text-gray-500 mt-2">
            Fill in the form below. Our admin team will review your application.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-5"
        >
          {serverError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              {serverError}
            </div>
          )}

          <FormField label="Expertise Area" required>
            <input
              type="text"
              name="expertiseArea"
              value={form.expertiseArea}
              onChange={handleChange}
              placeholder="e.g. Web Development, Data Science, UI/UX Design"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.expertiseArea ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.expertiseArea && (
              <p className="text-xs text-red-500 mt-1">{errors.expertiseArea}</p>
            )}
          </FormField>

          <FormField label="Qualifications / Certifications" required>
            <input
              type="text"
              name="qualifications"
              value={form.qualifications}
              onChange={handleChange}
              placeholder="e.g. BSc Computer Science, AWS Certified, etc."
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.qualifications ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.qualifications && (
              <p className="text-xs text-red-500 mt-1">{errors.qualifications}</p>
            )}
          </FormField>

          <FormField label="Years of Experience" required>
            <input
              type="number"
              name="experienceYears"
              value={form.experienceYears}
              onChange={handleChange}
              min={0}
              placeholder="e.g. 5"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.experienceYears ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.experienceYears && (
              <p className="text-xs text-red-500 mt-1">{errors.experienceYears}</p>
            )}
          </FormField>

          <FormField
            label="Professional Bio"
            required
            hint="Minimum 50 characters. Tell us about your background and teaching philosophy."
          >
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Share your professional background, teaching experience, and what motivates you to teach..."
              className={`w-full border rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.bio ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            <div className="flex justify-between">
              {errors.bio ? (
                <p className="text-xs text-red-500 mt-1">{errors.bio}</p>
              ) : (
                <span />
              )}
              <span className="text-xs text-gray-400 mt-1">{form.bio.length} chars</span>
            </div>
          </FormField>

          <FormField label="Sample Course Proposal" required hint="Describe a course you would create on the platform.">
            <textarea
              name="sampleCourseProposal"
              value={form.sampleCourseProposal}
              onChange={handleChange}
              rows={4}
              placeholder="e.g. Title: React for Beginners — A 10-module course covering JSX, hooks, state management..."
              className={`w-full border rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.sampleCourseProposal ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.sampleCourseProposal && (
              <p className="text-xs text-red-500 mt-1">{errors.sampleCourseProposal}</p>
            )}
          </FormField>

          <FormField label="Portfolio URL" hint="Optional — link to your portfolio, GitHub, or personal website.">
            <input
              type="url"
              name="portfolioUrl"
              value={form.portfolioUrl}
              onChange={handleChange}
              placeholder="https://yourportfolio.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField label="Resume / CV URL" hint="Optional — a publicly accessible link to your resume.">
            <input
              type="url"
              name="resumeUrl"
              value={form.resumeUrl}
              onChange={handleChange}
              placeholder="https://drive.google.com/..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader size={16} className="animate-spin" /> Submitting…
                </span>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
