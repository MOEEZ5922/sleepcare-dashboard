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
import { fetchWeeklyAnalysis, fetchDevices, fetchSurveys, requestPatientSensing } from '../../data/api';

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
  
  const { data: ai, isLoading, error } = useApi(() => fetchWeeklyAnalysis(id || '1'), {
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

  const isLive = !error && !!ai;

  if (isLoading && !ai) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-[#0A1128] animate-spin" />
      </div>
    );
  }

  if (!ai) {
    return (
      <div className="p-8 text-center text-[#5A6B7C]">
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
            <div className="p-3 bg-[#0A1128]/5 rounded-2xl">
              <Brain className="w-8 h-8 text-[#0A1128]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#0A1128]">AI Weekly Analysis</h1>
              <p className="text-sm text-[#5A6B7C]">Composite risk engine & predictive stratification</p>
            </div>
            {isLive && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-[#6A994E]/10 border border-[#6A994E]/20 rounded-md ml-2">
                <Signal className="w-3 h-3 text-[#6A994E]" />
                <span className="text-[10px] font-bold text-[#6A994E] uppercase tracking-wider">Live</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-[#2D9596]" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#2D9596]">
            AI Weekly State — Week of {new Date(ai.weekOf).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <h2 className="text-2xl text-[#0A1128] font-semibold mb-1">AI Analysis Report</h2>
        <p className="text-[#5A6B7C] text-sm">
          This tab explains why this patient was escalated. It is for clinical transparency — not required to take action.
        </p>
      </div>

      {/* Evidence-Insufficient Alert */}
      {ai.confidenceLevel < 85 && (
        <div className="bg-[#F4A261]/5 border-2 border-[#F4A261]/30 rounded-3xl p-6 relative overflow-hidden group shadow-sm animate-in slide-in-from-top-4 duration-300">
          <div className="absolute top-[-20px] right-[-20px] opacity-5 group-hover:scale-110 transition-transform pointer-events-none">
            <AlertCircle className="w-32 h-32 text-[#F4A261]" />
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#F4A261] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#F4A261]">
                  Evidence Insufficient (AI Confidence: {ai.confidenceLevel}%)
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0A1128]">
                Predictive accuracy is compromised by missing clinical data streams.
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Offline Streams */}
                <div className="bg-white/80 p-3.5 rounded-xl border border-[#E8EEF2] flex items-start gap-2.5">
                  <WifiOff className="w-4 h-4 text-[#E76F51] mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-[#5A6B7C] uppercase tracking-wider block">Offline Sensor Streams</span>
                    <span className="text-xs font-bold text-[#0A1128]">
                      {offlineDevices.length > 0 ? offlineDevices.join(', ') : 'None detected (All devices syncing)'}
                    </span>
                  </div>
                </div>
                {/* Survey Recency */}
                <div className="bg-white/80 p-3.5 rounded-xl border border-[#E8EEF2] flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-[#2D9596] mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-[#5A6B7C] uppercase tracking-wider block">Patient-Reported Measures</span>
                    <span className="text-xs font-bold text-[#0A1128]">
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
                    ? 'bg-[#414D5B] text-white cursor-not-allowed'
                    : sensingStatus === 'success'
                    ? 'bg-[#6A994E] text-white shadow-[#6A994E]/20 scale-102 ring-4 ring-[#6A994E]/10'
                    : 'bg-[#0A1128] hover:bg-black text-white shadow-[#0A1128]/20 hover:scale-[1.02]'
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
        <div className="bg-white rounded-xl p-5 border border-[#E8EEF2] shadow-sm">
          <p className="text-xs text-[#5A6B7C] mb-2 uppercase tracking-wider">Composite Risk Score</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold text-[#E76F51]">{ai.compositeRiskScore}</p>
            <div className={`flex items-center gap-1 text-xs font-semibold pb-1 ${scoreWorsened ? 'text-[#E76F51]' : 'text-[#6A994E]'}`}>
              {scoreWorsened ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {scoreWorsened ? '+' : ''}{scoreDelta} vs last week
            </div>
          </div>
          <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-semibold ${riskTierColors[ai.riskTier]}`}>
            {ai.riskTier}
          </span>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#E8EEF2] shadow-sm">
          <p className="text-xs text-[#5A6B7C] mb-2 uppercase tracking-wider">Predicted Dropout In</p>
          <p className="text-4xl font-bold text-[#0A1128]">{ai.daysToPredictedDropout}</p>
          <p className="text-sm text-[#5A6B7C] mt-1">days if no intervention</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#E8EEF2] shadow-sm">
          <p className="text-xs text-[#5A6B7C] mb-2 uppercase tracking-wider">AI Confidence</p>
          <p className="text-4xl font-bold text-[#0A1128]">{ai.confidenceLevel}%</p>
          <div className="mt-2 h-1.5 bg-[#E8EEF2] rounded-full">
            <div className="h-full bg-[#2D9596] rounded-full" style={{ width: `${ai.confidenceLevel}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#E8EEF2] shadow-sm">
          <p className="text-xs text-[#5A6B7C] mb-2 uppercase tracking-wider">Therapy Phase</p>
          <p className="text-2xl font-bold text-[#0A1128]">{ai.phaseLabel}</p>
          <p className="text-xs text-[#5A6B7C] mt-2">Active flags:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {ai.activeFlags.map(flag => (
              <span key={flag.label} className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                flag.severity === 'high' ? 'bg-[#E76F51]/10 text-[#E76F51]' : 'bg-[#F4A261]/10 text-[#F4A261]'
              }`}>
                {flag.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Cluster Assignment */}
      <div className="bg-white rounded-xl border border-[#E8EEF2] shadow-sm p-6">
        <h3 className="text-sm font-semibold text-[#0A1128] uppercase tracking-wider mb-4">Dynamic Cluster Assignment</h3>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-lg font-semibold text-sm ${clusterColors[ai.clusterAssignment.previous]}`}>
            {ai.clusterAssignment.previous}
          </div>
          <div className="flex items-center gap-2 text-[#5A6B7C]">
            <ArrowRight className="w-5 h-5" />
            {ai.clusterAssignment.changedThisWeek && (
              <span className="text-xs bg-[#E76F51]/10 text-[#E76F51] px-2 py-0.5 rounded-full font-semibold">
                Changed this week
              </span>
            )}
          </div>
          <div className={`px-4 py-2 rounded-lg font-semibold text-sm ${clusterColors[ai.clusterAssignment.current]}`}>
            {ai.clusterAssignment.current}
          </div>
        </div>
        <p className="text-sm text-[#5A6B7C] mt-4 border-l-4 border-[#E8EEF2] pl-3">
          {ai.clusterAssignment.description}
        </p>
      </div>

      {/* 7-Day Rolling Chart */}
      <div className="bg-white rounded-xl border border-[#E8EEF2] shadow-sm p-6">
        <h3 className="text-sm font-semibold text-[#0A1128] uppercase tracking-wider mb-6">
          7-Day Rolling Metrics (AI Input Data)
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={ai.sevenDayRolling} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="usageGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2D9596" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#2D9596" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ahiGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E76F51" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#E76F51" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8EEF2" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#5A6B7C' }} tickFormatter={d => d.split(' ')[0]} />
            <YAxis tick={{ fontSize: 11, fill: '#5A6B7C' }} />
            <Tooltip
              contentStyle={{ backgroundColor: 'white', border: '1px solid #E8EEF2', borderRadius: '8px', fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="usageHours" name="Usage (hrs)" stroke="#2D9596" fill="url(#usageGrad)" strokeWidth={2} dot={{ r: 3 }} />
            <Area type="monotone" dataKey="ahi" name="AHI" stroke="#E76F51" fill="url(#ahiGrad)" strokeWidth={2} dot={{ r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Risk Factor Breakdown */}
      <div className="bg-white rounded-xl border border-[#E8EEF2] shadow-sm p-6">
        <h3 className="text-sm font-semibold text-[#0A1128] uppercase tracking-wider mb-6">
          Risk Score Composition — What Drove the Score
        </h3>
        <div className="space-y-4">
          {ai.riskFactorBreakdown.map(factor => (
            <div key={factor.factor}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {factor.direction === 'worsening'
                    ? <TrendingUp className="w-4 h-4 text-[#E76F51]" />
                    : factor.direction === 'improving'
                    ? <TrendingDown className="w-4 h-4 text-[#6A994E]" />
                    : <Minus className="w-4 h-4 text-[#5A6B7C]" />
                  }
                  <span className="text-sm text-[#0A1128] font-medium">{factor.factor}</span>
                </div>
                <span className="text-sm font-semibold text-[#0A1128]">{factor.contribution}%</span>
              </div>
              <div className="h-2 bg-[#E8EEF2] rounded-full">
                <div
                  className={`h-full rounded-full transition-all ${
                    factor.direction === 'worsening' ? 'bg-[#E76F51]' :
                    factor.direction === 'improving' ? 'bg-[#6A994E]' : 'bg-[#5A6B7C]'
                  }`}
                  style={{ width: `${factor.contribution}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Best Action */}
      <div className="bg-[#0A1128] rounded-xl p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-[#E76F51]" />
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
      <div className="bg-white rounded-xl border border-[#E8EEF2] shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-[#E8EEF2] bg-[#FAFAFA]">
          <h3 className="text-sm font-semibold text-[#0A1128] uppercase tracking-wider">
            AI Recommendation & Override History
          </h3>
          <p className="text-xs text-[#5A6B7C] mt-1">
            Historical log tracking AI suggestions and human clinician responses.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white border-b border-[#E8EEF2] text-[#5A6B7C] text-[10px] uppercase tracking-widest">
              <tr>
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold">AI Recommendation</th>
                <th className="p-4 font-bold">Human Outcome</th>
                <th className="p-4 font-bold">Override Reason</th>
                <th className="p-4 font-bold">Clinician</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EEF2]">
              <tr className="hover:bg-[#FAFAFA] transition-colors">
                <td className="p-4 text-[#5A6B7C] font-mono text-xs">2026-04-20</td>
                <td className="p-4 font-semibold text-[#0A1128]">Increase Pressure (EPR)</td>
                <td className="p-4">
                  <span className="inline-block px-2 py-1 bg-[#E76F51]/10 text-[#E76F51] text-xs font-bold rounded-md">
                    REJECTED
                  </span>
                </td>
                <td className="p-4 text-[#5A6B7C] text-xs italic">PT_REFUSED</td>
                <td className="p-4 text-[#5A6B7C] text-xs font-medium">Dr. Sarah</td>
              </tr>
              <tr className="hover:bg-[#FAFAFA] transition-colors">
                <td className="p-4 text-[#5A6B7C] font-mono text-xs">2026-04-05</td>
                <td className="p-4 font-semibold text-[#0A1128]">Dispatch Educational Video</td>
                <td className="p-4">
                  <span className="inline-block px-2 py-1 bg-[#6A994E]/10 text-[#6A994E] text-xs font-bold rounded-md">
                    ACCEPTED
                  </span>
                </td>
                <td className="p-4 text-[#5A6B7C] text-xs italic">Standard Protocol</td>
                <td className="p-4 text-[#5A6B7C] text-xs font-medium">Auto-Gate</td>
              </tr>
              <tr className="hover:bg-[#FAFAFA] transition-colors">
                <td className="p-4 text-[#5A6B7C] font-mono text-xs">2026-03-22</td>
                <td className="p-4 font-semibold text-[#0A1128]">Schedule Mask Refit</td>
                <td className="p-4">
                  <span className="inline-block px-2 py-1 bg-[#F4A261]/10 text-[#F4A261] text-xs font-bold rounded-md">
                    MODIFIED
                  </span>
                </td>
                <td className="p-4 text-[#5A6B7C] text-xs italic">Sent Chinstrap Instead</td>
                <td className="p-4 text-[#5A6B7C] text-xs font-medium">J. Mitchell</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
