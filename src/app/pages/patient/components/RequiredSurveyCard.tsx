import React from 'react';
import { FileText, ChevronRight } from 'lucide-react';

interface RequiredSurveyCardProps {
  surveyName: string;
  daysLeft: number;
  questionsCount: number;
  progressPercent?: number;
  onOpenSurvey: () => void;
}

export const RequiredSurveyCard: React.FC<RequiredSurveyCardProps> = ({
  surveyName,
  daysLeft,
  questionsCount,
  progressPercent = 0,
  onOpenSurvey,
}) => {
  return (
    <div className="bg-gradient-to-br from-sage to-teal rounded-[2rem] p-8 text-white shadow-xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block mb-2">
            Required Survey
          </div>
          <h2 className="text-2xl font-bold italic">"How is your sleep tonight?"</h2>
        </div>
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner">
          <FileText className="w-7 h-7" />
        </div>
      </div>

      <div className="mb-6">
        <p className="text-white/90 leading-relaxed mb-3">
          Your clinical team needs the {surveyName} survey to calibrate your therapy. <br />
          <span className="font-bold">Due in {daysLeft} days.</span>
        </p>
        <div className="flex items-center justify-between text-xs font-semibold text-white/80 mb-1">
          <span>Progress</span>
          <span>0/{questionsCount} Questions</span>
        </div>
        <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-white h-full rounded-full transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <button
        onClick={onOpenSurvey}
        className="flex items-center justify-center gap-3 w-full bg-white text-teal py-5 rounded-2xl font-bold hover:bg-white/95 transition-all shadow-xl active:scale-98"
      >
        Finish Survey
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
};
