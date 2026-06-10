import { useState } from 'react';
import { useLocation, useParams } from 'react-router';
import { toast } from 'sonner';
import { FileSignature, AlertCircle, Activity, Plus, Package, Phone, Home, Settings, Signal, Loader2, PlaySquare, Star, Clock, CheckCircle } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { fetchInterventions, createIntervention, fetchAuthorizations, createAuthorization } from '../../data/api';

export default function UniversalInterventions() {
  const { id } = useParams();
  const location = useLocation();
  const isTechnician = location.pathname.includes('/technician');
  
  const { data: liveInterventions, error: intError, refetch: refetchInt } = useApi(() => fetchInterventions(id || '1'), {
    dependencies: [id],
    cacheKey: `interventions-${id || '1'}`
  });

  const { data: liveAuths, error: authError, refetch: refetchAuth } = useApi(() => fetchAuthorizations(id || '1'), {
    dependencies: [id],
    cacheKey: `authorizations-${id || '1'}`
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
  const [activeTab, setActiveTab] = useState<'clinical_log' | 'coaching_videos'>('clinical_log');

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
      toast.success('Clinical Order Submitted!');
      refetchInt();
      setShowOrderModal(false);
    } catch (err) {
      toast.error('Failed to submit order.');
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
      toast.success('Technician Intervention Logged!');
      refetchInt();
      setShowTechActionModal(false);
    } catch (err) {
      toast.error('Failed to log intervention.');
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
      toast.success(`Authorization for ${selectedTherapy} submitted successfully!`);
      refetchAuth();
      setSelectedTherapy('');
      setClinicalNotes('');
    } catch (err) {
      toast.error('Failed to submit authorization.');
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

  // Normalize interventions with delivery mode and delta usage
  const normalizedInterventions = allInterventions.map((item: any) => {
    const outcome = item.outcome || item.result || item.status || 'Logged';
    
    // Deduce Delivery Mode
    let deliveryMode = 'In-Person';
    if (item.type?.includes('Video') || item.type?.includes('Remote') || item.type?.includes('SMS')) deliveryMode = 'Digital';
    if (item.tech === 'Auto-Trigger' || item.tech === 'AI-System' || item.type?.includes('System')) deliveryMode = 'Automated';
    if (item.type?.includes('Authorization')) deliveryMode = 'Digital';
    
    // Mock Delta Usage based on outcome
    let deltaUsage = '—';
    if (outcome === 'Success' || outcome === 'Approved' || outcome === 'Done' || outcome === 'Resolved') deltaUsage = `+${(Math.random() * 1.5 + 0.5).toFixed(1)} hrs/night`;
    if (outcome.includes('Failed') || outcome === 'Cancelled') deltaUsage = `-${(Math.random() * 1.0 + 0.1).toFixed(1)} hrs/night`;

    return {
      ...item,
      outcome,
      deliveryMode,
      deltaUsage,
      date: item.date || (item.timestamp ? new Date(item.timestamp).toLocaleDateString() : '—')
    };
  });

  // Sort descending
  normalizedInterventions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const pendingCount = normalizedInterventions.filter((i: any) => i.outcome === 'Pending' || i.outcome === 'Planned').length;
  const recentChain = normalizedInterventions.slice(0, 3).reverse(); // Reverse for left-to-right chronological pipeline

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 pb-20">
      
      {/* Role-Specific Action Banner */}
      <div className={`p-6 rounded-2xl border-2 flex items-center justify-between shadow-sm ${isTechnician ? 'bg-[#F4A261]/5 border-[#F4A261]/30' : 'bg-[#E76F51]/5 border-[#E76F51]/30'}`}>
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
      </div>

      {/* Sub-Tab Switcher */}
      <div className="flex gap-4 border-b border-[#E8EEF2] pb-px">
        <button
          onClick={() => setActiveTab('clinical_log')}
          className={`pb-4 px-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'clinical_log' ? 'border-[#0A1128] text-[#0A1128]' : 'border-transparent text-[#5A6B7C] hover:text-[#0A1128]'}`}
        >
          Clinical Action Log
        </button>
        <button
          onClick={() => setActiveTab('coaching_videos')}
          className={`pb-4 px-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'coaching_videos' ? 'border-[#0A1128] text-[#0A1128]' : 'border-transparent text-[#5A6B7C] hover:text-[#0A1128]'}`}
        >
          Coaching Videos (Digital Interventions)
        </button>
      </div>

      {activeTab === 'coaching_videos' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-white rounded-xl border border-[#E8EEF2] shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#E8EEF2] bg-gradient-to-br from-[#FAFAFA] to-white flex justify-between items-center">
                 <div>
                    <h3 className="text-xl text-[#0A1128] font-semibold flex items-center gap-2"><PlaySquare className="w-5 h-5 text-[#2D9596]" /> Digital Intervention Analytics</h3>
                    <p className="text-[#5A6B7C] text-sm mt-1">Track automated video dispatches, patient engagement, and feedback ratings.</p>
                 </div>
                 <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                       <p className="text-[10px] font-bold text-[#5A6B7C] uppercase tracking-widest">Avg Watch Rate</p>
                       <p className="text-xl font-bold text-[#2D9596]">82%</p>
                    </div>
                    <div className="w-px h-10 bg-[#E8EEF2]" />
                    <div className="text-center">
                       <p className="text-[10px] font-bold text-[#5A6B7C] uppercase tracking-widest">Avg Rating</p>
                       <p className="text-xl font-bold text-[#F4A261] flex items-center justify-center gap-1">4.5 <Star className="w-4 h-4 fill-[#F4A261]" /></p>
                    </div>
                 </div>
              </div>
              
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-[#FAFAFA] border-b border-[#E8EEF2]">
                          <th className="p-4 text-[10px] font-bold text-[#5A6B7C] uppercase tracking-widest">Video Title</th>
                          <th className="p-4 text-[10px] font-bold text-[#5A6B7C] uppercase tracking-widest">Trigger Category</th>
                          <th className="p-4 text-[10px] font-bold text-[#5A6B7C] uppercase tracking-widest">Delivery Time</th>
                          <th className="p-4 text-[10px] font-bold text-[#5A6B7C] uppercase tracking-widest">Status</th>
                          <th className="p-4 text-[10px] font-bold text-[#5A6B7C] uppercase tracking-widest min-w-[150px]">Watch Rate</th>
                          <th className="p-4 text-[10px] font-bold text-[#5A6B7C] uppercase tracking-widest text-right">Rating</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8EEF2]">
                       {[
                         { id: 1, title: 'Resolving Mask Leakage', trigger: 'AI Flag: High Leak', time: '< 2 mins', status: 'Watched', watch: 100, rating: 5, date: 'May 10' },
                         { id: 2, title: 'Understanding REM Rebound', trigger: 'Usage Drop > 2hrs', time: '< 5 mins', status: 'Ignored', watch: 0, rating: null, date: 'May 18' },
                         { id: 3, title: 'Cleaning Your ResMed', trigger: 'Maintenance Cycle', time: 'Automated', status: 'Watched', watch: 85, rating: 4, date: 'May 20' }
                       ].map(v => (
                         <tr key={v.id} className="hover:bg-[#FAFAFA]/50 transition-colors">
                            <td className="p-4">
                               <p className="font-bold text-[#0A1128] text-sm">{v.title}</p>
                               <p className="text-[10px] text-[#5A6B7C] font-bold uppercase">{v.date}</p>
                            </td>
                            <td className="p-4">
                               <span className="bg-[#0A1128]/5 text-[#0A1128] border border-[#0A1128]/10 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">{v.trigger}</span>
                            </td>
                            <td className="p-4">
                               <span className="flex items-center gap-1.5 text-xs font-semibold text-[#5A6B7C]"><Clock className="w-3.5 h-3.5" /> {v.time}</span>
                            </td>
                            <td className="p-4">
                               <span className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest ${v.status === 'Watched' ? 'text-[#6A994E]' : 'text-[#E76F51]'}`}>
                                  {v.status === 'Watched' ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                  {v.status}
                               </span>
                            </td>
                            <td className="p-4">
                               <div className="flex items-center gap-3">
                                  <div className="flex-1 h-2 bg-[#E8EEF2] rounded-full overflow-hidden">
                                     <div className={`h-full rounded-full transition-all duration-1000 ${v.watch === 100 ? 'bg-[#6A994E]' : v.watch === 0 ? 'bg-[#E76F51]' : 'bg-[#F4A261]'}`} style={{ width: `${v.watch}%` }} />
                                  </div>
                                  <span className="text-xs font-bold text-[#0A1128] w-8 text-right">{v.watch}%</span>
                               </div>
                            </td>
                            <td className="p-4 text-right">
                               {v.rating ? (
                                  <div className="flex items-center justify-end gap-1">
                                    {[...Array(5)].map((_, i) => (
                                       <Star key={i} className={`w-3.5 h-3.5 ${i < v.rating! ? 'fill-[#F4A261] text-[#F4A261]' : 'fill-transparent text-[#E8EEF2]'}`} />
                                    ))}
                                  </div>
                               ) : (
                                  <span className="text-[10px] font-bold text-[#5A6B7C] uppercase tracking-widest">Unrated</span>
                               )}
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      ) : (

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Grid Layout: 2/3 Evidence Stream, 1/3 Command Center */}
        
        {/* Left Column: Evidence Stream */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-xl border border-[#E8EEF2] shadow-sm p-8">
            <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#5A6B7C]/10 text-[#5A6B7C] px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-[#5A6B7C]/20">
                     Unified Evidence Log
                  </span>
                  {pendingCount > 0 && (
                    <span className="bg-[#F4A261]/10 text-[#F4A261] px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-[#F4A261]/20 flex items-center gap-1">
                       <AlertCircle className="w-3 h-3"/> {pendingCount} Pending
                    </span>
                  )}
                </div>
                <h3 className="text-xl text-[#0A1128] mb-2 font-semibold">Intervention Viability History</h3>
                <p className="text-[#5A6B7C] text-sm">
                  All clinical and technical activities logged for this patient profile.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              
              {/* Sequence Chain Display */}
              {recentChain.length > 0 && (
                <div className="mb-8 bg-[#FAFAFA] p-6 rounded-2xl border border-[#E8EEF2]">
                  <h4 className="text-xs font-bold text-[#5A6B7C] uppercase tracking-widest mb-6">Clinical Escalation Timeline</h4>
                  <div className="flex items-center w-full">
                    {recentChain.map((node: any, idx: number) => (
                      <div key={idx} className="flex items-center flex-1 last:flex-none">
                         <div className={`p-4 rounded-xl border-2 flex-1 relative bg-white hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 ${node.outcome === 'Success' || node.outcome === 'Approved' || node.outcome === 'Done' ? 'border-[#6A994E]/30' : node.outcome === 'Pending' || node.outcome === 'Planned' ? 'border-[#F4A261]/30' : 'border-[#E76F51]/30'}`}>
                            <p className="text-[10px] font-bold text-[#5A6B7C] uppercase tracking-wider mb-1">{node.date}</p>
                            <p className="font-bold text-[#0A1128] text-sm line-clamp-1" title={node.type}>{node.type}</p>
                            <p className={`text-xs font-bold mt-2 flex items-center gap-1.5 ${node.outcome === 'Success' || node.outcome === 'Approved' || node.outcome === 'Done' ? 'text-[#6A994E]' : node.outcome === 'Pending' || node.outcome === 'Planned' ? 'text-[#F4A261]' : 'text-[#E76F51]'}`}>
                               <span className={`w-1.5 h-1.5 rounded-full ${node.outcome === 'Success' || node.outcome === 'Approved' || node.outcome === 'Done' ? 'bg-[#6A994E]' : node.outcome === 'Pending' || node.outcome === 'Planned' ? 'bg-[#F4A261]' : 'bg-[#E76F51]'}`}></span>
                               {node.outcome}
                            </p>
                         </div>
                         {idx < recentChain.length - 1 && (
                            <div className="w-8 h-0.5 bg-[#E8EEF2] mx-2 relative shrink-0">
                               <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-[#E8EEF2] rotate-45"></div>
                            </div>
                         )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Intervention Timeline */}
              <div>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#E8EEF2] before:to-transparent">
                  {normalizedInterventions.length === 0 ? (
                    <div className="py-16 flex flex-col items-center justify-center text-center relative z-10 bg-white/50 rounded-2xl border border-dashed border-[#E8EEF2] backdrop-blur-sm">
                      <div className="w-16 h-16 bg-[#F4A261]/10 rounded-full flex items-center justify-center mb-4">
                        <Activity className="w-8 h-8 text-[#F4A261] opacity-50" />
                      </div>
                      <h4 className="text-[#0A1128] font-bold mb-2">No History Logged</h4>
                      <p className="text-[#5A6B7C] text-sm max-w-xs">There are no technical or clinical interventions recorded for this patient yet.</p>
                    </div>
                  ) : (
                    normalizedInterventions.map((item: any, idx: number) => (
                      <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        {/* Icon */}
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10 ${item.outcome === 'Success' || item.outcome === 'Approved' || item.outcome === 'Done' ? 'bg-[#6A994E]' : item.outcome === 'Pending' || item.outcome === 'Planned' ? 'bg-[#F4A261]' : 'bg-[#E76F51]'}`}>
                           {item.deliveryMode === 'Automated' ? <Settings className="w-4 h-4 text-white" /> : item.deliveryMode === 'Digital' ? <Phone className="w-4 h-4 text-white" /> : <Home className="w-4 h-4 text-white" />}
                        </div>
                        
                        {/* Card */}
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-white border border-[#E8EEF2] shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#5A6B7C]/20 transition-all duration-300">
                           <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                              <h4 className="font-bold text-[#0A1128]">{item.type}</h4>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${item.outcome === 'Success' || item.outcome === 'Approved' || item.outcome === 'Done' ? 'bg-[#6A994E]/10 text-[#6A994E]' : item.outcome === 'Pending' || item.outcome === 'Planned' ? 'bg-[#F4A261]/10 text-[#F4A261]' : 'bg-[#E76F51]/10 text-[#E76F51]'}`}>
                                 {item.outcome}
                              </span>
                           </div>
                           
                           <p className="text-xs text-[#5A6B7C] mb-4">{item.notes || item.job_code || item.code}</p>
                           
                           <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E8EEF2]">
                              <div>
                                 <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A6B7C] mb-1">Delivery Mode</p>
                                 <p className="text-sm font-semibold text-[#0A1128] flex items-center gap-1.5">
                                    {item.deliveryMode === 'Automated' ? <Settings className="w-3 h-3" /> : item.deliveryMode === 'Digital' ? <Phone className="w-3 h-3" /> : <Home className="w-3 h-3" />}
                                    {item.deliveryMode}
                                 </p>
                              </div>
                              <div>
                                 <p className="text-[10px] font-bold uppercase tracking-widest text-[#5A6B7C] mb-1">Δ Usage</p>
                                 <p className={`text-sm font-semibold flex items-center gap-1.5 ${item.deltaUsage.startsWith('+') ? 'text-[#6A994E]' : item.deltaUsage.startsWith('-') ? 'text-[#E76F51]' : 'text-[#5A6B7C]'}`}>
                                    <Activity className="w-3 h-3" />
                                    {item.deltaUsage}
                                 </p>
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#E8EEF2] text-[10px] font-bold uppercase tracking-widest text-[#5A6B7C]">
                              <span>{item.date}</span>
                              <span className="flex items-center gap-1"><Plus className="w-3 h-3"/> {item.actor?.role || item.tech || 'System'}{item.actor?.id ? `: ${item.actor.id}` : ''}</span>
                           </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-[10px] text-[#5A6B7C] mt-8 text-center flex items-center justify-center gap-2">
                  <ShieldAlert className="w-3 h-3" /> Shared Registry: Every action taken here is visible to both Clinical and Technical teams.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Command Center */}
        <div className="lg:col-span-1 space-y-6 sticky top-8">
           
           {/* KPI Box */}
           <div className={`rounded-xl border shadow-sm p-6 flex items-center justify-between relative overflow-hidden ${pendingCount > 0 ? 'bg-gradient-to-br from-[#0A1128] to-[#1a233a] border-[#0A1128] text-white' : 'bg-white border-[#E8EEF2]'}`}>
              <div className="relative z-10">
                 <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${pendingCount > 0 ? 'text-[#F4A261]' : 'text-[#5A6B7C]'}`}>Pending Actions</p>
                 <h2 className={`text-3xl font-bold ${pendingCount > 0 ? 'text-white' : 'text-[#0A1128]'}`}>{pendingCount} <span className={`text-sm font-normal ${pendingCount > 0 ? 'text-white/60' : 'text-[#5A6B7C]'}`}>open item{pendingCount !== 1 ? 's' : ''}</span></h2>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center relative z-10 ${pendingCount > 0 ? 'bg-[#F4A261]/20' : 'bg-[#E8EEF2]'}`}>
                 <AlertCircle className={`w-6 h-6 ${pendingCount > 0 ? 'text-[#F4A261]' : 'text-[#5A6B7C]'}`} />
              </div>
              {pendingCount > 0 && <div className="absolute top-0 right-0 w-32 h-32 bg-[#F4A261]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>}
           </div>

           {isTechnician ? (
              /* Inline Technician Action Form */
              <div className="bg-white rounded-xl border border-[#E8EEF2] shadow-sm p-6">
                 <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E8EEF2]">
                    <div className="w-8 h-8 bg-[#F4A261]/10 rounded-lg flex items-center justify-center">
                       <Plus className="w-4 h-4 text-[#F4A261]" />
                    </div>
                    <div>
                       <h3 className="font-bold text-[#0A1128]">Log Field Intervention</h3>
                       <p className="text-[10px] text-[#5A6B7C] uppercase font-bold tracking-tighter">Unified Service History Sync</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                       { id: 'disp', label: 'Equipment', icon: <Package className="w-4 h-4"/>, sub: 'New mask' },
                       { id: 'call', label: 'Remote Call', icon: <Phone className="w-4 h-4"/>, sub: 'Adherence' },
                       { id: 'visit', label: 'Home Visit', icon: <Home className="w-4 h-4"/>, sub: 'Full refit' },
                       { id: 'adj', label: 'Adjust', icon: <Settings className="w-4 h-4"/>, sub: 'O3 update' }
                    ].map(action => (
                       <button 
                          key={action.id}
                          onClick={() => setTechActionType(action.label)}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${techActionType === action.label ? 'border-[#F4A261] bg-[#F4A261]/5' : 'border-[#E8EEF2] hover:border-[#F4A261]/30'}`}
                       >
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center mb-2 ${techActionType === action.label ? 'bg-[#F4A261] text-white' : 'bg-[#FAFAFA] text-[#5A6B7C]'}`}>
                             {action.icon}
                          </div>
                          <p className="text-xs font-bold text-[#0A1128]">{action.label}</p>
                       </button>
                    ))}
                 </div>

                 <label className="block text-[10px] font-bold text-[#5A6B7C] uppercase tracking-widest mb-2">Intervention Detail / Outcome</label>
                 <textarea 
                    value={techActionNote}
                    onChange={(e) => setTechActionNote(e.target.value)}
                    placeholder="Record what was done and the immediate outcome..."
                    className="w-full h-24 p-3 bg-[#FAFAFA] border border-[#E8EEF2] rounded-xl mb-6 text-sm focus:ring-2 focus:ring-[#F4A261] outline-none transition-all resize-none"
                 />

                 <button 
                    onClick={handleTechActionSubmit} 
                    disabled={!techActionType || !techActionNote || isSubmitting} 
                    className="w-full py-4 bg-[#F4A261] text-white font-bold rounded-xl shadow-lg shadow-[#F4A261]/20 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform flex items-center justify-center gap-2"
                 >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    Log Intervention
                 </button>
              </div>
           ) : (
              /* Inline Physician Action Forms */
              <div className="bg-white rounded-xl border border-[#E8EEF2] shadow-sm overflow-hidden">
                 <div className="p-6">
                     <div className="space-y-6 animate-in fade-in duration-300">
                         <div className="bg-[#2D9596]/5 border border-[#2D9596]/30 rounded-xl p-4">
                           <div className="flex justify-between items-center mb-4">
                               <h3 className="text-sm text-[#0A1128] font-bold flex items-center gap-2"><Activity className="w-4 h-4 text-[#2D9596]"/> Escalation Source</h3>
                           </div>
                           <div className="flex gap-2 mb-4">
                             <button onClick={() => setEscalationSource('ai')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${escalationSource === 'ai' ? 'bg-[#2D9596] text-white shadow' : 'bg-white border border-[#E8EEF2] text-[#5A6B7C]'}`}>AI Triggered</button>
                             <button onClick={() => setEscalationSource('technician')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${escalationSource === 'technician' ? 'bg-[#E76F51] text-white shadow' : 'bg-white border border-[#E8EEF2] text-[#5A6B7C]'}`}>Tech Escalated</button>
                           </div>
                           <p className={`text-xs border-l-2 ${escalationSource === 'ai' ? 'border-[#2D9596]' : 'border-[#E76F51]'} bg-white p-3 rounded-r-lg shadow-sm transition-all`}>
                             {escalationSource === 'ai' 
                                 ? 'System detected Severe AHI flow issues and automatically escalated for review.'
                                 : 'Technician logged "Physician Collaboration". Airflow problem requires clinical modification.'}
                           </p>
                         </div>
                         
                         <label className="block text-[10px] font-bold text-[#5A6B7C] uppercase tracking-widest mb-2">Issue Clinical Order</label>
                         <textarea 
                             className="w-full h-24 p-3 bg-[#FAFAFA] border border-[#E8EEF2] rounded-xl focus:ring-2 focus:ring-[#2D9596] outline-none mb-4 resize-none text-sm transition-all"
                             placeholder="e.g. 'Increase pressure to 12 cmH2O due to residual AHI'..."
                             value={appIahNotes}
                             onChange={(e) => setAppIahNotes(e.target.value)}
                         />

                         <button 
                           onClick={handleAppIahSubmit} 
                           disabled={!appIahNotes || isSubmitting}
                           className="w-full bg-[#0A1128] text-white px-4 py-4 rounded-xl hover:bg-[#1a233a] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                         >
                             {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSignature className="w-4 h-4 text-[#F4A261]" />}
                             <span className="font-bold uppercase tracking-widest text-xs">Sign Order</span>
                         </button>
                     </div>
                 </div>
              </div>
           )}
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
