import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router';
import {
  Play,
  Star,
  CheckCircle,
  Clock,
  BookOpen,
  Wrench,
  Lightbulb,
  Plane,
  ChevronRight,
  Signal,
  Loader2,
} from 'lucide-react';
import { useApi, clearApiCache } from '../../hooks/useApi';
import {
  fetchVideos,
  submitVideoInteraction,
  getVideoPreviewUrl,
  normalizeVideoList,
  NormalizedCoachingVideo,
  isLiveResponse,
} from '../../data/api';
import { CoachingVideoModal } from '../../components/CoachingVideoModal';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Mask & Equipment': <Wrench className="w-3.5 h-3.5" />,
  'Tips & Tricks': <Lightbulb className="w-3.5 h-3.5" />,
  'Maintenance': <CheckCircle className="w-3.5 h-3.5" />,
  'Understanding Your Data': <BookOpen className="w-3.5 h-3.5" />,
  'Lifestyle': <Plane className="w-3.5 h-3.5" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  'Mask & Equipment': 'bg-coral/10 text-coral',
  'Tips & Tricks': 'bg-amber/10 text-amber',
  'Maintenance': 'bg-sage/10 text-sage',
  'Understanding Your Data': 'bg-teal/10 text-teal',
  'Lifestyle': 'bg-navy/10 text-navy',
};

const THUMBNAIL_GRADIENTS: Record<string, string> = {
  'Mask & Equipment': 'from-coral to-coral/80',
  'Tips & Tricks': 'from-amber to-amber/80',
  'Maintenance': 'from-sage to-sage/80',
  'Understanding Your Data': 'from-teal to-teal/80',
  'Lifestyle': 'from-navy to-navy/80',
};

export default function PatientVideos() {
  const { id } = useParams();
  const patientId = id || '1';

  useEffect(() => {
    localStorage.setItem(`has-visited-videos-${patientId}`, 'true');
  }, [patientId]);

  const { data: liveVideos, isLoading, refetch: refetchVideos } = useApi(
    () => fetchVideos(patientId),
    {
      dependencies: [patientId],
      cacheKey: `videos-${patientId}`,
    }
  );

  useEffect(() => {
    const interval = setInterval(() => {
      refetchVideos(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [refetchVideos]);

  const [activeVideo, setActiveVideo] = useState<NormalizedCoachingVideo | null>(null);
  const isLive = isLiveResponse(liveVideos);
  const videos = useMemo(() => normalizeVideoList(liveVideos), [liveVideos]);

  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [watchedMap, setWatchedMap] = useState<Record<string | number, boolean>>({});
  const [ratingMap, setRatingMap] = useState<Record<string | number, number | null>>({});

  useEffect(() => {
    if (videos.length > 0) {
      setWatchedMap(Object.fromEntries(videos.map((v) => [v.id, Boolean(v.watched)])));
      setRatingMap(Object.fromEntries(videos.map((v) => [v.id, v.rating ?? null])));
    }
  }, [videos]);

  if (isLoading && videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-teal animate-spin" />
      </div>
    );
  }

  const recommended = videos.filter((v) => v.relevance === 'high');
  const libraryVideos =
    recommended.length > 0 ? videos.filter((v) => v.relevance !== 'high') : videos;

  const watchedCount = Object.values(watchedMap).filter(Boolean).length;
  const categories = ['All', ...Array.from(new Set(libraryVideos.map((v) => v.category)))];

  const filtered =
    activeFilter === 'All'
      ? libraryVideos
      : libraryVideos.filter((v) => v.category === activeFilter);

  const handleWatch = (video: NormalizedCoachingVideo) => {
    setActiveVideo(video);
    setWatchedMap((prev) => ({ ...prev, [video.id]: true }));
    localStorage.setItem(`has-watched-video-${patientId}`, 'true');
  };

  const handleRating = async (
    videoId: string | number,
    stars: number,
    durationSeconds: number = 0
  ) => {
    setRatingMap((prev) => ({ ...prev, [videoId]: stars }));
    localStorage.setItem(`has-watched-video-${patientId}`, 'true');

    try {
      await submitVideoInteraction(patientId, videoId, {
        watched: true,
        rating: stars,
        watch_duration_seconds: Math.round(durationSeconds),
      });
      clearApiCache(`videos-${patientId}`);
      refetchVideos();
    } catch (err) {
      console.error('Failed to log video rating:', err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto pb-32">
      <div className="flex justify-between items-center px-2">
        <h1 className="text-2xl text-navy font-bold">Coaching Videos</h1>
        {isLive && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-teal/10 border border-teal/20 rounded-md">
            <Signal className="w-3 h-3 text-teal" />
            <span className="text-[10px] font-bold text-teal uppercase tracking-wider">Live</span>
          </div>
        )}
      </div>

      <p className="text-sm text-slate-muted px-2">
        Videos selected based on your therapy data and progress.
      </p>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl border border-light-blue p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-navy">Your Progress</span>
          <span className="text-sm text-teal font-bold">
            {watchedCount} / {videos.length} watched
          </span>
        </div>
        <div className="w-full bg-light-blue rounded-full h-2.5">
          <div
            className="bg-teal h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${(watchedCount / (videos.length || 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Recommended Section */}
      {recommended.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-amber" fill="var(--color-amber)" />
            <h2 className="text-sm font-bold text-navy uppercase tracking-widest">
              Recommended for You
            </h2>
          </div>
          <div className="space-y-3">
            {recommended.map((video) => (
              <div
                key={video.id}
                className={`bg-gradient-to-br ${
                  THUMBNAIL_GRADIENTS[video.category] || 'from-teal to-teal/80'
                } rounded-2xl p-5 text-white shadow-md relative overflow-hidden`}
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
                  </div>
                  <h3 className="text-lg font-bold mb-1">{video.title}</h3>
                  <div className="flex items-center gap-3 text-white/80 text-sm mb-4 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {video.duration}
                    </span>
                    <span className="opacity-60">|</span>
                    <span>{video.category}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleWatch(video)}
                    className="w-full bg-white text-navy hover:bg-white/90 transition-all font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Play className="w-4 h-4 fill-navy" />
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
        <h2 className="text-sm font-bold text-blue-gray uppercase tracking-widest mb-3 px-2">
          Library Categories
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-1 px-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeFilter === cat
                  ? 'bg-navy text-white shadow-lg'
                  : 'bg-white border border-light-blue text-slate-muted hover:border-teal/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Video List */}
      <div className="space-y-3">
        {filtered.map((video) => (
          <div
            key={video.id}
            className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
              watchedMap[video.id] ? 'border-sage/30' : 'border-light-blue'
            }`}
          >
            <div className="flex gap-4 p-4">
              <button
                type="button"
                className="relative w-28 h-20 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden group"
                onClick={() => handleWatch(video)}
              >
                <video
                  src={getVideoPreviewUrl(video)}
                  preload="metadata"
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                {watchedMap[video.id] ? (
                  <CheckCircle className="w-8 h-8 text-white relative z-10 drop-shadow-md" />
                ) : (
                  <Play className="w-8 h-8 text-white relative z-10 drop-shadow-md" />
                )}
                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                  {video.duration}
                </div>
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                  <div
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      CATEGORY_COLORS[video.category] || 'bg-light-blue text-slate-muted'
                    }`}
                  >
                    {CATEGORY_ICONS[video.category]}
                    {video.category}
                  </div>
                </div>
                <h4 className="text-navy font-bold text-sm mb-2 line-clamp-2 leading-snug">
                  {video.title}
                </h4>

                {watchedMap[video.id] ? (
                  <div className="mt-3 p-3 bg-sage/5 border border-sage/15 rounded-xl space-y-1.5 animate-in fade-in duration-300">
                    <p className="text-[11px] font-bold text-navy">Was this video helpful?</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isFilled = ratingMap[video.id] !== null && ratingMap[video.id]! >= star;
                          return (
                            <button
                              key={star}
                              onClick={() => handleRating(video.id, star, video.duration_s)}
                              className="hover:scale-110 transition-transform"
                            >
                              <Star
                                className="w-3.5 h-3.5 transition-colors"
                                fill={isFilled ? 'var(--color-amber)' : 'none'}
                                stroke={isFilled ? 'var(--color-amber)' : 'var(--color-light-blue)'}
                              />
                            </button>
                          );
                        })}
                      </div>
                      <span className="text-[9px] font-extrabold text-sage uppercase tracking-wider">
                        {ratingMap[video.id] ? '✓ Response Logged' : 'Tap to rate'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleWatch(video)}
                    className="text-xs text-teal font-bold flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-widest"
                  >
                    Watch <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Help Banner */}
      <div className="bg-navy rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
        <h4 className="text-lg font-bold mb-1 relative z-10">Can't find what you need?</h4>
        <p className="text-sm text-white/70 mb-4 relative z-10 leading-relaxed">
          Our clinical team is available to answer any questions about your therapy or equipment
          setup.
        </p>
        <button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-xl text-sm font-bold transition-all relative z-10 flex items-center gap-2">
          Contact Support <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Modal */}
      <CoachingVideoModal
        isOpen={Boolean(activeVideo)}
        onClose={() => setActiveVideo(null)}
        video={activeVideo}
        patientId={patientId}
        onVideoCompleted={() => {
          clearApiCache(`videos-${patientId}`);
          refetchVideos();
        }}
      />
    </div>
  );
}
