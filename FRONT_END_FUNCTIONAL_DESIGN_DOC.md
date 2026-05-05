# Front-End Functional Design Document: SleepCare Platform

**Author:** Moeez Ahmed (Intern)  
**Date:** April 29, 2026  
**Target:** SIME 2026 Conference Submission & Internal Supervisor Review  
**Status:** Phase 1 Complete (Technical Foundation & Design Finalization)

---

## 1. Research Framework

### 1.1 Research Mind Map
![SleepCare Mind Map](file:///C:/Users/mahmed/.gemini/antigravity/brain/d126ecb9-f5f3-466d-85ba-d096eb244f6d/sleepcare_mind_map_1777469263236.png)

### 1.2 Formal Research Question (RQ)
> *“To what extent does a multimodal integration architecture—unifying device trends, physiological biomarkers (SpO₂, HRV, ODI), patient-reported surveys, and educational video coaching—improve the precision of AI-driven risk stratification and therapy adherence in CPAP patients?”*

### 1.3 Scientific Objectives
1.  **Multimodal Fusion:** Establish a "Universal Truth" API to synchronize heterogeneous data streams (Hardware, Wearables, and Surveys).
2.  **Biomarker Validation:** Quantify the predictive power of multi-sensor physiological data (Hexoskin, Masimo, Somno-Art) in identification of therapy dropout risks.
3.  **Dynamic Stratification:** Implement an AI clustering model to categorize patients into clinical states (*Adherent, Attempting, Struggling, Dropout*).
4.  **Clinical Interoperability:** Ensure information parity across three distinct portals (Physician, Technician, Patient) to eliminate clinical asymmetry.

---

## 2. System Architecture: The "Universal Truth"

The SleepCare platform is built on a **3-Portal Architecture** connected by a centralized API layer. This ensures that every stakeholder sees the same data, but with a cockpit tailored to their specific role.

![System Architecture](file:///C:/Users/mahmed/.gemini/antigravity/brain/d126ecb9-f5f3-466d-85ba-d096eb244f6d/sleepcare_architecture_diagram_1777469281660.png)

### 2.1 The Physician Portal (The Decision Engine)
*   **Focus:** Exception-based management and high-level clinical oversight.
*   **Key Feature:** "Exception Inbox" prioritizing patients by composite risk score.
*   **Evidence Basis:** Full access to high-fidelity biomarkers and longitudinal trends.

### 2.2 The Technician Portal (The Operational Cockpit)
*   **Focus:** Visit preparation, hardware troubleshooting, and retention.
*   **Key Feature:** "Retention Queue" and "AI-Flagged Events" for triage.
*   **Evidence Basis:** Mask-fit metrics and self-reported equipment issues.

### 2.3 The Patient Portal (The Therapeutic Loop)
*   **Focus:** Engagement, education, and self-reporting.
*   **Key Feature:** "Triggered Video Coaching" based on live therapy data.
*   **Evidence Basis:** Real-time therapy usage rings and simplified biomarker feedback.

---

## 3. Technical Implementation Status

The project has been successfully initialized and connected to the **Render Cloud Backend**.

### 3.1 Tech Stack
*   **Framework:** React 18 + TypeScript
*   **Styling:** Tailwind CSS (Modern, Premium Aesthetics)
*   **State Management:** Custom `useApi` hooks with data persistence and mock-fallback.
*   **Connectivity:** Real-time integration with `cpap-backend.onrender.com`.

### 3.2 Screen Inventory (100% Functional)

| Role | Screen | Description |
| :--- | :--- | :--- |
| **Physician** | Exception Inbox | AI-prioritized triage of urgent patient cases. |
| **Physician** | Patient Cockpit | Multi-tab analysis (CPAP, Biomarkers, Interventions, Surveys). |
| **Technician** | Retention Queue | List of patients requiring proactive hardware checks. |
| **Technician** | Event Triage | Validation of AI-flagged mechanical vs. self-report issues. |
| **Patient** | Home / Dash | 3D-style usage rings and active guidance steps. |
| **Patient** | Sleep Trends | Live sync of CPAP hours and therapy streaks. |
| **Patient** | Coaching | Video library with engagement tracking and ratings. |
| **Patient** | Help Center | Direct-to-technician issue reporting (Human-in-the-Loop). |

---

## 4. Next Steps: Week 6 & Beyond

With the functional design finalized and the API connected, the project moves into **Phase 2: Core Development**.
*   **Week 6:** Implementation of high-fidelity AHI and Leak evolution charts.
*   **Week 7:** Integration of source-transparent biomarker visualization.
*   **Week 8:** Finalization of the Intervention Sequence Chain.

---

> [!NOTE]
> This document serves as the **Functional Design Specification** deliverable for Week 5. All technical connections to the Render API are active and verified.
