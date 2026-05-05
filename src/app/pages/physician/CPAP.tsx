import { useState } from 'react';
import { useParams } from 'react-router';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingDown, TrendingUp, Activity, Wind, Signal, Loader2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { fetchCpapTrends } from '../../data/api';

export default function PhysicianCPAP() {
  const { id } = useParams();
  const [chartPeriod, setChartPeriod] = useState<'30' | '60' | '90'>('30');

  const { data: cpap, isLoading, error } = useApi(() => fetchCpapTrends(id || '1', Number(chartPeriod)), {
    dependencies: [id, chartPeriod]
  });

  const isLive = !error && !!cpap;

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

  // Compute derived stats from API data
  const trend30 = cpap.thirtyDayTrend || [];
  const avgAhi30 = trend30.length > 0
    ? (trend30.reduce((sum: number, d: any) => sum + d.ahi, 0) / trend30.length).toFixed(1)
    : '—';
  const daysBelowTarget = trend30.filter((d: any) => d.ahi < 5).length;
  const trendDirection = trend30.length >= 2
    ? (trend30[trend30.length - 1].ahi <= trend30[0].ahi ? 'Improving' : 'Worsening')
    : 'Stable';

  return (
    <div className="p-8 space-y-6">
      {/* Live Badge */}
      {isLive && (
        <div className="flex justify-end">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#6A994E]/10 border border-[#6A994E]/20 rounded-md">
            <Signal className="w-3 h-3 text-[#6A994E]" />
            <span className="text-[10px] font-bold text-[#6A994E] uppercase tracking-wider">Live</span>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-[#E8EEF2] shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#5A6B7C] mb-1">Current AHI</p>
              <p className="text-4xl font-semibold text-[#0A1128]">{cpap.currentAHI}</p>
            </div>
            <div className="w-12 h-12 bg-[#6A994E]/10 rounded-lg flex items-center justify-center">
              {cpap.currentAHI < 5
                ? <TrendingDown className="w-6 h-6 text-[#6A994E]" />
                : <TrendingUp className="w-6 h-6 text-[#E76F51]" />
              }
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className={cpap.currentAHI < 5 ? 'text-[#6A994E]' : 'text-[#E76F51]'}>
              {cpap.currentAHI < 5 ? '✓ Normal' : '⚠ Elevated'}
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-[#E8EEF2]">
            <p className="text-xs text-[#5A6B7C]">
              Normal range: &lt;5 events/hour. {cpap.currentAHI < 5 ? 'Patient shows good control.' : 'Requires clinical review.'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#E8EEF2] shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#5A6B7C] mb-1">90th Percentile Leak</p>
              <p className="text-4xl font-semibold text-[#0A1128]">{cpap.percentileLeak} <span className="text-xl text-[#5A6B7C]">L/min</span></p>
            </div>
            <div className="w-12 h-12 bg-[#2D9596]/10 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-[#2D9596]" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className={cpap.percentileLeak < 24 ? 'text-[#6A994E]' : 'text-[#F4A261]'}>
              {cpap.percentileLeak < 24 ? '✓ Acceptable' : '⚠ High'}
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-[#E8EEF2]">
            <p className="text-xs text-[#5A6B7C]">
              Target: &lt;24 L/min. Current leak rate is {cpap.percentileLeak < 24 ? 'acceptable' : 'elevated — consider mask refit'}.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#E8EEF2] shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#5A6B7C] mb-1">Mask Interface</p>
              <p className="text-lg font-bold text-[#0A1128]">{cpap.currentMask || '—'}</p>
              <p className="text-sm text-[#5A6B7C]">Pressure: {cpap.pressureSettings?.current || '—'} cmH₂O</p>
            </div>
            <div className="w-12 h-12 bg-[#F4A261]/10 rounded-lg flex items-center justify-center">
              <Wind className="w-6 h-6 text-[#F4A261]" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#E8EEF2]">
            <p className="text-xs text-[#5A6B7C]">
              Range: {cpap.pressureSettings?.min || '—'} – {cpap.pressureSettings?.max || '—'} cmH₂O. Last mask change: {cpap.lastMaskChange || '—'}
            </p>
          </div>
        </div>
      </div>

      {/* AHI Trend Chart */}
      <div className="bg-white rounded-xl p-6 border border-[#E8EEF2] shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg text-[#0A1128]">AHI Trend Analysis</h3>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {(['30', '60', '90'] as const).map(period => (
                <button
                  key={period}
                  onClick={() => setChartPeriod(period)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${chartPeriod === period
                    ? 'bg-[#2D9596] text-white'
                    : 'bg-[#E8EEF2] text-[#5A6B7C] hover:bg-[#2D9596]/10'
                  }`}
                >
                  {period} Days
                </button>
              ))}
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={trend30}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8EEF2" />
            <XAxis
              dataKey="day"
              label={{ value: 'Days', position: 'insideBottom', offset: -5 }}
              stroke="#5A6B7C"
            />
            <YAxis
              label={{ value: 'Events/Hour', angle: -90, position: 'insideLeft' }}
              stroke="#5A6B7C"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E8EEF2',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="ahi"
              stroke="#2D9596"
              strokeWidth={2}
              dot={{ fill: '#2D9596', r: 4 }}
              name="AHI"
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-[#E8EEF2] rounded-lg p-4">
            <p className="text-xs text-[#5A6B7C] mb-1">Average AHI ({chartPeriod}d)</p>
            <p className="text-xl font-semibold text-[#0A1128]">{avgAhi30}</p>
          </div>
          <div className="bg-[#E8EEF2] rounded-lg p-4">
            <p className="text-xs text-[#5A6B7C] mb-1">Trend Direction</p>
            <p className={`text-xl font-semibold ${trendDirection === 'Improving' ? 'text-[#6A994E]' : trendDirection === 'Worsening' ? 'text-[#E76F51]' : 'text-[#F4A261]'}`}>{trendDirection}</p>
          </div>
          <div className="bg-[#E8EEF2] rounded-lg p-4">
            <p className="text-xs text-[#5A6B7C] mb-1">Days Below Target (&lt;5)</p>
            <p className="text-xl font-semibold text-[#0A1128]">{daysBelowTarget}/{trend30.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
