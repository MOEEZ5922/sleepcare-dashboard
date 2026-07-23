import { Outlet, Link, useLocation, useParams, useNavigate } from 'react-router';
import { Home, Activity, Package, FileText, HelpCircle, Video, Signal, TrendingUp } from 'lucide-react';
import ConnectivityStatus from '../components/ui/ConnectivityStatus';
import { useApi } from '../hooks/useApi';
import { fetchPatientSummary } from '../data/api';

export default function PatientLayout() {
  const location = useLocation();
  const { id } = useParams();

  const { data: summary, error } = useApi(() => fetchPatientSummary(id || '1'), {
    dependencies: [id],
    cacheKey: `patient-summary-${id || '1'}`
  });

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const isLive = !!(summary && (summary as any).__isLive);
  const rawName = summary?.name || summary?.patient?.name;
  const patientName = (rawName && rawName !== 'NaN') ? rawName.split(' ')[0] : 'Patient';

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
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest font-black uppercase text-white/50 bg-black/10 px-2.5 py-1 rounded-md">SleepCare</span>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-1.5">
                <Link to="/physician" className="px-2 py-1 bg-white/10 text-white text-[10px] font-bold rounded hover:bg-white/20 transition-all uppercase tracking-tighter">MD</Link>
                <Link to="/technician" className="px-2 py-1 bg-white/10 text-white text-[10px] font-bold rounded hover:bg-white/20 transition-all uppercase tracking-tighter">TECH</Link>
                <Link to={`/patient/${id || '216753'}`} className="px-2 py-1 bg-white/10 text-white text-[10px] font-bold rounded hover:bg-white/20 transition-all uppercase tracking-tighter border border-white/30">PAT</Link>
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1 bg-red-600/85 hover:bg-red-700 text-white text-[10px] font-black rounded transition-all uppercase tracking-tighter"
                >
                  Sign Out
                </button>
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8EEF2] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 overflow-x-auto scrollbar-none">
        <div className="flex items-center justify-between sm:justify-around w-full max-w-2xl mx-auto px-2 py-1 min-w-max md:min-w-0">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all flex-1 min-w-[50px] sm:min-w-[80px] ${
                  isActive
                    ? 'text-[#6A994E] bg-[#6A994E]/5'
                    : 'text-[#414D5B] hover:text-[#2D9596]'
                }`}
              >
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-center">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}