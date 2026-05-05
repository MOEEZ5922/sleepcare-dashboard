import { HelpCircle, FileText, Phone } from 'lucide-react';

export default function PhysicianHelp() {
  return (
    <div className="p-8 max-w-4xl">
      <h2 className="text-2xl text-[#0A1128] mb-6 font-semibold">Help & Protocols</h2>
      
      <div className="grid gap-6">
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
    </div>
  );
}
