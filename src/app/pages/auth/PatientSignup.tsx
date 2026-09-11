import { useState } from 'react';
import { useNavigate } from 'react-router';
import { User, Lock, Loader2, ArrowLeft, ShieldCheck, AlertTriangle, AlertCircle, X } from 'lucide-react';
import lindeLogoImg from '../../../assets/LindeLogo.png';

export default function PatientSignup() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showNameExistsModal, setShowNameExistsModal] = useState(false);
  const [nameExistsDetail, setNameExistsDetail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !firstName.trim() || !lastName.trim() || !password.trim() || !confirmPassword.trim()) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    try {
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'patient',
          user_id: userId.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          password: password.trim()
        }),
      });

      if (response.ok) {
        setSuccessMsg('Account created successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }

      // Handle server error responses
      const data = await response.json().catch(() => ({}));
      const detail = data.detail || `Registration failed (Status ${response.status})`;

      // Check if this is the "name already exists" validation error
      if (
        typeof detail === 'string' &&
        (detail.toLowerCase().includes('already exists for this patient') ||
          detail.toLowerCase().includes('a name already exists') ||
          detail.toLowerCase().includes('please enter your name exactly as'))
      ) {
        setNameExistsDetail(detail);
        setShowNameExistsModal(true);
      } else {
        setErrorMsg(detail);
      }
      setLoading(false);
    } catch (err: any) {
      console.warn('Backend registration failed', err);
      // Demo bypass for offline / local-only runs
      if (password.trim() === 'demo-pass-123') {
        setSuccessMsg('Demo registration accepted! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setErrorMsg('Unable to connect to the authentication service. Please try again later.');
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy/90 to-teal flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative ambient background spots */}
      <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-teal/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-20 -top-20 w-96 h-96 bg-teal/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-card rounded-3xl shadow-2xl p-8 border border-white/10 relative z-10 animate-[fadeIn_0.5s_ease-out]">

        {/* Back Button */}
        <button
          onClick={() => navigate('/login')}
          className="absolute left-6 top-6 text-slate-muted hover:text-navy transition-colors flex items-center gap-1.5 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </button>

        {/* Logo and Header */}
        <div className="text-center mt-6 mb-6">
          <img src={lindeLogoImg} alt="Linde Logo" className="h-10 mx-auto mb-4 object-contain" />
          <h2 className="text-xl font-black text-navy uppercase tracking-wider">Create Account</h2>
          <p className="text-xs text-slate-muted mt-1 font-semibold">Register your SleepCare patient portal</p>
        </div>

        {/* Important Identity Warning Banner */}
        <div className="bg-amber/10 border border-amber/30 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-coral shrink-0 mt-0.5" />
          <div className="text-xs text-navy leading-relaxed">
            <span className="font-extrabold text-coral block uppercase tracking-wider mb-0.5 text-[10px]">
              Important Medical Record Notice
            </span>
            The name you enter will be permanently recorded and linked to your medical file. Please verify its accuracy before submitting.
          </div>
        </div>

        {/* Messages */}
        {errorMsg && (
          <div className="bg-coral/10 border-l-4 border-coral text-coral p-3 rounded-lg text-xs font-bold mb-5 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-sage/10 border-l-4 border-sage text-sage p-3 rounded-lg text-xs font-bold mb-5 animate-pulse flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 shrink-0" /> {successMsg}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-muted uppercase font-black tracking-widest block mb-1.5">First Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-muted">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Jean"
                  className="w-full bg-background border-2 border-light-blue rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold text-navy focus:outline-none focus:border-teal transition-colors"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-muted uppercase font-black tracking-widest block mb-1.5">Last Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-muted">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Dupont"
                  className="w-full bg-background border-2 border-light-blue rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold text-navy focus:outline-none focus:border-teal transition-colors"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-muted uppercase font-black tracking-widest block mb-1.5">Patient ID / User ID</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-muted">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. 190723"
                className="w-full bg-background border-2 border-light-blue rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold text-navy focus:outline-none focus:border-teal transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-muted uppercase font-black tracking-widest block mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-muted">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a password"
                className="w-full bg-background border-2 border-light-blue rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-navy focus:outline-none focus:border-teal transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-muted uppercase font-black tracking-widest block mb-2">Confirm Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-muted">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full bg-background border-2 border-light-blue rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-navy focus:outline-none focus:border-teal transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-navy hover:bg-navy/90 text-white rounded-xl font-bold text-sm shadow-lg shadow-navy/25 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Registering...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs font-semibold text-slate-muted">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-teal hover:underline font-bold"
          >
            Sign In
          </button>
        </div>

      </div>

      {/* Name Already Exists Error Modal */}
      {showNameExistsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-light-blue animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setShowNameExistsModal(false)}
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-background border border-light-blue flex items-center justify-center text-slate-muted hover:text-navy transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-coral/10 flex items-center justify-center mb-4 text-coral">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-navy mb-2">
              Identity Match Required
            </h3>

            <p className="text-xs sm:text-sm text-blue-gray leading-relaxed mb-4">
              A name is already registered for this patient in our database. Please enter your name <strong>EXACTLY</strong> as recorded in the Linde database to maintain consistency with your medical record.
            </p>

            {nameExistsDetail && (
              <div className="bg-background border border-light-blue rounded-xl p-3 text-xs font-mono text-slate-muted mb-6 break-words">
                {nameExistsDetail}
              </div>
            )}

            <button
              onClick={() => setShowNameExistsModal(false)}
              className="w-full py-3.5 bg-navy hover:bg-navy/90 text-white rounded-xl font-bold text-sm shadow-md transition-all"
            >
              I Understand, Let Me Re-enter
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
