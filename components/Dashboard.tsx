import React, { useState, useMemo } from 'react';
import { QuizMode, DifficultyLevel, SprinklerType, UserProgress, Question } from '../types';

interface DashboardProps {
  onStartQuiz: (mode: QuizMode, difficulty: DifficultyLevel, sprinklerType: SprinklerType, category: string, mnOnly: boolean) => void;
  userProgress: UserProgress;
  allQuestions: Question[];
}

export const Dashboard: React.FC<DashboardProps> = ({ onStartQuiz, userProgress, allQuestions }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('Any');
  const [selectedSprinklerType, setSelectedSprinklerType] = useState<SprinklerType>('Any');
  const [selectedCategory, setSelectedCategory] = useState<string>('Any');
  const [mnOnly, setMnOnly] = useState<boolean>(false);

  const difficulties: DifficultyLevel[] = ['Any', 'Easy', 'Medium', 'Hard'];
  const sprinklerTypes: SprinklerType[] = ['Any', 'Standard Spray', 'Residential', 'ESFR/Storage', 'Dry/Preaction', 'General'];

  // Extract unique categories dynamically from the passed prop
  const categories = useMemo(() => {
    const uniqueCats = Array.from(new Set(allQuestions.map(q => q.category))).sort();
    return ['Any', ...uniqueCats];
  }, [allQuestions]);

  const handleStart = (mode: QuizMode) => {
    onStartQuiz(mode, selectedDifficulty, selectedSprinklerType, selectedCategory, mnOnly);
  };

  // Progress Calculations
  const accuracy = userProgress.totalQuestionsAnswered > 0 
    ? Math.round((userProgress.totalCorrect / userProgress.totalQuestionsAnswered) * 100) 
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Sprinkler Fitter <span className="text-red-600">Journeyman Exam Prep</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Conquer the Minnesota Journeyman Exam. Master NFPA 13, 13R, 13D, 14, 20, 24, 25 & State Statutes with {allQuestions.length}+ targeted questions and AI-driven study tools. 
        </p>
      </div>

      {/* Progress Overview Card */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 shadow-lg mb-8 text-white">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold uppercase tracking-widest text-gray-400">Your Career Progress</h2>
            <div className="text-xs bg-white/10 px-2 py-1 rounded">Auto-Saved</div>
        </div>
        <div className="grid grid-cols-3 gap-4 divide-x divide-gray-700">
            <div className="text-center">
                <div className="text-3xl font-black text-green-400">{accuracy}%</div>
                <div className="text-sm text-gray-400 mt-1">Quiz Accuracy</div>
            </div>
            <div className="text-center">
                <div className="text-3xl font-black text-white">{userProgress.totalQuestionsAnswered}</div>
                <div className="text-sm text-gray-400 mt-1">Questions Answered</div>
            </div>
            <div className="text-center">
                <div className="text-3xl font-black text-purple-400">{userProgress.flashcardsLearned}</div>
                <div className="text-sm text-gray-400 mt-1">Cards Mastered</div>
            </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-10">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Difficulty Selection */}
          <div className="flex flex-col items-center">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Difficulty</h3>
            <div className="bg-gray-100 p-1.5 rounded-xl flex gap-1 w-full justify-center">
              {difficulties.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedDifficulty(level)}
                  className={`flex-1 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 ${
                    selectedDifficulty === level
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Sprinkler Type Selection */}
          <div className="flex flex-col items-center">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">System / Sprinkler Type</h3>
            <div className="relative w-full">
              <select 
                value={selectedSprinklerType}
                onChange={(e) => setSelectedSprinklerType(e.target.value as SprinklerType)}
                className="w-full bg-gray-100 p-3 rounded-xl text-gray-700 font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer text-sm"
              >
                {sprinklerTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div className="flex flex-col items-center">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Category</h3>
            <div className="relative w-full">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-gray-100 p-3 rounded-xl text-gray-700 font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>

        {/* MN Amendments Toggle */}
        <div className="mt-6 pt-6 border-t border-gray-100 flex justify-center">
            <label className={`inline-flex items-center cursor-pointer px-5 py-3 rounded-full transition-all duration-200 border ${mnOnly ? 'bg-blue-50 border-blue-300 shadow-inner' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                <input 
                    type="checkbox" 
                    checked={mnOnly} 
                    onChange={(e) => setMnOnly(e.target.checked)} 
                    className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300" 
                />
                <span className={`ml-3 font-semibold text-sm ${mnOnly ? 'text-blue-800' : 'text-gray-600'}`}>Show MN Amendments Only</span>
                {mnOnly && (
                    <span className="ml-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Active</span>
                )}
            </label>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Flashcard Mode (New) */}
        <div 
             onClick={() => handleStart(QuizMode.FLASHCARDS)}
             className="md:col-span-2 group bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-1 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform rotate-45"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div>
              <h2 className="text-2xl font-bold">Flashcard Mode</h2>
              <span className="text-purple-200 text-sm font-semibold tracking-wider">UNTIMED STUDY</span>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <p className="opacity-90 relative z-10 max-w-lg">
            Review questions at your own pace. Mark cards as "Learned" to remove them from the deck, or "Review" to see them again later.
          </p>
        </div>

        {/* Quick Start Card */}
        <div 
            onClick={() => handleStart(QuizMode.ALL)}
            className="group bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Comprehensive Quiz</h2>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 opacity-80 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <p className="opacity-90">Randomized questions covering all topics including Safety, Hydraulics, and Installation.</p>
        </div>

        {/* MN Specific */}
        <div 
             onClick={() => handleStart(QuizMode.MN_ONLY)}
             className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl border-2 border-blue-500 hover:border-blue-600 transition-all cursor-pointer transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 group-hover:text-blue-600">MN Amendments</h2>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-gray-600">Focus strictly on MN Statutes Chapter 299M, Rules 7512, and state fire code amendments.</p>
        </div>

        {/* Hydraulics */}
        <div 
             onClick={() => handleStart(QuizMode.HYDRAULICS)}
             className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl border border-gray-200 transition-all cursor-pointer transform hover:-translate-y-1"
        >
           <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Hydraulics & Math</h2>
            <div className="p-2 bg-yellow-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            </div>
          </div>
          <p className="text-gray-600 text-sm">Friction loss, C-factors, and head pressure calculations.</p>
        </div>

        {/* NFPA 25 */}
        <div 
             onClick={() => handleStart(QuizMode.NFPA25)}
             className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl border border-gray-200 transition-all cursor-pointer transform hover:-translate-y-1"
        >
           <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">ITM (NFPA 25)</h2>
            <div className="p-2 bg-green-100 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
          </div>
          <p className="text-gray-600 text-sm">Inspection, Testing, and Maintenance frequencies and procedures.</p>
        </div>
      </div>
    </div>
  );
};
