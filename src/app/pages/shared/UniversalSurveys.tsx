import { useState } from 'react';
import { useLocation, useParams } from 'react-router';
import { AlertCircle, ChevronDown, CalendarDays, MessageSquare, ShieldAlert, UserCircle, CheckCircle, ClipboardList, Plus, Signal } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { fetchSurveys, submitMonitoringLog } from '../../data/api';

type SurveyType = 'PSQI' | 'ISI' | 'ESS' | 'FSS' | 'SF-36' | 'BDI';

export default function UniversalSurveys() {
  const { id } = useParams();
  const location = useLocation();
  const isTechnician = location.pathname.includes('/technician');
  
  const { data: liveSurveys, error, refetch } = useApi(() => fetchSurveys(id || '1'), {
    dependencies: [id]
  });

  const isLive = !error && !!liveSurveys;
  
  const [activeSurvey, setActiveSurvey] = useState<SurveyType>('ESS');
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState('');
  const [formNote, setFormNote] = useState('');

  const availableForms = [
    { id: 'comfort', name: 'Mask Comfort & Fit Check', type: 'Behavioral' },
    { id: 'hardware', name: 'Hardware Integrity Log', type: 'Technical' },
    { id: 'cleaning', name: 'Hygiene & Maintenance Review', type: 'Operational' },
    { id: 'env', name: 'Environment & Setup Audit', type: 'Technical' }
  ];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitMonitoringLog(id || '1', {
        form_type: selectedForm,
        notes: formNote,
        technician_id: 'TECH-001'
      });
      alert(`Monitoring Form Logged & Synced!`);
      refetch();
      setShowFormModal(false);
      setSelectedForm('');
      setFormNote('');
    } catch (err) {
      alert('Failed to log form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build survey database from API data when available
  const apiPhysicianSurveys = Array.isArray(liveSurveys?.physician) ? liveSurveys.physician : [];

  // Map API survey names to their full display info
  const surveyMeta: Record<string, { fullName: string; defaultThreshold: number; breakdownTemplate: { label: string; answer: string }[]; clinicalNoteTemplate: string }> = {
    ESS: { fullName: 'Epworth Sleepiness Scale (ESS)', defaultThreshold: 10, breakdownTemplate: [{ label: 'Daytime Sleepiness Assessment', answer: 'Score-based evaluation' }], clinicalNoteTemplate: 'ESS score indicates {risk} level of daytime sleepiness. {action}' },
    PSQI: { fullName: 'Pittsburgh Sleep Quality Index (PSQI)', defaultThreshold: 5, breakdownTemplate: [{ label: 'Sleep Quality Assessment', answer: 'Score-based evaluation' }], clinicalNoteTemplate: 'PSQI score indicates {risk} sleep quality. {action}' },
    ISI: { fullName: 'Insomnia Severity Index (ISI)', defaultThreshold: 14, breakdownTemplate: [{ label: 'Insomnia Severity Assessment', answer: 'Score-based evaluation' }], clinicalNoteTemplate: 'ISI score indicates {risk} insomnia severity. {action}' },
    FSS: { fullName: 'Fatigue Severity Scale (FSS)', defaultThreshold: 36, breakdownTemplate: [{ label: 'Fatigue Impact Assessment', answer: 'Score-based evaluation' }], clinicalNoteTemplate: 'FSS score indicates {risk} fatigue levels. {action}' },
    'SF-36': { fullName: 'Short Form 36 Health Survey (SF-36)', defaultThreshold: 50, breakdownTemplate: [{ label: 'General Health Assessment', answer: 'Score-based evaluation' }], clinicalNoteTemplate: 'SF-36 score indicates {risk} general health status. {action}' },
    BDI: { fullName: 'Beck Depression Inventory (BDI)', defaultThreshold: 13, breakdownTemplate: [{ label: 'Depression Screening', answer: 'Score-based evaluation' }], clinicalNoteTemplate: 'BDI score indicates {risk} depression levels. {action}' },
  };

  const surveyDatabase: Record<string, any> = {};
  // First populate from API data
  for (const apiSurvey of apiPhysicianSurveys) {
    const meta = surveyMeta[apiSurvey.name] || { fullName: apiSurvey.name, defaultThreshold: 0, breakdownTemplate: [{ label: 'Assessment', answer: 'Score-based' }], clinicalNoteTemplate: 'Score indicates {risk} level.' };
    const threshold = apiSurvey.threshold ?? meta.defaultThreshold;
    const risk = apiSurvey.risk || (apiSurvey.score > threshold ? 'Elevated' : 'Normal');
    const action = apiSurvey.score > threshold ? 'Clinical review recommended.' : 'No immediate action required.';
    surveyDatabase[apiSurvey.name] = {
      name: meta.fullName,
      date: apiSurvey.dateTaken,
      score: apiSurvey.score,
      threshold: threshold,
      risk: risk,
      breakdown: meta.breakdownTemplate,
      clinicalNote: meta.clinicalNoteTemplate.replace('{risk}', risk.toLowerCase()).replace('{action}', action)
    };
  }
  // Fill in any missing survey types with defaults so the selector always works
  for (const [key, meta] of Object.entries(surveyMeta)) {
    if (!surveyDatabase[key]) {
      surveyDatabase[key] = {
        name: meta.fullName,
        date: '—',
        score: 0,
        threshold: meta.defaultThreshold,
        risk: 'No Data',
        breakdown: [{ label: 'No assessment available', answer: 'Patient has not completed this survey yet' }],
        clinicalNote: 'No data available for this survey. Patient has not completed it yet.'
      };
    }
  }

  const activeContent = surveyDatabase[activeSurvey] || surveyDatabase['ESS'];

  const getRiskColor = (risk: string) => {
    if (risk === 'High') return 'text-[#E76F51]';
    if (risk === 'Elevated' || risk === 'Moderate') return 'text-[#F4A261]';
    return 'text-[#6A994E]';
  };

  const getRiskBadge = (risk: string) => {
    if (risk === 'High') return 'bg-[#E76F51]/10 text-[#E76F51]';
    if (risk === 'Elevated' || risk === 'Moderate') return 'bg-[#F4A261]/10 text-[#F4A261]';
    return 'bg-[#6A994E]/10 text-[#6A994E]';
  };

  return (
    <div className="p-8 max-w-5xl space-y-8 pb-20">
      
      {/* Role-Specific Action Banner */}
      <div className={`p-6 rounded-2xl border-2 flex items-center justify-between ${isTechnician ? 'bg-[#F4A261]/5 border-[#F4A261]/30' : 'bg-[#6A994E]/5 border-[#6A994E]/30'}`}>
         <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isTechnician ? 'bg-[#F4A261] text-white' : 'bg-[#6A994E] text-white'}`}>
               {isTechnician ? <ClipboardList /> : <UserCircle />}
            </div>
            <div>
               <div className="flex items-center gap-3">
                 <h2 className="text-xl font-bold text-[#0A1128]">
                    {isTechnician ? 'Behavioral Monitoring Desk' : 'Clinical Assessment Review'}
                 </h2>
                 {isLive && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-[#6A994E]/10 border border-[#6A994E]/20 rounded-md">
                      <Signal className="w-3 h-3 text-[#6A994E]" />
                      <span className="text-[10px] font-bold text-[#6A994E] uppercase tracking-wider">Live</span>
                    </div>
                  )}
               </div>
               <p className="text-sm text-[#5A6B7C]">
                  {isTechnician ? 'Log visit observations and view patient-reported milestones.' : 'Review standardized medical surveys and technician field notes.'}
               </p>
            </div>
         </div>
         
         {isTechnician && (
            <button 
               className="bg-[#F4A261] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-[#e39350] transition-all flex items-center gap-2"
               onClick={() => setShowFormModal(true)}
            >
               <Plus className="w-5 h-5" /> Start New Observation
            </button>
         )}
      </div>

      <div className="bg-white rounded-xl border border-[#E8EEF2] shadow-sm overflow-hidden">
        {/* Survey Selector Menu */}
        <div className="p-6 border-b border-[#E8EEF2] bg-[#FAFAFA]">
          <div className="flex items-center justify-between mb-4">
             <label className="text-sm font-bold text-[#0A1128] uppercase tracking-widest">
                Select Standardized Milestone
             </label>
             <span className="text-[10px] bg-[#6A994E] text-white px-2 py-0.5 rounded font-bold uppercase">Clinical Gateway</span>
          </div>
          <div className="relative">
            <select 
              value={activeSurvey}
              onChange={(e) => setActiveSurvey(e.target.value as SurveyType)}
              className="w-full appearance-none bg-white border-2 border-[#E8EEF2] text-[#0A1128] font-bold py-4 px-5 rounded-xl focus:outline-none focus:border-[#2D9596] cursor-pointer transition-all shadow-sm"
            >
              <option value="ESS">Epworth Sleepiness Scale (ESS)</option>
              <option value="PSQI">Pittsburgh Sleep Quality Index (PSQI)</option>
              <option value="ISI">Insomnia Severity Index (ISI)</option>
              <option value="FSS">Fatigue Severity Scale (FSS)</option>
              <option value="SF-36">SF-36 Health Survey (SF-36)</option>
              <option value="BDI">Beck Depression Inventory (BDI)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#5A6B7C]">
              <ChevronDown className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Dynamic Active Survey Area */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Active Survey Header */}
          <div className="p-8 border-b border-[#E8EEF2]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#0A1128]">{activeContent.name}</h3>
              {activeContent.score > activeContent.threshold && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#E76F51] bg-[#E76F51]/10 px-4 py-2 rounded-full uppercase tracking-widest border border-[#E76F51]/20">
                  <AlertCircle className="w-4 h-4" /> Threshold Breach
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-[#FAFAFA] p-4 rounded-xl border border-[#E8EEF2]">
                <p className="text-[10px] text-[#5A6B7C] uppercase font-bold tracking-widest mb-1">Assessment Date</p>
                <p className="text-lg font-bold text-[#0A1128] flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#2D9596]" />
                  {new Date(activeContent.date).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-[#FAFAFA] p-4 rounded-xl border border-[#E8EEF2]">
                <p className="text-[10px] text-[#5A6B7C] uppercase font-bold tracking-widest mb-1">Total Score</p>
                <p className={`text-2xl font-bold ${getRiskColor(activeContent.risk)}`}>{activeContent.score}</p>
              </div>
              <div className="bg-[#FAFAFA] p-4 rounded-xl border border-[#E8EEF2]">
                <p className="text-[10px] text-[#5A6B7C] uppercase font-bold tracking-widest mb-1">Status</p>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest inline-block mt-1 ${getRiskBadge(activeContent.risk)}`}>
                  {activeContent.risk} Risk
                </span>
              </div>
              <div className="bg-[#2D9596]/5 p-4 rounded-xl border border-[#2D9596]/10 flex flex-col justify-center">
                <p className="text-[8px] text-[#2D9596] uppercase font-bold tracking-widest mb-1">AI Automation</p>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#2D9596]">
                  <CheckCircle className="w-3 h-3" /> Auto Follow-up Active
                </span>
              </div>
            </div>
          </div>
          
          {/* Active Survey Breakdown */}
          <div className="p-8 pb-10">
            <h4 className="text-xs font-bold text-[#5A6B7C] uppercase tracking-widest mb-4">Itemized Patient Responses</h4>
            <div className="divide-y divide-[#E8EEF2] bg-[#FAFAFA] rounded-2xl border border-[#E8EEF2] overflow-hidden mb-8">
              {activeContent.breakdown.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-5 hover:bg-white transition-colors">
                  <span className="text-[#5A6B7C] font-semibold text-sm">{item.label}</span>
                  <span className="text-[#0A1128] font-bold text-sm bg-white border border-[#E8EEF2] px-4 py-1.5 rounded-lg shadow-sm">{item.answer}</span>
                </div>
              ))}
            </div>

            <div className="bg-[#F4A261]/10 border-l-4 border-[#F4A261] rounded-r-2xl p-6 shadow-sm">
              <h4 className="text-sm font-bold text-[#0A1128] mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#F4A261]" /> Interpretive Clinical Note
              </h4>
              <p className="text-sm text-[#0A1128] leading-relaxed italic">
                "{activeContent.clinicalNote}"
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Technician Monitoring & Operational Logs (Universal Section) */}
      <div className="bg-[#0A1128] rounded-2xl border border-[#0A1128] shadow-xl overflow-hidden mt-8">
        <div className="p-6 text-white flex items-center justify-between border-b border-white/10">
           <div className="flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-[#F4A261]" />
              <div>
                 <h3 className="text-xl font-bold">Technician Field Connectivity</h3>
                 <p className="text-xs text-white/50 uppercase tracking-widest font-bold">Operational Monitoring History</p>
              </div>
           </div>
           <span className="text-[10px] font-bold bg-white/10 px-3 py-1 rounded-full uppercase tracking-widest border border-white/20">Universal Truth Layer</span>
        </div>
        
        <div className="p-8 space-y-6 bg-white/5">
           {Array.isArray(liveSurveys?.technician) && liveSurveys.technician.length > 0 ? (
             liveSurveys.technician.map((log: any, idx: number) => (
             <div key={idx} className="bg-white p-6 rounded-2xl shadow-lg border border-transparent hover:border-[#F4A261]/30 transition-all group">
                <div className="flex items-start justify-between mb-4">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#FAFAFA] rounded-full flex items-center justify-center border border-[#E8EEF2]">
                         <UserCircle className="w-7 h-7 text-[#5A6B7C]" />
                      </div>
                      <div>
                         <p className="text-md font-bold text-[#0A1128] group-hover:text-[#F4A261] transition-colors">{log.name || 'Monitoring Log'}</p>
                         <p className="text-[10px] text-[#5A6B7C] uppercase font-bold tracking-widest mt-0.5">{log.type || 'Operational'}: {log.author || 'TECH-001'}</p>
                      </div>
                   </div>
                   <span className="text-[10px] font-mono font-bold bg-[#FAFAFA] px-2 py-1 rounded text-[#5A6B7C] border border-[#E8EEF2]">{log.lastCompleted}</span>
                </div>
                
                <div className="bg-[#F4A261]/5 border-2 border-dashed border-[#F4A261]/20 p-5 rounded-2xl flex items-center gap-4 group-hover:bg-[#F4A261]/10 transition-colors">
                   <MessageSquare className="w-5 h-5 text-[#F4A261]" />
                   <p className="text-sm font-bold text-[#0A1128] leading-relaxed">
                     <span className="text-[#F4A261] uppercase text-[10px] font-black mr-2">Field Observation:</span> 
                     Data successfully synced from field unit via {log.name}.
                   </p>
                </div>
             </div>
           ))) : (
             <div className="text-center py-20">
                <ClipboardList className="w-16 h-16 text-white/10 mx-auto mb-4" />
                <p className="text-white/40 font-bold uppercase tracking-widest text-xs">No technician-logged monitoring forms available.</p>
             </div>
           )}
        </div>
      </div>

      {/* Form Modal (Technician Only) */}
      {showFormModal && (
        <div className="fixed inset-0 bg-[#0A1128]/60 flex items-center justify-center z-50 animate-in fade-in duration-200 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-xl w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#F4A261]/10 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-[#F4A261]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0A1128]">New Monitoring Form</h3>
                <p className="text-xs text-[#5A6B7C] uppercase font-bold tracking-tighter">Operational Field Log</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <label className="block text-xs font-bold text-[#5A6B7C] uppercase tracking-widest">Select Form Type</label>
              <select 
                value={selectedForm}
                onChange={(e) => setSelectedForm(e.target.value)}
                className="w-full bg-[#FAFAFA] border-2 border-[#E8EEF2] rounded-xl p-4 text-sm font-bold text-[#0A1128] focus:border-[#F4A261] outline-none"
              >
                <option value="">Choose a monitoring form...</option>
                {availableForms.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
              </select>

              <label className="block text-xs font-bold text-[#5A6B7C] uppercase tracking-widest mt-6">Observations / Patient Feedback</label>
              <textarea 
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
                placeholder="Log the patient's specific feedback or technical observations..."
                className="w-full h-32 bg-[#FAFAFA] border-2 border-[#E8EEF2] rounded-xl p-4 text-sm focus:border-[#F4A261] outline-none"
              />
            </div>

            <div className="flex gap-4">
              <button onClick={() => setShowFormModal(false)} className="flex-1 py-4 bg-[#E8EEF2] text-[#5A6B7C] font-bold rounded-xl active:scale-95 transition-transform">Cancel</button>
              <button onClick={handleFormSubmit} disabled={!selectedForm || !formNote} className="flex-2 py-4 bg-[#F4A261] text-white font-bold rounded-xl shadow-lg shadow-[#F4A261]/20 disabled:opacity-40 active:scale-95 transition-transform">
                Log Form & Sync
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
