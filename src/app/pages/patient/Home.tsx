import React, { useState } from 'react';
import { Moon, Flame, ChevronRight, Package, FileText, Sparkles, Video, HelpCircle, X, AlertCircle, Play, Signal, Loader2, Star } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { useApi } from '../../hooks/useApi';
import {
  fetchPatientSummary,
  fetchCpapTrends,
  fetchSurveys,
  submitSurveyResponse,
  fetchVideos,
  submitVideoInteraction,
  getFullVideoUrl,
  PatientSummary,
  CpapTrends,
  SurveyResponse
} from '../../data/api';

function getSubtitleUrl(videoUrl: string | null | undefined, lang: 'en' | 'fr'): string {
  if (!videoUrl) return '';
  if (videoUrl.includes('/videos/existing/') || videoUrl.includes('/videos/new/')) {
    const base = videoUrl.replace(/\/videos\/(existing|new)\//, '/subtitles/');
    const index = base.lastIndexOf('.');
    if (index !== -1) {
      const withoutExt = base.substring(0, index);
      if (lang === 'fr' && withoutExt.endsWith('_en')) {
        return withoutExt.substring(0, withoutExt.length - 3) + '_fr.vtt';
      }
      if (lang === 'en' && withoutExt.endsWith('_fr')) {
        return withoutExt.substring(0, withoutExt.length - 3) + '_en.vtt';
      }
      return withoutExt + '.vtt';
    }
  }
  return '';
}

export default function PatientHome() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: summary, error: summaryError, refetch: refetchSummary } = useApi<PatientSummary>(() => fetchPatientSummary(id || '1'), {
    dependencies: [id],
    cacheKey: `patient-summary-${id || '1'}`
  });
  const { data: cpapTrends, error: cpapError, refetch: refetchTrends } = useApi<CpapTrends>(() => fetchCpapTrends(id || '1', 7), {
    dependencies: [id],
    cacheKey: `cpap-trends-7-${id || '1'}`
  });
  const { data: surveyData, error: surveyError, refetch: refetchSurveys } = useApi<SurveyResponse>(() => fetchSurveys(id || '1'), {
    dependencies: [id],
    cacheKey: `surveys-${id || '1'}`
  });
  const { data: liveVideos, refetch: refetchVideos } = useApi<any[]>(() => fetchVideos(id || '1'), {
    dependencies: [id],
    cacheKey: `videos-${id || '1'}`
  });

  // Poll Cloud DB every 3 seconds for real-time edge triggers written by RPi
  React.useEffect(() => {
    const interval = setInterval(() => {
      refetchSummary();
      refetchTrends();
      refetchSurveys();
      refetchVideos(); // added to refresh videos
    }, 3000);
    return () => clearInterval(interval);
  }, [refetchSummary, refetchTrends, refetchSurveys, refetchVideos]);

  const isLive = !!(summary && (summary as any).__isLive);

  const [showVideoBanner, setShowVideoBanner] = useState(true);
  const [showMicroSurvey, setShowMicroSurvey] = useState(true);
  const [surveyResponse, setSurveyResponse] = useState<string | null>(null);
  const [onboardingStep, setOnboardingStep] = useState<'welcome' | 'video' | null>('welcome');
  const [activeVideo, setActiveVideo] = useState<any | null>(null);
  const [ratingMap, setRatingMap] = useState<{ [id: string | number]: number | null }>({});

  const handleRating = async (videoId: string | number, stars: number) => {
    setRatingMap(prev => ({ ...prev, [videoId]: stars }));
    try {
      await submitVideoInteraction(id || '1', videoId, {
        watched: true,
        rating: stars,
        watch_duration_seconds: 120
      });
    } catch (err) {
      console.error('Failed to log video rating');
    }
  };

  const rawVideos = (liveVideos as any)?.videos || (liveVideos as any)?.patient || (Array.isArray(liveVideos) ? liveVideos : []);
  const videos = Array.isArray(rawVideos) ? rawVideos : [];

  // Loading state – wait for API data before selecting a comfort video
  const isLoadingVideos = !liveVideos;

  // Prioritize high relevance videos and select the newest one (by created_at), falling back to the first video
  const comfortVideo = React.useMemo(() => {
    if (videos.length === 0) return null;
    const highRelevance = videos.filter((v: any) => v.relevance === 'high');
    if (highRelevance.length > 0) {
      const sortedHigh = [...highRelevance].sort((a: any, b: any) => {
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (a.created_at) return -1;
        if (b.created_at) return 1;
        return 0; // fallback to default backend ordering if no timestamps
      });
      return sortedHigh[0];
    }
    return videos[0];
  }, [videos]);

  // Derive data from CPAP trends API
  const usageHistory = cpapTrends?.usageHistory || [];
  const lastNightHours = usageHistory.length > 0 ? usageHistory[usageHistory.length - 1]?.hours || 0 : 0;
  const percentComplete = Math.min((lastNightHours / 8) * 100, 100);
  const weeklyAverage = cpapTrends?.averageHours || 0;
  const streak = cpapTrends?.streak || 0;

  // Derive survey info from API
  const nextSurvey = surveyData?.patient?.next;
  const surveyDueDate = nextSurvey?.dueDate ? new Date(nextSurvey.dueDate) : null;
  const surveyDaysLeft = surveyDueDate ? Math.max(0, Math.ceil((surveyDueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;
  const surveyName = nextSurvey?.name || 'Health Survey';
  const surveyQuestions = nextSurvey?.questions || 8;
  const surveyProgress = 0; // Will come from a future API field

  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto pb-32">
      {/* Senior-Friendly Patient Welcome & Story */}
      <div className="bg-white rounded-3xl p-8 border-2 border-[#E8EEF2] shadow-sm mb-4 relative overflow-hidden">
        {/* Soft decorative accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#2D9596]/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1128] leading-tight">
              Hello, {summary?.name?.split(' ')[0] || 'Friend'}. <br className="hidden sm:block" /> We are so glad you are here.
            </h1>
            {isLive && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#6A994E]/10 border border-[#6A994E]/20 rounded-lg shrink-0">
                <Signal className="w-4 h-4 text-[#6A994E]" />
                <span className="text-xs font-bold text-[#6A994E] uppercase tracking-wider">Connected</span>
              </div>
            )}
          </div>
          <div className="space-y-5 text-[#0A1128] leading-relaxed text-lg sm:text-xl max-w-3xl">
            <p>
              Getting used to a CPAP machine takes time. It is a new habit for your body.
            </p>
            <p>
              You might feel frustrated on some nights, and that is completely normal. Remember, every single day you try, you are taking a brave step to protect your health.
            </p>
            <div className="bg-[#FAFAFA] p-5 rounded-2xl border-2 border-[#E8EEF2] mt-6">
              <p className="font-bold text-[#2D9596] mb-2">A Guided Way</p>
              <p>
                We made this app to be simple. Think of it as your personal guide. We will help you adjust your mask and get comfortable, step-by-step, until you get a good night's sleep.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Minute Objective: Action Center */}
      <div className="space-y-4">
        {/* Persistent AI Trigger (Dynamic based on leak) */}
        {cpapTrends && cpapTrends.percentileLeak > 20 && (
          <div className="bg-gradient-to-br from-[#0A1128] to-[#1E293B] text-white rounded-[2rem] p-8 shadow-2xl relative overflow-hidden border border-white/10 animate-in zoom-in-95 duration-500">
            <div className="flex items-start gap-6">
              <div
                onClick={() => { if (comfortVideo) setActiveVideo(comfortVideo); }}
                className="w-16 h-16 bg-[#F4A261]/20 rounded-[1.25rem] flex items-center justify-center flex-shrink-0 relative overflow-hidden group cursor-pointer shadow-lg"
              >
                <img src="https://images.unsplash.com/photo-1584515979956-d9f7e5d099f3?auto=format&fit=crop&q=80&w=150" alt="Video thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all scale-110 group-hover:scale-100" />
                <div className="absolute inset-0 bg-[#F4A261]/20 group-hover:bg-transparent transition-all" />
                <Play className="w-8 h-8 text-white relative z-10 drop-shadow-md" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#F4A261] animate-pulse" />
                  <span className="text-[#F4A261] font-bold text-xs uppercase tracking-widest">Comfort & Fit Guide</span>
                </div>
                <h3 className="text-xl font-bold mb-4 leading-tight">Your mask had a tiny leak of {cpapTrends.percentileLeak} L/min last night. Let's optimize it for deeper comfort in 60s!</h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => { if (comfortVideo) setActiveVideo(comfortVideo); }}
                    disabled={!comfortVideo}
                    className={`bg-[#2D9596] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#247c7d] transition-all shadow-lg active:scale-95 text-xs ${comfortVideo ? '' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                  >
                    View Comfort Tip (1 min)
                  </button>
                  <button onClick={() => navigate(`/patient/${id}/help`)} className="text-white/60 text-xs hover:text-white transition-colors">
                    Check Mask Fit →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Persistent Survey Reminder */}
        <div className="bg-gradient-to-br from-[#6A994E] to-[#2D9596] rounded-[2rem] p-8 text-white shadow-xl">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block mb-2">Required Survey</div>
              <h2 className="text-2xl font-bold italic">"How is your sleep tonight?"</h2>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner">
              <FileText className="w-7 h-7" />
            </div>
          </div>
          <div className="mb-6">
            <p className="text-white/90 leading-relaxed mb-3">
              Your clinical team needs the {surveyName} survey to calibrate your therapy. <br />
              <span className="font-bold">Due in {surveyDaysLeft} days.</span>
            </p>
            <div className="flex items-center justify-between text-xs font-semibold text-white/80 mb-1">
              <span>Progress</span>
              <span>0/{surveyQuestions} Questions</span>
            </div>
            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
              <div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: `${surveyProgress}%` }} />
            </div>
          </div>
          <button
            onClick={() => navigate(`/patient/${id}/surveys`)}
            className="flex items-center justify-center gap-3 w-full bg-white text-[#2D9596] py-5 rounded-2xl font-bold hover:bg-[#f0f9f9] transition-all shadow-xl active:scale-98"
          >
            Finish Survey
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* 1-Tap Micro-Check (State of the Art Micro-UX) */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border-2 border-[#E8EEF2] relative group hover:border-[#2D9596]/30 transition-all">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-[#2D9596]/10 rounded-[1.25rem] flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Sparkles className="w-6 h-6 text-[#2D9596]" />
          </div>
          <div>
            <h3 className="text-[#0A1128] font-bold text-lg">Daily Pulse</h3>
            <p className="text-sm text-[#414D5B]">Did you feel rested this morning?</p>
          </div>
        </div>

        <div className="flex gap-3">
          {['Good 👍', 'Okay 😐', 'Bad 👎'].map((rating) => (
            <button
              key={rating}
              onClick={async () => {
                setSurveyResponse(rating);
                try {
                  await submitSurveyResponse(id || '1', 'daily-pulse', {
                    answers: [{ question_id: 'restful_feeling', value: rating }]
                  });
                } catch (e) {
                  console.error('Failed to submit pulse');
                }
                setTimeout(() => setShowMicroSurvey(false), 1500);
              }}
              className={`flex-1 py-4 rounded-xl border-2 transition-all font-bold text-sm ${surveyResponse === rating
                  ? 'border-[#2D9596] bg-[#2D9596]/10 text-[#2D9596]'
                  : 'border-[#E8EEF2] text-[#414D5B] hover:border-[#2D9596]/50 shadow-sm'
                }`}
            >
              {rating}
            </button>
          ))}
        </div>
        {surveyResponse && (
          <p className="text-center text-sm text-[#6A994E] font-bold mt-4 animate-pulse">
            Thanks! Your care team has been updated.
          </p>
        )}
      </div>

      {/* Sleep Progress Rings */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <h3 className="text-xl text-[#0A1128] mb-6">Last Night's Progress</h3>

        <div className="grid grid-cols-2 gap-8">
          {/* Hours Ring */}
          <div className="text-center">
            <div className="relative w-36 h-36 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  stroke="#E8EEF2"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  stroke="url(#sleepGradient)"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={`${percentComplete * 4.02} 402`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="sleepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6A994E" />
                    <stop offset="100%" stopColor="#2D9596" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Moon className="w-6 h-6 text-[#2D9596] mb-1" />
                <p className="text-3xl font-bold text-[#0A1128]">
                  {lastNightHours.toFixed(1)}
                </p>
                <p className="text-xs text-[#5A6B7C]">hours</p>
              </div>
            </div>
            <p className="text-sm text-[#5A6B7C]">Sleep with Therapy</p>
            <p className="text-lg font-semibold text-[#6A994E] mt-1">
              {lastNightHours >= 6 ? 'Excellent!' : lastNightHours >= 4 ? 'Good Job!' : 'Keep Going!'}
            </p>
          </div>

          {/* Streak Ring */}
          <div className="text-center">
            <div className="relative w-36 h-36 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  stroke="#E8EEF2"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  stroke="#F4A261"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={`${Math.min((streak / 7) * 100, 100) * 4.02} 402`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Flame className="w-6 h-6 text-[#F4A261] mb-1" />
                <p className="text-3xl font-bold text-[#0A1128]">
                  {streak}
                </p>
                <p className="text-xs text-[#5A6B7C]">days</p>
              </div>
            </div>
            <p className="text-sm text-[#5A6B7C]">Current Streak</p>
            <p className="text-lg font-semibold text-[#F4A261] mt-1">
              {streak >= 7 ? '🔥 On Fire!' : 'Building Momentum!'}
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="bg-gradient-to-br from-[#2D9596] to-[#1a7a7b] rounded-3xl p-8 text-white shadow-lg">
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
            <span className="text-2xl font-bold">{Math.min(usageHistory.length, 7)}/7</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/90">Consistency</span>
            <span className="text-2xl font-bold">
              {weeklyAverage >= 6 ? '⭐⭐⭐' : weeklyAverage >= 4 ? '⭐⭐' : '⭐'}
            </span>
          </div>
        </div>
      </div>

      {/* Motivational Card */}
      <div className="bg-gradient-to-br from-[#F4A261] to-[#e39350] rounded-3xl p-8 text-white shadow-lg">
        <h3 className="text-xl font-bold mb-3">💡 Sleep Better Tip</h3>
        <p className="text-white/95 text-lg leading-relaxed">
          "Try wearing your mask for 30 minutes before bed while reading or watching TV.
          This helps your body get comfortable with the therapy before sleep."
        </p>
      </div>

      {/* Quick Access Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate(`/patient/${id}/videos`)}
          className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8EEF2] hover:shadow-md transition-all text-center"
        >
          <Video className="w-8 h-8 text-[#2D9596] mx-auto mb-2" />
          <p className="text-sm font-medium text-[#0A1128]">Comfort Tips</p>
        </button>
        <button
          onClick={() => navigate(`/patient/${id}/help`)}
          className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8EEF2] hover:shadow-md transition-all text-center"
        >
          <HelpCircle className="w-8 h-8 text-[#F4A261] mx-auto mb-2" />
          <p className="text-sm font-medium text-[#0A1128]">Get Help</p>
        </button>
      </div>

      {/* Reassuring Clinical Trust Footer */}
      <div className="bg-[#E8EEF2]/30 rounded-3xl p-6 border border-[#E8EEF2]/60 text-center space-y-2">
        <p className="text-xs text-[#5A6B7C] font-semibold leading-relaxed">
          🔒 <span className="font-bold text-[#414D5B]">Your Sleep Care is Private:</span> SleepCare uses clinical-grade, HIPAA-compliant encryption. Your medical team actively reviews your CPAP comfort statistics to support your health.
        </p>
      </div>

      {/* Guided Onboarding Step 1: Encouragement Buffer */}
      {onboardingStep === 'welcome' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A1128]/70 backdrop-blur-md animate-in fade-in duration-500">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border border-[#E8EEF2] animate-in zoom-in-95 duration-500 relative overflow-hidden text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-[#2D9596]/20 to-[#6A994E]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-12 h-12 text-[#2D9596]" />
            </div>
            <h2 className="text-3xl font-bold text-[#0A1128] mb-4">You're doing great!</h2>
            <p className="text-[#414D5B] text-lg leading-relaxed mb-8 px-2">
              Adjusting to CPAP therapy takes time, and every night you try is a huge step forward.
              We are here to guide you to a perfect night's rest. Let's check today's tip!
            </p>
            <button
              onClick={() => setOnboardingStep('video')}
              className="w-full bg-[#0A1128] text-white font-bold py-4 rounded-2xl text-lg hover:bg-[#1E293B] shadow-xl hover:scale-[1.02] transition-all"
            >
              Show My Daily Tip
            </button>
          </div>
        </div>
      )}

      {/* Guided Onboarding Step 2: Reassuring Care Check-In Modal */}
      {onboardingStep === 'video' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A1128]/70 backdrop-blur-md">
          <div className="bg-white rounded-[2.25rem] p-8 max-w-sm w-full shadow-2xl border border-[#E8EEF2] animate-in slide-in-from-bottom-8 duration-500 relative overflow-hidden">
            {/* Top decorative clinical seal */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#2D9596] to-[#6A994E]" />

            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 bg-[#6A994E]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-[#6A994E]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0A1128]">Daily Care Check-In</h3>
                <p className="text-xs text-[#5A6B7C] font-semibold">Supporting your sleep journey</p>
              </div>
            </div>

            <p className="text-sm text-[#414D5B] mb-5 leading-relaxed">
              Hello <span className="font-bold text-[#0A1128]">{summary?.name || 'there'}</span>! Your SleepCare portal is fully connected.
            </p>

            <div
              onClick={() => { setActiveVideo(comfortVideo); setOnboardingStep(null); }}
              className="relative w-full h-36 bg-gray-100 rounded-2xl mb-5 overflow-hidden group cursor-pointer shadow-sm border border-[#E8EEF2]"
            >
              <img src="https://images.unsplash.com/photo-1584515979956-d9f7e5d099f3?auto=format&fit=crop&q=80&w=400" alt="Video thumbnail" className="w-full h-full object-cover opacity-90 group-hover:scale-102 transition-transform duration-500" />
              <div className="absolute inset-0 bg-[#0A1128]/10 group-hover:bg-[#0A1128]/5 transition-colors flex items-center justify-center">
                <div className="w-12 h-12 bg-white/95 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform">
                  <Play className="w-5 h-5 text-[#2D9596] ml-1" />
                </div>
              </div>
            </div>

            <p className="text-xs text-[#5A6B7C] mb-6 leading-relaxed bg-[#FAFAFA] p-3.5 rounded-xl border border-[#E8EEF2]">
              🛡️ <span className="font-bold text-[#0A1128]">Clinical Tip:</span> To help you sleep deeper tonight, your care team prepared a custom guide: <span className="font-semibold text-[#0A1128]">"{comfortVideo?.title || 'Comfort Guide'}"</span> ({comfortVideo?.duration || '1:00'}).
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => { if (comfortVideo) { setActiveVideo(comfortVideo); setOnboardingStep(null); } }}
                className="w-full bg-[#2D9596] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#2D9596]/15 hover:bg-[#247c7d] transition-all hover:shadow-xl hover:scale-[1.01]"
              >
                Watch Guide ({comfortVideo?.duration || '1:00'})
              </button>
              <button
                onClick={() => setOnboardingStep(null)}
                className="w-full bg-[#FAFAFA] text-[#5A6B7C] font-semibold py-3.5 rounded-xl border border-[#E8EEF2] hover:bg-[#E8EEF2]/50 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Video Player Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#0A1128]/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl border border-[#E8EEF2] animate-in zoom-in-95 duration-300 flex flex-col">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#E8EEF2]">
              <div>
                <span className="text-[10px] font-extrabold text-[#2D9596] uppercase tracking-wider block mb-1">
                  {activeVideo.category || 'Video'}
                </span>
                <h3 className="text-base font-bold text-[#0A1128] line-clamp-1">{activeVideo.title || 'Comfort Tip'}</h3>
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
                src={getFullVideoUrl(activeVideo.url || activeVideo.video_url || '') + '?cb=' + (activeVideo.id || '1')}
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