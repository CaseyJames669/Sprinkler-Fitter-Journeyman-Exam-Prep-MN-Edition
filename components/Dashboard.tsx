
import React, { useState, useMemo } from 'react';
import { QuizMode, DifficultyLevel, SprinklerType, UserProgress, Question } from '../types';
import { ExamTracker } from './ExamTracker';

interface DashboardProps {
  onStartQuiz: (mode: QuizMode, difficulty: DifficultyLevel, sprinklerType: SprinklerType, category: string, mnOnly: boolean, searchTerm: string) => void;
  onSetTargetDate: (date: string | null) => void;
  userProgress: UserProgress;
  allQuestions: Question[];
  darkMode: boolean;
}

// --- Icons ---

const FlashcardsIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const QuizIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const FastIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const MnIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const HydraulicsIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const Nfpa25Icon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// --- Card Components ---

const ActionCard = ({ title, subtitle, icon: Icon, gradientClass, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`relative overflow-hidden group text-left p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] w-full h-full flex flex-col justify-between ${gradientClass}`}
  >
    {/* Abstract Pattern Overlay */}
    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>
    
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-2xl font-bold text-white tracking-tight">{title}</h3>
        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md border border-white/10 shadow-inner transition-transform duration-300 group-hover:scale-110">
          <Icon size={28} className="text-white" />
        </div>
      </div>
      <p className="text-white/95 text-sm font-medium leading-relaxed max-w-md">{subtitle}</p>
    </div>
    
    <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-500 ease-out" />
  </button>
);

const TopicCard = ({ title, description, icon: Icon, iconColor, onClick, darkMode }: any) => (
  <button 
    onClick={onClick}
    className={`group text-left p-6 rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] relative overflow-hidden h-full flex flex-col ${
      darkMode 
        ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 hover:border-slate-600 hover:shadow-2xl hover:shadow-indigo-500/20' 
        : 'bg-white border-slate-100 hover:bg-white hover:border-slate-300 hover:shadow-xl hover:shadow-slate-300/50'
    }`}
  >
    <div className="flex items-start justify-between mb-4">
      <h4 className={`text-lg font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{title}</h4>
      <Icon className={`${iconColor} opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300`} size={22} />
    </div>
    <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>
      {description}
    </p>
  </button>
);

export const Dashboard: React.FC<DashboardProps> = ({ onStartQuiz, onSetTargetDate, userProgress, allQuestions, darkMode }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('Any');
  const [selectedSprinklerType, setSelectedSprinklerType] = useState<SprinklerType>('Any');
  const [selectedCategory, setSelectedCategory] = useState<string>('Any');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const difficulties: DifficultyLevel[] = ['Any', 'Easy', 'Medium', 'Hard'];
  const sprinklerTypes: SprinklerType[] = ['Any', 'Standard Spray', 'Residential', 'ESFR/Storage', 'Dry/Preaction', 'General'];

  const categories = useMemo(() => {
    const uniqueCats = Array.from(new Set(allQuestions.map(q => q.category))).sort();
    return ['Any', ...uniqueCats];
  }, [allQuestions]);

  const filteredCount = useMemo(() => {
    return allQuestions.filter(q => {
        if (selectedDifficulty !== 'Any' && q.difficulty !== selectedDifficulty) return false;
        
        // Handle Sprinkler Type filtering with mapping for 'General' -> 'N/A'
        if (selectedSprinklerType !== 'Any') {
             if (selectedSprinklerType === 'General') {
                 // The dataset uses "N/A" for general questions, or sometimes empty/null
                 if (q.sprinklerType !== 'General' && q.sprinklerType !== 'N/A' && q.sprinklerType) return false;
             } else {
                 if (q.sprinklerType !== selectedSprinklerType) return false;
             }
        }
        
        if (selectedCategory !== 'Any' && q.category !== selectedCategory) return false;
        
        if (searchTerm) {
             const lower = searchTerm.toLowerCase();
             return (
                 q.question.toLowerCase().includes(lower) ||
                 q.topic.toLowerCase().includes(lower) ||
                 q.category.toLowerCase().includes(lower) ||
                 q.code_text.toLowerCase().includes(lower)
             );
        }
        return true;
    }).length;
  }, [allQuestions, selectedDifficulty, selectedSprinklerType, selectedCategory, searchTerm]);

  const handleStart = (mode: QuizMode) => {
    onStartQuiz(mode, selectedDifficulty, selectedSprinklerType, selectedCategory, false, searchTerm);
  };

  // Progress Calculations
  const accuracy = userProgress.totalQuestionsAnswered > 0
    ? Math.round((userProgress.totalCorrect / userProgress.totalQuestionsAnswered) * 100)
    : 0;

  // Rank Calculation
  const ranks = [
    { name: "Apprentice", limit: 50 },
    { name: "Fitter", limit: 150 },
    { name: "Journeyman Candidate", limit: 400 },
    { name: "Journeyman", limit: 800 },
    { name: "Foreman", limit: Infinity }
  ];
  
  const currentRankObj = ranks.find(r => userProgress.totalQuestionsAnswered < r.limit) || ranks[ranks.length - 1];
  const nextRankObj = ranks[ranks.indexOf(currentRankObj) + 1] || null;
  
  // Calculate progress to next rank
  const prevLimit = ranks[ranks.indexOf(currentRankObj) - 1]?.limit || 0;
  const rankProgressTotal = (nextRankObj?.limit || userProgress.totalQuestionsAnswered) - prevLimit;
  const rankProgressCurrent = userProgress.totalQuestionsAnswered - prevLimit;
  const rankPercentage = nextRankObj ? Math.min(100, Math.max(0, (rankProgressCurrent / rankProgressTotal) * 100)) : 100;

  const rank = currentRankObj.name;
  const level = Math.floor(userProgress.totalQuestionsAnswered / 25) + 1;

  // Circular Progress Logic (r=28, C ~ 175.9)
  const circleRadius = 28;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (circleCircumference * accuracy) / 100;

  const missedCount = userProgress.missedQuestionIds ? userProgress.missedQuestionIds.length : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 mb-4 tracking-tight pb-1">
          Conquer the Minnesota Journeyman Exam
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Master <span className="font-semibold text-red-500">NFPA 13, 13R, 13D, 14, 20, 24, 25</span> & State Statutes with <span className="font-semibold text-slate-900 dark:text-white">{allQuestions.length}+ targeted questions</span>, an AI-driven Tutor and Study Tools.
        </p>
      </div>

      <ExamTracker 
        targetDate={userProgress.targetExamDate} 
        onSetTargetDate={onSetTargetDate}
      />

      {/* UPDATED: Exam Readiness HUD */}
      <div className="relative group mb-10">
          {/* Outer Glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl opacity-40 blur-lg group-hover:opacity-60 transition duration-1000"></div>
          
          <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl overflow-hidden">
            {/* Glass overlay */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>
            
            {/* Background Texture */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
            
            <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-800/50 pb-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                             <span className="px-2 py-1 rounded bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase tracking-widest">
                                 Current Rank
                             </span>
                             <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                Active Session
                             </div>
                        </div>
                        <div className="flex items-baseline gap-4">
                             <h3 className="text-4xl font-black text-white tracking-tight">
                                 {rank}
                             </h3>
                             <span className="text-slate-400 text-lg font-semibold">Level {level}</span>
                        </div>
                        
                        {/* XP / Rank Progress Bar */}
                        <div className="mt-4 max-w-md">
                            <div className="flex justify-between text-xs text-slate-400 mb-1 font-medium">
                                <span>Progress to {nextRankObj ? nextRankObj.name : 'Max Rank'}</span>
                                <span>{Math.round(rankPercentage)}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                <div 
                                    className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-1000 ease-out"
                                    style={{ width: `${rankPercentage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <div className="text-right">
                             <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Questions</div>
                             <div className="text-2xl font-bold text-white">{userProgress.totalQuestionsAnswered}</div>
                        </div>
                        <div className="w-px bg-slate-700 mx-2"></div>
                        <div className="text-right">
                             <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Accuracy</div>
                             <div className={`text-2xl font-bold ${accuracy >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>{accuracy}%</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {/* Accuracy Visual */}
                    <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 flex items-center gap-4 relative overflow-hidden group/item hover:bg-slate-800 transition-all">
                         <div className="relative flex-shrink-0">
                            <svg className="w-16 h-16 transform -rotate-90">
                                <circle cx="32" cy="32" r={circleRadius} stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-700" />
                                <circle cx="32" cy="32" r={circleRadius} stroke="currentColor" strokeWidth="4" fill="transparent" 
                                    className={`${accuracy > 70 ? 'text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : accuracy > 40 ? 'text-amber-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                                    strokeDasharray={circleCircumference} 
                                    strokeDashoffset={strokeDashoffset} 
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                                {accuracy}%
                            </div>
                         </div>
                         <div>
                             <div className="text-white font-bold text-sm">Exam Probability</div>
                             <div className="text-xs text-slate-400 mt-1 leading-tight">Based on your current answer streaks.</div>
                         </div>
                    </div>

                    {/* Mastery Card */}
                    <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 flex items-center gap-4 relative overflow-hidden group/item hover:bg-slate-800 transition-all">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                             </svg>
                        </div>
                        <div>
                             <div className="text-2xl font-bold text-white leading-none mb-1">{userProgress.flashcardsLearned}</div>
                             <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Concepts Mastered</div>
                        </div>
                    </div>

                    {/* Streak Card */}
                    <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 flex items-center gap-4 relative overflow-hidden group/item hover:bg-slate-800 transition-all">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                             </svg>
                        </div>
                        <div>
                             <div className="text-2xl font-bold text-white leading-none mb-1">{userProgress.totalCorrect}</div>
                             <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Correct Answers</div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
      </div>

      {/* Missed Questions Alert Section - Shows ONLY if there are missed questions */}
      {missedCount > 0 && (
        <div className="mb-10 animate-fade-in">
           <button 
             onClick={() => onStartQuiz(QuizMode.MISSED, 'Any', 'Any', 'Any', false, '')}
             className="w-full bg-gradient-to-r from-orange-500 to-red-500 p-1 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 group"
           >
              <div className="bg-white dark:bg-slate-900 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 h-full relative overflow-hidden">
                   {/* Background Pattern */}
                   <div className="absolute right-0 top-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-500/20 transition-colors"></div>
                   
                   <div className="flex items-center gap-4 relative z-10">
                      <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                      </div>
                      <div className="text-left">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Needs Review: {missedCount} Missed Questions</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">You have {missedCount} questions in your backlog. Retrying them is the best way to improve your score.</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-orange-500/30 group-hover:bg-orange-600 transition-colors">
                       Review Now
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                       </svg>
                   </div>
              </div>
           </button>
        </div>
      )}

      {/* Study Filters - Professional Bar Layout */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                    </svg>
                    Study Configuration
                </h2>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full transition-colors ${filteredCount === 0 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300'}`}>
                    {filteredCount} Questions Available
                </span>
            </div>
            
            {(selectedDifficulty !== 'Any' || selectedSprinklerType !== 'Any' || selectedCategory !== 'Any' || searchTerm !== '') && (
                 <button 
                    onClick={() => {
                        setSelectedDifficulty('Any');
                        setSelectedSprinklerType('Any');
                        setSelectedCategory('Any');
                        setSearchTerm('');
                    }}
                    className="text-xs text-red-500 hover:text-red-600 font-bold flex items-center gap-1 transition-colors"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    RESET
                 </button>
            )}
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-1">
            
            {/* Search Bar */}
            <div className="relative group md:col-span-1">
                 <label className="absolute top-2 left-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider z-10">Search</label>
                 <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Keywords..."
                    className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 pt-6 pb-2 px-3 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-colors placeholder-slate-300 dark:placeholder-slate-600"
                 />
                 <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Difficulty Select */}
            <div className="relative group">
                <label className="absolute top-2 left-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider z-10">Difficulty</label>
                <select 
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 pt-6 pb-2 px-3 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 appearance-none outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer border-none"
                >
                    {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
            </div>

            {/* System Type Select */}
            <div className="relative group">
                <label className="absolute top-2 left-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider z-10">System Type</label>
                 <select 
                    value={selectedSprinklerType}
                    onChange={(e) => setSelectedSprinklerType(e.target.value as SprinklerType)}
                    className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 pt-6 pb-2 px-3 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 appearance-none outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer border-none"
                >
                    {sprinklerTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                 <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
            </div>

            {/* Category Select */}
            <div className="relative group">
                <label className="absolute top-2 left-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider z-10">Category</label>
                 <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 pt-6 pb-2 px-3 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 appearance-none outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer border-none"
                >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                 <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
            </div>
        </div>
      </div>

      {/* Row 1: Primary Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ActionCard
          title="Fast 10"
          subtitle="A rapid-fire set of 10 random questions. Perfect for quick breaks."
          icon={FastIcon}
          gradientClass="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600"
          onClick={() => handleStart(QuizMode.FAST_10)}
        />
        <ActionCard
          title="Flashcard Mode"
          subtitle="Untimed study. Review questions at your own pace. Mark cards as 'Learned' or 'Review'."
          icon={FlashcardsIcon}
          gradientClass="bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600"
          onClick={() => handleStart(QuizMode.FLASHCARDS)}
        />
        <ActionCard
          title="Comprehensive Quiz"
          subtitle="Randomized questions covering all topics including Safety, Hydraulics, and Installation."
          icon={QuizIcon}
          gradientClass="bg-gradient-to-br from-rose-500 via-red-500 to-orange-600"
          onClick={() => handleStart(QuizMode.ALL)}
        />
      </div>

      {/* Row 2: Secondary Topics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TopicCard
          title="MN Amendments"
          description="Focus strictly on MN Statutes Chapter 299M, Rules 7512, and state fire code amendments."
          icon={MnIcon}
          iconColor="text-blue-500"
          onClick={() => handleStart(QuizMode.MN_ONLY)}
          darkMode={darkMode}
        />
        <TopicCard
          title="Hydraulics & Math"
          description="Friction loss, C-factors, and head pressure calculations."
          icon={HydraulicsIcon}
          iconColor="text-amber-500"
          onClick={() => handleStart(QuizMode.HYDRAULICS)}
          darkMode={darkMode}
        />
        <TopicCard
          title="ITM (NFPA 25)"
          description="Inspection, Testing, and Maintenance frequencies and procedures."
          icon={Nfpa25Icon}
          iconColor="text-emerald-500"
          onClick={() => handleStart(QuizMode.NFPA25)}
          darkMode={darkMode}
        />
      </div>
    </div>
  );
};
