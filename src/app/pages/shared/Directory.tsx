import { Search, User, Filter, MoreVertical, Loader2, Signal, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useApi } from '../../hooks/useApi';
import { fetchPatients, DirectoryResponse, isLiveResponse } from '../../data/api';

export default function PatientDirectory() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const isTechnician = location.pathname.startsWith('/technician');
  
  const { data: patients, isLoading } = useApi<DirectoryResponse>(fetchPatients, {
    cacheKey: 'patient-directory'
  });

  const isLive = isLiveResponse(patients);

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
        <Loader2 className="w-8 h-8 text-teal animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-navy font-semibold">Patient Directory</h2>
          {isLive && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-sage/10 border border-sage/20 rounded-md mt-1 w-fit">
              <Signal className="w-3 h-3 text-sage" />
              <span className="text-[10px] font-bold text-sage uppercase tracking-wider">Live</span>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search patients (e.g. PAT0001)..."
              className="pl-10 pr-4 py-2 bg-card border border-light-blue rounded-lg focus:outline-none focus:border-teal text-sm w-64 shadow-xs"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-light-blue rounded-lg text-sm text-slate-muted hover:bg-card transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-light-blue shadow-xs overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-background border-b border-light-blue">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-muted uppercase">Patient</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-muted uppercase">ID</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-muted uppercase">Details</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-muted uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-muted uppercase">Compliance</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-blue">
            {paginatedPatients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-muted">
                  {searchTerm ? 'No patients found matching your search.' : 'No patients found in directory.'}
                </td>
              </tr>
            ) : (
              paginatedPatients.map((patient: any) => (
                <tr 
                  key={patient.patientId || patient.id} 
                  className="hover:bg-background transition-colors cursor-pointer"
                  onClick={() => navigate(isTechnician ? `/technician/patient/${patient.patientId || patient.id}` : `/physician/patient/${patient.patientId || patient.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-light-blue rounded-full flex items-center justify-center text-teal">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-navy">{patient.name || 'Unknown Patient'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-muted">
                    {patient.patientId || patient.id || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-muted">
                    {patient.gender || patient.sex || '—'}, {patient.age || '—'}y
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      patient.status === 'Active' ? 'bg-sage/10 text-sage' : 'bg-amber/10 text-amber'
                    }`}>
                      {patient.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${
                      (patient.complianceScore || 0) >= 70 
                        ? 'text-sage' 
                        : 'text-coral'
                    }`}>
                      {patient.complianceScore || 0}% ({(patient.complianceScore || 0) >= 70 ? 'Good' : 'Poor'})
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-muted hover:text-navy">
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
          <div className="px-6 py-4 bg-background border-t border-light-blue flex items-center justify-between">
            <p className="text-xs text-slate-muted">
              Showing <span className="font-semibold text-navy">{startIndex + 1}</span> to{' '}
              <span className="font-semibold text-navy">{endIndex}</span> of{' '}
              <span className="font-semibold text-navy">{totalPatients}</span> patients
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 border border-light-blue rounded-lg text-xs font-medium text-slate-muted hover:bg-card hover:text-navy disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                            ? 'bg-teal text-white'
                            : 'text-slate-muted hover:bg-light-blue'
                        }`}
                      >
                        {item}
                      </button>
                    ) : (
                      <span key={`ellipsis-${index}`} className="px-1 text-xs text-slate-muted">
                        ...
                      </span>
                    )
                  )}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-1 px-3 py-1.5 border border-light-blue rounded-lg text-xs font-medium text-slate-muted hover:bg-card hover:text-navy disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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

