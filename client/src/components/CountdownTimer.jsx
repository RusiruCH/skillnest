import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export default function CountdownTimer({ deadline, compact = false, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    if (!deadline) return { total: 0, expired: true };
    const difference = new Date(deadline).getTime() - new Date().getTime();

    if (difference <= 0) {
      return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
      total: difference,
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false,
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining.expired && onExpire) {
        onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  if (timeLeft.expired) {
    return (
      <span className="inline-flex items-center text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-md">
        <AlertTriangle className="w-3.5 h-3.5 mr-1 text-rose-400" />
        Deadline Passed
      </span>
    );
  }

  const isUrgent = timeLeft.total < 24 * 60 * 60 * 1000;

  if (compact) {
    return (
      <span
        className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded ${
          isUrgent
            ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
            : 'text-slate-400 bg-slate-800/80 border border-slate-700/50'
        }`}
      >
        <Clock className="w-3 h-3 mr-1 text-slate-400" />
        {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
        {timeLeft.hours}h {timeLeft.minutes}m
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium ${
        isUrgent
          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
          : 'bg-slate-800/80 text-slate-200 border-slate-700/60'
      }`}
    >
      <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-amber-400 animate-spin' : 'text-purple-400'}`} />
      <span>
        {timeLeft.days > 0 && <span className="font-bold">{timeLeft.days}d : </span>}
        <span className="font-bold">{String(timeLeft.hours).padStart(2, '0')}h : </span>
        <span className="font-bold">{String(timeLeft.minutes).padStart(2, '0')}m : </span>
        <span className="font-bold">{String(timeLeft.seconds).padStart(2, '0')}s</span>
      </span>
      {isUrgent && <span className="text-[10px] text-amber-400 uppercase font-sans font-bold">Closing Soon</span>}
    </div>
  );
}
