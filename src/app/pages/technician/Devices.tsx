import { Watch, Activity, Zap, ShieldCheck, Bluetooth, Battery, Signal, Loader2 } from 'lucide-react';
import { useParams } from 'react-router';
import { useApi } from '../../hooks/useApi';
import { fetchDevices } from '../../data/api';

export default function TechnicianDevices() {
  const { id } = useParams();
  
  const { data: devices, isLoading, error } = useApi(() => fetchDevices(id || '1'), {
    dependencies: [id]
  });

  const isLive = !error && !!devices;

  if (isLoading && !devices) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-[#F4A261] animate-spin" />
      </div>
    );
  }

  const rawList = Array.isArray(devices) ? devices : (typeof devices === 'string' && devices ? [{ id: 'DEV-API', name: devices, type: 'Device from API', status: 'Online', battery: '—', lastSync: 'Recently', assigned: '—' }] : []);
  const deviceList = rawList;

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
        <button className="bg-[#0A1128] text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-black transition-all shadow-lg">
          <Zap className="w-4 h-4 text-[#F4A261]" /> Pair New Device
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {deviceList.length > 0 ? (
          deviceList.map((device: any, idx: number) => (
            <div key={device.id || idx} className="bg-white rounded-3xl border border-[#E8EEF2] overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    device.status === 'Online' ? 'bg-[#6A994E]/10 text-[#6A994E]' : 'bg-[#E76F51]/10 text-[#E76F51]'
                  }`}>
                    {device.name?.includes('Watch') || device.name?.includes('Oximeter') || device.name?.includes('ScanWatch') || device.name?.includes('MightySat') ? <Watch className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    device.status === 'Online' ? 'bg-[#6A994E]/10 text-[#6A994E]' : 'bg-[#E76F51]/10 text-[#E76F51]'
                  }`}>
                    <Bluetooth className="w-3 h-3" />
                    {device.status || 'Active'}
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-[10px] text-[#5A6B7C] uppercase font-bold tracking-widest mb-1">{device.id || 'DEVICE'}</p>
                  <h3 className="text-lg font-bold text-[#0A1128]">{device.name || 'Unnamed Device'}</h3>
                  <p className="text-sm text-[#5A6B7C]">{device.type || 'Clinical Asset'}</p>
                </div>

                <div className="space-y-3 pt-6 border-t border-[#E8EEF2]">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#5A6B7C] flex items-center gap-2">
                      <Battery className={`w-4 h-4 ${parseInt(device.battery || '100') < 20 ? 'text-[#E76F51]' : 'text-[#6A994E]'}`} />
                      Battery Life
                    </span>
                    <span className="font-bold text-[#0A1128]">{device.battery || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#5A6B7C]">Last Sync</span>
                    <span className="font-bold text-[#0A1128]">{device.lastSync || 'Recently'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#5A6B7C]">Assigned On</span>
                    <span className="font-bold text-[#0A1128]">{device.assigned || '—'}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-[#FAFAFA] border-t border-[#E8EEF2] flex gap-3">
                 <button className="flex-1 py-2 bg-white border border-[#E8EEF2] text-[10px] font-bold uppercase tracking-widest text-[#5A6B7C] rounded-lg hover:bg-white/50 transition-all">Unpair</button>
                 <button className="flex-1 py-2 bg-white border border-[#E8EEF2] text-[10px] font-bold uppercase tracking-widest text-[#0A1128] rounded-lg hover:bg-white/50 transition-all">Diagnostic</button>
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
    </div>
  );
}
