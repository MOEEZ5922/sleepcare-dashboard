# SleepCare Dashboard — Routes and Pages Catalog

> **Source of Truth:** [`src/app/routes.tsx`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/routes.tsx)  
> **Router Package:** `react-router` v7.13.0 (`createBrowserRouter`)

---

## 1. Complete Route Inventory

The application defines **39 route definitions in total** in [`src/app/routes.tsx`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/routes.tsx) across public auth, patient companion, physician cockpit, and technician workbench tiers. Of these:
- **34 are page destinations** (rendering layouts and views).
- **5 are redirects** (handling fallback routing and convenience aliases).

| Path | Type | Layout / Page Component | Purpose | Role / Access | Critical Dependencies |
|---|---|---|---|---|---|
| `/` | Page Destination | [`RoleSelector`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/RoleSelector.tsx) | Root portal launcher allowing users to select their designated portal | Public | `LindeLogo.png`, `lucide-react` |
| `/login` | Page Destination | [`PatientLogin`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/auth/PatientLogin.tsx) | Authentication page for CPAP patients | Public | `POST /api/auth/login`, `localStorage` |
| `/signup` | Page Destination | [`PatientSignup`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/auth/PatientSignup.tsx) | Patient registration and account creation | Public | `POST /api/auth/register` |
| `/patient` | Redirect | `<Navigate to="/login" replace />` | Convenience fallback redirecting unparameterized patient route to login | Public | React Router `Navigate` |
| `/physician/login` | Page Destination | [`PhysicianLogin`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/auth/PhysicianLogin.tsx) | Clinical staff authentication page | Public | `POST /api/auth/login`, `localStorage` |
| `/technician/login` | Page Destination | [`TechnicianLogin`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/auth/TechnicianLogin.tsx) | Technical staff authentication page | Public | `POST /api/auth/login`, `localStorage` |
| `/physician` | Page Destination | [`PhysicianLayout`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/PhysicianLayout.tsx) → [`PhysicianHome`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/physician/Home.tsx) | Clinical Exception Inbox (Urgent alerts and annual reviews) | Physician | `fetchPhysicianQueue`, `useApi` |
| `/physician/directory` | Page Destination | [`PhysicianLayout`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/PhysicianLayout.tsx) → [`PatientDirectory`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/shared/Directory.tsx) | Searchable directory of all enrolled patients | Physician | `fetchPatients`, `useApi` |
| `/physician/help` | Page Destination | [`PhysicianLayout`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/PhysicianLayout.tsx) → [`PhysicianHelp`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/physician/Help.tsx) | Clinical protocols and AI Model Lifecycle panel | Physician | `AILifecyclePanel`, `fetchModels` |
| `/physician/patient/:id` | Page Destination | [`PhysicianPatientLayout`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/PhysicianPatientLayout.tsx) → [`PhysicianSummary`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/physician/Summary.tsx) | Primary clinical cockpit, AI recommendation banner, care pathway management | Physician | `SummaryContent`, `fetchPatientSummary` |
| `/physician/patient/:id/trends` | Page Destination | [`PhysicianPatientLayout`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/PhysicianPatientLayout.tsx) → [`PhysicianCPAP`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/physician/CPAP.tsx) | Daily CPAP compliance, pressure titrations, and leak curves | Physician | `UniversalCPAP`, `fetchCpapTrends` |
| `/physician/patient/:id/biomarkers` | Page Destination | [`PhysicianPatientLayout`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/PhysicianPatientLayout.tsx) → [`UniversalBiomarkers`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/shared/UniversalBiomarkers.tsx) | Multi-sensor physiological signals (HRV, SpO₂, ODI, Sleep Staging) | Physician | `fetchBiomarkerOverview`, `fetchWithingsData`, `fetchMasimoData`, `fetchSleepData` |
| `/physician/patient/:id/interventions` | Page Destination | [`PhysicianPatientLayout`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/PhysicianPatientLayout.tsx) → [`UniversalInterventions`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/shared/UniversalInterventions.tsx) | Medical orders, pathway authorizations, video coaching audit trail | Physician | `fetchInterventions`, `createIntervention`, `createAuthorization` |
| `/physician/patient/:id/surveys` | Page Destination | [`PhysicianPatientLayout`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/PhysicianPatientLayout.tsx) → [`UniversalSurveys`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/shared/UniversalSurveys.tsx) | Psychometric survey analytics (ESS, PSQI, ISI, FSS, SF-36) | Physician | `fetchSurveys`, `submitMonitoringLog` |
| `/physician/patient/:id/ai-analysis` | Page Destination | [`PhysicianPatientLayout`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/PhysicianPatientLayout.tsx) → [`UniversalAIAnalysis`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/shared/UniversalAIAnalysis.tsx) | Machine learning dropout forecast, SHAP factor attribution, active sensing trigger | Physician | `fetchWeeklyAnalysis`, `requestPatientSensing` |
| `/physician/patient/:id/reporting` | Page Destination | [`PhysicianPatientLayout`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/PhysicianPatientLayout.tsx) → [`UniversalReporting`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/shared/UniversalReporting.tsx) | Peer cohort benchmarks & distributed telemetry latency KPI dashboard | Physician | `fetchClinicianCohort`, `fetchLatencyKPIDashboard` |
| `/technician` | Page Destination | [`TechnicianLayout`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/TechnicianLayout.tsx) → [`TechnicianHome`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/technician/Home.tsx) | Operational triage events inbox & dropout risk queue | Technician | `fetchTechnicianEvents`, `fetchTechnicianQueue`, `submitEventTriage` |
| `/technician/directory` | Page Destination | [`TechnicianLayout`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/TechnicianLayout.tsx) → [`PatientDirectory`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/shared/Directory.tsx) | Patient directory configured for technician routing | Technician | `fetchPatients`, `useApi` |
| `/technician/inventory` | Page Destination | [`TechnicianLayout`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/TechnicianLayout.tsx) → [`TechnicianInventory`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/technician/Inventory.tsx) | Hardware inventory tracker (Masks, Machines, Sensors) with stock reordering | Technician | `fetchInventory`, `addInventoryItem`, `reorderInventory` |
| `/technician/help` | Page Destination | [`TechnicianLayout`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/TechnicianLayout.tsx) → [`TechnicianHelp`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/technician/Help.tsx) | IT manuals, hardware diagnostics, and AI Model Lifecycle panel | Technician | `AILifecyclePanel`, `fetchModels` |
| `/technician/patient/:id` | Page Destination | [`TechnicianPatientLayout`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/TechnicianPatientLayout.tsx) → [`TechnicianSummary`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/technician/Summary.tsx) | Hardware & logistical patient summary | Technician | `SummaryContent (role="technician")` |
| `/technician/patient/:id/summary` | Page Destination | [`TechnicianPatientLayout`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/TechnicianPatientLayout.tsx) → [`TechnicianSummary`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/technician/Summary.tsx) | Explicit alias route for technician patient summary | Technician | `SummaryContent (role="technician")` |
| `/technician/patient/:id/trends` | Page Destination | [`TechnicianPatientLayout`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/TechnicianPatientLayout.tsx) → [`TechnicianCPAP`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/technician/CPAP.tsx) | Technical CPAP analytics (pressure range, leak flow rate) | Technician | `UniversalCPAP (role="technician")` |
| `/technician/patient/:id/interventions` | Page Destination | [`TechnicianPatientLayout`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/TechnicianPatientLayout.tsx) → [`UniversalInterventions`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/shared/UniversalInterventions.tsx) | Equipment dispatch and technician hardware intervention logging | Technician | `UniversalInterventions`, `fetchInterventions` |
| `/technician/patient/:id/surveys` | Page Destination | [`TechnicianPatientLayout`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/TechnicianPatientLayout.tsx) → [`UniversalSurveys`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/shared/UniversalSurveys.tsx) | Psychometric survey logs & patient compliance questionnaire review | Technician | `UniversalSurveys`, `fetchSurveys` |
| `/technician/patient/:id/biomarkers` | Page Destination | [`TechnicianPatientLayout`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/TechnicianPatientLayout.tsx) → [`UniversalBiomarkers`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/shared/UniversalBiomarkers.tsx) | Multi-sensor telemetry inspection and sensor signal verification | Technician | `UniversalBiomarkers`, `fetchBiomarkers` |
| `/technician/patient/:id/ai-analysis` | Page Destination | [`TechnicianPatientLayout`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/TechnicianPatientLayout.tsx) → [`UniversalAIAnalysis`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/shared/UniversalAIAnalysis.tsx) | AI dropout risk review and sensor request controls | Technician | `UniversalAIAnalysis`, `fetchWeeklyAnalysis` |
| `/technician/patient/:id/devices` | Page Destination | [`TechnicianPatientLayout`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/TechnicianPatientLayout.tsx) → [`TechnicianDevices`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/technician/Devices.tsx) | Sensor pairing workbench (Withings, Masimo, SomnoArt) and hardware diagnostics | Technician | `fetchDevices`, `pairDevice`, `unpairDevice`, `runDeviceDiagnostic` |
| `/technician/patient/:id/logistics` | Redirect | `<Navigate to="devices" replace />` | Route alias redirecting logistics tab to devices | Technician | React Router `Navigate` |
| `/patient/:id` | Page Destination | [`PatientLayout`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/PatientLayout.tsx) → [`PatientInvitation`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/patient/Invitation.tsx) | Patient onboarding roadmap and task completion checklist | Patient | `useApi`, `localStorage` onboarding flags |
| `/patient/:id/home` | Page Destination | [`PatientLayout`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/PatientLayout.tsx) → [`PatientHome`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/patient/Home.tsx) | Main patient dashboard with real-time video coaching triggers | Patient | `fetchPatientSummary`, `fetchCpapTrends`, `fetchSurveys`, `fetchVideos` |
| `/patient/:id/cpap` | Page Destination | [`PatientLayout`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/PatientLayout.tsx) → [`PatientCPAP`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/patient/CPAP.tsx) | Patient sleep metrics, streak rings, and daily compliance | Patient | `fetchCpapTrends` |
| `/patient/:id/interventions` | Page Destination | [`PatientLayout`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/PatientLayout.tsx) → [`PatientInterventions`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/patient/Interventions.tsx) | Mask replacement status, logistics tracking, paired devices | Patient | `fetchInterventions`, `fetchDevices`, `fetchMaskHistory` |
| `/patient/:id/equipment` | Redirect | `<Navigate to="interventions" replace />` | Route alias redirecting equipment tab to interventions | Patient | React Router `Navigate` |
| `/patient/:id/surveys` | Page Destination | [`PatientLayout`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/PatientLayout.tsx) → [`PatientSurveys`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/patient/Surveys.tsx) | Standard patient self-check questionnaires (8 questions) | Patient | `fetchSurveys`, `submitSurveyResponse` |
| `/patient/:id/videos` | Page Destination | [`PatientLayout`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/PatientLayout.tsx) → [`PatientVideos`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/patient/Videos.tsx) | Multimedia video library categorized by equipment, tips, maintenance | Patient | `fetchVideos`, `CoachingVideoModal`, `useVideoTelemetry` |
| `/patient/:id/reporting` | Page Destination | [`PatientLayout`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/PatientLayout.tsx) → [`PatientReporting`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/patient/Reporting.tsx) | Patient-friendly peer progress curves and encouragement badges | Patient | `fetchPatientSummary`, `fetchPatientCohort`, `fetchPeerInterventions` |
| `/patient/:id/progress` | Redirect | `<Navigate to="reporting" replace />` | Route alias redirecting progress tab to reporting | Patient | React Router `Navigate` |
| `/patient/:id/help` | Page Destination | [`PatientLayout`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/PatientLayout.tsx) → [`PatientHelp`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/patient/Help.tsx) | Support center & direct equipment issue reporting form | Patient | `createSupportTicket` |

---

## 2. Deep Dive: Key Route Implementations

### A. Route `/` — `RoleSelector`
- **Purpose**: Brand landing and role gateway for the SleepCare ecosystem.
- **UI Sections**: Header with Linde brand logo, three interactive glassmorphic cards (Patient App, Technician Portal, Physician Portal), footer metadata.
- **Interactions**: Clicking a portal card navigates to `/login`, `/technician/login`, or `/physician/login`.
- **Loading / Error**: Static presentational page; instant render.

### B. Route `/physician` — `PhysicianHome` (Exception Inbox)
- **Purpose**: Triage hub allowing clinicians to inspect only patients with active therapy anomalies.
- **UI Sections**:
  1. Top bar with Live backend signal, real-time search input, and filter button.
  2. Tab toggle between **Urgent Exceptions** and **Annual Reviews**.
  3. Patient alert cards showing: Risk Score (color-coded $\ge 80$ Coral, $\ge 70$ Amber, $<70$ Sage), Trigger reason (e.g. AHI spike, severe leak, dropout probability), and direct navigation links to `/physician/patient/:id`.
- **Hooks & APIs**: `useApi(fetchPhysicianQueue, { cacheKey: 'physician-queue' })`.
- **States**:
  - *Loading*: Full-page centered teal spinner (`<Loader2 className="animate-spin" />`).
  - *Empty*: "No clinical escalations found in inbox." message.
  - *Live*: Green "Live" badge displayed if `isLiveResponse(queue)` is true.

### C. Route `/physician/patient/:id` — `PhysicianSummary` & `SummaryContent`
- **Purpose**: Comprehensive clinical cockpit for a selected patient.
- **UI Sections**:
  1. Top Recommendation Banner (`RecommendationBanner`): Human-in-the-loop AI suggestion (e.g. adjust pressure, switch mask cushion) with **Accept**, **Reject** (with reason dropdown), and **Undo** clinical gates.
  2. Clinical Metric Cards: Adherence %, AHI index, 90th percentile leak, risk score.
  3. CPAP 7-Day Trend Chart: Mini Recharts visualization.
  4. Clinical Orders & Pathways: Allows switching to App IAH titration or Alternative Therapies (MAD / HNS).
  5. Interventions Timeline: Chronological log of medical actions.
- **Hooks & APIs**: `useApi` calls for `fetchPatientSummary`, `fetchWeeklyAnalysis`, `fetchCpapTrends(id, 7)`, and `fetchInterventions`.
- **Actions**:
  - Triggering `createIntervention` via [`ClinicalOrderModal`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/components/ClinicalOrderModal.tsx).
  - Authorizing care transitions via [`AuthorizationModal`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/components/AuthorizationModal.tsx).
  - Submitting clinician override via `submitClinicianOverride`.

### D. Route `/technician` — `TechnicianHome` (Priority Queue & Triage)
- **Purpose**: Operational workbench for hardware alerts and logistics triage.
- **UI Sections**:
  1. Tab toggle between **Live Triage Events** and **High-Risk Queue**.
  2. Triage events feed: Cards for Mask Leaks, Usage Drops, Missed Nights, Equipment Alerts, and Patient Self-Reports.
  3. Immediate action buttons: **Confirm Alert (Validate)** or **Dismiss (with reason input)**.
  4. High-risk queue: Grouped by clustering tiers (`Adherent`, `Attempting`, `Struggling`, `Dropout`).
- **Hooks & APIs**: `fetchTechnicianEvents`, `fetchTechnicianQueue`, `submitEventTriage(eventId, { action, notes })`.

### E. Route `/patient/:id/home` — `PatientHome`
- **Purpose**: Daily companion screen for the CPAP sleeper.
- **UI Sections**:
  1. `PatientWelcomeCard`: Streak counter and personal greeting.
  2. `TherapyLeakAlert`: Warning banner when 90th percentile leak exceeds clinical limits.
  3. `RequiredSurveyCard`: Notification for pending questionnaires.
  4. `DailyPulseCard`: Quick sleep rating prompt.
  5. `SleepProgressRings`: Visual circular progress towards the 8-hour goal.
  6. `WeeklySummaryCard`: 7-day usage review.
  7. `SleepTipCard`: Educational recommendations.
  8. `QuickAccessLinks`: Direct links to Sleep, Equipment, Surveys, and Help.
- **Hooks & APIs**: 
  - `useApi` for summary, trends, surveys, and assigned coaching videos.
  - **Auto-polling**: Polling interval of 3000ms ensures real-time video prescription delivery from VM2.
  - Automatically pops up [`CoachingVideoModal`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/components/CoachingVideoModal.tsx) when unwatched high-relevance video packets arrive.

### F. Route `/patient/:id/videos` — `PatientVideos`
- **Purpose**: Multimedia video coaching library.
- **UI Sections**:
  1. Category filters: Mask & Equipment, Tips & Tricks, Maintenance, Understanding Your Data, Lifestyle.
  2. Status filters: All, Unwatched, Recommended.
  3. Video cards with duration, badge, category color, and play trigger.
  4. [`CoachingVideoModal`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/components/CoachingVideoModal.tsx): Plays single or multi-clip packages with WebVTT subtitles, star rating, and distributed telemetry timestamps.
- **Hooks & APIs**: `fetchVideos(patientId)`, `submitVideoInteraction`, `useVideoTelemetry`.
