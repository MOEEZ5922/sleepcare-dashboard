# SleepCare Dashboard — Build & Production Deployment Guide

> **Build Engine:** Vite 6 + Rollup + `@tailwindcss/vite`  
> **Target Output:** Static Single Page Application (`dist/`)  
> **Deployment Blueprints:**  
> - On-Premise / Windows Server VM: [`ecosystem.config.cjs`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/ecosystem.config.cjs) (PM2 + `serve`)  
> - Cloud Infrastructure as Code: [`render.yaml`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/render.yaml) (Render Static Site Blueprint)  
> - Automated CI: [`.github/workflows/ci.yml`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/.github/workflows/ci.yml)

---

## 1. Production Build Process

To compile the React application into optimized static assets:

```bash
npm run build
```

This invokes `vite build`, which:
1. Validates TypeScript types using `tsconfig.json`.
2. Compiles JSX/TSX assets with `@vitejs/plugin-react`.
3. Processes styles with Tailwind CSS v4.
4. Generates bundled HTML, JS, CSS, and image files into [`dist/`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/dist).

### Chunk Splitting Strategy

Configured in [`vite.config.ts`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/vite.config.ts#L44-L52):

```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'lucide': ['lucide-react'],
        'recharts': ['recharts'],
        'vendor': ['react', 'react-dom', 'react-router'],
      }
    }
  },
  chunkSizeWarningLimit: 1000,
}
```

This isolates heavy third-party vendor code from application logic, allowing browsers to aggressively cache vendor libraries across deployments.

---

## 2. Deployment Option A: On-Premise Windows / Linux VM (PM2 + Serve)

For on-premise hospital or research deployments (e.g. Linde VM environment), the project provides [`ecosystem.config.cjs`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/ecosystem.config.cjs):

```javascript
module.exports = {
  apps: [
    {
      name: "sleepcare-frontend",
      script: "./node_modules/serve/build/main.js",
      args: "-s dist -l 80",
      cwd: "C:\\sleepcare-dashboard",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
```

### Steps to Deploy with PM2:

1. Copy the repository to the production server (e.g. `C:\sleepcare-dashboard`).
2. Populate `.env` with production backend IP addresses.
3. Install dependencies and compile:
   ```bash
   npm install
   npm run build
   ```
4. Start or restart the PM2 process:
   ```bash
   pm2 start ecosystem.config.cjs
   pm2 save
   ```
5. The application will be served on port `80` with SPA routing fallback `-s` enabled.

---

## 3. Deployment Option B: Cloud Hosting on Render (`render.yaml`)

[`render.yaml`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/render.yaml) specifies a fully automated static site deployment blueprint:

```yaml
services:
  - type: web
    name: sleepcare-dashboard
    runtime: static
    buildCommand: npm run build
    staticPublishPath: dist
    headers:
      - path: /*
        name: Cache-Control
        value: public, max-age=31536000, immutable
    routes:
      # 1. Forward API requests to live Render backend (Bypasses CORS)
      - type: rewrite
        source: /api/*
        destination: https://cpap-backend-v2.onrender.com/api/*

      # 2. Forward Health checks to backend
      - type: rewrite
        source: /health
        destination: https://cpap-backend-v2.onrender.com/health

      # 3. SPA Routing Fallback: Redirect all page routes to index.html
      - type: rewrite
        source: /*
        destination: /index.html
```

### Key Capabilities of the Render Blueprint:
- **Zero CORS in Production**: Rewrites `/api/*` and `/health` requests at the reverse proxy level to point to the live FastAPI backend, eliminating browser CORS preflight friction.
- **SPA Routing Fallback**: The catch-all rewrite rule `/* -> /index.html` guarantees that deep links (such as `/physician/patient/PAT0001/trends`) load without returning 404 errors on browser page reloads.
- **Immutable Asset Caching**: Static hashed assets are cached for one year.

---

## 4. Continuous Integration Pipeline (GitHub Actions)

Configured in [`.github/workflows/ci.yml`](file:///c:/Users/mahmed/Downloads/SleepCare-Dashboard/.github/workflows/ci.yml):

```yaml
name: CI — SleepCare Frontend

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Build project
        run: npm run build
```

Every push or pull request targeting the `main` branch automatically validates that the build succeeds without TypeScript compilation errors.
