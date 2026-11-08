import React from 'react';

export default function DifficultyBadge({ difficulty, size = 'sm' }) {
  const diff = difficulty || 'Medium';

  const styles = {
    Easy: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Hard: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  };

  const currentStyle = styles[diff] || styles.Medium;
  const sizeClasses = size === 'xs' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center font-medium uppercase tracking-wider rounded-md border ${currentStyle} ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 fill-current bg-current animate-pulse" />
      {diff}
    </span>
  );
}
