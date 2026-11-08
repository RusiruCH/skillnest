import { X, BookOpen, User, Tag, Calendar, AlertCircle } from 'lucide-react';

const statusColors = {
  draft: 'bg-gray-100 text-gray-600 border-gray-200',
  pending_approval: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  approved: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  archived: 'bg-purple-100 text-purple-700 border-purple-200',
};

const statusLabel = {
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  archived: 'Archived',
};

function InfoRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-2.5 border-b border-gray-100 last:border-0">
      <span className="w-44 text-xs font-medium text-gray-500 uppercase tracking-wide shrink-0">
        {label}
      </span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  );
}

export default function CourseReviewModal({ isOpen, onClose, course }) {
  if (!isOpen || !course) return null;

  const {
    title,
    description,
    category,
    level,
    price,
    instructor,
    status,
    submissionDate,
    rejectionReason,
    reviewedBy,
    reviewedDate,
    structures,
  } = course;

  const statusClass = statusColors[status] || statusColors.draft;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
              <BookOpen size={18} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 line-clamp-1">{title}</h2>
              <p className="text-xs text-gray-500">
                by {instructor?.name || instructor?.email || 'Unknown Instructor'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusClass}`}
            >
              {statusLabel[status] || status}
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
          {/* Basic Info */}
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Tag size={15} className="text-indigo-500" />
              Course Details
            </h3>
            <div className="bg-gray-50 rounded-lg px-4">
              <InfoRow label="Category" value={category} />
              <InfoRow label="Level" value={level} />
              <InfoRow
                label="Price"
                value={price === 0 ? 'Free' : price ? `$${price}` : undefined}
              />
              <InfoRow
                label="Submitted"
                value={submissionDate ? new Date(submissionDate).toLocaleDateString() : ''}
              />
            </div>
          </section>

          {/* Description */}
          {description && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <BookOpen size={15} className="text-indigo-500" />
                Description
              </h3>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4 leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
            </section>
          )}

          {/* Topics / Structure */}
          {structures && structures.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <BookOpen size={15} className="text-indigo-500" />
                Course Structure ({structures.length} topic{structures.length !== 1 ? 's' : ''})
              </h3>
              <ul className="space-y-2">
                {structures.map((topic, idx) => (
                  <li
                    key={topic._id || idx}
                    className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-800"
                  >
                    <span className="font-medium text-gray-500 mr-2">{idx + 1}.</span>
                    {topic.title || topic.name || 'Untitled Topic'}
                    {topic.materials && topic.materials.length > 0 && (
                      <span className="ml-2 text-xs text-gray-400">
                        ({topic.materials.length} material{topic.materials.length !== 1 ? 's' : ''})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Rejection reason */}
          {rejectionReason && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-red-600 mb-2">
                <AlertCircle size={15} className="text-red-500" />
                Rejection Reason
              </h3>
              <p className="text-sm text-red-700 bg-red-50 rounded-lg p-4 border border-red-100">
                {rejectionReason}
              </p>
            </section>
          )}

          {/* Review info */}
          {(reviewedBy || reviewedDate) && (
            <section>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Calendar size={15} className="text-indigo-500" />
                Review Information
              </h3>
              <div className="bg-gray-50 rounded-lg px-4">
                <InfoRow label="Reviewed By" value={reviewedBy?.name || reviewedBy?.email} />
                <InfoRow
                  label="Review Date"
                  value={reviewedDate ? new Date(reviewedDate).toLocaleString() : ''}
                />
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
