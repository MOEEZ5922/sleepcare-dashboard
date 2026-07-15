export const patientInfo = {
  name: "Sarah Mitchell",
  dob: "1978-06-15",
  gender: "Female",
  therapyStartDate: "2025-01-12",
  riskScore: 72,
  therapyStatus: "Active - CPAP",
  address: "22 Rue de la Paix, 75002 Paris",
  machineSerial: "CPAP-2024-8745",
  maskType: "AirFit F20 - Medium",
  phone: "+33 1 42 61 50 00",
  email: "sarah.mitchell@example.com",
  is_lisa_user: true,
};

// Physician Exception-Based Inbox Data
export const physicianQueue = {
  urgent: [
    {
      id: 1,
      patientName: "Sarah Mitchell",
      riskScore: 85,
      reason: "AHI spike: 12.4 (↑45% from baseline)",
      category: "Complex AHI",
      lastReview: "2026-03-15",
      daysActive: 0,
    },
    {
      id: 2,
      patientName: "Robert Chen",
      riskScore: 92,
      reason: "AHI spike: 15.2 (↑30% from baseline)",
      category: "Complex AHI",
      lastReview: "2026-03-10",
      daysActive: 5,
    },
    {
      id: 3,
      patientName: "Maria Garcia",
      riskScore: 78,
      reason: "ODI >30 with SpO2 desaturation events",
      category: "Risk Score 8+",
      lastReview: "2026-04-01",
      daysActive: 0,
    },
    {
      id: 10,
      patientName: "James Wilson",
      riskScore: 95,
      reason: "Technician Escalation: Manual intervention failed 3x. Patient reports clinical chest pain.",
      category: "Tech Escalation",
      lastReview: "2026-04-20",
      daysActive: 0,
    },
  ],
  annualReviews: [
    {
      id: 4,
      patientName: "James Wilson",
      riskScore: 45,
      therapyStart: "2025-04-10",
      daysUntilDue: 5,
      status: "Due Soon",
    },
    {
      id: 5,
      patientName: "Emily Johnson",
      riskScore: 38,
      therapyStart: "2025-03-20",
      daysUntilDue: -10,
      status: "Overdue",
    },
  ],
};

// Technician Priority Queue Data (Proactive Dropout Prevention)
export const technicianQueue = [
  {
    id: 1,
    patientName: "Sarah Mitchell",
    dropoutRisk: 85,
    usageHours: 1.2,
    usageCategory: "<2 hrs",
    postalCode: "75002",
    lastContact: "2026-04-10",
    action: "Titration Review",
    behavioralCluster: "Attempting",
    phase: "Titration",
    maskType: "AirFit F20 - Medium",
    lastMaskChange: "2026-01-15",
    equipmentNeed: ["New Cushion", "Heated Tubing"],
    leakProfile: { p50: 12.4, p95: 28.5, max: 42.1 },
    assetTracking: { serial: "LND-7742-XP", assetTag: "TAG-991" },
    interventionHistory: [
      { date: "2026-04-19", type: "Escalated to MD Review", result: "Pending", tech: "System-Triage", code: "ESC-MD" },
      { date: "2026-04-18", type: "Tech Consult: Leak Issue", result: "Failed", tech: "J. Mitchell", code: "TC-FAIL" },
      { date: "2026-04-15", type: "Educational Video: Mask Fitting", result: "Failed", tech: "Auto-Trigger", code: "ED-VID" },
      { date: "2026-04-12", type: "Remote Pressure Calibration", result: "Success", tech: "AI-System", code: "VK-AUTO" },
      { date: "2026-03-15", type: "Dispatch: AirFit N20 Mask", result: "Resolved", tech: "J. Mitchell", code: "EX-DISP" },
    ],
    monitoringSurveys: [
      { id: "M1", question: "Mask Comfort (AirFit N20)", answer: "4 (Hurts nose bridge)" },
      { id: "M2", question: "Ease of Cleaning (VK Protocol)", answer: "Good" },
    ],
    biomarkers: {
      ahi: { current: 12.4, baseline: 4.2 },
      spo2: { mean: 94, nadir: 88 },
      odi: 15.2,
      hrv: 42,
      oai: 5.1
    }
  },
  {
    id: 2,
    patientName: "Robert Chen",
    dropoutRisk: 72,
    usageHours: 3.5,
    usageCategory: "2-4 hrs",
    postalCode: "69003",
    lastContact: "2026-04-08",
    action: "Motivational Call",
    behavioralCluster: "Struggling",
    phase: "Acclimation",
    maskType: "AirFit N20 - Small",
    lastMaskChange: "2026-02-20",
    equipmentNeed: ["Chin Strap"],
    leakProfile: { p50: 8.2, p95: 14.1, max: 19.5 },
    assetTracking: { serial: "LND-1102-AQ", assetTag: "TAG-882" },
    interventionHistory: [
      { date: "2026-03-20", type: "Software Update", result: "Success", tech: "K. Lee" },
    ],
    monitoringSurveys: [
      { id: "M1", question: "Morning Headache?", answer: "Occasional" },
      { id: "M2", question: "Device Noise", answer: "Acceptable" },
    ],
    biomarkers: {
      ahi: { current: 5.2, baseline: 3.8 },
      spo2: { mean: 96, nadir: 91 },
      odi: 6.5,
      hrv: 58,
      oai: 1.2
    }
  },
  {
    id: 3,
    patientName: "Maria Garcia",
    dropoutRisk: 68,
    usageHours: 1.8,
    usageCategory: "<2 hrs",
    postalCode: "33000",
    lastContact: "2026-04-12",
    action: "Home Visit Prep",
    behavioralCluster: "Non-Adherent",
    phase: "Acclimation",
    maskType: "AirFit F30 - Medium",
    lastMaskChange: "2025-11-05",
    equipmentNeed: ["Mask Refit Kit", "SD Card"],
    leakProfile: { p50: 15.5, p95: 32.2, max: 48.0 },
    assetTracking: { serial: "LND-4491-ZZ", assetTag: "TAG-004" },
    interventionHistory: [
      { date: "2026-02-10", type: "Humidifier Repair", result: "Resolved", tech: "J. Doe" },
    ],
    monitoringSurveys: [
      { id: "M1", question: "Mask Comfort (1-10)", answer: "4 (Hurts nose bridge)", author: "J. Doe", role: "Technician", date: "2026-04-10" },
      { id: "M2", question: "Ease of Cleaning", answer: "Good", author: "A. Smith", role: "Technician", date: "2026-03-25" },
    ],
  },
  {
    id: 10,
    patientName: "James Wilson",
    dropoutRisk: 45,
    usageHours: 5.2,
    usageCategory: "4-6 hrs",
    postalCode: "13001",
    lastContact: "2026-04-15",
    action: "Survey Follow-up",
    behavioralCluster: "Adherent",
    phase: "Maintenance",
    maskType: "AirFit P10 - Large",
    lastMaskChange: "2026-01-20",
    equipmentNeed: [],
    leakProfile: { p50: 5.1, p95: 12.4, max: 18.2 },
    assetTracking: { serial: "LND-8832-WW", assetTag: "TAG-112" },
    interventionHistory: [],
    monitoringSurveys: [],
    biomarkers: {
      ahi: { current: 3.2, baseline: 3.0 },
      spo2: { mean: 97, nadir: 94 },
      odi: 4.2,
      hrv: 62,
      oai: 0.8
    }
  },
];

// Technician Event-Based Inbox (Reactive Triage for Mechanical/Self-Reported Triggers)
export const technicianEvents = [
  {
    id: 1,
    type: "Patient Self-Report",
    severity: "high",
    detectedAt: "2026-04-19T09:45:00",
    patient: {
      name: "Sarah Mitchell",
      patientId: 1,
      address: "22 Rue de la Paix, 75002 Paris",
      phone: "+33 1 42 61 50 00",
      maskType: "AirFit F20 - Medium",
    },
    evidence: "Patient reported 'Severe mask discomfort and skin irritation' via the mobile app support tool.",
    aiNote: "Correlates with 3:15 AM mask removal. High probability of poor seal causing pressure points.",
    suggestedAction: "In-person mask refit required. Bring sensitive skin liners.",
    status: "pending",
  },
  {
    id: 101,
    type: "Mask Leak",
    severity: "high",
    detectedAt: "2026-04-19T07:30:00",
    patient: {
      name: "Robert Chen",
      patientId: 2,
      address: "45 Boulevard de la Liberté, 69003 Lyon",
      phone: "+33 4 72 10 30 30",
      maskType: "AirFit N20 - Small",
    },
    evidence: "Mask leak exceeded 24 L/min on 3 consecutive nights. Peak leak recorded at 38 L/min.",
    aiNote: "Pattern is consistent with mask seal degradation or incorrect fit.",
    suggestedAction: "Dispatch replacement mask kit.",
    status: "pending",
  },
];

export const cpapData = {
  currentAHI: 12.4,
  percentileLeak: 18.5,
  averageHours: 1.2,
  lastMaskChange: "2026-03-15",
  currentMask: "AirFit N20 (Nasal)",
  jobCode: "EX-VK",
  pressureSettings: {
    min: 6,
    max: 14,
    current: 10.5,
  },
  leak_field: "leaks95",
  usageHistory: [
    { date: "2026-04-08", hours: 7.2, ahi: 3.8, leakRate: 14.2, leaks95: 18.5, leaks90: 14.2, leaks0: 2.1, leaks_large_pct: 0.0 },
    { date: "2026-04-09", hours: 6.5, ahi: 4.1, leakRate: 19.8, leaks95: 23.4, leaks90: 19.8, leaks0: 3.0, leaks_large_pct: 0.0 },
    { date: "2026-04-10", hours: 7.8, ahi: 3.2, leakRate: 12.4, leaks95: 16.2, leaks90: 12.4, leaks0: 1.8, leaks_large_pct: 0.0 },
    { date: "2026-04-11", hours: 5.2, ahi: 5.8, leakRate: 28.4, leaks95: 32.8, leaks90: 28.4, leaks0: 5.2, leaks_large_pct: 2.5 },
    { date: "2026-04-12", hours: 7.5, ahi: 3.9, leakRate: 15.6, leaks95: 19.8, leaks90: 15.6, leaks0: 2.4, leaks_large_pct: 0.0 },
    { date: "2026-04-13", hours: 6.9, ahi: 4.2, leakRate: 22.1, leaks95: 26.5, leaks90: 22.1, leaks0: 4.1, leaks_large_pct: 0.8 },
    { date: "2026-04-14", hours: 7.1, ahi: 3.6, leakRate: 18.5, leaks95: 22.9, leaks90: 18.5, leaks0: 3.5, leaks_large_pct: 0.0 },
  ],
  thirtyDayTrend: Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    ahi: 3 + Math.random() * 4,
  })),
  streak: 4,
};

export const biomarkerData = {
  sleepQuality: 85,
  restfulness: "Good",
  odi: Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    value: 8 + Math.random() * 6,
  })),
  hrv: Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    value: 45 + Math.random() * 20,
  })),
  spo2: Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    value: 93 + Math.random() * 4,
  })),
  deepSleep: Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    value: 60 + Math.random() * 40,
  })),
  bp: Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    systolic: 120 + Math.random() * 20,
    diastolic: 80 + Math.random() * 10,
  })),
  status: {
    vitals: "green",
    general: "Good",
  },
};

export const interventionData = {
  physician: {
    availableTherapies: [
      "CPAP Pressure Titration",
      "BiPAP Transition",
      "Positional Therapy",
      "Clinical Mask Refit",
    ],
  },
  technician: {
    tasks: [
      {
        id: 1,
        status: "To Dispatch",
        item: "New Medium AirFit Mask",
        priority: "High",
        scheduledDate: "2026-04-16",
      },
      {
        id: 2,
        status: "In Transit",
        item: "Replacement Headgear",
        priority: "Medium",
        scheduledDate: "2026-04-15",
      },
      {
        id: 3,
        status: "Delivered",
        item: "Heated Humidifier",
        priority: "Low",
        scheduledDate: "2026-04-12",
      },
    ],
  },
  patient: {
    upcomingDelivery: {
      item: "New Medium AirFit Mask",
      status: "In Transit",
      estimatedArrival: "2026-04-16",
      steps: [
        { label: "Order Placed", completed: true },
        { label: "In Transit", completed: true },
        { label: "Out for Delivery", completed: false },
        { label: "Delivered", completed: false },
      ],
    },
  },
};

export const surveyData = {
  physician: [
    {
      id: 1,
      name: "Pittsburgh Sleep Quality Index (PSQI)",
      dateTaken: "2026-04-01",
      score: 8,
      threshold: 5,
      risk: "Elevated",
      isOverdue: false,
      daysOverdue: 0,
      history: [
        { month: 'Oct', score: 6 },
        { month: 'Nov', score: 5 },
        { month: 'Dec', score: 7 },
        { month: 'Jan', score: 8 },
        { month: 'Feb', score: 9 },
        { month: 'Mar', score: 8 },
      ]
    },
    {
      id: 2,
      name: "Epworth Sleepiness Scale (ESS)",
      dateTaken: "2026-01-15",
      score: 12,
      threshold: 10,
      risk: "Moderate",
      isOverdue: true,
      daysOverdue: 75,
      history: [
        { month: 'Oct', score: 14 },
        { month: 'Nov', score: 15 },
        { month: 'Dec', score: 13 },
        { month: 'Jan', score: 12 },
        { month: 'Feb', score: 12 },
        { month: 'Mar', score: 12 },
      ]
    },
    {
      id: 3,
      name: "Short Form 36 Health Survey (SF-36)",
      dateTaken: "2026-03-20",
      score: 45,
      threshold: 50,
      risk: "High",
      isOverdue: false,
      daysOverdue: 0,
      history: [
        { month: 'Oct', score: 60 },
        { month: 'Nov', score: 55 },
        { month: 'Dec', score: 52 },
        { month: 'Jan', score: 48 },
        { month: 'Feb', score: 46 },
        { month: 'Mar', score: 45 },
      ]
    },
  ],
  calendar: [
    [ { count: 0, surveys: [] }, { count: 1, surveys: ['ESS'] }, { count: 0, surveys: [] }, { count: 2, surveys: ['PSQI', 'ISI'] } ],
    [ { count: 1, surveys: ['FSS'] }, { count: 0, surveys: [] }, { count: 1, surveys: ['BDI'] }, { count: 0, surveys: [] } ],
    [ { count: 0, surveys: [] }, { count: 0, surveys: [] }, { count: 1, surveys: ['ESS'] }, { count: 0, surveys: [] } ],
    [ { count: 3, surveys: ['ESS', 'PSQI', 'SF-36'] }, { count: 0, surveys: [] }, { count: 1, surveys: ['ISI'] }, { count: 0, surveys: [] } ],
    [ { count: 0, surveys: [] }, { count: 1, surveys: ['FSS'] }, { count: 0, surveys: [] }, { count: 0, surveys: [] } ],
    [ { count: 1, surveys: ['ESS'] }, { count: 1, surveys: ['PSQI'] }, { count: 0, surveys: [] }, { count: 0, surveys: [] } ]
  ],
  technician: [
    {
      id: 1,
      name: "Post-Visit Hardware Log",
      type: "Operational",
      lastCompleted: "2026-03-20",
    },
    {
      id: 2,
      name: "Mask Comfort Check",
      type: "Operational",
      lastCompleted: "2026-04-05",
    },
  ],
  patient: {
    next: {
      name: "3-Month Full Medical Review",
      dueDate: "2026-05-10",
      questions: 8,
      persistence: {
        lastReminder: "2 days ago",
        status: "Reminder 1 (Day 4) Sent",
        automationActive: true,
        daysOverdue: 0
      }
    },
    history: [
      { name: "Initial Assessment", completed: "2026-03-01", score: "Complete" },
      { name: "2-Week Follow-Up", completed: "2026-03-15", score: "Complete" },
    ],
  },
  total_visits: 2,
  visits: [
    {
      date: "2026-03-23 08:33:40+00:00",
      questionnaire_id: "410",
      questionnaire_name: "Q VST PPC",
      total_questions: 21,
      completed_answers: 9,
      answers: [
        {
          question_id: "2425",
          question_text: "5 IAH résiduel (Residual AHI):",
          answer_value: "0,70",
          completion_status: "completed"
        },
        {
          question_id: "2426",
          question_text: "Fuite médiane (Median Leak):",
          answer_value: "14,20",
          completion_status: "completed"
        },
        {
          question_id: "2427",
          question_text: "Observance moyenne (Average Adherence):",
          answer_value: "6,50",
          completion_status: "completed"
        },
        {
          question_id: "2428",
          question_text: "Satisfaction Patient:",
          answer_value: "Très satisfait",
          completion_status: "completed"
        },
        {
          question_id: "2429",
          question_text: "Target Pressure (Pression cible):",
          answer_value: "10,5",
          completion_status: "completed"
        },
        {
          question_id: "2430",
          question_text: "Type de masque:",
          answer_value: "Nasal",
          completion_status: "completed"
        },
        {
          question_id: "2431",
          question_text: "Remplacez le filtre:",
          answer_value: "Oui",
          completion_status: "completed"
        },
        {
          question_id: "2432",
          question_text: "Nettoyage hebdomadaire fait:",
          answer_value: "Oui",
          completion_status: "completed"
        },
        {
          question_id: "2433",
          question_text: "Heures d'utilisation hier soir:",
          answer_value: "7,1",
          completion_status: "completed"
        },
        {
          question_id: "2434",
          question_text: "Remarques Additionnelles:",
          answer_value: null,
          completion_status: "missing"
        }
      ]
    },
    {
      date: "2026-02-15 10:12:00+00:00",
      questionnaire_id: "408",
      questionnaire_name: "Q VST PPC Init",
      total_questions: 15,
      completed_answers: 5,
      answers: [
        {
          question_id: "1201",
          question_text: "Target Pressure Setting:",
          answer_value: "10,0",
          completion_status: "completed"
        },
        {
          question_id: "1202",
          question_text: "Mask Sealed Correctly:",
          answer_value: "Oui",
          completion_status: "completed"
        },
        {
          question_id: "1203",
          question_text: "Patient Acclimation Rating:",
          answer_value: "Bien",
          completion_status: "completed"
        },
        {
          question_id: "1204",
          question_text: "Machine Serial Check:",
          answer_value: "Vérifié",
          completion_status: "completed"
        },
        {
          question_id: "1205",
          question_text: "Humidificateur installé:",
          answer_value: "Oui",
          completion_status: "completed"
        }
      ]
    }
  ]
};

export const aiData = {
  physician: {
    riskLevel: "Yellow",
    riskScore: 72,
    keyFindings: [
      "AHI trending upward over past 2 weeks (+15% increase)",
      "Mask leak events increased by 23% this week",
      "Patient compliance remains strong (>6 hrs/night)",
      "SpO2 desaturation events correlate with increased residual AHI variance",
    ],
  },
  technician: {
    dropoutProbability: 15,
    riskFactors: [
      "Patient is removing mask at 3 AM consistently",
      "Leak rate spiked on 4/11 - possible mask fit issue",
      "Usage hours declined by 1.2 hrs/night this week",
    ],
    recommendation: "Schedule mask refit appointment",
  },
  patient: {
    weeklyMessage: "Great job this week! You used your therapy 15% more than last week.",
    improvements: [
      "Sleep quality improved by 8 points",
      "4-day streak achieved!",
      "Average usage increased to 6.8 hours",
    ],
    tip: "Try wearing your mask for 30 minutes before bed to get comfortable",
  },
};

export const videoData = {
  physician: [
    {
      id: 1,
      title: "Understanding AHI Trends",
      duration: "8:24",
      category: "Clinical Education",
      thumbnail: "clinical",
    },
    {
      id: 2,
      title: "Interpreting Leak Data",
      duration: "6:15",
      category: "Clinical Education",
      thumbnail: "clinical",
    },
    {
      id: 3,
      title: "CPAP Pressure Acclimation",
      duration: "12:40",
      category: "Treatment Options",
      thumbnail: "clinical",
    },
  ],
  technician: [
    {
      id: 1,
      title: "Mask Fitting Best Practices",
      duration: "10:22",
      category: "Technical Support",
      thumbnail: "technical",
    },
    {
      id: 2,
      title: "Troubleshooting Leak Issues",
      duration: "7:18",
      category: "Technical Support",
      thumbnail: "technical",
    },
    {
      id: 3,
      title: "CPAP Pressure Adjustment Guide",
      duration: "9:45",
      category: "Technical Support",
      thumbnail: "technical",
    },
  ],
  patient: [
    {
      id: 1,
      title: "How to Tighten Your Mask for a Better Seal",
      duration: "3:24",
      category: "Mask & Equipment",
      triggerReason: "Mask Leak Detected",
      relevance: "high",
      watched: false,
      rating: null,
    },
    {
      id: 2,
      title: "Building a Consistent Bedtime Routine",
      duration: "5:12",
      category: "Tips & Tricks",
      triggerReason: "Improve Adherence",
      relevance: "high",
      watched: false,
      rating: null,
    },
    {
      id: 3,
      title: "Cleaning Your Mask & Tubing Weekly",
      duration: "4:08",
      category: "Maintenance",
      triggerReason: "Routine Care",
      relevance: "medium",
      watched: true,
      rating: 5,
    },
    {
      id: 4,
      title: "Understanding Your AHI Score",
      duration: "6:45",
      category: "Understanding Your Data",
      triggerReason: "Educational",
      relevance: "medium",
      watched: true,
      rating: 4,
    },
    {
      id: 5,
      title: "What to Do If You Wake Up at Night",
      duration: "4:30",
      category: "Tips & Tricks",
      triggerReason: "Improve Adherence",
      relevance: "medium",
      watched: false,
      rating: null,
    },
    {
      id: 6,
      title: "Travelling with Your CPAP Machine",
      duration: "7:15",
      category: "Lifestyle",
      triggerReason: "Educational",
      relevance: "low",
      watched: false,
      rating: null,
    },
  ],
};

// AI Weekly State — Physician Reference Tab
export const aiWeeklyState = {
  weekOf: "2026-04-14",
  compositeRiskScore: 8.2,
  previousRiskScore: 6.7,
  riskTier: "Critical",
  phaseLabel: "Optimization",
  confidenceLevel: 84,
  daysToPredictedDropout: 12,

  clusterAssignment: {
    current: "Attempting",
    previous: "Adherent",
    changedThisWeek: true,
    description: "Patient has been reclassified from Adherent to Attempting due to sustained usage decline and increasing residual AHI variance.",
  },

  sevenDayRolling: [
    { day: "Mon Apr 14", usageHours: 6.1, leakRate: 14.2, ahi: 4.1 },
    { day: "Tue Apr 15", usageHours: 5.4, leakRate: 19.8, ahi: 5.3 },
    { day: "Wed Apr 16", usageHours: 3.8, leakRate: 28.4, ahi: 7.8 },
    { day: "Thu Apr 17", usageHours: 2.1, leakRate: 34.1, ahi: 10.2 },
    { day: "Fri Apr 18", usageHours: 1.9, leakRate: 36.7, ahi: 11.4 },
    { day: "Sat Apr 19", usageHours: 2.4, leakRate: 31.2, ahi: 9.8 },
    { day: "Sun Apr 20", usageHours: 1.2, leakRate: 38.0, ahi: 12.4 },
  ],

  riskFactorBreakdown: [
    { factor: "Usage Decay", contribution: 32, direction: "worsening" },
    { factor: "Mask Leak Instability", contribution: 28, direction: "worsening" },
    { factor: "Residual AHI Burden", contribution: 22, direction: "worsening" },
    { factor: "ESS Score (12/24)", contribution: 10, direction: "stable" },
    { factor: "PSQI Score (8/21)", contribution: 8, direction: "stable" },
  ],

  activeFlags: [
    { label: "Leak Instability", severity: "high" },
    { label: "Usage Decay", severity: "high" },
    { label: "Residual AHI Burden", severity: "medium" },
  ],

  nextBestAction: {
    type: "Physician Escalation",
    deliveryMode: "Exception-Based Inbox",
    rationale: "Three consecutive failed technician interventions with no improvement. Composite risk score has crossed the clinical threshold (≥8). AI has escalated to physician for clinical pathway review.",
    reassessmentWindow: "7 days post-intervention",
  },
};

export const inventoryItems = [
  { id: 1, item: "AirFit F20 Mask (Medium)", category: "Masks", stock: 12, minStock: 5, status: "In Stock" },
  { id: 2, item: "AirFit P10 Nasal Pillows (Small)", category: "Masks", stock: 2, minStock: 5, status: "Low Stock" },
  { id: 3, item: "Heated Tubing (ClimateLineAir)", category: "Tubing", stock: 0, minStock: 3, status: "Out of Stock" },
  { id: 4, item: "Hypoallergenic Filters (6-pack)", category: "Filters", stock: 25, minStock: 10, status: "In Stock" },
  { id: 5, item: "HumidAir Water Chamber", category: "Water Chambers", stock: 8, minStock: 4, status: "In Stock" },
  { id: 6, item: "Mask Liners (Cotton)", category: "Accessories", stock: 4, minStock: 10, status: "Low Stock" },
];

export const deviceData = [
  { id: "HEXO-092", name: "Hexoskin Smart Shirt", type: "Wearable", status: "Online", battery: "82%", lastSync: "12 mins ago", assigned: "Jan 12, 2025" },
  { id: "MAS-441", name: "Masimo MightySat Rx", type: "Oximeter", status: "Online", battery: "95%", lastSync: "1 min ago", assigned: "Feb 05, 2025" },
  { id: "SA-882", name: "Somno-Art Band", type: "Sleep Tracker", status: "Offline", battery: "12%", lastSync: "4 hours ago", assigned: "Jan 20, 2025" },
  { id: "WIT-991", name: "Withings BPM Core", type: "Blood Pressure", status: "Disconnected", battery: "N/A", lastSync: "2 days ago", assigned: "Mar 10, 2025" },
];