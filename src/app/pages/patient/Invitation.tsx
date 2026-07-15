import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { Sparkles, Home, Activity, Package, FileText, Video, HelpCircle, ArrowRight, Signal, Loader2, CheckCircle, Circle } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { fetchPatientSummary, fetchCpapTrends, fetchSurveys, fetchVideos, fetchDevices } from '../../data/api';

export default function PatientInvitation() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. Fetch Patient Summary (greeting & name)
  const { data: summary, isLoading: isSumLoading } = useApi(() => fetchPatientSummary(id || '1'), {
    dependencies: [id],
    cacheKey: `patient-summary-${id || '1'}`
  });

  // 2. Fetch CPAP Trends (for usage stats / streak tracking)
  const { data: cpapTrends, isLoading: isCpapLoading } = useApi(() => fetchCpapTrends(id || '1', 7), {
    dependencies: [id],
    cacheKey: `cpap-trends-7-${id || '1'}`
  });

  // 3. Fetch Surveys (to see if patient has survey history)
  const { data: surveyData, isLoading: isSurveyLoading } = useApi(() => fetchSurveys(id || '1'), {
    dependencies: [id],
    cacheKey: `surveys-${id || '1'}`
  });

  // 4. Fetch Assigned Videos (to check if any video has been watched)
  const { data: liveVideos, isLoading: isVideoLoading } = useApi(() => fetchVideos(id || '1'), {
    dependencies: [id],
    cacheKey: `videos-${id || '1'}`
  });

  // 5. Fetch Connected Sensor Hardware Devices
  const { data: liveDevices, isLoading: isDevicesLoading } = useApi(() => fetchDevices(id || '1'), {
    dependencies: [id],
    cacheKey: `devices-${id || '1'}`
  });

  const isLoading = isSumLoading || isCpapLoading || isSurveyLoading || isVideoLoading || isDevicesLoading;

  // Track dashboard visits using state sync'd with local storage
  const [hasVisitedDashboard, setHasVisitedDashboard] = React.useState(() => {
    return localStorage.getItem(`has-visited-dashboard-${id || '1'}`) === 'true';
  });

  // Dynamic values based on backend response
  const firstName = (summary?.name && summary.name !== 'NaN') ? summary.name.split(' ')[0] : 'Friend';
  const hasSleepStats = (cpapTrends?.usageHistory?.length || 0) > 0;
  const hasSurveysHistory = (surveyData?.patient?.history?.length || 0) > 0;
  const rawVideos = (liveVideos as any)?.videos || (liveVideos as any)?.patient || (Array.isArray(liveVideos) ? liveVideos : []);
  const hasWatchedVideo = Array.isArray(rawVideos) ? rawVideos.some((v: any) => v.watched) : false;
  const deviceList = Array.isArray(liveDevices) ? liveDevices : ((liveDevices as any)?.devices || []);
  const hasConnectedSensors = deviceList.length > 0;

  // Automatically route to main dashboard on logins only when ALL onboarding checklist items are completed
  const allStepsCompleted = hasVisitedDashboard && hasWatchedVideo && hasSleepStats && hasConnectedSensors && hasSurveysHistory;

  React.useEffect(() => {
    if (!isLoading && allStepsCompleted) {
      navigate(`/patient/${id || '1'}/home`, { replace: true });
    }
  }, [isLoading, allStepsCompleted, id, navigate]);

  if (isLoading && !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-[#2D9596] animate-spin mx-auto" />
          <p className="text-sm text-[#5A6B7C] font-semibold animate-pulse">Building your dynamic sleep checklist...</p>
        </div>
      </div>
    );
  }

  // Onboarding action mapper
  const handleStepNavigation = (path: string) => {
    if (path === 'home') {
      localStorage.setItem(`has-visited-dashboard-${id || '1'}`, 'true');
      setHasVisitedDashboard(true);
    }
    navigate(`/patient/${id}/${path}`);
  };

  const steps = [
    {
      id: 'step-dashboard',
      title: 'Enter Your Main Dashboard',
      subtitle: 'Open your home base',
      description: 'Review customized advice, view daily sleep tips, and check in on your overall health status.',
      icon: Home,
      completed: hasVisitedDashboard,
      actionLabel: hasVisitedDashboard ? 'Return to Home' : 'Go to Dashboard',
      path: 'home',
      color: 'bg-teal-500/10 text-teal-600 border-teal-500/20'
    },
    {
      id: 'step-video',
      title: 'Watch Your First Coaching Guide',
      subtitle: 'Coaching Library',
      description: 'Review breathing or mask-fitting educational videos tailored to support your therapy comfort.',
      icon: Video,
      completed: hasWatchedVideo,
      actionLabel: hasWatchedVideo ? 'Watch More Guides' : 'Watch Guide Video',
      path: 'videos',
      color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20'
    },
    {
      id: 'step-sleep',
      title: 'Track Your Sleep Statistics',
      subtitle: 'Therapy Sleep Tracker',
      description: 'Review your average CPAP usage, mask leak percentages, and consistency trends from last night.',
      icon: Activity,
      completed: hasSleepStats,
      actionLabel: 'View Sleep Stats',
      path: 'cpap',
      color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
    },
    {
      id: 'step-equipment',
      title: 'Verify Your Connected Sensors',
      subtitle: 'Equipment & Supplies',
      description: 'Verify Hexoskin/Somno-Art sensor connectivity and check if there are pending mask replacement dispatches.',
      icon: Package,
      completed: hasConnectedSensors,
      actionLabel: 'Verify Hardware',
      path: 'interventions',
      color: 'bg-amber-500/10 text-amber-600 border-amber-500/20'
    },
    {
      id: 'step-survey',
      title: 'Complete Your Initial Comfort Survey',
      subtitle: 'Care Team Surveys',
      description: 'Log issues like mask discomfort, nose irritation, or pressure issues directly for your sleep therapist.',
      icon: FileText,
      completed: hasSurveysHistory,
      actionLabel: hasSurveysHistory ? 'View Survey Log' : 'Complete Survey',
      path: 'surveys',
      color: 'bg-rose-500/10 text-rose-600 border-rose-500/20'
    }
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] via-[#F4F9FA] to-[#E8EEF2] py-12 px-6 sm:px-12 pb-32">
      {/* Soft background glow */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#2D9596]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#6A994E]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto space-y-8 relative z-10">
        {/* Welcome Onboarding Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E8EEF2] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#2D9596] to-[#6A994E]" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-left flex-1">
              <h1 className="text-3xl font-extrabold text-[#0A1128] tracking-tight">
                Get Started, {firstName}!
              </h1>
              <p className="text-[#414D5B] text-sm leading-relaxed max-w-xl">
                Let's set up your SleepCare Companion portal. Complete the checklist below to optimize your sleep therapy and sync with your medical care team.
              </p>
            </div>

            {/* Onboarding Progress Dial */}
            <div className="flex flex-col items-center justify-center bg-[#2D9596]/5 border border-[#2D9596]/10 p-5 rounded-2xl shrink-0 min-w-[150px]">
              <span className="text-[10px] font-bold text-[#2D9596] uppercase tracking-widest mb-2">Portal Progress</span>
              <span className="text-3xl font-extrabold text-[#0A1128]">{progressPercent}%</span>
              <span className="text-xs text-[#5A6B7C] mt-1">{completedCount} of {steps.length} Complete</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#E8EEF2] flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => handleStepNavigation('home')}
              className="w-full sm:w-auto bg-gradient-to-r from-[#2D9596] to-[#257c7d] text-white font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Enter Sleep Dashboard <ArrowRight className="w-5 h-5" />
            </button>
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#6A994E] bg-[#6A994E]/10 border border-[#6A994E]/20 px-3 py-1.5 rounded-lg uppercase tracking-wider">
              <Signal className="w-3.5 h-3.5" /> Clinical Sync Active
            </span>
          </div>
        </div>

        {/* Checklist Steps */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-[#5A6B7C] uppercase tracking-widest pl-2">
            Onboarding Steps
          </h2>

          <div className="space-y-4">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  onClick={() => handleStepNavigation(step.path)}
                  className={`bg-white rounded-2xl p-5 border shadow-sm transition-all hover:shadow-md cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${step.completed ? 'border-[#6A994E]/25 bg-gradient-to-br from-white to-[#6A994E]/5' : 'border-[#E8EEF2] hover:border-[#2D9596]/30'
                    }`}
                >
                  <div className="flex gap-4 items-start">
                    {/* Completion Checkbox */}
                    <div className="mt-1 shrink-0">
                      {step.completed ? (
                        <CheckCircle className="w-6 h-6 text-[#6A994E]" />
                      ) : (
                        <Circle className="w-6 h-6 text-[#CBD5E1] hover:text-[#2D9596]" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${step.color}`}>
                          {step.subtitle}
                        </span>
                        {step.completed && (
                          <span className="text-[9px] font-extrabold text-[#6A994E] uppercase tracking-wider">
                            Done
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-[#0A1128] text-base">
                        {step.title}
                      </h3>
                      <p className="text-xs text-[#5A6B7C] leading-relaxed max-w-lg">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStepNavigation(step.path);
                      }}
                      className={`w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${step.completed
                          ? 'bg-[#6A994E]/10 border-[#6A994E]/20 text-[#6A994E] hover:bg-[#6A994E]/20'
                          : 'bg-[#0A1128] text-white border-transparent hover:bg-[#1e293b]'
                        }`}
                    >
                      {step.actionLabel} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* HIPAA Disclaimer */}
        <div className="bg-[#E8EEF2]/45 rounded-2xl p-6 border border-[#E8EEF2]/60 text-center">
          <p className="text-xs text-[#5A6B7C] font-semibold leading-relaxed">
            🛡️ <span className="font-bold text-[#414D5B]">Encrypted & Private:</span> SleepCare features clinical-grade, HIPAA-compliant encryption. Your medical metrics are securely logged to support your sleep health.
          </p>
        </div>
      </div>
    </div>
  );
}
