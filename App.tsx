
import React, { useState, useEffect } from 'react';
import { QuizMode, Question, QuizState, DifficultyLevel, SprinklerType, UserProgress, CategoryStats } from './types';
import { Dashboard } from './components/Dashboard';
import { QuizCard } from './components/QuizCard';
import { Flashcard } from './components/Flashcard';
import { AITutor } from './components/AITutor';
import { loadProgress, saveProgress } from './services/storageService';

// Utility for Fisher-Yates shuffle
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const App: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'quiz' | 'flashcards'>('dashboard');
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [isTutorLoading, setIsTutorLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<QuizMode>(QuizMode.ALL);
  const [userProgress, setUserProgress] = useState<UserProgress>(loadProgress());
  
  // Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      if (saved) return JSON.parse(saved);
      // Default to true (Dark Mode)
      return true;
    }
    return true;
  });

  // Data State
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Quiz State
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    currentIndex: 0,
    score: 0,
    showAnswer: false,
    selectedOption: null,
    isFinished: false,
    shuffledOptions: [],
  });

  // Flashcard State
  const [flashcardQueue, setFlashcardQueue] = useState<Question[]>([]);
  const [learnedCount, setLearnedCount] = useState(0);

  // Dark Mode Effect
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    // Load questions asynchronously
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/all_questions.json');
        if (!response.ok) throw new Error('Failed to load questions');
        const data = await response.json();
        setAllQuestions(data);
      } catch (error) {
        console.error("Error loading question bank:", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchQuestions();
  }, []);

  const updateQuizProgress = (isCorrect: boolean, question: Question) => {
    setUserProgress(prev => {
      const newStats = { ...prev.statsByCategory };
      const category = question.category;
      
      // Retrieve existing stats or default, ensure fields exist for backward compatibility if loaded raw
      const prevCatStats = newStats[category] || { answered: 0, correct: 0, streak: 0, masteryLevel: 0 };
      
      const currentStreak = prevCatStats.streak || 0;
      const newStreak = isCorrect ? currentStreak + 1 : 0;
      const newAnswered = (prevCatStats.answered || 0) + 1;
      const newCorrect = (prevCatStats.correct || 0) + (isCorrect ? 1 : 0);
      
      // Calculate Mastery: Currently just accuracy percentage, could be weighted later
      const newMastery = newAnswered > 0 ? Math.round((newCorrect / newAnswered) * 100) : 0;

      const updatedCatStats: CategoryStats = {
        answered: newAnswered,
        correct: newCorrect,
        streak: newStreak,
        masteryLevel: newMastery,
        lastAnsweredDate: new Date().toISOString()
      };

      newStats[category] = updatedCatStats;

      // Handle Missed Questions List
      let newMissedIds = [...(prev.missedQuestionIds || [])];
      if (!isCorrect) {
        // Add to missed list if not already there
        if (!newMissedIds.includes(question.id)) {
          newMissedIds.push(question.id);
        }
      } else {
        // Remove from missed list if correct
        newMissedIds = newMissedIds.filter(id => id !== question.id);
      }

      const newProgress = {
        ...prev,
        totalQuestionsAnswered: prev.totalQuestionsAnswered + 1,
        totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0),
        statsByCategory: newStats,
        missedQuestionIds: newMissedIds
      };
      saveProgress(newProgress);
      return newProgress;
    });
  };

  const updateFlashcardProgress = () => {
      setUserProgress(prev => {
          const newProgress = {
              ...prev,
              flashcardsLearned: prev.flashcardsLearned + 1
          };
          saveProgress(newProgress);
          return newProgress;
      });
  };

  const handleSetTargetExamDate = (date: string | null) => {
    setUserProgress(prev => {
        const newProgress = { ...prev, targetExamDate: date };
        saveProgress(newProgress);
        return newProgress;
    });
  };

  const filterQuestions = (mode: QuizMode, difficulty: DifficultyLevel, sprinklerType: SprinklerType, category: string, mnOnly: boolean, searchTerm: string): Question[] => {
    let filtered: Question[] = [];

    // Filter by Mode
    switch (mode) {
      case QuizMode.MN_ONLY:
        filtered = allQuestions.filter(q => q.is_mn_amendment || q.category.includes('MN'));
        break;
      case QuizMode.HYDRAULICS:
        filtered = allQuestions.filter(q => q.category.includes('Hydraulics') || q.category.includes('Math') || q.topic.includes('Calculations'));
        break;
      case QuizMode.NFPA25:
        filtered = allQuestions.filter(q => q.category.includes('NFPA 25') || q.topic.includes('ITM'));
        break;
      case QuizMode.FAST_10:
        // Start with all questions for Fast 10, filters below will still apply if set by user
        filtered = allQuestions;
        break;
      case QuizMode.MISSED:
        filtered = allQuestions.filter(q => userProgress.missedQuestionIds.includes(q.id));
        break;
      default:
        filtered = allQuestions;
    }

    // Filter by Difficulty
    if (difficulty !== 'Any') {
      filtered = filtered.filter(q => q.difficulty === difficulty);
    }

    // Filter by Sprinkler Type
    if (sprinklerType !== 'Any') {
      filtered = filtered.filter(q => q.sprinklerType === sprinklerType);
    }

    // Filter by Category
    if (category !== 'Any') {
      filtered = filtered.filter(q => q.category === category);
    }

    // Filter by MN Only Flag
    if (mnOnly) {
      filtered = filtered.filter(q => q.is_mn_amendment || q.category.includes('MN'));
    }

    // Filter by Search Term
    if (searchTerm && searchTerm.trim() !== '') {
        const lower = searchTerm.toLowerCase().trim();
        filtered = filtered.filter(q => 
            q.question.toLowerCase().includes(lower) || 
            q.topic.toLowerCase().includes(lower) ||
            q.category.toLowerCase().includes(lower) ||
            q.code_text.toLowerCase().includes(lower)
        );
    }

    return filtered;
  };

  const startQuiz = (mode: QuizMode, difficulty: DifficultyLevel, sprinklerType: SprinklerType, category: string, mnOnly: boolean, searchTerm: string = "") => {
    let filtered = filterQuestions(mode, difficulty, sprinklerType, category, mnOnly, searchTerm);
    setActiveMode(mode);

    // Fallback if no questions match filters
    if (filtered.length === 0) {
      if (mode === QuizMode.MISSED) {
         alert("Great job! You have no missed questions to review.");
      } else {
         alert(`No questions found matching your criteria. Try adjusting your search or filters.`);
      }
      return; // Do not start empty quiz
    }

    // Shuffle questions
    filtered = shuffleArray(filtered);

    if (mode === QuizMode.FAST_10) {
      filtered = filtered.slice(0, 10);
    }

    if (mode === QuizMode.FLASHCARDS) {
        setFlashcardQueue(filtered);
        setLearnedCount(0);
        setView('flashcards');
        return;
    }

    // Prep first question options for Quiz Mode
    const firstQ = filtered[0];
    const options = firstQ ? shuffleArray([...firstQ.distractors, firstQ.answer]) : [];

    setQuizState({
      questions: filtered,
      currentIndex: 0,
      score: 0,
      showAnswer: false,
      selectedOption: null,
      isFinished: false,
      shuffledOptions: options,
    });
    
    setView('quiz');
  };

  const handleTutorOpen = () => {
    setIsTutorLoading(true);
    // Simulate connection delay for better UX
    setTimeout(() => {
      setIsTutorOpen(true);
      setIsTutorLoading(false);
    }, 1200);
  };

  // --- Quiz Logic ---

  const handleOptionSelect = (option: string) => {
    const currentQ = quizState.questions[quizState.currentIndex];
    const isCorrect = option === currentQ.answer;

    // Update component state
    setQuizState(prev => ({
      ...prev,
      selectedOption: option,
      showAnswer: true,
      score: isCorrect ? prev.score + 1 : prev.score
    }));

    // Update global progress
    updateQuizProgress(isCorrect, currentQ);
  };

  const handleNextQuestion = () => {
    const nextIndex = quizState.currentIndex + 1;
    
    if (nextIndex >= quizState.questions.length) {
      setQuizState(prev => ({ ...prev, isFinished: true }));
      return;
    }

    const nextQ = quizState.questions[nextIndex];
    const options = shuffleArray([...nextQ.distractors, nextQ.answer]);

    setQuizState(prev => ({
      ...prev,
      currentIndex: nextIndex,
      showAnswer: false,
      selectedOption: null,
      shuffledOptions: options
    }));
  };

  // --- Flashcard Logic ---

  const handleFlashcardResult = (result: 'learned' | 'review') => {
      const currentCard = flashcardQueue[0];
      const remaining = flashcardQueue.slice(1);

      if (result === 'learned') {
          // Remove from deck
          setFlashcardQueue(remaining);
          setLearnedCount(prev => prev + 1);
          updateFlashcardProgress(); // Persist
      } else {
          // Move to end of deck
          setFlashcardQueue([...remaining, currentCard]);
      }
  };

  // Determine current question for AI Tutor
  const currentQuestionForTutor = view === 'quiz' 
    ? quizState.questions[quizState.currentIndex]
    : flashcardQueue[0];
  
  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="text-slate-600 dark:text-slate-300 font-semibold">Loading Exam Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-inter">
      {/* Header */}
      <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setView('dashboard')}>
            <div className={`w-8 h-8 rounded-lg shadow-lg flex items-center justify-center text-white font-bold transition-transform group-hover:scale-110 ${view === 'flashcards' ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'bg-gradient-to-br from-red-500 to-orange-600'}`}>
              MN
            </div>
            <span className="font-bold text-red-600 dark:text-red-500 hidden sm:block tracking-tight">Journeyman Exam Prep</span>
          </div>
          
          <div className="flex items-center gap-4">
             {view === 'quiz' && (
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                Q: {quizState.currentIndex + 1} / {quizState.questions.length}
              </div>
            )}
            
            {view === 'flashcards' && (
               <div className="text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                   Learned: {learnedCount}
               </div>
            )}

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow">
        {view === 'dashboard' ? (
            <Dashboard 
                onStartQuiz={startQuiz} 
                onSetTargetDate={handleSetTargetExamDate}
                userProgress={userProgress}
                allQuestions={allQuestions}
                darkMode={darkMode}
            />
        ) : (
            <div className="container mx-auto px-4 py-8">
            
            {/* QUIZ VIEW */}
            {view === 'quiz' && (
                quizState.isFinished ? (
                    <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl shadow-xl p-8 text-center animate-fade-in">
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Quiz Complete!</h2>
                    <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-2">
                        {quizState.questions.length > 0 
                        ? Math.round((quizState.score / quizState.questions.length) * 100) 
                        : 0}%
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-8">
                        You got <span className="text-slate-900 dark:text-white font-bold">{quizState.score}</span> out of {quizState.questions.length} questions correct.
                    </p>
                    <button 
                        onClick={() => setView('dashboard')}
                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-500/20"
                    >
                        Back to Dashboard
                    </button>
                    </div>
                ) : (
                    quizState.questions[quizState.currentIndex] && (
                        <QuizCard 
                        question={quizState.questions[quizState.currentIndex]}
                        shuffledOptions={quizState.shuffledOptions}
                        selectedOption={quizState.selectedOption}
                        showAnswer={quizState.showAnswer}
                        isAiLoading={isTutorLoading}
                        onOptionSelect={handleOptionSelect}
                        onNext={handleNextQuestion}
                        onExplain={handleTutorOpen}
                        />
                    )
                )
            )}

            {/* FLASHCARD VIEW */}
            {view === 'flashcards' && (
                flashcardQueue.length === 0 ? (
                    <div className="max-w-md mx-auto bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl shadow-xl p-8 text-center animate-fade-in">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Stack Cleared!</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-8">
                        You've reviewed all cards in this set. Great job!
                        </p>
                        <button 
                        onClick={() => setView('dashboard')}
                        className="w-full py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors shadow-lg shadow-violet-500/20"
                        >
                        Back to Dashboard
                        </button>
                    </div>
                ) : (
                    <Flashcard 
                        question={flashcardQueue[0]}
                        remainingCount={flashcardQueue.length}
                        isAiLoading={isTutorLoading}
                        onResult={handleFlashcardResult}
                        onExplain={handleTutorOpen}
                    />
                )
            )}

            {/* SHARED AI TUTOR */}
            {currentQuestionForTutor && (
                <AITutor 
                    currentQuestion={currentQuestionForTutor}
                    isOpen={isTutorOpen}
                    onClose={() => setIsTutorOpen(false)}
                />
            )}
            </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 mt-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center justify-center">
            <p className="text-slate-500 text-sm font-medium">
                © 2025 Sprinkler Fitter Exam Prep. Built for Minnesota Journeyman Candidates.
            </p>
        </div>
      </footer>
    </div>
  );
};

export default App;