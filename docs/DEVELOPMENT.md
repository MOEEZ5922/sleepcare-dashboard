# SleepCare Dashboard — Developer Workflow & Setup Guide

> **Project Root:** [`c:/Users/mahmed/Downloads/SleepCare-Dashboard`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard)  
> **Package Manager:** `npm` (Lockfile: `package-lock.json`)  
> **Node Engine:** Node.js 20+ Recommended

---

## 1. Local Environment Setup

### Prerequisites
- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher

### Step-by-Step Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_ORGANIZATION/sleepcare-dashboard.git
   cd sleepcare-dashboard
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the provided `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
   Configure your target backend endpoints:
   ```ini
   # URL of the Backend API Server (FastAPI VM / Cloud instance)
   VITE_API_URL=http://<BACKEND_VM_IP>

   # URL of the Dedicated Video Storage Server
   VITE_VIDEO_URL=http://<MEDIA_VM_IP>:8080

   # Set to 'true' to disable mock fallback and throw on API errors
   VITE_DISABLE_MOCKS=false
   ```

4. **Start the local Vite development server**:
   ```bash
   npm run dev
   ```
   The application will start with hot module reloading (HMR) at `http://localhost:5173`.

---

## 2. Available `npm` Scripts

Defined in [`package.json`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/package.json#L6-L9):

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `vite` | Starts local development server with Vite HMR |
| `npm run build` | `vite build` | Compiles TypeScript and packages production bundles into `dist/` |

> [!NOTE]
> There are no automated unit/integration test scripts (e.g. `npm test` or `vitest`) configured in `package.json`. Testing is performed manually or via external API test suites.

---

## 3. Local Proxying & CORS Bypass

[`vite.config.ts`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/vite.config.ts#L54-L65) defines automated development reverse-proxies to prevent CORS errors when communicating directly with the backend server:

```typescript
server: {
  proxy: {
    '/api': {
      target: process.env.VITE_API_URL || 'http://localhost:8000',
      changeOrigin: true,
    },
    '/health': {
      target: process.env.VITE_API_URL || 'http://localhost:8000',
      changeOrigin: true,
    }
  }
}
```

When `VITE_API_URL` is omitted in `.env`, fetch calls to `/api/...` and `/health` route through the Vite dev server proxy to the VM.

---

## 4. Developer "How Do I Add..." Guides

### A. How to Add a New Page & Route

1. Create your page component in the appropriate directory:
   - Shared module: [`src/app/pages/shared/MyNewFeature.tsx`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/shared/)
   - Physician page: [`src/app/pages/physician/`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/physician/)
   - Technician page: [`src/app/pages/technician/`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/technician/)
   - Patient page: [`src/app/pages/patient/`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/pages/patient/)
2. Open [`src/app/routes.tsx`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/routes.tsx) and import your component.
3. Add the route under the desired layout subtree:
   ```typescript
   // Example: Adding to the physician patient detail layout
   {
     path: "patient/:id",
     Component: PhysicianPatientLayout,
     children: [
       // ... existing child routes
       { path: "new-feature", Component: MyNewFeature },
     ],
   }
   ```
4. If this route should appear in the navigation bar, update the navigation array in the corresponding layout:
   - For Physician: `tabs` in [`src/app/layouts/PhysicianPatientLayout.tsx`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/PhysicianPatientLayout.tsx#L22-L30)
   - For Technician: `tabs` in [`src/app/layouts/TechnicianPatientLayout.tsx`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/TechnicianPatientLayout.tsx#L16-L24)
   - For Patient: `navigation` in [`src/app/layouts/PatientLayout.tsx`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/layouts/PatientLayout.tsx#L27-L35)

---

### B. How to Add a New API Call

1. Open [`src/app/data/api.ts`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/data/api.ts).
2. Define the TypeScript interfaces for the request and response:
   ```typescript
   export interface TherapySettingsPayload {
     pressure_min: number;
     pressure_max: number;
     ramp_time_minutes: number;
   }
   ```
3. Add the export function using `apiFetchRaw<T>`:
   ```typescript
   export async function updateTherapySettings(
     patientId: string, 
     data: TherapySettingsPayload
   ): Promise<{ status: string }> {
     return apiFetchRaw<{ status: string }>(
       `/api/cpap/${formatPatientId(patientId)}/settings`, 
       {
         method: 'POST',
         body: JSON.stringify(data),
       }
     );
   }
   ```
4. Consume the API in your component with `useApi`:
   ```typescript
   import { useApi } from '../../hooks/useApi';
   import { fetchTherapySettings } from '../../data/api';

   const { data, isLoading, refetch } = useApi(
     () => fetchTherapySettings(patientId),
     {
       dependencies: [patientId],
       cacheKey: `therapy-settings-${patientId}`,
     }
   );
   ```

---

### C. How to Adjust Colors & Design Tokens

Theme colors are defined in [`src/styles/theme.css`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/styles/theme.css):

```css
:root {
  --navy: #0A1128;
  --teal: #2D9596;
  --amber: #F4A261;
  --sage: #6A994E;
  --coral: #E76F51;
  --blue-gray: #414D5B;
  --slate-muted: #5A6B7C;
  --light-blue: #E8EEF2;
}
```

> [!IMPORTANT]
> **Recharts Color Rule**: Recharts SVG elements cannot parse Tailwind classes or CSS variables directly. When modifying charts, update the `CHART_COLORS` constant in that component (e.g. in `UniversalBiomarkers.tsx` or `UniversalCPAP.tsx`) to match your updated hexadecimal color values.

---

## 5. Frontend Coding Conventions

1. **PascalCase for Components**: Name all React component files in PascalCase (e.g. `UniversalBiomarkers.tsx`, `SummaryContent.tsx`).
2. **Path Alias `@/`**: Use the `@` path alias configured in [`vite.config.ts`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/vite.config.ts#L36) to refer to `src/`.
3. **Icons**: Use `lucide-react` for UI iconography. Import individual icons directly: `import { Activity, AlertTriangle } from 'lucide-react';`.
4. **Notifications**: Dispatch notifications using `toast` from `sonner`: `toast.success('...')` or `toast.error('...')`.
5. **No `any` when possible**: Rely on types declared in [`src/app/data/api.ts`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/data/api.ts) and [`src/app/types/telemetry.ts`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/src/app/types/telemetry.ts).
