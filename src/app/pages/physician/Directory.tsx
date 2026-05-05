import { Search, User, Filter, MoreVertical, Loader2, Signal } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApi } from '../../hooks/useApi';
import { fetchPatients, DirectoryResponse } from '../../data/api';

export default function PhysicianDirectory() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: patients, isLoading, error } = useApi<DirectoryResponse>(fetchPatients);

  const isLive = !error && !!patients;

  const rawList = Array.isArray(patients) ? patients : (patients?.patients || []);
  const patientList = rawList.map((p: any) => {
    if (typeof p === 'string') return { id: p, patientId: p, name: 'Patient ' + p, status: 'Active' };
    return p;
  });

  console.log('Directory hydrated list:', patientList);
  const filteredPatients = patientList.filter((p: any) => 
    ((p.name || p.patientName || '').toLowerCase()).includes(searchTerm.toLowerCase()) ||
    ((p.patientId || p.id || '').toLowerCase()).includes(searchTerm.toLowerCase())
  );

  if (isLoading && !patients) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-[#2D9596] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-[#0A1128] font-semibold">Patient Directory</h2>
          {isLive && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-[#6A994E]/10 border border-[#6A994E]/20 rounded-md mt-1 w-fit">
              <Signal className="w-3 h-3 text-[#6A994E]" />
              <span className="text-[10px] font-bold text-[#6A994E] uppercase tracking-wider">Live</span>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A6B7C]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search patients (e.g. PAT0001)..."
              className="pl-10 pr-4 py-2 bg-white border border-[#E8EEF2] rounded-lg focus:outline-none focus:border-[#2D9596] text-sm w-64 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-[#E8EEF2] rounded-lg text-sm text-[#5A6B7C] hover:bg-white transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E8EEF2] shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#FAFAFA] border-b border-[#E8EEF2]">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-[#5A6B7C] uppercase">Patient</th>
              <th className="px-6 py-4 text-xs font-semibold text-[#5A6B7C] uppercase">ID</th>
              <th className="px-6 py-4 text-xs font-semibold text-[#5A6B7C] uppercase">Details</th>
              <th className="px-6 py-4 text-xs font-semibold text-[#5A6B7C] uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-[#5A6B7C] uppercase">Compliance</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8EEF2]">
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[#5A6B7C]">
                  {searchTerm ? 'No patients found matching your search.' : 'No patients found in directory.'}
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient: any) => (
                <tr 
                  key={patient.patientId || patient.id} 
                  className="hover:bg-[#FAFAFA] transition-colors cursor-pointer"
                  onClick={() => navigate(`/physician/patient/${patient.patientId || patient.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#E8EEF2] rounded-full flex items-center justify-center text-[#2D9596]">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-[#0A1128]">{patient.name || 'Unknown Patient'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-[#5A6B7C]">
                    {patient.patientId || patient.id || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#5A6B7C]">
                    {patient.gender || patient.sex || '—'}, {patient.age || '—'}y
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      patient.status === 'Active' ? 'bg-[#6A994E]/10 text-[#6A994E]' : 'bg-[#F4A261]/10 text-[#F4A261]'
                    }`}>
                      {patient.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${
                      (patient.complianceScore || 0) >= 70 
                        ? 'text-[#6A994E]' 
                        : 'text-[#E76F51]'
                    }`}>
                      {patient.complianceScore || 0}% ({(patient.complianceScore || 0) >= 70 ? 'Good' : 'Poor'})
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-[#5A6B7C] hover:text-[#0A1128]">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
