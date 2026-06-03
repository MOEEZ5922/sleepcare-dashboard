import { useState } from 'react';
import { HelpCircle, FileText, Phone } from 'lucide-react';
import AILifecyclePanel from '../../components/AILifecyclePanel';

export default function PhysicianHelp() {
  const [activeTab, setActiveTab] = useState<'support' | 'lifecycle'>('support');

  return (
    <div className="p-8 max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl text-[#0A1128] font-semibold">Physician Support Desk</h2>
        <p className="text-xs text-[#5A6B7C] mt-1">Linde Clinical Operations & AI Health Portal</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-[#E8EEF2]">
        <button
          onClick={() => setActiveTab('support')}
          className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
            activeTab === 'support' ? 'border-[#2D9596] text-[#2D9596]' : 'border-transparent text-[#5A6B7C] hover:text-[#0A1128]'
          }`}
        >
          Support & Protocols
        </button>
        <button
          onClick={() => setActiveTab('lifecycle')}
          className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
            activeTab === 'lifecycle' ? 'border-[#2D9596] text-[#2D9596]' : 'border-transparent text-[#5A6B7C] hover:text-[#0A1128]'
          }`}
        >
          AI Model Lifecycle
        </button>
      </div>

      {activeTab === 'support' ? (
        <div className="grid gap-6 animate-in fade-in duration-300">
          <div className="bg-white p-6 rounded-xl border border-[#E8EEF2] shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-[#2D9596]" />
              <h3 className="text-lg font-medium text-[#0A1128]">Clinical Protocols</h3>
            </div>
            <p className="text-[#5A6B7C] text-sm leading-relaxed mb-4">
              Access the latest clinical guidelines for OSA management, including MAD/HNS authorization criteria and central apnea titration protocols.
            </p>
            <button className="text-[#2D9596] text-sm font-semibold hover:underline">View Guidelines →</button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E8EEF2] shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <HelpCircle className="w-6 h-6 text-[#2D9596]" />
              <h3 className="text-lg font-medium text-[#0A1128]">Software Support</h3>
            </div>
            <p className="text-[#5A6B7C] text-sm leading-relaxed mb-4">
              Having trouble with the exception-based inbox or patient data synchronization? Contact our technical support team.
            </p>
            <button className="text-[#2D9596] text-sm font-semibold hover:underline">Open Support Ticket →</button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E8EEF2] shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Phone className="w-6 h-6 text-[#2D9596]" />
              <h3 className="text-lg font-medium text-[#0A1128]">Emergency Contact</h3>
            </div>
            <p className="text-[#5A6B7C] text-sm leading-relaxed">
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
