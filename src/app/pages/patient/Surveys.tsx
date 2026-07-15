import { useParams } from 'react-router';
import { FileText, Clock, CheckCircle, ChevronRight, ChevronLeft, Signal, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useApi, clearApiCache } from '../../hooks/useApi';
import { fetchSurveys, submitSurveyResponse, SurveyResponse } from '../../data/api';

const surveyQuestions = [
  {
    id: 1,
    question: "How many nights this week did you use your CPAP therapy?",
    type: "number",
    options: ["0-2 nights", "3-4 nights", "5-6 nights", "Every night (7)"],
  },
  {
    id: 2,
    question: "How comfortable is your mask?",
    type: "choice",
    options: ["Very uncomfortable", "Somewhat uncomfortable", "Neutral", "Comfortable", "Very comfortable"],
  },
  {
    id: 3,
    question: "Do you wake up feeling rested?",
    type: "choice",
    options: ["Never", "Rarely", "Sometimes", "Often", "Always"],
  },
  {
    id: 4,
    question: "Have you experienced any mask leaks?",
    type: "yesno",
    options: ["No leaks", "Minor leaks", "Moderate leaks", "Significant leaks"],
  },
  {
    id: 5,
    question: "How is your energy level during the day?",
    type: "choice",
    options: ["Very low", "Low", "Moderate", "Good", "Excellent"],
  },
  {
    id: 6,
    question: "Are you experiencing any side effects?",
    type: "multiple",
    options: ["Dry nose/mouth", "Skin irritation", "Bloating", "Difficulty breathing", "None"],
  },
  {
    id: 7,
    question: "How easy is it to fall asleep with your CPAP?",
    type: "choice",
    options: ["Very difficult", "Difficult", "Neutral", "Easy", "Very easy"],
  },
  {
    id: 8,
    question: "Do you have any concerns you'd like to discuss?",
    type: "text",
    placeholder: "Share any questions or concerns (optional)",
  },
];

export default function PatientSurveys() {
  const { id } = useParams();
  const { data: liveSurveys, isLoading, error } = useApi<SurveyResponse>(() => fetchSurveys(id || '1'), {
    dependencies: [id],
    cacheKey: `surveys-${id || '1'}`
  });

  const isLive = !!(liveSurveys && (liveSurveys as any).__isLive);
  const nextSurvey = liveSurveys?.patient?.next || { 
    name: 'Health Survey', 
    dueDate: new Date().toISOString(), 
    questions: 8, 
    persistence: { status: 'Pending' } 
  };
  const history = Array.isArray(liveSurveys?.patient?.history) ? liveSurveys.patient.history : [];

  const [inSurvey, setInSurvey] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [showCompletion, setShowCompletion] = useState(false);

  const handleAnswer = (value: any) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const handleNext = () => {
    if (currentQuestion < surveyQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Survey complete
      const submit = async () => {
        try {
          const payload = {
            answers: Object.entries(answers).map(([idx, val]) => ({
              question_id: surveyQuestions[parseInt(idx)].id.toString(),
              value: val
            }))
          };
          await submitSurveyResponse(id || '1', 'health-survey', payload);
          clearApiCache(`surveys-${id || '1'}`);
        } catch (err) {
          console.error('Failed to submit survey');
        }
      };
      submit();
      setShowCompletion(true);
      setTimeout(() => {
        setInSurvey(false);
        setShowCompletion(false);
        setCurrentQuestion(0);
        setAnswers({});
      }, 3000);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const currentQ = surveyQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / surveyQuestions.length) * 100;

  if (showCompletion) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-6 max-w-2xl mx-auto pb-32">
        <div className="text-center w-full">
          <div className="w-24 h-24 bg-gradient-to-br from-[#6A994E] to-[#2D9596] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-[#0A1128] mb-4">All Done! 🎉</h2>
          <p className="text-lg text-[#5A6B7C] mb-6">
            Thank you for completing your check-in. Your care team has been notified.
          </p>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-[#5A6B7C]">
              We'll review your responses and reach out if we have any suggestions to improve your therapy.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (inSurvey) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex flex-col p-6 max-w-2xl mx-auto pb-32">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#5A6B7C]">Question {currentQuestion + 1} of {surveyQuestions.length}</span>
            <span className="text-sm font-medium text-[#2D9596]">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-[#E8EEF2] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#6A994E] to-[#2D9596] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
          <div className="bg-white rounded-3xl p-8 shadow-lg mb-6 flex-1 flex flex-col justify-center">
            <h2 className="text-2xl text-[#0A1128] mb-8 leading-relaxed">
              {currentQ.question}
            </h2>

            <div className="space-y-3">
              {currentQ.type === 'text' ? (
                <textarea
                  value={answers[currentQuestion] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder={currentQ.placeholder}
                  rows={6}
                  className="w-full px-6 py-4 border-2 border-[#E8EEF2] rounded-2xl focus:outline-none focus:border-[#2D9596] text-lg resize-none"
                />
              ) : (
                currentQ.options?.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className={`w-full p-6 rounded-2xl border-2 transition-all text-left text-lg ${
                      answers[currentQuestion] === option
                        ? 'border-[#2D9596] bg-[#2D9596]/5 shadow-md'
                        : 'border-[#E8EEF2] hover:border-[#2D9596]/50 hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        answers[currentQuestion] === option
                          ? 'border-[#2D9596] bg-[#2D9596]'
                          : 'border-[#5A6B7C]'
                      }`}>
                        {answers[currentQuestion] === option && (
                          <div className="w-3 h-3 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="text-[#0A1128]">{option}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            {currentQuestion > 0 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-4 bg-white border-2 border-[#E8EEF2] text-[#5A6B7C] rounded-2xl hover:border-[#2D9596] hover:text-[#2D9596] transition-all font-medium"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!answers[currentQuestion] && currentQ.type !== 'text'}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#6A994E] to-[#2D9596] text-white rounded-2xl hover:shadow-lg transition-all font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestion < surveyQuestions.length - 1 ? 'Next' : 'Complete'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto pb-32">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-sm font-bold text-[#414D5B] uppercase tracking-widest">Medical Check-ins</h2>
        {isLive && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#6A994E]/10 border border-[#6A994E]/20 rounded-md">
            <Signal className="w-3 h-3 text-[#6A994E]" />
            <span className="text-[10px] font-bold text-[#6A994E] uppercase tracking-wider">Live</span>
          </div>
        )}
      </div>

      {/* Next Check-In */}
      <div className="bg-gradient-to-br from-[#6A994E] to-[#4a7a35] rounded-3xl p-8 text-white shadow-lg">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="text-white/90 text-sm mb-1">Ready for you</p>
            <p className="text-xl font-semibold mb-3">{nextSurvey.name}</p>
            <div className="flex items-center gap-4 text-sm text-white/90">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Due {new Date(nextSurvey.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>{nextSurvey.questions} questions</span>
              </div>
            </div>

            {/* Persistence Timeline */}
            <div className="mt-6 pt-6 border-t border-white/10">
               <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-3">Survey Adherence Timeline</p>
               <div className="flex items-center justify-between relative px-2">
                  <div className="absolute left-4 right-4 h-0.5 bg-white/20 top-[11px] z-0" />
                  {[
                    { label: 'Invited', date: 'May 1', status: 'done' },
                    { label: 'Reminder 1', date: 'May 5', status: 'active' },
                    { label: 'Final SMS', date: 'May 8', status: 'pending' },
                  ].map((step, idx) => (
                    <div key={idx} className="relative z-10 flex flex-col items-center">
                       <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                         step.status === 'done' ? 'bg-white border-white text-[#6A994E]' :
                         step.status === 'active' ? 'bg-[#F4A261] border-[#F4A261] text-white animate-pulse' :
                         'bg-[#6A994E] border-white/30 text-white/30'
                       }`}>
                          {step.status === 'done' ? <CheckCircle className="w-3.5 h-3.5" /> : <span className="text-[10px] font-bold">{idx + 1}</span>}
                       </div>
                       <span className="text-[10px] mt-1.5 font-bold uppercase tracking-tighter opacity-80">{step.label}</span>
                       <span className="text-[8px] opacity-40">{step.date}</span>
                    </div>
                  ))}
               </div>
               <p className="text-[10px] text-center mt-4 bg-black/20 py-1 rounded-full text-white/80 font-medium italic">
                  Current Status: {nextSurvey.persistence.status}
               </p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setInSurvey(true)}
          className="w-full bg-white text-[#6A994E] px-6 py-4 rounded-xl hover:bg-white/90 transition-colors font-semibold text-lg shadow-md"
        >
          Start Check-In (5 min)
        </button>
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E8EEF2]">
        <h3 className="text-lg text-[#0A1128] mb-4">Completed Check-Ins</h3>
        <div className="space-y-3">
          {history.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-3 pb-3 border-b border-[#E8EEF2] last:border-0">
              <CheckCircle className="w-5 h-5 text-[#6A994E] flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[#0A1128] font-medium text-sm">{item.name}</p>
                <p className="text-xs text-[#5A6B7C]">
                  {new Date(item.completed).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[#6A994E] bg-[#6A994E]/10 px-2 py-1 rounded">Score: {item.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}