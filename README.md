# SleepCare Digital Health Platform — Telemonitoring Dashboard

![Status](https://img.shields.io/badge/Status-Production--Ready-success)
![CI](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue)
![Framework](https://img.shields.io/badge/Framework-React%2018%2F19%20%2B%20Vite%206-61DAFB)
![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6)

The **SleepCare Dashboard** is an enterprise clinical management and telemonitoring single page application (SPA) designed to solve the critical adherence challenge in **Continuous Positive Airway Pressure (CPAP)** therapy for **Obstructive Sleep Apnea (OSA)** patients.

Developed within the European **6G-PATH Consortium** in partnership between **Linde Homecare France** and the **DISP Laboratory (Université Lumière Lyon 2 / Université Toulouse Capitole)**, the platform interconnects patients, physicians, and technicians through proactive exception triage, multi-sensor physiological monitoring, and automated just-in-time video coaching.

---

## 🚀 Key Platform Features

- **Physician Clinical Cockpit**:
  - Exception-based inbox prioritizing patients with AHI spikes ($\ge 15$), critical mask leaks ($\ge 24\text{ L/min}$), and high dropout risks ($\ge 70\%$).
  - Decision support interface with Human-in-the-Loop acceptance gates, clinical order logging, and prescription transition seals (App IAH, MAD, HNS).
- **Technician Operations Hub**:
  - Real-time hardware triage events feed with immediate alert validation or dismissal.
  - Equipment inventory tracker (Masks, CPAP machines, Accessories, Sensors) with stock reordering.
  - Sensor pairing workbench for Withings ScanWatches, Masimo Pulse Oximeters, and SomnoArt EEG devices.
- **Patient Therapy Companion**:
  - Mobile-first web app featuring daily sleep streak rings, 7-day usage summaries, and self-reporting tools.
  - Intelligent pop-up player for just-in-time video coaching guides triggered by telemetry alerts.
  - Comprehensive psychometric surveys (ESS, PSQI, ISI, FSS, SF-36).
- **Universal Polymorphic Architecture**:
  - 7 reusable shared modules that dynamically adapt their UI controls, data queries, and actions based on user role.
- **Distributed Telemetry & Latency Tracking**:
  - Captures end-to-end interaction timestamps ($t_0$ to $t_{10}$) syncing edge sensors, cloud virtual machines, and the browser client.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Core Framework** | [React 18/19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/) |
| **Build & Bundler** | [Vite 6](https://vitejs.dev/) with Rollup chunk splitting (`vendor`, `lucide`, `recharts`) |
| **Routing** | [React Router v7](https://reactrouter.com/) (Data router via `createBrowserRouter`) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`), Custom CSS Custom Properties (`theme.css`) |
| **UI Components** | [Radix UI](https://www.radix-ui.com/) primitives, [Lucide React](https://lucide.dev/), [Sonner](https://sonner.emilkowal.ski/) |
| **Data Visualization**| [Recharts 2](https://recharts.org/) |
| **Media Player** | Native HTML5 Video Engine with multi-language WebVTT subtitles (`.en.vtt`, `.fr.vtt`) |
| **Process Manager** | [PM2](https://pm2.keymetrics.io/) & [`serve`](https://github.com/vercel/serve) for production hosting |
| **CI / CD** | GitHub Actions (`.github/workflows/ci.yml`) |

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/YOUR_ORGANIZATION/sleepcare-dashboard.git
cd sleepcare-dashboard

# Install dependencies
npm install
```

### 3. Configure Environment Variables
Copy the template and adjust endpoints:
```bash
cp .env.example .env
```
Example `.env`:
```ini
# Backend API Base URL (FastAPI VM / Cloud Instance)
VITE_API_URL=http://<BACKEND_VM_IP>

# Dedicated Media Storage Server URL
VITE_VIDEO_URL=http://<MEDIA_VM_IP>:8080

# Disable mock fallbacks and enforce strict live API validation
VITE_DISABLE_MOCKS=false
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Production Build & Deployment

### Build the Static Bundle
```bash
npm run build
```
Compiles TypeScript, processes Tailwind CSS v4, and generates optimized assets in [`dist/`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/dist).

### Serving with PM2 (On-Premise VM)
```bash
pm2 start ecosystem.config.cjs
pm2 save
```
Launches `serve -s dist -l 80` to host the production build on port 80 with SPA fallback routing enabled.

### Cloud Deployment with Render
The repository includes a ready-to-use [`render.yaml`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/render.yaml) Infrastructure-as-Code blueprint. It configures:
1. Static site deployment from `dist/`.
2. Reverse-proxy rewrites for `/api/*` and `/health` to eliminate CORS errors in production.
3. Catch-all rewrite `/* -> /index.html` for single-page application routing.

---

## 📚 Complete Technical Documentation

Comprehensive, developer-focused documentation is available in the [`docs/`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/docs) directory:

| Document | Description |
|---|---|
| 📋 [**Intern Handover Report**](docs/HANDOVER_REPORT.md) | Technical handover report, engineering methods, required skills, tools, and continuity playbooks. |
| 🏛️ [**Architecture Overview**](docs/ARCHITECTURE.md) | In-depth application design, layout hierarchies, bootstrap flow, and telemetry loops. |
| 🗺️ [**Routes & Pages Catalog**](docs/ROUTES.md) | Complete 39-route inventory (34 destinations, 5 redirects), access permissions, and page lifecycles. |
| 🧩 [**Component Architecture**](docs/COMPONENTS.md) | Detailed specifications for key domain components (`SummaryContent`, `CoachingVideoModal`, etc.) and UI primitives. |
| 🔌 [**API & Backend Services**](docs/API.md) | Complete endpoint catalog, request/response models, JWT handling, and fallback behavior. |
| 💾 [**State Management & Caching**](docs/STATE.md) | In-memory reactive cache (`useApi`), localStorage schema, polling intervals, and data flow. |
| 🛠️ [**Developer Setup & Workflows**](docs/DEVELOPMENT.md) | Step-by-step guides for adding new routes, API endpoints, components, and adjusting theme tokens. |
| 🚀 [**Build & Production Deployment**](docs/DEPLOYMENT.md) | Production build options, Rollup chunk splitting, PM2 setup, and Render IaC configuration. |
| 🧭 [**Codebase Map & Reference**](docs/CODEBASE_MAP.md) | File responsibility breakdown, "Where Do I Change This?" cheat sheet, and technical debt analysis. |

---

## 🤝 Clinical & Research Partners

- **Consortium**: European 6G-PATH Project (Horizon Europe)
- **Clinical Partner**: Linde Homecare France
- **Academic Research**: DISP Laboratory (Université Lumière Lyon 2 / Université Toulouse Capitole)