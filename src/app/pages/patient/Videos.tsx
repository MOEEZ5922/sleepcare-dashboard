import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';
import { Play, Star, CheckCircle, Clock, BookOpen, Wrench, Lightbulb, Plane, ChevronRight, Signal, Loader2, X } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
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
  const { data: liveVideos, isLoading, error, refetch: refetchVideos } = useApi(() => fetchVideos(id || '1'), {
    dependencies: [id],
    cacheKey: `videos-${id || '1'}`
  });

  // Poll videos from cloud DB every 3 seconds during the demo
  useEffect(() => {
    const interval = setInterval(() => {
      refetchVideos();
    }, 3000);
    return () => clearInterval(interval);
  }, [refetchVideos]);

  const [activeVideo, setActiveVideo] = useState<any | null>(null);

  const isLive = !!(liveVideos && (liveVideos as any).__isLive);
  const rawVideos = (liveVideos as any)?.videos || (liveVideos as any)?.patient || (Array.isArray(liveVideos) ? liveVideos : []);
  const videos = useMemo(() => {
    const list = Array.isArray(rawVideos) ? rawVideos : [];
    return list.map((v: any) => {
      // Normalize duration
      let duration = v.duration;
      if (!duration && typeof v.duration_s === 'number') {
        const minutes = Math.floor(v.duration_s / 60);
        const seconds = v.duration_s % 60;
        duration = `${minutes}:${String(seconds).padStart(2, '0')}`;
      }

      // Normalize triggerReason
      const triggerReason = v.triggerReason || v.trigger_reason || 'General';

      return {
        ...v,
        duration: duration || '3:00',
        triggerReason,
      };
    });
  }, [rawVideos]);

  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [watchedMap, setWatchedMap] = useState<{ [id: string | number]: boolean }>({});
  const [ratingMap, setRatingMap] = useState<{ [id: string | number]: number | null }>({});

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
  const watchedCount = Object.values(watchedMap).filter(Boolean).length;
  const categories = ['All', ...Array.from(new Set(videos.map((v: any) => v.category)))];

  const filtered = activeFilter === 'All'
    ? videos
    : videos.filter((v: any) => v.category === activeFilter);

  const handleWatch = async (video: any) => {
    setActiveVideo(video);
    setWatchedMap(prev => ({ ...prev, [video.id]: true }));
    if (isLive) {
      try {
        await submitVideoInteraction(id || '1', video.id, {
          watched: true,
          watch_duration_seconds: 120 // Demo value
        });
      } catch (err) {
        console.error('Failed to log video watch');
      }
    }
  };

  const handleRating = async (videoId: string | number, stars: number) => {
    setRatingMap(prev => ({ ...prev, [videoId]: stars }));
    if (isLive) {
      try {
        await submitVideoInteraction(id || '1', videoId, {
          watched: true,
          rating: stars,
          watch_duration_seconds: 120
        });
      } catch (err) {
        console.error('Failed to log video rating');
      }
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
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-white/20 text-white text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                      {video.triggerReason}
                    </span>
                    {watchedMap[video.id] && (
                      <span className="bg-white/20 text-white text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 uppercase tracking-wider">
                        <CheckCircle className="w-3 h-3" /> Watched
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
                    src={getFullVideoUrl(video.url || video.video_url) + '#t=1'}
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
                <div className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 uppercase tracking-wider ${categoryColors[video.category] || 'bg-[#E8EEF2] text-[#5A6B7C]'}`}>
                  {categoryIcons[video.category]}
                  {video.category}
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
      {activeVideo && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#0A1128]/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl border border-[#E8EEF2] animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#E8EEF2]">
              <div>
                <span className="text-[10px] font-extrabold text-[#2D9596] uppercase tracking-wider block mb-1">
                  {activeVideo.category}
                </span>
                <h3 className="text-base font-bold text-[#0A1128] line-clamp-1">{activeVideo.title}</h3>
              </div>
              <button 
                onClick={() => setActiveVideo(null)}
                className="w-8 h-8 rounded-full bg-[#E8EEF2] flex items-center justify-center text-[#5A6B7C] hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Canvas */}
            <div className="relative bg-black aspect-video flex items-center justify-center">
              <video 
                key={activeVideo.id}
                className="w-full h-full" 
                controls 
                autoPlay
                crossOrigin="anonymous"
                src={getFullVideoUrl(activeVideo.url || activeVideo.video_url || 'https://www.w3schools.com/html/mov_bbb.mp4') + '?cb=' + (activeVideo.id || '1')}
              >
                <track 
                  src={activeVideo.vtt_en_url || activeVideo.subtitles_en || getSubtitleUrl(activeVideo.url || activeVideo.video_url, 'en')} 
                  kind="subtitles" 
                  srcLang="en" 
                  label="English" 
                  default 
                />
                <track 
                  src={activeVideo.vtt_fr_url || activeVideo.subtitles_fr || getSubtitleUrl(activeVideo.url || activeVideo.video_url, 'fr')} 
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
      )}
    </div>
  );
}
