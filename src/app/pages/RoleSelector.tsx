import { Link } from 'react-router';
import { Stethoscope, Wrench, User } from 'lucide-react';

export default function RoleSelector() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1128] via-[#1a2744] to-[#2D9596] flex items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-16 animate-[fadeIn_0.8s_ease-out]">
          <h1 className="text-6xl text-white mb-4 tracking-tight">
            SleepCare
          </h1>
          <p className="text-xl text-white/80">
            Integrated Sleep Apnea Management Platform
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Physician Card */}
          <Link
            to="/physician"
            className="group relative bg-white rounded-2xl p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#2D9596]/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-16 h-16 bg-[#2D9596]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#2D9596] transition-colors">
                <Stethoscope className="w-8 h-8 text-[#2D9596] group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-2xl mb-3 text-[#0A1128]">
                Physician Portal
              </h2>
              <p className="text-[#5A6B7C] leading-relaxed">
                Comprehensive clinical dashboard for diagnosis, treatment planning, and patient monitoring
              </p>
              <div className="mt-6 text-[#2D9596] group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                Enter Portal
                <span>→</span>
              </div>
            </div>
          </Link>

          {/* Technician Card */}
          <Link
            to="/technician"
            className="group relative bg-white rounded-2xl p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#F4A261]/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-16 h-16 bg-[#F4A261]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#F4A261] transition-colors">
                <Wrench className="w-8 h-8 text-[#F4A261] group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-2xl mb-3 text-[#0A1128]">
                Technician Portal
              </h2>
              <p className="text-[#5A6B7C] leading-relaxed">
                Equipment management, patient support, and technical troubleshooting interface
              </p>
              <div className="mt-6 text-[#F4A261] group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                Enter Portal
                <span>→</span>
              </div>
            </div>
          </Link>

          {/* Patient Card */}
          <Link
            to="/patient"
            className="group relative bg-white rounded-2xl p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#6A994E]/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-16 h-16 bg-[#6A994E]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#6A994E] transition-colors">
                <User className="w-8 h-8 text-[#6A994E] group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-2xl mb-3 text-[#0A1128]">
                Patient App
              </h2>
              <p className="text-[#5A6B7C] leading-relaxed">
                Your personal sleep therapy companion for tracking progress and staying motivated
              </p>
              <div className="mt-6 text-[#6A994E] group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                Enter App
                <span>→</span>
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center mt-16 text-white/60">
          <p>Demo Environment • All data is simulated for demonstration purposes</p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
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
