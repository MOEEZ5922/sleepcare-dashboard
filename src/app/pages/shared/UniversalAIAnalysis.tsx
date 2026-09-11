import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle, Brain, ArrowRight, Signal, Loader2,
  Send, CheckCircle, WifiOff, Calendar, AlertCircle
} from 'lucide-react';
import { useParams } from 'react-router';
import { toast } from 'sonner';
import { useApi } from '../../hooks/useApi';
import { fetchWeeklyAnalysis, fetchDevices, fetchSurveys, requestPatientSensing, isLiveResponse } from '../../data/api';

/**
 * Recharts requires raw CSS color strings — it cannot consume Tailwind classes or
 * CSS custom properties. These constants mirror the tokens in theme.css.
 */
const CHART_COLORS = {
  teal:      '#2D9596',
  coral:     '#E76F51',
  slate:     '#5A6B7C',
  lightBlue: '#E8EEF2',
} as const;

const riskTierColors: Record<string, string> = {
  Critical: 'bg-coral text-white',
  High:     'bg-amber text-white',
  Medium:   'bg-amber/70 text-white',
  Low:      'bg-sage text-white',
};

const clusterColors: Record<string, string> = {
  Adherent:    'bg-sage/10 text-sage border border-sage/30',
  Attempting:  'bg-amber/10 text-amber border border-amber/30',
  Struggling:  'bg-coral/10 text-coral border border-coral/30',
  Dropout:     'bg-navy/10 text-navy border border-navy/30',
};

export default function UniversalAIAnalysis() {
  const { id } = useParams();
  
  const { data: ai, isLoading } = useApi(() => fetchWeeklyAnalysis(id || '1'), {
    dependencies: [id],
    cacheKey: `weekly-analysis-${id || '1'}`
  });

  const { data: devices } = useApi(() => fetchDevices(id || '1'), {
    dependencies: [id],
    cacheKey: `devices-${id || '1'}`
  });

  const { data: surveys } = useApi(() => fetchSurveys(id || '1'), {
    dependencies: [id],
    cacheKey: `surveys-${id || '1'}`
  });

  const [sensingStatus, setSensingStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const isLive = isLiveResponse(ai);

  if (isLoading && !ai) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-navy animate-spin" />
      </div>
    );
  }

  if (!ai) {
    return (
      <div className="p-8 text-center text-slate-muted">
        <p>No AI analysis available for this patient yet.</p>
      </div>
    );
  }

  const scoreDelta = (ai.compositeRiskScore - ai.previousRiskScore).toFixed(1);
  const scoreWorsened = ai.compositeRiskScore > ai.previousRiskScore;

  // Identify offline/disconnected devices
  const offlineDevices = (devices || [])
    .filter((device: any) => device.status === 'Offline' || device.status === 'Disconnected')
    .map((device: any) => device.name || device.type);

  // Calculate days since last survey
  let daysSinceLastSurvey = 'No history';
  const surveyHistory = surveys?.patient?.history || [];
  if (surveyHistory.length > 0) {
    const latestSurvey = surveyHistory.reduce((latest: any, current: any) => {
      if (!current.completed) return latest;
      if (!latest || new Date(current.completed).getTime() > new Date(latest.completed).getTime()) {
        return current;
      }
      return latest;
    }, null);

    if (latestSurvey && latestSurvey.completed) {
      const completedDate = new Date(latestSurvey.completed);
      const today = new Date('2026-06-02'); // June 2, 2026
      const diffTime = Math.abs(today.getTime() - completedDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      daysSinceLastSurvey = `${diffDays} days ago (${latestSurvey.name || 'Initial Assessment'})`;
    }
  }

  // Handle PROM Request
  const handleRequestSensing = async () => {
    setSensingStatus('loading');
    try {
      await requestPatientSensing(id || '1', offlineDevices);
      setSensingStatus('success');
      toast.success('Patient sensing request sent successfully!');
      setTimeout(() => setSensingStatus('idle'), 5000);
    } catch (err) {
      toast.error('Failed to request patient sensing.');
      setSensingStatus('idle');
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl">

      {/* Header */}
      <div>
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-navy/5 rounded-2xl">
              <Brain className="w-8 h-8 text-navy" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-navy">AI Weekly Analysis</h1>
              <p className="text-sm text-slate-muted">Composite risk engine & predictive stratification</p>
            </div>
            {isLive && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-sage/10 border border-sage/20 rounded-md ml-2">
                <Signal className="w-3 h-3 text-sage" />
                <span className="text-[10px] font-bold text-sage uppercase tracking-wider">Live</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-teal" />
          <span className="text-xs font-bold uppercase tracking-widest text-teal">
            AI Weekly State — Week of {new Date(ai.weekOf).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <h2 className="text-2xl text-navy font-semibold mb-1">AI Analysis Report</h2>
        <p className="text-slate-muted text-sm">
          This tab explains why this patient was escalated. It is for clinical transparency — not required to take action.
        </p>
      </div>

      {/* Evidence-Insufficient Alert */}
      {ai.confidenceLevel < 85 && (
        <div className="bg-amber/5 border-2 border-amber/30 rounded-3xl p-6 relative overflow-hidden group shadow-sm animate-in slide-in-from-top-4 duration-300">
          <div className="absolute top-[-20px] right-[-20px] opacity-5 group-hover:scale-110 transition-transform pointer-events-none">
            <AlertCircle className="w-32 h-32 text-amber" />
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-amber">
                  Evidence Insufficient (AI Confidence: {ai.confidenceLevel}%)
                </span>
              </div>
              <h3 className="text-lg font-bold text-navy">
                Predictive accuracy is compromised by missing clinical data streams.
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Offline Streams */}
                <div className="bg-card/80 p-3.5 rounded-xl border border-light-blue flex items-start gap-2.5">
                  <WifiOff className="w-4 h-4 text-coral mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-muted uppercase tracking-wider block">Offline Sensor Streams</span>
                    <span className="text-xs font-bold text-navy">
                      {offlineDevices.length > 0 ? offlineDevices.join(', ') : 'None detected (All devices syncing)'}
                    </span>
                  </div>
                </div>
                {/* Survey Recency */}
                <div className="bg-card/80 p-3.5 rounded-xl border border-light-blue flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-teal mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-muted uppercase tracking-wider block">Patient-Reported Measures</span>
                    <span className="text-xs font-bold text-navy">
                      Last survey: {daysSinceLastSurvey}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <button
                onClick={handleRequestSensing}
                disabled={sensingStatus !== 'idle'}
                className={`w-full md:w-auto px-6 py-4 rounded-2xl font-bold text-xs shadow-lg uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
                  sensingStatus === 'loading'
                    ? 'bg-blue-gray text-white cursor-not-allowed'
                    : sensingStatus === 'success'
                    ? 'bg-sage text-white shadow-sage/20 scale-102 ring-4 ring-sage/10'
                    : 'bg-navy hover:bg-navy/90 text-white shadow-navy/20 hover:scale-[1.02]'
                }`}
              >
                {sensingStatus === 'loading' && (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Transmitting Request...
                  </>
                )}
                {sensingStatus === 'success' && (
                  <>
                    <CheckCircle className="w-4 h-4 animate-bounce" />
                    PROM Request Active
                  </>
                )}
                {sensingStatus === 'idle' && (
                  <>
                    <Send className="w-4 h-4" />
                    Request Patient Sensing
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Summary Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-5 border border-light-blue shadow-sm">
          <p className="text-xs text-slate-muted mb-2 uppercase tracking-wider">Composite Risk Score</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold text-coral">{ai.compositeRiskScore}</p>
            <div className={`flex items-center gap-1 text-xs font-semibold pb-1 ${scoreWorsened ? 'text-coral' : 'text-sage'}`}>
              {scoreWorsened ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {scoreWorsened ? '+' : ''}{scoreDelta} vs last week
            </div>
          </div>
          <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-semibold ${riskTierColors[ai.riskTier]}`}>
            {ai.riskTier}
          </span>
        </div>

        <div className="bg-card rounded-xl p-5 border border-light-blue shadow-sm">
          <p className="text-xs text-slate-muted mb-2 uppercase tracking-wider">Predicted Dropout In</p>
          <p className="text-4xl font-bold text-navy">{ai.daysToPredictedDropout}</p>
          <p className="text-sm text-slate-muted mt-1">days if no intervention</p>
        </div>

        <div className="bg-card rounded-xl p-5 border border-light-blue shadow-sm">
          <p className="text-xs text-slate-muted mb-2 uppercase tracking-wider">AI Confidence</p>
          <p className="text-4xl font-bold text-navy">{ai.confidenceLevel}%</p>
          <div className="mt-2 h-1.5 bg-light-blue rounded-full">
            <div className="h-full bg-teal rounded-full" style={{ width: `${ai.confidenceLevel}%` }} />
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 border border-light-blue shadow-sm">
          <p className="text-xs text-slate-muted mb-2 uppercase tracking-wider">Therapy Phase</p>
          <p className="text-2xl font-bold text-navy">{ai.phaseLabel}</p>
          <p className="text-xs text-slate-muted mt-2">Active flags:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {ai.activeFlags.map(flag => (
              <span key={flag.label} className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                flag.severity === 'high' ? 'bg-coral/10 text-coral' : 'bg-amber/10 text-amber'
              }`}>
                {flag.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Cluster Assignment */}
      <div className="bg-card rounded-xl border border-light-blue shadow-sm p-6">
        <h3 className="text-sm font-semibold text-navy uppercase tracking-wider mb-4">Dynamic Cluster Assignment</h3>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-lg font-semibold text-sm ${clusterColors[ai.clusterAssignment.previous]}`}>
            {ai.clusterAssignment.previous}
          </div>
          <div className="flex items-center gap-2 text-slate-muted">
            <ArrowRight className="w-5 h-5" />
            {ai.clusterAssignment.changedThisWeek && (
              <span className="text-xs bg-coral/10 text-coral px-2 py-0.5 rounded-full font-semibold">
                Changed this week
              </span>
            )}
          </div>
          <div className={`px-4 py-2 rounded-lg font-semibold text-sm ${clusterColors[ai.clusterAssignment.current]}`}>
            {ai.clusterAssignment.current}
          </div>
        </div>
        <p className="text-sm text-slate-muted mt-4 border-l-4 border-light-blue pl-3">
          {ai.clusterAssignment.description}
        </p>
      </div>

      {/* 7-Day Rolling Chart */}
      <div className="bg-card rounded-xl border border-light-blue shadow-sm p-6">
        <h3 className="text-sm font-semibold text-navy uppercase tracking-wider mb-6">
          7-Day Rolling Metrics (AI Input Data)
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={ai.sevenDayRolling} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.teal} stopOpacity={0.2} />
                <stop offset="95%" stopColor={CHART_COLORS.teal} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ahiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.coral} stopOpacity={0.2} />
                <stop offset="95%" stopColor={CHART_COLORS.coral} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.lightBlue} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: CHART_COLORS.slate }} tickFormatter={d => d.split(' ')[0]} />
            <YAxis tick={{ fontSize: 11, fill: CHART_COLORS.slate }} />
            <Tooltip
              contentStyle={{ backgroundColor: 'white', border: `1px solid ${CHART_COLORS.lightBlue}`, borderRadius: '8px', fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="usageHours" name="Usage (hrs)" stroke={CHART_COLORS.teal} fill="url(#usageGrad)" strokeWidth={2} dot={{ r: 3 }} />
            <Area type="monotone" dataKey="ahi" name="AHI" stroke={CHART_COLORS.coral} fill="url(#ahiGrad)" strokeWidth={2} dot={{ r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Risk Factor Breakdown */}
      <div className="bg-card rounded-xl border border-light-blue shadow-sm p-6">
        <h3 className="text-sm font-semibold text-navy uppercase tracking-wider mb-6">
          Risk Score Composition — What Drove the Score
        </h3>
        <div className="space-y-4">
          {ai.riskFactorBreakdown.map(factor => (
            <div key={factor.factor}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {factor.direction === 'worsening'
                    ? <TrendingUp className="w-4 h-4 text-coral" />
                    : factor.direction === 'improving'
                    ? <TrendingDown className="w-4 h-4 text-sage" />
                    : <Minus className="w-4 h-4 text-slate-muted" />
                  }
                  <span className="text-sm text-navy font-medium">{factor.factor}</span>
                </div>
                <span className="text-sm font-semibold text-navy">{factor.contribution}%</span>
              </div>
              <div className="h-2 bg-light-blue rounded-full">
                <div
                  className={`h-full rounded-full transition-all ${
                    factor.direction === 'worsening' ? 'bg-coral' :
                    factor.direction === 'improving' ? 'bg-sage' : 'bg-slate-muted'
                  }`}
                  style={{ width: `${factor.contribution}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Best Action */}
      <div className="bg-navy rounded-xl p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-coral" />
          <h3 className="text-sm font-semibold uppercase tracking-wider">AI Next-Best-Action</h3>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-white/60 mb-1">Action Type</p>
            <p className="font-semibold">{ai.nextBestAction.type}</p>
          </div>
          <div>
            <p className="text-xs text-white/60 mb-1">Delivery Mode</p>
            <p className="font-semibold">{ai.nextBestAction.deliveryMode}</p>
          </div>
          <div>
            <p className="text-xs text-white/60 mb-1">Reassessment Window</p>
            <p className="font-semibold">{ai.nextBestAction.reassessmentWindow}</p>
          </div>
        </div>
        <p className="text-sm text-white/80 mt-4 border-t border-white/10 pt-4">
          {ai.nextBestAction.rationale}
        </p>
      </div>

      {/* AI Recommendation & Override History Log */}
      <div className="bg-card rounded-xl border border-light-blue shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-light-blue bg-background">
          <h3 className="text-sm font-semibold text-navy uppercase tracking-wider">
            AI Recommendation & Override History
          </h3>
          <p className="text-xs text-slate-muted mt-1">
            Historical log tracking AI suggestions and human clinician responses.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-card border-b border-light-blue text-slate-muted text-[10px] uppercase tracking-widest">
              <tr>
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold">AI Recommendation</th>
                <th className="p-4 font-bold">Human Outcome</th>
                <th className="p-4 font-bold">Override Reason</th>
                <th className="p-4 font-bold">Clinician</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-blue">
              {/* Override history — populated from live backend only */}
              <tr className="hover:bg-background transition-colors">
                <td className="p-4 text-slate-muted font-mono text-xs">NaN</td>
                <td className="p-4 font-semibold text-navy">NaN</td>
                <td className="p-4">
                  <span className="inline-block px-2 py-1 bg-light-blue text-slate-muted text-xs font-bold rounded-md">
                    NaN
                  </span>
                </td>
                <td className="p-4 text-slate-muted text-xs italic">NaN</td>
                <td className="p-4 text-slate-muted text-xs font-medium">NaN</td>
              </tr>
              <tr className="hover:bg-background transition-colors">
                <td className="p-4 text-slate-muted font-mono text-xs">NaN</td>
                <td className="p-4 font-semibold text-navy">NaN</td>
                <td className="p-4">
                  <span className="inline-block px-2 py-1 bg-light-blue text-slate-muted text-xs font-bold rounded-md">
                    NaN
                  </span>
                </td>
                <td className="p-4 text-slate-muted text-xs italic">NaN</td>
                <td className="p-4 text-slate-muted text-xs font-medium">NaN</td>
              </tr>
              <tr className="hover:bg-background transition-colors">
                <td className="p-4 text-slate-muted font-mono text-xs">NaN</td>
                <td className="p-4 font-semibold text-navy">NaN</td>
                <td className="p-4">
                  <span className="inline-block px-2 py-1 bg-light-blue text-slate-muted text-xs font-bold rounded-md">
                    NaN
                  </span>
                </td>
                <td className="p-4 text-slate-muted text-xs italic">NaN</td>
                <td className="p-4 text-slate-muted text-xs font-medium">NaN</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
