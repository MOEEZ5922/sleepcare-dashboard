import React from 'react';
import { Sparkles, Play } from 'lucide-react';
import { NormalizedCoachingVideo, getVideoPreviewUrl } from '../../../data/api';

interface OnboardingCheckInModalProps {
  step: 'welcome' | 'video' | null;
  patientName?: string;
  popupVideo: NormalizedCoachingVideo | null;
  onNextStep: () => void;
  onWatchGuide: () => void;
  onGoToDashboard: () => void;
}

export const OnboardingCheckInModal: React.FC<OnboardingCheckInModalProps> = ({
  step,
  patientName,
  popupVideo,
  onNextStep,
  onWatchGuide,
  onGoToDashboard,
}) => {
  if (!step) return null;

  const displayName = patientName || 'there';

  if (step === 'welcome') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/70 backdrop-blur-md animate-in fade-in duration-500">
        <div className="bg-card rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border border-light-blue animate-in zoom-in-95 duration-500 relative overflow-hidden text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-teal/20 to-sage/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-12 h-12 text-teal" />
          </div>
          <h2 className="text-3xl font-bold text-navy mb-4">You're doing great!</h2>
          <p className="text-blue-gray text-lg leading-relaxed mb-8 px-2">
            Adjusting to CPAP therapy takes time, and every night you try is a huge step forward.
            We are here to guide you to a perfect night's rest. Let's check today's tip!
          </p>
          <button
            onClick={onNextStep}
            className="w-full bg-navy text-white font-bold py-4 rounded-2xl text-lg hover:bg-navy/90 shadow-xl hover:scale-[1.02] transition-all"
          >
            Show My Daily Tip
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/70 backdrop-blur-md">
      <div className="bg-white rounded-[2.25rem] p-8 max-w-sm w-full shadow-2xl border border-light-blue animate-in slide-in-from-bottom-8 duration-500 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-teal to-sage" />

        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 bg-sage/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-sage" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-navy">Daily Care Check-In</h3>
            <p className="text-xs text-slate-muted font-semibold">Supporting your sleep journey</p>
          </div>
        </div>

        <p className="text-sm text-blue-gray mb-5 leading-relaxed">
          Hello <span className="font-bold text-navy">{displayName}</span>! Your SleepCare portal is fully connected.
        </p>

        <div
          onClick={onWatchGuide}
          className="relative w-full h-36 bg-gray-100 rounded-2xl mb-5 overflow-hidden group cursor-pointer shadow-sm border border-light-blue"
        >
          <video
            src={getVideoPreviewUrl(popupVideo)}
            preload="metadata"
            muted
            playsInline
            className="w-full h-full object-cover opacity-90 group-hover:scale-102 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-navy/10 group-hover:bg-navy/5 transition-colors flex items-center justify-center">
            <div className="w-12 h-12 bg-white/95 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform">
              <Play className="w-5 h-5 text-teal ml-1" />
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-muted mb-6 leading-relaxed bg-background p-3.5 rounded-xl border border-light-blue">
          🛡️ <span className="font-bold text-navy">Clinical Tip:</span> To help you sleep deeper tonight, your care team prepared a custom guide: <span className="font-semibold text-navy">"{popupVideo?.title || 'Comfort Guide'}"</span> ({popupVideo?.duration || '1:00'}).
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onWatchGuide}
            className="w-full bg-teal text-white font-bold py-4 rounded-xl shadow-lg shadow-teal/15 hover:bg-teal/90 transition-all hover:shadow-xl hover:scale-[1.01]"
          >
            Watch Guide ({popupVideo?.duration || '1:00'})
          </button>
          <button
            onClick={onGoToDashboard}
            className="w-full bg-background text-slate-muted font-semibold py-3.5 rounded-xl border border-light-blue hover:bg-light-blue/50 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
