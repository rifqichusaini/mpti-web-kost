// src/app/dashboard-user/components/CountdownTimer.tsx
'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  expiresAt: string;
  onExpire: () => void;
}

export default function CountdownTimer({ expiresAt, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(expiresAt).getTime() - new Date().getTime();
      return Math.max(0, difference);
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft === 0) {
        clearInterval(timer);
        onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  const isUrgent = minutes < 3;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
      isUrgent ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
    }`}>
      <Clock className="w-4 h-4" />
      <span className="font-semibold text-sm">
        {timeLeft === 0 ? (
          'Waktu Habis'
        ) : (
          <>
            Sisa Waktu: {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </>
        )}
      </span>
    </div>
  );
}