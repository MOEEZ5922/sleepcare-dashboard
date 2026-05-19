import React, { useState, useEffect } from 'react';
import { Signal, SignalLow, Loader2 } from 'lucide-react';
import { checkHealth } from '../../data/api';

export default function ConnectivityStatus() {
  const [status, setStatus] = useState<'checking' | 'live' | 'offline'>('checking');

  useEffect(() => {
    const check = async () => {
      try {
        const health = await checkHealth();
        if (health && (health.status === 'ok' || health.status === 'healthy' || health.status === 'UP' || health.message)) {
          setStatus('live');
        } else {
          setStatus('offline');
        }
      } catch (e) {
        setStatus('offline');
      }
    };

    check();
    const interval = setInterval(check, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  if (status === 'checking') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#E8EEF2]/50 rounded-lg">
        <Loader2 className="w-3 h-3 text-[#5A6B7C] animate-spin" />
        <span className="text-[10px] font-bold text-[#5A6B7C] uppercase tracking-wider">Syncing...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
      status === 'live' 
        ? 'bg-[#6A994E]/10 border-[#6A994E]/20 text-[#6A994E]' 
        : 'bg-[#E76F51]/10 border-[#E76F51]/20 text-[#E76F51]'
    }`}>
      {status === 'live' ? <Signal className="w-3 h-3" /> : <SignalLow className="w-3 h-3" />}
      <span className="text-[10px] font-bold uppercase tracking-wider">
        {status === 'live' ? 'Backend Live' : 'Backend Offline'}
      </span>
    </div>
  );
}
