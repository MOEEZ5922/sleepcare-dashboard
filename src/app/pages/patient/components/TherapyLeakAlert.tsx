import React from 'react';
import { Play } from 'lucide-react';
import { NormalizedCoachingVideo, getVideoPreviewUrl } from '../../../data/api';

interface TherapyLeakAlertProps {
  percentileLeak: number;
  video: NormalizedCoachingVideo | null;
  onWatchVideo: (video: NormalizedCoachingVideo) => void;
  onCheckFit: () => void;
}

export const TherapyLeakAlert: React.FC<TherapyLeakAlertProps> = ({
  percentileLeak,
  video,
  onWatchVideo,
  onCheckFit,
}) => {
  if (!video) return null;

  return (
    <div className="bg-gradient-to-br from-navy to-navy/90 text-white rounded-[2rem] p-8 shadow-2xl relative overflow-hidden border border-white/10 animate-in zoom-in-95 duration-500">
      <div className="flex items-start gap-6">
        <div
          onClick={() => onWatchVideo(video)}
          className="w-16 h-16 bg-amber/20 rounded-[1.25rem] flex items-center justify-center flex-shrink-0 relative overflow-hidden group cursor-pointer shadow-lg"
        >
          <video
            src={getVideoPreviewUrl(video)}
            preload="metadata"
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all scale-110 group-hover:scale-100"
          />
          <div className="absolute inset-0 bg-amber/20 group-hover:bg-transparent transition-all" />
          <Play className="w-8 h-8 text-white relative z-10 drop-shadow-md" />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber animate-pulse" />
            <span className="text-amber font-bold text-xs uppercase tracking-widest">Comfort & Fit Guide</span>
          </div>
          <h3 className="text-xl font-bold mb-4 leading-tight">
            Your mask had a tiny leak of {percentileLeak} L/min last night. Let's optimize it for deeper comfort in 60s!
          </h3>
          <div className="flex gap-3">
            <button
              onClick={() => onWatchVideo(video)}
              className="bg-teal text-white px-6 py-2.5 rounded-xl font-bold hover:bg-teal/90 transition-all shadow-lg active:scale-95 text-xs"
            >
              View Comfort Tip (1 min)
            </button>
            <button
              onClick={onCheckFit}
              className="text-white/60 text-xs hover:text-white transition-colors"
            >
              Check Mask Fit →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
