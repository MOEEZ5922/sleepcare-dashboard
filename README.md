# SleepCare Digital Health Platform — Dashboard

![Status](https://img.shields.io/badge/Status-Production--Ready-success)
![CI](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue)
![Framework](https://img.shields.io/badge/Framework-React%20%2B%20Vite-61DAFB)

## 📋 Overview
The SleepCare Dashboard is a comprehensive clinical management interface designed for monitoring patient therapy data, managing interventions, and streamlining workflows for both physicians and technicians. It provides a centralized hub for real-time biomarker tracking and role-based clinical logistics.

## 🚀 Features
- **Physician Portal**: In-depth clinical analysis, patient history, and intervention management.
- **Technician Workbench**: Triage workflows, hardware monitoring, and task prioritization.
- **Role-Based UI**: Dynamic interface adjustments based on user permissions.
- **Metric Mapping**: Seamless integration with the "Universal Truth" API contract for unified clinical metrics.
- **Responsive Design**: Optimized for desktop clinical workstations and mobile reviews.

## 🛠️ Technology Stack
- **Frontend**: React 18 (TypeScript)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS & Modern CSS
- **Components**: Shadcn/UI & Radix UI
- **CI/CD**: GitHub Actions (Automated Builds & Quality Checks)

## 🔧 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/sleepcare-dashboard.git
   cd sleepcare-dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## 📈 CI/CD Pipeline
This repository includes a robust GitHub Actions pipeline (`.github/workflows/ci.yml`) that automatically:
- Validates every push and pull request.
- Installs dependencies and runs the build process to ensure stability.
- Checks for TypeScript errors and linting issues.

---

## 📄 Documentation
- [Frontend Functional Design](FRONT_END_FUNCTIONAL_DESIGN_DOC.md)
- [API Contracts](COMPLETE_SYSTEM_API_CONTRACTS.md)
- [Architecture Overview](Frontend%20Architecture_%20Role-Based%20UI%20&%20Metric%20Mapping.md)

---

Developed as part of the **SleepCare Internship Program**.