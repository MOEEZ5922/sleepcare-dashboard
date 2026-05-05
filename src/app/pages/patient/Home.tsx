import React, { useState } from 'react';
import { Moon, Flame, ChevronRight, Package, FileText, Sparkles, Video, HelpCircle, X, AlertCircle, Play, Signal, Loader2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { useApi } from '../../hooks/useApi';
import { 
  fetchPatientSummary, 
  fetchCpapTrends, 
  fetchSurveys, 
  submitSurveyResponse,
  PatientSummary,
  CpapTrends,
  SurveyResponse
} from '../../data/api';

export default function PatientHome() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: summary, error: summaryError } = useApi<PatientSummary>(() => fetchPatientSummary(id || '1'), {
    dependencies: [id]
  });
  const { data: cpapTrends, error: cpapError } = useApi<CpapTrends>(() => fetchCpapTrends(id || '1', 7), {
    dependencies: [id]
  });
  const { data: surveyData, error: surveyError } = useApi<SurveyResponse>(() => fetchSurveys(id || '1'), {
    dependencies: [id]
  });

  const isLive = !summaryError && !!summary;
  
  const [showVideoBanner, setShowVideoBanner] = useState(true);
  const [showMicroSurvey, setShowMicroSurvey] = useState(true);
  const [surveyResponse, setSurveyResponse] = useState<string | null>(null);
  const [showUrgentModal, setShowUrgentModal] = useState(true);

  // Derive data from CPAP trends API
  const usageHistory = cpapTrends?.usageHistory || [];
  const lastNightHours = usageHistory.length > 0 ? usageHistory[usageHistory.length - 1]?.hours || 0 : 0;
  const percentComplete = Math.min((lastNightHours / 8) * 100, 100);
  const weeklyAverage = cpapTrends?.averageHours || 0;
  const streak = cpapTrends?.streak || 0;

  // Derive survey info from API
  const nextSurvey = surveyData?.patient?.next;
  const surveyDueDate = nextSurvey?.dueDate ? new Date(nextSurvey.dueDate) : null;
  const surveyDaysLeft = surveyDueDate ? Math.max(0, Math.ceil((surveyDueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;
  const surveyName = nextSurvey?.name || 'Health Survey';
  const surveyQuestions = nextSurvey?.questions || 8;
  const surveyProgress = 0; // Will come from a future API field

  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto pb-32">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-sm font-bold text-[#414D5B] uppercase tracking-widest">Ready for Action</h2>
        {isLive && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#6A994E]/10 border border-[#6A994E]/20 rounded-md">
            <Signal className="w-3 h-3 text-[#6A994E]" />
            <span className="text-[10px] font-bold text-[#6A994E] uppercase tracking-wider">Live</span>
          </div>
        )}
      </div>
        
      {/* 2-Minute Objective: Action Center */}
      <div className="space-y-4">
        {/* Persistent AI Trigger (Dynamic based on leak) */}
        {cpapTrends && cpapTrends.percentileLeak > 20 && (
          <div className="bg-[#0A1128] text-white rounded-[2rem] p-8 shadow-2xl relative overflow-hidden border-2 border-white/10 animate-in zoom-in-95 duration-500">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-[#E76F51]/20 rounded-[1.25rem] flex items-center justify-center flex-shrink-0 relative overflow-hidden group cursor-pointer shadow-lg">
                <img src="https://images.unsplash.com/photo-1584515979956-d9f7e5d099f3?auto=format&fit=crop&q=80&w=150" alt="Video thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-all scale-110 group-hover:scale-100" />
                <div className="absolute inset-0 bg-[#E76F51]/20 group-hover:bg-transparent transition-all" />
                <Play className="w-8 h-8 text-white relative z-10 drop-shadow-md" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-[#E76F51] animate-pulse" />
                  <span className="text-[#E76F51] font-bold text-xs uppercase tracking-widest">Priority Task: Mask Leak</span>
                </div>
                <h3 className="text-xl font-bold mb-4 leading-tight">We detected a leak of {cpapTrends.percentileLeak} L/min. Let's fix it now with a 60s guide.</h3>
                <div className="flex gap-3">
                  <button 
                    onClick={() => navigate(`/patient/${id}/videos`)}
                    className="bg-[#E76F51] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#d6654b] transition-all shadow-lg active:scale-95"
                  >
                    Watch Now
                  </button>
                  <button onClick={() => navigate(`/patient/${id}/help`)} className="text-white/60 text-sm hover:text-white transition-colors">
                    Check Mask Settings →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Persistent Survey Reminder */}
        <div className="bg-gradient-to-br from-[#6A994E] to-[#2D9596] rounded-[2rem] p-8 text-white shadow-xl">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block mb-2">Required Survey</div>
              <h2 className="text-2xl font-bold italic">"How is your sleep tonight?"</h2>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner">
              <FileText className="w-7 h-7" />
            </div>
          </div>
          <div className="mb-6">
            <p className="text-white/90 leading-relaxed mb-3">
              Your clinical team needs the {surveyName} survey to calibrate your therapy. <br/>
              <span className="font-bold">Due in {surveyDaysLeft} days.</span>
            </p>
            <div className="flex items-center justify-between text-xs font-semibold text-white/80 mb-1">
              <span>Progress</span>
              <span>0/{surveyQuestions} Questions</span>
            </div>
            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
              <div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: `${surveyProgress}%` }} />
            </div>
          </div>
          <button
            onClick={() => navigate(`/patient/${id}/surveys`)}
            className="flex items-center justify-center gap-3 w-full bg-white text-[#2D9596] py-5 rounded-2xl font-bold hover:bg-[#f0f9f9] transition-all shadow-xl active:scale-98"
          >
            Finish Survey
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* 1-Tap Micro-Check (State of the Art Micro-UX) */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border-2 border-[#E8EEF2] relative group hover:border-[#2D9596]/30 transition-all">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-[#2D9596]/10 rounded-[1.25rem] flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Sparkles className="w-6 h-6 text-[#2D9596]" />
          </div>
          <div>
            <h3 className="text-[#0A1128] font-bold text-lg">Daily Pulse</h3>
            <p className="text-sm text-[#414D5B]">Did you feel rested this morning?</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          {['Good 👍', 'Okay 😐', 'Bad 👎'].map((rating) => (
            <button
              key={rating}
              onClick={async () => {
                setSurveyResponse(rating);
                try {
                  await submitSurveyResponse(id || '1', 'daily-pulse', { 
                    answers: [{ question_id: 'restful_feeling', value: rating }]
                  });
                } catch (e) {
                  console.error('Failed to submit pulse');
                }
                setTimeout(() => setShowMicroSurvey(false), 1500);
              }}
              className={`flex-1 py-4 rounded-xl border-2 transition-all font-bold text-sm ${
                surveyResponse === rating 
                  ? 'border-[#2D9596] bg-[#2D9596]/10 text-[#2D9596]' 
                  : 'border-[#E8EEF2] text-[#414D5B] hover:border-[#2D9596]/50 shadow-sm'
              }`}
            >
              {rating}
            </button>
          ))}
        </div>
        {surveyResponse && (
          <p className="text-center text-sm text-[#6A994E] font-bold mt-4 animate-pulse">
            Thanks! Your care team has been updated.
          </p>
        )}
      </div>

      {/* Sleep Progress Rings */}
      <div className="bg-white rounded-3xl p-8 shadow-sm">
        <h3 className="text-xl text-[#0A1128] mb-6">Last Night's Progress</h3>
        
        <div className="grid grid-cols-2 gap-8">
          {/* Hours Ring */}
          <div className="text-center">
            <div className="relative w-36 h-36 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  stroke="#E8EEF2"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  stroke="url(#sleepGradient)"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={`${percentComplete * 4.02} 402`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="sleepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6A994E" />
                    <stop offset="100%" stopColor="#2D9596" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Moon className="w-6 h-6 text-[#2D9596] mb-1" />
                <p className="text-3xl font-bold text-[#0A1128]">
                  {lastNightHours.toFixed(1)}
                </p>
                <p className="text-xs text-[#5A6B7C]">hours</p>
              </div>
            </div>
            <p className="text-sm text-[#5A6B7C]">Sleep with Therapy</p>
            <p className="text-lg font-semibold text-[#6A994E] mt-1">
              {lastNightHours >= 6 ? 'Excellent!' : lastNightHours >= 4 ? 'Good Job!' : 'Keep Going!'}
            </p>
          </div>

          {/* Streak Ring */}
          <div className="text-center">
            <div className="relative w-36 h-36 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  stroke="#E8EEF2"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  stroke="#F4A261"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={`${Math.min((streak / 7) * 100, 100) * 4.02} 402`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Flame className="w-6 h-6 text-[#F4A261] mb-1" />
                <p className="text-3xl font-bold text-[#0A1128]">
                  {streak}
                </p>
                <p className="text-xs text-[#5A6B7C]">days</p>
              </div>
            </div>
            <p className="text-sm text-[#5A6B7C]">Current Streak</p>
            <p className="text-lg font-semibold text-[#F4A261] mt-1">
              {streak >= 7 ? '🔥 On Fire!' : 'Building Momentum!'}
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="bg-gradient-to-br from-[#2D9596] to-[#1a7a7b] rounded-3xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6" />
          <h3 className="text-xl font-bold">This Week's Summary</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/90">Average Hours</span>
            <span className="text-2xl font-bold">{weeklyAverage} hrs</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/90">Days Used</span>
            <span className="text-2xl font-bold">{Math.min(usageHistory.length, 7)}/7</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/90">Consistency</span>
            <span className="text-2xl font-bold">
              {weeklyAverage >= 6 ? '⭐⭐⭐' : weeklyAverage >= 4 ? '⭐⭐' : '⭐'}
            </span>
          </div>
        </div>
      </div>

      {/* Motivational Card */}
      <div className="bg-gradient-to-br from-[#F4A261] to-[#e39350] rounded-3xl p-8 text-white shadow-lg">
        <h3 className="text-xl font-bold mb-3">💡 Sleep Better Tip</h3>
        <p className="text-white/95 text-lg leading-relaxed">
          "Try wearing your mask for 30 minutes before bed while reading or watching TV. 
          This helps your body get comfortable with the therapy before sleep."
        </p>
      </div>

      {/* Quick Access Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate(`/patient/${id}/videos`)}
          className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8EEF2] hover:shadow-md transition-all text-center"
        >
          <Video className="w-8 h-8 text-[#2D9596] mx-auto mb-2" />
          <p className="text-sm font-medium text-[#0A1128]">Watch Tutorials</p>
        </button>
        <button
          onClick={() => navigate(`/patient/${id}/help`)}
          className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8EEF2] hover:shadow-md transition-all text-center"
        >
          <HelpCircle className="w-8 h-8 text-[#F4A261] mx-auto mb-2" />
          <p className="text-sm font-medium text-[#0A1128]">Get Help</p>
        </button>
      </div>

      {/* Urgent Video Modal */}
      {showUrgentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A1128]/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#E76F51]/10 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                <AlertCircle className="w-6 h-6 text-[#E76F51]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0A1128]">Priority Alert</h3>
                <p className="text-xs text-[#E76F51] font-bold uppercase tracking-wider">Mask Leak Detected</p>
              </div>
            </div>
            
            <div className="relative w-full h-40 bg-gray-100 rounded-xl mb-6 overflow-hidden group cursor-pointer">
              <img src="https://images.unsplash.com/photo-1584515979956-d9f7e5d099f3?auto=format&fit=crop&q=80&w=400" alt="Video thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                  <Play className="w-5 h-5 text-[#E76F51] ml-1" />
                </div>
              </div>
            </div>
            
            <p className="text-sm text-[#5A6B7C] mb-8 leading-relaxed">
              Your care team assigned a 60-second video on adjusting your headgear to resolve recent leak events.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => navigate(`/patient/${id}/videos`)}
                className="w-full bg-[#E76F51] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#E76F51]/20 hover:bg-[#d6654b] transition-all"
              >
                Watch Now (1:00)
              </button>
              <button 
                onClick={() => setShowUrgentModal(false)}
                className="w-full bg-[#FAFAFA] text-[#5A6B7C] font-bold py-3.5 rounded-xl border border-[#E8EEF2] hover:bg-[#E8EEF2] transition-colors"
              >
                Remind Me Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}