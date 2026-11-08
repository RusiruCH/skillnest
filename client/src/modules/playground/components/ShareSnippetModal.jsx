import React, { useState } from 'react';
import { X, Share2, Copy, Check, Globe, Code, ExternalLink, Bookmark } from 'lucide-react';

export default function ShareSnippetModal({
  isOpen,
  onClose,
  activeSnippet,
  onOpenSaveModal
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  if (!isOpen) return null;

  const shareUrl = activeSnippet?._id
    ? `${window.location.origin}/playground?snippet=${activeSnippet._id}`
    : '';

  const embedCode = activeSnippet?._id
    ? `<iframe src="${window.location.origin}/playground?snippet=${activeSnippet._id}&embed=true" width="100%" height="500" frameborder="0"></iframe>`
    : '';

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    if (!embedCode) return;
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#161b22] border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Share Code Snippet</h3>
              <p className="text-xs text-gray-400">Share your technical work with peers and mentors</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          {!activeSnippet?._id ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <Bookmark className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Snippet Not Saved Yet</h4>
                <p className="text-gray-400 mt-1 max-w-sm mx-auto">
                  To generate a shareable link or embed snippet, please save your current code to the vault first.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenSaveModal();
                }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition"
              >
                <Bookmark className="w-4 h-4" />
                <span>Save Snippet First</span>
              </button>
            </div>
          ) : (
            <>
              {/* Snippet Card Overview */}
              <div className="bg-[#0d1117] p-3.5 rounded-xl border border-gray-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white">{activeSnippet.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-mono">
                    {activeSnippet.language}
                  </span>
                </div>
                {activeSnippet.description && (
                  <p className="text-gray-400 text-[11px] line-clamp-2">{activeSnippet.description}</p>
                )}
              </div>

              {/* Direct Share Link */}
              <div>
                <label className="block text-gray-300 font-medium mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>Shareable Web Link</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-[#0d1117] text-gray-300 border border-gray-800 rounded-lg px-3 py-2 font-mono text-[11px] focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Embed Code */}
              <div>
                <label className="block text-gray-300 font-medium mb-1.5 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Embed HTML Snippet</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={embedCode}
                    className="flex-1 bg-[#0d1117] text-gray-400 border border-gray-800 rounded-lg px-3 py-2 font-mono text-[11px] focus:outline-none"
                  />
                  <button
                    onClick={handleCopyEmbed}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium transition"
                  >
                    {copiedEmbed ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEmbed ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Close */}
          <div className="pt-2 border-t border-gray-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#0d1117] hover:bg-gray-800 text-gray-300 font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
