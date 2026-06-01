import { useState } from 'react';
import { Link } from 'react-router';
import SummaryContent from './SummaryContent';
import {
  Package,
  Trash2,
  ClipboardCheck,
  MapPin,
  Phone,
  Calendar,
  Wrench,
  Activity,
  History,
  ShieldAlert,
  BarChart3,
  Search,
  CheckCircle,
  FileText,
  Clock,
  ExternalLink,
  PlusCircle,
  MessageSquare,
  AlertTriangle,
  Stethoscope,
  Send
} from 'lucide-react';

interface VisitPrepCardProps {
  patient: any;
}

export default function VisitPrepCard({ patient }: VisitPrepCardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'prep' | 'monitoring' | 'history'>('prep');
  const [isLoggingDispatch, setIsLoggingDispatch] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [newLog, setNewLog] = useState({ symptom: '', note: '' });
  const [escalationNote, setEscalationNote] = useState('');
  const [gateStatus, setGateStatus] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [showRejectMenu, setShowRejectMenu] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  if (!patient) return null;

  // Safe data access for biomarkers
  const biomarkers = patient.biomarkers || null;

  const handleAddLog = () => {
    setShowLogForm(false);
    setNewLog({ symptom: '', note: '' });
  };

  const handleEscalate = () => {
    setShowEscalationModal(false);
    setEscalationNote('');
  };

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in slide-in-from-right-4 duration-500">

      {/* Tactical Floating Header */}
      <div className="p-8 border-b border-[#E8EEF2] bg-white sticky top-0 z-10">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${patient.dropoutRisk > 70 ? 'bg-[#E76F51] text-white' : 'bg-[#6A994E] text-white'
                }`}>
                Dropout Risk: {patient.dropoutRisk}%
              </span>
              <span className="text-[10px] font-bold text-[#2D9596] uppercase tracking-widest">{patient.phase || 'Titration Phase'}</span>
            </div>
            <h2 className="text-5xl font-serif text-[#0A1128] tracking-tight">{patient.patientName}</h2>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#5A6B7C] uppercase tracking-widest">
              Linked Asset
            </div>
            <div className="bg-[#0A1128] text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-mono">
              <Wrench className="w-3 h-3 opacity-50" />
              {patient.assetTracking?.serial || 'LND-7742-XP'}
            </div>
            <Link
              to={`/technician/patient/${patient.id}`}
              className="mt-2 flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#E8EEF2] rounded-xl text-xs font-bold text-[#0A1128] hover:bg-[#FAFAFA] transition-all shadow-sm group"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#2D9596] group-hover:scale-110 transition-transform" />
              Full Clinical View
            </Link>
          </div>
        </div>

        {/* Action Recommendation Prominent Header */}
        <div className="mt-8 bg-[#0A1128] text-white rounded-xl p-6 border-l-8 border-[#F4A261] shadow-xl relative overflow-hidden">
          {gateStatus === 'accepted' && <div className="absolute inset-0 bg-[#6A994E]/10 pointer-events-none" />}
          {gateStatus === 'rejected' && <div className="absolute inset-0 bg-[#E76F51]/10 pointer-events-none" />}
          
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-[#F4A261]" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#F4A261]">Action Recommendation</h3>
              </div>
              <p className="text-xl font-bold">⚠️ Severe Leakage Trend Detected (O2/O4/O7)</p>
              <p className="text-white/70 text-sm mt-1 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#2D9596]" /> Action: Deploy Remote Shipping or Schedule Home Visit.
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            {gateStatus === 'pending' ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col xl:flex-row xl:items-center gap-4">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#F4A261] whitespace-nowrap">Technical Gate</h4>
                  <div className="flex gap-3 w-full">
                    <button 
                      onClick={() => setGateStatus('accepted')}
                      className="flex-1 bg-[#6A994E] hover:bg-[#56803d] text-white py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg"
                    >
                      <CheckCircle className="w-4 h-4" /> Accept & Dispatch
                    </button>
                    <button 
                      onClick={() => alert("Opening modify action dialog...")}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Wrench className="w-4 h-4" /> Modify
                    </button>
                    <button 
                      onClick={() => setShowRejectMenu(!showRejectMenu)}
                      className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 border ${showRejectMenu ? 'bg-[#E76F51]/20 border-[#E76F51]/50 text-[#E76F51]' : 'bg-transparent border-[#E76F51]/30 text-[#E76F51] hover:bg-[#E76F51]/10'}`}
                    >
                      <Trash2 className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>

                {showRejectMenu && (
                  <div className="p-4 bg-black/30 rounded-xl border border-[#E76F51]/30 animate-in fade-in slide-in-from-top-2">
                    <label className="text-[10px] font-bold text-[#E76F51] uppercase tracking-widest mb-2 block">Required: Reject Reason Code</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <select 
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="flex-1 bg-[#1a233a] border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-[#E76F51] outline-none transition-colors"
                      >
                        <option value="">Select reason...</option>
                        <option value="PT_UNREACHABLE">Patient Unreachable</option>
                        <option value="PT_REFUSED">Patient Refused Service</option>
                        <option value="ALREADY_RESOLVED">Issue Already Resolved</option>
                        <option value="EQUIPMENT_UNAVAILABLE">Equipment Out of Stock</option>
                        <option value="OTHER">Other (Add Note)</option>
                      </select>
                      <button 
                        onClick={() => setGateStatus('rejected')}
                        disabled={!rejectReason}
                        className="bg-[#E76F51] hover:bg-[#d45e41] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shrink-0"
                      >
                        Confirm Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${gateStatus === 'accepted' ? 'bg-[#6A994E]/20 text-[#6A994E]' : 'bg-[#E76F51]/20 text-[#E76F51]'}`}>
                    {gateStatus === 'accepted' ? <CheckCircle className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className={`text-sm font-bold ${gateStatus === 'accepted' ? 'text-[#6A994E]' : 'text-[#E76F51]'}`}>
                      {gateStatus === 'accepted' ? 'Action Accepted & Dispatched' : 'Action Rejected'}
                    </p>
                    <p className="text-xs text-white/50">
                      {gateStatus === 'accepted' ? 'Logistics team notified.' : `Recommendation rejected with code: ${rejectReason || 'Unknown'}`}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => { setGateStatus('pending'); setShowRejectMenu(false); setRejectReason(''); }}
                  className="text-[10px] uppercase tracking-widest font-bold text-white/50 hover:text-white transition-colors border border-white/10 px-3 py-1.5 rounded-lg"
                >
                  Reset Gate
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tactical Sub-Tab Switcher */}
        <div className="flex gap-6 mt-8 border-b border-[#E8EEF2]">
          {['prep', 'monitoring', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab as any)}
              className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeSubTab === tab ? 'border-[#0A1128] text-[#0A1128]' : 'border-transparent text-[#5A6B7C] hover:text-[#0A1128]'
                }`}
            >
              {tab === 'prep' ? 'Visit Prep' : tab === 'monitoring' ? 'Monitoring Logs' : 'Technical History'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">

        {activeSubTab === 'prep' && (
          <>
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Survey Recovery Workflow (Active only for High Risk) */}
              {patient.dropoutRisk > 90 && (
                <div className="bg-[#9b59b6]/5 border-2 border-[#9b59b6]/30 rounded-3xl p-6 mb-8 relative overflow-hidden group">
                  <div className="absolute top-[-20px] right-[-20px] opacity-5 group-hover:scale-110 transition-transform">
                    <Send className="w-32 h-32 text-[#9b59b6]" />
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#9b59b6] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#9b59b6]/20">
                      <Send className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[#0A1128]">Critical: Survey Delinquency</h3>
                      <p className="text-sm text-[#5A6B7C] mb-4">
                        Automated reminders failed. Manual recovery required per clinical protocol.
                      </p>
                      <div className="flex gap-3">
                        <button onClick={() => alert('Initiating recovery call...')} className="flex-1 bg-[#9b59b6] text-white py-3 rounded-xl font-bold text-xs shadow-md hover:bg-[#8e44ad] transition-all flex items-center justify-center gap-2">
                           <Phone className="w-3.5 h-3.5" /> Resolve via Call
                        </button>
                        <button onClick={() => alert('New link sent via SMS')} className="flex-1 bg-white border-2 border-[#9b59b6] text-[#9b59b6] py-3 rounded-xl font-bold text-xs hover:bg-[#9b59b6]/5 transition-all">
                           Resend SMS Link
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                {/* Physical Logistics Module */}
                <div className="bg-white rounded-2xl border border-[#E8EEF2] p-6 shadow-sm">
                  <h3 className="text-xs font-bold text-[#5A6B7C] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Package className="w-3.5 h-3.5" /> Hardware Management
                  </h3>
                  {isLoggingDispatch ? (
                    <div className="space-y-4 animate-in zoom-in-95 duration-200">
                      <label className="block">
                        <span className="text-[10px] font-bold text-[#5A6B7C] uppercase">New Serial Number</span>
                        <input type="text" className="mt-1 w-full bg-[#FAFAFA] border border-[#E8EEF2] rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-[#0A1128]" placeholder="LND-XXXX-XX" />
                      </label>
                      <div className="flex gap-2">
                        <button onClick={() => setIsLoggingDispatch(false)} className="flex-1 py-2 text-xs font-bold bg-[#E8EEF2] rounded-lg">Cancel</button>
                        <button onClick={() => setIsLoggingDispatch(false)} className="flex-1 py-2 text-xs font-bold bg-[#6A994E] text-white rounded-lg">Commit Dispatch</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2.5 bg-[#FAFAFA] rounded-xl border border-[#E8EEF2]">
                        <span className="text-[11px] text-[#5A6B7C] uppercase font-bold">Mask Type</span>
                        <span className="text-xs font-bold text-[#0A1128]">{patient.maskType}</span>
                      </div>
                      <button onClick={() => setIsLoggingDispatch(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-[#0A1128] text-white text-xs font-bold rounded-xl hover:bg-black transition-all">
                        <Wrench className="w-3.5 h-3.5" /> New Hardware Dispatch
                      </button>
                    </div>
                  )}
                </div>

                {/* Bag Pack Checklist */}
                {Array.isArray(patient.equipmentNeed) && patient.equipmentNeed.length > 0 && (
                  <div className="bg-[#2D9596]/5 rounded-2xl border border-[#2D9596]/20 p-6">
                    <h3 className="text-xs font-bold text-[#2D9596] uppercase tracking-widest mb-4 flex items-center gap-2">
                      <ClipboardCheck className="w-3.5 h-3.5" /> Equipment to Bring
                    </h3>
                    <div className="space-y-2">
                      {patient.equipmentNeed.map((item: string) => (
                        <div key={item} className="flex items-center gap-3 text-sm text-[#0A1128] font-medium bg-white/60 p-2.5 rounded-lg border border-[#2D9596]/10">
                          <div className="w-4 h-4 border-2 border-[#2D9596] rounded flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-transparent hover:text-[#2D9596]/30" />
                          </div>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Unified Evidence Workspace (Compact Pulse) */}
              <div className="bg-[#fdf2f0] rounded-2xl border border-[#E76F51]/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-bold text-[#E76F51] uppercase tracking-widest flex items-center gap-2">
                    <Stethoscope className="w-3.5 h-3.5" /> High-Fidelity Clinical Pulse
                  </h3>
                  <span className="text-[10px] bg-[#E76F51]/10 text-[#E76F51] px-2 py-0.5 rounded font-bold uppercase">Universal Truth Sync Active</span>
                </div>

                <SummaryContent patientId={patient.id.toString()} isCompact={true} role="technician" hideHeader={true} showActions={true} />
              </div>
            </div>
          </>
        )}

        {activeSubTab === 'monitoring' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-[#2D9596]" />
                <h3 className="text-sm font-bold text-[#0A1128]">Technical Monitoring History</h3>
              </div>
              {!showLogForm && (
                <button
                  onClick={() => setShowLogForm(true)}
                  className="flex items-center gap-2 bg-[#2D9596] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#247d7e] transition-all shadow-md"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Log New Observation
                </button>
              )}
            </div>

            {showLogForm && (
              <div className="bg-[#F8FBFA] border-2 border-[#2D9596]/20 rounded-2xl p-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-[#2D9596] uppercase tracking-widest">Post-Visit / Technical Report</h4>
                  <AlertTriangle className="w-4 h-4 text-[#F4A261]" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#5A6B7C] uppercase mb-2">Primary Observation</label>
                    <select
                      value={newLog.symptom}
                      onChange={(e) => setNewLog({ ...newLog, symptom: e.target.value })}
                      className="w-full bg-white border border-[#E8EEF2] rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-[#2D9596]"
                    >
                      <option value="">Select Symptom...</option>
                      <option value="Skin Irritation">Skin Irritation / Redness</option>
                      <option value="Mask Discomfort">General Mask Discomfort</option>
                      <option value="Machine Noise">Excessive Device Noise</option>
                      <option value="Rainout">Condensation (Rainout)</option>
                      <option value="Compliance Barrier">Behavioral Usage Barrier</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#5A6B7C] uppercase mb-2">Technician Note</label>
                    <textarea
                      value={newLog.note}
                      onChange={(e) => setNewLog({ ...newLog, note: e.target.value })}
                      className="w-full bg-white border border-[#E8EEF2] rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-[#2D9596] h-[45px] resize-none"
                      placeholder="Technical details..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowLogForm(false)} className="flex-1 py-3 text-xs font-bold text-[#5A6B7C] bg-white border border-[#E8EEF2] rounded-xl">Discard</button>
                  <button onClick={handleAddLog} disabled={!newLog.symptom} className="flex-2 py-3 text-xs font-bold text-white bg-[#0A1128] rounded-xl disabled:opacity-50">Commit Observation to Clinical Record</button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {(patient.monitoringSurveys || []).map((survey: any, idx: number) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-[#E8EEF2] hover:border-[#2D9596]/30 transition-all shadow-sm group">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-[10px] font-bold text-[#5A6B7C] uppercase mb-1 tracking-widest">{survey.role}: {survey.author}</p>
                      <p className="text-sm font-bold text-[#0A1128]">{survey.question}</p>
                    </div>
                    <span className="text-[10px] font-mono text-[#5A6B7C] bg-[#FAFAFA] px-2 py-1 rounded border border-[#E8EEF2]">{survey.date}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-[#FAFAFA] p-4 rounded-xl border border-dashed border-[#E8EEF2] group-hover:bg-[#2D9596]/5 group-hover:border-[#2D9596]/30 transition-colors">
                    <MessageSquare className="w-4 h-4 text-[#2D9596]" />
                    <span className="text-sm font-medium text-[#2D9596]">Technician Insight: {survey.answer}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'history' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-[#0A1128]">Intervention Viability History</h3>
              <span className="text-xs text-[#5A6B7C]">Total attempts: {(patient.interventionHistory || []).length}</span>
            </div>

            <div className="space-y-4 relative before:absolute before:left-[11px] before:top-4 before:bottom-4 before:w-0.5 before:bg-[#E8EEF2]">
              {(patient.interventionHistory || []).map((history: any, idx: number) => (
                <div key={idx} className="relative pl-8">
                  <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center z-10 ${history.result.includes('Success') ? 'border-[#6A994E]' : 'border-[#E76F51]'
                    }`}>
                    <div className={`w-2 h-2 rounded-full ${history.result.includes('Success') ? 'bg-[#6A994E]' : 'bg-[#E76F51]'}`} />
                  </div>
                  <div className="bg-[#FAFAFA] p-5 rounded-2xl border border-[#E8EEF2] hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#0A1128]">{history.type}</span>
                      <span className="text-[10px] text-[#5A6B7C] font-mono">{history.date}</span>
                    </div>
                    <p className="text-xs text-[#5A6B7C] mb-3">Conducted by: {history.tech}</p>
                    <div className={`text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded inline-block ${history.result.includes('Success') ? 'bg-[#6A994E]/10 text-[#6A994E]' : 'bg-[#E76F51]/10 text-[#E76F51]'
                      }`}>
                      Outcome: {history.result}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
