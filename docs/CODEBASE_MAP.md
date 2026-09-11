# SleepCare Dashboard — Codebase Map & Technical Reference

> **Comprehensive Map & Developer "Where Do I Change This?" Guide**  
> **Source of Truth:** Workspace implementation at [`c:/Users/mahmed/Downloads/SleepCare-Dashboard`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard)

---

## 1. Directory Tree & Responsibilities

```text
SleepCare-Dashboard/
├── .github/
│   └── workflows/ci.yml         # GitHub Actions automated build pipeline
├── .env                         # Active local environment variables (VITE_API_URL, etc.)
├── .env.example                 # Template for required environment variables
├── .gitignore                   # Git exclusion rules (ignores build outputs, local envs, internal archives)
├── ecosystem.config.cjs         # PM2 configuration for on-premise Windows/Linux production serving
├── index.html                   # HTML entry point mounting <div id="root">
├── package.json                 # Project dependencies, scripts, and engine specifications
├── render.yaml                  # Render Infrastructure-as-Code blueprint with proxy rewrites
├── tsconfig.json                # TypeScript compiler configuration with @/* path aliases
├── vite.config.ts               # Vite 6 configuration (Tailwind v4, Rollup chunks, dev proxy)
│
├── docs/                        # Complete technical documentation suite
│   ├── HANDOVER_REPORT.md       # Intern Technical Handover Report & Continuity Guide
│   ├── ARCHITECTURE.md          # Detailed React architecture & design patterns
│   ├── ROUTES.md                # 39-route catalog (34 destinations, 5 redirects) & page specs
│   ├── COMPONENTS.md            # Component architecture, relationships, and UI primitives
│   ├── API.md                   # Full endpoint catalog and telemetry specifications
│   ├── STATE.md                 # State management, caching (useApi), and polling loops
│   ├── DEVELOPMENT.md           # Developer workflow, setup, and contribution guides
│   ├── DEPLOYMENT.md            # Production build and deployment options (PM2, Render)
│   └── CODEBASE_MAP.md          # File responsibilities, cheat sheet, and technical debt
│
└── src/
    ├── main.tsx                 # React DOM client entry point
    ├── vite-env.d.ts            # Vite client type declarations
    │
    ├── assets/                  # Static assets (LindeLogo.png)
    │
    ├── styles/                  # Styling architecture
    │   ├── fonts.css            # Custom typography & web font imports
    │   ├── index.css            # Global CSS entry aggregating fonts, tailwind, and theme
    │   ├── tailwind.css         # Tailwind CSS v4 directives (@import 'tailwindcss')
    │   └── theme.css            # Medical color palette tokens & dark mode definitions
    │
    └── app/
        ├── App.tsx              # Application root rendering RouterProvider & Sonner Toaster
        ├── routes.tsx           # React Router v7 configuration (all 39 route definitions)
        │
        ├── components/          # High-level domain and modal components
        │   ├── AILifecyclePanel.tsx     # MLOps model drift & retraining interface
        │   ├── AuthorizationModal.tsx   # Prescription authorization modal with digital seal
        │   ├── ClinicalOrderModal.tsx   # Doctor's order logging modal
        │   ├── CoachingVideoModal.tsx   # HTML5 video player with WebVTT subtitles & telemetry
        │   ├── RecommendationBanner.tsx # Human-in-the-loop AI recommendation acceptance gate
        │   ├── SummaryContent.tsx       # Polymorphic clinical cockpit used by MD & Tech
        │   ├── VisitPrepCard.tsx        # Pre-consultation hardware and symptoms card
        │   ├── figma/                   # ImageWithFallback helper component
        │   └── ui/                      # 40+ Shadcn/Radix UI primitives & ConnectivityStatus.tsx
        │
        ├── data/                # Data and communication layer
        │   ├── api.ts                   # Core API client, fallback engine, and TypeScript models
        │   └── mockData.ts              # Local mock database for offline fallback
        │
        ├── hooks/               # Custom React hooks
        │   ├── useApi.ts                # Reactive in-memory cached data fetcher
        │   └── useVideoTelemetry.ts     # Captures and logs t8, t9, t10 interaction timestamps
        │
        ├── layouts/             # Multi-tier portal layouts
        │   ├── PatientLayout.tsx        # Mobile-first shell for CPAP patients
        │   ├── PhysicianLayout.tsx      # Sidebar workstation shell for physicians
        │   ├── PhysicianPatientLayout.tsx# Patient header with clinical metrics & sub-tabs
        │   ├── TechnicianLayout.tsx     # Operations workbench shell for technicians
        │   └── TechnicianPatientLayout.tsx# Logistics header with hardware metrics & sub-tabs
        │
        ├── pages/               # Route-level page components
        │   ├── RoleSelector.tsx         # Root portal selector (/)
        │   ├── auth/                    # Login and signup pages (Patient, MD, Tech)
        │   ├── patient/                 # Patient views (Home, CPAP, Surveys, Videos, Help)
        │   │   └── components/          # 9 modular dashboard cards for Patient Home
        │   ├── physician/               # Physician views (Home, Summary, CPAP, Help)
        │   ├── technician/              # Technician views (Home, Inventory, Devices, Help)
        │   └── shared/                  # 7 Polymorphic shared modules (Biomarkers, CPAP, etc.)
        │
        ├── services/            # Specialized API clients
        │   └── telemetryApi.ts          # Distributed tracing re-export service
        │
        └── types/               # Domain TypeScript definitions
            └── telemetry.ts             # Schemas for distributed tracing and latency KPIs
```

---

## 2. Developer "Where Do I Change This?" Guide

| I want to... | Where should I look? | Files to Edit / Inspect |
|---|---|---|
| **Add a new page / view** | Create component in `src/app/pages/` | Add file, then register in [`src/app/routes.tsx`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/routes.tsx) |
| **Add a new navigation tab** | Target Layout file | [`PhysicianPatientLayout.tsx`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/PhysicianPatientLayout.tsx), [`TechnicianPatientLayout.tsx`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/TechnicianPatientLayout.tsx), or [`PatientLayout.tsx`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/PatientLayout.tsx) |
| **Add an API endpoint** | Core API client | [`src/app/data/api.ts`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/data/api.ts) |
| **Adjust backend URL / ports** | Local environment config | [`.env`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/.env) (`VITE_API_URL`, `VITE_VIDEO_URL`) |
| **Change Dev Proxy targets** | Vite build config | [`vite.config.ts`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/vite.config.ts#L54-L65) (`server.proxy`) |
| **Change Render Cloud rewrites** | IaC Blueprint | [`render.yaml`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/render.yaml#L15-L29) |
| **Change PM2 production settings**| Server config | [`ecosystem.config.cjs`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/ecosystem.config.cjs) |
| **Modify Theme colors or tokens**| Stylesheet | [`src/styles/theme.css`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/styles/theme.css) |
| **Change Recharts chart colors** | Target component file | Update local `CHART_COLORS` object in [`UniversalBiomarkers.tsx`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/shared/UniversalBiomarkers.tsx#L28-L42) or [`UniversalCPAP.tsx`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/shared/UniversalCPAP.tsx#L16-L21) |
| **Tweak Clinical Summary Cockpit**| Polymorphic summary component | [`src/app/components/SummaryContent.tsx`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/components/SummaryContent.tsx) |
| **Update AI recommendation logic**| Recommendation component | [`src/app/components/RecommendationBanner.tsx`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/components/RecommendationBanner.tsx) |
| **Modify Video Telemetry timers** | Video hook & modal | [`src/app/hooks/useVideoTelemetry.ts`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/hooks/useVideoTelemetry.ts) & [`CoachingVideoModal.tsx`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/components/CoachingVideoModal.tsx) |
| **Update Patient Survey questions**| Patient survey page | [`src/app/pages/patient/Surveys.tsx`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/patient/Surveys.tsx#L7-L56) |
| **Change Auth / Login flow** | Auth page components | [`PatientLogin.tsx`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/auth/PatientLogin.tsx), [`PhysicianLogin.tsx`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/auth/PhysicianLogin.tsx), [`TechnicianLogin.tsx`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/auth/TechnicianLogin.tsx) |

---

## 3. Technical Debt & Operational Risks

### Confirmed Codebase Inconsistencies

1. **Recharts Color Decoupling**: Recharts SVG elements cannot inherit CSS custom properties (`var(--teal)`). Hexadecimal color constants (`CHART_COLORS`) are manually duplicated across `UniversalBiomarkers.tsx`, `UniversalCPAP.tsx`, `UniversalAIAnalysis.tsx`, and `UniversalReporting.tsx`. Changing theme tokens requires updating both `theme.css` and these component files.
2. **Mock Fallback vs Strict Backend Mode**: The codebase contains both real API calls and offline mock fallbacks in [`src/app/data/api.ts`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/data/api.ts#L465-L555). When `VITE_DISABLE_MOCKS=false`, network failures fallback silently to mock data, which can mask backend 500 errors during testing. Set `VITE_DISABLE_MOCKS=true` in `.env` for strict verification.
3. **Absence of Automated Test Suite**: There is currently no configured unit or integration test framework (such as Vitest or Jest) in `package.json`. Validations rely on TypeScript compilation via `npm run build` and GitHub Actions CI.
4. **Fast 3-Second Patient Polling Interval**: [`src/app/pages/patient/Home.tsx:L64-L72`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/patient/Home.tsx#L64-L72) executes four simultaneous API requests every 3 seconds to detect incoming video coaching events. In large-scale production, this should be replaced with Server-Sent Events (SSE) or WebSockets to avoid unnecessary backend load.

### Potential Architecture Opportunities
- **WebSocket / Server-Sent Events (SSE)**: Replacing the 3-second polling in `PatientHome` and 30-second polling in `ConnectivityStatus` with an SSE channel would significantly decrease database transaction load on VM2.
- **Centralized Recharts Theme Token Provider**: Creating a shared `themeConstants.ts` utility file to export chart colors would eliminate color duplication across charting components.
