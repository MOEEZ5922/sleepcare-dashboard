import React from 'react';
import { Sparkles } from 'lucide-react';

interface WeeklySummaryCardProps {
  weeklyAverage: number;
  daysUsed: number;
}

export const WeeklySummaryCard: React.FC<WeeklySummaryCardProps> = ({
  weeklyAverage,
  daysUsed,
}) => {
  const stars = weeklyAverage >= 6 ? '⭐⭐⭐' : weeklyAverage >= 4 ? '⭐⭐' : '⭐';

  return (
    <div className="bg-gradient-to-br from-teal to-teal/80 rounded-3xl p-8 text-white shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-6 h-6" />
        <h3 className="text-xl font-bold">This Week's Summary</h3>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white/90">Average Hours</span>
          <span className="text-2xl font-bold">{weeklyAverage} hrs</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/90">Days Used</span>
          <span className="text-2xl font-bold">{daysUsed}/7</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/90">Consistency</span>
          <span className="text-2xl font-bold">{stars}</span>
        </div>
      </div>
    </div>
  );
};
