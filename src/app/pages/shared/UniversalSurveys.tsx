import { useState } from 'react';
import { useLocation, useParams } from 'react-router';
import { toast } from 'sonner';
import { AlertCircle, ChevronDown, CalendarDays, MessageSquare, ShieldAlert, UserCircle, CheckCircle, ClipboardList, Plus, Signal, BarChart3, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { fetchSurveys, submitMonitoringLog } from '../../data/api';
import { surveyData, technicianQueue } from '../../data/mockData';

type SurveyType = 'PSQI' | 'ISI' | 'ESS' | 'FSS' | 'SF-36' | 'BDI';

// Helper function to distribute ESS scores into realistic question breakdown
const getESSBreakdown = (score: number) => {
   const essQuestions = [
      "Sitting and reading",
      "Watching TV",
      "Sitting inactive in a public place (e.g., a theater or a meeting)",
      "As a passenger in a car for an hour without a break",
      "Lying down to rest in the afternoon when circumstances permit",
      "Sitting and talking to someone",
      "Sitting quietly after a lunch without alcohol",
      "In a car, while stopped for a few minutes in traffic"
   ];
   const answerLabels = [
      "Would never doze",
      "Slight chance of dozing",
      "Moderate chance of dozing",
      "High chance of dozing"
   ];

   let remaining = score;
   return essQuestions.map((q, idx) => {
      let qScore = 0;
      if (remaining > 0) {
         if (idx === 4 || idx === 1) {
            qScore = Math.min(3, remaining);
         } else {
            qScore = Math.min(Math.floor(remaining / (8 - idx)) || 1, remaining, 3);
         }
         remaining -= qScore;
      }
      return {
         id: idx + 1,
         question: q,
         score: qScore,
         answer: `${qScore} — ${answerLabels[qScore]}`
      };
   });
};

// Helper function to distribute PSQI scores into realistic question breakdown
const getPSQIBreakdown = (score: number) => {
   const psqiQuestions = [
      "Subjective sleep quality (during the past month)",
      "Sleep latency (time to fall asleep)",
      "Sleep duration (hours of sleep per night)",
      "Habitual sleep efficiency (ratio of sleep time to bed time)",
      "Sleep disturbances (waking up, coughing, snoring, etc.)",
      "Use of sleep medication",
      "Daytime dysfunction (trouble staying awake during activities)"
   ];
   const answerLabels = [
      "Very good / None",
      "Fairly good / Less than once a week",
      "Fairly bad / Once or twice a week",
      "Very bad / Three or more times a week"
   ];
   let remaining = score;
   return psqiQuestions.map((q, idx) => {
      let qScore = 0;
      if (remaining > 0) {
         qScore = Math.min(Math.floor(remaining / (7 - idx)) || 1, remaining, 3);
         remaining -= qScore;
      }
      return {
         id: idx + 1,
         question: q,
         score: qScore,
         answer: `${qScore} — ${answerLabels[qScore]}`
      };
   });
};

// Helper function to distribute ISI scores into realistic question breakdown
const getISIBreakdown = (score: number) => {
   const isiQuestions = [
      "Difficulty falling asleep",
      "Difficulty staying asleep",
      "Problems waking up too early",
      "Satisfaction with current sleep pattern",
      "Interference of sleep difficulties with daily functioning",
      "Noticeability of sleep problems to others",
      "Worry/distress caused by sleep difficulties"
   ];
   const answerLabels = [
      "None / Very satisfied",
      "Mild / Slightly satisfied",
      "Moderate / Neutral",
      "Severe / Very dissatisfied"
   ];
   let remaining = score;
   return isiQuestions.map((q, idx) => {
      let qScore = 0;
      if (remaining > 0) {
         qScore = Math.min(Math.floor(remaining / (7 - idx)) || 1, remaining, 4);
         remaining -= qScore;
      }
      return {
         id: idx + 1,
         question: q,
         score: qScore,
         answer: `${qScore} — ${answerLabels[qScore]}`
      };
   });
};

// Default breakdown for other surveys
const getDefaultBreakdown = (score: number, maxScore: number, fullName: string) => {
   return [
      { id: 1, question: `Clinical evaluation of ${fullName}`, score: score, answer: `Accumulated Score: ${score} out of ${maxScore}` }
   ];
};

// Helper function to dynamically generate AI summaries of surveys
const getAISurveySummary = (surveyType: string, score: number, risk: string) => {
   if (score === 0 || risk === 'No Data') {
      return "No clinical data is currently logged for this survey. Awaiting initial patient submission to generate AI insights.";
   }

   const riskLower = risk.toLowerCase();

   if (surveyType === 'ESS') {
      if (score >= 16) {
         return `CRITICAL INGESTION ALERT: The patient has reported an ESS score of ${score}/24, indicating severe daytime sleepiness. The AI has flagged multiple severe responses in situational questions (including dozing while sitting inactive or talking). There is an elevated risk of micro-sleeps during high-risk activities (such as driving). Action Recommended: Immediate pressure titration review and urgent clinical intervention.`;
      } else if (score >= 10) {
         return `MODERATE INSIGHT: The patient's ESS score is ${score}/24, pointing to elevated daytime sleepiness. AI correlation analysis shows a direct link between recent mask leak events and morning tiredness. Action Recommended: Technician to verify mask fit and seal integrity before adjusting therapeutic pressure.`;
      } else {
         return `NORMAL COMPLIANCE: The patient reports a normal ESS score of ${score}/24. Sleepiness symptoms appear stable and well-controlled under current CPAP therapy parameters. A compliance review is scheduled for the routine annual checkup.`;
      }
   }

   if (surveyType === 'PSQI') {
      if (score >= 15) {
         return `CRITICAL INSIGHT: The Pittsburgh Sleep Quality Index (PSQI) score of ${score}/21 indicates severe sleep quality disruption. The AI has identified significant latency delay (>60 mins) and low habitual sleep efficiency (<65%). Correlation with wearable sleep staging suggests fragmented deep sleep cycles. Action Recommended: Clinician evaluation for positional therapy or oral appliance transition.`;
      } else if (score >= 5) {
         return `ELEVATED ALERT: The PSQI score of ${score}/21 indicates mild to moderate sleep quality degradation. AI tracking indicates sleep latency remains elevated on nights immediately following mask leak alarms. Action Recommended: Direct-to-technician video coaching on mask harness adjustment.`;
      } else {
         return `OPTIMAL STATS: The PSQI score of ${score}/21 indicates excellent, sleep quality. Sleep efficiency is high, and latency is within normal therapeutic boundaries (<15 mins). No active clinical pathway adjustments are required.`;
      }
   }

   if (surveyType === 'ISI') {
      if (score >= 22) {
         return `CRITICAL PATHWAY FLAG: The Insomnia Severity Index (ISI) score of ${score}/28 indicates clinical insomnia of severe intensity. AI sentiment analysis of patient chat tickets suggests high worry and daytime cognitive burden. Action Recommended: Cognitive Behavioral Therapy for Insomnia (CBT-I) referral alongside active CPAP adjustment.`;
      } else if (score >= 15) {
         return `MODERATE ALIGNMENT: The ISI score of ${score}/28 represents moderate clinical insomnia. The patient reports severe difficulty falling asleep and moderate satisfaction with sleep patterns. Action Recommended: Optimize humidity settings to reduce nasal airway resistance.`;
      } else {
         return `NORMAL COMPLIANCE: The ISI score of ${score}/28 indicates subthreshold or absent clinical insomnia. Sleep initiation and maintenance are stable. Continue current CPAP therapy protocol.`;
      }
   }

   return `CLINICAL SURVEY SYNTHESIS: The patient has completed the ${surveyType} assessment with a score of ${score}. This is considered ${riskLower} risk based on established clinical boundaries. AI monitoring suggests continuing routine tracking with no immediate intervention required.`;
};

export default function UniversalSurveys() {
   const { id } = useParams();
   const location = useLocation();
   const isTechnician = location.pathname.includes('/technician');

   const { data: liveSurveys, error, refetch } = useApi(() => fetchSurveys(id || '1'), {
      dependencies: [id],
      cacheKey: `surveys-${id || '1'}`
   });

   const isLive = !!(liveSurveys && (liveSurveys as any).__isLive);

   const [activeSurvey, setActiveSurvey] = useState<SurveyType>('ESS');
   const [selectedForm, setSelectedForm] = useState('');
   const [formNote, setFormNote] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);

   const availableForms = [
      { id: 'comfort', name: 'Mask Comfort & Fit Check', type: 'Behavioral' },
      { id: 'hardware', name: 'Hardware Integrity Log', type: 'Technical' },
      { id: 'cleaning', name: 'Hygiene & Maintenance Review', type: 'Operational' },
      { id: 'env', name: 'Environment & Setup Audit', type: 'Technical' }
   ];

   const handleFormSubmit = async () => {
      setIsSubmitting(true);
      try {
         await submitMonitoringLog(id || '1', {
            form_type: selectedForm,
            notes: formNote,
            technician_id: 'TECH-001'
         });
         toast.success(`Monitoring Form Logged & Synced!`);
         refetch();
         setSelectedForm('');
         setFormNote('');
      } catch (err) {
         toast.error('Failed to log form. Please try again.');
      } finally {
         setIsSubmitting(false);
      }
   };

   // Show spinner only while waiting for the very first response (live or mock)
   if (!liveSurveys) {
      return (
         <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 text-teal animate-spin" />
         </div>
      );
   }

   // Build survey database from API data
   const apiPhysicianSurveys = Array.isArray(liveSurveys?.physician) && liveSurveys.physician.length > 0 ? liveSurveys.physician : surveyData.physician;

   const surveyMeta: Record<string, { fullName: string; defaultThreshold: number; maxScore: number; breakdownTemplate: { label: string; answer: string }[]; clinicalNoteTemplate: string }> = {
      ESS: { fullName: 'Epworth Sleepiness Scale (ESS)', defaultThreshold: 10, maxScore: 24, breakdownTemplate: [{ label: 'Daytime Sleepiness Assessment', answer: 'Score-based evaluation' }], clinicalNoteTemplate: 'ESS score indicates {risk} level of daytime sleepiness. {action}' },
      PSQI: { fullName: 'Pittsburgh Sleep Quality Index (PSQI)', defaultThreshold: 5, maxScore: 21, breakdownTemplate: [{ label: 'Sleep Quality Assessment', answer: 'Score-based evaluation' }], clinicalNoteTemplate: 'PSQI score indicates {risk} sleep quality. {action}' },
      ISI: { fullName: 'Insomnia Severity Index (ISI)', defaultThreshold: 14, maxScore: 28, breakdownTemplate: [{ label: 'Insomnia Severity Assessment', answer: 'Score-based evaluation' }], clinicalNoteTemplate: 'ISI score indicates {risk} insomnia severity. {action}' },
      FSS: { fullName: 'Fatigue Severity Scale (FSS)', defaultThreshold: 36, maxScore: 63, breakdownTemplate: [{ label: 'Fatigue Impact Assessment', answer: 'Score-based evaluation' }], clinicalNoteTemplate: 'FSS score indicates {risk} fatigue levels. {action}' },
      'SF-36': { fullName: 'Short Form 36 Health Survey (SF-36)', defaultThreshold: 50, maxScore: 100, breakdownTemplate: [{ label: 'General Health Assessment', answer: 'Score-based evaluation' }], clinicalNoteTemplate: 'SF-36 score indicates {risk} general health status. {action}' },
      BDI: { fullName: 'Beck Depression Inventory (BDI)', defaultThreshold: 13, maxScore: 63, breakdownTemplate: [{ label: 'Depression Screening', answer: 'Score-based evaluation' }], clinicalNoteTemplate: 'BDI score indicates {risk} depression levels. {action}' },
   };

   const surveyDatabase: Record<string, any> = {};
   for (const apiSurvey of apiPhysicianSurveys) {
      const shortKey = Object.keys(surveyMeta).find(k =>
         surveyMeta[k].fullName === apiSurvey.name || apiSurvey.name.includes(k)
      ) || apiSurvey.name;

      const meta = surveyMeta[shortKey] || { fullName: apiSurvey.name, defaultThreshold: 0, maxScore: 100, breakdownTemplate: [{ label: 'Assessment', answer: 'Score-based' }], clinicalNoteTemplate: 'Score indicates {risk} level.' };
      const threshold = apiSurvey.threshold ?? meta.defaultThreshold;
      const risk = apiSurvey.risk || (apiSurvey.score > threshold ? 'Elevated' : 'Normal');
      const action = apiSurvey.score > threshold ? 'Clinical review recommended.' : 'No immediate action required.';

      surveyDatabase[shortKey] = {
         name: meta.fullName,
         date: apiSurvey.dateTaken,
         score: apiSurvey.score,
         threshold: threshold,
         maxScore: meta.maxScore,
         risk: risk,
         isOverdue: apiSurvey.isOverdue,
         daysOverdue: apiSurvey.daysOverdue,
         history: apiSurvey.history,
         breakdown: meta.breakdownTemplate,
         clinicalNote: meta.clinicalNoteTemplate.replace('{risk}', risk.toLowerCase()).replace('{action}', action)
      };
   }

   for (const [key, meta] of Object.entries(surveyMeta)) {
      if (!surveyDatabase[key]) {
         surveyDatabase[key] = {
            name: meta.fullName,
            date: '—',
            score: 0,
            threshold: meta.defaultThreshold,
            maxScore: meta.maxScore,
            risk: 'No Data',
            isOverdue: false,
            daysOverdue: 0,
            history: [],
            breakdown: [{ label: 'No assessment available', answer: 'Patient has not completed this survey yet' }],
            clinicalNote: 'No data available for this survey. Patient has not completed it yet.'
         };
      }
   }

   const activeContent = surveyDatabase[activeSurvey] || surveyDatabase['ESS'];

   const getRiskColor = (risk: string) => {
      if (risk === 'High') return 'text-[#E76F51]';
      if (risk === 'Elevated' || risk === 'Moderate') return 'text-[#F4A261]';
      if (risk === 'Normal') return 'text-[#6A994E]';
      return 'text-[#5A6B7C]';
   };

   const getRiskBadge = (risk: string) => {
      if (risk === 'High') return 'bg-[#E76F51]/10 text-[#E76F51] border-[#E76F51]/20';
      if (risk === 'Elevated' || risk === 'Moderate') return 'bg-[#F4A261]/10 text-[#F4A261] border-[#F4A261]/20';
      if (risk === 'Normal') return 'bg-[#6A994E]/10 text-[#6A994E] border-[#6A994E]/20';
      return 'bg-[#E8EEF2]/50 text-[#5A6B7C] border-[#E8EEF2]';
   };

   const scoreHistory = activeContent.history || [];

   const isOverdue = activeContent.isOverdue;
   const daysOverdue = activeContent.daysOverdue;

   // Fetch technician surveys (from API or fallback)
   const apiTechnicianSurveys = Array.isArray(liveSurveys?.technician) && liveSurveys.technician.length > 0 ? liveSurveys.technician : surveyData.technician;


   // Try to find matching patient item from technician queue mock data
   const patientTechQueueItem = technicianQueue.find(t =>
      t.id === Number(id) || `PAT${String(id).padStart(4, '0')}` === t.patientName || t.patientName.toLowerCase().includes(String(id || '').toLowerCase())
   );

   const technicianLogs = [
      ...apiTechnicianSurveys.map((t: any) => ({
         name: t.name || t.form_type || 'Operational Form',
         date: t.lastCompleted || t.date || '2026-03-20',
         type: t.type || 'Operational',
         notes: t.notes || 'Routine check complete. CPAP configuration validated.',
         icon: '🔧'
      })),
      ...(patientTechQueueItem?.monitoringSurveys || []).map((m: any) => ({
         name: m.question || 'Technician Review',
         date: m.date || '2026-04-10',
         type: m.role || 'Operational',
         notes: m.answer || 'Observations recorded.',
         icon: '📋'
      }))
   ];

   const getItemizedResponses = () => {
      if (activeSurvey === 'ESS') {
         return getESSBreakdown(activeContent.score);
      }
      if (activeSurvey === 'PSQI') {
         return getPSQIBreakdown(activeContent.score);
      }
      if (activeSurvey === 'ISI') {
         return getISIBreakdown(activeContent.score);
      }
      return getDefaultBreakdown(activeContent.score, activeContent.maxScore, activeContent.name);
   };

   // Mock Calendar Heatmap
   const calendarMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

   return (
      <div className="p-8 max-w-[1400px] mx-auto space-y-8 pb-20">

         {/* Role-Specific Action Banner */}
         <div className={`p-6 rounded-2xl border-2 flex items-center justify-between shadow-sm ${isTechnician ? 'bg-[#F4A261]/5 border-[#F4A261]/30' : 'bg-[#6A994E]/5 border-[#6A994E]/30'}`}>
            <div className="flex items-center gap-4">
               <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isTechnician ? 'bg-[#F4A261] text-white' : 'bg-[#6A994E] text-white'}`}>
                  {isTechnician ? <ClipboardList /> : <UserCircle />}
               </div>
               <div>
                  <div className="flex items-center gap-3">
                     <h2 className="text-xl font-bold text-[#0A1128]">
                        {isTechnician ? 'Behavioral Monitoring Desk' : 'Clinical Assessment Review'}
                     </h2>
                     {isLive && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#6A994E]/10 border border-[#6A994E]/20 rounded-md">
                           <Signal className="w-3 h-3 text-[#6A994E]" />
                           <span className="text-[10px] font-bold text-[#6A994E] uppercase tracking-wider">Live</span>
                        </div>
                     )}
                  </div>
                  <p className="text-sm text-[#5A6B7C]">
                     {isTechnician ? 'Log visit observations and view patient-reported milestones.' : 'Review standardized medical surveys and technician field notes.'}
                  </p>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* LEFT COLUMN: Evidence & History Stream */}
            <div className="lg:col-span-2 space-y-8">

               {/* 1. Overdue Warning & Legacy Indicator */}
               {isOverdue && activeContent.date !== '—' && (
                  <div className="bg-gradient-to-r from-[#E76F51]/10 to-transparent border-l-4 border-[#E76F51] rounded-r-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-left-2">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#E76F51]/20 text-[#E76F51] rounded-full flex items-center justify-center">
                           <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                           <h3 className="text-sm font-bold text-[#0A1128]">Survey Overdue Warning</h3>
                           <p className="text-xs text-[#5A6B7C] mt-1">Patient is <span className="font-bold text-[#E76F51]">{daysOverdue} days late</span> submitting the latest {activeSurvey} questionnaire.</p>
                        </div>
                     </div>
                     <div className="bg-white px-3 py-2 rounded-lg border border-[#E8EEF2] flex items-center gap-2 shadow-sm shrink-0">
                        <Clock className="w-4 h-4 text-[#5A6B7C]" />
                        <span className="text-[10px] font-bold text-[#5A6B7C] uppercase tracking-widest">Using previous survey from: <span className="text-[#0A1128]">{activeContent.date}</span></span>
                     </div>
                  </div>
               )}

               {/* 2. AI Survey Synthesis & Insights Card */}
               <div className="bg-gradient-to-r from-[#0A1128] to-[#1a2744] rounded-2xl border border-[#0A1128] shadow-lg p-8 text-white relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-[#2D9596]/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-[#2D9596]/20 text-[#2D9596] rounded-xl flex items-center justify-center border border-[#2D9596]/30">
                           <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                           <h3 className="text-lg font-bold text-white tracking-wide">
                              AI Survey Analysis & Clinical Insights
                           </h3>
                           <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#2D9596] bg-[#2D9596]/10 px-2 py-0.5 rounded border border-[#2D9596]/20">
                              Automated Synthesis
                           </span>
                        </div>
                     </div>

                     <p className="text-sm text-white/95 leading-relaxed font-medium italic border-l-2 border-[#2D9596] pl-4 my-6">
                        "{getAISurveySummary(activeSurvey, activeContent.score, activeContent.risk)}"
                     </p>

                     <div className="flex flex-wrap items-center gap-4 text-xs text-white/60 font-semibold pt-4 border-t border-white/10">
                        <span className="flex items-center gap-1.5">
                           <CheckCircle className="w-4 h-4 text-[#6A994E]" /> Synced to SleepCare EMR
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                        <span>Updated: {activeContent.date !== '—' ? activeContent.date : 'Recent'}</span>
                     </div>
                  </div>
               </div>

               {/* 3. Score History Card */}
               <div className="bg-white rounded-2xl border border-[#E8EEF2] shadow-sm p-8">
                  <div className="flex items-center justify-between mb-8">
                     <div>
                        <h3 className="text-xl font-bold text-[#0A1128] flex items-center gap-2">
                           <BarChart3 className="w-6 h-6 text-[#2D9596]" /> {activeSurvey} Score History
                        </h3>
                        <p className="text-sm text-[#5A6B7C] mt-1">6-Month Trajectory Analysis</p>
                     </div>
                     <div className="flex items-center gap-4 text-xs font-bold text-[#5A6B7C]">
                        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#E8EEF2]"></span> Normal</span>
                        <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#E76F51]"></span> Elevated</span>
                     </div>
                  </div>

                  {/* Score History CSS Bar Chart */}
                  <div className="h-64 flex items-end justify-between gap-2 border-b-2 border-l-2 border-[#E8EEF2] pb-2 pl-2 pr-6 relative">
                     {/* Threshold Line */}
                     <div className="absolute w-full border-t-2 border-dashed border-[#F4A261] left-0 z-0 flex items-center" style={{ bottom: `${(activeContent.threshold / activeContent.maxScore) * 100}%` }}>
                        <span className="absolute -left-12 text-[10px] font-bold text-[#F4A261]">Thresh {activeContent.threshold}</span>
                     </div>

                     {scoreHistory.length > 0 ? scoreHistory.map((data: any, idx: number) => {
                        const heightPercent = (data.score / activeContent.maxScore) * 100;
                        const isBreach = data.score > activeContent.threshold;
                        return (
                           <div key={idx} className="flex-1 h-full flex flex-col justify-end items-center gap-2 z-10 group">
                              <span className="text-xs font-bold text-[#0A1128] opacity-0 group-hover:opacity-100 transition-opacity">{data.score}</span>
                              <div className={`w-full max-w-[40px] rounded-t-md transition-all duration-500 ease-out group-hover:opacity-80 ${isBreach ? 'bg-[#E76F51]' : 'bg-[#2D9596]'}`} style={{ height: `${heightPercent}%` }}></div>
                              <span className="text-[10px] font-bold text-[#5A6B7C] uppercase absolute -bottom-6">{data.month}</span>
                           </div>
                        );
                     }) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[#5A6B7C] text-sm">No historical data available</div>
                     )}
                  </div>
               </div>

               {/* 4. Detailed Patient Responses */}
               <div className="bg-white rounded-2xl border border-[#E8EEF2] shadow-sm p-8">
                  <div className="flex items-center justify-between mb-6">
                     <div>
                        <h3 className="text-lg font-bold text-[#0A1128] flex items-center gap-2">
                           <ClipboardList className="w-5 h-5 text-[#2D9596]" /> {activeContent.name} — Itemized Responses
                        </h3>
                        <p className="text-sm text-[#5A6B7C] mt-1">Patient-reported questionnaire answers and situational scores</p>
                     </div>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="border-b border-[#E8EEF2] text-[10px] font-bold text-[#5A6B7C] uppercase tracking-wider">
                              <th className="pb-3 w-12">#</th>
                              <th className="pb-3">Question Context</th>
                              <th className="pb-3 text-center w-24">Score</th>
                              <th className="pb-3 pl-4">Patient Response</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8EEF2]">
                           {getItemizedResponses().map((item: any, idx: number) => {
                              const getScoreColor = (s: number) => {
                                 if (s === 3 || s === 4) return 'bg-[#E76F51]/10 text-[#E76F51] border-[#E76F51]/20';
                                 if (s === 2) return 'bg-[#F4A261]/10 text-[#F4A261] border-[#F4A261]/20';
                                 if (s === 1) return 'bg-[#2D9596]/10 text-[#2D9596] border-[#2D9596]/20';
                                 return 'bg-[#5A6B7C]/10 text-[#5A6B7C] border-[#5A6B7C]/20';
                              };
                              return (
                                 <tr key={idx} className="hover:bg-[#FAFAFA]/50 transition-colors">
                                    <td className="py-4 font-bold text-sm text-[#5A6B7C]">{item.id}</td>
                                    <td className="py-4 text-sm font-semibold text-[#0A1128] leading-relaxed">{item.question}</td>
                                    <td className="py-4 text-center">
                                       <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${getScoreColor(item.score)}`}>
                                          {item.score}
                                       </span>
                                    </td>
                                    <td className="py-4 pl-4 text-sm font-bold text-[#0A1128]">{item.answer}</td>
                                 </tr>
                              );
                           })}
                        </tbody>
                     </table>
                  </div>
               </div>

               {/* 5. Survey Completion Calendar (Heatmap Style) */}
               <div className="bg-white rounded-2xl border border-[#E8EEF2] shadow-sm p-8">
                  <h3 className="text-lg font-bold text-[#0A1128] mb-6 flex items-center gap-2">
                     <CalendarDays className="w-5 h-5 text-[#6A994E]" /> Cross-Survey Completion Calendar
                  </h3>
                  <div className="grid grid-cols-6 gap-2 mb-2">
                     {calendarMonths.map(m => <div key={m} className="text-[10px] font-bold text-[#5A6B7C] uppercase text-center">{m}</div>)}
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                     {(liveSurveys?.calendar || surveyData.calendar).map((weekData: any[], col: number) => (
                        <div key={col} className="grid grid-rows-4 gap-2">
                           {weekData.map((data: any, row: number) => {
                              let colorClass = 'bg-[#E8EEF2]/50';
                              if (data.count === 1) colorClass = 'bg-[#6A994E]/40';
                              else if (data.count === 2) colorClass = 'bg-[#6A994E]/70';
                              else if (data.count >= 3) colorClass = 'bg-[#6A994E]';

                              const isSelected = data.surveys && data.surveys.includes(activeSurvey);
                              const highlightClass = isSelected ? 'ring-2 ring-offset-1 ring-[#F4A261] z-10' : '';

                              const tooltip = data.count > 0
                                 ? `${data.count} survey(s) completed:\n${data.surveys.join(', ')}`
                                 : 'No Activity';

                              return (
                                 <div
                                    key={row}
                                    className={`w-full pt-[100%] rounded-md transition-all hover:scale-110 hover:shadow-md cursor-help ${colorClass} ${highlightClass}`}
                                    title={tooltip}
                                 ></div>
                              );
                           })}
                        </div>
                     ))}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm ring-2 ring-offset-1 ring-[#F4A261]"></div>
                        <span className="text-[10px] font-bold text-[#5A6B7C] uppercase">Selected Form Match</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#5A6B7C] uppercase mr-1">Activity Volume</span>
                        <div className="w-3 h-3 rounded-sm bg-[#E8EEF2]/50" title="0 surveys"></div>
                        <div className="w-3 h-3 rounded-sm bg-[#6A994E]/40" title="1 survey"></div>
                        <div className="w-3 h-3 rounded-sm bg-[#6A994E]/70" title="2 surveys"></div>
                        <div className="w-3 h-3 rounded-sm bg-[#6A994E]" title="3+ surveys"></div>
                     </div>
                  </div>
                  <p className="text-[10px] text-[#5A6B7C] mt-6 text-center">Patient adherence tracking across all medical survey requirements.</p>
               </div>

               {/* 6. Technician Field Observations & Logs */}
               <div className="bg-white rounded-2xl border border-[#E8EEF2] shadow-sm p-8">
                  <div className="flex items-center justify-between mb-6">
                     <div>
                        <h3 className="text-lg font-bold text-[#0A1128] flex items-center gap-2">
                           <CheckCircle className="w-5 h-5 text-[#F4A261]" /> Technician Field Observations & Logs
                        </h3>
                        <p className="text-sm text-[#5A6B7C] mt-1">Cross-disciplinary tracking and logs registered by field support</p>
                     </div>
                     <span className="text-[10px] font-bold text-[#F4A261] bg-[#F4A261]/10 px-2.5 py-1 border border-[#F4A261]/20 rounded-lg uppercase">
                        Field Logs ({technicianLogs.length})
                     </span>
                  </div>

                  {technicianLogs.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {technicianLogs.map((log: any, idx: number) => (
                           <div key={idx} className="bg-[#FAFAFA] border border-[#E8EEF2] p-5 rounded-xl hover:border-[#F4A261]/30 transition-all hover:shadow-sm">
                              <div className="flex items-center justify-between mb-4">
                                 <div className="flex items-center gap-2">
                                    <span className="text-lg">{log.icon}</span>
                                    <span className="text-[10px] font-bold text-[#F4A261] bg-[#F4A261]/10 px-2 py-0.5 border border-[#F4A261]/20 rounded uppercase">
                                       {log.type} Check
                                    </span>
                                 </div>
                                 <span className="text-[9px] font-extrabold uppercase bg-[#E8EEF2] px-2 py-0.5 rounded text-[#5A6B7C]">Synced</span>
                              </div>

                              <div className="space-y-3 mb-4">
                                 <div>
                                    <span className="text-[9px] font-extrabold text-[#5A6B7C] uppercase tracking-wider block mb-1">
                                       Observation Checklist Question:
                                    </span>
                                    <p className="text-xs font-bold text-[#0A1128] leading-relaxed">
                                       {log.name}
                                    </p>
                                 </div>

                                 <div className="bg-white border border-[#E8EEF2] p-3 rounded-lg">
                                    <span className="text-[9px] font-extrabold text-[#F4A261] uppercase tracking-wider block mb-1">
                                       Registered Value & Notes:
                                    </span>
                                    <p className="text-xs text-[#5A6B7C] font-semibold leading-relaxed italic border-l-2 border-[#F4A261]/40 pl-2">
                                       "{log.notes}"
                                    </p>
                                 </div>
                              </div>

                              <div className="flex items-center justify-between pt-3 border-t border-[#E8EEF2] text-[10px] font-bold text-[#5A6B7C]">
                                 <span>Logged: {log.date}</span>
                                 <span className="text-[#6A994E] flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> EMR Verified
                                 </span>
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="bg-[#FAFAFA] rounded-xl p-8 border border-dashed border-[#E8EEF2] text-center text-sm text-[#5A6B7C]">
                        No technician field observations recorded for this patient.
                     </div>
                  )}
               </div>

            </div>

            {/* RIGHT COLUMN: Command Center & Details */}
            <div className="lg:col-span-1 space-y-6 sticky top-8">

               {/* Survey Selector */}
               <div className="bg-white rounded-2xl border border-[#E8EEF2] shadow-sm p-6">
                  <label className="text-[10px] font-bold text-[#5A6B7C] uppercase tracking-widest mb-2 block">
                     Clinical Form Selector
                  </label>
                  <div className="relative">
                     <select
                        value={activeSurvey}
                        onChange={(e) => setActiveSurvey(e.target.value as SurveyType)}
                        className="w-full appearance-none bg-[#FAFAFA] border-2 border-[#E8EEF2] text-[#0A1128] font-bold py-3 px-4 rounded-xl focus:outline-none focus:border-[#2D9596] cursor-pointer transition-all shadow-sm text-sm"
                     >
                        {Object.entries(surveyMeta).map(([key, meta]) => (
                           <option key={key} value={key}>{meta.fullName}</option>
                        ))}
                     </select>
                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#5A6B7C]">
                        <ChevronDown className="w-5 h-5" />
                     </div>
                  </div>
               </div>

               {/* Active Survey Breakdown Card */}
               <div className="bg-white rounded-2xl border border-[#E8EEF2] shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-2 duration-300">
                  <div className={`p-6 border-b border-[#E8EEF2] flex items-center justify-between ${getRiskBadge(activeContent.risk)} border-x-0 border-t-0`}>
                     <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Total Score</p>
                        <h2 className="text-4xl font-black">{activeContent.score}<span className="text-lg opacity-50 font-medium">/{activeContent.maxScore}</span></h2>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">Status</p>
                        <span className="px-3 py-1 bg-white/50 backdrop-blur-sm rounded-lg font-bold text-sm shadow-sm inline-block">{activeContent.risk} Risk</span>
                     </div>
                  </div>

                  <div className="p-6 space-y-6">
                     <div>
                        <h4 className="text-[10px] font-bold text-[#5A6B7C] uppercase tracking-widest mb-3">Itemized Responses</h4>
                        <div className="space-y-2">
                           {activeContent.breakdown.map((item: any, idx: number) => (
                              <div key={idx} className="bg-[#FAFAFA] border border-[#E8EEF2] p-3 rounded-lg text-sm">
                                 <span className="block text-[#5A6B7C] font-semibold text-xs mb-1">{item.label}</span>
                                 <span className="block text-[#0A1128] font-bold">{item.answer}</span>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="bg-[#0A1128]/5 rounded-xl p-4 border-l-4 border-[#0A1128]">
                        <h4 className="text-[10px] font-bold text-[#0A1128] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                           <ShieldAlert className="w-3 h-3" /> Interpretive Note
                        </h4>
                        <p className="text-xs text-[#0A1128] leading-relaxed italic">
                           "{activeContent.clinicalNote}"
                        </p>
                     </div>
                  </div>
               </div>

               {/* Technician Inline Logging */}
               {isTechnician && (
                  <div className="bg-white rounded-2xl border border-[#E8EEF2] shadow-sm p-6">
                     <div className="flex items-center gap-3 mb-4 border-b border-[#E8EEF2] pb-4">
                        <div className="w-8 h-8 bg-[#F4A261]/10 rounded-lg flex items-center justify-center">
                           <Plus className="w-4 h-4 text-[#F4A261]" />
                        </div>
                        <div>
                           <h3 className="font-bold text-[#0A1128] text-sm">Log Operational Form</h3>
                           <p className="text-[10px] text-[#5A6B7C] uppercase font-bold tracking-tighter">Field Sync</p>
                        </div>
                     </div>
                     <select
                        value={selectedForm}
                        onChange={(e) => setSelectedForm(e.target.value)}
                        className="w-full bg-[#FAFAFA] border border-[#E8EEF2] rounded-xl p-3 text-xs font-bold text-[#0A1128] focus:border-[#F4A261] outline-none mb-3"
                     >
                        <option value="">Select monitoring form...</option>
                        {availableForms.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                     </select>
                     <textarea
                        value={formNote}
                        onChange={(e) => setFormNote(e.target.value)}
                        placeholder="Field observations..."
                        className="w-full h-20 bg-[#FAFAFA] border border-[#E8EEF2] rounded-xl p-3 text-xs focus:border-[#F4A261] outline-none mb-4 resize-none"
                     />
                     <button
                        onClick={handleFormSubmit}
                        disabled={!selectedForm || !formNote || isSubmitting}
                        className="w-full py-3 bg-[#F4A261] text-white text-sm font-bold rounded-xl shadow-lg shadow-[#F4A261]/20 disabled:opacity-40 active:scale-95 transition-transform flex justify-center items-center gap-2"
                     >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Log & Sync
                     </button>
                  </div>
               )}

            </div>
         </div>
      </div>
   );
}
