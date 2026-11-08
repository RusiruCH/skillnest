import { useState } from 'react';
import { X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

/**
 * ApprovalActionModal
 * Props:
 *   isOpen        — boolean
 *   onClose       — fn()
 *   onConfirm     — fn(remarks: string)
 *   action        — 'approve' | 'reject'
 *   targetLabel   — string   e.g. "Bob Dylan's application" or "React Basics course"
 *   loading       — boolean
 */
export default function ApprovalActionModal({
  isOpen,
  onClose,
  onConfirm,
  action,
  targetLabel,
  loading = false,
}) {
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const isReject = action === 'reject';

  const handleConfirm = () => {
    if (isReject && !remarks.trim()) {
      setError('Please provide a reason for rejection.');
      return;
    }
    setError('');
    onConfirm(remarks.trim());
  };

  const handleClose = () => {
    setRemarks('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div
          className={`px-6 py-4 flex items-center justify-between ${
            isReject ? 'bg-red-50 border-b border-red-100' : 'bg-green-50 border-b border-green-100'
          }`}
        >
          <div className="flex items-center gap-2">
            {isReject ? (
              <XCircle size={20} className="text-red-500" />
            ) : (
              <CheckCircle size={20} className="text-green-500" />
            )}
            <h2 className="text-base font-semibold text-gray-800">
              {isReject ? 'Reject' : 'Approve'} Confirmation
            </h2>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-gray-600 mb-4">
            You are about to{' '}
            <span className={`font-semibold ${isReject ? 'text-red-600' : 'text-green-600'}`}>
              {action}
            </span>{' '}
            <span className="font-medium text-gray-800">{targetLabel}</span>.
            {isReject
              ? ' Please provide a clear reason.'
              : ' This action can be undone later if needed.'}
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {isReject ? 'Rejection Reason' : 'Remarks'}{' '}
              {isReject && <span className="text-red-500">*</span>}
            </label>
            <textarea
              rows={4}
              value={remarks}
              onChange={(e) => {
                setRemarks(e.target.value);
                if (error) setError('');
              }}
              placeholder={
                isReject
                  ? 'e.g. Insufficient portfolio evidence, missing qualifications...'
                  : 'Optional remarks for the reviewer record...'
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            {error && (
              <p className="flex items-center gap-1.5 text-red-500 text-xs mt-1.5">
                <AlertCircle size={13} />
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${
              isReject
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Processing...' : isReject ? 'Reject' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  );
}
