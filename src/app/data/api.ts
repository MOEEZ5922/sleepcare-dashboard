import * as mock from './mockData';

const BASE_URL = import.meta.env.VITE_API_URL || '';

/** Resolves video URLs that may be relative or absolute from the video storage server */
export function getFullVideoUrl(url: string | null | undefined): string {
  if (!url || url.includes('mock.video')) {
    return 'https://www.w3schools.com/html/mov_bbb.mp4';
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const videoBase = import.meta.env.VITE_VIDEO_URL || BASE_URL;
  return `${videoBase}${url.startsWith('/') ? '' : '/'}${url}`;
}

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
  const strId = String(id).trim();
  if (strId.startsWith('PAT')) return strId;
  // If it is a purely numeric string/number, return it unmodified for backend API compatibility
  if (/^\d+$/.test(strId)) return strId;
  // Fallback pattern
  return `PAT${strId.padStart(4, '0')}`;
}

function makeMockObjectNaN(obj: any): any {
  return makeMockObjectNaNInternal(obj);
}

function makeMockObjectNaNInternal(obj: any, parentKey?: string): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => makeMockObjectNaNInternal(item, parentKey));
  }
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const val = obj[key];
        
        // Preserve identifiers, types, structural attributes, and dates/times
        const isIdentifier = /^(patient_?id|id|device_?id|serial|serial_?number|machine_?serial|model_?id|event_?id|signature_?hash|digital_?seal_?hash)$/i.test(key);
        const isTimeOrDate = /^(day|date|timestamp|last_?sync|last_?reading|assigned_?date|dob|birth_?date|cpap_?start_?date|therapy_?start_?date|week_?of|night_?date)$/i.test(key);
        const isStructural = /^(type|category|status|risk_?tier|phase|phase_?label|severity|gender|mask_?type|mask|device_?type|outcome|action|form_?type|issue_?type|role|color|label|direction)$/i.test(key);
        
        if (isIdentifier || isStructural) {
          result[key] = val; // Preserve identifiers and structural properties
        } else if (isTimeOrDate) {
          result[key] = val; // Preserve original dates/times to keep timeline/chart continuity
        } else {
          // Convert clinical/measurement data to NaN
          if (typeof val === 'number') {
            result[key] = NaN;
          } else if (typeof val === 'string') {
            result[key] = 'NaN';
          } else if (typeof val === 'boolean') {
            result[key] = false;
          } else if (typeof val === 'object') {
            result[key] = makeMockObjectNaNInternal(val, key);
          } else {
            result[key] = val;
          }
        }
      }
    }
    return result;
  }
  return obj;
}

// ─── Generic fetch wrapper with fallback logic ──────────────────────────────

async function apiFetchRaw<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      ...options,
    });
    if (!res.ok) {
      throw new Error(`API Error ${res.status}: ${res.statusText} — ${endpoint}`);
    }
    const data = await res.json();
    if (data && typeof data === 'object') {
      (data as any).__isLive = true;
    }
    return data;
  } catch (error) {
    console.warn(`Falling back to mock data for: ${endpoint}`, error);

    // Map endpoints to mock data
    if (endpoint.includes('/cohort') && endpoint.includes('/reporting')) {
      return [
        { id: 'Sleeper #8742', mask: 'AirFit', complianceScore: 42, riskTier: 'CRITICAL', phase: 'Titration' },
        { id: 'Sleeper #1102', mask: 'AirFit', complianceScore: 58, riskTier: 'HIGH', phase: 'Acclimation' },
        { id: 'Sleeper #4491', mask: 'AirFit', complianceScore: 68, riskTier: 'ELEVATED', phase: 'Acclimation' },
        { id: 'Sleeper #8832', mask: 'AirFit', complianceScore: 84, riskTier: 'STABLE', phase: 'Maintenance' },
        { id: 'Sleeper #9910', mask: 'AirFit', complianceScore: 92, riskTier: 'LOW', phase: 'Maintenance' },
        { id: 'Sleeper #2201', mask: 'AirFit', complianceScore: 96, riskTier: 'LOW', phase: 'Maintenance' },
      ] as any;
    }
    if (endpoint.includes('/cohort')) {
      return [
        { id: 'Peer Sleeper #8742', age: 53, mask: 'AirFit', dropoutRisk: 85, complianceScore: 42, riskTier: 'CRITICAL', phase: 'Titration', latestAction: 'Needs Mask Fit adjustment' },
        { id: 'Peer Sleeper #1102', age: 60, mask: 'AirFit', dropoutRisk: 72, complianceScore: 58, riskTier: 'HIGH', phase: 'Acclimation', latestAction: 'Tuned mask straps' },
        { id: 'Peer Sleeper #4491', age: 47, mask: 'AirFit', dropoutRisk: 64, complianceScore: 68, riskTier: 'ELEVATED', phase: 'Acclimation', latestAction: 'Swapped standard cushion' },
        { id: 'Peer Sleeper #8832', age: 56, mask: 'AirFit', dropoutRisk: 38, complianceScore: 84, riskTier: 'STABLE', phase: 'Maintenance', latestAction: 'Began humidification' },
        { id: 'Peer Sleeper #9910', age: 58, mask: 'AirFit', dropoutRisk: 12, complianceScore: 92, riskTier: 'LOW', phase: 'Maintenance', latestAction: 'Adherent on therapy' },
        { id: 'Peer Sleeper #2201', age: 51, mask: 'AirFit', dropoutRisk: 8, complianceScore: 96, riskTier: 'LOW', phase: 'Maintenance', latestAction: 'Routine filters swap' },
      ] as any;
    }
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

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const result = await apiFetchRaw<T>(endpoint, options);
  if (result && typeof result === 'object' && !(result as any).__isLive) {
    return makeMockObjectNaN(result) as T;
  }
  return result;
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
  if (data.usageHistory) {
    if (!(data as any).__isLive) {
      return makeMockObjectNaN(data);
    }
    return data;
  }

  // Otherwise, map backend shape to frontend shape
  let streak = 0;
  // Assume backend returns newest first or unsorted, let's sort newest first to calculate streak
  const sortedSessions = (data.sessions || []).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  for (let i = 0; i < sortedSessions.length; i++) {
    if (sortedSessions[i].usage_hours >= 4) streak++;
    else break;
  }

  const result: CpapTrends = {
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

  if ((data as any).__isLive) {
    (result as any).__isLive = true;
  } else {
    return makeMockObjectNaN(result);
  }
  return result;
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
  const devices = data.devices || data || [];
  if (data && (data as any).__isLive) {
    (devices as any).__isLive = true;
  }
  return devices;
}

/** Get intervention history for a patient */
export async function fetchInterventions(patientId: string): Promise<any[]> {
  const data = await apiFetch<any>(`/api/interventions/${formatPatientId(patientId)}`);
  const list = data.interventions || (Array.isArray(data) ? data : []);

  // Ensure every item has a 'type' field (mapping from backend 'job_category' if needed)
  const mapped = list.map((item: any) => ({
    ...item,
    type: item.type || item.job_category || 'Intervention'
  }));

  if (data && (data as any).__isLive) {
    (mapped as any).__isLive = true;
  }
  return mapped;
}

/** Get survey data for a patient */
export async function fetchSurveys(patientId: string): Promise<SurveyResponse> {
  const patientIdFormatted = formatPatientId(patientId);
  try {
    const [monitoringData, medicalData] = await Promise.all([
      apiFetch<any>(`/api/surveys/${patientIdFormatted}/monitoring`),
      apiFetch<any>(`/api/surveys/${patientIdFormatted}/medical`).catch(() => ({ physician: [] }))
    ]);

    const result: SurveyResponse = {
      physician: medicalData?.physician || (Array.isArray(medicalData) ? medicalData : []),
      technician: monitoringData?.technician || (Array.isArray(monitoringData) ? monitoringData : []),
      calendar: monitoringData?.calendar || medicalData?.calendar || [],
      patient: monitoringData?.patient || medicalData?.patient || {
        next: {
          name: 'Health Survey',
          dueDate: new Date().toISOString(),
          questions: 8,
          persistence: { status: 'pending' }
        },
        history: []
      }
    };

    if ((monitoringData as any)?.__isLive || (medicalData as any)?.__isLive) {
      (result as any).__isLive = true;
    }
    return result;
  } catch (err) {
    return apiFetch<SurveyResponse>(`/api/surveys/${patientIdFormatted}/monitoring`);
  }
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
    const res = await fetch(`${BASE_URL}/health`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Clinical services unavailable');
    return await res.json();
  } catch (error) {
    const res = await fetch(`${BASE_URL}/api/patients/`, { cache: 'no-store' });
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
  // Map frontend parameters to backend InterventionInput schema:
  // type, status, technician_id, notes
  const backendData = {
    type: data.type,
    status: data.outcome || 'Done',
    technician_id: data.actor?.id || 'DR-001',
    notes: [
      data.notes || '',
      data.job_code ? `[Job Code: ${data.job_code}]` : '',
      data.signature_hash ? `[Signature Hash: ${data.signature_hash}]` : ''
    ].filter(Boolean).join(' ')
  };

  return apiFetch(`/api/interventions/${formatPatientId(patientId)}`, {
    method: 'POST',
    body: JSON.stringify(backendData),
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
export async function submitVideoInteraction(patientId: string, videoId: string | number, data: {
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
  const patientIdFormatted = formatPatientId(patientId);
  const promises = data.answers.map(ans => {
    const scoreVal = typeof ans.value === 'number' ? ans.value : parseFloat(String(ans.value));
    return apiFetch(`/api/surveys/${patientIdFormatted}/submit`, {
      method: 'POST',
      body: JSON.stringify({
        survey_name: surveyId,
        question_id: ans.question_id,
        answer_value: String(ans.value),
        score_value: isNaN(scoreVal) ? null : scoreVal,
        severity_label: null
      }),
    });
  });
  return Promise.all(promises);
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

/** Clinician requests active patient sensing/surveys (PROM) due to low confidence */
export async function requestPatientSensing(patientId: string, streams: string[]) {
  return apiFetch(`/api/surveys/${formatPatientId(patientId)}/request-sensing`, {
    method: 'POST',
    body: JSON.stringify({ streams, timestamp: new Date().toISOString() }),
  });
}

/** Log Clinician Override (Accept/Reject AI recommendation) */
export async function submitClinicianOverride(patientId: string, data: {
  status: 'accepted' | 'rejected';
  reject_reason?: string;
  notes?: string;
}) {
  return apiFetch(`/api/dashboard/patient/${formatPatientId(patientId)}/analysis/weekly/override`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/** Technician pairs a new device to a patient */
export async function pairDevice(patientId: string, data: {
  device_name: string;
  device_type: string;
  serial_number: string;
  assigned_date?: string;
}) {
  return apiFetch(`/api/devices/patient/${formatPatientId(patientId)}/pair`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/** Technician unpairs a device from a patient */
export async function unpairDevice(patientId: string, deviceId: string) {
  return apiFetch(`/api/devices/patient/${formatPatientId(patientId)}/unpair`, {
    method: 'POST',
    body: JSON.stringify({ device_id: deviceId })
  });
}

/** Triggers a remote diagnostic check on a patient's device */
export async function runDeviceDiagnostic(patientId: string, deviceId: string) {
  return apiFetch(`/api/devices/patient/${formatPatientId(patientId)}/diagnostic`, {
    method: 'POST',
    body: JSON.stringify({ device_id: deviceId })
  });
}

/** Technician adds a new biomarker device to warehouse stock */
export async function addInventoryItem(data: {
  item: string;
  category: string;
  stock: number;
  min_stock: number;
  status?: string;
}) {
  return apiFetch(`/api/inventory/`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/** Technician triggers a reorder request for a low-stock item */
export async function reorderInventory(data: {
  item_id: string;
  quantity: number;
  vendor: string;
}) {
  return apiFetch(`/api/inventory/reorder`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

/** List all ML models with their current health metrics */
export async function fetchModels() {
  return apiFetch<any[]>(`/api/models/`);
}

/** Request retraining of a specific ML model */
export async function requestRetraining(modelId: string) {
  return apiFetch(`/api/models/${modelId}/retrain`, {
    method: 'POST'
  });
}

/** Calculates effectiveness of each intervention type for a patient */
export async function fetchInterventionsEffectiveness(patientId: string) {
  return apiFetch<any>(`/api/dashboard/patient/${formatPatientId(patientId)}/reporting/interventions-effectiveness`);
}


// ─── Peer Cohort Types & Fetch Helpers ──────────────────────────────────────

export interface ClinicianCohortMember {
  id: string;
  age: number;
  mask: string;
  riskTier: string;
  dropoutRisk: number;
  complianceScore: number;
  phase: string;
  latestAction: string;
}

export interface PatientCohortMember {
  id: string;
  mask: string;
  riskTier: string;
  complianceScore: number;
  phase: string;
}

export async function fetchClinicianCohort(patientId: string): Promise<ClinicianCohortMember[]> {
  const data = await apiFetch<any>(`/api/patients/${formatPatientId(patientId)}/cohort`);
  const list = data?.data?.peers || data?.peers || (Array.isArray(data) ? data : []);
  if (data && (data as any).__isLive) {
    (list as any).__isLive = true;
  }
  return list;
}

export async function fetchPatientCohort(patientId: string): Promise<PatientCohortMember[]> {
  const data = await apiFetch<any>(`/api/dashboard/patient/${formatPatientId(patientId)}/reporting/cohort`);
  const list = data?.data?.peers || data?.peers || (Array.isArray(data) ? data : []);
  if (data && (data as any).__isLive) {
    (list as any).__isLive = true;
  }
  return list;
}

export interface ComplianceTrajectoryPoint {
  name: string;
  'Cohort Average': number;
  'My Progress': number;
}

export interface PeerIntervention {
  type: string;
  desc: string;
  successRate: number;
  gain: string;
}

export const PEER_INTERVENTIONS: PeerIntervention[] = [
  { type: 'Mask Refit & Adjustments', desc: 'Resolved seal issues and bridge pressure', successRate: NaN, gain: 'NaN' },
  { type: 'Remote Pressure Adjustment', desc: 'Reduced baseline breathing strain', successRate: NaN, gain: 'NaN' },
  { type: 'Coaching Video Guides', desc: 'Self-guided adjustments via mobile videos', successRate: NaN, gain: 'NaN' },
];

export function calculateComplianceTrajectory(adherenceRate: number): ComplianceTrajectoryPoint[] {
  const patientScore30 = NaN; // Onboarding baseline — NaN until live data
  const patientScore60 = NaN; // NaN until live adherence rate from backend
  const patientScore90 = NaN;

  return [
    { name: '30 Days (Onboarding)', 'Cohort Average': NaN, 'My Progress': patientScore30 },
    { name: '60 Days (Acclimation)', 'Cohort Average': NaN, 'My Progress': patientScore60 },
    { name: '90 Days (Maintenance)', 'Cohort Average': NaN, 'My Progress': patientScore90 },
  ];
}

