import { Phone, MessageCircle, AlertCircle, CheckCircle2, Signal, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router';
import { toast } from 'sonner';
import { createSupportTicket } from '../../data/api';

export default function PatientHelp() {
  const { id } = useParams();
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportType, setReportType] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReport = async () => {
    setIsSubmitting(true);
    try {
      await createSupportTicket(id || '1', {
        issue_type: reportType,
        details: reportDetails
      });
      setShowConfirmation(true);
      setTimeout(() => {
        setShowReportForm(false);
        setShowConfirmation(false);
        setReportType('');
        setReportDetails('');
      }, 3000);
    } catch (err) {
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto pb-32">
      <div className="flex justify-between items-center px-2">
        <h1 className="text-2xl text-[#0A1128] font-bold">Support Center</h1>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#2D9596]/10 border border-[#2D9596]/20 rounded-md">
          <Signal className="w-3 h-3 text-[#2D9596]" />
          <span className="text-[10px] font-bold text-[#2D9596] uppercase tracking-wider">Live</span>
        </div>
      </div>

      {/* Self-Reporting Tool - Prominent */}
      <div className="bg-gradient-to-br from-[#2D9596] to-[#1a7273] text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Report an Issue</h2>
              <p className="text-white/90 text-sm">
                Direct channel to your technician for equipment support.
              </p>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 mb-6 border border-white/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#F4A261]" />
              <div className="text-xs text-white/95">
                <p className="font-bold mb-1 uppercase tracking-wider text-[10px]">Human-in-the-Loop Protocol</p>
                <p>Your report will <span className="font-bold">alert a technician</span> and automatically update your clinical profile for review.</p>
              </div>
            </div>
          </div>

          {!showReportForm ? (
            <button
              onClick={() => setShowReportForm(true)}
              className="w-full bg-white text-[#0A1128] py-4 rounded-xl font-bold hover:bg-white/95 transition-all shadow-md text-lg active:scale-95"
            >
              Start Support Ticket
            </button>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-300">
              {!showConfirmation ? (
                <>
                  <div>
                    <label className="block text-white/90 text-xs font-bold uppercase tracking-widest mb-2">Category</label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="w-full px-4 py-4 rounded-xl bg-white text-[#0A1128] border-none focus:outline-none focus:ring-4 focus:ring-white/20 font-medium"
                    >
                      <option value="">Select issue type...</option>
                      <option value="mask_leak">Mask is leaking air</option>
                      <option value="mask_discomfort">Mask feels uncomfortable</option>
                      <option value="machine_noise">Machine making noise</option>
                      <option value="dry_nose">Dry nose or throat</option>
                      <option value="pressure_issue">Pressure feels wrong</option>
                      <option value="other">Other issue</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/90 text-xs font-bold uppercase tracking-widest mb-2">Details (Optional)</label>
                    <textarea
                      value={reportDetails}
                      onChange={(e) => setReportDetails(e.target.value)}
                      placeholder="Describe what's happening..."
                      rows={4}
                      className="w-full px-4 py-4 rounded-xl bg-white text-[#0A1128] border-none focus:outline-none focus:ring-4 focus:ring-white/20 font-medium placeholder-[#5A6B7C]/50"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowReportForm(false)}
                      className="flex-1 bg-white/10 text-white py-4 rounded-xl font-bold hover:bg-white/20 transition-all uppercase text-xs tracking-widest"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitReport}
                      disabled={!reportType || isSubmitting}
                      className="flex-1 bg-white text-[#0A1128] py-4 rounded-xl font-bold hover:bg-white/95 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase text-xs tracking-widest"
                    >
                      {isSubmitting ? 'Sending...' : 'Submit Report'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-white/20 rounded-2xl p-8 text-center animate-in zoom-in-95 duration-300 border border-white/30">
                  <div className="w-16 h-16 bg-[#6A994E] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#6A994E]/20">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Report Transmitted!</h3>
                  <p className="text-white/90 text-sm leading-relaxed">
                    A clinical technician has been alerted and will contact you via phone or app message within 24 hours.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Call Button */}
      <button className="w-full bg-white border-2 border-[#E8EEF2] text-[#0A1128] p-8 rounded-3xl shadow-sm hover:shadow-md transition-all group active:scale-95">
        <div className="w-16 h-16 bg-[#6A994E]/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#6A994E] group-hover:text-white transition-all">
          <Phone className="w-8 h-8" />
        </div>
        <p className="text-2xl font-bold mb-1">Call My Technician</p>
        <p className="text-[#5A6B7C] text-sm mb-6 uppercase tracking-widest font-bold">Standard Support Line</p>
        <div className="bg-[#E8EEF2] px-8 py-3 rounded-2xl inline-block group-hover:bg-[#0A1128] group-hover:text-white transition-all">
          <p className="text-xl font-mono font-bold">1-800-555-CPAP</p>
        </div>
      </button>

      {/* Common Issues */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E8EEF2]">
        <h3 className="text-sm font-bold text-[#414D5B] uppercase tracking-widest mb-6">Self-Help Library</h3>
        <div className="space-y-4">
          {[
            { q: 'My mask feels uncomfortable', sub: 'Tips for better comfort' },
            { q: 'I hear air leaking', sub: 'How to fix mask leaks' },
            { q: 'My nose feels dry', sub: 'Humidifier settings help' },
            { q: 'Cleaning my equipment', sub: 'Weekly maintenance guide' }
          ].map((item, idx) => (
            <button key={idx} className="w-full text-left p-5 bg-[#FAFAFA] rounded-2xl border border-[#E8EEF2] hover:border-[#2D9596]/30 hover:bg-white transition-all group">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[#0A1128] font-bold mb-1">{item.q}</p>
                  <p className="text-xs text-[#5A6B7C] font-medium">{item.sub}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#CBD5E1] group-hover:text-[#2D9596] transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-[#E76F51]/5 border-2 border-[#E76F51]/10 rounded-3xl p-6 text-center">
        <div className="w-10 h-10 bg-[#E76F51]/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6 text-[#E76F51]" />
        </div>
        <h4 className="text-[#0A1128] font-bold mb-2">Medical Emergency?</h4>
        <p className="text-sm text-[#5A6B7C] leading-relaxed">
          For urgent medical concerns, call <span className="font-bold text-[#E76F51]">911</span> or visit the ER immediately. This app is for equipment support only.
        </p>
      </div>

      {/* Support Hours */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#E8EEF2]">
        <h3 className="text-sm font-bold text-[#414D5B] uppercase tracking-widest mb-6">Service Hours</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-[#5A6B7C] font-medium">Monday - Friday</span>
            <span className="text-[#0A1128] font-bold">8:00 AM - 8:00 PM</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#5A6B7C] font-medium">Saturday</span>
            <span className="text-[#0A1128] font-bold">9:00 AM - 5:00 PM</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#5A6B7C] font-medium">Sunday</span>
            <span className="text-white bg-[#5A6B7C] px-2 py-0.5 rounded text-[10px] font-bold uppercase">Closed</span>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-[#E8EEF2]">
          <p className="text-[11px] text-[#5A6B7C] italic text-center">
            After-hours support is available via the ticket system above.
          </p>
        </div>
      </div>
    </div>
  );
}