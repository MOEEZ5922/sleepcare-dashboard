import { Link } from 'react-router';
import { Stethoscope, Wrench, User } from 'lucide-react';
import lindeLogoImg from '../../assets/LindeLogo.png';

export default function RoleSelector() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003867] via-[#002244] to-[#018EC6] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient background spots */}
      <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-[#018EC6]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#018EC6]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl w-full relative z-10">
        
        {/* Linde Branded Header */}
        <div className="text-center mb-16 animate-[fadeIn_0.8s_ease-out]">
          <img src={lindeLogoImg} alt="Linde Logo" className="h-14 mx-auto mb-6 object-contain" />
          <h1 className="text-4xl sm:text-5xl text-white font-black uppercase tracking-wider mb-2">
            SleepCare
          </h1>
          <p className="text-md sm:text-lg text-white/80 font-semibold">
            Integrated Sleep Apnea Management Platform
          </p>
        </div>

        {/* Portal Entry Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Patient App Card */}
          <div className="group bg-white rounded-3xl p-8 hover:scale-[1.02] transition-all duration-300 shadow-xl flex flex-col justify-between h-[360px] border border-[#E8EEF2]">
            <div>
              <div className="w-14 h-14 bg-[#018EC6]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#018EC6] transition-colors">
                <User className="w-7 h-7 text-[#018EC6] group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-xl font-bold text-[#003867] mb-3">
                Patient App
              </h2>
              <p className="text-sm text-[#5A6B7C] leading-relaxed mb-6 font-semibold">
                Your personal sleep therapy companion for tracking progress, watching coaching guides, and logging daily check-ins.
              </p>
            </div>
            
            <div className="w-full">
              <Link
                to="/login"
                className="w-full py-4 bg-[#018EC6] hover:bg-[#007cb0] text-white text-center rounded-xl font-bold text-sm block shadow-md shadow-[#018EC6]/20 transition-all active:scale-98"
              >
                Sign In to Patient App
              </Link>
            </div>
          </div>

          {/* Technician Portal Card */}
          <div className="group bg-white rounded-3xl p-8 hover:scale-[1.02] transition-all duration-300 shadow-xl flex flex-col justify-between h-[360px] border border-[#E8EEF2]">
            <div>
              <div className="w-14 h-14 bg-[#F4A261]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#F4A261] transition-colors">
                <Wrench className="w-7 h-7 text-[#F4A261] group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-xl font-bold text-[#003867] mb-3">
                Technician Portal
              </h2>
              <p className="text-sm text-[#5A6B7C] leading-relaxed mb-6 font-semibold">
                Equipment management workbench, sensor pairing controls, support request tracking, and device diagnostics.
              </p>
            </div>

            <div className="w-full">
              <Link
                to="/technician/login"
                className="w-full py-4 bg-[#F4A261] hover:bg-[#e78e47] text-white text-center rounded-xl font-bold text-sm block shadow-md shadow-[#F4A261]/20 transition-all active:scale-98"
              >
                Sign In to Technician Workbench
              </Link>
            </div>
          </div>

          {/* Physician Portal Card */}
          <div className="group bg-white rounded-3xl p-8 hover:scale-[1.02] transition-all duration-300 shadow-xl flex flex-col justify-between h-[360px] border border-[#E8EEF2]">
            <div>
              <div className="w-14 h-14 bg-[#2D9596]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#2D9596] transition-colors">
                <Stethoscope className="w-7 h-7 text-[#2D9596] group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-xl font-bold text-[#003867] mb-3">
                Physician Portal
              </h2>
              <p className="text-sm text-[#5A6B7C] leading-relaxed mb-6 font-semibold">
                Clinical exceptions inbox for urgent triage review, patient trend logs, and medical pathway authorizations.
              </p>
            </div>

            <div className="w-full">
              <Link
                to="/physician/login"
                className="w-full py-4 bg-[#2D9596] hover:bg-[#227e80] text-white text-center rounded-xl font-bold text-sm block shadow-md shadow-[#2D9596]/20 transition-all active:scale-98"
              >
                Sign In to Physician Portal
              </Link>
            </div>
          </div>

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
