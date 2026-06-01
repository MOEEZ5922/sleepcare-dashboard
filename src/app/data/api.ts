import * as mock from './mockData';

const BASE_URL = 'https://cpap-backend-v2.onrender.com';

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
  previousRiskScore: number;
  riskTier: string;
  daysToPredictedDropout: number;
  confidenceLevel: number;
  phaseLabel: string;
  activeFlags: { label: string; severity: string }[];
  clusterAssignment: {
    current: string;
    description: string;
    previous: string;
    changedThisWeek: boolean;
  };
  sevenDayRolling: { day: string; usageHours: number; ahi: number }[];
  riskFactorBreakdown: { factor: string; direction: string; contribution: number }[];
  nextBestAction: {
    type: string;
    rationale: string;
    deliveryMode: string;
    reassessmentWindow: string;
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
    ahi?: number;
    leakRate?: number;
    pressure90?: number;
  }[];
  pressureSettings?: {
    min: number;
    max: number;
    current: number;
  };
}

export interface BiomarkerData {
  sleepQuality: number;
  restfulness: string;
  odi: { day: string; value: number }[];
  hrv: { day: string; value: number }[];
  spo2: { day: string; value: number }[];
  deepSleep: { day: string; value: number }[];
  bp: { day: string; systolic: number; diastolic: number }[];
  status: { vitals: string; general: string };
}

/** Backend biomarker overview — latest reading from each device */
export interface BiomarkerOverview {
  patient_id: string;
  withings_watch: { last_sync: string; heart_rate: number; spo2: number; hrv_rmssd: number } | null;
  withings_bpm: { last_sync: string; systolic: number | null; diastolic: number | null; heart_rate: number } | null;
  masimo: { last_reading: string; spo2: number; pulse_rate: number } | null;
  somnoart: { last_night: string; sleep_efficiency: number; tst_min: number } | null;
  hexoskin: { last_sync: string; heart_rate: number; breathing_rate: number } | null;
}

export interface WithingsReading {
  timestamp: string;
  heart_rate: number;
  hrv_rmssd: number;
  spo2: number;
  sleep_state: string | null;
  step_count: number;
}

export interface MasimoReading {
  timestamp: string;
  spo2: number;
  pulse_rate: number;
  perfusion_index: number;
  respiration_rate: number;
}

export interface SomnoArtNight {
  night_date: string;
  analysis_status: 'Valid' | 'Partial';
  tst_min: number;
  sleep_efficiency_pct: number;
  deep_sleep_min: number;
  rem_min: number;
  waso_min: number;
  nb_awakenings: number;
}

export interface DeviceInfo {
  id: string;
  category: string;
  name: string;
  model: string;
  serial: string | null;
  status: string;
  last_sync: string;
  last_sync_human: string;
  assigned_date: string;
}

export interface Device {
  id: string;
  name: string;
  type: string;
  status: 'Online' | 'Offline' | 'Warning';
  lastSync: string;
  battery?: number;
  serialNumber: string;
}


export interface PhysicianQueue {
  urgent: any[];
  annualReviews: any[];
}

export interface SurveyResponse {
  physician?: any[];
  technician?: any[];
  calendar?: any[];
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
    if (endpoint.includes('/api/patients')) return {
      count: 2,
      patients: [
        { ...mock.patientInfo, patient_id: 'PAT0001', name: 'Sarah Mitchell', gender: 'F', birth_date: '1978-06-15', device_type: 'ResMed', cpap_start_date: '2025-02-10', complianceScore: 82 },
        { patient_id: 'PAT0002', name: 'Robert Chen', gender: 'M', birth_date: '1960-01-01', device_type: 'Lowenstein', complianceScore: 45 }
      ]
    } as any;
    if (endpoint.includes('/summary')) return { ...mock.patientInfo, ...mock.cpapData } as any;
    if (endpoint.includes('/physician/queue')) return mock.physicianQueue as any;
    if (endpoint.includes('/technician/queue')) return mock.technicianQueue as any;
    if (endpoint.includes('/technician/events')) return mock.technicianEvents as any;
    if (endpoint.includes('/api/cpap/')) return mock.cpapData as any;
    if (endpoint.includes('/withings')) return {
      readings: mock.biomarkerData.hrv.map((h, i) => ({
        timestamp: new Date(Date.now() - (30 - i) * 86400000).toISOString(),
        heart_rate: 65 + Math.random() * 15,
        hrv_rmssd: h.value,
        spo2: mock.biomarkerData.spo2[i]?.value || 95,
        sleep_state: null,
        step_count: 4000 + Math.random() * 6000,
      })),
      total: mock.biomarkerData.hrv.length,
    } as any;
    if (endpoint.includes('/masimo')) return {
      readings: mock.biomarkerData.odi.map((o, i) => ({
        timestamp: new Date(Date.now() - (30 - i) * 86400000).toISOString(),
        spo2: mock.biomarkerData.spo2[i]?.value || 95,
        pulse_rate: 70 + Math.random() * 10,
        perfusion_index: 2.0 + Math.random() * 2,
        respiration_rate: 14 + Math.random() * 4,
      })),
      total: mock.biomarkerData.odi.length,
    } as any;
    if (endpoint.includes('/sleep')) return {
      nights: mock.biomarkerData.deepSleep.map((d, i) => ({
        night_date: new Date(Date.now() - (30 - i) * 86400000).toISOString().split('T')[0],
        analysis_status: 'Valid',
        tst_min: 380 + Math.random() * 120,
        sleep_efficiency_pct: 80 + Math.random() * 15,
        deep_sleep_min: d.value,
        rem_min: 50 + Math.random() * 45,
        waso_min: 10 + Math.random() * 35,
        nb_awakenings: Math.floor(Math.random() * 3),
      })),
      total: mock.biomarkerData.deepSleep.length,
    } as any;
    if (endpoint.includes('/biomarkers')) return mock.biomarkerData as any;
    if (endpoint.includes('/interventions')) return (mock.technicianQueue[0]?.interventionHistory || []) as any;
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
  return apiFetch<DirectoryResponse>(`/api/patients/?limit=${limit}`);
}

/** Get a single patient's summary (header cockpit) */
export async function fetchPatientSummary(patientId: string): Promise<PatientSummary> {
  return apiFetch<PatientSummary>(`/api/dashboard/patient/${formatPatientId(patientId)}/summary`);
}

/** Get the Physician Exception Inbox (urgent + annual reviews) */
export async function fetchPhysicianQueue(limit = 20): Promise<PhysicianQueue> {
  return apiFetch<PhysicianQueue>(`/api/dashboard/physician/queue?limit=${limit}`);
}

/** Get the Technician Retention Queue */
export async function fetchTechnicianQueue(limit = 30): Promise<any[]> {
  return apiFetch<any[]>(`/api/dashboard/technician/queue?limit=${limit}`);
}

/** Get Technician AI-flagged events (Mechanical/Self-Report inbox) */
export async function fetchTechnicianEvents(limit = 30): Promise<any[]> {
  return apiFetch<any[]>(`/api/dashboard/technician/events?limit=${limit}`);
}

/** Get Triage Events (Alias for technician events) */
export async function fetchTriageEvents(limit = 30): Promise<any[]> {
  return apiFetch<any[]>(`/api/dashboard/technician/events?limit=${limit}`);
}

/** Get CPAP usage trends for a patient */
export async function fetchCpapTrends(patientId: string, days = 90): Promise<CpapTrends> {
  const data = await apiFetch<any>(`/api/cpap/${formatPatientId(patientId)}?days=${days}`);

  // If it's mock data (already formatted to frontend spec), return it directly
  if (data.usageHistory) return data;

  // Otherwise, map backend shape to frontend shape
  let streak = 0;
  // Assume backend returns newest first or unsorted, let's sort newest first to calculate streak
  const sortedSessions = (data.sessions || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  for (let i = 0; i < sortedSessions.length; i++) {
    if (sortedSessions[i].usage_hours >= 4) streak++;
    else break;
  }

  return {
    averageHours: data.avg_usage_hours || 0,
    currentAHI: sortedSessions[0]?.ahi || 0,
    percentileLeak: sortedSessions[0]?.leaks95 || sortedSessions[0]?.leaks90 || 0,
    streak: streak,
    // Map pressure settings if available, or fallback to latest session's pressure90
    pressureSettings: {
      min: data.pressure_min || 4,
      max: data.pressure_max || 20,
      current: sortedSessions[0]?.pressure90 || 0
    },
    // Reverse to return oldest first for chronological charts
    usageHistory: sortedSessions.map((s: any) => ({
      date: s.date,
      hours: s.usage_hours,
      ahi: s.ahi,
      leakRate: s.leaks95 || s.leaks90 || 0,
      pressure90: s.pressure90
    })).reverse()
  };
}

/** Get biomarker data for a patient (legacy mock-compatible) */
export async function fetchBiomarkers(patientId: string, days = 30): Promise<BiomarkerData> {
  return apiFetch<BiomarkerData>(`/api/biomarkers/${formatPatientId(patientId)}/overview?days=${days}`);
}

/** Get biomarker overview — latest reading per source device */
export async function fetchBiomarkerOverview(patientId: string, days = 30): Promise<BiomarkerOverview> {
  return apiFetch<BiomarkerOverview>(`/api/biomarkers/${formatPatientId(patientId)}/overview?days=${days}`);
}

/** Get Withings Watch time series — HR, HRV, SpO2 */
export async function fetchWithingsData(patientId: string, days = 30): Promise<{ readings: WithingsReading[]; total: number }> {
  return apiFetch<{ readings: WithingsReading[]; total: number }>(`/api/biomarkers/${formatPatientId(patientId)}/withings?days=${days}`);
}

/** Get Masimo spot-checks — SpO2, pulse, perfusion index */
export async function fetchMasimoData(patientId: string): Promise<{ readings: MasimoReading[]; total: number }> {
  return apiFetch<{ readings: MasimoReading[]; total: number }>(`/api/biomarkers/${formatPatientId(patientId)}/masimo`);
}

/** Get Somno-Art sleep staging results */
export async function fetchSleepData(patientId: string): Promise<{ nights: SomnoArtNight[]; total: number }> {
  return apiFetch<{ nights: SomnoArtNight[]; total: number }>(`/api/biomarkers/${formatPatientId(patientId)}/sleep`);
}

/** Get biomarker devices assigned to a patient */
export async function fetchDevices(patientId: string): Promise<DeviceInfo[]> {
  const data = await apiFetch<any>(`/api/devices/patient/${formatPatientId(patientId)}`);
  return data.devices || data || [];
}

/** Get intervention history for a patient */
export async function fetchInterventions(patientId: string): Promise<any[]> {
  const data = await apiFetch<any>(`/api/interventions/${formatPatientId(patientId)}`);
  const list = data.interventions || (Array.isArray(data) ? data : []);

  // Ensure every item has a 'type' field (mapping from backend 'job_category' if needed)
  return list.map((item: any) => ({
    ...item,
    type: item.type || item.job_category || 'Intervention'
  }));
}

/** Get survey data for a patient */
export async function fetchSurveys(patientId: string): Promise<SurveyResponse> {
  return apiFetch<SurveyResponse>(`/api/surveys/${formatPatientId(patientId)}/monitoring`);
}

/** Get AI weekly analysis for a patient */
export async function fetchWeeklyAnalysis(patientId: string): Promise<WeeklyAnalysis> {
  return apiFetch<WeeklyAnalysis>(`/api/dashboard/patient/${formatPatientId(patientId)}/analysis/weekly`);
}

/** Get video content for a patient */
export async function fetchVideos(patientId: string): Promise<any[]> {
  return apiFetch<any[]>(`/api/videos/${formatPatientId(patientId)}`);
}

/** Get clinical authorizations for a patient */
export async function fetchAuthorizations(patientId: string): Promise<any[]> {
  return apiFetch<any[]>(`/api/authorizations/${formatPatientId(patientId)}`);
}

/** Get general technician inventory (not patient specific) */
export async function fetchInventory() {
  return apiFetch(`/api/inventory`);
}

/** Backend health check */
export async function checkHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) throw new Error('Clinical services unavailable');
    return await res.json();
  } catch (error) {
    const res = await fetch(`${BASE_URL}/api/patients/`);
    if (!res.ok) throw new Error('Clinical services unavailable');
    return { status: 'ok' };
  }
}


// ─── POST Endpoints ──────────────────────────────────────────────────────────

/** Technician validates or dismisses an AI-flagged event */
export async function submitEventTriage(eventId: number, data: {
  action: 'VALIDATE' | 'DISMISS';
  technician_id: string;
  notes?: string;
  reason_code?: string;
}) {
  return apiFetch(`/api/dashboard/technician/events/${eventId}/triage`, {
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
  return apiFetch(`/api/surveys/${formatPatientId(patientId)}/monitoring`, {
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
  return apiFetch(`/api/interventions/${formatPatientId(patientId)}`, {
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
  return apiFetch(`/api/authorizations/${formatPatientId(patientId)}`, {
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
  return apiFetch(`/api/videos/${videoId}/interaction`, {
    method: 'POST',
    body: JSON.stringify({ ...data, timestamp: new Date().toISOString() }),
  });
}

/** Patient submits a medical survey */
export async function submitSurveyResponse(patientId: string, surveyId: string, data: {
  answers: { question_id: string; value: string | number }[];
  completion_time_seconds?: number;
}) {
  return apiFetch(`/api/surveys/${formatPatientId(patientId)}/submit`, {
    method: 'POST',
    body: JSON.stringify({ ...data, timestamp: new Date().toISOString() }),
  });
}

/** Patient creates a support ticket */
export async function createSupportTicket(patientId: string, data: {
  issue_type: string;
  details: string;
}) {
  return apiFetch(`/api/support/${formatPatientId(patientId)}/ticket`, {
    method: 'POST',
    body: JSON.stringify({ ...data, timestamp: new Date().toISOString() }),
  });
}
