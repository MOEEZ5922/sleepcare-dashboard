import { useParams } from 'react-router';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Wind, Calendar, AlertCircle, Signal, Loader2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { fetchCpapTrends } from '../../data/api';

export default function TechnicianCPAP() {
  const { id } = useParams();
  const { data: cpap, isLoading, error } = useApi(() => fetchCpapTrends(id || '1'), {
    dependencies: [id]
  });

  const isLive = !error && !!cpap;

  if (isLoading && !cpap) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-[#F4A261] animate-spin" />
      </div>
    );
  }

  if (!cpap) {
    return (
      <div className="p-8 text-center text-[#5A6B7C]">
        <p>Unable to load CPAP data. Please try again.</p>
      </div>
    );
  }

  // Compute days since last mask change
  const daysSinceMaskChange = cpap.lastMaskChange
    ? Math.floor((Date.now() - new Date(cpap.lastMaskChange).getTime()) / (1000 * 60 * 60 * 24))
    : null;

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
              <p className="text-sm text-[#5A6B7C] mb-1">Average Hours Used</p>
              <p className="text-4xl font-semibold text-[#0A1128]">{cpap.averageHours}</p>
            </div>
            <div className="w-12 h-12 bg-[#F4A261]/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-[#F4A261]" />
            </div>
          </div>
          <p className="text-sm text-[#5A6B7C]">Target: &gt;4 hours/night</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#E8EEF2] shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#5A6B7C] mb-1">Mask Type</p>
              <p className="text-lg font-semibold text-[#0A1128]">{cpap.currentMask || '—'}</p>
              <p className="text-[#5A6B7C]">Leak P90: {cpap.percentileLeak} L/min</p>
            </div>
            <div className="w-12 h-12 bg-[#2D9596]/10 rounded-lg flex items-center justify-center">
              <Wind className="w-6 h-6 text-[#2D9596]" />
            </div>
          </div>
          {cpap.percentileLeak > 20 && (
            <div className="pt-3 border-t border-[#E8EEF2]">
              <p className="text-xs font-semibold text-[#E76F51] flex items-center gap-1 mb-1 uppercase tracking-wider">
                <AlertCircle className="w-3.5 h-3.5" /> High Leak Alert
              </p>
              <p className="text-sm text-[#E76F51] font-medium tracking-tight">Leak P90 exceeds 20 L/min. Consider mask refit.</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#E8EEF2] shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[#5A6B7C] mb-1">Last Mask Change</p>
              <p className="text-lg font-semibold text-[#0A1128]">
                {cpap.lastMaskChange ? new Date(cpap.lastMaskChange).toLocaleDateString() : '—'}
              </p>
              {daysSinceMaskChange !== null && (
                <p className={daysSinceMaskChange > 90 ? 'text-[#E76F51]' : 'text-[#F4A261]'}>
                  {daysSinceMaskChange} days ago
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-[#6A994E]/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[#6A994E]" />
            </div>
          </div>
        </div>
      </div>

      {/* Usage Chart */}
      <div className="bg-white rounded-xl p-6 border border-[#E8EEF2] shadow-sm">
        <h3 className="text-lg text-[#0A1128] mb-6">Daily Usage Hours</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={cpap.usageHistory || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8EEF2" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              stroke="#5A6B7C"
            />
            <YAxis
              label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
              stroke="#5A6B7C"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E8EEF2',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`${value} hours`, 'Usage']}
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
            />
            <Bar dataKey="hours" fill="#F4A261" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pressure Settings Table */}
      <div className="bg-white rounded-xl p-6 border border-[#E8EEF2] shadow-sm">
        <h3 className="text-lg text-[#0A1128] mb-6">Machine Pressure Settings</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8EEF2]">
                <th className="text-left py-3 px-4 text-sm font-medium text-[#5A6B7C]">Setting</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#5A6B7C]">Value</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[#5A6B7C]">Unit</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#E8EEF2]">
                <td className="py-3 px-4 text-[#0A1128]">Minimum Pressure</td>
                <td className="py-3 px-4 text-[#0A1128] font-medium">{cpap.pressureSettings?.min ?? '—'}</td>
                <td className="py-3 px-4 text-[#5A6B7C]">cmH₂O</td>
              </tr>
              <tr className="border-b border-[#E8EEF2]">
                <td className="py-3 px-4 text-[#0A1128]">Maximum Pressure</td>
                <td className="py-3 px-4 text-[#0A1128] font-medium">{cpap.pressureSettings?.max ?? '—'}</td>
                <td className="py-3 px-4 text-[#5A6B7C]">cmH₂O</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-[#0A1128]">Current Pressure (Auto)</td>
                <td className="py-3 px-4 text-[#0A1128] font-medium">{cpap.pressureSettings?.current ?? '—'}</td>
                <td className="py-3 px-4 text-[#5A6B7C]">cmH₂O</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
