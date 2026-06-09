import { AlertTriangle, Calendar, ChevronRight, Activity, Search, Filter, Signal, Loader2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router';
import { useState, useEffect, useMemo } from 'react';
import SummaryContent from '../../components/SummaryContent';
import { fetchPhysicianQueue, PhysicianQueue } from '../../data/api';
import { useApi } from '../../hooks/useApi';

export default function PhysicianHome() {
  const [activeTab, setActiveTab] = useState<'urgent' | 'annual'>('urgent');
  
  // Use the scalable useApi hook
  const { data: queue, isLoading, error } = useApi<PhysicianQueue>(fetchPhysicianQueue, {
    cacheKey: 'physician-queue'
  });

  const isLive = !error && !!queue;
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  // Set initial selected patient and tab when queue loads
  useEffect(() => {
    if (queue && !selectedPatientId) {
      const firstUrgent = queue.urgent?.[0];
      const firstAnnual = queue.annualReviews?.[0];
      
      if (firstUrgent) {
        setSelectedPatientId(firstUrgent.id);
        setActiveTab('urgent');
      } else if (firstAnnual) {
        setSelectedPatientId(firstAnnual.id);
        setActiveTab('annual');
      }
    }
  }, [queue, selectedPatientId]);

  if (isLoading && !queue) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-white">
        <Loader2 className="w-8 h-8 text-[#E76F51] animate-spin" />
      </div>
    );
  }

  if (!queue) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-white text-[#5A6B7C]">
        <p>No clinical escalations found in inbox.</p>
      </div>
    );
  }

  const urgentCount = Array.isArray(queue.urgent) ? queue.urgent.length : 0;
  const annualCount = Array.isArray(queue.annualReviews) ? queue.annualReviews.length : 0;


  const getRiskColor = (score: number, category?: string) => {
    if (category === 'Tech Escalation') return 'text-[#9b59b6]';
    if (score >= 80) return 'text-[#E76F51]';
    if (score >= 70) return 'text-[#F4A261]';
    return 'text-[#6A994E]';
  };

  return (
    <div className="flex h-full bg-[#FAFAFA] overflow-hidden">
      
      {/* Left Pane: Patient List (Master) */}
      <div className="w-1/3 xl:w-1/4 border-r border-[#E8EEF2] bg-white flex flex-col min-w-[380px]">
        {/* Header with Search/Filter */}
        <div className="p-6 border-b border-[#E8EEF2] flex items-center justify-between bg-white shrink-0">
          <div>
            <h1 className="text-xl font-bold text-[#0A1128]">Exception Inbox</h1>
            <p className="text-xs text-[#5A6B7C]">AI-filtered clinical escalations</p>
          </div>
          {isLive && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-[#6A994E]/10 border border-[#6A994E]/20 rounded-md">
              <Signal className="w-3 h-3 text-[#6A994E]" />
              <span className="text-[10px] font-bold text-[#6A994E] uppercase tracking-wider">Live</span>
            </div>
          )}
        </div>

        <div className="p-6 border-b border-[#E8EEF2] space-y-4">
          
          <div className="flex gap-2 bg-[#E8EEF2]/50 p-1 rounded-lg">
            <button
              onClick={() => {
                setActiveTab('urgent');
                setSelectedPatientId(queue.urgent?.[0]?.id || null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === 'urgent' ? 'bg-white shadow text-[#E76F51]' : 'text-[#5A6B7C]'}`}
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Urgent ({urgentCount})
            </button>
            <button
              onClick={() => {
                setActiveTab('annual');
                setSelectedPatientId(queue.annualReviews?.[0]?.id || null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === 'annual' ? 'bg-white shadow text-[#2D9596]' : 'text-[#5A6B7C]'}`}
            >
              <Calendar className="w-3.5 h-3.5" /> Reviews ({annualCount})
            </button>
          </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-auto">
          {activeTab === 'urgent' ? (
            <div className="divide-y divide-[#E8EEF2]">
              {urgentCount > 0 ? (
                queue.urgent.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatientId(patient.id)}
                    className={`p-5 cursor-pointer transition-all border-l-4 ${
                      selectedPatientId === patient.id 
                        ? 'bg-[#E8EEF2]/30 border-[#E76F51]' 
                        : 'border-transparent hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-[#0A1128]">{patient.patientName}</h3>
                      <span className={`text-xs font-bold ${getRiskColor(patient.riskScore, patient.category)}`}>
                        {typeof patient.riskScore === 'number' ? Math.round(patient.riskScore) : patient.riskScore}/100
                      </span>
                    </div>
                    <p className={`text-xs font-medium mb-2 line-clamp-1 ${patient.category === 'Tech Escalation' ? 'text-[#9b59b6]' : 'text-[#E76F51]'}`}>
                      {patient.reason}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-[#5A6B7C]">
                      <span>Escalated {patient.daysActive}d ago</span>
                      <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-tight ${
                        patient.category === 'Tech Escalation' ? 'bg-[#9b59b6]/10 text-[#9b59b6]' : 'bg-[#E8EEF2]'
                      }`}>
                        {patient.category}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <CheckCircle className="w-12 h-12 text-[#6A994E] mx-auto mb-4 opacity-20" />
                  <h4 className="text-sm font-bold text-[#0A1128] mb-1">Queue Clear</h4>
                  <p className="text-[11px] text-[#5A6B7C] leading-relaxed">No urgent clinical exceptions requiring immediate intervention.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-[#E8EEF2]">
               {annualCount > 0 ? (
                 queue.annualReviews.map((patient) => (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatientId(patient.id)}
                    className={`p-5 cursor-pointer transition-all border-l-4 ${
                      selectedPatientId === patient.id 
                        ? 'bg-[#E8EEF2]/30 border-[#2D9596]' 
                        : 'border-transparent hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-[#0A1128]">{patient.patientName}</h3>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        patient.status === 'Overdue' ? 'bg-[#E76F51] text-white' : 'bg-[#F4A261] text-white'
                      }`}>
                        {patient.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#5A6B7C]">
                      <span>Due in {patient.daysUntilDue}d</span>
                      <span className="font-medium">Risk: {patient.riskScore}</span>
                    </div>
                  </div>
                ))
               ) : (
                <div className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-[#2D9596] mx-auto mb-4 opacity-20" />
                  <h4 className="text-sm font-bold text-[#0A1128] mb-1">No Reviews Due</h4>
                  <p className="text-[11px] text-[#5A6B7C] leading-relaxed">All annual therapy reviews are currently up to date.</p>
                </div>
               )}
            </div>
          )}
        </div>
      </div>

      {/* Right Pane: Quick Review Detail (Detail) */}
      <div className="flex-1 bg-white flex flex-col overflow-hidden">
        {selectedPatientId ? (
          <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Split Pane Header */}
            <div className="p-6 border-b border-[#E8EEF2] flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#2D9596]/10 rounded-full flex items-center justify-center">
                  <Activity className="w-6 h-6 text-[#2D9596]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#0A1128]">
                    {activeTab === 'urgent' 
                      ? queue.urgent.find(p => p.id === selectedPatientId)?.patientName 
                      : queue.annualReviews.find(p => p.id === selectedPatientId)?.patientName}
                  </h2>
                  <p className="text-xs text-[#5A6B7C]">
                    Clinical Decision Support Overview
                  </p>
                </div>
              </div>
              <Link
                to={`/physician/patient/${selectedPatientId}`}
                className="flex items-center gap-2 px-4 py-2 bg-[#2D9596] text-white rounded-lg hover:bg-[#247a7b] transition-all font-bold text-sm shadow-md"
              >
                Full Patient View
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            {/* Embedded Summary Content */}
            <div className="flex-1 overflow-auto bg-[#FAFAFA]">
              <SummaryContent patientId={selectedPatientId.toString()} isCompact={true} />
              
              <div className="p-8 pb-12">
                 <p className="text-[10px] text-center text-[#5A6B7C] uppercase tracking-widest leading-relaxed">
                   AI Exception Filtering Active • Lindē Clinical Platform v4.0
                 </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-[#5A6B7C]">
            <Activity className="w-16 h-16 opacity-10 mb-6" />
            <h2 className="text-xl font-bold text-[#0A1128] mb-2">No Patient Selected</h2>
            <p className="text-sm max-w-xs leading-relaxed">
              Select a patient from the exception list to start your 2-minute clinical review.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
