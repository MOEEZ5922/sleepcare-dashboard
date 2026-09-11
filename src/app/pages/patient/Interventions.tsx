import { useEffect } from 'react';
import { useParams } from 'react-router';
import { Package, MapPin, Truck, CheckCircle, Activity, Battery, Signal, Loader2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { fetchInterventions, fetchDevices, fetchMaskHistory, isLiveResponse } from '../../data/api';

export default function PatientInterventions() {
  const { id } = useParams();

  // Set visited equipment flag in localStorage on mount
  useEffect(() => {
    localStorage.setItem(`has-visited-equipment-${id || '1'}`, 'true');
  }, [id]);

  const { data: liveInterventions, isLoading: isLoadingInt } = useApi(() => fetchInterventions(id || '1'), {
    dependencies: [id],
    cacheKey: `interventions-${id || '1'}`
  });

  const { data: liveDevices, isLoading: isLoadingDev } = useApi(() => fetchDevices(id || '1'), {
    dependencies: [id],
    cacheKey: `devices-${id || '1'}`
  });

  const { data: maskHistory, isLoading: isLoadingMasks } = useApi(() => fetchMaskHistory(id || '1'), {
    dependencies: [id],
    cacheKey: `mask-history-${id || '1'}`
  });

  const isLive = isLiveResponse(liveInterventions);
  const delivery = (liveInterventions as { patient?: { upcomingDelivery?: any }; upcomingDelivery?: any })?.patient?.upcomingDelivery || (liveInterventions as { upcomingDelivery?: any })?.upcomingDelivery || null;
  const devices = Array.isArray(liveDevices) ? liveDevices : [];

  const formatNullValue = (val: any) => {
    if (val === null || val === undefined || val === '' || val === 0 || val === '0' || (typeof val === 'number' && isNaN(val))) {
      return '—';
    }
    return val;
  };

  const formatDateValue = (dateStr: any) => {
    if (!dateStr || dateStr === '0') return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '—';
    }
  };

  if ((isLoadingInt || isLoadingDev || isLoadingMasks) && !liveInterventions) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-teal animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto pb-32">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-sm font-bold text-blue-gray uppercase tracking-widest">Equipment & Supplies</h2>
        {isLive && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-teal/10 border border-teal/20 rounded-md">
            <Signal className="w-3 h-3 text-teal" />
            <span className="text-[10px] font-bold text-teal uppercase tracking-wider">Live</span>
          </div>
        )}
      </div>

      {/* Delivery Status Card */}
      {delivery ? (
      <div className="patient-card p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-teal/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-teal" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-muted mb-1">{delivery.status}</p>
            <p className="text-xl font-semibold text-navy mb-1">{delivery.item}</p>
            <div className="flex items-center gap-2 text-sm text-teal">
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
                        ? 'bg-sage text-white'
                        : 'bg-light-blue text-slate-muted'
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
                        isCompleted ? 'text-navy' : 'text-slate-muted'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                </div>
                {!isLast && (
                  <div
                    className={`absolute left-5 top-10 bottom-0 w-0.5 h-6 ${
                      isCompleted ? 'bg-sage' : 'bg-light-blue'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      ) : (
      <div className="patient-card p-6 text-center">
        <Package className="w-10 h-10 text-light-blue mx-auto mb-3" />
        <p className="text-slate-muted text-sm">No pending deliveries for this patient.</p>
      </div>
      )}

      {/* Mask Delivery History */}
      <div className="patient-card p-6">
        <h3 className="text-navy font-semibold mb-2 flex items-center gap-2">
          <Package className="w-5 h-5 text-teal" />
          Mask Delivery History
        </h3>
        <p className="text-sm text-slate-muted mb-6">
          Historical log of all CPAP mask replacement shipments dispatched to this profile.
        </p>

        {maskHistory?.masks && maskHistory.masks.length > 0 ? (
          <div className="overflow-x-auto border border-light-blue rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background border-b border-light-blue">
                  <th className="p-3 text-[10px] font-bold text-slate-muted uppercase tracking-widest">Sequence</th>
                  <th className="p-3 text-[10px] font-bold text-slate-muted uppercase tracking-widest">Delivery Date</th>
                  <th className="p-3 text-[10px] font-bold text-slate-muted uppercase tracking-widest">Mask Type</th>
                  <th className="p-3 text-[10px] font-bold text-slate-muted uppercase tracking-widest">Manufacturer</th>
                  <th className="p-3 text-[10px] font-bold text-slate-muted uppercase tracking-widest">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-blue">
                {maskHistory.masks.map((mask: any, idx: number) => (
                  <tr key={idx} className="hover:bg-background/50 transition-colors text-xs text-navy">
                    <td className="p-3 font-semibold">
                      {formatNullValue(mask.delivery_sequence)}
                    </td>
                    <td className="p-3">
                      {formatDateValue(mask.delivery_date)}
                    </td>
                    <td className="p-3 font-medium">
                      {formatNullValue(mask.mask_type)}
                    </td>
                    <td className="p-3">
                      {formatNullValue(mask.mask_manufacturer)}
                    </td>
                    <td className="p-3 text-slate-muted italic">
                      {formatNullValue(mask.mask_description)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-background rounded-xl p-6 text-center border border-light-blue">
            <p className="text-slate-muted text-xs">No historical mask deliveries recorded.</p>
          </div>
        )}
      </div>

      {/* Biomarker Wearables */}
      <div className="patient-card p-6 border-2 border-light-blue">
        <h3 className="text-navy font-semibold mb-2 flex items-center gap-2">
          <Activity className="w-5 h-5 text-coral" />
          Connected Clinical Sensors
        </h3>
        <p className="text-sm text-slate-muted mb-6">
          Your biomarker devices securely transmit physiological data to your care team to ensure therapy success.
        </p>
        
        <div className="space-y-3">
          {devices.length > 0 ? (
            devices.map((device: any, idx: number) => (
              <div key={device.id || idx} className="flex items-center justify-between bg-background border border-light-blue p-4 rounded-xl hover:border-teal/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-teal/10 rounded-lg flex items-center justify-center text-teal">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-navy text-sm">{device.name || 'Unnamed Sensor'}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-muted mt-0.5">
                      <span className="flex items-center gap-1 text-sage"><CheckCircle className="w-3 h-3" /> {device.status || 'Connected'}</span>
                      <span>•</span>
                      <span>{device.category || device.type || 'Biomarker Sensor'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Battery className="w-4 h-4 text-sage" />
                    <span className="text-sm font-bold text-navy">{device.battery || '—'}</span>
                  </div>
                  <p className="text-[10px] text-slate-muted mt-0.5">{device.last_sync_human || device.lastSync ? `Synced ${device.last_sync_human || device.lastSync}` : '—'}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-background border border-light-blue p-6 rounded-xl text-center text-slate-muted">
              <Activity className="w-8 h-8 opacity-20 mx-auto mb-2" />
              <p className="text-xs font-semibold">No connected biomarker sensors assigned to your profile.</p>
            </div>
          )}
        </div>
      </div>

      {/* Why You're Getting This */}
      <div className="bg-gradient-to-br from-teal/10 to-teal/5 rounded-2xl p-6">
        <h3 className="text-lg text-navy mb-3 font-semibold">Why You're Getting This</h3>
        <p className="text-slate-muted mb-4">
          Your current mask has been in use for over 60 days. Regular mask replacements ensure:
        </p>
        <ul className="space-y-2 text-sm text-slate-muted">
          <li className="flex items-start gap-2">
            <span className="text-teal font-bold">✓</span>
            <span>Better seal and less air leakage</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal font-bold">✓</span>
            <span>More comfortable fit</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-teal font-bold">✓</span>
            <span>More effective therapy</span>
          </li>
        </ul>
      </div>

      {/* Contact Card */}
      <div className="patient-card p-6">
        <h3 className="text-lg text-navy mb-4 font-semibold">Need Help?</h3>
        <p className="text-sm text-slate-muted mb-4">
          Questions about your delivery or need to make changes?
        </p>
        <button className="w-full bg-teal text-white px-6 py-3 rounded-xl hover:bg-teal/90 transition-colors font-medium">
          Contact My Technician
        </button>
      </div>
    </div>
  );
}
