import { Outlet, Link, useLocation, useParams } from 'react-router';
import { ArrowLeft, Signal, Loader2 } from 'lucide-react';
import ConnectivityStatus from '../components/ui/ConnectivityStatus';
import { useApi } from '../hooks/useApi';
import { fetchPatientSummary } from '../data/api';

export default function TechnicianPatientLayout() {
  const location = useLocation();
  const { id } = useParams();

  const { data: summary, isLoading, error } = useApi(() => fetchPatientSummary(id || '1'), {
    dependencies: [id],
    cacheKey: `patient-summary-${id || '1'}`
  });

  const isLive = !error && !!summary;

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
      <div className="flex items-center justify-center h-full bg-[#FAFAFA]">
        <Loader2 className="w-8 h-8 text-[#F4A261] animate-spin" />
      </div>
    );
  }

  const patient = summary || {
    name: 'Unknown Patient',
    address: '—',
    machineSerial: '—',
    maskType: '—'
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA]">
      {/* Patient Context Header */}
      <div className="bg-white border-b border-[#E8EEF2] px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <Link to="/technician" className="flex items-center gap-2 text-[#F4A261] hover:underline text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Queue
          </Link>
          <div className="flex items-center gap-4">
             <div className="flex gap-2">
                <Link to="/physician" className="px-2 py-1 bg-[#2D9596]/10 text-[#2D9596] text-[10px] font-bold rounded hover:bg-[#2D9596]/20 transition-all uppercase tracking-tighter">MD</Link>
                <Link to="/technician" className="px-2 py-1 bg-[#F4A261]/10 text-[#F4A261] text-[10px] font-bold rounded hover:bg-[#F4A261]/20 transition-all uppercase tracking-tighter">TECH</Link>
                <Link to="/patient/1/home" className="px-2 py-1 bg-[#6A994E]/10 text-[#6A994E] text-[10px] font-bold rounded hover:bg-[#6A994E]/20 transition-all uppercase tracking-tighter">PAT</Link>
             </div>
             <ConnectivityStatus />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-[#5A6B7C] mb-1">Patient Name</p>
              <p className="font-semibold text-[#0A1128]">{patient.name}</p>
            </div>
            <div className="w-px h-10 bg-[#E8EEF2]" />
            <div>
              <p className="text-xs text-[#5A6B7C] mb-1">Address</p>
              <p className="text-[#0A1128]">{patient.address}</p>
            </div>
            <div className="w-px h-10 bg-[#E8EEF2]" />
            <div>
              <p className="text-xs text-[#5A6B7C] mb-1">Machine Serial</p>
              <p className="text-[#0A1128] font-mono text-sm">{patient.machineSerial}</p>
            </div>
            <div className="w-px h-10 bg-[#E8EEF2]" />
            <div>
              <p className="text-xs text-[#5A6B7C] mb-1">Current Mask</p>
              <p className="text-[#0A1128]">{patient.maskType}</p>
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
                    ? 'border-[#F4A261] text-[#F4A261]' 
                    : 'border-transparent text-[#5A6B7C] hover:text-[#0A1128] hover:border-[#E8EEF2]'
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
