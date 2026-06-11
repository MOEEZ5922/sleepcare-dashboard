import { Link } from 'react-router';
import { Stethoscope, Wrench, User } from 'lucide-react';

export default function RoleSelector() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy/90 to-teal flex items-center justify-center p-6">
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
          {/* Patient Card */}
          <Link
            to="/patient"
            className="group relative bg-white rounded-2xl p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-sage/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-16 h-16 bg-sage/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-sage transition-colors">
                <User className="w-8 h-8 text-sage group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-2xl mb-3 text-navy">
                Patient App
              </h2>
              <p className="text-blue-gray leading-relaxed">
                Your personal sleep therapy companion for tracking progress and staying motivated
              </p>
              <div className="mt-6 text-sage group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                Enter App
                <span>→</span>
              </div>
            </div>
          </Link>

          {/* Technician Card */}
          <Link
            to="/technician"
            className="group relative bg-white rounded-2xl p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-16 h-16 bg-amber/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber transition-colors">
                <Wrench className="w-8 h-8 text-amber group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-2xl mb-3 text-navy">
                Technician Portal
              </h2>
              <p className="text-blue-gray leading-relaxed">
                Equipment management, patient support, and technical troubleshooting interface
              </p>
              <div className="mt-6 text-amber group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                Enter Portal
                <span>→</span>
              </div>
            </div>
          </Link>

          {/* Physician Card */}
          <Link
            to="/physician"
            className="group relative bg-white rounded-2xl p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-16 h-16 bg-teal/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-teal transition-colors">
                <Stethoscope className="w-8 h-8 text-teal group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-2xl mb-3 text-navy">
                Physician Portal
              </h2>
              <p className="text-blue-gray leading-relaxed">
                Comprehensive clinical dashboard for diagnosis, treatment planning, and patient monitoring
              </p>
              <div className="mt-6 text-teal group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                Enter Portal
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
