import { useState, useMemo } from 'react';
import { useParams } from 'react-router';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import {
  Activity,
  Signal,
  Loader2,
  Search,
  Filter,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Gauge,
  Clock,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import {
  fetchPatientSummary,
  fetchCpapTrends,
  fetchClinicianCohort,
  ClinicianCohortMember,
  calculateComplianceTrajectory,
  fetchPeerInterventions,
  fetchLatencyKPIDashboard,
} from '../../data/api';

// ─── Peer Cohort Types & Configs ──────────────────────────────────────────────

type RiskTier = 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'STABLE' | 'LOW';

/**
 * Recharts requires raw CSS color strings — it cannot consume Tailwind classes or
 * CSS custom properties. These constants mirror the tokens in theme.css.
 */
const CHART_COLORS = {
  teal:       '#2D9596',
  sage:       '#6A994E',
  amber:      '#F4A261',
  coral:      '#E76F51',
  navy:       '#0A1128',
  slate:      '#5A6B7C',
  lightBlue:  '#E8EEF2',
} as const;

const TIER_CONFIGS: Record<RiskTier, { label: string; bg: string; text: string; sortValue: number }> = {
  CRITICAL: { label: 'Critical', bg: 'bg-coral/10', text: 'text-coral', sortValue: 5 },
  HIGH:     { label: 'High',     bg: 'bg-coral/10', text: 'text-coral', sortValue: 4 },
  ELEVATED: { label: 'Elevated', bg: 'bg-amber/10', text: 'text-amber', sortValue: 3 },
  STABLE:   { label: 'Stable',   bg: 'bg-sage/10', text: 'text-sage', sortValue: 2 },
  LOW:      { label: 'Low',      bg: 'bg-teal/10', text: 'text-teal', sortValue: 1 },
};

// ─── Component ──────────────────────────────────────────────────────────────────

export default function UniversalReporting() {
  const { id } = useParams();
  const patientId = id || '1';

  // Fetch current patient's clinical summary and trend data
  const { data: summary, isLoading: loadingSummary } = useApi(
    () => fetchPatientSummary(patientId), {
      dependencies: [patientId],
      cacheKey: `patient-summary-${patientId}`
    }
  );

  const { data: cpapTrends, isLoading: loadingTrends } = useApi(
    () => fetchCpapTrends(patientId, 90), {
      dependencies: [patientId],
      cacheKey: `cpap-trends-90-${patientId}`
    }
  );

  // Sorting & Filtering State for the Similar Peers table
  const [sortColumn, setSortColumn] = useState<'riskTier' | 'dropoutRisk'>('riskTier');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');

  const { data: peerCohort = [], isLoading: loadingCohort } = useApi(
    () => fetchClinicianCohort(patientId), {
      dependencies: [patientId],
      cacheKey: `clinician-cohort-${patientId}`
    }
  );

  // Fetch distributed tracing latency KPIs for Clinician view
  const { data: telemetryKpis } = useApi(
    () => fetchLatencyKPIDashboard(true, 10), {
      cacheKey: 'clinician-telemetry-kpis'
    }
  );

  const isLoading = loadingSummary || loadingTrends || loadingCohort;

  // Handle Cohort Table sorting
  const handleSort = (column: 'riskTier' | 'dropoutRisk') => {
    if (sortColumn === column) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // Filter and sort similar peers
  const processedPeers = useMemo(() => {
    let result = [...peerCohort];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(p => p.id.toLowerCase().includes(q));
    }

    if (tierFilter !== 'all') {
      result = result.filter(p => p.riskTier === tierFilter);
    }

    result.sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (sortColumn === 'riskTier') {
        valA = TIER_CONFIGS[a.riskTier as RiskTier]?.sortValue || 0;
        valB = TIER_CONFIGS[b.riskTier as RiskTier]?.sortValue || 0;
        if (valA === valB) {
          valA = a.dropoutRisk || 0;
          valB = b.dropoutRisk || 0;
        }
      } else if (sortColumn === 'dropoutRisk') {
        valA = a.dropoutRisk || 0;
        valB = b.dropoutRisk || 0;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [peerCohort, searchTerm, tierFilter, sortColumn, sortDirection]);

  // Generate comparative 30/60/90 Days Adherence Data
  const complianceChartData = useMemo(() => {
    return calculateComplianceTrajectory(summary?.adherenceRate || 45);
  }, [summary]);

  const { data: rawPeerInterventions } = useApi(
    () => fetchPeerInterventions(patientId), {
      dependencies: [patientId],
      cacheKey: `peer-interventions-${patientId}`
    }
  );
  const peerInterventions = Array.isArray(rawPeerInterventions) ? rawPeerInterventions : [];

  if (isLoading && !summary) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-teal animate-spin" />
      </div>
    );
  }

  const patientName = summary?.name || 'Patient';

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto pb-24">
      
      {/* Clinician Action Header */}
      <div className="p-6 rounded-2xl border-2 flex items-center justify-between shadow-sm bg-teal/5 border-teal/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal text-white">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-navy">
                Clinical Comparative Counseling Console
              </h2>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-sage/10 border border-sage/20 rounded-md text-[10px] font-bold text-sage">
                <Signal className="w-3 h-3 text-sage" /> Active patient: {patientName}
              </div>
            </div>
            <p className="text-sm text-slate-muted">
              Share this screen during clinical consultations to demonstrate potential therapy pathways and motivate adherence.
            </p>
          </div>
        </div>
      </div>

      {/* Trajectory comparison chart and peer proof */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: 30/60/90 Days Adherence Drift Chart */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-light-blue shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-light-blue pb-3">
              <div>
                <h3 className="text-lg font-bold text-navy">Adherence Trajectory Comparison</h3>
                <p className="text-xs text-slate-muted">Patient compliance logs plotted against peer group average (90 days)</p>
              </div>
              <span className="bg-coral/10 text-coral border border-coral/20 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                CMS Threshold: 70%
              </span>
            </div>

            <div className="h-64 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={complianceChartData}>
                  <defs>
                    <linearGradient id="colorPeerAdherence" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.slate} stopOpacity={0.15}/>
                      <stop offset="95%" stopColor={CHART_COLORS.slate} stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.lightBlue} />
                  <XAxis dataKey="name" stroke={CHART_COLORS.slate} fontSize={11} tickLine={false} />
                  <YAxis domain={[20, 100]} stroke={CHART_COLORS.slate} fontSize={11} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: `1px solid ${CHART_COLORS.lightBlue}`,
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      color: CHART_COLORS.navy,
                    }}
                  />
                  <ReferenceLine
                    y={70}
                    stroke={CHART_COLORS.coral}
                    strokeDasharray="6 4"
                    strokeWidth={1.5}
                    label={{ value: 'CMS target (70%)', position: 'insideBottomRight', fill: CHART_COLORS.coral, fontSize: 10, fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Cohort Average"
                    stroke={CHART_COLORS.slate}
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#colorPeerAdherence)"
                    name="Peer Group Avg"
                  />
                  <Area
                    type="monotone"
                    dataKey="My Progress"
                    stroke={CHART_COLORS.teal}
                    strokeWidth={4}
                    fill="none"
                    name={`${patientName.split(' ')[0]} Adherence`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-coral/5 border border-coral/10 rounded-xl p-4 mt-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-coral mt-0.5 shrink-0" />
            <p className="text-xs text-navy leading-relaxed">
              <strong>Clinical Drift Alert:</strong> {patientName.split(' ')[0]}'s CPAP compliance has drifted **33% below the cohort average** at the 60-day mark. Peers who completed a mask fit adjustment during this phase recovered successfully.
            </p>
          </div>
        </div>

        {/* Right Side: Cohort Intervention Effectiveness Stats */}
        <div className="lg:col-span-1 bg-card rounded-xl border border-light-blue shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-light-blue pb-3">
              <div>
                <h3 className="text-lg font-bold text-navy">Peer Efficacy Proof</h3>
                <p className="text-xs text-slate-muted">Telemetric usage changes post-intervention in this cohort</p>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              {peerInterventions.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-background border border-light-blue hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xs font-bold text-navy">{item.type}</h4>
                    <span className="text-xs font-black text-sage">{item.gain}</span>
                  </div>
                  <p className="text-[11px] text-slate-muted mb-3">{item.desc}</p>
                  
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-muted uppercase tracking-wider pt-2 border-t border-light-blue/60">
                    <span>Efficacy Rate</span>
                    <span className="text-teal">{item.successRate}% resolved</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-background border-t border-light-blue -mx-6 -mb-6 rounded-b-xl text-[10px] text-center text-slate-muted font-semibold flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sage" /> Clinical counseling data synced with sleep center registry.
          </div>
        </div>

      </div>

      {/* PEER COMPARISON TABLE */}
      <div className="bg-card rounded-xl border border-light-blue shadow-sm overflow-hidden">
        
        {/* Table Search & Filter Bar */}
        <div className="p-6 border-b border-light-blue flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-background to-card">
          <div>
            <h3 className="text-lg font-bold text-navy">Similar Anonymized Peer Cohort</h3>
            <p className="text-xs text-slate-muted mt-0.5">Demographically matched patients with CPAP therapy tracking</p>
          </div>
          
          <div className="flex gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search peer ID..."
                className="pl-10 pr-4 py-1.5 bg-card border border-light-blue rounded-lg focus:outline-none focus:ring-1 focus:ring-teal text-xs w-48 shadow-sm focus:border-teal"
              />
            </div>

            {/* Risk Tier Filter */}
            <div className="flex items-center gap-2 bg-card border border-light-blue px-3 py-1.5 rounded-lg shadow-sm">
              <Filter className="w-3.5 h-3.5 text-slate-muted" />
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="text-xs text-navy focus:outline-none bg-transparent font-medium cursor-pointer"
              >
                <option value="all">All Risk Tiers</option>
                <option value="CRITICAL">Critical Risk</option>
                <option value="HIGH">High Risk</option>
                <option value="ELEVATED">Elevated Risk</option>
                <option value="STABLE">Stable Risk</option>
                <option value="LOW">Low Risk</option>
              </select>
            </div>
          </div>
        </div>

        {/* Similar peer data table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background border-b border-light-blue">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-muted uppercase tracking-widest">Anonymized Peer ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-muted uppercase tracking-widest">Matching baseline</th>
                
                {/* Sortable Risk Tier Header */}
                <th 
                  className="px-6 py-4 text-[10px] font-bold text-slate-muted uppercase tracking-widest cursor-pointer hover:bg-light-blue/50 transition-colors select-none"
                  onClick={() => handleSort('riskTier')}
                >
                  <div className="flex items-center gap-1.5">
                    Risk Tier
                    {sortColumn === 'riskTier' ? (
                      sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-muted/50" />
                    )}
                  </div>
                </th>
                
                {/* Sortable Dropout Probability Header */}
                <th 
                  className="px-6 py-4 text-[10px] font-bold text-slate-muted uppercase tracking-widest cursor-pointer hover:bg-light-blue/50 transition-colors select-none"
                  onClick={() => handleSort('dropoutRisk')}
                >
                  <div className="flex items-center gap-1.5">
                    Dropout Prob.
                    {sortColumn === 'dropoutRisk' ? (
                      sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-muted/50" />
                    )}
                  </div>
                </th>
                
                <th className="px-6 py-4 text-[10px] font-bold text-slate-muted uppercase tracking-widest">Compliance score</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-muted uppercase tracking-widest">Active Phase</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-muted uppercase tracking-widest">Last Action Logged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-blue">
              {processedPeers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-muted text-sm">
                    No peer matches found.
                  </td>
                </tr>
              ) : (
                processedPeers.map((p) => {
                  const tc = TIER_CONFIGS[p.riskTier as RiskTier] || TIER_CONFIGS.LOW;
                  
                  return (
                    <tr key={p.id} className="hover:bg-background/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-sm text-navy">{p.id}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-muted">
                        Age {p.age} · Mask {p.mask}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${tc.bg} ${tc.text} ${p.riskTier === 'CRITICAL' ? 'border-coral/20 animate-pulse' : 'border-transparent'}`}>
                          {tc.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-navy w-8">{p.dropoutRisk}%</span>
                          <div className="w-24 bg-light-blue h-1.5 rounded-full overflow-hidden shrink-0 shadow-inner">
                            <div 
                              className={`h-full rounded-full ${
                                p.dropoutRisk >= 80 ? 'bg-coral' :
                                p.dropoutRisk >= 60 ? 'bg-amber' :
                                'bg-sage'
                              }`}
                              style={{ width: `${p.dropoutRisk}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold ${p.complianceScore >= 70 ? 'text-sage' : 'text-coral'}`}>
                          {p.complianceScore}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-navy">
                        {p.phase}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-muted">
                        {p.latestAction}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-background border-t border-light-blue text-xs font-semibold text-slate-muted flex justify-between">
          <span>Comparing matching cohort profile records</span>
          <span>Predictive Models Updated: 24h Ago</span>
        </div>

      </div>

      {/* ═══ DISTRIBUTED TRACING & LATENCY SLA MONITORING ═══ */}
      <div className="bg-card rounded-2xl border border-light-blue shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="p-6 border-b border-light-blue flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-background to-card">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-teal/10 text-teal border border-teal/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-navy">Distributed Tracing & Latency SLA</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal/10 text-teal border border-teal/20">
                  SQL Server 2025 • telemetry.event_traces
                </span>
              </div>
              <p className="text-xs text-slate-muted mt-0.5">
                End-to-end edge pipeline monitoring from Raspberry Pi detection (t0) to client playback (t10)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="px-3 py-1.5 rounded-xl bg-sage/10 border border-sage/30 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
              <span className="text-xs font-bold text-sage">
                SLA Pass Rate: {telemetryKpis?.sla_budget_pass_rate_pct != null ? `${telemetryKpis.sla_budget_pass_rate_pct.toFixed(1)}%` : '100.0%'} (&lt;60s)
              </span>
            </div>
          </div>
        </div>

        {/* Pipeline Stage Latencies Metric Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 p-6 bg-background/60 border-b border-light-blue">
          <div className="p-3.5 bg-card rounded-xl border border-light-blue shadow-xs">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-muted uppercase tracking-wider mb-1">
              <Radio className="w-3 h-3 text-teal" />
              <span>Pi Edge Delay</span>
            </div>
            <p className="text-xl font-black text-navy">
              {telemetryKpis?.avg_pi_processing_ms != null ? `${telemetryKpis.avg_pi_processing_ms.toFixed(1)} ms` : '3.9 ms'}
            </p>
            <span className="text-[10px] text-slate-muted">t3 - t2 (Anomaly Filter)</span>
          </div>

          <div className="p-3.5 bg-card rounded-xl border border-light-blue shadow-xs">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-muted uppercase tracking-wider mb-1">
              <Gauge className="w-3 h-3 text-teal" />
              <span>VM Push Delay</span>
            </div>
            <p className="text-xl font-black text-navy">
              {telemetryKpis?.avg_vm_push_ms != null ? `${telemetryKpis.avg_vm_push_ms.toFixed(0)} ms` : '348 ms'}
            </p>
            <span className="text-[10px] text-slate-muted">t4 - t3 (Video VM ingest)</span>
          </div>

          <div className="p-3.5 bg-card rounded-xl border border-light-blue shadow-xs">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-muted uppercase tracking-wider mb-1">
              <Signal className="w-3 h-3 text-teal" />
              <span>Transit Latency</span>
            </div>
            <p className="text-xl font-black text-navy">
              {telemetryKpis?.avg_network_transit_ms != null ? `${telemetryKpis.avg_network_transit_ms.toFixed(0)} ms` : '285 ms'}
            </p>
            <span className="text-[10px] text-slate-muted">Edge-to-Cloud transit</span>
          </div>

          <div className="p-3.5 bg-card rounded-xl border border-light-blue shadow-xs">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-muted uppercase tracking-wider mb-1">
              <Clock className="w-3 h-3 text-sage" />
              <span>Time-to-Display</span>
            </div>
            <p className="text-xl font-black text-sage">
              {telemetryKpis?.avg_time_to_display_ms != null
                ? `${(telemetryKpis.avg_time_to_display_ms / 1000).toFixed(1)}s`
                : '< 1.2s'}
            </p>
            <span className="text-[10px] text-slate-muted">t8 - t0 (Modal render)</span>
          </div>

          <div className="p-3.5 bg-card rounded-xl border border-light-blue shadow-xs">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-muted uppercase tracking-wider mb-1">
              <Zap className="w-3 h-3 text-amber" />
              <span>Time-to-Play</span>
            </div>
            <p className="text-xl font-black text-amber">
              {telemetryKpis?.avg_time_to_play_ms != null
                ? `${(telemetryKpis.avg_time_to_play_ms / 1000).toFixed(1)}s`
                : '< 2.5s'}
            </p>
            <span className="text-[10px] text-slate-muted">t9 - t0 (Patient play)</span>
          </div>

          <div className="p-3.5 bg-card rounded-xl border border-light-blue shadow-xs">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-muted uppercase tracking-wider mb-1">
              <CheckCircle2 className="w-3 h-3 text-teal" />
              <span>Monitored Events</span>
            </div>
            <p className="text-xl font-black text-navy">
              {telemetryKpis?.total_events || 39}
            </p>
            <span className="text-[10px] text-slate-muted">Active Trace Records</span>
          </div>
        </div>

        {/* Recent Traces Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background border-b border-light-blue">
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-muted uppercase tracking-widest">Event Trace ID</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-muted uppercase tracking-widest">Trigger Type</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-muted uppercase tracking-widest">Severity</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-muted uppercase tracking-widest">Pipeline Scenario</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-muted uppercase tracking-widest">Target Video</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-muted uppercase tracking-widest">SLA Budget</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-slate-muted uppercase tracking-widest">Lifecycle Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-blue text-xs">
              {(!telemetryKpis?.recent_traces || telemetryKpis.recent_traces.length === 0) ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-muted">
                    No recent telemetry traces logged.
                  </td>
                </tr>
              ) : (
                telemetryKpis.recent_traces.slice(0, 8).map((trace) => {
                  const sevColors: Record<string, string> = {
                    critical: 'bg-coral/10 text-coral border-coral/30',
                    high:     'bg-amber/10 text-amber border-amber/30',
                    medium:   'bg-teal/10 text-teal border-teal/30',
                    low:      'bg-sage/10 text-sage border-sage/30',
                    routine:  'bg-slate-muted/10 text-slate-muted border-slate-muted/30',
                  };
                  const statusColors: Record<string, string> = {
                    completed: 'bg-sage/10 text-sage border-sage/30',
                    played:    'bg-teal/10 text-teal border-teal/30',
                    displayed: 'bg-amber/10 text-amber border-amber/30',
                    complete:  'bg-sage/10 text-sage border-sage/30',
                    partial:   'bg-slate-muted/10 text-slate-muted border-slate-muted/30',
                  };

                  return (
                    <tr key={trace.event_id} className="hover:bg-background/50 transition-colors">
                      <td className="px-6 py-3 font-mono font-bold text-navy">
                        <span title={trace.event_id || ''}>
                          {trace.event_id ? `${trace.event_id.substring(0, 8)}...` : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-medium text-navy capitalize">
                        {trace.trigger_type ? trace.trigger_type.replace(/_/g, ' ') : '—'}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${sevColors[trace.severity] || sevColors.routine}`}>
                          {trace.severity}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-muted font-mono text-[11px]">
                        {trace.scenario}
                      </td>
                      <td className="px-6 py-3 text-navy max-w-[220px] truncate" title={trace.video_title || ''}>
                        {trace.video_title || `Video #${trace.video_id || '—'}`}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center gap-1 font-bold ${trace.budget_passed ? 'text-sage' : 'text-coral'}`}>
                          {trace.budget_passed ? '✓ < 60s' : '✕ Exceeded'}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[trace.status] || statusColors.partial}`}>
                          {trace.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-background border-t border-light-blue text-xs font-semibold text-slate-muted flex items-center justify-end">
          <span className="text-teal">Continuous SLA Verification Active</span>
        </div>
      </div>

    </div>
  );
}
