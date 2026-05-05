# COMPLETE SYSTEM API CONTRACTS: SleepCare Platform

**Date:** April 28, 2026  
**Version:** 4.0 (FINAL - Universal Truth Architecture)  
**Technical Stakeholder:** Siamak & Backend Engineering Team  
**Clinical Owner:** Moeez Ahmed

---

## Part 1: Global Entities & Retrieval (GET)

### 1. Patient Summary (Header)
**Endpoint:** `GET /api/v1/patient/{id}/summary`  
**Purpose:** Powers the "Patient Cockpit" and header metrics across all portals.
```json
{
  "name": "string",
  "dob": "YYYY-MM-DD",
  "gender": "enum[M, F, Other]",
  "therapyStartDate": "YYYY-MM-DD",
  "riskScore": "float", // Scale: 0-100 (Do not use 0-1 probability here)
  "therapyStatus": "string",
  "address": "string",
  "machineSerial": "string",
  "maskType": "string"
}
```

### 2. Physician Exception Inbox
**Endpoint:** `GET /api/v1/physician/queue`  
**Purpose:** Powers the Physician's Home tab lists (Urgent AI escalations & Annual Reviews).
```json
{
  "urgent": [
    {
      "id": "number",
      "patientName": "string",
      "riskScore": "float",
      "reason": "string",
      "category": "string",
      "lastReview": "YYYY-MM-DD",
      "daysActive": "int"
    }
  ],
  "annualReviews": [
    {
      "id": "number",
      "patientName": "string",
      "riskScore": "float",
      "therapyStart": "YYYY-MM-DD",
      "daysUntilDue": "int",
      "status": "enum[Due Soon, Overdue]"
    }
  ]
}
```

### 3. Technician Priority Queue
**Endpoint:** `GET /api/v1/technician/queue`  
**Purpose:** Powers the Technician's unified list of patients sorted by proactive dropout prevention.
```json
[
  {
    "id": "number",
    "patientName": "string",
    "dropoutRisk": "float",
    "usageHours": "float",
    "usageCategory": "string",
    "postalCode": "string",
    "lastContact": "YYYY-MM-DD",
    "action": "string",
    "behavioralCluster": "string",
    "phase": "string",
    "maskType": "string",
    "lastMaskChange": "YYYY-MM-DD",
    "equipmentNeed": ["string"],
    "leakProfile": { "p50": "float", "p95": "float", "max": "float" },
    "assetTracking": { "serial": "string", "assetTag": "string" },
    "interventionHistory": [
      { "date": "YYYY-MM-DD", "type": "string", "result": "string", "tech": "string", "code": "string" }
    ],
    "monitoringSurveys": [
      { "id": "string", "question": "string", "answer": "string", "author": "string", "role": "string", "date": "YYYY-MM-DD" }
    ],
    "biomarkers": {
      "ahi": { "current": "float", "baseline": "float" },
      "spo2": { "mean": "float", "nadir": "float" },
      "odi": "float",
      "hrv": "float",
      "oai": "float"
    }
  }
]
```

### 4. Technician Event-Based Inbox
**Endpoint:** `GET /api/v1/technician/events`  
**Purpose:** Powers reactive triage for Mechanical/Self-Reported Triggers.
```json
[
  {
    "id": "number",
    "type": "string",
    "severity": "enum[critical, high, medium, low]",
    "detectedAt": "ISO-8601",
    "patient": {
      "name": "string",
      "patientId": "number",
      "address": "string",
      "phone": "string",
      "maskType": "string"
    },
    "evidence": "string",
    "aiNote": "string",
    "suggestedAction": "string",
    "status": "enum[pending, resolved, dismissed]"
  }
]
```

### 5. Unified CPAP Trends
**Endpoint:** `GET /api/v1/patient/{id}/trends/cpap`  
**Purpose:** Powers the CPAP Trends tab. *Note: Central Apnea has been explicitly removed.*
```json
{
  "currentAHI": "float",
  "percentileLeak": "float",
  "averageHours": "float",
  "lastMaskChange": "YYYY-MM-DD",
  "currentMask": "string",
  "jobCode": "string",
  "pressureSettings": { "min": "float", "max": "float", "current": "float" },
  "usageHistory": [
    { "date": "YYYY-MM-DD", "hours": "float", "ahi": "float" }
  ],
  "thirtyDayTrend": [
    { "day": "number", "ahi": "float" }
  ],
  "streak": "int"
}
```

### 6. Universal Biomarkers
**Endpoint:** `GET /api/v1/patient/{id}/biomarkers`  
**Purpose:** Powers the multi-sensor physiological tab.
```json
{
  "sleepQuality": "float",
  "restfulness": "string",
  "odi": [{ "day": "number", "value": "float" }],
  "hrv": [{ "day": "number", "value": "float" }],
  "spo2": [{ "day": "number", "value": "float" }],
  "deepSleep": [{ "day": "number", "value": "float" }],
  "bp": [{ "day": "number", "systolic": "float", "diastolic": "float" }],
  "status": { "vitals": "string", "general": "string" }
}
```

### 6.1 Biomarker Devices (Hardware Management)
**Endpoint:** `GET /api/v1/patient/{id}/devices`  
**Purpose:** Powers the Technician's "Biomarker Devices" tab and Patient "Equipment" tab, tracking hardware health, battery, and sync status for Hexoskin, Masimo, Somno-Art, and Withings.
```json
[
  {
    "id": "string", // e.g., "HEXO-092"
    "name": "enum[Hexoskin Smart Shirt, Masimo MightySat Rx, Somno-Art Band, Withings BPM Core, Withings ScanWatch]",
    "type": "string",
    "status": "enum[Online, Offline, Disconnected]",
    "battery": "string", // e.g. "82%"
    "lastSync": "string", // e.g. "12 mins ago"
    "assigned": "string" // e.g. "Jan 12, 2025"
  }
]
```

### 7. Universal Interventions
**Endpoint:** `GET /api/v1/patient/{id}/interventions`  
**Purpose:** Powers the shared intervention timeline.
```json
{
  "physician": { "availableTherapies": ["string"] },
  "technician": {
    "tasks": [
      { "id": "number", "status": "string", "item": "string", "priority": "string", "scheduledDate": "YYYY-MM-DD" }
    ]
  },
  "patient": {
    "upcomingDelivery": {
      "item": "string",
      "status": "string",
      "estimatedArrival": "YYYY-MM-DD",
      "steps": [{ "label": "string", "completed": "boolean" }]
    }
  }
}
```

### 8. Universal Surveys
**Endpoint:** `GET /api/v1/patient/{id}/surveys`  
**Purpose:** Powers the unified Medical + Operational logs view.
```json
{
  "physician": [
    { "id": "number", "name": "string", "dateTaken": "YYYY-MM-DD", "score": "float", "threshold": "float", "risk": "string" }
  ],
  "technician": [
    { "id": "number", "name": "string", "type": "string", "lastCompleted": "YYYY-MM-DD" }
  ],
  "patient": {
    "next": {
      "name": "string",
      "dueDate": "YYYY-MM-DD",
      "questions": "int",
      "persistence": { "lastReminder": "string", "status": "string", "automationActive": "boolean", "daysOverdue": "int" }
    },
    "history": [{ "name": "string", "completed": "YYYY-MM-DD", "score": "string" }]
  }
}
```

### 9. AI Weekly State
**Endpoint:** `GET /api/v1/patient/{id}/analysis/weekly`  
**Purpose:** Powers the Physician's deep-dive AI view.
```json
{
  "weekOf": "YYYY-MM-DD",
  "compositeRiskScore": "float",
  "previousRiskScore": "float",
  "riskTier": "string",
  "phaseLabel": "string",
  "confidenceLevel": "float",
  "daysToPredictedDropout": "int",
  "clusterAssignment": { "current": "string", "previous": "string", "changedThisWeek": "boolean", "description": "string" },
  "sevenDayRolling": [
    { "day": "string", "usageHours": "float", "leakRate": "float", "ahi": "float" }
  ],
  "riskFactorBreakdown": [
    { "factor": "string", "contribution": "float", "direction": "enum[worsening, improving, stable]" }
  ],
  "activeFlags": [
    { "label": "string", "severity": "string" }
  ],
  "nextBestAction": { "type": "string", "deliveryMode": "string", "rationale": "string", "reassessmentWindow": "string" }
}
```

### 10. Educational Video Interventions
**Endpoint:** `GET /api/v1/patient/{id}/videos`  
**Purpose:** Tracks video adherence as a form of clinical intervention.
```json
{
  "physician": [{ "id": "number", "title": "string", "duration": "string", "category": "string", "thumbnail": "string" }],
  "technician": [{ "id": "number", "title": "string", "duration": "string", "category": "string", "thumbnail": "string" }],
  "patient": [{ "id": "number", "title": "string", "duration": "string", "category": "string", "triggerReason": "string", "relevance": "string", "watched": "boolean", "rating": "float|null" }]
}
```

---

## Part 3: System Mutators (POST)

### 11. Technician AI Event Triage
**Endpoint:** `POST /api/v1/technician/events/{event_id}/triage`  
**Purpose:** Technician validates or dismisses an AI-flagged anomaly.
```json
{
  "action": "enum[VALIDATE, DISMISS]",
  "technician_id": "string",
  "notes": "string",
  "reason_code": "string", // Required if action = DISMISS (e.g., 'FALSE_POSITIVE')
  "timestamp": "ISO-8601"
}
```

### 12. Submit Operational Monitoring Log
**Endpoint:** `POST /api/v1/patient/{id}/surveys/monitoring`  
**Purpose:** Technician logging a Mask Fit, Hardware Integrity, or Cleaning Review.
```json
{
  "form_type": "string", // e.g., 'Mask Comfort & Fit Check'
  "notes": "string", // The qualitative observation
  "technician_id": "string",
  "timestamp": "ISO-8601"
}
```

### 13. Create New Intervention
**Endpoint:** `POST /api/v1/patient/{id}/interventions`  
**Purpose:** Both Physicians and Technicians dispatching an action.
```json
{
  "type": "string", 
  "job_code": "string", // e.g., 'EX-DISP', 'SL-REF'
  "actor": {
    "role": "enum[Physician, Technician]",
    "id": "string"
  },
  "outcome": "string",
  "notes": "string",
  "signature_hash": "string"
}
```

### 14. Authorize Clinical Pathway
**Endpoint:** `POST /api/v1/patient/{id}/authorizations`  
**Purpose:** Physician applying digital seal to authorize a transition (e.g., MAD/HNS).
```json
{
  "type": "enum[MAD, HNS, CPAP_MOD]",
  "status": "enum[Approved, Denied]",
  "physician_id": "string",
  "digital_seal_hash": "string",
  "timestamp": "ISO-8601"
}
```

### 15. Track Video Engagement
**Endpoint:** `POST /api/v1/patient/{id}/videos/{video_id}/interaction`  
**Purpose:** Patient marking a video as watched/rated for compliance tracking.
```json
{
  "watched": "boolean",
  "rating": "int", // 1-5 scale
  "watch_duration_seconds": "int",
  "timestamp": "ISO-8601"
}
```

### 16. Submit Medical Survey
**Endpoint:** `POST /api/v1/patient/{id}/surveys/{survey_id}/submit`  
**Purpose:** Patient submitting a standardized medical survey (ESS, PSQI, etc.).
```json
{
  "answers": [
    { "question_id": "string", "value": "string" }
  ],
  "completion_time_seconds": "int",
  "timestamp": "ISO-8601"
}
```

### 17. Submit Support Ticket
**Endpoint:** `POST /api/v1/patient/{id}/support/ticket`  
**Purpose:** Patient reporting an issue (e.g., mask leak, machine noise) via the Help tab.
```json
{
  "issue_type": "enum[mask_leak, mask_discomfort, machine_noise, dry_nose, pressure_issue, other]",
  "details": "string",
  "timestamp": "ISO-8601"
}
```
