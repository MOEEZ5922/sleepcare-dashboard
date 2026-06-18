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
  Loader2,
  Settings2
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useApi } from '../hooks/useApi';
import {
  fetchPatientSummary,
  fetchWeeklyAnalysis,
  fetchCpapTrends,
  fetchInterventions,
  createIntervention,
  createAuthorization,
  submitClinicianOverride,
  PatientSummary,
  WeeklyAnalysis,
  CpapTrends
} from '../data/api';
import ClinicalOrderModal from './ClinicalOrderModal';
import AuthorizationModal from './AuthorizationModal';
import RecommendationBanner from './RecommendationBanner';

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
    dependencies: [id],
    cacheKey: `patient-summary-${id}`
  });

  const { data: ai, isLoading: isAiLoading, error: aiError } = useApi<WeeklyAnalysis>(() => fetchWeeklyAnalysis(id), {
    dependencies: [id],
    cacheKey: `weekly-analysis-${id}`
  });

  const { data: trends, isLoading: isTrendsLoading } = useApi<CpapTrends>(() => fetchCpapTrends(id, 7), {
    dependencies: [id],
    cacheKey: `cpap-trends-7-${id}`
  });

  const { data: interventionsData, isLoading: isIntLoading, refetch: refetchInt } = useApi<any[]>(() => fetchInterventions(id), {
    dependencies: [id],
    cacheKey: `interventions-${id}`
  });

  const isLive = !!(summary && (summary as any).__isLive);

  const [showLogConfirmation, setShowLogConfirmation] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [activePathway, setActivePathway] = useState<'app_iah' | 'alt_therapy'>('app_iah');
  const [selectedTherapy, setSelectedTherapy] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [escalationSource, setEscalationSource] = useState<'ai' | 'technician'>('ai');
  const [appIahNotes, setAppIahNotes] = useState('');

  const [gateStatus, setGateStatus] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [showRejectMenu, setShowRejectMenu] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const [highlightActionCenter, setHighlightActionCenter] = useState(false);
  const [techActionHint, setTechActionHint] = useState('');

  const [signatureId, setSignatureId] = useState('');
  const [signatureDate, setSignatureDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOverride = async (status: 'accepted' | 'rejected', reason?: string) => {
    try {
      await submitClinicianOverride(id, {
        status,
        reject_reason: reason,
        notes: status === 'accepted' ? 'Accepted recommendation via dashboard' : 'Rejected recommendation via dashboard'
      });
      toast.success(`Recommendation ${status === 'accepted' ? 'Approved' : 'Rejected'}!`);
    } catch (err) {
      console.error('Failed to log clinician override', err);
    }
  };

  const handleAcceptRecommendation = async () => {
    setGateStatus('accepted');
    await handleOverride('accepted');
    
    // Connected workflow logic
    if (role === 'physician') {
      const isPathwayAdj = nextAction.type?.toLowerCase().includes('physician') || 
                           nextAction.type?.toLowerCase().includes('pathway') || 
                           nextAction.type?.toLowerCase().includes('escalation');
      if (isPathwayAdj) {
        setActivePathway('alt_therapy');
        setSelectedTherapy('MAD'); 
        setClinicalNotes(`Clinically authorized transition to MAD therapy as recommended by AI.\n\nRationale: ${nextAction.rationale}`);
      } else {
        setActivePathway('app_iah');
        setAppIahNotes(`Authorized digital clinical order.\n\nRationale: ${nextAction.rationale}`);
      }
    } else if (role === 'technician') {
      const actionLower = nextAction.type?.toLowerCase() || '';
      if (actionLower.includes('call') || actionLower.includes('phone') || actionLower.includes('contact')) {
        setTechActionHint('Initiate Call');
      } else if (actionLower.includes('dispatch') || actionLower.includes('asset') || actionLower.includes('equipment') || actionLower.includes('mask')) {
        setTechActionHint('Dispatch Asset');
      } else {
        setTechActionHint('Schedule Visit');
      }
    }

    // Trigger visual feedback (pulse and scroll)
    setHighlightActionCenter(true);
    setTimeout(() => {
      const actionElement = document.getElementById('action-center-card');
      if (actionElement) {
        actionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    
    setTimeout(() => setHighlightActionCenter(false), 5000); // Glow for 5 seconds
  };

  const handleRejectRecommendation = async (reason: string) => {
    setGateStatus('rejected');
    await handleOverride('rejected', reason);
  };

  const handleAuthorize = async () => {
    setIsSubmitting(true);
    const sigId = "LINDE-AUTH-" + Math.random().toString(36).substring(7).toUpperCase();
    const sigDate = new Date().toLocaleString();
    
    setSignatureId(sigId);
    setSignatureDate(sigDate);

    try {
      await createAuthorization(id, {
        type: selectedTherapy,
        status: 'Approved',
        physician_id: 'PHY102',
        digital_seal_hash: sigId
      });

      // Also log it as a successful clinical intervention
      await createIntervention(id, {
        type: `Authorization: ${selectedTherapy}`,
        job_code: 'AUTH-TRANS',
        actor: { role: 'physician', id: 'PHY102' },
        outcome: 'Success',
        notes: clinicalNotes,
        signature_hash: sigId
      });

      toast.success(`Transition to ${selectedTherapy} Authorized!`);
      refetchInt();
      setShowLogConfirmation(true);
    } catch (err) {
      toast.error('Failed to authorize transition.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOrderSubmit = async () => {
    setIsSubmitting(true);
    const sigId = "LINDE-AUTH-" + Math.random().toString(36).substring(7).toUpperCase();
    const sigDate = new Date().toLocaleString();
    
    setSignatureId(sigId);
    setSignatureDate(sigDate);

    try {
      await createIntervention(id, {
        type: 'Clinical Order',
        job_code: 'CLIN-ORD',
        actor: { role: 'physician', id: 'PHY102' },
        outcome: 'Success',
        notes: appIahNotes,
        signature_hash: sigId
      });

      toast.success(`Clinical Order Logged successfully.`);
      refetchInt();
      setShowOrderModal(false);
      setSelectedTherapy('Clinical Order');
      setShowLogConfirmation(true);
    } catch (err) {
      toast.error('Failed to log clinical order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTechAction = async (actionType: string, jobCode: string, notes: string) => {
    setIsSubmitting(true);
    try {
      await createIntervention(id, {
        type: actionType,
        job_code: jobCode,
        actor: { role: 'technician', id: 'TECH-001' },
        outcome: 'Success',
        notes
      });
      toast.success(`${actionType} logged successfully!`);
      refetchInt();
    } catch (err) {
      toast.error(`Failed to log ${actionType.toLowerCase()}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if ((isSumLoading || isAiLoading) && (!summary || !ai)) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-teal animate-spin" />
      </div>
    );
  }

  // Ultra-resilient data mapping
  const nextAction = ai?.nextBestAction || { type: 'Monitoring', rationale: 'No active clinical exception.', deliveryMode: 'Digital Workflow', reassessmentWindow: 'Immediate' };
  const currentAHI = trends?.currentAHI || summary?.currentAHI || 0;
  const usage = trends?.averageHours || summary?.averageHours || 0;
  const leak = trends?.percentileLeak || summary?.percentileLeak || 0;
  const interventionsList = Array.isArray(interventionsData) ? interventionsData : (summary?.interventions || []);


  return (
    <div className={`space-y-6 ${isCompact ? 'p-0' : 'p-8 max-w-6xl mx-auto'} animate-in fade-in duration-500`}>

      {!hideHeader && (
        <RecommendationBanner
          isCompact={isCompact}
          isLive={isLive}
          role={role}
          patientId={id}
          ai={ai}
          nextAction={nextAction}
          gateStatus={gateStatus}
          setGateStatus={setGateStatus}
          showRejectMenu={showRejectMenu}
          setShowRejectMenu={setShowRejectMenu}
          rejectReason={rejectReason}
          setRejectReason={setRejectReason}
          onAccept={handleAcceptRecommendation}
          onReject={handleRejectRecommendation}
          onUndo={() => { 
            setGateStatus('pending'); 
            setShowRejectMenu(false); 
            setRejectReason(''); 
            setTechActionHint('');
            // Clear pre-populated content if they click Undo
            if (clinicalNotes.startsWith('Clinically authorized transition')) {
              setClinicalNotes('');
              setSelectedTherapy('');
            }
            if (appIahNotes.startsWith('Authorized digital clinical order')) {
              setAppIahNotes('');
            }
          }}
        />
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
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.type?.includes('Educational') ? 'bg-[#2D9596]/10 text-[#2D9596]' :
                      item.outcome === 'Success' ? 'bg-[#6A994E]/10 text-[#6A994E]' :
                        item.outcome === 'Pending' ? 'bg-[#F4A261]/10 text-[#F4A261]' :
                          'bg-[#E76F51]/10 text-[#E76F51]'
                    }`}>
                    {item.type?.includes('Educational') ? <Video className="w-4 h-4" /> :
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
            <div 
              id="action-center-card"
              className={`bg-white rounded-2xl border-2 transition-all duration-500 ${
                highlightActionCenter 
                  ? 'border-[#6A994E] shadow-[0_0_25px_rgba(106,153,78,0.45)] scale-[1.02] ring-4 ring-[#6A994E]/10' 
                  : role === 'physician' 
                    ? 'border-[#2D9596] shadow-lg' 
                    : 'border-[#F4A261] shadow-lg'
              } p-6`}
            >
              {highlightActionCenter && (
                <div className="mb-4 p-3.5 bg-[#6A994E]/10 border border-[#6A994E]/20 rounded-xl animate-in slide-in-from-top duration-300 text-[11px] font-bold text-[#6A994E] flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6A994E] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6A994E]"></span>
                  </span>
                  <Zap className="w-3.5 h-3.5 animate-pulse text-[#6A994E]" />
                  AI Recommendation Pre-Loaded & Drafted!
                </div>
              )}

              <h3 className="text-base font-bold text-[#0A1128] mb-6 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity className={role === 'physician' ? 'text-[#2D9596]' : 'text-[#F4A261]'} />
                  {role === 'physician' ? 'Clinical Action' : 'Technical Action'}
                </span>
                {gateStatus === 'accepted' && (
                  <span className="text-[9px] font-bold text-[#6A994E] bg-[#6A994E]/10 border border-[#6A994E]/30 px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                    AI Auto-Draft
                  </span>
                )}
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
                        disabled={!selectedTherapy || !clinicalNotes || isSubmitting}
                        className="w-full bg-[#2D9596] text-white font-bold py-4 rounded-xl shadow-lg text-sm flex items-center justify-center gap-2 disabled:opacity-40"
                      >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        Authorize Transition
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <button 
                    onClick={() => handleTechAction('Remote Call', 'EX-TEL', 'Remote call initiated via cockpit.')}
                    disabled={isSubmitting}
                    className={`w-full text-white font-bold py-4 rounded-xl shadow-lg text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                    techActionHint === 'Initiate Call' 
                      ? 'bg-[#6A994E] shadow-[#6A994E]/20 ring-4 ring-[#6A994E]/30 scale-[1.02]' 
                      : 'bg-[#F4A261] hover:bg-[#e08e4a] disabled:opacity-50'
                  }`}>
                    {isSubmitting && techActionHint === 'Initiate Call' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />} 
                    Initiate Call {techActionHint === 'Initiate Call' && '✨'}
                  </button>
                  <button 
                    onClick={() => handleTechAction('Delivery', 'EX-DISP', 'Asset delivery dispatched via cockpit.')}
                    disabled={isSubmitting}
                    className={`w-full text-white font-bold py-4 rounded-xl shadow-lg text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                    techActionHint === 'Dispatch Asset' 
                      ? 'bg-[#6A994E] shadow-[#6A994E]/20 ring-4 ring-[#6A994E]/30 scale-[1.02]' 
                      : 'bg-[#0A1128] hover:bg-black disabled:opacity-50'
                  }`}>
                    {isSubmitting && techActionHint === 'Dispatch Asset' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />} 
                    Dispatch Asset {techActionHint === 'Dispatch Asset' && '✨'}
                  </button>
                  <button 
                    onClick={() => handleTechAction('Visit', 'O7', 'Home visit scheduled via cockpit.')}
                    disabled={isSubmitting}
                    className={`w-full font-bold py-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                    techActionHint === 'Schedule Visit' 
                      ? 'bg-[#6A994E] text-white shadow-[#6A994E]/20 ring-4 ring-[#6A994E]/30 scale-[1.02]' 
                      : 'bg-white border-2 border-[#E8EEF2] text-[#0A1128] hover:bg-[#FAFAFA] disabled:opacity-50'
                  }`}>
                    {isSubmitting && techActionHint === 'Schedule Visit' ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Calendar className="w-4 h-4 text-[#F4A261]" />} 
                    Schedule Visit {techActionHint === 'Schedule Visit' && '✨'}
                  </button>
                  <button 
                    onClick={() => handleTechAction('Physician Escalation', 'SL-REF', 'Escalated patient to physician for clinical pathway review.')}
                    disabled={isSubmitting}
                    className="w-full bg-white border-2 border-[#E8EEF2] text-[#0A1128] font-bold py-4 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-[#E8EEF2] transition-colors mt-4 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-[#0A1128]" /> : <Stethoscope className="w-4 h-4" />} 
                    Escalate to Physician
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

      <ClinicalOrderModal
        isOpen={showOrderModal}
        notes={appIahNotes}
        setNotes={setAppIahNotes}
        onClose={() => setShowOrderModal(false)}
        onSubmit={handleOrderSubmit}
        isSubmitting={isSubmitting}
      />

      <AuthorizationModal
        isOpen={showLogConfirmation}
        selectedTherapy={selectedTherapy}
        signatureId={signatureId}
        signatureDate={signatureDate}
        onClose={() => {
          setShowLogConfirmation(false);
          setSelectedTherapy('');
          setClinicalNotes('');
          setSignatureId('');
          setSignatureDate('');
        }}
      />
    </div>
  );
}
