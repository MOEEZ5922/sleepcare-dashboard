import { AlertTriangle, Calendar, ChevronRight, Activity, Search, Filter, Signal, Loader2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router';
import { useState } from 'react';
import { fetchPhysicianQueue, PhysicianQueue } from '../../data/api';
import { useApi } from '../../hooks/useApi';

export default function PhysicianHome() {
  const [activeTab, setActiveTab] = useState<'urgent' | 'annual'>('urgent');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use the scalable useApi hook
  const { data: queue, isLoading, error } = useApi<PhysicianQueue>(fetchPhysicianQueue, {
    cacheKey: 'physician-queue'
  });

  const isLive = !!(queue && (queue as any).__isLive);

  if (isLoading && !queue) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-white">
        <Loader2 className="w-8 h-8 text-teal animate-spin" />
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

  const rawUrgent = Array.isArray(queue.urgent) ? queue.urgent : [];
  const rawAnnual = Array.isArray(queue.annualReviews) ? queue.annualReviews : [];

  // Filter urgent & annual reviews by search term
  const urgentFiltered = rawUrgent.filter((p: any) =>
    p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(p.id).includes(searchTerm)
  );

  const annualFiltered = rawAnnual.filter((p: any) =>
    p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(p.id).includes(searchTerm)
  );

  const urgentCount = rawUrgent.length;
  const annualCount = rawAnnual.length;

  const getRiskColor = (score: number, category?: string) => {
    if (category === 'Tech Escalation') return 'text-[#9b59b6]';
    if (score >= 80) return 'text-[#E76F51]';
    if (score >= 70) return 'text-[#F4A261]';
    return 'text-[#6A994E]';
  };

  const getRiskBg = (score: number, category?: string) => {
    if (category === 'Tech Escalation') return 'bg-[#9b59b6]/10 border-[#9b59b6]/20';
    if (score >= 80) return 'bg-[#E76F51]/10 border-[#E76F51]/20';
    if (score >= 70) return 'bg-[#F4A261]/10 border-[#F4A261]/20';
    return 'bg-[#6A994E]/10 border-[#6A994E]/20';
  };

  return (
    <div className="h-full bg-[#FAFAFA] flex flex-col overflow-hidden">
      {/* Header and Filter Row */}
      <div className="bg-white border-b border-[#E8EEF2] p-8 shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#0A1128]">Exception Inbox</h1>
              {isLive && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#6A994E]/10 border border-[#6A994E]/20 rounded-md">
                  <Signal className="w-3 h-3 text-[#6A994E]" />
                  <span className="text-[10px] font-bold text-[#6A994E] uppercase tracking-wider">Live</span>
                </div>
              )}
            </div>
            <p className="text-sm text-[#5A6B7C] mt-1">AI-filtered clinical exceptions and compliance alerts</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6B7C]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search patient name or ID..."
                className="pl-10 pr-4 py-2 bg-[#FAFAFA] border border-[#E8EEF2] rounded-xl focus:outline-none focus:border-[#2D9596] text-sm w-64 shadow-sm transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-[#E8EEF2] rounded-xl text-sm text-[#5A6B7C] hover:bg-[#FAFAFA] transition-colors bg-white">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Selector Bar */}
      <div className="bg-white border-b border-[#E8EEF2] px-8 shrink-0">
        <div className="max-w-6xl mx-auto flex gap-8">
          <button
            onClick={() => setActiveTab('urgent')}
            className={`pb-4 pt-2 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'urgent' ? 'border-[#E76F51] text-[#E76F51]' : 'border-transparent text-[#5A6B7C] hover:text-[#0A1128]'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Urgent Clinical Alerts ({urgentCount})
          </button>
          <button
            onClick={() => setActiveTab('annual')}
            className={`pb-4 pt-2 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'annual' ? 'border-[#2D9596] text-[#2D9596]' : 'border-transparent text-[#5A6B7C] hover:text-[#0A1128]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Annual Reviews Due ({annualCount})
          </button>
        </div>
      </div>

      {/* Scrolling Content Feed */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'urgent' ? (
            <div className="space-y-4">
              {urgentFiltered.length > 0 ? (
                urgentFiltered.map((patient) => (
                  <Link
                    key={patient.id}
                    to={`/physician/patient/${patient.id}`}
                    className="block bg-white rounded-2xl p-6 border border-[#E8EEF2] shadow-sm hover:shadow-md hover:border-[#2D9596]/30 transition-all group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${getRiskBg(patient.riskScore, patient.category)}`}>
                          <AlertTriangle className={`w-6 h-6 ${getRiskColor(patient.riskScore, patient.category)}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-[#0A1128] group-hover:text-[#2D9596] transition-colors">{patient.patientName}</h3>
                            <span className="text-xs font-mono text-[#5A6B7C]">ID: {patient.id}</span>
                          </div>
                          <p className="text-sm font-medium text-[#E76F51] mt-1">{patient.reason}</p>
                          <div className="flex items-center gap-4 text-xs text-[#5A6B7C] mt-2">
                            <span>Escalated {patient.daysActive} days ago</span>
                            <span className="w-1.5 h-1.5 bg-[#E8EEF2] rounded-full" />
                            <span className="font-bold uppercase tracking-wider text-[10px]">{patient.category}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0">
                        <div className="text-right">
                          <p className="text-xs text-[#5A6B7C] uppercase tracking-wider">AI Risk Score</p>
                          <p className={`text-2xl font-black ${getRiskColor(patient.riskScore, patient.category)}`}>
                            {typeof patient.riskScore === 'number' ? Math.round(patient.riskScore) : patient.riskScore}/100
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#FAFAFA] flex items-center justify-center text-[#5A6B7C] group-hover:bg-[#2D9596] group-hover:text-white transition-all">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="bg-white rounded-2xl border border-[#E8EEF2] p-16 text-center shadow-sm">
                  <CheckCircle className="w-16 h-16 text-[#6A994E] mx-auto mb-4 opacity-30" />
                  <h4 className="text-lg font-bold text-[#0A1128] mb-1">Queue Clear</h4>
                  <p className="text-sm text-[#5A6B7C] max-w-sm mx-auto leading-relaxed">
                    {searchTerm ? 'No urgent clinical exceptions matching your search.' : 'No urgent clinical exceptions requiring immediate attention.'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {annualFiltered.length > 0 ? (
                annualFiltered.map((patient) => (
                  <Link
                    key={patient.id}
                    to={`/physician/patient/${patient.id}`}
                    className="block bg-white rounded-2xl p-6 border border-[#E8EEF2] shadow-sm hover:shadow-md hover:border-[#2D9596]/30 transition-all group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#2D9596]/10 border border-[#2D9596]/20 flex items-center justify-center shrink-0">
                          <Calendar className="w-6 h-6 text-[#2D9596]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-[#0A1128] group-hover:text-[#2D9596] transition-colors">{patient.patientName}</h3>
                            <span className="text-xs font-mono text-[#5A6B7C]">ID: {patient.id}</span>
                          </div>
                          <p className="text-sm text-[#5A6B7C] mt-1">
                            Therapy started: {new Date(patient.therapyStart).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-[#5A6B7C] mt-2">
                            <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-tight text-[10px] ${
                              patient.status === 'Overdue' ? 'bg-[#E76F51]/10 text-[#E76F51]' : 'bg-[#F4A261]/10 text-[#F4A261]'
                            }`}>
                              {patient.status}
                            </span>
                            <span className="w-1.5 h-1.5 bg-[#E8EEF2] rounded-full" />
                            <span className="font-semibold text-[#E76F51]">
                              {patient.daysUntilDue < 0 ? `Overdue by ${Math.abs(patient.daysUntilDue)} days` : `Due in ${patient.daysUntilDue} days`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0">
                        <div className="text-right">
                          <p className="text-xs text-[#5A6B7C] uppercase tracking-wider">Historical Risk</p>
                          <p className="text-2xl font-bold text-[#0A1128]">{patient.riskScore}%</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#FAFAFA] flex items-center justify-center text-[#5A6B7C] group-hover:bg-[#2D9596] group-hover:text-white transition-all">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="bg-white rounded-2xl border border-[#E8EEF2] p-16 text-center shadow-sm">
                  <Calendar className="w-16 h-16 text-[#2D9596] mx-auto mb-4 opacity-30" />
                  <h4 className="text-lg font-bold text-[#0A1128] mb-1">No Reviews Due</h4>
                  <p className="text-sm text-[#5A6B7C] max-w-sm mx-auto leading-relaxed">
                    {searchTerm ? 'No annual reviews matching your search.' : 'All annual therapy reviews are currently up to date.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
