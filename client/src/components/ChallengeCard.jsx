import React from 'react';
import { useNavigate } from 'react-router-dom';
import DifficultyBadge from './DifficultyBadge';
import CountdownTimer from './CountdownTimer';
import { Code2, CheckCircle2, Maximize2, Users } from 'lucide-react';

export default function ChallengeCard({
  challenge,
  submissionStatus = null,
}) {
  const navigate = useNavigate();
  const isExpired = challenge.deadline && new Date() > new Date(challenge.deadline);

  const handleOpen = () => {
    navigate(`/challenges/${challenge._id}`);
  };

  const renderPreview = () => {
    if (challenge.coverImage) {
      return (
        <div className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-900/60 border border-slate-700/40 group-hover:border-purple-500/30 transition-all">
          <img
            src={challenge.coverImage}
            alt={challenge.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          
          <div className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-slate-300">
            <Maximize2 className="w-3.5 h-3.5" />
          </div>

          {submissionStatus && (
            <div className="absolute top-3 right-3">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md flex items-center gap-1 shadow-lg ${
                  submissionStatus === 'Accepted'
                    ? 'bg-emerald-500/90 text-white'
                    : submissionStatus === 'Submitted'
                    ? 'bg-blue-500/90 text-white'
                    : 'bg-amber-500/90 text-white'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                {submissionStatus}
              </span>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="relative w-full h-48 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 p-4 flex flex-col justify-between overflow-hidden group-hover:border-purple-500/40 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <Code2 className="w-4 h-4 text-purple-400" />
        </div>

        <div className="space-y-2 py-2">
          <div className="h-2 w-3/4 bg-slate-700/60 rounded" />
          <div className="h-2 w-1/2 bg-slate-700/40 rounded" />
          <div className="h-2 w-2/3 bg-purple-500/20 rounded" />
        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
          <span>{challenge.tags?.[0] || 'Code Challenge'}</span>
          <div className="p-1 rounded bg-slate-950/70 border border-slate-800">
            <Maximize2 className="w-3 h-3 text-slate-400" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="group bg-[#151c2c] border border-slate-800/90 hover:border-purple-500/50 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-purple-950/30">
      <div>
        {renderPreview()}

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            DAY {challenge.dayNumber || 1}
          </span>
          <DifficultyBadge difficulty={challenge.difficulty} size="xs" />
        </div>

        <h3 className="text-lg font-bold text-white mt-1 group-hover:text-purple-300 transition-colors line-clamp-1">
          {challenge.title}
        </h3>

        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
          {challenge.description}
        </p>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <CountdownTimer deadline={challenge.deadline} compact={true} />
          <div className="flex items-center text-[11px] text-slate-400">
            <Users className="w-3 h-3 mr-1 text-slate-400" />
            <span>{challenge.submissionsCount || 0} submissions</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={handleOpen}
          className="w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 bg-[#b8a7fa] hover:bg-[#a590f7] text-slate-950 shadow-md hover:shadow-purple-500/20 active:scale-[0.98]"
        >
          Open challenge
        </button>
      </div>
    </div>
  );
}
