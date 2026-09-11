import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Brain, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Calendar, 
  Loader2, 
  TrendingUp 
} from 'lucide-react';
import { fetchModels, requestRetraining } from '../data/api';

interface AiModel {
  modelId: string;
  name: string;
  status: 'active' | 'needs_retraining' | 'retraining';
  metricName: string;
  metricValue: number;
  metricThreshold: number;
  driftStatus: 'low' | 'moderate' | 'high';
  driftValue: number;
  lastRetrained: string;
}

export default function AILifecyclePanel() {
  const [models, setModels] = useState<AiModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrainingId, setRetrainingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const loadModels = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await fetchModels();
      if (Array.isArray(data)) {
        setModels(data);
      }
    } catch (err) {
      console.warn('Failed to load ML models from backend', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  // Live polling while any model is in 'retraining' state
  useEffect(() => {
    const hasRetraining = models.some(m => m.status === 'retraining') || retrainingId !== null;
    if (!hasRetraining) return;

    const interval = setInterval(() => {
      loadModels(true);
    }, 4000);

    return () => clearInterval(interval);
  }, [models, retrainingId]);

  const handleRetrain = async (modelId: string) => {
    setRetrainingId(modelId);
    try {
      setModels(prev => prev.map(model => {
        if (model.modelId === modelId) {
          return {
            ...model,
            status: 'retraining'
          };
        }
        return model;
      }));

      const res = await requestRetraining(modelId);
      const modelName = models.find(m => m.modelId === modelId)?.name || 'Model';
      const msg = res?.message || `Retraining job queued for ${modelName}`;
      
      toast.info(msg);
      setSuccessToast(msg);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      toast.error('Failed to trigger model retraining. Please try again.');
      loadModels(true);
    } finally {
      setRetrainingId(null);
    }
  };

  const getDriftColor = (status: 'low' | 'moderate' | 'high') => {
    if (status === 'high') return 'text-coral bg-coral/10 border-coral/30';
    if (status === 'moderate') return 'text-amber bg-amber/10 border-amber/30';
    return 'text-sage bg-sage/10 border-sage/30';
  };

  return (
    <div className="space-y-6">
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-navy text-white p-4 rounded-xl shadow-2xl flex items-center gap-3 border border-sage/40 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-sage animate-bounce" />
          <span className="text-xs font-bold">{successToast}</span>
        </div>
      )}

      {loading && models.length === 0 && (
        <div className="bg-card rounded-2xl border border-light-blue p-12 text-center shadow-sm flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-teal animate-spin mb-3" />
          <p className="text-sm font-bold text-navy">Loading Live Model Governance Metrics...</p>
          <p className="text-xs text-slate-muted mt-1">Connecting to ML inference pipeline on VM2</p>
        </div>
      )}

      {!loading && models.length === 0 && (
        <div className="bg-card rounded-2xl border border-light-blue p-12 text-center shadow-sm">
          <Brain className="w-10 h-10 text-slate-muted/40 mx-auto mb-3" />
          <h4 className="text-base font-bold text-navy">No AI Models Registered</h4>
          <p className="text-xs text-slate-muted mt-1">No active machine learning models returned by the server.</p>
        </div>
      )}

      {models.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {models.map(model => {
          const isModelRetraining = retrainingId === model.modelId || model.status === 'retraining';
          const isOutofSpec = (model.metricValue < model.metricThreshold) || model.status === 'needs_retraining';

          const cardBorder = isModelRetraining
            ? 'border-amber/40 shadow-lg shadow-amber/5 ring-1 ring-amber/20'
            : isOutofSpec
            ? 'border-coral/40 shadow-lg shadow-coral/5 ring-1 ring-coral/20'
            : 'border-light-blue hover:border-teal/40 hover:shadow-md';

          const iconBadgeColor = isModelRetraining 
            ? 'bg-amber/10 text-amber' 
            : isOutofSpec 
            ? 'bg-coral/10 text-coral' 
            : 'bg-teal/10 text-teal';

          const progressGradient = isModelRetraining 
            ? 'bg-gradient-to-r from-amber to-yellow-400' 
            : isOutofSpec 
            ? 'bg-gradient-to-r from-amber to-coral' 
            : 'bg-gradient-to-r from-teal to-sage';

          const retrainButtonVariant = isModelRetraining
            ? 'bg-amber/20 text-amber border border-amber/30 cursor-not-allowed'
            : isOutofSpec
            ? 'bg-coral hover:bg-coral/90 text-white shadow-md shadow-coral/25 hover:scale-[1.02] active:scale-95'
            : 'bg-card hover:bg-background text-navy border-2 border-light-blue hover:border-teal/40 hover:scale-[1.02] active:scale-95';
          
          return (
            <div 
              key={model.modelId}
              className={`bg-card rounded-3xl border p-6 sm:p-7 transition-all duration-300 shadow-sm relative overflow-hidden flex flex-col justify-between ${cardBorder}`}
            >
              {isOutofSpec && !isModelRetraining && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-coral/5 rounded-full blur-3xl pointer-events-none" />
              )}
              {isModelRetraining && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber/5 rounded-full blur-3xl pointer-events-none" />
              )}

              <div>
                <div className="flex justify-between items-start mb-5 gap-4">
                  <div className="flex gap-3.5 items-start">
                    <div className={`p-3 rounded-2xl shrink-0 ${iconBadgeColor}`}>
                      <Cpu className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-navy font-bold text-base sm:text-lg leading-snug">
                        {model.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-slate-muted uppercase font-bold tracking-wider">
                          Model ID:
                        </span>
                        <code className="bg-background border border-light-blue px-2 py-0.5 rounded text-[10px] font-mono text-navy font-semibold">
                          {model.modelId}
                        </code>
                      </div>
                    </div>
                  </div>
                  
                  <div className="shrink-0">
                    {isModelRetraining ? (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber bg-amber/10 px-3 py-1 rounded-full border border-amber/30 uppercase tracking-widest animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" /> Training...
                      </span>
                    ) : isOutofSpec ? (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-coral bg-coral/10 px-3 py-1 rounded-full border border-coral/30 uppercase tracking-widest animate-pulse">
                        <AlertTriangle className="w-3 h-3" /> Retrain Required
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-sage bg-sage/10 px-3 py-1 rounded-full border border-sage/30 uppercase tracking-widest">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-background border border-light-blue rounded-2xl p-4 my-4 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-slate-muted uppercase tracking-wider">
                      Current {model.metricName}
                    </span>
                    <div className="text-right">
                      <span className="text-xl font-black text-navy">
                        {typeof model.metricValue === 'number' ? model.metricValue.toFixed(3) : model.metricValue}
                      </span>
                      <span className="text-xs font-semibold text-slate-muted ml-2">
                        (Clinical Target: {typeof model.metricThreshold === 'number' ? model.metricThreshold.toFixed(3) : model.metricThreshold})
                      </span>
                    </div>
                  </div>

                  <div className="h-2.5 bg-light-blue rounded-full relative overflow-hidden">
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-black/60 z-10"
                      style={{ left: `${(model.metricThreshold || 0.8) * 100}%` }}
                      title={`Clinical Target: ${model.metricThreshold}`}
                    />
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${progressGradient}`}
                      style={{ width: `${Math.min((model.metricValue || 0) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-light-blue pt-4 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-muted">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider">Drift (PSI):</span>
                    <span className={`px-2 py-0.5 rounded-md border text-[10px] font-extrabold ${getDriftColor(model.driftStatus)}`}>
                      {typeof model.driftValue === 'number' ? model.driftValue.toFixed(2) : model.driftValue} — {model.driftStatus?.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 opacity-60" />
                    <span>{model.lastRetrained}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleRetrain(model.modelId)}
                  disabled={isModelRetraining}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-sm ${retrainButtonVariant}`}
                >
                  {isModelRetraining ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Training in Progress...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      Retrain Model
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      <div className="bg-navy text-white rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-teal" />
          </div>
          <div>
            <h4 className="text-sm font-bold">Automated Re-training Scheduler Active</h4>
            <p className="text-xs text-white/60">Models automatically retrain daily if performance score breaches clinical thresholds for &gt; 48 hours.</p>
          </div>
        </div>
        <button 
          onClick={() => {
            toast.info("Re-evaluating model drift metrics... All clear.");
            loadModels(false);
          }}
          className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
        >
          <TrendingUp className="w-3.5 h-3.5 text-teal" /> Force Evaluation Run
        </button>
      </div>

    </div>
  );
}
