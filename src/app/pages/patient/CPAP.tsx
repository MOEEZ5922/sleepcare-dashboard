import { useEffect } from 'react';
import { useParams } from 'react-router';
import { Moon, Flame, Signal, Loader2, AlertTriangle, Activity, Wind } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { fetchCpapTrends, isLiveResponse } from '../../data/api';

/**
 * Recharts and inline SVG require raw CSS color strings — they cannot consume
 * Tailwind classes or CSS custom properties. These constants mirror theme.css.
 */
const CHART_COLORS = {
  teal: '#2D9596',
  sage: '#6A994E',
  lightBlue: '#E8EEF2',
} as const;


export default function PatientCPAP() {
  const { id } = useParams();

  // Set visited sleep flag in localStorage on mount
  useEffect(() => {
    localStorage.setItem(`has-visited-sleep-${id || '1'}`, 'true');
  }, [id]);

  const { data: cpapData, isLoading } = useApi(() => fetchCpapTrends(id || '1', 7), {
    dependencies: [id],
    cacheKey: `cpap-trends-7-${id || '1'}`
  });

  const isLive = isLiveResponse(cpapData);

  if (isLoading && !cpapData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-teal animate-spin" />
      </div>
    );
  }

  if (!cpapData) {
    return (
      <div className="p-6 text-center text-slate-muted">
        <p>Unable to load CPAP data. Please try again.</p>
      </div>
    );
  }

  const usageHistory = Array.isArray(cpapData.usageHistory) ? cpapData.usageHistory : [];
  const lastNight = usageHistory.length > 0 ? usageHistory[usageHistory.length - 1]?.hours || 0 : 0;
  const percentComplete = Math.min((lastNight / 8) * 100, 100);
  const streak = cpapData.streak || 0;

  const hasDataGap = usageHistory.some((d: any) => d.hours === 0) || usageHistory.length < 7;

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto pb-32">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-sm font-bold text-blue-gray uppercase tracking-widest">Therapy Trends</h2>
        {isLive && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-teal/10 border border-teal/20 rounded-md">
            <Signal className="w-3 h-3 text-teal" />
            <span className="text-[10px] font-bold text-teal uppercase tracking-wider">Live</span>
          </div>
        )}
      </div>

      {/* Data Gap Alert */}
      {hasDataGap && (
        <div className="bg-coral/10 border border-coral/20 rounded-2xl p-4 flex items-center gap-4 text-coral">
          <div className="bg-coral p-2 rounded-lg text-white">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">Connection Check</p>
            <p className="text-xs opacity-80">We haven't received your sleep data for a few nights. Please check that your machine is plugged in and has a signal.</p>
          </div>
        </div>
      )}

      {/* Sleep Ring */}
      <div className="patient-card p-8 text-center">
        <p className="text-slate-muted mb-2 font-medium">Last Night</p>
        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
            stroke={CHART_COLORS.lightBlue}
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="url(#gradient)"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${percentComplete * 5.53} 553`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={CHART_COLORS.sage} />
                <stop offset="100%" stopColor={CHART_COLORS.teal} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Moon className="w-8 h-8 text-teal mb-2" />
            <p className="text-4xl font-bold text-navy">
              {lastNight.toFixed(1)}
            </p>
            <p className="text-sm text-slate-muted">hours</p>
          </div>
        </div>
        <p className="text-lg text-navy">
          {lastNight >= 7 ? 'Excellent sleep!' : lastNight >= 4 ? 'Good progress!' : 'Keep trying!'} You slept{' '}
          <span className="font-semibold text-sage">
            {lastNight.toFixed(1)} hours
          </span>{' '}
          with your therapy
        </p>
      </div>

      {/* Streak Tracker */}
      <div className="bg-gradient-to-br from-amber to-amber/80 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Flame className="w-8 h-8" />
          </div>
          <div>
            <p className="text-white/90 text-sm mb-1 uppercase tracking-widest font-bold">Current Streak</p>
            <p className="text-4xl font-bold">{streak} Days</p>
          </div>
        </div>
        <p className="mt-4 text-white/90 text-sm relative z-10">
          {streak >= 7 ? "You're a therapy pro! Build on this momentum." : "Keep it up! You're building a healthy sleep routine."}
        </p>
      </div>

      {/* Weekly Progress */}
      <div className="patient-card p-6">
        <h3 className="text-lg text-navy mb-6 font-semibold">Weekly Usage (Last 7 Days)</h3>
        <div className="space-y-5">
          {[...usageHistory].slice(-7).reverse().map((day: any, index: number) => {
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const progress = (day.hours / 8) * 100;

            return (
              <div key={index}>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-muted font-bold uppercase tracking-wider">{dayName}</span>
                  <span className="text-navy font-bold">{day.hours.toFixed(1)} hrs</span>
                </div>
                <div className="h-2.5 bg-light-blue rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sage to-teal rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Encouragement Card */}
      <div className="bg-light-blue rounded-2xl p-6">
        <h4 className="text-navy font-bold mb-2 flex items-center gap-2">
          <div className="w-6 h-6 bg-teal/10 rounded-full flex items-center justify-center text-teal">💡</div>
          Clinical Insight
        </h4>
        <p className="text-slate-muted text-sm leading-relaxed">
          Your average usage is <span className="font-bold text-navy">{cpapData.averageHours?.toFixed(1) || '—'} hours/night</span>.
          {(cpapData.averageHours || 0) >= 4
            ? ' You are meeting the clinical adherence threshold of 4+ hours. Keep it up!'
            : ' The clinical threshold is 4+ hours per night. Small increases make a big difference.'}
        </p>
      </div>

      {/* Sleep Events (AHI) */}
      <div className="patient-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-coral" />
            <h3 className="font-bold text-navy">Sleep Events</h3>
          </div>
          <span className="text-xs font-bold text-coral">Goal: &lt;30 /night</span>
        </div>
        <p className="text-xs text-slate-muted mb-6">Fewer events mean deeper, more restful sleep.</p>

        <div className="space-y-4">
          {[...usageHistory].slice(-7).reverse().map((day: any, index: number) => {
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const isGood = day.ahi < 30;
            const progress = Math.min((day.ahi / 30) * 100, 100);

            return (
              <div key={index} className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-muted w-24">{dayName}</span>
                <div className="flex-1 mx-4 h-1.5 bg-light-blue rounded-full overflow-hidden flex items-center">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${isGood ? 'bg-sage' : 'bg-coral'}`}
                    style={{ width: `${Math.max(progress, 2)}%` }}
                  />
                </div>
                <span className={`text-xs font-bold w-12 text-right ${isGood ? 'text-sage' : 'text-coral'}`}>
                  {day.ahi?.toFixed(1) || '0.0'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mask Seal Quality (Leak) */}
      <div className="patient-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wind className="w-5 h-5 text-amber" />
            <h3 className="font-bold text-navy">Mask Seal Quality</h3>
          </div>
        </div>
        <p className="text-xs text-slate-muted mb-6">A steady seal ensures you get the right air pressure.</p>

        <div className="space-y-4">
          {[...usageHistory].slice(-7).reverse().map((day: any, index: number) => {
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const leakField = cpapData.leakField || 'leaks90';
            const leak = day.leakRate || 0;
            const isGood = leakField === 'leaks_large_pct' ? leak < 10 : leakField === 'leaks0' ? leak < 10 : leak < 24;
            const unit = leakField === 'leaks_large_pct' ? '%' : 'L/m';
            const scaleMax = leakField === 'leaks_large_pct' ? 20 : leakField === 'leaks0' ? 20 : 40;
            const progress = Math.min((leak / scaleMax) * 100, 100);

            return (
              <div key={index} className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-muted w-24">{dayName}</span>
                <div className="flex-1 mx-4 h-1.5 bg-light-blue rounded-full overflow-hidden flex items-center">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${isGood ? 'bg-amber' : 'bg-coral'}`}
                    style={{ width: `${Math.max(progress, 2)}%` }}
                  />
                </div>
                <span className={`text-xs font-bold w-16 text-right ${isGood ? 'text-amber' : 'text-coral'}`}>
                  {leak.toFixed(1)}{unit}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
