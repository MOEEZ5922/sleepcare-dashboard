import React, { useState } from 'react';
import {
  AlertTriangle,
  Droplets,
  Moon,
  Wrench,
  CheckCircle,
  XCircle,
  Phone,
  MapPin,
  Search,
  Filter,
  Activity,
  ChevronRight,
  MessageSquare,
  Signal,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { useApi } from '../../hooks/useApi';
import {
  fetchTechnicianEvents,
  fetchTechnicianQueue,
  submitEventTriage,
  TechnicianEvent,
  TechnicianQueuePatient,
  isLiveResponse
} from '../../data/api';

const eventTypeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  'Mask Leak': { icon: <Droplets className="w-5 h-5" />, color: 'text-coral', bg: 'bg-coral' },
  'Usage Drop': { icon: <Moon className="w-5 h-5" />, color: 'text-amber', bg: 'bg-amber' },
  'Missed Nights': { icon: <AlertTriangle className="w-5 h-5" />, color: 'text-amber', bg: 'bg-amber' },
  'Equipment Alert': { icon: <Wrench className="w-5 h-5" />, color: 'text-teal', bg: 'bg-teal' },
  'Patient Self-Report': { icon: <MessageSquare className="w-5 h-5" />, color: 'text-teal', bg: 'bg-teal' },
};

const clusterColors: Record<string, string> = {
  'Adherent': 'bg-sage/10 text-sage',
  'Attempting': 'bg-amber/10 text-amber',
  'Struggling': 'bg-coral/10 text-coral',
  'Dropout': 'bg-navy/10 text-navy',
};

export default function TechnicianHome() {
  const [activeTab, setActiveTab] = useState<'events' | 'queue'>('events');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: eventsData, isLoading: isLoadingEvents, refetch: refetchEvents } = useApi<TechnicianEvent[]>(
    () => fetchTechnicianEvents(),
    { cacheKey: 'technician-events' }
  );
  const { data: queueData, isLoading: isLoadingQueue } = useApi<TechnicianQueuePatient[]>(
    () => fetchTechnicianQueue(),
    { cacheKey: 'technician-queue' }
  );

  const events: TechnicianEvent[] = Array.isArray(eventsData)
    ? eventsData
    : ((eventsData as unknown as { events?: TechnicianEvent[] })?.events || []);
  const rawQueue: TechnicianQueuePatient[] = Array.isArray(queueData)
    ? queueData
    : ((queueData as unknown as { patients?: TechnicianQueuePatient[]; queue?: TechnicianQueuePatient[] })?.patients ||
       (queueData as unknown as { queue?: TechnicianQueuePatient[] })?.queue || []);
  const queue = [...rawQueue].sort((a, b) => (b.dropoutRisk || 0) - (a.dropoutRisk || 0));
  const isLive = isLiveResponse(eventsData);

  const filteredEvents = events.filter((e) =>
    e.status !== 'dismissed' && (
      e.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(e.patient.patientId).includes(searchTerm) ||
      e.type.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const filteredQueue = queue.filter((p) =>
    p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(p.id).includes(searchTerm)
  );

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
      toast.success(`Event ${action === 'VALIDATE' ? 'Confirmed' : 'Dismissed'} Successfully`);
      refetchEvents();
      setDismissingId(null);
      setDismissReason('');
    } catch (err) {
      toast.error('Failed to submit triage.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (isLoadingEvents && isLoadingQueue && !eventsData && !queueData) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-card">
        <Loader2 className="w-8 h-8 text-amber animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <div className="bg-card border-b border-light-blue px-8 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-navy">Technician Workbench</h1>
            <p className="text-xs text-slate-muted">Linde Clinical Logistics Platform v4.0</p>
          </div>
          {isLive && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-sage/10 border border-sage/20 rounded-md">
              <Signal className="w-3 h-3 text-sage" />
              <span className="text-[10px] font-bold text-sage uppercase tracking-wider">Live</span>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          {[
            { label: 'Retention Queue', val: queue.length, color: 'text-teal' },
            { label: 'Escalated Risks', val: queue.filter((p) => (p.dropoutRisk || 0) > 80).length, color: 'text-coral' }
          ].map(stat => (
            <div key={stat.label} className="bg-background px-4 py-2 rounded-lg border border-light-blue">
              <p className="text-[10px] uppercase font-bold text-slate-muted tracking-wide">{stat.label}</p>
              <p className={`text-lg font-bold ${stat.color}`}>{stat.val}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border-b border-light-blue px-8 py-2 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('events')}
            className={`pb-4 pt-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'events' ? 'border-coral text-coral' : 'border-transparent text-slate-muted hover:text-navy'}`}
          >
            Mechanical/Self-Report Inbox ({events.filter((e) => e.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`pb-4 pt-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'queue' ? 'border-teal text-teal' : 'border-transparent text-slate-muted hover:text-navy'}`}
          >
            Therapy Retention Queue ({queue.length})
          </button>
        </div>

        <div className="flex items-center gap-3 pb-2 md:pb-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-muted" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, ID or type..." 
              className="bg-background border border-light-blue rounded-xl py-2 pl-10 pr-4 text-xs w-64 focus:ring-1 focus:ring-teal outline-none transition-all shadow-sm" 
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-light-blue rounded-xl text-xs text-slate-muted hover:bg-background transition-colors bg-card shadow-sm">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'events' ? (
            <div className="space-y-4">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => {
                  const config = eventTypeConfig[event.type] || eventTypeConfig['Equipment Alert'];
                  
                  return (
                    <div
                      key={event.id}
                      className="bg-card rounded-2xl p-6 border border-light-blue shadow-sm hover:shadow-md transition-all flex flex-col gap-6"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${config.bg}/10 ${config.color}`}>
                            {config.icon}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <Link 
                                to={`/technician/patient/${event.patient.patientId}`}
                                className="text-lg font-bold text-navy hover:text-amber transition-colors"
                              >
                                {event.patient.name}
                              </Link>
                              <span className="text-xs font-mono text-slate-muted">Patient ID: {event.patient.patientId}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                                event.severity === 'high' ? 'bg-coral/10 text-coral' : 'bg-amber/10 text-amber'
                              }`}>
                                {event.severity} Priority
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-muted mt-2">
                              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {event.patient.address}</span>
                              <span className="w-1.5 h-1.5 bg-light-blue rounded-full hidden sm:inline" />
                              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {event.patient.phone}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end shrink-0 w-full sm:w-auto">
                          <span className="text-[10px] text-slate-muted uppercase font-bold tracking-wider mb-1">Detected At</span>
                          <span className="text-xs font-semibold text-navy">{formatTime(event.detectedAt)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-background rounded-xl p-4 border border-light-blue">
                          <span className="text-[10px] font-bold text-slate-muted uppercase tracking-wider block mb-1">Evidence Package</span>
                          <p className="text-xs text-navy font-medium leading-relaxed italic">"{event.evidence}"</p>
                        </div>
                        <div className="bg-navy rounded-xl p-4 text-white">
                          <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider block mb-1">AI Recommendation & Notes</span>
                          <p className="text-xs text-white/90 leading-relaxed">{event.aiNote}</p>
                        </div>
                      </div>

                      <div className="border-t border-light-blue pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-muted">Suggested Action:</span>
                          <span className="text-xs font-bold text-amber">{event.suggestedAction}</span>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                          <Link
                            to={`/technician/patient/${event.patient.patientId}`}
                            className="px-4 py-2 border border-light-blue rounded-xl text-xs font-bold text-slate-muted hover:bg-background transition-all flex items-center gap-1.5"
                          >
                            Open Workbench <ChevronRight className="w-3.5 h-3.5" />
                          </Link>

                          {event.status === 'pending' ? (
                            <>
                              <button 
                                onClick={() => setDismissingId(event.id)}
                                className="px-4 py-2 bg-card border border-red-200 text-red-500 font-bold rounded-xl hover:bg-red-50 transition-all flex items-center gap-1 text-xs"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Dismiss
                              </button>
                              <button 
                                onClick={() => handleTriage(event.id, 'VALIDATE')}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-coral text-white font-bold rounded-xl hover:scale-[1.02] active:scale-98 transition-all flex items-center gap-1 text-xs"
                              >
                                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                Confirm Triage
                              </button>
                            </>
                          ) : (
                            <div className="px-4 py-2 bg-sage/10 text-sage border border-sage/20 font-bold rounded-xl flex items-center gap-1 text-xs">
                              <CheckCircle className="w-3.5 h-3.5" /> Action Logged
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-card rounded-2xl border border-light-blue p-16 text-center shadow-sm">
                  <CheckCircle className="w-16 h-16 text-sage mx-auto mb-4 opacity-30" />
                  <h4 className="text-lg font-bold text-navy mb-1">Inbox Clear</h4>
                  <p className="text-sm text-slate-muted max-w-sm mx-auto leading-relaxed">
                    {searchTerm ? 'No pending alerts matching your search.' : 'No pending mechanical alerts requiring technical diagnostics.'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQueue.length > 0 ? (
                filteredQueue.map((patient) => (
                  <div
                    key={patient.id}
                    className="bg-card rounded-2xl p-6 border border-light-blue shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center shrink-0">
                        <Activity className="w-6 h-6 text-teal" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <Link 
                            to={`/technician/patient/${patient.id}`}
                            className="text-lg font-bold text-navy hover:text-teal transition-colors"
                          >
                            {patient.patientName}
                          </Link>
                          <span className="text-xs font-mono text-slate-muted">ID: {patient.id}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-muted mt-2">
                          <span>Avg Usage: {patient.usageHours}h/night ({patient.usageCategory})</span>
                          <span className="w-1.5 h-1.5 bg-light-blue rounded-full" />
                          <span>Postal Code: {patient.postalCode}</span>
                          <span className="w-1.5 h-1.5 bg-light-blue rounded-full" />
                          <span>Last Contact: {patient.lastContact || 'Never'}</span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${clusterColors[patient.behavioralCluster] || 'bg-background text-slate-muted'}`}>
                            {patient.behavioralCluster}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-navy text-white flex items-center gap-1">
                            <Wrench className="w-3 h-3 text-amber" /> Action: {patient.dropoutRisk > 80 ? 'O7 - Home Visit' : 'O2 - Remote Fix'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0 shrink-0 w-full sm:w-auto">
                      <div className="text-right">
                        <p className="text-xs text-slate-muted uppercase tracking-wider">Dropout Risk</p>
                        <p className={`text-2xl font-black ${patient.dropoutRisk > 80 ? 'text-coral' : 'text-teal'}`}>
                          {patient.dropoutRisk}%
                        </p>
                      </div>
                      <Link
                        to={`/technician/patient/${patient.id}`}
                        className="px-4 py-3 bg-teal hover:bg-teal/90 text-white rounded-xl font-bold text-xs shadow-md transition-all hover:scale-[1.02] active:scale-98 flex items-center gap-1"
                      >
                        Open Workbench <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-card rounded-2xl border border-light-blue p-16 text-center shadow-sm">
                  <Moon className="w-16 h-16 text-teal mx-auto mb-4 opacity-30" />
                  <h4 className="text-lg font-bold text-navy mb-1">Queue Clear</h4>
                  <p className="text-sm text-slate-muted max-w-sm mx-auto leading-relaxed">
                    {searchTerm ? 'No retention metrics matching your search.' : 'All patients meet adherence guidelines.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {dismissingId && (
        <div className="fixed inset-0 bg-navy/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-card rounded-2xl shadow-2xl p-8 max-w-sm w-full border-t-8 border-coral">
            <h3 className="text-xl font-bold text-navy mb-2">Dismiss Event</h3>
            <p className="text-sm text-slate-muted mb-6">Please provide a reason for clinical dismissal (e.g., False Positive, Already Resolved).</p>
            <textarea 
              autoFocus
              value={dismissReason}
              onChange={(e) => setDismissReason(e.target.value)}
              className="w-full h-24 p-3 bg-background border border-light-blue rounded-xl mb-6 text-sm focus:ring-2 focus:ring-coral outline-none"
              placeholder="Mandatory reason for audit trail..."
            />
            <div className="flex gap-3">
              <button onClick={() => setDismissingId(null)} className="flex-1 py-3 bg-light-blue text-slate-muted font-bold rounded-xl active:scale-95 transition-transform text-xs">Cancel</button>
              <button 
                onClick={() => handleTriage(dismissingId, 'DISMISS')} 
                disabled={!dismissReason || isSubmitting}
                className="flex-1 py-3 bg-coral text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform disabled:opacity-40 text-xs"
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
