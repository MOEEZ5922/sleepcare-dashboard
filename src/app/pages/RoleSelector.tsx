import { Link } from 'react-router';
import { Stethoscope, Wrench, User, LucideIcon } from 'lucide-react';
import lindeLogoImg from '../../assets/LindeLogo.png';

interface PortalOption {
  title: string;
  description: string;
  path: string;
  buttonText: string;
  icon: LucideIcon;
  iconBg: string;
  iconHoverBg: string;
  iconColor: string;
  btnBg: string;
  btnHoverBg: string;
  btnShadow: string;
}

const PORTALS: PortalOption[] = [
  {
    title: 'Patient App',
    description: 'Your personal sleep therapy companion for tracking progress, watching coaching guides, and logging daily check-ins.',
    path: '/login',
    buttonText: 'Sign In to Patient App',
    icon: User,
    iconBg: 'bg-teal/10',
    iconHoverBg: 'group-hover:bg-teal',
    iconColor: 'text-teal',
    btnBg: 'bg-teal',
    btnHoverBg: 'hover:bg-teal/90',
    btnShadow: 'shadow-teal/20',
  },
  {
    title: 'Technician Portal',
    description: 'Equipment management workbench, sensor pairing controls, support request tracking, and device diagnostics.',
    path: '/technician/login',
    buttonText: 'Sign In to Technician Workbench',
    icon: Wrench,
    iconBg: 'bg-amber/10',
    iconHoverBg: 'group-hover:bg-amber',
    iconColor: 'text-amber',
    btnBg: 'bg-amber',
    btnHoverBg: 'hover:bg-amber/90',
    btnShadow: 'shadow-amber/20',
  },
  {
    title: 'Physician Portal',
    description: 'Clinical exceptions inbox for urgent triage review, patient trend logs, and medical pathway authorizations.',
    path: '/physician/login',
    buttonText: 'Sign In to Physician Portal',
    icon: Stethoscope,
    iconBg: 'bg-teal/10',
    iconHoverBg: 'group-hover:bg-teal',
    iconColor: 'text-teal',
    btnBg: 'bg-teal',
    btnHoverBg: 'hover:bg-teal/90',
    btnShadow: 'shadow-teal/20',
  },
];

export default function RoleSelector() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy/90 to-teal flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-teal/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-20 -top-20 w-96 h-96 bg-teal/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl w-full relative z-10">
        <div className="text-center mb-16 animate-[fadeIn_0.8s_ease-out]">
          <img src={lindeLogoImg} alt="Linde Logo" className="h-14 mx-auto mb-6 object-contain" />
          <h1 className="text-4xl sm:text-5xl text-white font-black uppercase tracking-wider mb-2">
            SleepCare
          </h1>
          <p className="text-md sm:text-lg text-white/80 font-semibold">
            Integrated Sleep Apnea Management Platform
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {PORTALS.map(({ title, description, path, buttonText, icon: Icon, iconBg, iconHoverBg, iconColor, btnBg, btnHoverBg, btnShadow }) => (
            <div
              key={title}
              className="group bg-card rounded-3xl p-8 hover:scale-[1.02] transition-all duration-300 shadow-xl flex flex-col justify-between h-[360px] border border-light-blue"
            >
              <div>
                <div className={`w-14 h-14 ${iconBg} ${iconHoverBg} rounded-2xl flex items-center justify-center mb-6 transition-colors`}>
                  <Icon className={`w-7 h-7 ${iconColor} group-hover:text-white transition-colors`} />
                </div>
                <h2 className="text-xl font-bold text-navy mb-3">{title}</h2>
                <p className="text-sm text-slate-muted leading-relaxed mb-6 font-semibold">
                  {description}
                </p>
              </div>

              <div className="w-full">
                <Link
                  to={path}
                  className={`w-full py-4 ${btnBg} ${btnHoverBg} text-white text-center rounded-xl font-bold text-sm block shadow-md ${btnShadow} transition-all active:scale-98`}
                >
                  {buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16 text-white/50 text-xs font-semibold">
          <p>Linde SleepCare Ecosystem</p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
