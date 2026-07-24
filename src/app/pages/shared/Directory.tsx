import { Search, User, Filter, MoreVertical, Loader2, Signal, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useApi } from '../../hooks/useApi';
import { fetchPatients, DirectoryResponse } from '../../data/api';

export default function PatientDirectory() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const isTechnician = location.pathname.startsWith('/technician');
  
  const { data: patients, isLoading, error } = useApi<DirectoryResponse>(fetchPatients, {
    cacheKey: 'patient-directory'
  });

  const isLive = !!(patients && (patients as any).__isLive);

  const rawList = Array.isArray(patients) ? patients : (patients?.patients || []);
  const patientList = rawList.map((p: any) => {
    if (typeof p === 'string') return { id: p, patientId: p, name: 'Patient ' + p, status: 'Active', complianceScore: 80 };
    
    // Normalize keys between snake_case (backend) and camelCase (frontend)
    const patientId = p.patientId || p.patient_id || p.id || 'PAT0001';
    
    // Extract birth date to calculate age if age is not present
    let age = p.age;
    if (!age && (p.birth_date || p.dob)) {
      const birthYear = new Date(p.birth_date || p.dob).getFullYear();
      age = new Date().getFullYear() - birthYear;
    }
    
    return {
      ...p,
      patientId,
      id: patientId,
      name: p.name || p.patientName || (p.patient ? `${p.patient.first_name || ''} ${p.patient.last_name || ''}`.trim() : '') || 'Patient ' + String(patientId).replace('PAT', ''),
      gender: p.gender || p.sex || (p.patient?.gender) || 'M',
      age: age || NaN,
      status: p.status || 'Active',
      complianceScore: p.complianceScore || p.adherenceRate || (p.adherence_rate ? Math.round(p.adherence_rate * 100) : 0) || NaN,
    };
  });

  const filteredPatients = patientList.filter((p: any) => 
    ((p.name || '').toLowerCase()).includes(searchTerm.toLowerCase()) ||
    ((p.patientId || '').toLowerCase()).includes(searchTerm.toLowerCase())
  );

  const totalPatients = filteredPatients.length;
  const totalPages = Math.max(1, Math.ceil(totalPatients / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalPatients);
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
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
            {paginatedPatients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[#5A6B7C]">
                  {searchTerm ? 'No patients found matching your search.' : 'No patients found in directory.'}
                </td>
              </tr>
            ) : (
              paginatedPatients.map((patient: any) => (
                <tr 
                  key={patient.patientId || patient.id} 
                  className="hover:bg-[#FAFAFA] transition-colors cursor-pointer"
                  onClick={() => navigate(isTechnician ? `/technician/patient/${patient.patientId || patient.id}` : `/physician/patient/${patient.patientId || patient.id}`)}
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

        {/* Pagination Footer */}
        {totalPatients > 0 && (
          <div className="px-6 py-4 bg-[#FAFAFA] border-t border-[#E8EEF2] flex items-center justify-between">
            <p className="text-xs text-[#5A6B7C]">
              Showing <span className="font-semibold text-[#0A1128]">{startIndex + 1}</span> to{' '}
              <span className="font-semibold text-[#0A1128]">{endIndex}</span> of{' '}
              <span className="font-semibold text-[#0A1128]">{totalPatients}</span> patients
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 border border-[#E8EEF2] rounded-lg text-xs font-medium text-[#5A6B7C] hover:bg-white hover:text-[#0A1128] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                  })
                  .reduce<(number | string)[]>((acc, page, idx, array) => {
                    if (idx > 0 && page - (array[idx - 1] as number) > 1) {
                      acc.push('...');
                    }
                    acc.push(page);
                    return acc;
                  }, [])
                  .map((item, index) =>
                    typeof item === 'number' ? (
                      <button
                        key={item}
                        onClick={() => setCurrentPage(item)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                          currentPage === item
                            ? 'bg-[#2D9596] text-white'
                            : 'text-[#5A6B7C] hover:bg-[#E8EEF2]'
                        }`}
                      >
                        {item}
                      </button>
                    ) : (
                      <span key={`ellipsis-${index}`} className="px-1 text-xs text-[#5A6B7C]">
                        ...
                      </span>
                    )
                  )}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-1 px-3 py-1.5 border border-[#E8EEF2] rounded-lg text-xs font-medium text-[#5A6B7C] hover:bg-white hover:text-[#0A1128] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

