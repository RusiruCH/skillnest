import React from 'react';
import { X, PlayCircle, FileText, Code2, ExternalLink, Download } from 'lucide-react';

const MaterialViewerModal = ({ isOpen, material, onClose }) => {
  if (!isOpen || !material) return null;

  const renderContent = () => {
    switch (material.materialType) {
      case 'video':
        const isYoutube =
          material.resourceLocation?.includes('youtube.com') ||
          material.resourceLocation?.includes('youtu.be') ||
          material.externalUrl?.includes('youtube.com') ||
          material.externalUrl?.includes('youtu.be');

        const videoSrc = material.resourceLocation || material.externalUrl;

        let embedUrl = videoSrc;
        if (isYoutube) {
          const videoId =
            videoSrc.split('v=')[1]?.split('&')[0] ||
            videoSrc.split('youtu.be/')[1]?.split('?')[0];
          embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        }

        return (
          <div className="space-y-4">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-inner">
              {isYoutube ? (
                <iframe
                  src={embedUrl}
                  title={material.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video controls className="w-full h-full object-contain">
                  <source src={videoSrc} type="video/mp4" />
                  Your browser does not support HTML5 video streaming.
                </video>
              )}
            </div>
            {material.content && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Video Notes & Summary
                </h4>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{material.content}</p>
              </div>
            )}
          </div>
        );

      case 'code':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="font-mono font-bold uppercase text-indigo-600">
                Language: {material.codeLanguage || 'javascript'}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(material.content || '')}
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                Copy Snippet
              </button>
            </div>
            <div className="bg-slate-900 rounded-xl p-5 overflow-x-auto text-emerald-400 font-mono text-sm leading-relaxed border border-slate-800 shadow-inner">
              <pre>
                <code>{material.content || '// No code provided'}</code>
              </pre>
            </div>
          </div>
        );

      case 'notes':
        return (
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 max-h-[60vh] overflow-y-auto">
            <div className="prose prose-slate max-w-none text-slate-800 whitespace-pre-wrap text-sm leading-relaxed">
              {material.content}
            </div>
          </div>
        );

      case 'document':
      case 'link':
      default:
        return (
          <div className="text-center py-10 px-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <FileText className="w-16 h-16 text-indigo-500 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">Resource Attachment</h4>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              {material.content || 'This learning resource is available for review or external access.'}
            </p>
            {material.resourceLocation && (
              <a
                href={material.resourceLocation}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Open External Resource
              </a>
            )}
          </div>
        );
    }
  };

  const getTypeIcon = () => {
    switch (material.materialType) {
      case 'video':
        return <PlayCircle className="w-5 h-5 text-indigo-600" />;
      case 'code':
        return <Code2 className="w-5 h-5 text-emerald-600" />;
      default:
        return <FileText className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-xs">
              {getTypeIcon()}
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block">
                {material.materialType} • {material.durationMinutes || 15} Mins
              </span>
              <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{material.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">{renderContent()}</div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-xs text-slate-500">
          <span>SkillNest Learning Material Viewer • Module 01</span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaterialViewerModal;

