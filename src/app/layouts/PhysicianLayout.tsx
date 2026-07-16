import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { useEffect } from 'react';
import { Home, HelpCircle, ArrowLeft, Settings, Users } from 'lucide-react';
import ConnectivityStatus from '../components/ui/ConnectivityStatus';

const navigation = [
  { name: 'Exception Inbox', href: '/physician', icon: Home },
  { name: 'Patient Directory', href: '/physician/directory', icon: Users },
  { name: 'Help & Protocols', href: '/physician/help', icon: HelpCircle },
];

export default function PhysicianLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    // If not demo credentials bypass and no token, or role is wrong, redirect
    if (role !== 'physician') {
      navigate('/physician/login');
    }
  }, [navigate]);

  return (
    <div className="h-screen flex bg-[#FAFAFA]">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-[#E8EEF2] flex flex-col">
        <div className="p-6 border-b border-[#E8EEF2]">
          <Link to="/" className="flex items-center gap-2 text-[#5A6B7C] hover:text-[#0A1128] transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Portal</span>
          </Link>
          <h1 className="text-2xl text-[#0A1128] mb-1">
            SleepCare
          </h1>
          <p className="text-sm text-[#5A6B7C]">Physician Portal</p>
          <div className="mt-4 flex gap-2">
             <Link to="/physician" className="px-2 py-1 bg-[#2D9596]/10 text-[#2D9596] text-[10px] font-bold rounded hover:bg-[#2D9596]/20 transition-all uppercase tracking-tighter">MD</Link>
             <Link to="/technician" className="px-2 py-1 bg-[#F4A261]/10 text-[#F4A261] text-[10px] font-bold rounded hover:bg-[#F4A261]/20 transition-all uppercase tracking-tighter">TECH</Link>
             <Link to="/patient/216753/home" className="px-2 py-1 bg-[#6A994E]/10 text-[#6A994E] text-[10px] font-bold rounded hover:bg-[#6A994E]/20 transition-all uppercase tracking-tighter">PAT</Link>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#2D9596] text-white shadow-sm'
                    : 'text-[#5A6B7C] hover:bg-[#E8EEF2] hover:text-[#0A1128]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#E8EEF2] space-y-4">
          <ConnectivityStatus />
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#5A6B7C] hover:bg-[#E8EEF2] hover:text-[#0A1128] transition-all w-full">
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
