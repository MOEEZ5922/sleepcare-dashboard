import { Link } from 'react-router';
import { toast } from 'sonner';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Signal,
  Settings2
} from 'lucide-react';
import { WeeklyAnalysis } from '../data/api';

interface RecommendationBannerProps {
  isCompact: boolean;
  isLive: boolean;
  role: 'physician' | 'technician';
  patientId: string;
  ai: WeeklyAnalysis | undefined;
  nextAction: {
    type: string;
    rationale: string;
    deliveryMode: string;
    reassessmentWindow: string;
  };
  gateStatus: 'pending' | 'accepted' | 'rejected';
  setGateStatus: (status: 'pending' | 'accepted' | 'rejected') => void;
  showRejectMenu: boolean;
  setShowRejectMenu: (show: boolean) => void;
  rejectReason: string;
  setRejectReason: (reason: string) => void;
  onAccept: () => void;
  onReject: (reason: string) => void;
  onUndo: () => void;
}

export default function RecommendationBanner({
  isCompact,
  isLive,
  role,
  patientId,
  ai,
  nextAction,
  gateStatus,
  setGateStatus,
  showRejectMenu,
  setShowRejectMenu,
  rejectReason,
  setRejectReason,
  onAccept,
  onReject,
  onUndo
}: RecommendationBannerProps) {
  return (
    <div className="bg-navy text-white rounded-2xl p-6 shadow-xl border-l-8 border-coral relative overflow-hidden">
      {gateStatus === 'accepted' && <div className="absolute inset-0 bg-sage/10 pointer-events-none" />}
      {gateStatus === 'rejected' && <div className="absolute inset-0 bg-coral/10 pointer-events-none" />}

      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4">
          <div className="bg-coral/20 p-2 rounded-xl h-fit">
            <AlertTriangle className={`w-8 h-8 ${gateStatus === 'rejected' ? 'text-coral' : 'text-amber'}`} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold">Action Recommendation: {nextAction.type}</h2>
              {isLive && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-sage/20 border border-sage/30 rounded text-[9px] font-bold uppercase tracking-widest text-sage">
                  <Signal className="w-2.5 h-2.5" /> Live
                </div>
              )}
              {gateStatus === 'accepted' && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-sage bg-sage/10 px-2 py-0.5 rounded border border-sage/30 uppercase tracking-widest">
                  <CheckCircle className="w-3 h-3" /> Approved
                </span>
              )}
              {gateStatus === 'rejected' && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-coral bg-coral/10 px-2 py-0.5 rounded border border-coral/30 uppercase tracking-widest">
                  <XCircle className="w-3 h-3" /> Rejected
                </span>
              )}
            </div>
            <p className="text-white/70 text-sm max-w-2xl leading-relaxed mt-1 border-l-2 border-amber pl-3 italic">
              Rationale: {nextAction.rationale}
            </p>
          </div>
        </div>
        {!isCompact && (
          <div className="text-right whitespace-nowrap">
            <div className="bg-white/10 px-3 py-1 rounded-lg text-xs font-semibold mb-2">
              ESCALATED {ai?.weekOf || 'ACTIVE'}
            </div>
            <div className="text-2xl font-bold text-coral">Risk: {ai?.compositeRiskScore || 0}</div>
            {ai?.confidenceLevel !== undefined && ai.confidenceLevel < 85 && (
              <Link
                to={`/${role}/patient/${patientId}/ai-analysis`}
                className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold text-amber bg-amber/10 border border-amber/30 px-2 py-0.5 rounded uppercase hover:bg-amber/20 transition-all"
              >
                <AlertTriangle className="w-3 h-3 animate-pulse" />
                Evidence Incomplete
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <p className="text-[10px] text-white/50 mb-1 uppercase tracking-widest">Delivery Mode</p>
          <p className="font-semibold text-sm">{nextAction.deliveryMode || 'Digital Workflow'}</p>
        </div>
        <div>
          <p className="text-[10px] text-white/50 mb-1 uppercase tracking-widest">Reassessment Window</p>
          <p className="font-semibold text-sm">{nextAction.reassessmentWindow || 'Immediate'}</p>
        </div>
      </div>

      {/* Clinician Gate Action Area */}
      {gateStatus === 'pending' && (
        <div className="pt-6 border-t border-white/10">
          <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3">
            {role === 'physician' ? 'Clinician Gate' : 'Visit Prep / Technical Gate'}
          </h4>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onAccept}
              className="bg-sage hover:bg-sage/90 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 shadow-lg shadow-sage/20 hover:scale-[1.02] active:scale-[0.98] duration-200"
            >
              <CheckCircle className="w-4 h-4" /> Accept & Auto-Draft
            </button>
            <button
              onClick={() => toast.info("Opening modify action dialog...")}
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
            >
              <Settings2 className="w-4 h-4" /> Modify
            </button>
            <button
              onClick={() => setShowRejectMenu(!showRejectMenu)}
              className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 border ${showRejectMenu ? 'bg-coral/20 border-coral/50 text-coral' : 'bg-transparent border-coral/30 text-coral hover:bg-coral/10'}`}
            >
              <XCircle className="w-4 h-4" /> Reject
            </button>
          </div>

          {/* Reject Reason Input Area */}
          {showRejectMenu && (
            <div className="mt-4 p-4 bg-black/30 rounded-xl border border-coral/30 animate-in fade-in slide-in-from-top-2">
              <label className="text-[10px] font-bold text-coral uppercase tracking-widest mb-2 block">Required: Reject Reason Code</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="flex-1 bg-navy/80 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-coral outline-none transition-colors"
                >
                  <option value="">Select reason...</option>
                  <option value="CLIN_OVERRIDE">Clinical Override - Patient history</option>
                  <option value="WAIT_AND_SEE">Wait and See - Insufficient evidence</option>
                  <option value="PT_PREFERENCE">Patient Preference / Refusal</option>
                  <option value="OTHER">Other (Add Note)</option>
                </select>
                <button
                  onClick={() => onReject(rejectReason)}
                  disabled={!rejectReason}
                  className="bg-coral hover:bg-coral/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors shrink-0"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Post-Action View */}
      {gateStatus !== 'pending' && (
        <div className="mt-2 pt-4 border-t border-white/10 flex items-center justify-between">
          <p className="text-xs text-white/50">
            {gateStatus === 'accepted' ? 'Action successfully queued for dispatch.' : `Recommendation rejected with code: ${rejectReason || 'Unknown'}`}
          </p>
          <button
            onClick={onUndo}
            className="text-[10px] uppercase tracking-widest font-bold text-white/50 hover:text-white transition-colors"
          >
            Undo Decision
          </button>
        </div>
      )}
    </div>
  );
}
