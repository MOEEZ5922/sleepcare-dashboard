import { Outlet, Link, useLocation, useParams } from 'react-router';
import { ArrowLeft, Loader2, Brain, Activity, AlertTriangle, ShieldCheck, Calendar } from 'lucide-react';
import ConnectivityStatus from '../components/ui/ConnectivityStatus';
import { useApi } from '../hooks/useApi';
import { fetchPatientSummary, PatientSummary } from '../data/api';

export default function PhysicianPatientLayout() {
  const location = useLocation();
  const { id } = useParams();

  const { data: summary, isLoading } = useApi(() => fetchPatientSummary(id || '1'), {
    dependencies: [id],
    cacheKey: `patient-summary-${id || '1'}`
  });

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-coral';
    if (score >= 70) return 'text-amber';
    return 'text-sage';
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
      <div className="flex items-center justify-center h-full bg-background">
        <Loader2 className="w-8 h-8 text-teal animate-spin" />
      </div>
    );
  }

  const patient: PatientSummary = summary || {
    patientId: id || '1',
    name: 'Unknown Patient',
    status: 'Unknown',
    adherenceRate: 0,
    currentAHI: 0,
    averageHours: 0,
    percentileLeak: 0,
    gender: '—',
    dob: '—',
    therapyStartDate: new Date().toISOString(),
    maskType: '—',
    riskScore: 0,
    phone: null,
    email: null,
    is_lisa_user: null
  };

  const riskScore = patient.riskScore || 0;

  // Derived risk thresholds and presentation tokens
  const isCritical = riskScore >= 80;
  const isElevated = riskScore >= 60;
  const riskTierLabel = isCritical ? 'CRITICAL' : isElevated ? 'ELEVATED' : 'STABLE';
  const riskTierBadgeClass = isCritical 
    ? 'bg-coral/10 text-coral' 
    : isElevated 
    ? 'bg-amber/10 text-amber' 
    : 'bg-sage/10 text-sage';
  const scoreBarColor = isCritical ? 'bg-coral' : isElevated ? 'bg-amber' : 'bg-sage';

  const carePhases = [
    { name: 'Onboarding', active: isCritical, activeBorder: 'border-coral text-coral', activeDot: 'bg-coral' },
    { name: 'Optimization', active: isElevated && !isCritical, activeBorder: 'border-amber text-amber', activeDot: 'bg-amber' },
    { name: 'Maintenance', active: !isElevated, activeBorder: 'border-sage text-sage', activeDot: 'bg-sage' },
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="bg-card border-b border-light-blue px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <Link to="/physician" className="flex items-center gap-2 text-teal hover:underline text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Inbox
          </Link>
          <div className="flex items-center gap-4">
             <div className="flex gap-2">
                <Link to="/physician" className="px-2 py-1 bg-teal/10 text-teal text-[10px] font-bold rounded hover:bg-teal/20 transition-all uppercase tracking-tighter">MD</Link>
                <Link to="/technician" className="px-2 py-1 bg-amber/10 text-amber text-[10px] font-bold rounded hover:bg-amber/20 transition-all uppercase tracking-tighter">TECH</Link>
                <Link to={id ? `/patient/${id}` : '/login'} className="px-2 py-1 bg-sage/10 text-sage text-[10px] font-bold rounded hover:bg-sage/20 transition-all uppercase tracking-tighter">PAT</Link>
             </div>
             <ConnectivityStatus />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 flex-wrap">
            <div>
              <p className="text-xs text-slate-muted mb-1">Patient Profile</p>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-navy">{patient.name}</p>
                {patient.is_lisa_user && (
                  <span className="text-[9px] font-extrabold text-sage bg-sage/10 border border-sage/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                    LISA User
                  </span>
                )}
              </div>
            </div>
            <div className="w-px h-10 bg-light-blue" />
            <div>
              <p className="text-xs text-slate-muted mb-1">Demographics</p>
              <p className="text-navy">{patient.gender}, {patient.dob}</p>
            </div>
            <div className="w-px h-10 bg-light-blue" />
            {(patient.email || patient.phone) && (
              <>
                <div>
                  <p className="text-xs text-slate-muted mb-1">Contact Info</p>
                  <p className="text-xs text-navy font-medium leading-tight">
                    {patient.phone && <span className="block">{patient.phone}</span>}
                    {patient.email && <span className="block text-slate-muted">{patient.email}</span>}
                  </p>
                </div>
                <div className="w-px h-10 bg-light-blue" />
              </>
            )}
            <div>
              <p className="text-xs text-slate-muted mb-1">Therapy Timeline</p>
              <p className="text-navy">
                Started: {patient.therapyStartDate && !isNaN(Date.parse(patient.therapyStartDate))
                  ? new Date(patient.therapyStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'NaN'}
              </p>
            </div>
            <div className="w-px h-10 bg-light-blue" />
            <div>
              <p className="text-xs text-slate-muted mb-1">Current Hardware</p>
              <p className="text-navy">{patient.maskType}</p>
            </div>
            <div className="w-px h-10 bg-light-blue" />
            <div>
              <p className="text-xs text-slate-muted mb-1">Risk Score</p>
              <p className={`font-semibold ${getRiskColor(riskScore)}`}>
                {typeof patient.riskScore === 'number' ? Math.round(riskScore) : riskScore}/100
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border-b border-light-blue px-8 shrink-0">
        <nav className="flex gap-8 -mb-px">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.href;
            return (
              <Link
                key={tab.name}
                to={tab.href}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all ${
                  isActive 
                    ? 'border-teal text-teal' 
                    : 'border-transparent text-slate-muted hover:text-navy hover:border-light-blue'
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-auto bg-background">
          <Outlet />
        </div>
        
        <div className="w-80 bg-card border-l border-light-blue flex-shrink-0 flex flex-col overflow-y-auto">
          <div className="p-6 border-b border-light-blue bg-gradient-to-br from-background to-card">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-teal" />
              <h3 className="font-bold text-navy">AI Weekly State</h3>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-muted uppercase tracking-wider">Risk Tier</span>
              <div className={`px-2.5 py-1 rounded-md text-xs font-bold ${riskTierBadgeClass}`}>
                {riskTierLabel}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-semibold text-slate-muted uppercase tracking-wider">Fused Score</span>
                <span className={`text-xl font-bold ${getRiskColor(riskScore)}`}>{typeof patient.riskScore === 'number' ? Math.round(riskScore) : riskScore}/100</span>
              </div>
              <div className="w-full bg-light-blue h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${scoreBarColor}`} 
                  style={{ width: `${riskScore}%` }} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="bg-background p-3 rounded-xl border border-light-blue">
                <div className="flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-muted" />
                  <span className="text-[10px] font-bold text-slate-muted uppercase">Drop Risk</span>
                </div>
                <span className="font-bold text-navy">{isCritical ? '14 Days' : isElevated ? '30 Days' : 'Low'}</span>
              </div>
              <div className="bg-background p-3 rounded-xl border border-light-blue">
                <div className="flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal" />
                  <span className="text-[10px] font-bold text-slate-muted uppercase">Confidence</span>
                </div>
                <span className="font-bold text-navy">94.2%</span>
              </div>
            </div>
          </div>

          <div className="p-6 flex-1 bg-card">
            <h4 className="text-xs font-bold text-slate-muted uppercase tracking-widest mb-4">Active AI Flags</h4>
            <div className="space-y-3 mb-8">
              {isElevated ? (
                <>
                  <div className="flex items-start gap-3 p-3 bg-coral/5 rounded-xl border border-coral/20">
                    <AlertTriangle className="w-4 h-4 text-coral mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-navy">Usage Decay</p>
                      <p className="text-xs text-slate-muted mt-0.5">3-day downward trend detected.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-amber/5 rounded-xl border border-amber/20">
                    <Activity className="w-4 h-4 text-amber mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-navy">Leak Instability</p>
                      <p className="text-xs text-slate-muted mt-0.5">Residual burden in REM cycles.</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-start gap-3 p-3 bg-sage/5 rounded-xl border border-sage/20">
                  <ShieldCheck className="w-4 h-4 text-sage mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-navy">Therapy Stable</p>
                    <p className="text-xs text-slate-muted mt-0.5">No active clinical flags.</p>
                  </div>
                </div>
              )}
            </div>

            <h4 className="text-xs font-bold text-slate-muted uppercase tracking-widest mb-4">Care Phase</h4>
            <div className="flex flex-col gap-2 relative">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-light-blue z-0" />
              {carePhases.map((phase) => (
                <div key={phase.name} className="flex items-center gap-4 relative z-10">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 bg-card ${
                    phase.active ? phase.activeBorder : 'border-light-blue text-light-blue'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${phase.active ? phase.activeDot : 'bg-transparent'}`} />
                  </div>
                  <span className={`text-sm font-bold ${phase.active ? 'text-navy' : 'text-slate-muted'}`}>
                    {phase.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
