import { useState } from 'react';
import { useNavigate } from 'react-router';
import { User, Lock, Loader2, ArrowLeft } from 'lucide-react';
import lindeLogoImg from '../../../assets/LindeLogo.png';

export default function PatientLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both Patient ID and Password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    try {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'patient',
          user_id: username.trim(),
          password: password.trim()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store token and role
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        if (data.role) {
          localStorage.setItem('role', data.role);
        }

        // Route based on role returned, or fallback to patient ID
        const userRole = data.role?.toLowerCase() || 'patient';
        const internalId = data.internal_id || username.trim();
        if (userRole === 'physician') {
          navigate('/physician');
        } else if (userRole === 'technician') {
          navigate('/technician');
        } else {
          navigate(`/patient/${internalId}`);
        }
        return;
      }

      // Handle non-200 responses from live server
      const data = await response.json().catch(() => ({}));
      const detail = data.detail || `Authentication failed (Status ${response.status})`;

      setErrorMsg(detail === 'Invalid credentials' ? 'Invalid Patient ID or Password.' : detail);
      setLoading(false);
    } catch (err: any) {
      console.warn('Backend login network query failed', err);
      setErrorMsg('Unable to connect to the authentication service. Please check your internet or try again later.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#003867] via-[#002244] to-[#018EC6] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative ambient background spots */}
      <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-[#018EC6]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#018EC6]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-white/10 relative z-10 animate-[fadeIn_0.5s_ease-out]">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="absolute left-6 top-6 text-[#5A6B7C] hover:text-[#003867] transition-colors flex items-center gap-1.5 text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Logo and Header */}
        <div className="text-center mt-6 mb-8">
          <img src={lindeLogoImg} alt="Linde Logo" className="h-10 mx-auto mb-4 object-contain" />
          <h2 className="text-xl font-black text-[#003867] uppercase tracking-wider">SleepCare Portal</h2>
          <p className="text-xs text-[#5A6B7C] mt-1 font-semibold">Sign in to your patient dashboard</p>
        </div>

        {/* Messages */}
        {errorMsg && (
          <div className="bg-[#E76F51]/10 border-l-4 border-[#E76F51] text-[#E76F51] p-3 rounded-lg text-xs font-bold mb-5">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[10px] text-[#5A6B7C] uppercase font-black tracking-widest block mb-2">Patient ID / Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#5A6B7C]">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. 999999001"
                className="w-full bg-[#FAFAFA] border-2 border-[#E8EEF2] rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-[#0A1128] focus:outline-none focus:border-[#018EC6] transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[#5A6B7C] uppercase font-black tracking-widest block mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#5A6B7C]">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#FAFAFA] border-2 border-[#E8EEF2] rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-[#0A1128] focus:outline-none focus:border-[#018EC6] transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#003867] hover:bg-[#002b50] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#003867]/25 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-xs font-semibold text-[#5A6B7C]">
          Don't have an account?{' '}
          <button 
            type="button" 
            onClick={() => navigate('/signup')}
            className="text-[#018EC6] hover:underline font-bold"
          >
            Sign Up
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
