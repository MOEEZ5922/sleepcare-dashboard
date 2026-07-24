import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';
import { Play, Star, CheckCircle, Clock, BookOpen, Wrench, Lightbulb, Plane, ChevronRight, Signal, Loader2, X } from 'lucide-react';
import { useApi, clearApiCache } from '../../hooks/useApi';
import { fetchVideos, submitVideoInteraction, getFullVideoUrl } from '../../data/api';

const categoryIcons: { [key: string]: React.ReactNode } = {
  'Mask & Equipment': <Wrench className="w-3.5 h-3.5" />,
  'Tips & Tricks': <Lightbulb className="w-3.5 h-3.5" />,
  'Maintenance': <CheckCircle className="w-3.5 h-3.5" />,
  'Understanding Your Data': <BookOpen className="w-3.5 h-3.5" />,
  'Lifestyle': <Plane className="w-3.5 h-3.5" />,
};

const categoryColors: { [key: string]: string } = {
  'Mask & Equipment': 'bg-[#E76F51]/10 text-[#E76F51]',
  'Tips & Tricks': 'bg-[#F4A261]/10 text-[#F4A261]',
  'Maintenance': 'bg-[#6A994E]/10 text-[#6A994E]',
  'Understanding Your Data': 'bg-[#2D9596]/10 text-[#2D9596]',
  'Lifestyle': 'bg-[#0A1128]/10 text-[#0A1128]',
};

const thumbnailGradients: { [key: string]: string } = {
  'Mask & Equipment': 'from-[#E76F51] to-[#c45a3e]',
  'Tips & Tricks': 'from-[#F4A261] to-[#d4843e]',
  'Maintenance': 'from-[#6A994E] to-[#4a7a35]',
  'Understanding Your Data': 'from-[#2D9596] to-[#1a7273]',
  'Lifestyle': 'from-[#0A1128] to-[#1a233a]',
};

function getSubtitleUrl(videoUrl: string | null | undefined, lang: 'en' | 'fr'): string {
  if (!videoUrl) return '';
  if (videoUrl.includes('/videos/existing/') || videoUrl.includes('/videos/new/')) {
    const base = videoUrl.replace(/\/videos\/(existing|new)\//, '/subtitles/');
    const index = base.lastIndexOf('.');
    if (index !== -1) {
      const withoutExt = base.substring(0, index);
      // Strip any existing language suffix before appending new one
      const cleanBase = withoutExt.replace(/[._](en|fr)$/, '');
      return `${cleanBase}.${lang}.vtt`;
    }
  }
  return '';
}

export default function PatientVideos() {
  const { id } = useParams();

  // Set visited videos flag in localStorage on mount
  useEffect(() => {
    localStorage.setItem(`has-visited-videos-${id || '1'}`, 'true');
  }, [id]);

  const { data: liveVideos, isLoading, error, refetch: refetchVideos } = useApi(() => fetchVideos(id || '1'), {
    dependencies: [id],
    cacheKey: `videos-${id || '1'}`
  });

  // Silent background polling: check for newly assigned videos every 3s WITHOUT screen reload/flickering
  useEffect(() => {
    const interval = setInterval(() => {
      refetchVideos(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [refetchVideos]);

  const [activeVideo, setActiveVideo] = useState<any | null>(null);
  const [currentClipIndex, setCurrentClipIndex] = useState<number>(0);
  const [ttffMs, setTtffMs] = useState<number | null>(null);
  const [ttffMap, setTtffMap] = useState<{ [id: string | number]: number }>({});
  const videoClickTimeRef = React.useRef<number>(0);

  const isLive = !!(liveVideos && (liveVideos as any).__isLive);
  const rawVideos = (liveVideos as any)?.videos || (liveVideos as any)?.patient || (Array.isArray(liveVideos) ? liveVideos : []);
  const videos = useMemo(() => {
    const list = Array.isArray(rawVideos) ? rawVideos : [];
    return list.map((v: any) => {
      // Parse clips if present (can be stringified JSON or array)
      let parsedClips: any[] = [];
      if (v.clips) {
        if (typeof v.clips === 'string') {
          try {
            parsedClips = JSON.parse(v.clips);
          } catch {
            parsedClips = [];
          }
        } else if (Array.isArray(v.clips)) {
          parsedClips = v.clips;
        }
      }

      const videoType = v.video_type || (parsedClips.length > 0 ? 'package' : 'single');

      // Calculate total duration in seconds if package
      let duration_s = v.duration_s;
      if (videoType === 'package' && parsedClips.length > 0 && (!duration_s || duration_s === 0)) {
        duration_s = parsedClips.reduce((acc: number, c: any) => acc + (c.duration_s || 0), 0);
      }

      // Normalize duration display string (e.g. 399s -> 6:39)
      let duration = v.duration;
      if (!duration && typeof duration_s === 'number') {
        const minutes = Math.floor(duration_s / 60);
        const seconds = duration_s % 60;
        duration = `${minutes}:${String(seconds).padStart(2, '0')}`;
      }

      // Normalize triggerReason
      const triggerReason = v.triggerReason || v.trigger_reason || 'General';

      return {
        ...v,
        videoType,
        parsedClips,
        duration_s,
        duration: duration || '3:00',
        triggerReason,
      };
    });
  }, [rawVideos]);

  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [watchedMap, setWatchedMap] = useState<{ [id: string | number]: boolean }>({});
  const [ratingMap, setRatingMap] = useState<{ [id: string | number]: number | null }>({});
  const watchDurationMapRef = React.useRef<{ [id: string | number]: number }>({});

  useEffect(() => {
    if (videos.length > 0) {
      setWatchedMap(Object.fromEntries(videos.map((v: any) => [v.id, v.watched])));
      setRatingMap(Object.fromEntries(videos.map((v: any) => [v.id, v.rating])));
    }
  }, [videos]);

  if (isLoading && videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-[#2D9596] animate-spin" />
      </div>
    );
  }

  const recommended = videos.filter((v: any) => v.relevance === 'high');
  const libraryVideos = recommended.length > 0
    ? videos.filter((v: any) => v.relevance !== 'high')
    : videos;

  const watchedCount = Object.values(watchedMap).filter(Boolean).length;
  const categories = ['All', ...Array.from(new Set(libraryVideos.map((v: any) => v.category)))];

  const filtered = activeFilter === 'All'
    ? libraryVideos
    : libraryVideos.filter((v: any) => v.category === activeFilter);

  // watchDurationMapRef moved up to satisfy Rules of Hooks

  const handleWatch = async (video: any) => {
    videoClickTimeRef.current = performance.now();
    setTtffMs(null);
    setActiveVideo(video);
    setCurrentClipIndex(0);
    setWatchedMap(prev => ({ ...prev, [video.id]: true }));
    localStorage.setItem(`has-watched-video-${id || '1'}`, 'true');

    const currentSeconds = watchDurationMapRef.current[video.id] || video.watch_duration_seconds || 0;
    try {
      await submitVideoInteraction(id || '1', video.id, {
        watched: true,
        watch_duration_seconds: currentSeconds
      });
      clearApiCache(`videos-${id || '1'}`);
      refetchVideos();
    } catch (err) {
      console.error('Failed to log video watch');
    }
  };

  const handleRating = async (videoId: string | number, stars: number) => {
    setRatingMap(prev => ({ ...prev, [videoId]: stars }));
    localStorage.setItem(`has-watched-video-${id || '1'}`, 'true');

    const currentSeconds = watchDurationMapRef.current[videoId] || (activeVideo?.id === videoId ? activeVideo?.duration_s || 0 : 0);
    try {
      await submitVideoInteraction(id || '1', videoId, {
        watched: true,
        rating: stars,
        watch_duration_seconds: currentSeconds
      });
      clearApiCache(`videos-${id || '1'}`);
      refetchVideos();
    } catch (err) {
      console.error('Failed to log video rating');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto pb-32">
      <div className="flex justify-between items-center px-2">
        <h1 className="text-2xl text-[#0A1128] font-bold">Coaching Videos</h1>
        {isLive && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#2D9596]/10 border border-[#2D9596]/20 rounded-md">
            <Signal className="w-3 h-3 text-[#2D9596]" />
            <span className="text-[10px] font-bold text-[#2D9596] uppercase tracking-wider">Live</span>
          </div>
        )}
      </div>

      <p className="text-sm text-[#5A6B7C] px-2">Videos selected based on your therapy data and progress.</p>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl border border-[#E8EEF2] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-[#0A1128]">Your Progress</span>
          <span className="text-sm text-[#2D9596] font-bold">{watchedCount} / {videos.length} watched</span>
        </div>
        <div className="w-full bg-[#E8EEF2] rounded-full h-2.5">
          <div
            className="bg-[#2D9596] h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${(watchedCount / videos.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Recommended for You */}
      {recommended.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-[#F4A261]" fill="#F4A261" />
            <h2 className="text-sm font-bold text-[#0A1128] uppercase tracking-widest">Recommended for You</h2>
          </div>
          <div className="space-y-3">
            {recommended.map((video: any) => (
              <div
                key={video.id}
                className={`bg-gradient-to-br ${thumbnailGradients[video.category] || 'from-[#2D9596] to-[#1a7273]'} rounded-2xl p-5 text-white shadow-md relative overflow-hidden`}
              >
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="bg-white/20 text-white text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                      {video.triggerReason}
                    </span>
                    {watchedMap[video.id] && (
                      <span className="bg-white/20 text-white text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 uppercase tracking-wider">
                        <CheckCircle className="w-3 h-3" /> Watched
                      </span>
                    )}
                    {ttffMap[video.id] !== undefined && (
                      <span className="bg-[#0A1128]/40 border border-white/30 text-white text-[10px] font-mono px-2.5 py-1 rounded-full font-bold flex items-center gap-1 uppercase tracking-wider shadow-sm animate-in fade-in">
                        ⚡ On-Demand TTFF: {ttffMap[video.id]} ms
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold mb-1">{video.title}</h3>
                  <div className="flex items-center gap-3 text-white/80 text-sm mb-4 font-medium">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {video.duration}</span>
                    <span className="opacity-60">|</span>
                    <span>{video.category}</span>
                  </div>
                  <button type="button"
                    onClick={() => handleWatch(video)}
                    className="w-full bg-white text-[#0A1128] hover:bg-white/90 transition-all font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Play className="w-4 h-4 fill-[#0A1128]" />
                    {watchedMap[video.id] ? 'Watch Again' : 'Watch Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div>
        <h2 className="text-sm font-bold text-[#414D5B] uppercase tracking-widest mb-3 px-2">Library Categories</h2>
        <div className="flex gap-2 overflow-x-auto pb-1 px-1 scrollbar-hide">
          {categories.map((cat: any) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeFilter === cat
                ? 'bg-[#0A1128] text-white shadow-lg'
                : 'bg-white border border-[#E8EEF2] text-[#5A6B7C] hover:border-[#2D9596]/50'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Video List */}
      <div className="space-y-3">
        {filtered.map((video: any) => (
          <div
            key={video.id}
            className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${watchedMap[video.id] ? 'border-[#6A994E]/30' : 'border-[#E8EEF2]'
              }`}
          >
            <div className="flex gap-4 p-4">
              {/* Thumbnail */}
                <button type="button" className="relative w-28 h-20 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden group"
                  onClick={() => handleWatch(video)}
                >
                  <video
                    src={getFullVideoUrl((video.videoType === 'package' && video.parsedClips?.length > 0 ? video.parsedClips[0].url : video.url) || video.video_url) + '#t=1'}
                    preload="metadata"
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                  {watchedMap[video.id]
                    ? <CheckCircle className="w-8 h-8 text-white relative z-10 drop-shadow-md" />
                    : <Play className="w-8 h-8 text-white relative z-10 drop-shadow-md" />
                  }
                  <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                    {video.duration}
                  </div>
                </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                  <div className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${categoryColors[video.category] || 'bg-[#E8EEF2] text-[#5A6B7C]'}`}>
                    {categoryIcons[video.category]}
                    {video.category}
                  </div>
                  {ttffMap[video.id] !== undefined && (
                    <div className="inline-flex items-center gap-1 bg-[#2D9596]/10 border border-[#2D9596]/30 text-[#2D9596] text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                      <span>⚡ On-Demand TTFF: {ttffMap[video.id]} ms</span>
                    </div>
                  )}
                </div>
                <h4 className="text-[#0A1128] font-bold text-sm mb-2 line-clamp-2 leading-snug">{video.title}</h4>

                {/* Star Rating — shown after watched */}
                {watchedMap[video.id] ? (
                  <div className="mt-3 p-3 bg-[#6A994E]/5 border border-[#6A994E]/15 rounded-xl space-y-1.5 animate-in fade-in duration-300">
                    <p className="text-[11px] font-bold text-[#0A1128]">Was this video helpful?</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => handleRating(video.id, star)}
                            className="hover:scale-110 transition-transform"
                          >
                            <Star
                              className="w-3.5 h-3.5 transition-colors"
                              fill={ratingMap[video.id] !== null && ratingMap[video.id]! >= star ? '#F4A261' : 'none'}
                              stroke={ratingMap[video.id] !== null && ratingMap[video.id]! >= star ? '#F4A261' : '#CBD5E1'}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-[9px] font-extrabold text-[#6A994E] uppercase tracking-wider">
                        {ratingMap[video.id] ? '✓ Response Logged' : 'Tap to rate'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <button type="button"
                    onClick={() => handleWatch(video)}
                    className="text-xs text-[#2D9596] font-bold flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-widest"
                  >
                    Watch <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Help Footer */}
      <div className="bg-[#0A1128] rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
        <h4 className="text-lg font-bold mb-1 relative z-10">Can't find what you need?</h4>
        <p className="text-sm text-white/70 mb-4 relative z-10 leading-relaxed">Our clinical team is available to answer any questions about your therapy or equipment setup.</p>
        <button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-xl text-sm font-bold transition-all relative z-10 flex items-center gap-2">
          Contact Support <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Premium Video Player Modal */}
      {activeVideo && (() => {
        const isPackage = activeVideo.videoType === 'package' && activeVideo.parsedClips?.length > 0;
        const currentClip = isPackage
          ? activeVideo.parsedClips[currentClipIndex] || activeVideo.parsedClips[0]
          : activeVideo;
        const mediaUrl = currentClip?.url || currentClip?.video_url || activeVideo.url || activeVideo.video_url;

        const handleEnded = () => {
          if (isPackage && currentClipIndex < activeVideo.parsedClips.length - 1) {
            setCurrentClipIndex(prev => prev + 1);
          }
        };

        const handleCloseModal = async () => {
          const finalSec = watchDurationMapRef.current[activeVideo.id] || 0;
          if (finalSec > 0) {
            try {
              await submitVideoInteraction(id || '1', activeVideo.id, {
                watched: true,
                watch_duration_seconds: finalSec
              });
              clearApiCache(`videos-${id || '1'}`);
              refetchVideos();
            } catch (e) {}
          }
          setActiveVideo(null);
        };

        return (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#0A1128]/85 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl border border-[#E8EEF2] animate-in zoom-in-95 duration-300">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-[#E8EEF2]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-extrabold text-[#2D9596] uppercase tracking-wider block">
                      {activeVideo.category} {isPackage ? `• PART ${currentClipIndex + 1} OF ${activeVideo.parsedClips.length}` : ''}
                    </span>
                    {ttffMs !== null && (
                      <span className="bg-[#2D9596]/10 border border-[#2D9596]/30 text-[#2D9596] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-in fade-in">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2D9596] animate-ping" />
                        KPI • {ttffMs} ms
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-[#0A1128] line-clamp-1">
                    {activeVideo.title} {isPackage && currentClip?.title ? `— ${currentClip.title}` : ''}
                  </h3>
                </div>
                <button 
                  onClick={handleCloseModal}
                  className="w-8 h-8 rounded-full bg-[#E8EEF2] flex items-center justify-center text-[#5A6B7C] hover:bg-gray-200 transition-colors"
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
                  key={`${activeVideo.id}-${currentClipIndex}`}
                  className="w-full h-full" 
                  controls 
                  autoPlay
                  onPlaying={() => {
                    if (videoClickTimeRef.current > 0 && ttffMs === null) {
                      const elapsed = Math.round(performance.now() - videoClickTimeRef.current);
                      setTtffMs(elapsed);
                      if (activeVideo?.id) {
                        setTtffMap(prev => ({ ...prev, [activeVideo.id]: elapsed }));
                      }
                      console.log(`[KPI] Backend -> Mobile Time-to-First-Frame (TTFF): ${elapsed} ms`);
                    }
                  }}
                  onEnded={handleEnded}
                  onTimeUpdate={(e) => {
                    const currentTime = Math.round(e.currentTarget.currentTime || 0);
                    let elapsedSec = currentTime;
                    if (isPackage && activeVideo.parsedClips?.length > 0) {
                      const prevClipsDuration = activeVideo.parsedClips
                        .slice(0, currentClipIndex)
                        .reduce((acc: number, c: any) => acc + (c.duration_s || 0), 0);
                      elapsedSec += prevClipsDuration;
                    }
                    watchDurationMapRef.current[activeVideo.id] = Math.max(
                      watchDurationMapRef.current[activeVideo.id] || 0,
                      elapsedSec
                    );
                  }}
                  src={getFullVideoUrl(mediaUrl || 'https://www.w3schools.com/html/mov_bbb.mp4') + '?cb=' + (activeVideo.id || '1') + '-' + currentClipIndex}
                >
                  <track 
                    src={currentClip?.vtt_en_url || currentClip?.subtitles_en || activeVideo.vtt_en_url || getSubtitleUrl(mediaUrl, 'en')} 
                    kind="subtitles" 
                    srcLang="en" 
                    label="English" 
                    default 
                  />
                  <track 
                    src={currentClip?.vtt_fr_url || currentClip?.subtitles_fr || activeVideo.vtt_fr_url || getSubtitleUrl(mediaUrl, 'fr')} 
                    kind="subtitles" 
                    srcLang="fr" 
                    label="Français" 
                  />
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Quick Feedback Action */}
              <div className="p-5 bg-[#FAFAFA] border-t border-[#E8EEF2] text-center space-y-3">
                <p className="text-xs font-bold text-[#0A1128]">Was this coaching tip helpful?</p>
                <div className="flex justify-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(activeVideo.id, star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className="w-6 h-6 transition-colors"
                        fill={ratingMap[activeVideo.id] !== null && ratingMap[activeVideo.id]! >= star ? '#F4A261' : 'none'}
                        stroke={ratingMap[activeVideo.id] !== null && ratingMap[activeVideo.id]! >= star ? '#F4A261' : '#CBD5E1'}
                      />
                    </button>
                  ))}
                </div>
                {ratingMap[activeVideo.id] && (
                  <p className="text-[10px] font-bold text-[#6A994E] uppercase tracking-wider animate-pulse">
                    ✓ Feedback logged to care portal
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
