import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {
  Sparkles,
  Smile,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { fetchPatientSummary, fetchCpapTrends, fetchPatientCohort, PatientCohortMember, calculateComplianceTrajectory, PEER_INTERVENTIONS } from '../../data/api';

type RiskTier = 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'STABLE' | 'LOW';

const TIER_CONFIGS: Record<RiskTier, { label: string; bg: string; text: string; patientFriendly: string }> = {
  CRITICAL: { label: 'Critical', bg: 'bg-[#E76F51]/10', text: 'text-[#E76F51]', patientFriendly: 'Needs Support' },
  HIGH:     { label: 'High',     bg: 'bg-[#E76F51]/10', text: 'text-[#E76F51]', patientFriendly: 'Needs Support' },
  ELEVATED: { label: 'Elevated', bg: 'bg-[#F4A261]/10', text: 'text-[#F4A261]', patientFriendly: 'Adjusting' },
  STABLE:   { label: 'Stable',   bg: 'bg-[#6A994E]/10', text: 'text-[#6A994E]', patientFriendly: 'Steady Sleep' },
  LOW:      { label: 'Low',      bg: 'bg-[#2D9596]/10', text: 'text-[#2D9596]', patientFriendly: 'Sleep Champion' },
};

export default function PatientReporting() {
  const { id } = useParams();
  const navigate = useNavigate();
  const patientId = id || '1';

  // Fetch patient summary & trends
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

  const { data: peerCohort = [], isLoading: loadingCohort } = useApi(
    () => fetchPatientCohort(patientId), {
      dependencies: [patientId],
      cacheKey: `patient-cohort-${patientId}`
    }
  );

  const isLoading = loadingSummary || loadingTrends || loadingCohort;

  // Generate comparative 30/60/90 Days Adherence Data
  const complianceChartData = useMemo(() => {
    return calculateComplianceTrajectory(summary?.adherenceRate || 45);
  }, [summary]);

  const peerInterventions = PEER_INTERVENTIONS;

  if (isLoading && !summary) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-[#6A994E] animate-spin" />
      </div>
    );
  }

  const patientName = summary?.name || 'Patient';

  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto pb-32">
      
      {/* Patient Welcome Header */}
      <div className="bg-white rounded-3xl p-8 border-2 border-[#E8EEF2] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#6A994E]/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 space-y-4">
          <span className="bg-[#6A994E]/10 border border-[#6A994E]/20 text-[#6A994E] px-3.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
            My Sleep Path
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1128] leading-tight">
            Let's look at your sleep progress, {patientName.split(' ')[0]}.
          </h1>
          <p className="text-[#414D5B] text-base leading-relaxed">
            When starting CPAP therapy, it is normal to experience setbacks. Below, we compare your progress to other sleepers just like you to show your potential recovery path.
          </p>
        </div>
      </div>

      {/* COMPARATIVE PROGRESS CHART */}
      <div className="bg-white rounded-3xl border-2 border-[#E8EEF2] p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[#0A1128] mb-1">My Potential Sleep Trajectory</h2>
        <p className="text-xs text-[#5A6B7C] mb-6">Compare your usage hours to successful sleepers in your peer group</p>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={complianceChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EEF2" />
              <XAxis dataKey="name" stroke="#5A6B7C" fontSize={11} tickLine={false} />
              <YAxis domain={[20, 100]} stroke="#5A6B7C" fontSize={11} tickFormatter={(v) => `${Math.round(v)}%`} />
              <Tooltip formatter={(v) => `${v}% Compliance`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="Cohort Average"
                stroke="#5A6B7C"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
                name="Successful Sleepers"
              />
              <Line
                type="monotone"
                dataKey="My Progress"
                stroke="#6A994E"
                strokeWidth={4}
                dot={{ r: 6 }}
                activeDot={{ r: 8 }}
                name="My Adherence"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#6A994E]/5 border border-[#6A994E]/10 rounded-2xl p-4 mt-6 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#6A994E] mt-0.5 shrink-0" />
          <p className="text-xs text-[#414D5B] leading-relaxed">
            <strong>Motivation Tip:</strong> Your adherence took a dip at 60 Days. Sleepers who resolved mask leaks at this stage successfully recovered and reached **71% average compliance** by Day 90. You can too!
          </p>
        </div>
      </div>

      {/* MOTIVATIONAL PEER TABLE */}
      <div className="bg-white rounded-3xl border-2 border-[#E8EEF2] p-6 shadow-sm overflow-hidden">
        <h2 className="text-xl font-bold text-[#0A1128] mb-1">Sleepers Like Me</h2>
        <p className="text-xs text-[#5A6B7C] mb-6">Anonymized progress of other sleepers starting with the same mask type</p>

        <div className="divide-y divide-[#E8EEF2]">
          {peerCohort.map((p, idx) => {
            const tc = TIER_CONFIGS[p.riskTier as RiskTier] || TIER_CONFIGS.LOW;
            return (
              <div key={idx} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-bold text-[#0A1128]">{p.id}</p>
                  <p className="text-[10px] text-[#5A6B7C] font-semibold uppercase">{p.phase} Phase · {p.mask}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${tc.bg} ${tc.text}`}>
                    {tc.patientFriendly}
                  </span>
                  <p className="text-xs font-bold text-[#0A1128] mt-1.5">{p.complianceScore}% sleep nights</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PROVEN HELPERS CARD */}
      <div className="bg-[#0A1128] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        
        <h2 className="text-xl font-bold mb-1 flex items-center gap-2"><Smile className="w-6 h-6 text-[#F4A261]"/> Proven Solutions That Helped Peers</h2>
        <p className="text-xs text-white/60 mb-6">Peer recovery metrics after making quick therapy adjustments</p>
        
        <div className="space-y-4">
          {peerInterventions.map((item, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-white">{item.type}</h4>
                <p className="text-[11px] text-white/50">{item.desc}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[#6A994E] font-extrabold text-sm block">{item.gain}</span>
                <span className="text-[10px] text-white/60 font-semibold">{item.successRate}% Success Rate</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate(`/patient/${patientId}/help`)}
            className="bg-white text-[#0A1128] px-6 py-3 rounded-2xl font-bold text-sm hover:scale-105 transition-all shadow-md flex items-center gap-2"
          >
            Get Help With My Mask <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
