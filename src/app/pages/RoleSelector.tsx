import { Link } from 'react-router';
import { Stethoscope, Wrench, User } from 'lucide-react';

const SHORTLISTED_PATIENTS = [
  '216753',
  '217942',
  '218038',
  '217889',
  '210141',
  '217469',
  '217168',
  '217610',
  '217107',
  '217685',
  '217320',
  '218036',
  '217965',
  '217857',
  '144178',
  '89058',
  '74990',
  '216923',
  '218177',
  '217819'
];

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
          <div
            className="group relative bg-white rounded-2xl p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-sage/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative">
              <div className="w-16 h-16 bg-sage/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-sage transition-colors">
                <User className="w-8 h-8 text-sage group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-2xl mb-3 text-navy">
                Patient App
              </h2>
              <p className="text-blue-gray leading-relaxed mb-6">
                Your personal sleep therapy companion for tracking progress and staying motivated
              </p>
            </div>
            
            <div className="relative mt-auto space-y-4 w-full">
              <div className="max-h-36 overflow-y-auto pr-1 flex flex-wrap gap-2 border border-navy/5 p-2 rounded-lg bg-[#FAFAFA]">
                {SHORTLISTED_PATIENTS.map((pid) => (
                  <Link
                    key={pid}
                    to={`/patient/${pid}`}
                    className="bg-navy/5 hover:bg-navy/15 text-navy font-bold text-[10px] px-2 py-1 rounded transition-colors border border-navy/10"
                  >
                    ID: {pid}
                  </Link>
                ))}
              </div>
              <Link
                to={`/patient/${SHORTLISTED_PATIENTS[0] || '1'}`}
                className="text-sage group-hover:translate-x-2 transition-transform inline-flex items-center gap-2 font-bold text-sm"
              >
                Enter App
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Technician Card */}
          <div
            className="group relative bg-white rounded-2xl p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative">
              <div className="w-16 h-16 bg-amber/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber transition-colors">
                <Wrench className="w-8 h-8 text-amber group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-2xl mb-3 text-navy">
                Technician Portal
              </h2>
              <p className="text-blue-gray leading-relaxed mb-6">
                Equipment management, patient support, and technical troubleshooting interface
              </p>
            </div>

            <div className="relative mt-auto space-y-4 w-full">
              <div className="max-h-36 overflow-y-auto pr-1 flex flex-wrap gap-2 border border-navy/5 p-2 rounded-lg bg-[#FAFAFA]">
                {SHORTLISTED_PATIENTS.map((pid) => (
                  <Link
                    key={pid}
                    to={`/technician/patient/${pid}`}
                    className="bg-navy/5 hover:bg-navy/15 text-navy font-bold text-[10px] px-2 py-1 rounded transition-colors border border-navy/10"
                  >
                    Manage {pid}
                  </Link>
                ))}
              </div>
              <Link
                to="/technician"
                className="text-amber group-hover:translate-x-2 transition-transform inline-flex items-center gap-2 font-bold text-sm"
              >
                Enter Portal
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Physician Card */}
          <div
            className="group relative bg-white rounded-2xl p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl flex flex-col justify-between"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative">
              <div className="w-16 h-16 bg-teal/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-teal transition-colors">
                <Stethoscope className="w-8 h-8 text-teal group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-2xl mb-3 text-navy">
                Physician Portal
              </h2>
              <p className="text-blue-gray leading-relaxed mb-6">
                Comprehensive clinical dashboard for diagnosis, treatment planning, and patient monitoring
              </p>
            </div>

            <div className="relative mt-auto space-y-4 w-full">
              <div className="max-h-36 overflow-y-auto pr-1 flex flex-wrap gap-2 border border-navy/5 p-2 rounded-lg bg-[#FAFAFA]">
                {SHORTLISTED_PATIENTS.map((pid) => (
                  <Link
                    key={pid}
                    to={`/physician/patient/${pid}`}
                    className="bg-navy/5 hover:bg-navy/15 text-navy font-bold text-[10px] px-2 py-1 rounded transition-colors border border-navy/10"
                  >
                    View {pid}
                  </Link>
                ))}
              </div>
              <Link
                to="/physician"
                className="text-teal group-hover:translate-x-2 transition-transform inline-flex items-center gap-2 font-bold"
              >
                Enter Portal
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center mt-16 text-white/60">
          <p>Demo Environment • Click a patient shortcut button to enter with active data</p>
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
