import { createBrowserRouter, Navigate } from "react-router";
import RoleSelector from "./pages/RoleSelector";
import PatientLogin from "./pages/PatientLogin";
import PhysicianLayout from "./layouts/PhysicianLayout";
import TechnicianLayout from "./layouts/TechnicianLayout";
import PatientLayout from "./layouts/PatientLayout";
import PhysicianPatientLayout from "./layouts/PhysicianPatientLayout";
import TechnicianPatientLayout from "./layouts/TechnicianPatientLayout";
import PhysicianHome from "./pages/physician/Home";
import UniversalBiomarkers from "./pages/shared/UniversalBiomarkers";
import UniversalInterventions from "./pages/shared/UniversalInterventions";
import UniversalSurveys from "./pages/shared/UniversalSurveys";
import PhysicianCPAP from "./pages/physician/CPAP";
import PhysicianSummary from "./pages/physician/Summary";
import PhysicianHelp from "./pages/physician/Help";
import PatientDirectory from "./pages/shared/Directory";
import UniversalAIAnalysis from "./pages/shared/UniversalAIAnalysis";
import UniversalReporting from "./pages/shared/UniversalReporting";
import TechnicianHome from "./pages/technician/Home";
import TechnicianSummary from "./pages/technician/Summary";
import TechnicianCPAP from "./pages/technician/CPAP";


import TechnicianHelp from "./pages/technician/Help";
import TechnicianInventory from "./pages/technician/Inventory";
import TechnicianDevices from "./pages/technician/Devices";
import PatientHome from "./pages/patient/Home";
import PatientCPAP from "./pages/patient/CPAP";
import PatientSurveys from "./pages/patient/Surveys";
import PatientVideos from "./pages/patient/Videos";
import PatientHelp from "./pages/patient/Help";
import PatientInterventions from "./pages/patient/Interventions";
import PatientReporting from "./pages/patient/Reporting";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RoleSelector,
  },
  {
    path: "/physician",
    Component: PhysicianLayout,
    children: [
      { index: true, Component: PhysicianHome },
      { path: "directory", Component: PatientDirectory },
      { path: "help", Component: PhysicianHelp },
      {
        path: "patient/:id",
        Component: PhysicianPatientLayout,
        children: [
          { index: true, Component: PhysicianSummary },
          { path: "trends", Component: PhysicianCPAP },
          { path: "biomarkers", Component: UniversalBiomarkers },
          { path: "interventions", Component: UniversalInterventions },
          { path: "surveys", Component: UniversalSurveys },
          { path: "ai-analysis", Component: UniversalAIAnalysis },
          { path: "reporting", Component: UniversalReporting },
        ],
      },
    ],
  },
  {
    path: "/technician",
    Component: TechnicianLayout,
    children: [
      { index: true, Component: TechnicianHome },
      { path: "directory", Component: PatientDirectory },
      { path: "inventory", Component: TechnicianInventory },
      { path: "help", Component: TechnicianHelp },
      {
        path: "patient/:id",
        Component: TechnicianPatientLayout,
        children: [
          { index: true, Component: TechnicianSummary },
          { path: "summary", Component: TechnicianSummary },
          { path: "trends", Component: TechnicianCPAP },
          { path: "interventions", Component: UniversalInterventions },
          { path: "surveys", Component: UniversalSurveys },
          { path: "biomarkers", Component: UniversalBiomarkers },
          { path: "ai-analysis", Component: UniversalAIAnalysis },
          { path: "devices", Component: TechnicianDevices },
          { path: "logistics", element: <Navigate to="devices" replace /> },
        ],
      },
    ],
  },
  {
    path: "/patient/:id",
    Component: PatientLayout,
    children: [
      { index: true, Component: PatientHome },
      { path: "home", Component: PatientHome },
      { path: "cpap", Component: PatientCPAP },
      { path: "interventions", Component: PatientInterventions },
      { path: "surveys", Component: PatientSurveys },
      { path: "videos", Component: PatientVideos },
      { path: "help", Component: PatientHelp },
      { path: "reporting", Component: PatientReporting },
    ],
  },
  {
    path: "/login",
    Component: PatientLogin,
  },
  {
    path: "/patient",
    element: <Navigate to="/login" replace />,
  },
]);
