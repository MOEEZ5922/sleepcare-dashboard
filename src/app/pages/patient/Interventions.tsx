import { useParams } from 'react-router';
import { Package, MapPin, Truck, CheckCircle, Activity, Battery, Smartphone, Watch, Wifi, HeartPulse, Signal, Loader2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { fetchInterventions, fetchDevices } from '../../data/api';

export default function PatientInterventions() {
  const { id } = useParams();
  const { data: liveInterventions, isLoading: isLoadingInt, error: intError } = useApi(() => fetchInterventions(id || '1'), {
    dependencies: [id],
    cacheKey: `interventions-${id || '1'}`
  });

  const { data: liveDevices, isLoading: isLoadingDev, error: devError } = useApi(() => fetchDevices(id || '1'), {
    dependencies: [id],
    cacheKey: `devices-${id || '1'}`
  });

  const isLive = !intError && !!liveInterventions;
  const delivery = (liveInterventions as any)?.patient?.upcomingDelivery || (liveInterventions as any)?.upcomingDelivery || null;
  const devices = Array.isArray(liveDevices) ? liveDevices : [];

  if ((isLoadingInt || isLoadingDev) && !liveInterventions) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-[#2D9596] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto pb-32">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-sm font-bold text-[#414D5B] uppercase tracking-widest">Equipment & Supplies</h2>
        {isLive && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#2D9596]/10 border border-[#2D9596]/20 rounded-md">
            <Signal className="w-3 h-3 text-[#2D9596]" />
            <span className="text-[10px] font-bold text-[#2D9596] uppercase tracking-wider">Live</span>
          </div>
        )}
      </div>

      {/* Delivery Status Card */}
      {delivery ? (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8EEF2]">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-[#2D9596]/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-[#2D9596]" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-[#5A6B7C] mb-1">{delivery.status}</p>
            <p className="text-xl font-semibold text-[#0A1128] mb-1">{delivery.item}</p>
            <div className="flex items-center gap-2 text-sm text-[#2D9596]">
              <MapPin className="w-4 h-4" />
              <span>Arriving {new Date(delivery.estimatedArrival).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="space-y-4">
          {delivery.steps.map((step: any, index: number) => {
            const isCompleted = step.completed;
            const isLast = index === delivery.steps.length - 1;

            return (
              <div key={index} className="relative">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCompleted
                        ? 'bg-[#6A994E] text-white'
                        : 'bg-[#E8EEF2] text-[#5A6B7C]'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : index === 1 ? (
                      <Truck className="w-5 h-5" />
                    ) : (
                      <div className="w-3 h-3 bg-current rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        isCompleted ? 'text-[#0A1128]' : 'text-[#5A6B7C]'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                </div>
                {!isLast && (
                  <div
                    className={`absolute left-5 top-10 bottom-0 w-0.5 h-6 ${
                      isCompleted ? 'bg-[#6A994E]' : 'bg-[#E8EEF2]'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      ) : (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8EEF2] text-center">
        <Package className="w-10 h-10 text-[#E8EEF2] mx-auto mb-3" />
        <p className="text-[#5A6B7C] text-sm">No pending deliveries for this patient.</p>
      </div>
      )}

      {/* Biomarker Wearables */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-[#E8EEF2]">
        <h3 className="text-[#0A1128] font-semibold mb-2 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#E76F51]" />
          Connected Clinical Sensors
        </h3>
        <p className="text-sm text-[#5A6B7C] mb-6">
          Your biomarker devices securely transmit physiological data to your care team to ensure therapy success.
        </p>
        
        <div className="space-y-3">
          {/* 1. Hexoskin */}
          <div className="flex items-center justify-between bg-[#FAFAFA] border border-[#E8EEF2] p-4 rounded-xl hover:border-[#2D9596]/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#2D9596]/10 rounded-lg flex items-center justify-center text-[#2D9596]">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-[#0A1128] text-sm">Hexoskin Smart Shirt</p>
                <div className="flex items-center gap-2 text-[10px] text-[#5A6B7C] mt-0.5">
                  <span className="flex items-center gap-1 text-[#6A994E]"><CheckCircle className="w-3 h-3" /> Connected</span>
                  <span>•</span>
                  <span>Worn 7.5 hrs last night</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <Battery className="w-4 h-4 text-[#6A994E]" />
                <span className="text-sm font-bold text-[#0A1128]">82%</span>
              </div>
              <p className="text-[10px] text-[#5A6B7C] mt-0.5">Synced 2h ago</p>
            </div>
          </div>

          {/* 2. Somno-Art Band */}
          <div className="flex items-center justify-between bg-[#FAFAFA] border border-[#E8EEF2] p-4 rounded-xl hover:border-[#2D9596]/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#0A1128]/5 rounded-lg flex items-center justify-center text-[#0A1128]">
                <Watch className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-[#0A1128] text-sm">Somno-Art Band</p>
                <div className="flex items-center gap-2 text-[10px] text-[#5A6B7C] mt-0.5">
                  <span className="flex items-center gap-1 text-[#6A994E]"><CheckCircle className="w-3 h-3" /> Connected</span>
                  <span>•</span>
                  <span>Sleep Staging Active</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <Battery className="w-4 h-4 text-[#F4A261]" />
                <span className="text-sm font-bold text-[#0A1128]">45%</span>
              </div>
              <p className="text-[10px] text-[#5A6B7C] mt-0.5">Synced 8h ago</p>
            </div>
          </div>

          {/* 3. Withings ScanWatch */}
          <div className="flex items-center justify-between bg-[#FAFAFA] border border-[#E8EEF2] p-4 rounded-xl hover:border-[#2D9596]/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#0A1128]/5 rounded-lg flex items-center justify-center text-[#0A1128]">
                <Watch className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-[#0A1128] text-sm">Withings ScanWatch</p>
                <div className="flex items-center gap-2 text-[10px] text-[#5A6B7C] mt-0.5">
                  <span className="flex items-center gap-1 text-[#6A994E]"><CheckCircle className="w-3 h-3" /> Connected</span>
                  <span>•</span>
                  <span>Heart Rate / SpO2 Tracker</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <Battery className="w-4 h-4 text-[#6A994E]" />
                <span className="text-sm font-bold text-[#0A1128]">90%</span>
              </div>
              <p className="text-[10px] text-[#5A6B7C] mt-0.5">Synced 1h ago</p>
            </div>
          </div>

          {/* 4. Withings BPM Core */}
          <div className="flex items-center justify-between bg-[#FAFAFA] border border-[#E8EEF2] p-4 rounded-xl hover:border-[#2D9596]/30 transition-colors opacity-70">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#E8EEF2] rounded-lg flex items-center justify-center text-[#5A6B7C]">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-[#0A1128] text-sm">Withings BPM Core</p>
                <div className="flex items-center gap-2 text-[10px] text-[#5A6B7C] mt-0.5">
                  <span className="flex items-center gap-1 text-[#F4A261]"><Wifi className="w-3 h-3" /> Pairing Required</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <button className="text-xs font-bold text-[#2D9596] bg-[#2D9596]/10 px-3 py-1.5 rounded-lg hover:bg-[#2D9596]/20 transition-colors">
                Setup Device
              </button>
            </div>
          </div>

          {/* 5. Masimo MightySat Rx */}
          <div className="flex items-center justify-between bg-[#FAFAFA] border border-[#E8EEF2] p-4 rounded-xl hover:border-[#2D9596]/30 transition-colors opacity-70">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#E8EEF2] rounded-lg flex items-center justify-center text-[#5A6B7C]">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-[#0A1128] text-sm">Masimo MightySat Rx</p>
                <div className="flex items-center gap-2 text-[10px] text-[#5A6B7C] mt-0.5">
                  <span>Not configured for your therapy plan</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <button className="text-xs font-bold text-[#5A6B7C] bg-[#E8EEF2] px-3 py-1.5 rounded-lg opacity-50 cursor-not-allowed">
                Unavailable
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Why You're Getting This */}
      <div className="bg-gradient-to-br from-[#2D9596]/10 to-[#2D9596]/5 rounded-2xl p-6">
        <h3 className="text-lg text-[#0A1128] mb-3">Why You're Getting This</h3>
        <p className="text-[#5A6B7C] mb-4">
          Your current mask has been in use for over 60 days. Regular mask replacements ensure:
        </p>
        <ul className="space-y-2 text-sm text-[#5A6B7C]">
          <li className="flex items-start gap-2">
            <span className="text-[#2D9596]">✓</span>
            <span>Better seal and less air leakage</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#2D9596]">✓</span>
            <span>More comfortable fit</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#2D9596]">✓</span>
            <span>More effective therapy</span>
          </li>
        </ul>
      </div>

      {/* Contact Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg text-[#0A1128] mb-4">Need Help?</h3>
        <p className="text-sm text-[#5A6B7C] mb-4">
          Questions about your delivery or need to make changes?
        </p>
        <button className="w-full bg-[#2D9596] text-white px-6 py-3 rounded-xl hover:bg-[#247a7a] transition-colors font-medium">
          Contact My Technician
        </button>
      </div>
    </div>
  );
}
