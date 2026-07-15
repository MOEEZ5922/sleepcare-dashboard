import { useState } from 'react';
import { useParams } from 'react-router';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  TrendingDown, TrendingUp, Activity, Wind, Signal, Loader2, AlertTriangle, Flame, Calendar, Clock 
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { fetchCpapTrends } from '../../data/api';

export default function UniversalCPAP({ role = 'physician' }: { role?: 'physician' | 'technician' }) {
  const { id } = useParams();
  const [chartPeriod, setChartPeriod] = useState<'7' | '30' | '90'>('7');

  const { data: cpap, isLoading, error } = useApi(() => fetchCpapTrends(id || '1', Number(chartPeriod)), {
    dependencies: [id, chartPeriod],
    cacheKey: `cpap-trends-${chartPeriod}-${id || '1'}`
  });

  const isLive = !!(cpap && (cpap as any).__isLive);

  if (isLoading && !cpap) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-[#2D9596] animate-spin" />
      </div>
    );
  }

  if (!cpap) {
    return (
      <div className="p-8 text-center text-[#5A6B7C]">
        <p>Unable to load CPAP trends. Please try again.</p>
      </div>
    );
  }

  // Data for Charts
  const usageHistory = cpap.usageHistory || [];
  
  // Compliance Streak
  const streakCount = cpap.streak || 0;
  
  // Data Gap Detection (Simulated for this demo)
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
  const isGoodSeal = isLargePct ? cpap.percentileLeak < 10 : leakField === 'leaks0' ? cpap.percentileLeak < 10 : cpap.percentileLeak < 24;

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      {/* Header & Live Status */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1128]">
            {role === 'physician' ? 'Clinical Therapy Outcomes' : 'Equipment & Therapy Logistics'}
          </h1>
          <p className="text-sm text-[#5A6B7C]">
            {role === 'physician' 
              ? 'Monitoring therapy efficacy, AHI control, and adherence for clinical review.'
              : 'Monitoring device performance, mask seal integrity, and pressure settings.'}
          </p>
        </div>
        <div className="flex items-center gap-4">
           {isLive && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#6A994E]/10 border border-[#6A994E]/20 rounded-full">
              <Signal className="w-3 h-3 text-[#6A994E] animate-pulse" />
              <span className="text-[10px] font-bold text-[#6A994E] uppercase tracking-wider">Live Sync</span>
            </div>
          )}
          <div className="flex bg-[#E8EEF2] p-1 rounded-lg">
            {(['7', '30', '90'] as const).map(period => (
              <button
                key={period}
                onClick={() => setChartPeriod(period)}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  chartPeriod === period 
                  ? 'bg-white text-[#0A1128] shadow-sm' 
                  : 'text-[#5A6B7C] hover:text-[#0A1128]'
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
        <div className="bg-[#E76F51]/10 border border-[#E76F51]/20 rounded-xl p-4 flex items-center gap-4 text-[#E76F51]">
          <div className="bg-[#E76F51] p-2 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm">Data Continuity Gap Detected</p>
            <p className="text-xs opacity-80">Device was not used or synchronization failed on 2 of the last 7 nights. Compliance stats may be skewed. Check device connectivity.</p>
          </div>
        </div>
      )}

      {/* Top Row: Quick Stats & Streak */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Compliance Streak Card */}
        <div className="bg-gradient-to-br from-[#F4A261] to-[#E76F51] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm font-medium opacity-80 mb-1">Compliance Streak</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">{streakCount}</span>
              <span className="text-lg opacity-80 font-medium">Days</span>
            </div>
            <p className="text-xs mt-4 bg-white/20 px-2 py-1 rounded w-fit">Target: 30 days continuous</p>
          </div>
          <Flame className="absolute -right-4 -bottom-4 w-32 h-32 opacity-20 rotate-12" />
        </div>

        {/* Current AHI */}
        <div className="bg-white rounded-2xl p-6 border border-[#E8EEF2] shadow-sm">
          <p className="text-sm text-[#5A6B7C] mb-1">Current AHI</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[#0A1128]">{cpap.currentAHI?.toFixed(1) ?? '0.0'}</span>
            <span className="text-xs text-[#5A6B7C] font-medium">events/hr</span>
          </div>
          <div className={`mt-4 flex items-center gap-1.5 text-xs font-bold ${cpap.currentAHI < 5 ? 'text-[#6A994E]' : 'text-[#E76F51]'}`}>
            {cpap.currentAHI < 5 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            {cpap.currentAHI < 5 ? 'EXCELLENT CONTROL' : 'CLINICAL REVIEW REQUIRED'}
          </div>
        </div>

        {/* Mask Leak */}
        <div className="bg-white rounded-2xl p-6 border border-[#E8EEF2] shadow-sm">
          <p className="text-sm text-[#5A6B7C] mb-1">{leakLabel}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[#0A1128]">{cpap.percentileLeak?.toFixed(1) ?? '0.0'}</span>
            <span className="text-xs text-[#5A6B7C] font-medium">{leakUnit}</span>
          </div>
          <div className={`mt-4 flex items-center gap-1.5 text-xs font-bold ${isGoodSeal ? 'text-[#2D9596]' : 'text-[#E76F51]'}`}>
            <Wind className="w-4 h-4" />
            {isGoodSeal ? 'GOOD SEAL' : 'HIGH LEAKAGE'}
          </div>
        </div>

        {/* Avg Usage */}
        <div className="bg-white rounded-2xl p-6 border border-[#E8EEF2] shadow-sm">
          <p className="text-sm text-[#5A6B7C] mb-1">Average Usage</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-[#0A1128]">{cpap.averageHours}</span>
            <span className="text-xs text-[#5A6B7C] font-medium">hrs/night</span>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#F4A261]">
            <Clock className="w-4 h-4" />
            {cpap.averageHours >= 4 ? 'ADHERENT (>4 hrs)' : 'NON-ADHERENT'}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7-Day Usage Bar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-[#E8EEF2] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#2D9596]" />
              <h3 className="font-bold text-[#0A1128]">Daily Usage Duration</h3>
            </div>
            <span className="text-xs font-medium text-[#5A6B7C]">Goal: 4+ hrs</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={usageHistory}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EEF2" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#5A6B7C', fontSize: 10 }}
                tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { weekday: 'short' })}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#5A6B7C', fontSize: 10 }} />
              <Tooltip 
                cursor={{ fill: '#F7F9FB' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar 
                dataKey="hours" 
                fill="#2D9596" 
                radius={[4, 4, 0, 0]} 
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AHI Trend Analysis */}
        <div className="bg-white rounded-2xl p-6 border border-[#E8EEF2] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#E76F51]" />
              <h3 className="font-bold text-[#0A1128]">AHI Trend Analysis</h3>
            </div>
            <span className="text-xs font-medium text-[#5A6B7C]">Target: &lt;5</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={usageHistory}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EEF2" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#5A6B7C', fontSize: 10 }}
                tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { weekday: 'short' })}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#5A6B7C', fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="ahi" 
                stroke="#E76F51" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#E76F51', strokeWidth: 0 }} 
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Leak % Evolution */}
        <div className="bg-white rounded-2xl p-6 border border-[#E8EEF2] shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Wind className="w-5 h-5 text-[#F4A261]" />
              <h3 className="font-bold text-[#0A1128]">Leak Rate Evolution</h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-[#5A6B7C]">
               <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-[#F4A261] rounded-full opacity-50" />
                  <span>{leakLabel} ({leakUnit})</span>
               </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={usageHistory}>
              <defs>
                <linearGradient id="colorLeak" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F4A261" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#F4A261" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EEF2" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#5A6B7C', fontSize: 10 }}
                tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { weekday: 'short' })}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#5A6B7C', fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="leakRate" 
                stroke="#F4A261" 
                fillOpacity={1} 
                fill="url(#colorLeak)" 
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pressure Settings Table (Highly relevant for Technician, hidden for Physician unless needed) */}
        {role === 'technician' && (
          <div className="bg-white rounded-2xl p-6 border border-[#E8EEF2] shadow-sm lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Wind className="w-5 h-5 text-[#2D9596]" />
              <h3 className="font-bold text-[#0A1128]">Machine Pressure Settings</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-[#E8EEF2]">
                    <th className="pb-3 text-xs font-bold text-[#5A6B7C] uppercase tracking-wider">Setting</th>
                    <th className="pb-3 text-xs font-bold text-[#5A6B7C] uppercase tracking-wider text-right">Value</th>
                    <th className="pb-3 text-xs font-bold text-[#5A6B7C] uppercase tracking-wider text-right">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8EEF2]">
                  <tr>
                    <td className="py-4 text-sm text-[#0A1128] font-medium">Minimum Pressure</td>
                    <td className="py-4 text-sm text-[#0A1128] font-bold text-right">{cpap.pressureSettings?.min ?? '—'}</td>
                    <td className="py-4 text-xs text-[#5A6B7C] text-right">cmH₂O</td>
                  </tr>
                  <tr>
                    <td className="py-4 text-sm text-[#0A1128] font-medium">Maximum Pressure</td>
                    <td className="py-4 text-sm text-[#0A1128] font-bold text-right">{cpap.pressureSettings?.max ?? '—'}</td>
                    <td className="py-4 text-xs text-[#5A6B7C] text-right">cmH₂O</td>
                  </tr>
                  <tr>
                    <td className="py-4 text-sm text-[#0A1128] font-medium">Current Pressure (Auto)</td>
                    <td className="py-4 text-sm text-[#2D9596] font-bold text-right">{cpap.pressureSettings?.current ?? '—'}</td>
                    <td className="py-4 text-xs text-[#5A6B7C] text-right">cmH₂O</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detailed Session History Table */}
        <div className="bg-white rounded-2xl p-6 border border-[#E8EEF2] shadow-sm lg:col-span-2 animate-in fade-in duration-700">
          <div className="flex items-center justify-between mb-6 border-b border-[#E8EEF2] pb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#2D9596]" />
              <h3 className="font-bold text-[#0A1128]">Detailed Session History</h3>
            </div>
            <span className="text-xs font-semibold text-[#5A6B7C]">
              Active leak column: <span className="font-bold text-[#2D9596] uppercase">{leakField}</span>
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E8EEF2] text-[10px] font-bold text-[#5A6B7C] uppercase tracking-wider bg-[#FAFAFA]">
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">AHI (events/hr)</th>
                  <th className="p-3 text-right">Usage (hrs)</th>
                  <th className={`p-3 text-right ${leakField === 'leaks95' ? 'bg-[#2D9596]/5 text-[#2D9596] font-bold' : ''}`}>Leaks 95 (L/min)</th>
                  <th className={`p-3 text-right ${leakField === 'leaks90' ? 'bg-[#2D9596]/5 text-[#2D9596] font-bold' : ''}`}>Leaks 90 (L/min)</th>
                  <th className={`p-3 text-right ${leakField === 'leaks0' ? 'bg-[#2D9596]/5 text-[#2D9596] font-bold' : ''}`}>Leaks 0 (L/min)</th>
                  <th className={`p-3 text-right ${leakField === 'leaks_large_pct' ? 'bg-[#2D9596]/5 text-[#2D9596] font-bold' : ''}`}>Large Leak (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EEF2] text-sm">
                {[...usageHistory].reverse().map((s: any, idx: number) => (
                  <tr key={idx} className="hover:bg-[#FAFAFA]/50 transition-colors">
                    <td className="p-3 font-medium text-[#0A1128]">{new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="p-3 text-right font-semibold text-[#0A1128]">{s.ahi?.toFixed(1) ?? '0.0'}</td>
                    <td className="p-3 text-right font-semibold text-[#0A1128]">{s.hours?.toFixed(1)} hrs</td>
                    <td className={`p-3 text-right ${leakField === 'leaks95' ? 'bg-[#2D9596]/5 font-bold text-[#2D9596]' : 'text-[#5A6B7C] opacity-40'}`}>
                      {leakField === 'leaks95' ? `${s.leaks95?.toFixed(1) ?? '—'}` : '—'}
                    </td>
                    <td className={`p-3 text-right ${leakField === 'leaks90' ? 'bg-[#2D9596]/5 font-bold text-[#2D9596]' : 'text-[#5A6B7C] opacity-40'}`}>
                      {leakField === 'leaks90' ? `${s.leaks90?.toFixed(1) ?? '—'}` : '—'}
                    </td>
                    <td className={`p-3 text-right ${leakField === 'leaks0' ? 'bg-[#2D9596]/5 font-bold text-[#2D9596]' : 'text-[#5A6B7C] opacity-40'}`}>
                      {leakField === 'leaks0' ? `${s.leaks0?.toFixed(1) ?? '—'}` : '—'}
                    </td>
                    <td className={`p-3 text-right ${leakField === 'leaks_large_pct' ? 'bg-[#2D9596]/5 font-bold text-[#2D9596]' : 'text-[#5A6B7C] opacity-40'}`}>
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
