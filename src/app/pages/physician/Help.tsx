import { useState } from 'react';
import { HelpCircle, FileText, Phone } from 'lucide-react';
import AILifecyclePanel from '../../components/AILifecyclePanel';

export default function PhysicianHelp() {
  const [activeTab, setActiveTab] = useState<'support' | 'lifecycle'>('support');

  return (
    <div className="p-8 w-full space-y-6">
      <div>
        <h2 className="text-2xl text-navy font-semibold">Physician Support Desk</h2>
        <p className="text-xs text-slate-muted mt-1">Linde Clinical Operations & AI Health Portal</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-light-blue">
        <button
          onClick={() => setActiveTab('support')}
          className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
            activeTab === 'support' ? 'border-teal text-teal' : 'border-transparent text-slate-muted hover:text-navy'
          }`}
        >
          Support & Protocols
        </button>
        <button
          onClick={() => setActiveTab('lifecycle')}
          className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
            activeTab === 'lifecycle' ? 'border-teal text-teal' : 'border-transparent text-slate-muted hover:text-navy'
          }`}
        >
          AI Model Lifecycle
        </button>
      </div>

      {activeTab === 'support' ? (
        <div className="grid gap-6 animate-in fade-in duration-300">
          <div className="bg-card p-6 rounded-xl border border-light-blue shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-teal" />
              <h3 className="text-lg font-medium text-navy">Clinical Protocols</h3>
            </div>
            <p className="text-slate-muted text-sm leading-relaxed mb-4">
              Access the latest clinical guidelines for OSA management, including MAD/HNS authorization criteria and central apnea titration protocols.
            </p>
            <button className="text-teal text-sm font-semibold hover:underline">View Guidelines →</button>
          </div>

          <div className="bg-card p-6 rounded-xl border border-light-blue shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <HelpCircle className="w-6 h-6 text-teal" />
              <h3 className="text-lg font-medium text-navy">Software Support</h3>
            </div>
            <p className="text-slate-muted text-sm leading-relaxed mb-4">
              Having trouble with the exception-based inbox or patient data synchronization? Contact our technical support team.
            </p>
            <button className="text-teal text-sm font-semibold hover:underline">Open Support Ticket →</button>
          </div>

          <div className="bg-card p-6 rounded-xl border border-light-blue shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Phone className="w-6 h-6 text-teal" />
              <h3 className="text-lg font-medium text-navy">Emergency Contact</h3>
            </div>
            <p className="text-slate-muted text-sm leading-relaxed">
              For critical system failures impacting patient care: <strong>+1 (800) SLEEP-MED</strong>
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
