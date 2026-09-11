import { Outlet, Link, useLocation, useParams } from 'react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ConnectivityStatus from '../components/ui/ConnectivityStatus';
import { useApi } from '../hooks/useApi';
import { fetchPatientSummary, PatientSummary } from '../data/api';

export default function TechnicianPatientLayout() {
  const location = useLocation();
  const { id } = useParams();

  const { data: summary, isLoading } = useApi(() => fetchPatientSummary(id || '1'), {
    dependencies: [id],
    cacheKey: `patient-summary-${id || '1'}`
  });

  const tabs = [
    { name: 'Clinical Summary', href: `/technician/patient/${id}` },
    { name: 'Trends', href: `/technician/patient/${id}/trends` },
    { name: 'Biomarkers', href: `/technician/patient/${id}/biomarkers` },
    { name: 'Interventions', href: `/technician/patient/${id}/interventions` },
    { name: 'Surveys', href: `/technician/patient/${id}/surveys` },
    { name: 'AI Analysis', href: `/technician/patient/${id}/ai-analysis` },
    { name: 'Biomarker Devices', href: `/technician/patient/${id}/devices` },
  ];

  if (isLoading && !summary) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <Loader2 className="w-8 h-8 text-amber animate-spin" />
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
    address: '—',
    machineSerial: '—',
    maskType: '—',
    phone: null,
    email: null,
    is_lisa_user: null
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="bg-card border-b border-light-blue px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <Link to="/technician" className="flex items-center gap-2 text-amber hover:underline text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Queue
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
              <p className="text-xs text-slate-muted mb-1">Patient Name</p>
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
              <p className="text-xs text-slate-muted mb-1">Address</p>
              <p className="text-navy">{patient.address}</p>
            </div>
            <div className="w-px h-10 bg-light-blue" />
            <div>
              <p className="text-xs text-slate-muted mb-1">Machine Serial</p>
              <p className="text-navy font-mono text-sm">{patient.machineSerial}</p>
            </div>
            <div className="w-px h-10 bg-light-blue" />
            <div>
              <p className="text-xs text-slate-muted mb-1">Current Mask</p>
              <p className="text-navy">{patient.maskType}</p>
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
                    ? 'border-amber text-amber' 
                    : 'border-transparent text-slate-muted hover:text-navy hover:border-light-blue'
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
