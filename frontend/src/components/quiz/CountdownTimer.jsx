import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

/**
 * Live synchronized countdown timer for quiz attempts
 * Authoritative enforcement remains server-side.
 */
const CountdownTimer = ({ startedAt, durationMinutes, onTimeExpire }) => {
  const calculateRemainingSeconds = () => {
    if (!startedAt || !durationMinutes) return 0;
    const startTime = new Date(startedAt).getTime();
    const durationMs = durationMinutes * 60 * 1000;
    const endTime = startTime + durationMs;
    const now = Date.now();
    const diffSeconds = Math.max(0, Math.floor((endTime - now) / 1000));
    return diffSeconds;
  };

  const [secondsLeft, setSecondsLeft] = useState(calculateRemainingSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateRemainingSeconds();
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        if (onTimeExpire) {
          onTimeExpire();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startedAt, durationMinutes, onTimeExpire]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  let statusClass = '';
  if (secondsLeft <= 60) {
    statusClass = 'timer-critical';
  } else if (secondsLeft <= 300) {
    statusClass = 'timer-warning';
  }

  return (
    <div className={`timer-container ${statusClass}`}>
      <Clock size={18} />
      <span>{formattedTime}</span>
    </div>
  );
};

export default CountdownTimer;
