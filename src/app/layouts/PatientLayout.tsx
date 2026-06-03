import { Outlet, Link, useLocation, useParams } from 'react-router';
import { Home, Activity, Package, FileText, HelpCircle, Video, Signal, TrendingUp } from 'lucide-react';
import ConnectivityStatus from '../components/ui/ConnectivityStatus';
import { useApi } from '../hooks/useApi';
import { fetchPatientSummary } from '../data/api';

export default function PatientLayout() {
  const location = useLocation();
  const { id } = useParams();

  const { data: summary, error } = useApi(() => fetchPatientSummary(id || '1'), {
    dependencies: [id]
  });

  const isLive = !error && !!summary;
  const patientName = (summary?.name || summary?.patient?.name)?.split(' ')[0] || 'Patient';

  const navigation = [
    { name: 'Home', href: `/patient/${id}/home`, icon: Home },
    { name: 'Sleep', href: `/patient/${id}/cpap`, icon: Activity },
    { name: 'Progress', href: `/patient/${id}/reporting`, icon: TrendingUp },
    { name: 'Equipment', href: `/patient/${id}/interventions`, icon: Package },
    { name: 'Surveys', href: `/patient/${id}/surveys`, icon: FileText },
    { name: 'Videos', href: `/patient/${id}/videos`, icon: Video },
    { name: 'Help', href: `/patient/${id}/help`, icon: HelpCircle },
  ];

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-[#FAFAFA] to-[#E8EEF2]">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-[#6A994E] to-[#2D9596] px-6 py-6 text-white shadow-md relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-3">
            <div className="flex flex-col items-end gap-3">
              <div className="flex gap-2">
                <Link to="/physician" className="px-2 py-1 bg-white/10 text-white text-[10px] font-bold rounded hover:bg-white/20 transition-all uppercase tracking-tighter">MD</Link>
                <Link to="/technician" className="px-2 py-1 bg-white/10 text-white text-[10px] font-bold rounded hover:bg-white/20 transition-all uppercase tracking-tighter">TECH</Link>
                <Link to="/patient/1/home" className="px-2 py-1 bg-white/10 text-white text-[10px] font-bold rounded hover:bg-white/20 transition-all uppercase tracking-tighter border border-white/30">PAT</Link>
              </div>
              <ConnectivityStatus />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-1">
            Good Evening, {patientName}
          </h1>
          <p className="text-white/90 text-sm">Let's check your sleep progress</p>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-auto pb-24">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8EEF2] px-2 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
        <div className="flex items-center justify-around max-w-2xl mx-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl transition-all min-w-[80px] ${
                  isActive
                    ? 'text-[#6A994E] bg-[#6A994E]/5'
                    : 'text-[#414D5B] hover:text-[#2D9596]'
                }`}
              >
                <Icon className={`w-7 h-7 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className="text-[11px] font-bold uppercase tracking-wider">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}