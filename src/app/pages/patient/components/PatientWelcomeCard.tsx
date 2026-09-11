import React from 'react';
import { Signal } from 'lucide-react';

interface PatientWelcomeCardProps {
  patientName?: string;
  isLive?: boolean;
}

export const PatientWelcomeCard: React.FC<PatientWelcomeCardProps> = ({
  patientName,
  isLive = false,
}) => {
  const firstName = patientName?.split(' ')[0] || 'Friend';

  return (
    <div className="patient-card mb-4">
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal/5 rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-navy leading-tight">
            Hello, {firstName}. <br className="hidden sm:block" /> We are so glad you are here.
          </h1>
          {isLive && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-sage/10 border border-sage/20 rounded-lg shrink-0">
              <Signal className="w-4 h-4 text-sage" />
              <span className="text-xs font-bold text-sage uppercase tracking-wider">Connected</span>
            </div>
          )}
        </div>

        <div className="space-y-5 text-navy leading-relaxed text-lg sm:text-xl max-w-3xl">
          <p>
            Getting used to a CPAP machine takes time. It is a new habit for your body.
          </p>
          <p>
            You might feel frustrated on some nights, and that is completely normal. Remember, every single day you try, you are taking a brave step to protect your health.
          </p>
          <div className="bg-background p-5 rounded-2xl border-2 border-light-blue mt-6">
            <p className="font-bold text-teal mb-2">A Guided Way</p>
            <p>
              We made this app to be simple. Think of it as your personal guide. We will help you adjust your mask and get comfortable, step-by-step, until you get a good night's sleep.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
