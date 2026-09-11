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
      <div className="flex items-center gap-2 px-3 py-1.5 bg-light-blue/50 rounded-lg">
        <Loader2 className="w-3 h-3 text-slate-muted animate-spin" />
        <span className="text-[10px] font-bold text-slate-muted uppercase tracking-wider">Syncing...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
      status === 'live' 
        ? 'bg-sage/10 border-sage/20 text-sage' 
        : 'bg-coral/10 border-coral/20 text-coral'
    }`}>
      {status === 'live' ? <Signal className="w-3 h-3" /> : <SignalLow className="w-3 h-3" />}
      <span className="text-[10px] font-bold uppercase tracking-wider">
        {status === 'live' ? 'Backend Live' : 'Backend Offline'}
      </span>
    </div>
  );
}
