import { Link, useParams } from 'react-router';
import {
  AlertTriangle,
  CheckCircle,
  Activity,
  Calendar,
  ArrowRight,
  TrendingUp,
  Brain,
  ShieldCheck,
  ClipboardList,
  Phone,
  Truck,
  Stethoscope,
  XCircle,
  FileText,
  History,
  FileSignature,
  Plus,
  Send,
  Zap,
  Video,
  Signal,
  Loader2
} from 'lucide-react';
import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { 
  fetchPatientSummary, 
  fetchWeeklyAnalysis, 
  fetchCpapTrends, 
  fetchInterventions,
  PatientSummary,
  WeeklyAnalysis,
  CpapTrends
} from '../data/api';

interface SummaryContentProps {
  patientId?: string;
  isCompact?: boolean;
  role?: 'physician' | 'technician';
  hideHeader?: boolean;
  showActions?: boolean;
}

export default function SummaryContent({
  patientId: propPatientId,
  isCompact = false,
  role = 'physician',
  hideHeader = false,
  showActions = true
}: SummaryContentProps) {
  const { id: urlId } = useParams();
  const id = propPatientId || urlId || '1';

  const { data: summary, isLoading: isSumLoading, error: sumError } = useApi<PatientSummary>(() => fetchPatientSummary(id), {
    dependencies: [id]
  });

  const { data: ai, isLoading: isAiLoading, error: aiError } = useApi<WeeklyAnalysis>(() => fetchWeeklyAnalysis(id), {
    dependencies: [id]
  });

  const { data: trends, isLoading: isTrendsLoading } = useApi<CpapTrends>(() => fetchCpapTrends(id, 7), {
    dependencies: [id]
  });

  const { data: interventionsData, isLoading: isIntLoading, refetch: refetchInt } = useApi<any[]>(() => fetchInterventions(id), {
    dependencies: [id]
  });

  const isLive = !sumError && !!summary;

  const [showLogConfirmation, setShowLogConfirmation] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [activePathway, setActivePathway] = useState<'app_iah' | 'alt_therapy'>('app_iah');
  const [selectedTherapy, setSelectedTherapy] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [escalationSource, setEscalationSource] = useState<'ai' | 'technician'>('ai');
  const [appIahNotes, setAppIahNotes] = useState('');

  const handleAuthorize = () => {
    setShowLogConfirmation(true);
  };

  const handleOrderSubmit = () => {
    setShowOrderModal(false);
    alert(`Clinical Order Logged: ${appIahNotes}`);
  };

  if ((isSumLoading || isAiLoading) && (!summary || !ai)) {
     return (
       <div className="flex items-center justify-center h-96">
         <Loader2 className="w-8 h-8 text-[#E76F51] animate-spin" />
       </div>
     );
  }

  // Ultra-resilient data mapping
  const nextAction = ai?.nextBestAction || { type: 'Monitoring', rationale: 'No active clinical exception.' };
  const currentAHI = trends?.currentAHI || summary?.currentAHI || 0;
  const usage = trends?.averageHours || summary?.averageHours || 0;
  const leak = trends?.percentileLeak || summary?.percentileLeak || 0;
  const interventionsList = Array.isArray(interventionsData) ? interventionsData : (summary?.interventions || []);


  return (
    <div className={`space-y-6 ${isCompact ? 'p-0' : 'p-8 max-w-6xl mx-auto'} animate-in fade-in duration-500`}>

      {/* 1. Universal Evidence Workspace: AI Core */}
      {!hideHeader && (
        <div className="bg-[#0A1128] text-white rounded-2xl p-6 shadow-xl border-l-8 border-[#E76F51]">
          <div className="flex justify-between items-start">
            <div className="flex gap-4">
              <div className="bg-[#E76F51]/20 p-2 rounded-xl h-fit">
                <AlertTriangle className="w-8 h-8 text-[#E76F51]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">Clinical Exception: {nextAction.type}</h2>
                  {isLive && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#6A994E]/20 border border-[#6A994E]/30 rounded text-[9px] font-bold uppercase tracking-widest text-[#6A994E]">
                      <Signal className="w-2.5 h-2.5" /> Live
                    </div>
                  )}
                </div>
                <p className="text-white/70 text-sm max-w-2xl leading-relaxed">
                  {nextAction.rationale}
                </p>
              </div>
            </div>
            {!isCompact && (
              <div className="text-right whitespace-nowrap">
                <div className="bg-white/10 px-3 py-1 rounded-lg text-xs font-semibold mb-2">
                  ESCALATED {ai?.weekOf || 'ACTIVE'}
                </div>
                <div className="text-2xl font-bold text-[#E76F51]">Risk: {ai?.compositeRiskScore || 0}</div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={`grid ${isCompact ? 'grid-cols-1' : 'lg:grid-cols-3'} gap-6`}>
        {/* Shared Physiological Evidence */}
        <div className={`${isCompact ? 'space-y-4' : 'lg:col-span-2 space-y-6'}`}>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-[#E8EEF2] shadow-sm">
              <p className="text-[10px] text-[#5A6B7C] uppercase font-bold tracking-widest mb-1">Avg Usage</p>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold text-[#0A1128]">{usage}</span>
                <span className="text-[10px] text-[#5A6B7C] pb-1">hrs/night</span>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[#E8EEF2] shadow-sm">
              <p className="text-[10px] text-[#5A6B7C] uppercase font-bold tracking-widest mb-1">Residual AHI</p>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold text-[#E76F51]">{currentAHI}</span>
                <span className="text-[10px] text-[#5A6B7C] pb-1">ev/hr</span>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-[#E8EEF2] shadow-sm">
              <p className="text-[10px] text-[#5A6B7C] uppercase font-bold tracking-widest mb-1">Leak (95%)</p>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold text-[#0A1128]">{leak}</span>
                <span className="text-[10px] text-[#5A6B7C] pb-1">L/min</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-[#E8EEF2] p-5 shadow-sm">
              <h3 className="text-xs font-bold text-[#0A1128] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Brain className="w-3.5 h-3.5 text-[#2D9596]" />
                Behavioral Clustering
              </h3>
              <div className="bg-[#FAFAFA] p-4 rounded-xl border border-[#E8EEF2]">
                <p className="text-[10px] text-[#5A6B7C] font-semibold mb-1">AI Classification</p>
                <p className="text-lg font-bold text-[#F4A261]">{ai?.clusterAssignment?.current || 'Scanning...'}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8EEF2] p-5 shadow-sm">
              <h3 className="text-xs font-bold text-[#0A1128] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Video className="w-3.5 h-3.5 text-[#2D9596]" />
                Educational Adherence
              </h3>
              <div className="bg-[#FAFAFA] p-4 rounded-xl border border-[#E8EEF2] flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-[#5A6B7C] font-semibold mb-1">Video Watchtime</p>
                  <p className="text-lg font-bold text-[#2D9596]">{summary?.adherenceRate || 75}% <span className="text-xs font-normal text-[#5A6B7C]">Watched</span></p>
                </div>
                <div className="w-10 h-10 rounded-full border-4 border-[#E8EEF2] border-t-[#2D9596] flex items-center justify-center transform rotate-45">
                   <div className="w-8 h-8 rounded-full border-4 border-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8EEF2] p-5 shadow-sm">
            <h3 className="text-xs font-bold text-[#0A1128] uppercase tracking-wider mb-4 flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-[#2D9596]" />
              Intervention History
            </h3>
            <div className="space-y-3">
              {interventionsList.slice(0, 3).map((item: any, idx: number) => (
                <div key={idx} className="flex items-start gap-4 p-3 bg-[#FAFAFA] rounded-xl border border-[#E8EEF2] hover:border-[#2D9596]/30 transition-all group">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    item.type.includes('Educational') ? 'bg-[#2D9596]/10 text-[#2D9596]' :
                    item.outcome === 'Success' ? 'bg-[#6A994E]/10 text-[#6A994E]' : 
                    item.outcome === 'Pending' ? 'bg-[#F4A261]/10 text-[#F4A261]' : 
                    'bg-[#E76F51]/10 text-[#E76F51]'
                  }`}>
                    {item.type.includes('Educational') ? <Video className="w-4 h-4" /> :
                     item.outcome === 'Success' ? <CheckCircle className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-[11px] font-bold text-[#0A1128] group-hover:text-[#2D9596] transition-colors">{item.type}</p>
                      <span className="text-[8px] font-mono bg-white px-1.5 py-0.5 rounded border border-[#E8EEF2] text-[#5A6B7C]">{item.job_code || item.code}</span>
                    </div>
                    <p className="text-[9px] text-[#5A6B7C] flex items-center gap-1 mt-0.5">
                      {item.date} • {item.actor?.id || item.tech}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Centers */}
        {showActions && (
          <div>
            <div className={`bg-white rounded-2xl border-2 ${role === 'physician' ? 'border-[#2D9596]' : 'border-[#F4A261]'} p-6 shadow-lg`}>
              <h3 className="text-base font-bold text-[#0A1128] mb-6 flex items-center gap-2">
                <Activity className={role === 'physician' ? 'text-[#2D9596]' : 'text-[#F4A261]'} />
                {role === 'physician' ? 'Clinical Action' : 'Technical Action'}
              </h3>

              {role === 'physician' ? (
                <div className="space-y-6">
                  {/* Pathway Toggle */}
                  <div className="flex bg-[#FAFAFA] p-1 rounded-xl border border-[#E8EEF2]">
                    <button 
                      onClick={() => setActivePathway('app_iah')}
                      className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${activePathway === 'app_iah' ? 'bg-white shadow-sm text-[#0A1128] border border-[#E8EEF2]' : 'text-[#5A6B7C]'}`}
                    >
                      APPEL IAH
                    </button>
                      <button 
                        onClick={() => setActivePathway('alt_therapy')}
                        className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${activePathway === 'alt_therapy' ? 'bg-white shadow-sm text-[#0A1128] border border-[#E8EEF2]' : 'text-[#5A6B7C]'}`}
                      >
                        MAD/HNS PATH
                      </button>
                  </div>

                  {activePathway === 'app_iah' ? (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="p-3 bg-[#2D9596]/5 border border-[#2D9596]/20 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[10px] font-bold text-[#2D9596] uppercase tracking-tighter flex items-center gap-1">
                             <Zap className="w-3 h-3" /> Escalation Source
                           </span>
                           <button onClick={() => setEscalationSource(escalationSource === 'ai' ? 'technician' : 'ai')} className="text-[10px] text-[#5A6B7C] hover:underline">Switch</button>
                        </div>
                        <p className="text-[11px] text-[#0A1128] leading-snug">
                          {escalationSource === 'ai' 
                            ? 'AI identified sustained AHI variance exceeding clinical thresholds.' 
                            : 'Technician flagged case for clinical pathway adjustment via O5 protocol.'}
                        </p>
                      </div>
                      <button 
                        onClick={() => setShowOrderModal(true)}
                        className="w-full bg-[#0A1128] text-white font-bold py-4 rounded-xl shadow-lg text-sm flex items-center justify-center gap-2 hover:bg-black transition-all"
                      >
                        <FileSignature className="w-4 h-4 text-[#F4A261]" /> Issue Clinical Order
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="grid grid-cols-2 gap-2">
                        {['MAD', 'HNS'].map(t => (
                          <button 
                            key={t}
                            onClick={() => setSelectedTherapy(t)}
                            title={t === 'MAD' ? 'Oral appliance used to manage airway collapse' : "Surgically implanted device placed under the skin on the patient's chest"}
                            className={`py-3 rounded-lg border-2 text-[10px] font-bold transition-all ${selectedTherapy === t ? 'border-[#2D9596] bg-[#2D9596]/5 text-[#2D9596]' : 'border-[#E8EEF2] text-[#5A6B7C]'}`}
                          >
                            {t === 'MAD' ? 'Oral Appliance (MAD)' : 'Chest Implant (HNS)'}
                          </button>
                        ))}
                      </div>
                      <textarea 
                        value={clinicalNotes}
                        onChange={(e) => setClinicalNotes(e.target.value)}
                        placeholder="Rationale..."
                        className="w-full h-20 bg-[#FAFAFA] border border-[#E8EEF2] rounded-xl p-3 text-[11px] focus:ring-1 focus:ring-[#2D9596] outline-none"
                      />
                      <button 
                        onClick={handleAuthorize}
                        disabled={!selectedTherapy || !clinicalNotes}
                        className="w-full bg-[#2D9596] text-white font-bold py-4 rounded-xl shadow-lg text-sm flex items-center justify-center gap-2 disabled:opacity-40"
                      >
                        Authorize Transition
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <button className="w-full bg-[#F4A261] text-white font-bold py-4 rounded-xl shadow-lg text-sm flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" /> Initiate Call
                  </button>
                  <button className="w-full bg-[#0A1128] text-white font-bold py-4 rounded-xl shadow-lg text-sm flex items-center justify-center gap-2">
                    <Truck className="w-4 h-4" /> Dispatch Asset
                  </button>
                  <button className="w-full bg-white border-2 border-[#E8EEF2] text-[#0A1128] font-bold py-4 rounded-xl text-sm flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4 text-[#F4A261]" /> Schedule Visit
                  </button>
                  <button className="w-full bg-white border-2 border-[#E76F51]/30 text-[#E76F51] font-bold py-4 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-[#E76F51]/5 transition-all mt-4">
                    <Stethoscope className="w-4 h-4" /> Escalate to Physician
                  </button>
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-[#E8EEF2] space-y-2">
                <Link to={`/${role}/patient/${id || '1'}/trends`} className="flex items-center justify-between bg-[#FAFAFA] p-3 rounded-xl hover:border-[#E8EEF2] transition-all">
                  <span className="text-xs font-bold text-[#0A1128]">Detailed Trends</span>
                  <ArrowRight className="w-4 h-4 text-[#E8EEF2]" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {showOrderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A1128]/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-[#0A1128] mb-2">Issue Clinical Order</h3>
            <p className="text-xs text-[#5A6B7C] mb-6">Log the next clinical step in the patient's record.</p>
            <textarea 
              value={appIahNotes}
              onChange={(e) => setAppIahNotes(e.target.value)}
              placeholder="Order details..."
              className="w-full h-32 bg-[#FAFAFA] border border-[#E8EEF2] rounded-xl p-4 text-sm focus:ring-2 focus:ring-[#2D9596] outline-none mb-6"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowOrderModal(false)} className="flex-1 py-4 bg-[#E8EEF2] text-[#5A6B7C] font-bold rounded-xl text-xs">Cancel</button>
              <button onClick={() => {
                setShowOrderModal(false);
                setSelectedTherapy('Clinical Order');
                setShowLogConfirmation(true);
              }} disabled={!appIahNotes} className="flex-2 py-4 bg-[#2D9596] text-white font-bold rounded-xl text-xs shadow-lg shadow-[#2D9596]/20">Sign & Log Order</button>
            </div>
          </div>
        </div>
      )}

      {showLogConfirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A1128]/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-10 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 border-t-8 border-[#2D9596]">
            <div className="w-16 h-16 bg-[#2D9596]/10 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8 text-[#2D9596]" />
            </div>
            <h3 className="text-2xl font-bold text-[#0A1128] mb-2">Transition Authorized</h3>
            <p className="text-sm text-[#5A6B7C] mb-8 leading-relaxed">
              Therapy transition to <strong>{selectedTherapy}</strong> has been clinically authorized and synced to the care team.
            </p>

            {/* Digital Signature Block */}
            <div className="bg-[#FAFAFA] border-2 border-dashed border-[#E8EEF2] rounded-2xl p-5 mb-8 relative overflow-hidden group">
               <div className="absolute top-[-10px] right-[-10px] opacity-10 group-hover:rotate-12 transition-transform">
                  <ShieldCheck className="w-20 h-20 text-[#2D9596]" />
               </div>
               <p className="text-[9px] font-black text-[#2D9596] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" /> Digital Clinical Seal
               </p>
               <div className="space-y-1">
                  <p className="text-sm font-serif italic text-[#0A1128] border-b border-[#E8EEF2] pb-1">Dr. Sarah Mitchell, MD</p>
                  <p className="text-[8px] text-[#5A6B7C] font-mono">ID: LINDE-AUTH-{Math.random().toString(36).substring(7).toUpperCase()}</p>
                  <p className="text-[8px] text-[#5A6B7C] font-mono">DATE: {new Date().toLocaleString()}</p>
               </div>
            </div>

            <button 
              onClick={() => {
                setShowLogConfirmation(false);
                setSelectedTherapy('');
                setClinicalNotes('');
              }}
              className="w-full bg-[#0A1128] text-white py-5 rounded-2xl font-bold shadow-lg hover:shadow-[#0A1128]/20 transition-all active:scale-95"
            >
              Return to Cockpit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
