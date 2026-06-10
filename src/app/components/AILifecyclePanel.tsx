import { useState } from 'react';
import { toast } from 'sonner';
import { 
  Brain, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Calendar, 
  Loader2, 
  TrendingUp, 
  Gauge, 
  BarChart3 
} from 'lucide-react';

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
  const [models, setModels] = useState<AiModel[]>([
    {
      modelId: 'dropout_predictor',
      name: 'Therapy Dropout Predictor',
      status: 'needs_retraining',
      metricName: 'AUROC',
      metricValue: 0.812,
      metricThreshold: 0.850,
      driftStatus: 'high',
      driftValue: 0.28,
      lastRetrained: '28 days ago'
    },
    {
      modelId: 'ahi_detector',
      name: 'AHI Anomaly Detector',
      status: 'active',
      metricName: 'F1-Score',
      metricValue: 0.892,
      metricThreshold: 0.850,
      driftStatus: 'low',
      driftValue: 0.04,
      lastRetrained: '5 days ago'
    },
    {
      modelId: 'leak_classifier',
      name: 'Leak Instability Classifier',
      status: 'active',
      metricName: 'Precision',
      metricValue: 0.874,
      metricThreshold: 0.800,
      driftStatus: 'moderate',
      driftValue: 0.14,
      lastRetrained: '12 days ago'
    },
    {
      modelId: 'sleep_synthesizer',
      name: 'Wearable Sleep Synthesizer',
      status: 'active',
      metricName: 'R-Squared',
      metricValue: 0.781,
      metricThreshold: 0.750,
      driftStatus: 'low',
      driftValue: 0.08,
      lastRetrained: '18 days ago'
    }
  ]);

  const [retrainingId, setRetrainingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleRetrain = (modelId: string) => {
    setRetrainingId(modelId);
    
    // Simulate training progress
    setTimeout(() => {
      setModels(prev => prev.map(model => {
        if (model.modelId === modelId) {
          return {
            ...model,
            status: 'active',
            metricValue: Number((model.metricThreshold + 0.05 + Math.random() * 0.04).toFixed(3)),
            driftStatus: 'low',
            driftValue: Number((0.01 + Math.random() * 0.03).toFixed(3)),
            lastRetrained: 'Just now'
          };
        }
        return model;
      }));
      setRetrainingId(null);
      const modelName = models.find(m => m.modelId === modelId)?.name || 'Model';
      setSuccessToast(`${modelName} retrained successfully!`);
      setTimeout(() => setSuccessToast(null), 4000);
    }, 3000);
  };

  const getDriftColor = (status: 'low' | 'moderate' | 'high') => {
    if (status === 'high') return 'text-[#E76F51] bg-[#E76F51]/10 border-[#E76F51]/30';
    if (status === 'moderate') return 'text-[#F4A261] bg-[#F4A261]/10 border-[#F4A261]/30';
    return 'text-[#6A994E] bg-[#6A994E]/10 border-[#6A994E]/30';
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A1128] text-white p-4 rounded-xl shadow-2xl flex items-center gap-3 border border-[#6A994E]/40 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-[#6A994E] animate-bounce" />
          <span className="text-xs font-bold">{successToast}</span>
        </div>
      )}

      {/* Grid Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {models.map(model => {
          const isModelRetraining = retrainingId === model.modelId;
          const isOutofSpec = model.metricValue < model.metricThreshold;
          
          return (
            <div 
              key={model.modelId}
              className={`bg-white rounded-2xl border p-6 transition-all duration-300 shadow-sm relative overflow-hidden flex flex-col justify-between h-[280px] ${
                isOutofSpec && model.status !== 'retraining'
                  ? 'border-[#E76F51]/40 shadow-md shadow-[#E76F51]/5 ring-1 ring-[#E76F51]/10' 
                  : 'border-[#E8EEF2] hover:border-[#2D9596]/30'
              }`}
            >
              {/* Pulsating background for out-of-spec */}
              {isOutofSpec && model.status !== 'retraining' && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#E76F51]/5 rounded-full blur-2xl pointer-events-none" />
              )}

              {/* Card Title block */}
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3">
                    <div className={`p-2 rounded-xl ${isOutofSpec ? 'bg-[#E76F51]/10 text-[#E76F51]' : 'bg-[#2D9596]/10 text-[#2D9596]'}`}>
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-[#0A1128] font-bold text-sm leading-snug">{model.name}</h4>
                      <p className="text-[10px] text-[#5A6B7C] uppercase font-bold tracking-wider mt-0.5">Model ID: {model.modelId}</p>
                    </div>
                  </div>
                  
                  {/* Status Badges */}
                  {isModelRetraining ? (
                    <span className="flex items-center gap-1 text-[9px] font-bold text-[#F4A261] bg-[#F4A261]/10 px-2 py-0.5 rounded-full border border-[#F4A261]/30 uppercase tracking-widest">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" /> Training
                    </span>
                  ) : isOutofSpec ? (
                    <span className="flex items-center gap-1 text-[9px] font-bold text-[#E76F51] bg-[#E76F51]/10 px-2 py-0.5 rounded-full border border-[#E76F51]/30 uppercase tracking-widest animate-pulse">
                      <AlertTriangle className="w-2.5 h-2.5" /> Retrain Required
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[9px] font-bold text-[#6A994E] bg-[#6A994E]/10 px-2 py-0.5 rounded-full border border-[#6A994E]/30 uppercase tracking-widest">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Active
                    </span>
                  )}
                </div>

                {/* Score and Threshold progress bar */}
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between items-end text-xs font-semibold">
                    <span className="text-[#5A6B7C]">Current {model.metricName}</span>
                    <span className="text-[#0A1128] font-bold">
                      {model.metricValue.toFixed(3)} 
                      <span className="text-[#5A6B7C] font-normal text-[10px] ml-1">
                        (Thresh: {model.metricThreshold.toFixed(3)})
                      </span>
                    </span>
                  </div>
                  <div className="h-2 bg-[#E8EEF2] rounded-full relative">
                    {/* Threshold vertical line indicator */}
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-black/40 z-10"
                      style={{ left: `${model.metricThreshold * 100}%` }}
                      title={`Threshold: ${model.metricThreshold}`}
                    />
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOutofSpec ? 'bg-[#E76F51]' : 'bg-[#6A994E]'
                      }`}
                      style={{ width: `${model.metricValue * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Metadata & CTAs */}
              <div className="border-t border-[#E8EEF2] pt-4 mt-4 flex items-center justify-between text-[11px] font-bold text-[#5A6B7C]">
                <div className="flex items-center gap-4">
                  {/* Drift index status */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-[#5A6B7C] uppercase tracking-tighter">Drift (PSI)</span>
                    <span className={`px-2 py-0.5 rounded-md border text-[9px] font-extrabold ${getDriftColor(model.driftStatus)}`}>
                      {model.driftValue.toFixed(2)} — {model.driftStatus.toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Last Retrained Date */}
                  <div className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 opacity-55" />
                    <span>{model.lastRetrained}</span>
                  </div>
                </div>

                {/* Retrain Trigger Button */}
                <button
                  onClick={() => handleRetrain(model.modelId)}
                  disabled={isModelRetraining}
                  className={`px-4 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
                    isModelRetraining
                      ? 'bg-[#E8EEF2] text-[#5A6B7C] cursor-not-allowed'
                      : isOutofSpec
                      ? 'bg-[#E76F51] hover:bg-[#d45e41] text-white shadow-md shadow-[#E76F51]/20 hover:scale-105 active:scale-95'
                      : 'bg-[#FAFAFA] hover:bg-[#E8EEF2] text-[#0A1128] border border-[#E8EEF2]'
                  }`}
                >
                  {isModelRetraining ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Retraining...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3" />
                      Retrain
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Model Health Summary Footer */}
      <div className="bg-[#0A1128] text-white rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-[#2D9596]" />
          </div>
          <div>
            <h4 className="text-sm font-bold">Automated Re-training Scheduler Active</h4>
            <p className="text-xs text-white/60">Models automatically retrain daily if performance score breaches clinical thresholds for &gt; 48 hours.</p>
          </div>
        </div>
        <button 
          onClick={() => toast.info("Re-evaluating model drift metrics... All clear.")}
          className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
        >
          <TrendingUp className="w-3.5 h-3.5 text-[#2D9596]" /> Force Evaluation Run
        </button>
      </div>

    </div>
  );
}
