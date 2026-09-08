import React, { useState, useRef, useEffect } from 'react';
import { X, Star, Sparkles, CheckCircle2 } from 'lucide-react';
import { getFullVideoUrl } from '../data/api';
import { useVideoTelemetry } from '../hooks/useVideoTelemetry';

export interface CoachingVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: any | null;
  patientId?: string;
  onVideoCompleted?: () => void;
}

/**
 * Resolves WebVTT subtitle track URLs based on video asset paths
 */
export function getSubtitleUrl(videoUrl: string | null | undefined, lang: 'en' | 'fr'): string {
  if (!videoUrl) return '';
  if (videoUrl.includes('/videos/existing/') || videoUrl.includes('/videos/new/')) {
    const base = videoUrl.replace(/\/videos\/(existing|new)\//, '/subtitles/');
    const index = base.lastIndexOf('.');
    if (index !== -1) {
      const withoutExt = base.substring(0, index);
      const cleanBase = withoutExt.replace(/[._](en|fr)$/, '');
      return `${cleanBase}.${lang}.vtt`;
    }
  }
  return '';
}

export const CoachingVideoModal: React.FC<CoachingVideoModalProps> = ({
  isOpen,
  onClose,
  video,
  patientId = '1',
  onVideoCompleted,
}) => {
  const [currentClipIndex, setCurrentClipIndex] = useState<number>(0);
  const [ttffMs, setTtffMs] = useState<number | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const clickTimeRef = useRef<number>(0);
  const watchSecondsRef = useRef<number>(0);

  // Derive package vs single video
  const isPackage = video?.videoType === 'package' && Array.isArray(video?.parsedClips) && video.parsedClips.length > 0;
  const currentClip = isPackage
    ? video.parsedClips[currentClipIndex] || video.parsedClips[0]
    : video;
  const mediaUrl = currentClip?.url || currentClip?.video_url || video?.url || video?.video_url;

  // Extract eventId if present (from distributed tracing or push notification)
  const eventId = video?.event_id || video?.eventId || null;
  const videoId = video?.id || '1';

  // Connect telemetry hook to modal visibility
  const { handlePlay, handleEnded: logTelemetryEnded } = useVideoTelemetry({
    eventId,
    videoId,
    patientId,
    isVisible: isOpen,
  });

  // Reset states on new video modal open
  useEffect(() => {
    if (isOpen && video) {
      clickTimeRef.current = performance.now();
      setTtffMs(null);
      setCurrentClipIndex(0);
      watchSecondsRef.current = 0;
      setRating(video.rating ?? null);
    }
  }, [isOpen, video?.id]);

  if (!isOpen || !video) return null;

  const handleVideoEnded = async () => {
    if (isPackage && currentClipIndex < (video.parsedClips?.length || 1) - 1) {
      // Advance to next clip in package sequence
      setCurrentClipIndex(prev => prev + 1);
    } else {
      // Final clip completed
      const totalDuration = watchSecondsRef.current || video.duration_s || 10;
      await logTelemetryEnded(totalDuration, rating);
      if (onVideoCompleted) {
        onVideoCompleted();
      }
    }
  };

  const handleRatingSelect = async (stars: number) => {
    setRating(stars);
    const totalDuration = watchSecondsRef.current || video.duration_s || 10;
    await logTelemetryEnded(totalDuration, stars);
    if (onVideoCompleted) {
      onVideoCompleted();
    }
  };

  const handleModalClose = async () => {
    if (watchSecondsRef.current > 0 || rating !== null) {
      await logTelemetryEnded(watchSecondsRef.current, rating);
      if (onVideoCompleted) {
        onVideoCompleted();
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#0A1128]/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl border border-[#E8EEF2] animate-in zoom-in-95 duration-300">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E8EEF2]">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold text-[#2D9596] uppercase tracking-wider block truncate">
                {video.category || 'Clinical Coaching'} {isPackage ? `• PART ${currentClipIndex + 1} OF ${video.parsedClips.length}` : ''}
              </span>
              {ttffMs !== null && (
                <span className="bg-[#2D9596]/10 border border-[#2D9596]/30 text-[#2D9596] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 animate-in fade-in">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2D9596] animate-ping" />
                  {ttffMs} ms TTFF
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-[#0A1128] line-clamp-1">
              {video.title || 'Coaching Video'} {isPackage && currentClip?.title ? `— ${currentClip.title}` : ''}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleModalClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-[#E8EEF2] flex items-center justify-center text-[#5A6B7C] hover:bg-gray-200 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Canvas */}
        <div className="relative bg-black aspect-video flex items-center justify-center">
          {/* On-Demand Quality KPI Badge */}
          {ttffMs !== null && (
            <div className="absolute top-3 left-3 z-20 bg-black/80 backdrop-blur-md border border-[#2D9596]/50 text-white text-[10px] font-mono font-bold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg animate-in fade-in duration-300 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-[#2D9596] animate-ping" />
              <span>KPI • On-Demand TTFF: <strong className="text-[#2D9596] font-extrabold">{ttffMs} ms</strong></span>
            </div>
          )}

          <video
            ref={videoRef}
            key={`${video.id}-${currentClipIndex}`}
            className="w-full h-full object-contain"
            controls
            autoPlay
            crossOrigin="anonymous"
            onPlay={handlePlay}
            onPlaying={() => {
              if (clickTimeRef.current > 0 && ttffMs === null) {
                const elapsed = Math.round(performance.now() - clickTimeRef.current);
                setTtffMs(elapsed);
                console.log(`[KPI] Backend -> Mobile Time-to-First-Frame (TTFF): ${elapsed} ms`);
              }
            }}
            onEnded={handleVideoEnded}
            onTimeUpdate={(e) => {
              const currentTime = Math.round(e.currentTarget.currentTime || 0);
              let elapsedSec = currentTime;
              if (isPackage && video.parsedClips?.length > 0) {
                const prevClipsDuration = video.parsedClips
                  .slice(0, currentClipIndex)
                  .reduce((acc: number, c: any) => acc + (c.duration_s || 0), 0);
                elapsedSec += prevClipsDuration;
              }
              watchSecondsRef.current = Math.max(watchSecondsRef.current, elapsedSec);
            }}
            src={getFullVideoUrl(mediaUrl || 'https://www.w3schools.com/html/mov_bbb.mp4') + '?cb=' + (video.id || '1') + '-' + currentClipIndex}
          >
            <track
              src={
                currentClip?.subtitle_en_url ||
                currentClip?.vtt_en_url ||
                currentClip?.subtitles_en ||
                (!isPackage ? video.vtt_en_url : '') ||
                getSubtitleUrl(mediaUrl, 'en')
              }
              kind="subtitles"
              srcLang="en"
              label="English"
              default
            />
            <track
              src={
                currentClip?.subtitle_fr_url ||
                currentClip?.vtt_fr_url ||
                currentClip?.subtitles_fr ||
                (!isPackage ? video.vtt_fr_url : '') ||
                getSubtitleUrl(mediaUrl, 'fr')
              }
              kind="subtitles"
              srcLang="fr"
              label="Français"
            />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Feedback & Star Rating Section */}
        <div className="p-5 bg-[#FAFAFA] border-t border-[#E8EEF2] text-center space-y-3">
          <p className="text-xs font-bold text-[#0A1128] uppercase tracking-wider">
            How helpful was this coaching tip?
          </p>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingSelect(star)}
                className="p-1.5 hover:scale-125 transition-transform duration-200 focus:outline-none"
              >
                <Star
                  className="w-6 h-6 transition-colors"
                  fill={rating !== null && rating >= star ? '#F4A261' : 'none'}
                  stroke={rating !== null && rating >= star ? '#F4A261' : '#CBD5E1'}
                />
              </button>
            ))}
          </div>
          {rating !== null && (
            <p className="text-xs text-[#6A994E] font-bold flex items-center justify-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Thank you for your feedback!
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
