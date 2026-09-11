import { useState } from 'react';
import { useParams } from 'react-router';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Activity, Wind, Signal, Loader2, AlertTriangle, Clock, CheckCircle, ShieldCheck 
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { fetchCpapTrends, isLiveResponse } from '../../data/api';

/**
 * Recharts requires raw CSS color strings — it cannot consume Tailwind classes or
 * CSS custom properties. These constants mirror the tokens in theme.css.
 */
const CHART_COLORS = {
  teal:      '#2D9596',
  sage:      '#6A994E',
  amber:     '#F4A261',
  lightBlue: '#E8EEF2',
} as const;


export default function UniversalCPAP({ role = 'physician' }: { role?: 'physician' | 'technician' }) {
  const { id } = useParams();
  const [chartPeriod, setChartPeriod] = useState<'7' | '30' | '90'>('7');

  const { data: cpap, isLoading } = useApi(() => fetchCpapTrends(id || '1', Number(chartPeriod)), {
    dependencies: [id, chartPeriod],
    cacheKey: `cpap-trends-${chartPeriod}-${id || '1'}`
  });

  const isLive = isLiveResponse(cpap);

  if (isLoading && !cpap) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-teal animate-spin" />
      </div>
    );
  }

  if (!cpap) {
    return (
      <div className="p-8 text-center text-slate-muted">
        <p>Unable to load CPAP trends. Please try again.</p>
      </div>
    );
  }

  // Data for Charts
  const usageHistory = cpap.usageHistory || [];
  
  // Compliance Score
  const complianceScore = cpap.complianceScore ?? Math.round(((usageHistory.filter((u: any) => u.hours >= 4).length) / (usageHistory.length || 1)) * 100);
  
  // Data Gap Detection
  const hasDataGap = usageHistory.some((d: any) => d.hours === 0) || usageHistory.length < 7;

  const leakField = cpap.leakField || 'leaks90';
  const isLargePct = leakField === 'leaks_large_pct';
  const leakLabel = isLargePct
    ? 'Large Leak %'
    : leakField === 'leaks95'
    ? '95th% Leak Rate'
    : leakField === 'leaks90'
    ? '90th% Leak Rate'
    : 'Median Leak (Leaks 0)';

  const leakUnit = isLargePct ? '%' : 'L/min';
  const leak = cpap.percentileLeak;

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      {/* Header & Live Status */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-navy">
            {role === 'physician' ? 'Clinical Therapy Outcomes' : 'Equipment & Therapy Logistics'}
          </h1>
          <p className="text-sm text-slate-muted">
            {role === 'physician' 
              ? 'Monitoring therapy efficacy, AHI control, and adherence for clinical review.'
              : 'Monitoring device performance, mask seal integrity, and pressure settings.'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {isLive && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-sage/10 border border-sage/20 rounded-full">
              <Signal className="w-3 h-3 text-sage animate-pulse" />
              <span className="text-[10px] font-bold text-sage uppercase tracking-wider">Live Sync</span>
            </div>
          )}
          <div className="flex bg-light-blue p-1 rounded-lg">
            {(['7', '30', '90'] as const).map(period => (
              <button
                key={period}
                onClick={() => setChartPeriod(period)}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  chartPeriod === period 
                  ? 'bg-card text-navy shadow-sm' 
                  : 'text-slate-muted hover:text-navy'
                }`}
              >
                {period}D
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Data Gap Alert Banner */}
      {hasDataGap && (
        <div className="bg-coral/10 border border-coral/20 rounded-xl p-4 flex items-center gap-4 text-coral">
          <div className="bg-coral p-2 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">Data Continuity Gap Detected</p>
            <p className="text-xs opacity-80">Device was not used or synchronization failed on some nights. Compliance stats may be skewed.</p>
          </div>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-2xl p-6 border border-light-blue shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-slate-muted uppercase tracking-wider">Residual AHI</p>
            <div className="p-2 bg-teal/10 rounded-xl text-teal">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-navy">{cpap.currentAHI ?? '0.0'}</h3>
            <span className="text-xs font-semibold text-slate-muted">events/hr</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-sage font-medium">
            <CheckCircle className="w-4 h-4" /> Normal Target (&lt; 5.0)
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-light-blue shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-slate-muted uppercase tracking-wider">Avg Nightly Usage</p>
            <div className="p-2 bg-amber/10 rounded-xl text-amber">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-navy">{cpap.averageHours ?? '0.0'}</h3>
            <span className="text-xs font-semibold text-slate-muted">hours/night</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-amber font-medium">
            <AlertTriangle className="w-4 h-4" /> Target (&gt; 6.0h)
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-light-blue shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-slate-muted uppercase tracking-wider">{leakLabel}</p>
            <div className="p-2 bg-teal/10 rounded-xl text-teal">
              <Wind className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-navy">{leak}</h3>
            <span className="text-xs font-semibold text-slate-muted">{leakUnit}</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-muted font-medium">
            <ShieldCheck className="w-4 h-4 text-teal" /> Verified via Telemetry
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-light-blue shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-bold text-slate-muted uppercase tracking-wider">Compliance Rate</p>
            <div className="p-2 bg-sage/10 rounded-xl text-sage">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-navy">{complianceScore}%</h3>
            <span className="text-xs font-semibold text-slate-muted">days &gt; 4h</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-sage font-medium">
            <span>Clinical Adherent Status</span>
          </div>
        </div>
      </div>

      {/* Main Longitudinal Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* AHI vs Usage History Chart */}
        <div className="bg-card rounded-2xl p-6 border border-light-blue shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal" />
              <h3 className="font-bold text-navy">Longitudinal AHI & Usage History</h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-muted">
               <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-teal rounded-full" />
                  <span>AHI (events/hr)</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-sage rounded-full" />
                  <span>Usage (hrs)</span>
               </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={usageHistory}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--light-blue)" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--slate-muted)', fontSize: 10 }}
                tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--slate-muted)', fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="ahi" 
                stroke={CHART_COLORS.teal} 
                strokeWidth={3} 
                dot={{ r: 4, fill: CHART_COLORS.teal }} 
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                dataKey="hours" 
                stroke={CHART_COLORS.sage} 
                strokeWidth={2} 
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Leak Rate Evolution Chart */}
        <div className="bg-card rounded-2xl p-6 border border-light-blue shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Wind className="w-5 h-5 text-amber" />
              <h3 className="font-bold text-navy">Leak Rate Evolution</h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-muted">
               <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-amber rounded-full opacity-50" />
                  <span>{leakLabel} ({leakUnit})</span>
               </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={usageHistory}>
              <defs>
                <linearGradient id="colorLeak" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.amber} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={CHART_COLORS.amber} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--light-blue)" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--slate-muted)', fontSize: 10 }}
                tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { weekday: 'short' })}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--slate-muted)', fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="leakRate" 
                stroke={CHART_COLORS.amber} 
                fillOpacity={1} 
                fill="url(#colorLeak)" 
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pressure Settings Table */}
        {role === 'technician' && (
          <div className="bg-card rounded-2xl p-6 border border-light-blue shadow-sm lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Wind className="w-5 h-5 text-teal" />
              <h3 className="font-bold text-navy">Machine Pressure Settings</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-light-blue">
                    <th className="pb-3 text-xs font-bold text-slate-muted uppercase tracking-wider">Setting</th>
                    <th className="pb-3 text-xs font-bold text-slate-muted uppercase tracking-wider text-right">Value</th>
                    <th className="pb-3 text-xs font-bold text-slate-muted uppercase tracking-wider text-right">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-blue">
                  <tr>
                    <td className="py-4 text-sm text-navy font-medium">Minimum Pressure</td>
                    <td className="py-4 text-sm text-navy font-bold text-right">{cpap.pressureSettings?.min ?? '—'}</td>
                    <td className="py-4 text-xs text-slate-muted text-right">cmH₂O</td>
                  </tr>
                  <tr>
                    <td className="py-4 text-sm text-navy font-medium">Maximum Pressure</td>
                    <td className="py-4 text-sm text-navy font-bold text-right">{cpap.pressureSettings?.max ?? '—'}</td>
                    <td className="py-4 text-xs text-slate-muted text-right">cmH₂O</td>
                  </tr>
                  <tr>
                    <td className="py-4 text-sm text-navy font-medium">Current Pressure (Auto)</td>
                    <td className="py-4 text-sm text-teal font-bold text-right">{cpap.pressureSettings?.current ?? '—'}</td>
                    <td className="py-4 text-xs text-slate-muted text-right">cmH₂O</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detailed Session History Table */}
        <div className="bg-card rounded-2xl p-6 border border-light-blue shadow-sm lg:col-span-2 animate-in fade-in duration-700">
          <div className="flex items-center justify-between mb-6 border-b border-light-blue pb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal" />
              <h3 className="font-bold text-navy">Detailed Session History</h3>
            </div>
            <span className="text-xs font-semibold text-slate-muted">
              Active leak column: <span className="font-bold text-teal uppercase">{leakField}</span>
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-light-blue text-[10px] font-bold text-slate-muted uppercase tracking-wider bg-background">
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">AHI (events/hr)</th>
                  <th className="p-3 text-right">Usage (hrs)</th>
                  <th className={`p-3 text-right ${leakField === 'leaks95' ? 'bg-teal/5 text-teal font-bold' : ''}`}>Leaks 95 (L/min)</th>
                  <th className={`p-3 text-right ${leakField === 'leaks90' ? 'bg-teal/5 text-teal font-bold' : ''}`}>Leaks 90 (L/min)</th>
                  <th className={`p-3 text-right ${leakField === 'leaks0' ? 'bg-teal/5 text-teal font-bold' : ''}`}>Leaks 0 (L/min)</th>
                  <th className={`p-3 text-right ${leakField === 'leaks_large_pct' ? 'bg-teal/5 text-teal font-bold' : ''}`}>Large Leak (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-blue text-sm">
                {[...usageHistory].reverse().map((s: any, idx: number) => (
                  <tr key={idx} className="hover:bg-background/50 transition-colors">
                    <td className="p-3 font-medium text-navy">{new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="p-3 text-right font-semibold text-navy">{s.ahi?.toFixed(1) ?? '0.0'}</td>
                    <td className="p-3 text-right font-semibold text-navy">{s.hours?.toFixed(1)} hrs</td>
                    <td className={`p-3 text-right ${leakField === 'leaks95' ? 'bg-teal/5 font-bold text-teal' : 'text-slate-muted opacity-40'}`}>
                      {leakField === 'leaks95' ? `${s.leaks95?.toFixed(1) ?? '—'}` : '—'}
                    </td>
                    <td className={`p-3 text-right ${leakField === 'leaks90' ? 'bg-teal/5 font-bold text-teal' : 'text-slate-muted opacity-40'}`}>
                      {leakField === 'leaks90' ? `${s.leaks90?.toFixed(1) ?? '—'}` : '—'}
                    </td>
                    <td className={`p-3 text-right ${leakField === 'leaks0' ? 'bg-teal/5 font-bold text-teal' : 'text-slate-muted opacity-40'}`}>
                      {leakField === 'leaks0' ? `${s.leaks0?.toFixed(1) ?? '—'}` : '—'}
                    </td>
                    <td className={`p-3 text-right ${leakField === 'leaks_large_pct' ? 'bg-teal/5 font-bold text-teal' : 'text-slate-muted opacity-40'}`}>
                      {leakField === 'leaks_large_pct' ? `${s.leaks_large_pct?.toFixed(1) ?? '—'}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
