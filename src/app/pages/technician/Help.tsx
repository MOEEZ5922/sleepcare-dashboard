import { useState } from 'react';
import { HelpCircle, Terminal, Truck, Wrench } from 'lucide-react';
import AILifecyclePanel from '../../components/AILifecyclePanel';

export default function TechnicianHelp() {
  const [activeTab, setActiveTab] = useState<'support' | 'lifecycle'>('support');

  return (
    <div className="p-8 w-full space-y-6">
      <div>
        <h2 className="text-2xl text-navy font-semibold">Technician IT & Support</h2>
        <p className="text-xs text-slate-muted mt-1">Linde Operations & AI Health Portal</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-light-blue">
        <button
          onClick={() => setActiveTab('support')}
          className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
            activeTab === 'support' ? 'border-amber text-amber' : 'border-transparent text-slate-muted hover:text-navy'
          }`}
        >
          Support & Manuals
        </button>
        <button
          onClick={() => setActiveTab('lifecycle')}
          className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
            activeTab === 'lifecycle' ? 'border-amber text-amber' : 'border-transparent text-slate-muted hover:text-navy'
          }`}
        >
          AI Model Lifecycle
        </button>
      </div>

      {activeTab === 'support' ? (
        <div className="grid gap-6 animate-in fade-in duration-300">
          <div className="bg-card p-6 rounded-xl border border-light-blue shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Terminal className="w-6 h-6 text-amber" />
              <h3 className="text-lg font-medium text-navy">System Status</h3>
            </div>
            <p className="text-slate-muted text-sm leading-relaxed mb-4">
              Check the operational status of CPAP cloud syncing, AI risk score calculation services, and dispatch logistics APIs.
            </p>
            <button className="text-amber text-sm font-semibold hover:underline">View System Status →</button>
          </div>

          <div className="bg-card p-6 rounded-xl border border-light-blue shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Truck className="w-6 h-6 text-amber" />
              <h3 className="text-lg font-medium text-navy">Dispatch Issues</h3>
            </div>
            <p className="text-slate-muted text-sm leading-relaxed mb-4">
              Encountering errors with hardware assignment or barcode scanning during physical dispatch?
            </p>
            <button className="text-amber text-sm font-semibold hover:underline">Report Dispatch Error →</button>
          </div>

          <div className="bg-card p-6 rounded-xl border border-light-blue shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Wrench className="w-6 h-6 text-amber" />
              <h3 className="text-lg font-medium text-navy">Equipment Troubleshooting</h3>
            </div>
            <p className="text-slate-muted text-sm leading-relaxed mb-4">
              Step-by-step guides for calibrating pressure settings and troubleshooting cellular modem connectivity in patient devices.
            </p>
            <button className="text-amber text-sm font-semibold hover:underline">Access Service Manuals →</button>
          </div>

          <div className="bg-light-blue/40 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <HelpCircle className="w-5 h-5 text-slate-muted" />
              <h3 className="text-md font-medium text-navy">IT Help Desk</h3>
            </div>
            <p className="text-slate-muted text-sm">
              For password resets or local software installation issues: <strong>+1 (888) SLEEP-TECH-IT</strong>
            </p>
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in duration-300">
          <AILifecyclePanel />
        </div>
      )}
    </div>
  );
}
