import { ShieldCheck, CheckCircle } from 'lucide-react';

interface AuthorizationModalProps {
  isOpen: boolean;
  selectedTherapy: string;
  onClose: () => void;
  signatureId?: string;
  signatureDate?: string;
}

export default function AuthorizationModal({
  isOpen,
  selectedTherapy,
  onClose,
  signatureId,
  signatureDate
}: AuthorizationModalProps) {
  if (!isOpen) return null;

  // Display the passed-in signature details, or generate fallback if not provided
  const displaySignatureId = signatureId || "LINDE-AUTH-" + Math.random().toString(36).substring(7).toUpperCase();
  const displaySignatureDate = signatureDate || new Date().toLocaleString();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A1128]/40 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] p-10 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 border-t-8 border-[#2D9596]">
        <div className="w-16 h-16 bg-[#2D9596]/10 rounded-2xl flex items-center justify-center mb-6">
          <ShieldCheck className="w-8 h-8 text-[#2D9596]" />
        </div>
        <h3 className="text-2xl font-bold text-[#0A1128] mb-2">Transition Authorized</h3>
        <p className="text-sm text-[#5A6B7C] mb-8 leading-relaxed">
          Therapy transition to <strong>{selectedTherapy}</strong> has been clinically authorized and synced to the care team.
        </p>

        {/* Digital Signature Block */}
        <div className="bg-[#FAFAFA] border-2 border-dashed border-[#E8EEF2] rounded-2xl p-5 mb-8 relative overflow-hidden group">
          <div className="absolute top-[-10px] right-[-10px] opacity-10 group-hover:rotate-12 transition-transform">
            <ShieldCheck className="w-20 h-20 text-[#2D9596]" />
          </div>
          <p className="text-[9px] font-black text-[#2D9596] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
            <CheckCircle className="w-3 h-3" /> Digital Clinical Seal
          </p>
          <div className="space-y-1">
            <p className="text-sm font-serif italic text-[#0A1128] border-b border-[#E8EEF2] pb-1">Dr. Sarah Mitchell, MD</p>
            <p className="text-[8px] text-[#5A6B7C] font-mono">ID: {displaySignatureId}</p>
            <p className="text-[8px] text-[#5A6B7C] font-mono">DATE: {displaySignatureDate}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-[#0A1128] text-white py-5 rounded-2xl font-bold shadow-lg hover:shadow-[#0A1128]/20 transition-all active:scale-95"
        >
          Return to Cockpit
        </button>
      </div>
    </div>
  );
}
