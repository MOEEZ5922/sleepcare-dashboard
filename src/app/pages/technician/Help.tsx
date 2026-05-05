import { HelpCircle, Terminal, Truck, Wrench } from 'lucide-react';

export default function TechnicianHelp() {
  return (
    <div className="p-8 max-w-4xl">
      <h2 className="text-2xl text-[#0A1128] mb-6 font-semibold">Technician IT & Support</h2>
      
      <div className="grid gap-6">
        <div className="bg-white p-6 rounded-xl border border-[#E8EEF2] shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Terminal className="w-6 h-6 text-[#F4A261]" />
            <h3 className="text-lg font-medium text-[#0A1128]">System Status</h3>
          </div>
          <p className="text-[#5A6B7C] text-sm leading-relaxed mb-4">
            Check the operational status of CPAP cloud syncing, AI risk score calculation services, and dispatch logistics APIs.
          </p>
          <button className="text-[#F4A261] text-sm font-semibold hover:underline">View System Status →</button>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#E8EEF2] shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Truck className="w-6 h-6 text-[#F4A261]" />
            <h3 className="text-lg font-medium text-[#0A1128]">Dispatch Issues</h3>
          </div>
          <p className="text-[#5A6B7C] text-sm leading-relaxed mb-4">
            Encountering errors with hardware assignment or barcode scanning during physical dispatch?
          </p>
          <button className="text-[#F4A261] text-sm font-semibold hover:underline">Report Dispatch Error →</button>
        </div>

        <div className="bg-white p-6 rounded-xl border border-[#E8EEF2] shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Wrench className="w-6 h-6 text-[#F4A261]" />
            <h3 className="text-lg font-medium text-[#0A1128]">Equipment Troubleshooting</h3>
          </div>
          <p className="text-[#5A6B7C] text-sm leading-relaxed mb-4">
            Step-by-step guides for calibrating pressure settings and troubleshooting cellular modem connectivity in patient devices.
          </p>
          <button className="text-[#F4A261] text-sm font-semibold hover:underline">Access Service Manuals →</button>
        </div>

        <div className="bg-[#E8EEF2] p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle className="w-5 h-5 text-[#5A6B7C]" />
            <h3 className="text-md font-medium text-[#0A1128]">IT Help Desk</h3>
          </div>
          <p className="text-[#5A6B7C] text-sm">
            For password resets or local software installation issues: <strong>+1 (888) SLEEP-TECH-IT</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
