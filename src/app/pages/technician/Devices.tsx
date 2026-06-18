import { useState } from 'react';
import { Watch, Activity, Zap, ShieldCheck, Bluetooth, Battery, Signal, Loader2, Plus, X } from 'lucide-react';
import { useParams } from 'react-router';
import { toast } from 'sonner';
import { useApi } from '../../hooks/useApi';
import { fetchDevices, pairDevice, unpairDevice, runDeviceDiagnostic } from '../../data/api';

export default function TechnicianDevices() {
  const { id } = useParams();
  
  const { data: devices, isLoading, error, refetch } = useApi(() => fetchDevices(id || '1'), {
    dependencies: [id],
    cacheKey: `devices-${id || '1'}`
  });

  const isLive = !!(devices && (devices as any).__isLive);

  // Pairing Modal States
  const [showPairModal, setShowPairModal] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceType, setNewDeviceType] = useState('withings_watch');
  const [newDeviceSerial, setNewDeviceSerial] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Diagnostics States
  const [runningDiagId, setRunningDiagId] = useState<string | null>(null);

  if (isLoading && !devices) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-[#F4A261] animate-spin" />
      </div>
    );
  }

  const rawList = Array.isArray(devices) ? devices : (typeof devices === 'string' && devices ? [{ id: 'DEV-API', name: devices, type: 'Device from API', status: 'Online', battery: '—', lastSync: 'Recently', assigned: '—' }] : []);
  const deviceList = rawList;

  const handlePair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName || !newDeviceSerial) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      await pairDevice(id || '1', {
        device_name: newDeviceName,
        device_type: newDeviceType,
        serial_number: newDeviceSerial,
        assigned_date: new Date().toISOString().split('T')[0]
      });
      toast.success(`${newDeviceName} paired successfully!`);
      refetch();
      setShowPairModal(false);
      setNewDeviceName('');
      setNewDeviceType('withings_watch');
      setNewDeviceSerial('');
    } catch (err) {
      toast.error("Failed to pair device.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnpair = async (deviceId: string, name: string) => {
    if (!confirm(`Are you sure you want to unpair ${name}?`)) return;
    setIsSubmitting(true);
    try {
      await unpairDevice(id || '1', deviceId);
      toast.success(`${name} unpaired successfully.`);
      refetch();
    } catch (err) {
      toast.error(`Failed to unpair ${name}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiagnostic = async (deviceId: string, name: string) => {
    setRunningDiagId(deviceId);
    try {
      const res: any = await runDeviceDiagnostic(id || '1', deviceId);
      const status = res?.status || 'Pending';
      toast.success(`Remote Diagnostic Complete for ${name}: Status is ${status}.`);
      refetch();
    } catch (err) {
      toast.error(`Failed to run diagnostics on ${name}.`);
    } finally {
      setRunningDiagId(null);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#0A1128]">Biomarker Devices</h2>
            <p className="text-sm text-[#5A6B7C]">Hardware assigned for high-fidelity physiological monitoring</p>
          </div>
          {isLive && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-[#6A994E]/10 border border-[#6A994E]/20 rounded-md">
              <Signal className="w-3 h-3 text-[#6A994E]" />
              <span className="text-[10px] font-bold text-[#6A994E] uppercase tracking-wider">Live</span>
            </div>
          )}
        </div>
        <button 
          onClick={() => setShowPairModal(true)}
          className="bg-[#0A1128] text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95 duration-200"
        >
          <Zap className="w-4 h-4 text-[#F4A261]" /> Pair New Device
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {deviceList.length > 0 ? (
          deviceList.map((device: any, idx: number) => (
            <div key={device.id || idx} className="bg-white rounded-3xl border border-[#E8EEF2] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    device.status === 'connected' || device.status === 'active' || device.status === 'Online'
                      ? 'bg-[#6A994E]/10 text-[#6A994E]' 
                      : 'bg-[#E76F51]/10 text-[#E76F51]'
                  }`}>
                    {device.name?.includes('Watch') || device.name?.includes('Oximeter') || device.name?.includes('ScanWatch') || device.name?.includes('MightySat') ? <Watch className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    device.status === 'connected' || device.status === 'active' || device.status === 'Online'
                      ? 'bg-[#6A994E]/10 text-[#6A994E]' 
                      : 'bg-[#E76F51]/10 text-[#E76F51]'
                  }`}>
                    <Bluetooth className="w-3 h-3" />
                    {device.status || 'Active'}
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-[10px] text-[#5A6B7C] uppercase font-bold tracking-widest mb-1">{device.serial || device.id || 'DEVICE'}</p>
                  <h3 className="text-lg font-bold text-[#0A1128]">{device.name || 'Unnamed Device'}</h3>
                  <p className="text-sm text-[#5A6B7C]">{device.category || device.type || 'Clinical Asset'}</p>
                </div>

                <div className="space-y-3 pt-6 border-t border-[#E8EEF2]">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#5A6B7C] flex items-center gap-2">
                      <Battery className={`w-4 h-4 ${parseInt(device.battery || '100') < 20 ? 'text-[#E76F51]' : 'text-[#6A994E]'}`} />
                      Battery Life
                    </span>
                    <span className="font-bold text-[#0A1128]">{device.battery || '95%'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#5A6B7C]">Last Sync</span>
                    <span className="font-bold text-[#0A1128]">{device.last_sync_human || device.lastSync || 'Recently'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#5A6B7C]">Assigned On</span>
                    <span className="font-bold text-[#0A1128]">{device.assigned_date || device.assigned || '—'}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-[#FAFAFA] border-t border-[#E8EEF2] flex gap-3 shrink-0">
                 <button 
                   onClick={() => handleUnpair(device.id, device.name)}
                   disabled={isSubmitting}
                   className="flex-1 py-2.5 bg-white border border-[#E8EEF2] text-[10px] font-bold uppercase tracking-widest text-[#E76F51] hover:bg-red-50 hover:border-red-200 rounded-lg transition-all disabled:opacity-40"
                 >
                   Unpair
                 </button>
                 <button 
                   onClick={() => handleDiagnostic(device.id, device.name)}
                   disabled={runningDiagId === device.id}
                   className="flex-1 py-2.5 bg-white border border-[#E8EEF2] text-[10px] font-bold uppercase tracking-widest text-[#0A1128] hover:bg-[#FAFAFA] rounded-lg transition-all flex items-center justify-center gap-1 disabled:opacity-40"
                 >
                   {runningDiagId === device.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                   Diagnostic
                 </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-[#E8EEF2]">
            <Activity className="w-12 h-12 text-[#5A6B7C] mx-auto mb-4 opacity-20" />
            <p className="text-[#5A6B7C] font-bold uppercase tracking-widest text-xs">No devices assigned to this patient.</p>
          </div>
        )}
      </div>

      <div className="bg-[#0A1128] text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
             <ShieldCheck className="w-6 h-6 text-[#F4A261]" />
             <h3 className="text-xl font-bold">Hardware Integrity Sync</h3>
          </div>
          <p className="text-white/70 text-sm max-w-xl leading-relaxed mb-6">
            All assigned biomarker devices are currently broadcasting physiological data to the Universal Truth workspace. Data integrity is verified at the edge.
          </p>
          <div className="flex flex-wrap gap-4">
            {deviceList.length > 0 ? deviceList.map((d: any, i: number) => (
              <div key={i} className="bg-white/10 px-4 py-2 rounded-xl text-xs font-medium border border-white/5">
                {d.name || 'Device'}: {d.status || 'Active'}
              </div>
            )) : (
              <div className="text-white/40 text-xs italic">No active data streams detected.</div>
            )}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F4A261]/10 rounded-full blur-3xl -mr-32 -mt-32" />
      </div>

      {/* Pair New Device Modal */}
      {showPairModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A1128]/40 backdrop-blur-sm">
          <form onSubmit={handlePair} className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#0A1128]">Pair New Device</h3>
              <button type="button" onClick={() => setShowPairModal(false)} className="text-[#5A6B7C] hover:text-[#0A1128]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-[#5A6B7C] uppercase tracking-wider mb-2">Device Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Withings ScanWatch 2"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#E8EEF2] rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#F4A261] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A6B7C] uppercase tracking-wider mb-2">Device Type</label>
                <select
                  value={newDeviceType}
                  onChange={(e) => setNewDeviceType(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#E8EEF2] rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#F4A261] outline-none"
                >
                  <option value="withings_watch">Withings Watch</option>
                  <option value="withings_bpm">Withings Blood Pressure Monitor</option>
                  <option value="masimo">Masimo Oximeter</option>
                  <option value="hexoskin">Hexoskin Smart Shirt</option>
                  <option value="somnoart">Somno-Art Sleep Tracker</option>
                  <option value="cpap">ResMed / Lowenstein CPAP</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5A6B7C] uppercase tracking-wider mb-2">Serial Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SN-W326-8874"
                  value={newDeviceSerial}
                  onChange={(e) => setNewDeviceSerial(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#E8EEF2] rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#F4A261] outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setShowPairModal(false)} 
                disabled={isSubmitting}
                className="flex-1 py-4 bg-[#E8EEF2] text-[#5A6B7C] font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-2 py-4 bg-[#0A1128] text-white font-bold rounded-xl text-xs shadow-lg flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Pair Device
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
