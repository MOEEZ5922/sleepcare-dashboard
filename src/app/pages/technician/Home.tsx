import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Droplets,
  Moon,
  Wrench,
  CheckCircle,
  XCircle,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  Clock,
  Users,
  Search,
  Filter,
  Activity,
  ChevronRight,
  MessageSquare,
  Package as PackageIcon,
  Signal,
  Loader2,
  Plus
} from 'lucide-react';
import { Link } from 'react-router';
import VisitPrepCard from '../../components/VisitPrepCard';
import SummaryContent from '../../components/SummaryContent';
import { useApi } from '../../hooks/useApi';
import { fetchTechnicianEvents, fetchTechnicianQueue, submitEventTriage } from '../../data/api';

type EventStatus = 'pending' | 'confirmed' | 'dismissed';

const eventTypeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  'Mask Leak': { icon: <Droplets className="w-5 h-5" />, color: 'text-[#E76F51]', bg: 'bg-[#E76F51]' },
  'Usage Drop': { icon: <Moon className="w-5 h-5" />, color: 'text-[#F4A261]', bg: 'bg-[#F4A261]' },
  'Missed Nights': { icon: <AlertTriangle className="w-5 h-5" />, color: 'text-[#F4A261]', bg: 'bg-[#F4A261]' },
  'Equipment Alert': { icon: <Wrench className="w-5 h-5" />, color: 'text-[#2D9596]', bg: 'bg-[#2D9596]' },
  'Patient Self-Report': { icon: <MessageSquare className="w-5 h-5" />, color: 'text-[#2D9596]', bg: 'bg-[#2D9596]' },
};

const clusterColors: Record<string, string> = {
  'Adherent': 'bg-[#6A994E]/10 text-[#6A994E]',
  'Attempting': 'bg-[#F4A261]/10 text-[#F4A261]',
  'Struggling': 'bg-[#E76F51]/10 text-[#E76F51]',
  'Dropout': 'bg-[#0A1128]/10 text-[#0A1128]',
};

export default function TechnicianHome() {
  const [activeTab, setActiveTab] = useState<'events' | 'queue'>('events');
  
  const { data: eventsData, isLoading: isLoadingEvents, error: eventError, refetch: refetchEvents } = useApi<any>(() => fetchTechnicianEvents());
  const { data: queueData, isLoading: isLoadingQueue, error: queueError } = useApi<any>(() => fetchTechnicianQueue());

  const events: any[] = Array.isArray(eventsData) ? eventsData : ((eventsData as any)?.events || []);
  const queue: any[] = Array.isArray(queueData) ? queueData : ((queueData as any)?.patients || (queueData as any)?.queue || []);
  const isLive = !eventError && !!eventsData;


  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedQueuePatientId, setSelectedQueuePatientId] = useState<number | null>(null);

  useEffect(() => {
    if (events.length > 0 && selectedEventId === null) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  useEffect(() => {
    if (queue.length > 0 && selectedQueuePatientId === null) {
      setSelectedQueuePatientId(queue[0].id);
    }
  }, [queue, selectedQueuePatientId]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dismissingId, setDismissingId] = useState<number | null>(null);
  const [dismissReason, setDismissReason] = useState('');

  const handleTriage = async (eventId: number, action: 'VALIDATE' | 'DISMISS') => {
    setIsSubmitting(true);
    try {
      await submitEventTriage(eventId, {
        action,
        technician_id: 'TECH-001',
        notes: action === 'DISMISS' ? dismissReason : 'Validated by technician'
      });
      alert(`Event ${action === 'VALIDATE' ? 'Confirmed' : 'Dismissed'} Successfully`);
      refetchEvents();
      setDismissingId(null);
      setDismissReason('');
    } catch (err) {
      alert('Failed to submit triage.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const selectedEvent = events.find((e: any) => e.id === selectedEventId);
  const selectedQueuePatient = queue.find((p: any) => p.id === selectedQueuePatientId);

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] overflow-hidden">
      {/* Top Header / Stats Row */}
      <div className="bg-white border-b border-[#E8EEF2] px-8 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#0A1128]">Technician Workbench</h1>
            <p className="text-xs text-[#5A6B7C]">Linde Clinical Logistics Platform v4.0</p>
          </div>
          {isLive && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-[#6A994E]/10 border border-[#6A994E]/20 rounded-md">
              <Signal className="w-3 h-3 text-[#6A994E]" />
              <span className="text-[10px] font-bold text-[#6A994E] uppercase tracking-wider">Live</span>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          {[
            { label: 'AI Resolved (24h)', val: '88%', color: 'text-[#6A994E]' },
            { label: 'Retention Queue', val: queue.length, color: 'text-[#2D9596]' },
            { label: 'Escalated Risks', val: queue.filter((p: any) => p.dropoutRisk > 80).length, color: 'text-[#E76F51]' }
          ].map(stat => (
            <div key={stat.label} className="bg-[#FAFAFA] px-4 py-2 rounded-lg border border-[#E8EEF2]">
              <p className="text-[10px] uppercase font-bold text-[#5A6B7C] tracking-wide">{stat.label}</p>
              <p className={`text-lg font-bold ${stat.color}`}>{stat.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="px-8 pt-4 bg-white border-b border-[#E8EEF2] shrink-0">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('events')}
            className={`pb-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'events' ? 'border-[#E76F51] text-[#E76F51]' : 'border-transparent text-[#5A6B7C] hover:text-[#0A1128]'}`}
          >
            Mechanical/Self-Report Inbox ({events.filter((e: any) => e.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`pb-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'queue' ? 'border-[#2D9596] text-[#2D9596]' : 'border-transparent text-[#5A6B7C] hover:text-[#0A1128]'}`}
          >
            Therapy Retention Queue ({queue.length})
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'events' ? (
          <div className="flex h-full animate-in fade-in duration-500">
            {/* Master List (Events) */}
            <div className="w-1/3 xl:w-1/4 border-r border-[#E8EEF2] bg-white flex flex-col overflow-hidden">
              <div className="flex-1 overflow-auto divide-y divide-[#E8EEF2]">
                {events.length > 0 ? (
                  events
                    .filter((e: any) => e.status !== 'dismissed')
                    .map((event: any) => {
                    const config = eventTypeConfig[event.type] || eventTypeConfig['Equipment Alert'];
                    const isConfirmed = event.status === 'confirmed';
                    return (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEventId(event.id)}
                        className={`p-6 cursor-pointer transition-all border-l-4 ${selectedEventId === event.id ? 'bg-[#E8EEF2]/30 border-[#E76F51]' : 'border-transparent hover:bg-[#FAFAFA]'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className={`p-1.5 rounded-lg ${config.bg}/10 ${config.color}`}>
                            {config.icon}
                          </div>
                          <span className="text-[10px] text-[#5A6B7C]">{formatTime(event.detectedAt)}</span>
                        </div>
                        <p className="text-sm font-bold text-[#0A1128] mb-1">{event.patient.name}</p>
                        <p className={`text-xs font-semibold uppercase tracking-wide ${isConfirmed ? 'text-[#6A994E]' : 'text-[#E76F51]'}`}>
                          {isConfirmed ? 'Validated' : event.type}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-10 text-center">
                    <CheckCircle className="w-10 h-10 text-[#6A994E] mx-auto mb-4 opacity-20" />
                    <p className="text-sm font-bold text-[#0A1128]">Inbox Clear</p>
                    <p className="text-xs text-[#5A6B7C]">No pending mechanical alerts.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Detail View (Events) */}
            <div className="flex-1 overflow-auto bg-white">
              {selectedEvent ? (
                <div className="p-10 max-w-4xl animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex justify-between items-start mb-10">
                    <div className="flex items-center gap-6">
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${eventTypeConfig[selectedEvent.type]?.bg || 'bg-[#2D9596]'}/10`}>
                        {React.cloneElement((eventTypeConfig[selectedEvent.type] || eventTypeConfig['Equipment Alert']).icon as React.ReactElement<any>, { className: "w-10 h-10 " + (eventTypeConfig[selectedEvent.type] || eventTypeConfig['Equipment Alert']).color })}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h2 className="text-3xl font-bold text-[#0A1128]">{selectedEvent.patient.name}</h2>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${selectedEvent.severity === 'high' ? 'bg-[#E76F51]/10 text-[#E76F51]' : 'bg-[#F4A261]/10 text-[#F4A261]'}`}>
                            {selectedEvent.severity} Priority
                          </span>
                        </div>
                        <p className="text-[#5A6B7C] flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {selectedEvent.patient.address}</span>
                          <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {selectedEvent.patient.phone}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {selectedEvent.status === 'pending' ? (
                        <>
                          <button 
                            onClick={() => setDismissingId(selectedEvent.id)}
                            className="px-6 py-3 bg-white border-2 border-[#E8EEF2] text-[#5A6B7C] font-bold rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all flex items-center gap-2"
                          >
                            <XCircle className="w-4 h-4" /> Dismiss
                          </button>
                          <button 
                            onClick={() => handleTriage(selectedEvent.id, 'VALIDATE')}
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-[#E76F51] text-white font-bold rounded-xl shadow-lg shadow-[#E76F51]/20 hover:scale-105 transition-all active:scale-95 flex items-center gap-2"
                          >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                            Submit Event Triage
                          </button>
                        </>
                      ) : (
                        <div className="px-6 py-3 bg-[#6A994E]/10 text-[#6A994E] border-2 border-[#6A994E]/20 font-bold rounded-xl flex items-center gap-2">
                           <CheckCircle className="w-4 h-4" /> Action Logged
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-10">
                    <div className="bg-[#FAFAFA] rounded-2xl p-6 border border-[#E8EEF2]">
                      <h4 className="text-xs font-bold text-[#5A6B7C] uppercase tracking-widest mb-4">Evidence Package</h4>
                      <p className="text-[#0A1128] text-sm leading-relaxed italic">"{selectedEvent.evidence}"</p>
                    </div>
                    <div className="bg-[#0A1128] rounded-2xl p-6 text-white">
                      <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">AI Analysis Note</h4>
                      <p className="text-sm leading-relaxed">{selectedEvent.aiNote}</p>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <SummaryContent patientId={selectedEvent.patient.patientId.toString()} isCompact role="technician" hideHeader />
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-40">
                  <Droplets className="w-20 h-20 text-[#2D9596] mb-4" />
                  <p className="text-lg font-bold">Select an event to triage</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-full animate-in fade-in duration-500">
            {/* Master List (Queue) */}
            <div className="w-1/3 xl:w-1/4 border-r border-[#E8EEF2] bg-white flex flex-col overflow-hidden">
               <div className="p-6 border-b border-[#E8EEF2]">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5A6B7C]" />
                    <input type="text" placeholder="Search retention queue..." className="w-full bg-[#FAFAFA] border border-[#E8EEF2] rounded-lg py-2 pl-10 pr-4 text-xs focus:ring-1 focus:ring-[#2D9596] outline-none" />
                  </div>
               </div>
               <div className="flex-1 overflow-auto divide-y divide-[#E8EEF2]">
                {queue.map((patient: any) => (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedQueuePatientId(patient.id)}
                    className={`p-6 cursor-pointer transition-all border-l-4 ${selectedQueuePatientId === patient.id ? 'border-[#2D9596] bg-[#2D9596]/5' : 'border-transparent hover:bg-[#FAFAFA]'}`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-sm font-bold text-[#0A1128]">{patient.patientName}</h3>
                      <span className={`text-xs font-bold ${patient.dropoutRisk > 80 ? 'text-[#E76F51]' : 'text-[#2D9596]'}`}>
                        {patient.dropoutRisk}% Risk
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-[#5A6B7C]">
                      <span>Avg: {patient.usageHours}h</span>
                      <span>{patient.postalCode}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tighter ${clusterColors[patient.behavioralCluster as keyof typeof clusterColors] || 'bg-[#FAFAFA] text-[#5A6B7C]'}`}>
                        {patient.behavioralCluster}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tighter bg-[#0A1128] text-white flex items-center gap-1 shadow-sm">
                        <Wrench className="w-2.5 h-2.5 text-[#F4A261]" /> Action: {patient.dropoutRisk > 80 ? 'O7 - Home Visit' : 'O2 - Remote Fix'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detail View (Queue) */}
            <div className="flex-1 overflow-auto bg-[#FAFAFA] p-10">
              {selectedQueuePatient ? (
                <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
                  <VisitPrepCard patient={selectedQueuePatient} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-40">
                  <Users className="w-20 h-20 text-[#2D9596] mb-4" />
                  <p className="text-lg font-bold">Select a patient to review</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dismiss Confirmation Modal */}
      {dismissingId && (
        <div className="fixed inset-0 bg-[#0A1128]/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full animate-in zoom-in-95 duration-200 border-t-8 border-[#E76F51]">
            <h3 className="text-xl font-bold text-[#0A1128] mb-2">Dismiss Event</h3>
            <p className="text-sm text-[#5A6B7C] mb-6">Please provide a reason for clinical dismissal (e.g., False Positive, Already Resolved).</p>
            <textarea 
              autoFocus
              value={dismissReason}
              onChange={(e) => setDismissReason(e.target.value)}
              className="w-full h-24 p-3 bg-[#FAFAFA] border border-[#E8EEF2] rounded-xl mb-6 text-sm focus:ring-2 focus:ring-[#E76F51] outline-none"
              placeholder="Mandatory reason for audit trail..."
            />
            <div className="flex gap-3">
              <button onClick={() => setDismissingId(null)} className="flex-1 py-4 bg-[#E8EEF2] text-[#5A6B7C] font-bold rounded-xl active:scale-95 transition-transform">Cancel</button>
              <button 
                onClick={() => handleTriage(dismissingId, 'DISMISS')} 
                disabled={!dismissReason || isSubmitting}
                className="flex-1 py-4 bg-[#E76F51] text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform disabled:opacity-40"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
