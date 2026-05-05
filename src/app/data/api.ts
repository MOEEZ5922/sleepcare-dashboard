import * as mock from './mockData';

const BASE_URL = 'https://cpap-backend.onrender.com/api/v1';

// ─── Types & Interfaces ──────────────────────────────────────────────────────
export interface PatientSummary {
  patientId: string;
  name: string;
  status: string;
  adherenceRate: number;
  currentAHI: number;
  averageHours: number;
  percentileLeak: number;
  // Demographic/Clinical metadata
  gender?: string;
  dob?: string;
  therapyStartDate?: string;
  maskType?: string;
  riskScore?: number;
  address?: string;
  machineSerial?: string;
  interventions?: any[];
  patient?: any; // Nested patient object used in some endpoints
}

export interface WeeklyAnalysis {
  weekOf: string;
  compositeRiskScore: number;
  clusterAssignment: {
    current: string;
    description: string;
  };
  nextBestAction: {
    type: string;
    rationale: string;
  };
}

export interface CpapTrends {
  averageHours: number;
  currentAHI: number;
  percentileLeak: number;
  streak: number;
  usageHistory: {
    date: string;
    hours: number;
  }[];
}

export interface PhysicianQueue {
  urgent: any[];
  annualReviews: any[];
}

export interface SurveyResponse {
  patient: {
    next: {
      name: string;
      dueDate: string;
      questions: number;
      persistence: { status: string };
    };
    history: any[];
  };
}

export interface DirectoryResponse {
  patients: any[];
}

// ─── Helper to ensure ID is in PATxxxx format ────────────────────────────────

function formatPatientId(id: string | number): string {
  const strId = String(id);
  if (strId.startsWith('PAT')) return strId;
  // If it's a number like 11, convert to PAT0011
  return `PAT${strId.padStart(4, '0')}`;
}

// ─── Generic fetch wrapper with fallback logic ──────────────────────────────

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      throw new Error(`API Error ${res.status}: ${res.statusText} — ${endpoint}`);
    }
    return await res.json();
  } catch (error) {
    console.warn(`Falling back to mock data for: ${endpoint}`, error);
    
    // Map endpoints to mock data
    if (endpoint.includes('/patients')) return { 
      patients: [
        { ...mock.patientInfo, patientId: 'PAT0001', age: 48, status: 'Active', complianceScore: 82 },
        { patientId: 'PAT0002', name: 'James Wilson', age: 52, gender: 'Male', status: 'At Risk', complianceScore: 45 }
      ] 
    } as any;
    if (endpoint.includes('/summary')) return { ...mock.patientInfo, ...mock.cpapData } as any;
    if (endpoint.includes('/physician/queue')) return mock.physicianQueue as any;
    if (endpoint.includes('/technician/queue')) return mock.technicianQueue as any;
    if (endpoint.includes('/technician/events')) return mock.technicianEvents as any;
    if (endpoint.includes('/trends/cpap')) return mock.cpapData as any;
    if (endpoint.includes('/biomarkers')) return mock.biomarkerData as any;
    if (endpoint.includes('/interventions')) return mock.technicianQueue[0].interventionHistory as any;
    if (endpoint.includes('/analysis/weekly')) return mock.aiWeeklyState as any;
    if (endpoint.includes('/surveys')) return mock.surveyData as any;
    if (endpoint.includes('/videos')) return mock.videoData.patient as any;
    if (endpoint.includes('/authorizations')) return [] as any;
    if (endpoint.includes('/inventory')) return mock.inventoryItems as any;
    if (endpoint.includes('/devices')) return mock.deviceData as any;
    
    // For POST requests, return a generic success
    if (options?.method === 'POST') return { status: 'success', message: 'Mock submission accepted' } as any;
    
    throw error;
  }
}

// ─── GET Endpoints ───────────────────────────────────────────────────────────

/** List all patients (for Physician Directory) */
export async function fetchPatients(limit = 20): Promise<DirectoryResponse> {
  return apiFetch<DirectoryResponse>(`/patients?limit=${limit}`);
}

/** Get a single patient's summary (header cockpit) */
export async function fetchPatientSummary(patientId: string): Promise<PatientSummary> {
  return apiFetch<PatientSummary>(`/patient/${formatPatientId(patientId)}/summary`);
}

/** Get the Physician Exception Inbox (urgent + annual reviews) */
export async function fetchPhysicianQueue(limit = 20): Promise<PhysicianQueue> {
  return apiFetch<PhysicianQueue>(`/physician/queue?limit=${limit}`);
}

/** Get the Technician Retention Queue */
export async function fetchTechnicianQueue(limit = 30): Promise<any[]> {
  return apiFetch<any[]>(`/technician/queue?limit=${limit}`);
}

/** Get Technician AI-flagged events (Mechanical/Self-Report inbox) */
export async function fetchTechnicianEvents(limit = 30): Promise<any[]> {
  return apiFetch<any[]>(`/technician/events?limit=${limit}`);
}

/** Get Triage Events (Alias for technician events) */
export async function fetchTriageEvents(limit = 30): Promise<any[]> {
  return apiFetch<any[]>(`/technician/triage/events?limit=${limit}`);
}

/** Get CPAP usage trends for a patient */
export async function fetchCpapTrends(patientId: string, days = 90): Promise<CpapTrends> {
  return apiFetch<CpapTrends>(`/patient/${formatPatientId(patientId)}/trends/cpap?days=${days}`);
}

/** Get biomarker data for a patient */
export async function fetchBiomarkers(patientId: string, days = 30): Promise<any[]> {
  return apiFetch<any[]>(`/patient/${formatPatientId(patientId)}/biomarkers?days=${days}`);
}

/** Get biomarker devices assigned to a patient */
export async function fetchDevices(patientId: string): Promise<any[]> {
  return apiFetch<any[]>(`/patient/${formatPatientId(patientId)}/devices`);
}

/** Get intervention history for a patient */
export async function fetchInterventions(patientId: string): Promise<any[]> {
  return apiFetch<any[]>(`/patient/${formatPatientId(patientId)}/interventions`);
}

/** Get survey data for a patient */
export async function fetchSurveys(patientId: string): Promise<SurveyResponse> {
  return apiFetch<SurveyResponse>(`/patient/${formatPatientId(patientId)}/surveys`);
}

/** Get AI weekly analysis for a patient */
export async function fetchWeeklyAnalysis(patientId: string): Promise<WeeklyAnalysis> {
  return apiFetch<WeeklyAnalysis>(`/patient/${formatPatientId(patientId)}/analysis/weekly`);
}

/** Get video content for a patient */
export async function fetchVideos(patientId: string): Promise<any[]> {
  return apiFetch<any[]>(`/patient/${formatPatientId(patientId)}/videos`);
}

/** Get clinical authorizations for a patient */
export async function fetchAuthorizations(patientId: string): Promise<any[]> {
  return apiFetch<any[]>(`/patient/${formatPatientId(patientId)}/authorizations`);
}

/** Get general technician inventory (not patient specific) */
export async function fetchInventory() {
  return apiFetch(`/technician/inventory`);
}

/** Backend health check */
export async function checkHealth() {
  // Using /patients as a proxy for health since root /health is non-responsive
  const res = await fetch(`${BASE_URL}/patients`);
  if (!res.ok) throw new Error('Clinical services unavailable');
  return { status: 'ok' };
}

// ─── POST Endpoints ──────────────────────────────────────────────────────────

/** Technician validates or dismisses an AI-flagged event */
export async function submitEventTriage(eventId: number, data: {
  action: 'VALIDATE' | 'DISMISS';
  technician_id: string;
  notes?: string;
  reason_code?: string;
}) {
  return apiFetch(`/technician/events/${eventId}/triage`, {
    method: 'POST',
    body: JSON.stringify({ ...data, timestamp: new Date().toISOString() }),
  });
}

/** Technician logs an operational monitoring form */
export async function submitMonitoringLog(patientId: string, data: {
  form_type: string;
  notes: string;
  technician_id: string;
}) {
  return apiFetch(`/patient/${formatPatientId(patientId)}/surveys/monitoring`, {
    method: 'POST',
    body: JSON.stringify({ ...data, timestamp: new Date().toISOString() }),
  });
}

/** Create a new intervention (Physician or Technician) */
export async function createIntervention(patientId: string, data: {
  type: string;
  job_code: string;
  actor: { role: string; id: string };
  outcome: string;
  notes?: string;
  signature_hash?: string;
}) {
  return apiFetch(`/patient/${formatPatientId(patientId)}/interventions`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Physician authorizes a clinical pathway transition (MAD/HNS) */
export async function createAuthorization(patientId: string, data: {
  type: string;
  status: string;
  physician_id: string;
  digital_seal_hash: string;
}) {
  return apiFetch(`/patient/${formatPatientId(patientId)}/authorizations`, {
    method: 'POST',
    body: JSON.stringify({ ...data, timestamp: new Date().toISOString() }),
  });
}

/** Patient marks a video as watched and/or rates it */
export async function submitVideoInteraction(patientId: string, videoId: number, data: {
  watched: boolean;
  rating?: number;
  watch_duration_seconds: number;
}) {
  return apiFetch(`/patient/${formatPatientId(patientId)}/videos/${videoId}/interaction`, {
    method: 'POST',
    body: JSON.stringify({ ...data, timestamp: new Date().toISOString() }),
  });
}

/** Patient submits a medical survey */
export async function submitSurveyResponse(patientId: string, surveyId: string, data: {
  answers: { question_id: string; value: string | number }[];
  completion_time_seconds?: number;
}) {
  return apiFetch(`/patient/${formatPatientId(patientId)}/surveys/${surveyId}/submit`, {
    method: 'POST',
    body: JSON.stringify({ ...data, timestamp: new Date().toISOString() }),
  });
}

/** Patient creates a support ticket */
export async function createSupportTicket(patientId: string, data: {
  issue_type: string;
  details: string;
}) {
  return apiFetch(`/patient/${formatPatientId(patientId)}/support/ticket`, {
    method: 'POST',
    body: JSON.stringify({ ...data, timestamp: new Date().toISOString() }),
  });
}
