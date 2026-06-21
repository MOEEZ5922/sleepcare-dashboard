import { Outlet, Link, useLocation, useParams } from 'react-router';
import { ArrowLeft, Signal, Loader2, Brain, Activity, AlertTriangle, ShieldCheck, Calendar } from 'lucide-react';
import ConnectivityStatus from '../components/ui/ConnectivityStatus';
import { useApi } from '../hooks/useApi';
import { fetchPatientSummary } from '../data/api';

export default function PhysicianPatientLayout() {
  const location = useLocation();
  const { id } = useParams();

  const { data: summary, isLoading, error } = useApi(() => fetchPatientSummary(id || '1'), {
    dependencies: [id],
    cacheKey: `patient-summary-${id || '1'}`
  });

  const isLive = !!(summary && (summary as any).__isLive);

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-[#E76F51]';
    if (score >= 70) return 'text-[#F4A261]';
    return 'text-[#6A994E]';
  };

  const tabs = [
    { name: 'Clinical Summary', href: `/physician/patient/${id}` },
    { name: 'Trends', href: `/physician/patient/${id}/trends` },
    { name: 'Biomarkers', href: `/physician/patient/${id}/biomarkers` },
    { name: 'Interventions', href: `/physician/patient/${id}/interventions` },
    { name: 'Surveys', href: `/physician/patient/${id}/surveys` },
    { name: 'AI Analysis', href: `/physician/patient/${id}/ai-analysis` },
    { name: 'Reporting', href: `/physician/patient/${id}/reporting` },
  ];

  if (isLoading && !summary) {
    return (
      <div className="flex items-center justify-center h-full bg-[#FAFAFA]">
        <Loader2 className="w-8 h-8 text-[#2D9596] animate-spin" />
      </div>
    );
  }

  const patient = summary || {
    name: 'Unknown Patient',
    gender: '—',
    dob: '—',
    therapyStartDate: new Date().toISOString(),
    maskType: '—',
    riskScore: 0
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA]">
      {/* Patient Context Header */}
      <div className="bg-white border-b border-[#E8EEF2] px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <Link to="/physician" className="flex items-center gap-2 text-[#2D9596] hover:underline text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Inbox
          </Link>
          <div className="flex items-center gap-4">
             <div className="flex gap-2">
                <Link to="/physician" className="px-2 py-1 bg-[#2D9596]/10 text-[#2D9596] text-[10px] font-bold rounded hover:bg-[#2D9596]/20 transition-all uppercase tracking-tighter">MD</Link>
                <Link to="/technician" className="px-2 py-1 bg-[#F4A261]/10 text-[#F4A261] text-[10px] font-bold rounded hover:bg-[#F4A261]/20 transition-all uppercase tracking-tighter">TECH</Link>
                <Link to={`/patient/${id || '216753'}/home`} className="px-2 py-1 bg-[#6A994E]/10 text-[#6A994E] text-[10px] font-bold rounded hover:bg-[#6A994E]/20 transition-all uppercase tracking-tighter">PAT</Link>
             </div>
             <ConnectivityStatus />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-[#5A6B7C] mb-1">Patient Profile</p>
              <p className="font-semibold text-[#0A1128]">{patient.name}</p>
            </div>
            <div className="w-px h-10 bg-[#E8EEF2]" />
            <div>
              <p className="text-xs text-[#5A6B7C] mb-1">Demographics</p>
              <p className="text-[#0A1128]">{patient.gender}, {patient.dob}</p>
            </div>
            <div className="w-px h-10 bg-[#E8EEF2]" />
            <div>
              <p className="text-xs text-[#5A6B7C] mb-1">Therapy Timeline</p>
              <p className="text-[#0A1128]">Started: {new Date(patient.therapyStartDate || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <div className="w-px h-10 bg-[#E8EEF2]" />
            <div>
              <p className="text-xs text-[#5A6B7C] mb-1">Current Hardware</p>
              <p className="text-[#0A1128]">{patient.maskType}</p>
            </div>
            <div className="w-px h-10 bg-[#E8EEF2]" />
            <div>
              <p className="text-xs text-[#5A6B7C] mb-1">Risk Score</p>
              <p className={`font-semibold ${getRiskColor(patient.riskScore || 0)}`}>
                {typeof patient.riskScore === 'number' ? Math.round(patient.riskScore) : (patient.riskScore || 0)}/100
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Tab Navigation */}
      <div className="bg-white border-b border-[#E8EEF2] px-8 shrink-0">
        <nav className="flex gap-8 -mb-px">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.href;
            return (
              <Link
                key={tab.name}
                to={tab.href}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                  isActive 
                    ? 'border-[#2D9596] text-[#2D9596]' 
                    : 'border-transparent text-[#5A6B7C] hover:text-[#0A1128] hover:border-[#E8EEF2]'
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Tab Content Area with Persistent AI Sidebar */}
      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-auto bg-[#FAFAFA]">
          <Outlet />
        </div>
        
        {/* AI Weekly State Panel Sidebar */}
        <div className="w-80 bg-white border-l border-[#E8EEF2] flex-shrink-0 flex flex-col overflow-y-auto">
          <div className="p-6 border-b border-[#E8EEF2] bg-gradient-to-br from-[#FAFAFA] to-white">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-[#2D9596]" />
              <h3 className="font-bold text-[#0A1128]">AI Weekly State</h3>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-[#5A6B7C] uppercase tracking-wider">Risk Tier</span>
              {/* Derived from patient riskScore */}
              <div className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                (patient.riskScore || 0) >= 80 ? 'bg-[#E76F51]/10 text-[#E76F51]' :
                (patient.riskScore || 0) >= 60 ? 'bg-[#F4A261]/10 text-[#F4A261]' :
                'bg-[#6A994E]/10 text-[#6A994E]'
              }`}>
                {(patient.riskScore || 0) >= 80 ? 'CRITICAL' : (patient.riskScore || 0) >= 60 ? 'ELEVATED' : 'STABLE'}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-semibold text-[#5A6B7C] uppercase tracking-wider">Fused Score</span>
                <span className={`text-xl font-bold ${getRiskColor(patient.riskScore || 0)}`}>{typeof patient.riskScore === 'number' ? Math.round(patient.riskScore) : (patient.riskScore || 0)}/100</span>
              </div>
              <div className="w-full bg-[#E8EEF2] h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    (patient.riskScore || 0) >= 80 ? 'bg-[#E76F51]' : (patient.riskScore || 0) >= 60 ? 'bg-[#F4A261]' : 'bg-[#6A994E]'
                  }`} 
                  style={{ width: `${patient.riskScore || 0}%` }} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="bg-[#FAFAFA] p-3 rounded-xl border border-[#E8EEF2]">
                <div className="flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-[#5A6B7C]" />
                  <span className="text-[10px] font-bold text-[#5A6B7C] uppercase">Drop Risk</span>
                </div>
                <span className="font-bold text-[#0A1128]">{(patient.riskScore || 0) >= 80 ? '14 Days' : (patient.riskScore || 0) >= 60 ? '30 Days' : 'Low'}</span>
              </div>
              <div className="bg-[#FAFAFA] p-3 rounded-xl border border-[#E8EEF2]">
                <div className="flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2D9596]" />
                  <span className="text-[10px] font-bold text-[#5A6B7C] uppercase">Confidence</span>
                </div>
                <span className="font-bold text-[#0A1128]">94.2%</span>
              </div>
            </div>
          </div>

          <div className="p-6 flex-1 bg-white">
            <h4 className="text-xs font-bold text-[#5A6B7C] uppercase tracking-widest mb-4">Active AI Flags</h4>
            <div className="space-y-3 mb-8">
              {(patient.riskScore || 0) >= 60 ? (
                <>
                  <div className="flex items-start gap-3 p-3 bg-[#E76F51]/5 rounded-xl border border-[#E76F51]/20">
                    <AlertTriangle className="w-4 h-4 text-[#E76F51] mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-[#0A1128]">Usage Decay</p>
                      <p className="text-xs text-[#5A6B7C] mt-0.5">3-day downward trend detected.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-[#F4A261]/5 rounded-xl border border-[#F4A261]/20">
                    <Activity className="w-4 h-4 text-[#F4A261] mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-[#0A1128]">Leak Instability</p>
                      <p className="text-xs text-[#5A6B7C] mt-0.5">Residual burden in REM cycles.</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-start gap-3 p-3 bg-[#6A994E]/5 rounded-xl border border-[#6A994E]/20">
                  <ShieldCheck className="w-4 h-4 text-[#6A994E] mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-[#0A1128]">Therapy Stable</p>
                    <p className="text-xs text-[#5A6B7C] mt-0.5">No active clinical flags.</p>
                  </div>
                </div>
              )}
            </div>

            <h4 className="text-xs font-bold text-[#5A6B7C] uppercase tracking-widest mb-4">Care Phase</h4>
            <div className="flex flex-col gap-2 relative">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-[#E8EEF2] z-0" />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white ${
                  (patient.riskScore || 0) >= 80 ? 'border-[#E76F51] text-[#E76F51]' : 'border-[#E8EEF2] text-[#E8EEF2]'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${(patient.riskScore || 0) >= 80 ? 'bg-[#E76F51]' : 'bg-transparent'}`} />
                </div>
                <span className={`text-sm font-bold ${(patient.riskScore || 0) >= 80 ? 'text-[#0A1128]' : 'text-[#5A6B7C]'}`}>Onboarding</span>
              </div>

              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white ${
                  (patient.riskScore || 0) >= 60 && (patient.riskScore || 0) < 80 ? 'border-[#F4A261] text-[#F4A261]' : 'border-[#E8EEF2] text-[#E8EEF2]'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${(patient.riskScore || 0) >= 60 && (patient.riskScore || 0) < 80 ? 'bg-[#F4A261]' : 'bg-transparent'}`} />
                </div>
                <span className={`text-sm font-bold ${(patient.riskScore || 0) >= 60 && (patient.riskScore || 0) < 80 ? 'text-[#0A1128]' : 'text-[#5A6B7C]'}`}>Optimization</span>
              </div>

              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white ${
                  (patient.riskScore || 0) < 60 ? 'border-[#6A994E] text-[#6A994E]' : 'border-[#E8EEF2] text-[#E8EEF2]'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${(patient.riskScore || 0) < 60 ? 'bg-[#6A994E]' : 'bg-transparent'}`} />
                </div>
                <span className={`text-sm font-bold ${(patient.riskScore || 0) < 60 ? 'text-[#0A1128]' : 'text-[#5A6B7C]'}`}>Maintenance</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
