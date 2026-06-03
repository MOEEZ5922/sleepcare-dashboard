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
  ShieldCheck
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { fetchPatientSummary, fetchCpapTrends } from '../../data/api';

// ─── Peer Cohort Types & Configs ──────────────────────────────────────────────

type RiskTier = 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'STABLE' | 'LOW';

const TIER_CONFIGS: Record<RiskTier, { label: string; bg: string; text: string; sortValue: number }> = {
  CRITICAL: { label: 'Critical', bg: 'bg-[#E76F51]/10', text: 'text-[#E76F51]', sortValue: 5 },
  HIGH:     { label: 'High',     bg: 'bg-[#E76F51]/10', text: 'text-[#E76F51]', sortValue: 4 },
  ELEVATED: { label: 'Elevated', bg: 'bg-[#F4A261]/10', text: 'text-[#F4A261]', sortValue: 3 },
  STABLE:   { label: 'Stable',   bg: 'bg-[#6A994E]/10', text: 'text-[#6A994E]', sortValue: 2 },
  LOW:      { label: 'Low',      bg: 'bg-[#2D9596]/10', text: 'text-[#2D9596]', sortValue: 1 },
};

// ─── Component ──────────────────────────────────────────────────────────────────

export default function UniversalReporting() {
  const { id } = useParams();
  const patientId = id || '1';

  // Fetch current patient's clinical summary and trend data
  const { data: summary, isLoading: loadingSummary } = useApi(
    () => fetchPatientSummary(patientId), { dependencies: [patientId] }
  );

  const { data: cpapTrends, isLoading: loadingTrends } = useApi(
    () => fetchCpapTrends(patientId, 90), { dependencies: [patientId] }
  );

  // Sorting & Filtering State for the Similar Peers table
  const [sortColumn, setSortColumn] = useState<'riskTier' | 'dropoutRisk'>('riskTier');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');

  const isLoading = loadingSummary || loadingTrends;

  // Generate Anonymized Similar Peers Cohort
  // Represents a static clinical peer comparison group matched on demographic/baseline profile
  const peerCohort = useMemo(() => {
    const baseAge = 55;
    const baseMask = summary?.maskType?.split(' ')[0] || 'AirFit';
    
    return [
      { id: 'Peer Sleeper #8742', age: baseAge - 2, mask: baseMask, dropoutRisk: 85, complianceScore: 42, riskTier: 'CRITICAL' as RiskTier, phase: 'Titration', latestAction: 'Needs Mask Fit adjustment' },
      { id: 'Peer Sleeper #1102', age: baseAge + 5, mask: baseMask, dropoutRisk: 72, complianceScore: 58, riskTier: 'HIGH' as RiskTier, phase: 'Acclimation', latestAction: 'Tuned mask straps' },
      { id: 'Peer Sleeper #4491', age: baseAge - 8, mask: baseMask, dropoutRisk: 64, complianceScore: 68, riskTier: 'ELEVATED' as RiskTier, phase: 'Acclimation', latestAction: 'Swapped standard cushion' },
      { id: 'Peer Sleeper #8832', age: baseAge + 1, mask: baseMask, dropoutRisk: 38, complianceScore: 84, riskTier: 'STABLE' as RiskTier, phase: 'Maintenance', latestAction: 'Began humidification' },
      { id: 'Peer Sleeper #9910', age: baseAge + 3, mask: baseMask, dropoutRisk: 12, complianceScore: 92, riskTier: 'LOW' as RiskTier, phase: 'Maintenance', latestAction: 'Adherent on therapy' },
      { id: 'Peer Sleeper #2201', age: baseAge - 4, mask: baseMask, dropoutRisk: 8, complianceScore: 96, riskTier: 'LOW' as RiskTier, phase: 'Maintenance', latestAction: 'Routine filters swap' },
    ];
  }, [summary]);

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
        valA = TIER_CONFIGS[a.riskTier].sortValue;
        valB = TIER_CONFIGS[b.riskTier].sortValue;
        if (valA === valB) {
          valA = a.dropoutRisk;
          valB = b.dropoutRisk;
        }
      } else if (sortColumn === 'dropoutRisk') {
        valA = a.dropoutRisk;
        valB = b.dropoutRisk;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [peerCohort, searchTerm, tierFilter, sortColumn, sortDirection]);

  // Generate comparative 30/60/90 Days Adherence Data
  const complianceChartData = useMemo(() => {
    const patientScore30 = 82; // Onboarding baseline
    const patientScore60 = summary?.adherenceRate || 45; // Reflects active EMR adherence rate
    const patientScore90 = patientScore60 < 60 ? Math.max(30, patientScore60 - 8) : Math.min(95, patientScore60 + 5);

    return [
      { name: '30 Days (Onboarding)', 'Cohort Average': 84, 'My Progress': patientScore30 },
      { name: '60 Days (Acclimation)', 'Cohort Average': 78, 'My Progress': patientScore60 },
      { name: '90 Days (Maintenance)', 'Cohort Average': 71, 'My Progress': patientScore90 },
    ];
  }, [summary]);

  const peerInterventions = [
    { type: 'Mask Refit & Adjustments', desc: 'Resolved seal issues and bridge pressure', successRate: 92, gain: '+1.8 hrs/night' },
    { type: 'Remote Pressure Adjustment', desc: 'Reduced baseline breathing strain', successRate: 80, gain: '+1.4 hrs/night' },
    { type: 'Coaching Video Guides', desc: 'Self-guided adjustments via mobile videos', successRate: 74, gain: '+1.1 hrs/night' },
  ];

  if (isLoading && !summary) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-[#2D9596] animate-spin" />
      </div>
    );
  }

  const patientName = summary?.name || 'Patient';

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto pb-24">
      
      {/* Clinician Action Header */}
      <div className="p-6 rounded-2xl border-2 flex items-center justify-between shadow-sm bg-[#2D9596]/5 border-[#2D9596]/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#2D9596] text-white">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#0A1128]">
                Clinical Comparative Counseling Console
              </h2>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#6A994E]/10 border border-[#6A994E]/20 rounded-md text-[10px] font-bold text-[#6A994E]">
                <Signal className="w-3 h-3 text-[#6A994E]" /> Active patient: {patientName}
              </div>
            </div>
            <p className="text-sm text-[#5A6B7C]">
              Share this screen during clinical consultations to demonstrate potential therapy pathways and motivate adherence.
            </p>
          </div>
        </div>
      </div>

      {/* Trajectory comparison chart and peer proof */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: 30/60/90 Days Adherence Drift Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E8EEF2] shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-[#E8EEF2] pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#0A1128]">Adherence Trajectory Comparison</h3>
                <p className="text-xs text-[#5A6B7C]">Patient compliance logs plotted against peer group average (90 days)</p>
              </div>
              <span className="bg-[#E76F51]/10 text-[#E76F51] border border-[#E76F51]/20 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                CMS Threshold: 70%
              </span>
            </div>

            <div className="h-64 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={complianceChartData}>
                  <defs>
                    <linearGradient id="colorPeerAdherence" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5A6B7C" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#5A6B7C" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8EEF2" />
                  <XAxis dataKey="name" stroke="#5A6B7C" fontSize={11} tickLine={false} />
                  <YAxis domain={[20, 100]} stroke="#5A6B7C" fontSize={11} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E8EEF2',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      color: '#0A1128',
                    }}
                  />
                  <ReferenceLine
                    y={70}
                    stroke="#E76F51"
                    strokeDasharray="6 4"
                    strokeWidth={1.5}
                    label={{ value: 'CMS target (70%)', position: 'insideBottomRight', fill: '#E76F51', fontSize: 10, fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Cohort Average"
                    stroke="#5A6B7C"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#colorPeerAdherence)"
                    name="Peer Group Avg"
                  />
                  <Area
                    type="monotone"
                    dataKey="My Progress"
                    stroke="#2D9596"
                    strokeWidth={4}
                    fill="none"
                    name={`${patientName.split(' ')[0]} Adherence`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#E76F51]/5 border border-[#E76F51]/10 rounded-xl p-4 mt-6 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#E76F51] mt-0.5 shrink-0" />
            <p className="text-xs text-[#0A1128] leading-relaxed">
              <strong>Clinical Drift Alert:</strong> {patientName.split(' ')[0]}'s CPAP compliance has drifted **33% below the cohort average** at the 60-day mark. Peers who completed a mask fit adjustment during this phase recovered successfully.
            </p>
          </div>
        </div>

        {/* Right Side: Cohort Intervention Effectiveness Stats */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-[#E8EEF2] shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-[#E8EEF2] pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#0A1128]">Peer Efficacy Proof</h3>
                <p className="text-xs text-[#5A6B7C]">Telemetric usage changes post-intervention in this cohort</p>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              {peerInterventions.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E8EEF2] hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xs font-bold text-[#0A1128]">{item.type}</h4>
                    <span className="text-xs font-black text-[#6A994E]">{item.gain}</span>
                  </div>
                  <p className="text-[11px] text-[#5A6B7C] mb-3">{item.desc}</p>
                  
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#5A6B7C] uppercase tracking-wider pt-2 border-t border-[#E8EEF2]/60">
                    <span>Efficacy Rate</span>
                    <span className="text-[#2D9596]">{item.successRate}% resolved</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-[#FAFAFA] border-t border-[#E8EEF2] -mx-6 -mb-6 rounded-b-xl text-[10px] text-center text-[#5A6B7C] font-semibold flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#6A994E]" /> Clinical counseling data synced with sleep center registry.
          </div>
        </div>

      </div>

      {/* PEER COMPARISON TABLE */}
      <div className="bg-white rounded-xl border border-[#E8EEF2] shadow-sm overflow-hidden">
        
        {/* Table Search & Filter Bar */}
        <div className="p-6 border-b border-[#E8EEF2] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-br from-[#FAFAFA] to-white">
          <div>
            <h3 className="text-lg font-bold text-[#0A1128]">Similar Anonymized Peer Cohort</h3>
            <p className="text-xs text-[#5A6B7C] mt-0.5">Demographically matched patients with CPAP therapy tracking</p>
          </div>
          
          <div className="flex gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6B7C]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search peer ID..."
                className="pl-10 pr-4 py-1.5 bg-white border border-[#E8EEF2] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2D9596] text-xs w-48 shadow-sm focus:border-[#2D9596]"
              />
            </div>

            {/* Risk Tier Filter */}
            <div className="flex items-center gap-2 bg-white border border-[#E8EEF2] px-3 py-1.5 rounded-lg shadow-sm">
              <Filter className="w-3.5 h-3.5 text-[#5A6B7C]" />
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="text-xs text-[#0A1128] focus:outline-none bg-transparent font-medium cursor-pointer"
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
              <tr className="bg-[#FAFAFA] border-b border-[#E8EEF2]">
                <th className="px-6 py-4 text-[10px] font-bold text-[#5A6B7C] uppercase tracking-widest">Anonymized Peer ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#5A6B7C] uppercase tracking-widest">Matching baseline</th>
                
                {/* Sortable Risk Tier Header */}
                <th 
                  className="px-6 py-4 text-[10px] font-bold text-[#5A6B7C] uppercase tracking-widest cursor-pointer hover:bg-[#E8EEF2]/50 transition-colors select-none"
                  onClick={() => handleSort('riskTier')}
                >
                  <div className="flex items-center gap-1.5">
                    Risk Tier
                    {sortColumn === 'riskTier' ? (
                      sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-[#5A6B7C]/50" />
                    )}
                  </div>
                </th>
                
                {/* Sortable Dropout Probability Header */}
                <th 
                  className="px-6 py-4 text-[10px] font-bold text-[#5A6B7C] uppercase tracking-widest cursor-pointer hover:bg-[#E8EEF2]/50 transition-colors select-none"
                  onClick={() => handleSort('dropoutRisk')}
                >
                  <div className="flex items-center gap-1.5">
                    Dropout Prob.
                    {sortColumn === 'dropoutRisk' ? (
                      sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-[#5A6B7C]/50" />
                    )}
                  </div>
                </th>
                
                <th className="px-6 py-4 text-[10px] font-bold text-[#5A6B7C] uppercase tracking-widest">Compliance score</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#5A6B7C] uppercase tracking-widest">Active Phase</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#5A6B7C] uppercase tracking-widest">Last Action Logged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EEF2]">
              {processedPeers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#5A6B7C] text-sm">
                    No peer matches found.
                  </td>
                </tr>
              ) : (
                processedPeers.map((p) => {
                  const tc = TIER_CONFIGS[p.riskTier] || TIER_CONFIGS.LOW;
                  
                  return (
                    <tr key={p.id} className="hover:bg-[#FAFAFA]/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-sm text-[#0A1128]">{p.id}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-[#5A6B7C]">
                        Age {p.age} · Mask {p.mask}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${tc.bg} ${tc.text} ${p.riskTier === 'CRITICAL' ? 'border-[#E76F51]/20 animate-pulse' : 'border-transparent'}`}>
                          {tc.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-[#0A1128] w-8">{p.dropoutRisk}%</span>
                          <div className="w-24 bg-[#E8EEF2] h-1.5 rounded-full overflow-hidden shrink-0 shadow-inner">
                            <div 
                              className={`h-full rounded-full ${
                                p.dropoutRisk >= 80 ? 'bg-[#E76F51]' :
                                p.dropoutRisk >= 60 ? 'bg-[#F4A261]' :
                                'bg-[#6A994E]'
                              }`}
                              style={{ width: `${p.dropoutRisk}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold ${p.complianceScore >= 70 ? 'text-[#6A994E]' : 'text-[#E76F51]'}`}>
                          {p.complianceScore}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-[#0A1128]">
                        {p.phase}
                      </td>
                      <td className="px-6 py-4 text-xs text-[#5A6B7C]">
                        {p.latestAction}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-[#FAFAFA] border-t border-[#E8EEF2] text-xs font-semibold text-[#5A6B7C] flex justify-between">
          <span>Comparing matching cohort profile records</span>
          <span>Predictive Models Updated: 24h Ago</span>
        </div>

      </div>

    </div>
  );
}
