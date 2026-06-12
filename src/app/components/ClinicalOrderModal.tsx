import { FileSignature, Loader2 } from 'lucide-react';

interface ClinicalOrderModalProps {
  isOpen: boolean;
  notes: string;
  setNotes: (notes: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export default function ClinicalOrderModal({
  isOpen,
  notes,
  setNotes,
  onClose,
  onSubmit,
  isSubmitting = false
}: ClinicalOrderModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A1128]/40 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold text-[#0A1128] mb-2">Issue Clinical Order</h3>
        <p className="text-xs text-[#5A6B7C] mb-6">Log the next clinical step in the patient's record.</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Order details..."
          className="w-full h-32 bg-[#FAFAFA] border border-[#E8EEF2] rounded-xl p-4 text-sm focus:ring-2 focus:ring-[#2D9596] outline-none mb-6"
        />
        <div className="flex gap-3">
          <button onClick={onClose} disabled={isSubmitting} className="flex-1 py-4 bg-[#E8EEF2] text-[#5A6B7C] font-bold rounded-xl text-xs">Cancel</button>
          <button onClick={onSubmit} disabled={!notes || isSubmitting} className="flex-2 py-4 bg-[#2D9596] text-white font-bold rounded-xl text-xs shadow-lg shadow-[#2D9596]/20 flex items-center justify-center gap-1.5">
            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            Sign & Log Order
          </button>
        </div>
      </div>
    </div>
  );
}
