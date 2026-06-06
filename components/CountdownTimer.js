import { useState, useEffect } from 'react';

export default function CountdownTimer({ endDate, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endDate));

  useEffect(() => {
    const timer = setInterval(() => {
      const time = calculateTimeLeft(endDate);
      setTimeLeft(time);

      if (time.total <= 0) {
        clearInterval(timer);
        onExpire && onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, onExpire]);

  function calculateTimeLeft(endDate) {
    const difference = new Date(endDate) - new Date();
    
    if (difference <= 0) {
      return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      total: difference,
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  if (timeLeft.total <= 0) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-danger-100 text-danger-700 rounded-lg font-semibold">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Sale Ended
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-500 text-white rounded-lg font-semibold shadow-lg">
      <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="text-sm">Ends in:</span>
      <div className="flex items-center gap-1">
        {timeLeft.days > 0 && (
          <>
            <span className="bg-white text-secondary-600 px-2 py-1 rounded font-bold text-sm min-w-[2rem] text-center">
              {String(timeLeft.days).padStart(2, '0')}
            </span>
            <span className="text-xs">d</span>
          </>
        )}
        <span className="bg-white text-secondary-600 px-2 py-1 rounded font-bold text-sm min-w-[2rem] text-center">
          {String(timeLeft.hours).padStart(2, '0')}
        </span>
        <span className="text-xs">:</span>
        <span className="bg-white text-secondary-600 px-2 py-1 rounded font-bold text-sm min-w-[2rem] text-center">
          {String(timeLeft.minutes).padStart(2, '0')}
        </span>
        <span className="text-xs">:</span>
        <span className="bg-white text-secondary-600 px-2 py-1 rounded font-bold text-sm min-w-[2rem] text-center">
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}
