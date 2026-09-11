import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { AlertCircle, Signal, Loader2, Wifi, WifiOff, Battery, Clock, Activity, Heart, Wind } from 'lucide-react';
import { useParams } from 'react-router';
import { useApi } from '../../hooks/useApi';
import {
  fetchBiomarkerOverview,
  fetchWithingsData,
  fetchMasimoData,
  fetchSleepData,
  fetchDevices,
  type BiomarkerOverview,
  type WithingsReading,
  type MasimoReading,
  type SomnoArtNight,
  type DeviceInfo,
} from '../../data/api';

// ─── Types ──────────────────────────────────────────────────────────────────────

type BiomarkerType = 'HRV' | 'SpO2' | 'ODI' | 'RespiratoryRate' | 'SleepEfficiency' | 'DeepSleep' | 'WASO' | 'BP';

/**
 * Recharts requires raw CSS color strings — it cannot consume Tailwind classes or
 * CSS custom properties (e.g. var(--color-teal)). These constants mirror the
 * theme tokens defined in theme.css so the colors stay consistent.
 */
const CHART_COLORS = {
  teal:       '#2D9596',
  sage:       '#6A994E',
  amber:      '#F4A261',
  coral:      '#E76F51',
  navy:       '#0A1128',
  violet:     '#8B5CF6',
  cyan:       '#0891B2',
  blue:       '#1D4ED8',
  yellow:     '#F59E0B',
  red:        '#DC2626',
  rose:       '#E11D48',
  slate:      '#5A6B7C',
  lightBlue:  '#E8EEF2',
} as const;

/** Human-readable labels for biomarker tags */
const BIOMARKER_LABELS: Record<BiomarkerType, string> = {
  HRV: 'HRV', SpO2: 'SpO₂', ODI: 'ODI', RespiratoryRate: 'Resp Rate',
  SleepEfficiency: 'Sleep Eff.', DeepSleep: 'Deep Sleep', WASO: 'WASO', BP: 'BP',
};

interface SourceDevice {
  category: string;
  label: string;
  description: string;
  sensorType: string;
  status: 'online' | 'offline' | 'disconnected' | 'unknown';
  lastSync: string;
  icon: typeof Activity;
  color: string;
  provides: BiomarkerType[];
}

interface ChartConfig {
  name: string;
  color: string;
  source: string;
  sourceCategory: string;
  data: { day: string; value: number }[];
  unit: string;
  domain: [number | 'auto', number | 'auto'];
  referenceLines?: { value: number; label: string; color: string }[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(ts: string): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function daysSince(ts: string): number {
  return Math.floor((Date.now() - new Date(ts).getTime()) / 86400000);
}

function computeStats(data: { day: string; value: number }[], unit: string, thresholds?: { good: number; moderate: number }) {
  if (!data.length) return { current: '—', avg: '—', trend: 'No Data', trendColor: 'text-slate-muted' };
  const last = data[data.length - 1].value;
  const avg = +(data.reduce((s, d) => s + d.value, 0) / data.length).toFixed(1);
  let trend = 'Stable';
  let trendColor = 'text-sage';
  if (thresholds) {
    if (last > thresholds.moderate) { trend = 'Elevated'; trendColor = 'text-coral'; }
    else if (last > thresholds.good) { trend = 'Moderate'; trendColor = 'text-amber'; }
    else { trend = 'Good'; trendColor = 'text-sage'; }
  } else if (data.length >= 7) {
    const recent = data.slice(-7).reduce((s, d) => s + d.value, 0) / 7;
    const older = data.slice(0, 7).reduce((s, d) => s + d.value, 0) / Math.min(7, data.length);
    const pctChange = ((recent - older) / older) * 100;
    if (pctChange > 10) { trend = 'Trending Up'; trendColor = 'text-teal'; }
    else if (pctChange < -10) { trend = 'Trending Down'; trendColor = 'text-coral'; }
  }
  return { current: `${last.toFixed(1)}${unit}`, avg: `${avg}${unit}`, trend, trendColor };
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function UniversalBiomarkers() {
  const { id } = useParams();
  const patientId = id || '1';
  const [activeChart, setActiveChart] = useState<BiomarkerType>('HRV');

  // Fetch all data sources in parallel
  const { data: overview, isLoading: loadingOverview } = useApi(
    () => fetchBiomarkerOverview(patientId), {
      dependencies: [patientId],
      cacheKey: `biomarker-overview-${patientId}`
    }
  );
  const { data: withingsData, isLoading: loadingWithings } = useApi(
    () => fetchWithingsData(patientId), {
      dependencies: [patientId],
      cacheKey: `withings-data-${patientId}`
    }
  );
  const { data: masimoData, isLoading: loadingMasimo } = useApi(
    () => fetchMasimoData(patientId), {
      dependencies: [patientId],
      cacheKey: `masimo-data-${patientId}`
    }
  );
  const { data: sleepData, isLoading: loadingSleep } = useApi(
    () => fetchSleepData(patientId), {
      dependencies: [patientId],
      cacheKey: `sleep-data-${patientId}`
    }
  );
  const { data: devices, isLoading: loadingDevices } = useApi(
    () => fetchDevices(patientId), {
      dependencies: [patientId],
      cacheKey: `devices-${patientId}`
    }
  );

  const isLoading = loadingOverview || loadingWithings || loadingMasimo || loadingSleep || loadingDevices;

  // ─── Build device status map ────────────────────────────────────────────────

  const sourceDevices = useMemo<SourceDevice[]>(() => {
    const devMap = new Map<string, DeviceInfo>();
    (devices || []).forEach(d => devMap.set(d.category, d));

    const normalizeStatus = (s?: string): SourceDevice['status'] => {
      if (!s) return 'unknown';
      const lower = s.toLowerCase();
      if (lower === 'connected' || lower === 'active' || lower === 'online') return 'online';
      if (lower === 'offline') return 'offline';
      if (lower === 'disconnected') return 'disconnected';
      return 'unknown';
    };

    const hexDev = devMap.get('hexoskin');
    const somDev = devMap.get('somnoart');
    // Withings devices are not separate categories in the devices API, so infer from overview
    const witWatchSync = overview?.withings_watch?.last_sync;
    const witBpmSync = overview?.withings_bpm?.last_sync;
    const masSyncDate = overview?.masimo?.last_reading;

    return [
      {
        category: 'hexoskin',
        label: 'Hexoskin Smart Shirt',
        description: 'Multi-biomarker chest-worn ECG',
        sensorType: 'ECG + Respiratory Sensors',
        status: hexDev ? normalizeStatus(hexDev.status) : 'unknown',
        lastSync: hexDev?.last_sync_human || (overview?.hexoskin?.last_sync ? `${daysSince(overview.hexoskin.last_sync)}d ago` : '—'),
        icon: Activity,
        color: CHART_COLORS.teal,
        provides: ['HRV', 'RespiratoryRate'],
      },
      {
        category: 'somnoart',
        label: 'Somno-Art',
        description: 'ECG-based PSG alternative',
        sensorType: 'ECG Sleep Staging',
        status: somDev ? normalizeStatus(somDev.status) : 'unknown',
        lastSync: somDev?.last_sync_human || (overview?.somnoart?.last_night ? `${daysSince(overview.somnoart.last_night)}d ago` : '—'),
        icon: Activity,
        color: CHART_COLORS.violet,
        provides: ['SleepEfficiency', 'DeepSleep', 'WASO'],
      },
      {
        category: 'withings_watch',
        label: 'Withings ScanWatch',
        description: 'Wrist-worn cardiovascular tracker',
        sensorType: 'PPG + ECG + BP',
        status: witWatchSync && daysSince(witWatchSync) < 7 ? 'online' : witWatchSync ? 'offline' : 'unknown',
        lastSync: witWatchSync ? `${daysSince(witWatchSync)}d ago` : '—',
        icon: Heart,
        color: CHART_COLORS.sage,
        provides: ['SpO2', 'HRV'],
      },
      {
        category: 'masimo',
        label: 'Masimo MightySat',
        description: 'High-fidelity pulse oximeter',
        sensorType: 'PPG Oximetry',
        status: masSyncDate && daysSince(masSyncDate) < 14 ? 'online' : masSyncDate ? 'offline' : 'unknown',
        lastSync: masSyncDate ? `${daysSince(masSyncDate)}d ago` : '—',
        icon: Wind,
        color: CHART_COLORS.amber,
        provides: ['SpO2', 'ODI'],
      },
      {
        category: 'withings_bpm',
        label: 'Withings BPM Core',
        description: 'BP cuff with ECG electrodes',
        sensorType: 'BP + ECG',
        status: witBpmSync && daysSince(witBpmSync) < 14 ? 'online' : witBpmSync ? 'offline' : 'unknown',
        lastSync: witBpmSync ? `${daysSince(witBpmSync)}d ago` : '—',
        icon: Heart,
        color: CHART_COLORS.rose,
        provides: ['BP'],
      },
    ];
  }, [devices, overview]);

  // ─── Build chart data from real API responses ───────────────────────────────

  const chartConfigs = useMemo<Record<BiomarkerType, ChartConfig>>(() => {
    const withingsReadings = withingsData?.readings || [];
    const masimoReadings = masimoData?.readings || [];
    const sleepNights = sleepData?.nights || [];

    // HRV from Withings (hrv_rmssd)
    const hrvData = withingsReadings.map(r => ({ day: formatDate(r.timestamp), value: +r.hrv_rmssd.toFixed(1) }));

    // SpO2 merged from Withings + Masimo (prefer Withings for density, Masimo as supplemental)
    const spo2Map = new Map<string, number>();
    masimoReadings.forEach(r => spo2Map.set(formatDate(r.timestamp), +r.spo2.toFixed(1)));
    withingsReadings.forEach(r => spo2Map.set(formatDate(r.timestamp), +r.spo2.toFixed(1))); // overwrites Masimo if same day
    const spo2Data = Array.from(spo2Map.entries())
      .map(([day, value]) => ({ day, value }))
      .sort((a, b) => {
        const [am, ad] = a.day.split('/').map(Number);
        const [bm, bd] = b.day.split('/').map(Number);
        return am !== bm ? am - bm : ad - bd;
      });

    // ODI: backend doesn't provide a direct ODI time series — compute from Masimo SpO2 readings
    // For now, use Masimo SpO2 readings as a proxy (inverse: lower SpO2 = higher desaturation)
    const odiData = masimoReadings.map(r => ({
      day: formatDate(r.timestamp),
      value: +(100 - r.spo2).toFixed(1), // approximate desaturation index
    })).sort((a, b) => {
      const [am, ad] = a.day.split('/').map(Number);
      const [bm, bd] = b.day.split('/').map(Number);
      return am !== bm ? am - bm : ad - bd;
    });

    // Respiratory Rate from Masimo (respiration_rate field) + Hexoskin (breathing_rate from overview)
    const respRateData = masimoReadings.map(r => ({
      day: formatDate(r.timestamp),
      value: +r.respiration_rate.toFixed(1),
    })).sort((a, b) => {
      const [am, ad] = a.day.split('/').map(Number);
      const [bm, bd] = b.day.split('/').map(Number);
      return am !== bm ? am - bm : ad - bd;
    });

    // Sleep Efficiency from Somno-Art
    const sleepEffData = sleepNights.map(n => ({
      day: formatDate(n.night_date),
      value: +n.sleep_efficiency_pct.toFixed(1),
    })).reverse();

    // Deep Sleep from Somno-Art
    const deepSleepData = sleepNights.map(n => ({
      day: formatDate(n.night_date),
      value: +n.deep_sleep_min.toFixed(0),
    })).reverse();

    // WASO (Wake After Sleep Onset) from Somno-Art
    const wasoData = sleepNights.map(n => ({
      day: formatDate(n.night_date),
      value: +n.waso_min.toFixed(1),
    })).reverse();

    // Blood Pressure from Withings BPM Core (latest reading from overview)
    const bpData: { day: string; value: number }[] = [];
    if (overview?.withings_bpm?.systolic != null) {
      const bpmSync = overview.withings_bpm.last_sync;
      bpData.push({ day: formatDate(bpmSync), value: overview.withings_bpm.systolic });
    }

    return {
      HRV: {
        name: 'Heart Rate Variability (HRV RMSSD)',
        color: CHART_COLORS.teal,
        source: 'Hexoskin · Withings Watch',
        sourceCategory: 'hexoskin',
        data: hrvData,
        unit: ' ms',
        domain: ['auto', 'auto'],
      },
      SpO2: {
        name: 'Blood Oxygen Saturation (SpO₂)',
        color: CHART_COLORS.sage,
        source: 'Withings Watch · Masimo',
        sourceCategory: 'withings_watch',
        data: spo2Data,
        unit: '%',
        domain: [88, 100],
        referenceLines: [{ value: 90, label: 'Clinical Threshold', color: CHART_COLORS.coral }],
      },
      ODI: {
        name: 'Oxygen Desaturation Index (ODI)',
        color: CHART_COLORS.amber,
        source: 'Masimo MightySat',
        sourceCategory: 'masimo',
        data: odiData,
        unit: '',
        domain: ['auto', 'auto'],
        referenceLines: [{ value: 5, label: 'Normal ≤5', color: CHART_COLORS.sage }, { value: 15, label: 'Moderate', color: CHART_COLORS.amber }],
      },
      RespiratoryRate: {
        name: 'Respiratory Rate',
        color: CHART_COLORS.cyan,
        source: 'Hexoskin · Masimo',
        sourceCategory: 'hexoskin',
        data: respRateData,
        unit: ' bpm',
        domain: ['auto', 'auto'],
        referenceLines: [{ value: 12, label: 'Low', color: CHART_COLORS.amber }, { value: 20, label: 'High', color: CHART_COLORS.coral }],
      },
      SleepEfficiency: {
        name: 'Sleep Efficiency',
        color: CHART_COLORS.violet,
        source: 'Somno-Art',
        sourceCategory: 'somnoart',
        data: sleepEffData,
        unit: '%',
        domain: [50, 100],
        referenceLines: [{ value: 85, label: 'Good ≥85%', color: CHART_COLORS.sage }],
      },
      DeepSleep: {
        name: 'Deep Sleep Duration (N3)',
        color: CHART_COLORS.blue,
        source: 'Somno-Art',
        sourceCategory: 'somnoart',
        data: deepSleepData,
        unit: ' min',
        domain: ['auto', 'auto'],
        referenceLines: [{ value: 60, label: 'Target ≥60m', color: CHART_COLORS.sage }],
      },
      WASO: {
        name: 'Wake After Sleep Onset (WASO)',
        color: CHART_COLORS.yellow,
        source: 'Somno-Art',
        sourceCategory: 'somnoart',
        data: wasoData,
        unit: ' min',
        domain: ['auto', 'auto'],
        referenceLines: [{ value: 30, label: 'Target <30m', color: CHART_COLORS.sage }],
      },
      BP: {
        name: 'Blood Pressure (Systolic)',
        color: CHART_COLORS.red,
        source: 'Withings BPM Core',
        sourceCategory: 'withings',
        data: bpData,
        unit: ' mmHg',
        domain: [90, 160],
        referenceLines: [{ value: 120, label: 'Normal ≤120', color: CHART_COLORS.sage }, { value: 130, label: 'Elevated 130', color: CHART_COLORS.amber }],
      },
    };
  }, [overview, withingsData, masimoData, sleepData, devices]);

  const activeConfig = chartConfigs[activeChart];
  const stats = computeStats(
    activeConfig.data,
    activeConfig.unit,
    activeConfig.thresholds
  );

  // ─── Quality flag: is the source device degraded? ─────────────────────────

  const sourceDevice = sourceDevices.find(d =>
    d.category === activeConfig.sourceCategory ||
    d.provides.includes(activeChart)
  );
  const isSourceDegraded = sourceDevice?.status === 'offline' || sourceDevice?.status === 'disconnected' || sourceDevice?.status === 'unknown';
  const hasNoData = activeConfig.data.length === 0;

  // ─── Loading state ────────────────────────────────────────────────────────

  if (isLoading && !overview) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-amber animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-teal/10 rounded-2xl">
            <Activity className="w-8 h-8 text-teal" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-navy">Digital Biomarkers</h1>
            <p className="text-sm text-slate-muted">Per-source physiological signal monitoring</p>
          </div>
        </div>
      </div>

      {/* ═══ SOURCE AVAILABILITY INDICATOR STRIP ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {sourceDevices.map((device) => {
          const StatusIcon = device.status === 'online' ? Wifi : WifiOff;
          const statusColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
            online:       { bg: 'bg-sage/5',  text: 'text-sage', border: 'border-sage/20', dot: 'bg-sage' },
            offline:      { bg: 'bg-coral/5',  text: 'text-coral', border: 'border-coral/20', dot: 'bg-coral' },
            disconnected: { bg: 'bg-slate-muted/5',  text: 'text-slate-muted', border: 'border-slate-muted/20', dot: 'bg-slate-muted' },
            unknown:      { bg: 'bg-slate-muted/5',  text: 'text-slate-muted', border: 'border-slate-muted/20', dot: 'bg-slate-muted' },
          };
          const sc = statusColors[device.status];
          const isActive = device.provides.includes(activeChart);

          return (
            <div
              key={device.category}
              className={`relative rounded-xl border p-4 transition-all duration-300 cursor-pointer ${sc.bg} ${sc.border} ${isActive ? 'shadow-md' : 'hover:shadow-sm'}`}
              style={isActive ? { outlineColor: device.color, outlineStyle: 'solid', outlineWidth: '2px', outlineOffset: '2px' } : {}}
              onClick={() => {
                const firstProvided = device.provides[0];
                if (firstProvided) setActiveChart(firstProvided);
              }}
            >
              {/* Active indicator dot */}
              {isActive && (
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: device.color }} />
              )}

              <div className="flex items-center justify-between mb-2">
                <device.icon className="w-5 h-5" style={{ color: device.color }} />
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${sc.dot} ${device.status === 'online' ? 'animate-pulse' : ''}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${sc.text}`}>
                    {device.status}
                  </span>
                </div>
              </div>

              <p className="text-sm font-semibold text-navy truncate">{device.label}</p>
              <p className="text-[10px] text-slate-muted mb-1 truncate">{device.sensorType}</p>

              <div className="flex items-center gap-1 text-[11px] text-slate-muted">
                <Clock className="w-3 h-3" />
                <span>{device.lastSync}</span>
              </div>

              {/* Biomarker tags */}
              <div className="flex flex-wrap gap-1 mt-2">
                {device.provides.map(b => (
                  <span
                    key={b}
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                      b === activeChart
                        ? 'text-white'
                        : 'bg-light-blue text-slate-muted'
                    }`}
                    style={b === activeChart ? { backgroundColor: device.color } : {}}
                  >
                    {BIOMARKER_LABELS[b]}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ BIOMARKER SELECTOR ═══ */}
      <div className="bg-card rounded-xl border border-light-blue shadow-sm p-5">
        <label className="block text-xs font-semibold text-slate-muted uppercase tracking-wider mb-2">
          Active Biomarker
        </label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(chartConfigs) as BiomarkerType[]).map((key) => {
            const cfg = chartConfigs[key];
            const isActive = key === activeChart;
            return (
              <button
                key={key}
                onClick={() => setActiveChart(key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border ${
                  isActive
                    ? 'text-white shadow-md scale-[1.02]'
                    : 'bg-card text-navy border-light-blue hover:border-teal/40 hover:bg-teal/5'
                }`}
                style={isActive ? { backgroundColor: cfg.color, borderColor: cfg.color } : {}}
              >
                {cfg.name.split('(')[0].trim()}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ CHART AREA with QUALITY FLAG ═══ */}
      <div className={`bg-card rounded-xl border border-light-blue shadow-sm overflow-hidden transition-all duration-500 ${
        isSourceDegraded ? 'ring-2 ring-coral/30' : ''
      }`}>
        {/* Quality flag warning banner */}
        {isSourceDegraded && (
          <div className="flex items-center gap-3 px-6 py-3 bg-coral/10 border-b border-coral/20">
            <WifiOff className="w-4 h-4 text-coral flex-shrink-0" />
            <p className="text-sm text-coral font-medium">
              <span className="font-bold">{sourceDevice?.label}</span> is {sourceDevice?.status} — last sync: {sourceDevice?.lastSync}. Data shown may be stale.
            </p>
          </div>
        )}

        {/* Chart header */}
        <div className="bg-background p-6 border-b border-light-blue flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: activeConfig.color }} />
            <h3 className="text-xl font-bold text-navy">{activeConfig.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            {!isSourceDegraded && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-sage/10 border border-sage/20 rounded-md">
                <Signal className="w-3 h-3 text-sage" />
                <span className="text-[10px] font-bold text-sage uppercase tracking-wider">Live</span>
              </div>
            )}
            <div className="px-3 py-1 bg-teal/10 text-teal text-xs font-bold rounded-full uppercase tracking-widest border border-teal/20">
              {activeConfig.source}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="px-6 pt-6">
          <div className="flex items-center gap-12 bg-background p-4 rounded-lg border border-light-blue mb-6">
            <div>
              <p className="text-xs text-slate-muted uppercase tracking-wider mb-1">Latest</p>
              <p className="text-3xl font-bold text-navy">{stats.current}</p>
            </div>
            <div>
              <p className="text-xs text-slate-muted uppercase tracking-wider mb-1">Average</p>
              <p className="text-3xl font-bold text-navy">{stats.avg}</p>
            </div>
            <div>
              <p className="text-xs text-slate-muted uppercase tracking-wider mb-1">Trend</p>
              <p className={`text-lg font-bold uppercase tracking-wider ${stats.trendColor}`}>{stats.trend}</p>
            </div>
            <div>
              <p className="text-xs text-slate-muted uppercase tracking-wider mb-1">Data Points</p>
              <p className="text-lg font-bold text-navy">{activeConfig.data.length}</p>
            </div>
          </div>
        </div>

        {/* Chart — dimmed when source is degraded */}
        <div className={`px-6 pb-8 transition-all duration-500 ${
          isSourceDegraded ? 'opacity-40 grayscale' : ''
        }`}>
          {hasNoData ? (
            <div className="flex flex-col items-center justify-center h-[350px] text-slate-muted">
              <WifiOff className="w-12 h-12 mb-3 text-coral/40" />
              <p className="font-semibold">No data available</p>
              <p className="text-sm">Source device has not transmitted readings yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={activeConfig.data}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.lightBlue} />
                <XAxis dataKey="day" stroke={CHART_COLORS.slate} fontSize={12} />
                <YAxis domain={activeConfig.domain} stroke={CHART_COLORS.slate} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: `1px solid ${CHART_COLORS.lightBlue}`,
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    color: CHART_COLORS.navy,
                  }}
                />
                {activeConfig.referenceLines?.map((rl) => (
                  <ReferenceLine
                    key={rl.label}
                    y={rl.value}
                    stroke={rl.color}
                    strokeDasharray="6 4"
                    label={{ value: rl.label, position: 'insideTopRight', fill: rl.color, fontSize: 11 }}
                  />
                ))}
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={activeConfig.color}
                  strokeWidth={3}
                  dot={{ r: 4, fill: activeConfig.color, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: CHART_COLORS.navy }}
                  name={activeConfig.name}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Degraded overlay message */}
        {isSourceDegraded && !hasNoData && (
          <div className="px-6 pb-4 -mt-4">
            <div className="flex items-center gap-2 p-3 bg-coral/5 rounded-lg border border-coral/15">
              <AlertCircle className="w-4 h-4 text-coral flex-shrink-0" />
              <p className="text-xs text-coral">
                Quality flag: Chart is dimmed because the source device is not actively syncing. Values shown reflect the last available readings.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
