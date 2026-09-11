import React from 'react';
import { Moon, Flame } from 'lucide-react';

interface SleepProgressRingsProps {
  lastNightHours: number;
  streak: number;
}

export function SleepProgressRings({
  lastNightHours,
  streak,
}: SleepProgressRingsProps) {
  const percentComplete = Math.min((lastNightHours / 8) * 100, 100);

  const hoursMessage =
    lastNightHours >= 6 ? 'Excellent!' : lastNightHours >= 4 ? 'Good Job!' : 'Keep Going!';
  const streakMessage = streak >= 7 ? '🔥 On Fire!' : 'Building Momentum!';

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-light-blue">
      <h3 className="text-xl text-navy font-bold mb-6">Last Night's Progress</h3>

      <div className="grid grid-cols-2 gap-8">
        {/* Hours Ring */}
        <div className="text-center">
          <div className="relative w-36 h-36 mx-auto mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                stroke="var(--color-light-blue)"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="72"
                cy="72"
                r="64"
                stroke="url(#sleepGradient)"
                strokeWidth="10"
                fill="none"
                strokeDasharray={`${percentComplete * 4.02} 402`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="sleepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-sage)" />
                  <stop offset="100%" stopColor="var(--color-teal)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Moon className="w-6 h-6 text-teal mb-1" />
              <p className="text-3xl font-bold text-navy">
                {lastNightHours.toFixed(1)}
              </p>
              <p className="text-xs text-slate-muted">hours</p>
            </div>
          </div>
          <p className="text-sm text-slate-muted">Sleep with Therapy</p>
          <p className="text-lg font-semibold text-sage mt-1">
            {hoursMessage}
          </p>
        </div>

        {/* Streak Ring */}
        <div className="text-center">
          <div className="relative w-36 h-36 mx-auto mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                stroke="var(--color-light-blue)"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="72"
                cy="72"
                r="64"
                stroke="var(--color-amber)"
                strokeWidth="10"
                fill="none"
                strokeDasharray={`${Math.min((streak / 7) * 100, 100) * 4.02} 402`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Flame className="w-6 h-6 text-amber mb-1" />
              <p className="text-3xl font-bold text-navy">
                {streak}
              </p>
              <p className="text-xs text-slate-muted">days</p>
            </div>
          </div>
          <p className="text-sm text-slate-muted">Current Streak</p>
          <p className="text-lg font-semibold text-amber mt-1">
            {streakMessage}
          </p>
        </div>
      </div>
    </div>
  );
};
