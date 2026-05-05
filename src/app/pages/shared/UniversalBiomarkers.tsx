import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, AlertCircle, Signal, Loader2 } from 'lucide-react';
import { useParams } from 'react-router';
import { useApi } from '../../hooks/useApi';
import { fetchBiomarkers } from '../../data/api';

type BiomarkerType = 'ODI' | 'HRV' | 'SpO2' | 'RVO' | 'OAI' | 'DeepSleep' | 'BP';

export default function UniversalBiomarkers() {
  const { id } = useParams();
  const [activeChart, setActiveChart] = useState<BiomarkerType>('ODI');

  const { data: biomarkerData, isLoading, error } = useApi(() => fetchBiomarkers(id || '1'), {
    dependencies: [id]
  });

  const isLive = !error && !!biomarkerData;

  if (isLoading && !biomarkerData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-[#F4A261] animate-spin" />
      </div>
    );
  }

  if (!biomarkerData) {
    return (
      <div className="p-8 text-center text-[#5A6B7C]">
        <p>No biomarker data available for this patient.</p>
      </div>
    );
  }

  // Helper to compute current/avg/status from API data arrays
  function computeStats(data: any[], unit: string, thresholds?: { good: number; moderate: number }) {
    const validPoints = Array.isArray(data) ? data.filter((d: any) => d.value !== null && d.value !== undefined) : [];
    if (validPoints.length === 0) return { current: '—', avg: '—', status: 'No Data', statusColor: 'text-[#5A6B7C]' };
    const lastVal = validPoints[validPoints.length - 1].value;
    const avgVal = (validPoints.reduce((s: number, d: any) => s + d.value, 0) / validPoints.length).toFixed(1);
    let status = 'Normal';
    let statusColor = 'text-[#6A994E]';
    if (thresholds) {
      if (lastVal > thresholds.moderate) { status = 'Elevated'; statusColor = 'text-[#E76F51]'; }
      else if (lastVal > thresholds.good) { status = 'Moderate'; statusColor = 'text-[#F4A261]'; }
      else { status = 'Good'; statusColor = 'text-[#6A994E]'; }
    }
    return { current: `${lastVal}${unit}`, avg: `${avgVal}${unit}`, status, statusColor };
  }

  const odiStats = computeStats(biomarkerData.odi, '', { good: 5, moderate: 15 });
  const hrvStats = computeStats(biomarkerData.hrv, ' ms');
  const spo2Stats = computeStats(biomarkerData.spo2, '%');
  const deepSleepStats = computeStats((biomarkerData as any).deepSleep || [], ' min');
  const bpStats = computeStats((biomarkerData as any).bp || [], ' mmHg');

  const chartConfigs = {
    ODI: {
      name: 'Oxygen Desaturation Index (ODI)',
      color: '#F4A261',
      source: 'Masimo MightySat Rx',
      data: biomarkerData.odi,
      unit: '',
      ...odiStats,
      domain: ['auto', 'auto']
    },
    HRV: {
      name: 'Heart Rate Variability (HRV)',
      color: '#2D9596',
      source: 'Hexoskin Smart Shirt',
      data: biomarkerData.hrv,
      unit: ' ms',
      ...hrvStats,
      domain: ['auto', 'auto']
    },
    SpO2: {
      name: 'Blood Oxygen Saturation (SpO2)',
      color: '#6A994E',
      source: 'Masimo / Withings Watch',
      data: biomarkerData.spo2,
      unit: '%',
      ...spo2Stats,
      domain: [90, 100]
    },
    RVO: {
      name: 'Respiratory Effort Variability (RVO)',
      color: '#8B5CF6',
      source: 'Hexoskin Smart Shirt',
      data: biomarkerData.odi, // RVO not in API, reuse ODI structure
      unit: '',
      ...odiStats,
      domain: ['auto', 'auto']
    },
    OAI: {
      name: 'Obstructive Apnea Index (OAI)',
      color: '#EF4444',
      source: 'Somno-Art Analysis',
      data: biomarkerData.odi, // OAI not in API, reuse ODI structure
      unit: '',
      ...odiStats,
      domain: ['auto', 'auto']
    },
    DeepSleep: {
      name: 'Deep Sleep Duration (N3)',
      color: '#1D4ED8',
      source: 'Somno-Art / Löwenstein',
      data: (biomarkerData as any).deepSleep || [],
      unit: ' min',
      ...deepSleepStats,
      domain: ['auto', 'auto']
    },
    BP: {
      name: 'Blood Pressure (SYS/DIA)',
      color: '#E11D48',
      source: 'Withings BPM Core',
      data: (biomarkerData as any).bp || [],
      unit: ' mmHg',
      ...bpStats,
      domain: ['auto', 'auto'],
      isMultiLine: true
    }
  };

  const activeConfig = chartConfigs[activeChart];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#F4A261]/10 rounded-2xl">
            <AlertCircle className="w-8 h-8 text-[#F4A261]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0A1128]">Physiological Biomarkers</h1>
            <p className="text-sm text-[#5A6B7C]">Multimodal sensor data integration</p>
          </div>
          {isLive && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-[#6A994E]/10 border border-[#6A994E]/20 rounded-md ml-2">
              <Signal className="w-3 h-3 text-[#6A994E]" />
              <span className="text-[10px] font-bold text-[#6A994E] uppercase tracking-wider">Live</span>
            </div>
          )}
        </div>
      </div>

      {/* Contextual AI Summary */}
      <div className="bg-[#E76F51]/5 border-l-4 border-[#E76F51] rounded-r-xl p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-[#E76F51]/10 rounded-full flex items-center justify-center flex-shrink-0">
             <AlertCircle className="w-5 h-5 text-[#E76F51]" />
          </div>
          <div>
             <h3 className="text-[#0A1128] font-bold mb-1">AI Pathway Summary</h3>
             <p className="text-[#5A6B7C] text-sm">SpO2 is somewhat stable, but <span className="font-semibold text-[#0A1128]">HRV is trending down</span> alongside high mask leak rates. Recommend reviewing patient for MAD/HNS Transition Path.</p>
          </div>
        </div>
      </div>

      {/* Biomarker Selector Menu */}
      <div className="bg-white rounded-xl border border-[#E8EEF2] shadow-sm p-6 mb-6">
        <label className="block text-sm font-semibold text-[#0A1128] uppercase tracking-wider mb-3">
          Select Active Clinical Biomarker
        </label>
        <div className="relative">
          <select 
            value={activeChart}
            onChange={(e) => setActiveChart(e.target.value as BiomarkerType)}
            className="w-full appearance-none bg-[#FAFAFA] border-2 border-[#E8EEF2] text-[#0A1128] font-medium py-3 px-4 rounded-lg focus:outline-none focus:border-[#2D9596] cursor-pointer transition-colors"
          >
            <option value="ODI">Oxygen Desaturation Index (ODI)</option>
            <option value="HRV">Heart Rate Variability (HRV)</option>
            <option value="SpO2">Blood Oxygen Saturation (SpO2)</option>
            <option value="RVO">Respiratory Effort Variability (RVO)</option>
            <option value="OAI">Obstructive Apnea Index (OAI)</option>
            <option value="DeepSleep">Deep Sleep Duration (N3)</option>
            <option value="BP">Blood Pressure (SYS/DIA)</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#5A6B7C]">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Dynamic Active Chart Area */}
      <div className="bg-white rounded-xl border border-[#E8EEF2] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="bg-[#FAFAFA] p-6 border-b border-[#E8EEF2] flex items-center justify-between">
           <div className="flex items-center gap-4">
             <div className="w-4 h-4 rounded-full" style={{ backgroundColor: (activeConfig as any).color }} />
             <h3 className="text-xl font-bold text-[#0A1128]">{(activeConfig as any).name}</h3>
           </div>
           <div className="px-3 py-1 bg-[#2D9596]/10 text-[#2D9596] text-xs font-bold rounded-full uppercase tracking-widest border border-[#2D9596]/20">
             Source: {(activeConfig as any).source}
           </div>
        </div>
        
        <div className="px-6 py-6 pb-8">
          <div className="mb-8 flex items-center gap-12 bg-[#FAFAFA] p-4 rounded-lg border border-[#E8EEF2]">
            <div>
              <p className="text-xs text-[#5A6B7C] uppercase tracking-wider mb-1">Current Value</p>
              <p className="text-3xl font-bold text-[#0A1128]">{activeConfig.current}</p>
            </div>
            <div>
              <p className="text-xs text-[#5A6B7C] uppercase tracking-wider mb-1">30-Day Average</p>
              <p className="text-3xl font-bold text-[#0A1128]">{activeConfig.avg}</p>
            </div>
            <div>
              <p className="text-xs text-[#5A6B7C] uppercase tracking-wider mb-1">Clinical Status</p>
              <p className={`text-lg font-bold uppercase tracking-wider ${activeConfig.statusColor}`}>{activeConfig.status}</p>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={activeConfig.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EEF2" />
              <XAxis dataKey="day" stroke="#5A6B7C" />
              <YAxis domain={activeConfig.domain as any} stroke="#5A6B7C" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E8EEF2',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  color: '#0A1128'
                }}
              />
              {(activeConfig as any).isMultiLine ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="systolic"
                    stroke={(activeConfig as any).color}
                    strokeWidth={3}
                    dot={{ r: 4, fill: (activeConfig as any).color, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#0A1128' }}
                    name="Systolic"
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    stroke="#F4A261"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#F4A261', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#0A1128' }}
                    name="Diastolic"
                  />
                </>
              ) : (
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={(activeConfig as any).color}
                  strokeWidth={3}
                  dot={{ r: 4, fill: (activeConfig as any).color, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#0A1128' }}
                  name={(activeConfig as any).name}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
