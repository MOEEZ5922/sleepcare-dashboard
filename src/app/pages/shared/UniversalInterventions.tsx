import { useState } from 'react';
import { useLocation, useParams } from 'react-router';
import { FileSignature, AlertCircle, Activity, Plus, Package, Phone, Home, Settings, Signal, Loader2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { fetchInterventions, createIntervention, fetchAuthorizations, createAuthorization } from '../../data/api';

export default function UniversalInterventions() {
  const { id } = useParams();
  const location = useLocation();
  const isTechnician = location.pathname.includes('/technician');
  
  const { data: liveInterventions, error: intError, refetch: refetchInt } = useApi(() => fetchInterventions(id || '1'), {
    dependencies: [id]
  });

  const { data: liveAuths, error: authError, refetch: refetchAuth } = useApi(() => fetchAuthorizations(id || '1'), {
    dependencies: [id]
  });

  const isLive = (!intError && !!liveInterventions) || (!authError && !!liveAuths);

  const [activePathway, setActivePathway] = useState<'app_iah' | 'alt_therapy'>('app_iah');
  const [selectedTherapy, setSelectedTherapy] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showTechActionModal, setShowTechActionModal] = useState(false);
  const [appIahNotes, setAppIahNotes] = useState('');
  const [escalationSource, setEscalationSource] = useState<'ai' | 'technician'>('ai');
  const [techActionType, setTechActionType] = useState('');
  const [techActionNote, setTechActionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLive) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-[#E76F51] animate-spin" />
      </div>
    );
  }

  const interventions = Array.isArray(liveInterventions) ? liveInterventions : [];

  const handleAppIahSubmit = async () => {
    setIsSubmitting(true);
    try {
      await createIntervention(id || '1', {
        type: 'Clinical Order',
        job_code: 'CLIN-ORD',
        actor: { role: 'physician', id: 'DR-001' },
        outcome: 'Logged',
        notes: appIahNotes
      });
      alert('Clinical Order Submitted!');
      refetchInt();
      setShowOrderModal(false);
    } catch (err) {
      alert('Failed to submit order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTechActionSubmit = async () => {
    setIsSubmitting(true);
    try {
      await createIntervention(id || '1', {
        type: techActionType,
        job_code: 'TECH-ACT',
        actor: { role: 'technician', id: 'TECH-001' },
        outcome: 'Logged',
        notes: techActionNote
      });
      alert('Technician Intervention Logged!');
      refetchInt();
      setShowTechActionModal(false);
    } catch (err) {
      alert('Failed to log intervention.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthorize = async () => {
    setIsSubmitting(true);
    try {
      await createAuthorization(id || '1', {
        type: selectedTherapy,
        status: 'Approved',
        physician_id: 'DR-001',
        digital_seal_hash: 'SHA256-V4-SIG-Linde'
      });
      alert(`Authorization for ${selectedTherapy} submitted successfully!`);
      refetchAuth();
      setSelectedTherapy('');
      setClinicalNotes('');
    } catch (err) {
      alert('Failed to submit authorization.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const allInterventions = [...interventions];
  if (Array.isArray(liveAuths)) {
    liveAuths.forEach((auth: any) => {
      allInterventions.push({
        date: auth.timestamp ? new Date(auth.timestamp).toLocaleDateString() : '—',
        type: `Authorization: ${auth.type}`,
        notes: `Status: ${auth.status}`,
        outcome: auth.status === 'Approved' ? 'Success' : 'Pending',
        actor: { role: 'Physician', id: auth.physician_id || 'DR-001' }
      });
    });
  }
  // Sort by date (descending)
  allInterventions.sort((a, b) => new Date(b.date || b.timestamp).getTime() - new Date(a.date || a.timestamp).getTime());

  return (
    <div className="p-8 max-w-5xl space-y-8 pb-20">
      
      {/* Role-Specific Action Banner */}
      <div className={`p-6 rounded-2xl border-2 flex items-center justify-between ${isTechnician ? 'bg-[#F4A261]/5 border-[#F4A261]/30' : 'bg-[#E76F51]/5 border-[#E76F51]/30'}`}>
         <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isTechnician ? 'bg-[#F4A261] text-white' : 'bg-[#E76F51] text-white'}`}>
               {isTechnician ? <Package /> : <FileSignature />}
            </div>
            <div>
               <div className="flex items-center gap-3">
                 <h2 className="text-xl font-bold text-[#0A1128]">
                    {isTechnician ? 'Field Intervention Cockpit' : 'Clinical Decision Center'}
                 </h2>
                 {isLive && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-[#6A994E]/10 border border-[#6A994E]/20 rounded-md">
                      <Signal className="w-3 h-3 text-[#6A994E]" />
                      <span className="text-[10px] font-bold text-[#6A994E] uppercase tracking-wider">Live</span>
                    </div>
                  )}
               </div>
               <p className="text-sm text-[#5A6B7C]">
                  {isTechnician ? 'Log equipment dispatches and patient touchpoints.' : 'Review field evidence and authorize therapy transitions.'}
               </p>
            </div>
         </div>
         
         {isTechnician && (
            <button 
               onClick={() => setShowTechActionModal(true)}
               className="bg-[#F4A261] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-[#e39350] transition-all flex items-center gap-2"
            >
               <Plus className="w-5 h-5" /> Log New Intervention
            </button>
         )}
      </div>

      <div className="bg-white rounded-xl border border-[#E8EEF2] shadow-sm p-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#5A6B7C]/10 text-[#5A6B7C] px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-[#5A6B7C]/20">
               Unified Evidence Log
            </span>
          </div>
          <h3 className="text-xl text-[#0A1128] mb-2 font-semibold">Intervention Viability History</h3>
          <p className="text-[#5A6B7C] text-sm">
            All clinical and technical activities logged for this patient profile.
          </p>
        </div>

        <div className="space-y-8">
          {/* Viability Log Table */}
          <div>
            <div className="bg-[#FAFAFA] rounded-xl border border-[#E8EEF2] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#E8EEF2] text-[#5A6B7C]">
                  <tr>
                    <th className="text-left py-4 px-6 font-bold uppercase text-[10px] tracking-widest">Date</th>
                    <th className="text-left py-4 px-6 font-bold uppercase text-[10px] tracking-widest">Stakeholder Action</th>
                    <th className="text-left py-4 px-6 font-bold uppercase text-[10px] tracking-widest">Outcome</th>
                    <th className="text-left py-4 px-6 font-bold uppercase text-[10px] tracking-widest">Actor & Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8EEF2]">
                  {allInterventions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-[#5A6B7C]">No history logged for this patient.</td>
                    </tr>
                  ) : (
                    allInterventions.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-white transition-colors">
                        <td className="py-4 px-6 text-[#5A6B7C]">{item.date || (item.timestamp ? new Date(item.timestamp).toLocaleDateString() : '—')}</td>
                        <td className="py-4 px-6">
                           <p className="font-bold text-[#0A1128]">{item.type}</p>
                           <p className="text-[10px] text-[#5A6B7C]">{item.notes || item.job_code}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`flex items-center gap-1.5 font-bold ${item.outcome === 'Success' || item.outcome === 'Approved' ? 'text-[#6A994E]' : 'text-[#F4A261]'}`}>
                            {item.outcome || 'Logged'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                           <span className={`flex items-center gap-2 text-[10px] font-bold border px-2 py-1 rounded-full uppercase tracking-widest ${
                             (item.actor?.role || '').toLowerCase() === 'physician' 
                              ? 'bg-[#2D9596]/10 text-[#2D9596] border-[#2D9596]/20' 
                              : 'bg-[#6A994E]/10 text-[#6A994E] border-[#6A994E]/20'
                           }`}>
                              <Plus className="w-3 h-3"/> {item.actor?.role || 'User'}: {item.actor?.id || 'ID'}
                           </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-[#5A6B7C] mt-4 flex items-center gap-2">
              <ShieldAlert className="w-3 h-3" /> Shared Registry: Every action taken here is visible to both Clinical and Technical teams.
            </p>
          </div>

          <hr className="border-[#E8EEF2]" />

          {!isTechnician && (
            <>
              {/* Pathway Toggle (Physician Only) */}
              <div className="flex bg-[#E8EEF2] p-1.5 rounded-xl">
                <button 
                  onClick={() => setActivePathway('app_iah')}
                  className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activePathway === 'app_iah' ? 'bg-white shadow-md text-[#0A1128]' : 'text-[#5A6B7C] hover:text-[#0A1128]'}`}
                >
                  Complex AHI (APPEL IAH O5)
                </button>
                <button 
                  onClick={() => setActivePathway('alt_therapy')}
                  className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activePathway === 'alt_therapy' ? 'bg-white shadow-md text-[#0A1128]' : 'text-[#5A6B7C] hover:text-[#0A1128]'}`}
                >
                  MAD/HNS Transition Authorization
                </button>
              </div>

              {activePathway === 'app_iah' ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-[#2D9596]/5 border border-[#2D9596]/30 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-[#0A1128] font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-[#2D9596]"/> Clinical Escalation Context</h3>
                        <div className="flex gap-2">
                          <button onClick={() => setEscalationSource('ai')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${escalationSource === 'ai' ? 'bg-[#2D9596] text-white shadow' : 'bg-white border border-[#E8EEF2] text-[#5A6B7C]'}`}>AI Triggered</button>
                          <button onClick={() => setEscalationSource('technician')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${escalationSource === 'technician' ? 'bg-[#E76F51] text-white shadow' : 'bg-white border border-[#E8EEF2] text-[#5A6B7C]'}`}>Tech Triggered</button>
                        </div>
                    </div>
                    
                    <p className={`text-sm border-l-4 ${escalationSource === 'ai' ? 'border-[#2D9596]' : 'border-[#E76F51]'} bg-white p-4 rounded-r-lg shadow-sm transition-all`}>
                      <span className={`font-bold ${escalationSource === 'ai' ? 'text-[#2D9596]' : 'text-[#E76F51]'}`}>
                          {escalationSource === 'ai' ? 'Automated AI Safety Net: ' : 'Manual Technician Escalation: '}
                      </span>
                      {escalationSource === 'ai' 
                          ? 'System has detected Severe AHI flow issues and has automatically escalated for physician review.'
                          : 'Technician logged "Physician Collaboration (O5 APPEL IAH)". Airflow problem requires clinical path modification.'}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => setShowOrderModal(true)}
                    className="w-full bg-[#0A1128] text-white px-6 py-5 rounded-2xl hover:bg-[#1a233a] transition-all flex items-center justify-center gap-3 shadow-xl"
                  >
                      <FileSignature className="w-5 h-5 text-[#F4A261]" />
                      <span className="font-bold uppercase tracking-widest text-sm">Issue Formal Clinical Order</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-[#0A1128] uppercase tracking-wider mb-2">
                        Select Transition Path
                      </label>
                      <div className="space-y-3">
                        {['MAD', 'HNS'].map(therapy => (
                          <label key={therapy} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedTherapy === therapy ? 'border-[#2D9596] bg-[#2D9596]/5' : 'border-[#E8EEF2] hover:border-[#2D9596]/50'}`}>
                            <input type="radio" value={therapy} checked={selectedTherapy === therapy} onChange={(e) => setSelectedTherapy(e.target.value)} className="w-5 h-5 mt-0.5 text-[#2D9596]" />
                            <div>
                              <span className="text-[#0A1128] font-bold block">{therapy === 'MAD' ? 'Mandibular Advancement Device' : 'Hypoglossal Nerve Stimulation'}</span>
                              <span className="text-xs text-[#5A6B7C]">{therapy === 'MAD' ? 'An oral appliance used to manage airway collapse' : "A surgically implanted device placed under the skin on the patient's chest"}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-[#0A1128] uppercase tracking-wider mb-2">
                        Authorization Rationale
                      </label>
                      <textarea value={clinicalNotes} onChange={(e) => setClinicalNotes(e.target.value)} placeholder="Justify the abandonment of CPAP therapy..." className="w-full h-[200px] px-4 py-4 rounded-xl border border-[#E8EEF2] focus:border-[#2D9596] transition-all resize-none text-sm" />
                    </div>
                  </div>
                  <button 
                    onClick={handleAuthorize} 
                    disabled={!selectedTherapy || !clinicalNotes || isSubmitting} 
                    className="w-full bg-[#2D9596] text-white px-6 py-5 rounded-2xl hover:bg-[#247a7a] disabled:bg-[#E8EEF2] disabled:text-[#5A6B7C] transition-all flex items-center justify-center gap-3 shadow-xl"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSignature className="w-5 h-5" />}
                    <span className="font-bold uppercase tracking-widest text-sm">
                      {isSubmitting ? 'Processing Authorization...' : 'Authorize Treatment Transition'}
                    </span>
                  </button>
                </div>
              )}
            </>
          )}

          {isTechnician && (
             <div className="text-center py-10 bg-[#FAFAFA] rounded-2xl border-2 border-dashed border-[#E8EEF2]">
                <Package className="w-12 h-12 text-[#F4A261] mx-auto mb-4 opacity-40" />
                <h4 className="text-[#0A1128] font-bold mb-2">Technician Command Center</h4>
                <p className="text-sm text-[#5A6B7C] max-w-sm mx-auto mb-6">
                   Clinical decisions are reserved for Physicians. Please use the button at the top to log field interventions and equipment dispatches.
                </p>
                <button 
                  onClick={() => setShowTechActionModal(true)}
                  className="bg-white border-2 border-[#F4A261] text-[#F4A261] px-6 py-3 rounded-xl font-bold hover:bg-[#F4A261] hover:text-white transition-all shadow-sm"
                >
                   Log New Field Activity
                </button>
             </div>
          )}
        </div>
      </div>

      {/* Technician Action Modal */}
      {showTechActionModal && (
         <div className="fixed inset-0 bg-[#0A1128]/60 flex items-center justify-center z-50 animate-in fade-in duration-200 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-xl w-full animate-in zoom-in-95 duration-200">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#F4A261]/10 rounded-lg flex items-center justify-center">
                     <Plus className="w-6 h-6 text-[#F4A261]" />
                  </div>
                  <div>
                     <h3 className="text-xl font-bold text-[#0A1128]">Log Field Intervention</h3>
                     <p className="text-xs text-[#5A6B7C] uppercase font-bold tracking-tighter">Unified Service History Sync</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                     { id: 'disp', label: 'Equipment Dispatch', icon: <Package />, sub: 'Send new mask/hardware' },
                     { id: 'call', label: 'Remote Call', icon: <Phone />, sub: 'Adherence motivation' },
                     { id: 'visit', label: 'Home Visit', icon: <Home />, sub: 'Full refit & calibration' },
                     { id: 'adj', label: 'Pressure Adjust', icon: <Settings />, sub: 'Manual O3 update' }
                  ].map(action => (
                     <button 
                        key={action.id}
                        onClick={() => setTechActionType(action.label)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${techActionType === action.label ? 'border-[#F4A261] bg-[#F4A261]/5' : 'border-[#E8EEF2] hover:border-[#F4A261]/30'}`}
                     >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${techActionType === action.label ? 'bg-[#F4A261] text-white' : 'bg-[#FAFAFA] text-[#5A6B7C]'}`}>
                           {action.icon}
                        </div>
                        <p className="text-sm font-bold text-[#0A1128]">{action.label}</p>
                        <p className="text-[10px] text-[#5A6B7C]">{action.sub}</p>
                     </button>
                  ))}
               </div>

               <label className="block text-xs font-bold text-[#5A6B7C] uppercase tracking-widest mb-2">Intervention Detail / Outcome</label>
               <textarea 
                  value={techActionNote}
                  onChange={(e) => setTechActionNote(e.target.value)}
                  placeholder="Record what was done and the immediate outcome..."
                  className="w-full h-24 p-4 bg-[#FAFAFA] border border-[#E8EEF2] rounded-xl mb-6 text-sm focus:ring-2 focus:ring-[#F4A261] outline-none transition-all"
               />

               <div className="flex gap-4">
                  <button onClick={() => setShowTechActionModal(false)} className="flex-1 py-4 bg-[#E8EEF2] text-[#5A6B7C] font-bold rounded-xl active:scale-95 transition-transform">Cancel</button>
                  <button onClick={handleTechActionSubmit} disabled={!techActionType || !techActionNote} className="flex-2 py-4 bg-[#F4A261] text-white font-bold rounded-xl shadow-lg shadow-[#F4A261]/20 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform">
                     Log Intervention & Sync
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* Physician Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-[#0A1128]/60 flex items-center justify-center z-50 animate-in fade-in duration-200 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full animate-in zoom-in-95 duration-200">
              <h3 className="text-xl font-bold text-[#0A1128] mb-2 text-center">Issue Clinical Order</h3>
              <p className="text-sm text-[#5A6B7C] text-center mb-6">Describe the next clinical step or procedure required for this patient.</p>
              <textarea 
                  className="w-full h-32 p-4 bg-[#FAFAFA] border border-[#E8EEF2] rounded-xl focus:ring-2 focus:ring-[#2D9596] outline-none mb-6 resize-none text-sm shadow-inner transition-all"
                  placeholder="e.g. 'Redirect to Sleep Clinic for MAD titration'..."
                  value={appIahNotes}
                  onChange={(e) => setAppIahNotes(e.target.value)}
              />
              <div className="flex gap-4">
                <button onClick={() => setShowOrderModal(false)} className="flex-1 py-4 bg-[#E8EEF2] text-[#5A6B7C] font-bold rounded-xl active:scale-95 transition-transform">Cancel</button>
                <button onClick={handleAppIahSubmit} disabled={!appIahNotes} className="flex-1 flex gap-2 justify-center items-center py-4 bg-[#2D9596] text-white font-bold rounded-xl active:scale-95 transition-transform shadow-lg shadow-[#2D9596]/20">
                  <FileSignature className="w-4 h-4"/> Sign & Log Order
                </button>
              </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Internal icons helper
function ShieldAlert(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}
