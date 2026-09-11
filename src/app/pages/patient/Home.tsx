import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useApi, clearApiCache } from '../../hooks/useApi';
import {
  fetchPatientSummary,
  fetchCpapTrends,
  fetchSurveys,
  fetchVideos,
  normalizeVideoList,
  NormalizedCoachingVideo,
  PatientSummary,
  CpapTrends,
  SurveyResponse,
  isLiveResponse,
} from '../../data/api';
import { CoachingVideoModal } from '../../components/CoachingVideoModal';
import { PatientWelcomeCard } from './components/PatientWelcomeCard';
import { TherapyLeakAlert } from './components/TherapyLeakAlert';
import { RequiredSurveyCard } from './components/RequiredSurveyCard';
import { DailyPulseCard } from './components/DailyPulseCard';
import { SleepProgressRings } from './components/SleepProgressRings';
import { WeeklySummaryCard } from './components/WeeklySummaryCard';
import { SleepTipCard } from './components/SleepTipCard';
import { QuickAccessLinks } from './components/QuickAccessLinks';
import { OnboardingCheckInModal } from './components/OnboardingCheckInModal';

export default function PatientHome() {
  const { id } = useParams();
  const navigate = useNavigate();
  const patientId = id || '1';

  const { data: summary, refetch: refetchSummary } = useApi<PatientSummary>(
    () => fetchPatientSummary(patientId),
    {
      dependencies: [patientId],
      cacheKey: `patient-summary-${patientId}`,
    }
  );

  const { data: cpapTrends, refetch: refetchTrends } = useApi<CpapTrends>(
    () => fetchCpapTrends(patientId, 7),
    {
      dependencies: [patientId],
      cacheKey: `cpap-trends-7-${patientId}`,
    }
  );

  const { data: surveyData, refetch: refetchSurveys } = useApi<SurveyResponse>(
    () => fetchSurveys(patientId),
    {
      dependencies: [patientId],
      cacheKey: `surveys-${patientId}`,
    }
  );

  const { data: liveVideos, refetch: refetchVideos } = useApi<any>(
    () => fetchVideos(patientId),
    {
      dependencies: [patientId],
      cacheKey: `videos-${patientId}`,
    }
  );

  useEffect(() => {
    const interval = setInterval(() => {
      refetchSummary();
      refetchTrends();
      refetchSurveys();
      refetchVideos();
    }, 3000);
    return () => clearInterval(interval);
  }, [refetchSummary, refetchTrends, refetchSurveys, refetchVideos]);

  useEffect(() => {
    localStorage.setItem(`has-visited-dashboard-${patientId}`, 'true');
  }, [patientId]);

  const isLive = isLiveResponse(summary);
  const [onboardingStep, setOnboardingStep] = useState<'welcome' | 'video' | null>(null);
  const [activeVideo, setActiveVideo] = useState<NormalizedCoachingVideo | null>(null);

  const videos = useMemo(() => normalizeVideoList(liveVideos), [liveVideos]);

  const unwatchedVideos = useMemo(
    () => videos.filter((v) => !v.watched && v.relevance === 'high'),
    [videos]
  );

  const popupVideo = useMemo(() => {
    if (unwatchedVideos.length === 0) return null;
    return [...unwatchedVideos].sort((a, b) => {
      const relA = a.relevance === 'high' ? 1 : 0;
      const relB = b.relevance === 'high' ? 1 : 0;
      if (relA !== relB) return relB - relA;
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    })[0];
  }, [unwatchedVideos]);

  useEffect(() => {
    if (popupVideo) {
      const key = `dismissed-video-popup-${patientId}-${popupVideo.id}`;
      const wasDismissed = sessionStorage.getItem(key);
      if (wasDismissed) {
        setOnboardingStep(null);
      } else if (onboardingStep === null) {
        setOnboardingStep('welcome');
      }
    } else {
      setOnboardingStep(null);
    }
  }, [popupVideo?.id, patientId]);

  const handleDismissPopup = () => {
    if (popupVideo) {
      sessionStorage.setItem(`dismissed-video-popup-${patientId}-${popupVideo.id}`, 'true');
    }
    setOnboardingStep(null);
  };

  const handleWatchGuide = () => {
    if (popupVideo) {
      sessionStorage.setItem(`dismissed-video-popup-${patientId}-${popupVideo.id}`, 'true');
      setActiveVideo(popupVideo);
    }
    setOnboardingStep(null);
  };

  const usageHistory = cpapTrends?.usageHistory || [];
  const lastNightHours =
    usageHistory.length > 0 ? usageHistory[usageHistory.length - 1]?.hours || 0 : 0;
  const weeklyAverage = cpapTrends?.averageHours || 0;
  const streak = cpapTrends?.streak || 0;

  const nextSurvey = surveyData?.patient?.next;
  const surveyDueDate = nextSurvey?.dueDate ? new Date(nextSurvey.dueDate) : null;
  const surveyDaysLeft = surveyDueDate
    ? Math.max(0, Math.ceil((surveyDueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="patient-page">
      <PatientWelcomeCard patientName={summary?.name} isLive={isLive} />

      <div className="space-y-4">
        {cpapTrends && cpapTrends.percentileLeak > 20 && popupVideo && (
          <TherapyLeakAlert
            percentileLeak={cpapTrends.percentileLeak}
            video={popupVideo}
            onWatchVideo={setActiveVideo}
            onCheckFit={() => navigate(`/patient/${patientId}/help`)}
          />
        )}

        <RequiredSurveyCard
          surveyName={nextSurvey?.name || 'Health Survey'}
          daysLeft={surveyDaysLeft}
          questionsCount={nextSurvey?.questions || 8}
          onOpenSurvey={() => navigate(`/patient/${patientId}/surveys`)}
        />
      </div>

      <DailyPulseCard patientId={patientId} />

      <SleepProgressRings lastNightHours={lastNightHours} streak={streak} />

      <WeeklySummaryCard
        weeklyAverage={weeklyAverage}
        daysUsed={Math.min(usageHistory.length, 7)}
      />

      <SleepTipCard />

      <QuickAccessLinks
        onGoToVideos={() => navigate(`/patient/${patientId}/videos`)}
        onGoToHelp={() => navigate(`/patient/${patientId}/help`)}
      />

      <div className="bg-light-blue/30 rounded-3xl p-6 border border-light-blue/60 text-center space-y-2">
        <p className="text-xs text-slate-muted font-semibold leading-relaxed">
          🔒 <span className="font-bold text-blue-gray">Your Sleep Care is Private:</span> SleepCare uses clinical-grade, HIPAA-compliant encryption. Your medical team actively reviews your CPAP comfort statistics to support your health.
        </p>
      </div>

      <OnboardingCheckInModal
        step={onboardingStep}
        patientName={summary?.name}
        popupVideo={popupVideo}
        onNextStep={() => setOnboardingStep('video')}
        onWatchGuide={handleWatchGuide}
        onGoToDashboard={handleDismissPopup}
      />

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