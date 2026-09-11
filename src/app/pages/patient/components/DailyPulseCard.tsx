import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { submitSurveyResponse } from '../../../data/api';

interface DailyPulseCardProps {
  patientId: string;
}

const PULSE_OPTIONS = ['Good 👍', 'Okay 😐', 'Bad 👎'];

export const DailyPulseCard: React.FC<DailyPulseCardProps> = ({ patientId }) => {
  const [surveyResponse, setSurveyResponse] = useState<string | null>(null);

  const handleSelect = async (rating: string) => {
    setSurveyResponse(rating);
    try {
      await submitSurveyResponse(patientId, 'daily-pulse', {
        answers: [{ question_id: 'restful_feeling', value: rating }]
      });
    } catch (err) {
      console.error('Failed to submit daily pulse survey:', err);
    }
  };

  return (
    <div className="patient-card group hover:border-teal/30 transition-all">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-teal/10 rounded-[1.25rem] flex items-center justify-center group-hover:rotate-12 transition-transform">
          <Sparkles className="w-6 h-6 text-teal" />
        </div>
        <div>
          <h3 className="text-navy font-bold text-lg">Daily Pulse</h3>
          <p className="text-sm text-blue-gray">Did you feel rested this morning?</p>
        </div>
      </div>

      <div className="flex gap-3">
        {PULSE_OPTIONS.map((rating) => {
          const isSelected = surveyResponse === rating;
          return (
            <button
              key={rating}
              onClick={() => handleSelect(rating)}
              className={`flex-1 py-4 rounded-xl border-2 transition-all font-bold text-sm ${
                isSelected
                  ? 'border-teal bg-teal/10 text-teal'
                  : 'border-light-blue text-blue-gray hover:border-teal/50 shadow-sm'
              }`}
            >
              {rating}
            </button>
          );
        })}
      </div>

      {surveyResponse && (
        <p className="text-center text-sm text-sage font-bold mt-4 animate-pulse">
          Thanks! Your care team has been updated.
        </p>
      )}
    </div>
  );
};
