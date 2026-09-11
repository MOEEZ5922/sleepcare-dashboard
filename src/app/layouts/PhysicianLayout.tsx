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
    if (role !== 'physician') {
      navigate('/physician/login');
    }
  }, [navigate]);

  return (
    <div className="h-screen flex bg-background">
      <div className="w-64 bg-card border-r border-light-blue flex flex-col">
        <div className="p-6 border-b border-light-blue">
          <Link to="/" className="flex items-center gap-2 text-slate-muted hover:text-navy transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Portal</span>
          </Link>
          <h1 className="text-2xl text-navy font-semibold mb-1">
            SleepCare
          </h1>
          <p className="text-sm text-slate-muted">Physician Portal</p>
          <div className="mt-4 flex gap-2">
             <Link to="/physician" className="px-2 py-1 bg-teal/10 text-teal text-[10px] font-bold rounded hover:bg-teal/20 transition-all uppercase tracking-tighter">MD</Link>
             <Link to="/technician" className="px-2 py-1 bg-amber/10 text-amber text-[10px] font-bold rounded hover:bg-amber/20 transition-all uppercase tracking-tighter">TECH</Link>
             <Link to="/login" className="px-2 py-1 bg-sage/10 text-sage text-[10px] font-bold rounded hover:bg-sage/20 transition-all uppercase tracking-tighter">PAT</Link>
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
                    ? 'bg-teal text-white shadow-xs'
                    : 'text-slate-muted hover:bg-light-blue hover:text-navy'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-light-blue space-y-4">
          <ConnectivityStatus />
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-muted hover:bg-light-blue hover:text-navy transition-all w-full">
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
