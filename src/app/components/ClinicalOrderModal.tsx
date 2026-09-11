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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm">
      <div className="bg-card rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold text-navy mb-2">Issue Clinical Order</h3>
        <p className="text-xs text-slate-muted mb-6">Log the next clinical step in the patient's record.</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Order details..."
          className="w-full h-32 bg-background border border-light-blue rounded-xl p-4 text-sm focus:ring-2 focus:ring-teal outline-none mb-6"
        />
        <div className="flex gap-3">
          <button onClick={onClose} disabled={isSubmitting} className="flex-1 py-4 bg-light-blue text-slate-muted font-bold rounded-xl text-xs hover:bg-light-blue/80 transition-colors">Cancel</button>
          <button onClick={onSubmit} disabled={!notes || isSubmitting} className="flex-[2] py-4 bg-teal text-white font-bold rounded-xl text-xs shadow-lg shadow-teal/20 flex items-center justify-center gap-1.5 hover:bg-teal/90 transition-all disabled:opacity-50">
            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            Sign & Log Order
          </button>
        </div>
      </div>
    </div>
  );
}
