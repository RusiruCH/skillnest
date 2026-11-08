import { X, User, Briefcase, BookOpen, Calendar, ExternalLink } from 'lucide-react';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  approved: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
};

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-2.5 border-b border-gray-100 last:border-0">
      <span className="w-44 text-xs font-medium text-gray-500 uppercase tracking-wide shrink-0">
        {label}
      </span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  );
}

export default function ApplicationDetailModal({ isOpen, onClose, application }) {
  if (!isOpen || !application) return null;

  const {
    applicant,
    expertiseArea,
    qualifications,
    experienceYears,
    bio,
    portfolioUrl,
    resumeUrl,
    sampleCourseProposal,
    status,
    remarks,
    reviewedBy,
    reviewDate,
    submittedAt,
  } = application;

  const statusClass = statusColors[status] || statusColors.pending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
              <User size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                {applicant?.name || 'Applicant'}
              </h2>
              <p className="text-xs text-gray-500">{applicant?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border capitalize ${statusClass}`}>
              {status}
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
          {/* Application Details */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Briefcase size={15} className="text-blue-500" />
              Application Details
            </h3>
            <div className="bg-gray-50 rounded-lg px-4">
              <InfoRow label="Expertise Area" value={expertiseArea} />
              <InfoRow label="Experience (Years)" value={experienceYears?.toString()} />
              <InfoRow label="Qualifications" value={qualifications} />
              <InfoRow label="Submitted" value={submittedAt ? new Date(submittedAt).toLocaleDateString() : ''} />
            </div>
          </section>

          {/* Bio */}
          {bio && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <User size={15} className="text-blue-500" />
                Professional Bio
              </h3>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4 leading-relaxed">{bio}</p>
            </section>
          )}

          {/* Course Proposal */}
          {sampleCourseProposal && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <BookOpen size={15} className="text-blue-500" />
                Sample Course Proposal
              </h3>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4 leading-relaxed whitespace-pre-wrap">
                {sampleCourseProposal}
              </p>
            </section>
          )}

          {/* Links */}
          {(portfolioUrl || resumeUrl) && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <ExternalLink size={15} className="text-blue-500" />
                Links
              </h3>
              <div className="flex flex-wrap gap-3">
                {portfolioUrl && (
                  <a
                    href={portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                  >
                    <ExternalLink size={13} /> Portfolio
                  </a>
                )}
                {resumeUrl && (
                  <a
                    href={resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                  >
                    <ExternalLink size={13} /> Resume / CV
                  </a>
                )}
              </div>
            </section>
          )}

          {/* Review Info */}
          {(remarks || reviewedBy || reviewDate) && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Calendar size={15} className="text-blue-500" />
                Review Information
              </h3>
              <div className="bg-gray-50 rounded-lg px-4">
                {reviewedBy && <InfoRow label="Reviewed By" value={reviewedBy?.name || reviewedBy?.email} />}
                {reviewDate && <InfoRow label="Review Date" value={new Date(reviewDate).toLocaleString()} />}
                {remarks && <InfoRow label="Remarks" value={remarks} />}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
