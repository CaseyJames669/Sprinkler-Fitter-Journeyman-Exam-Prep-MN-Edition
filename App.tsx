import React, { useState, useEffect } from 'react';
import { QuizMode, Question, QuizState, DifficultyLevel, SprinklerType, UserProgress } from './types';
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
  const [activeMode, setActiveMode] = useState<QuizMode>(QuizMode.ALL);
  const [userProgress, setUserProgress] = useState<UserProgress>(loadProgress());
  
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

  useEffect(() => {
    // Load questions asynchronously to avoid large bundle size and syntax errors in constants.ts
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

  const updateQuizProgress = (isCorrect: boolean, category: string) => {
    setUserProgress(prev => {
      const newStats = { ...prev.statsByCategory };
      if (!newStats[category]) {
        newStats[category] = { answered: 0, correct: 0 };
      }
      newStats[category].answered += 1;
      if (isCorrect) newStats[category].correct += 1;

      const newProgress = {
        ...prev,
        totalQuestionsAnswered: prev.totalQuestionsAnswered + 1,
        totalCorrect: prev.totalCorrect + (isCorrect ? 1 : 0),
        statsByCategory: newStats
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

  const filterQuestions = (mode: QuizMode, difficulty: DifficultyLevel, sprinklerType: SprinklerType, category: string, mnOnly: boolean): Question[] => {
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

    return filtered;
  };

  const startQuiz = (mode: QuizMode, difficulty: DifficultyLevel, sprinklerType: SprinklerType, category: string, mnOnly: boolean) => {
    let filtered = filterQuestions(mode, difficulty, sprinklerType, category, mnOnly);
    setActiveMode(mode);

    // Fallback if no questions match filters
    if (filtered.length === 0) {
      alert(`No questions found matching your criteria. Loading all questions for this selection instead.`);
      // If specific filters yielded 0 results, try relaxing them
      if (mnOnly) {
         filtered = filterQuestions(mode, 'Any', 'Any', 'Any', true);
      } else {
         filtered = filterQuestions(mode, 'Any', 'Any', 'Any', false);
      }
    }

    // Shuffle questions
    filtered = shuffleArray(filtered);

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
    updateQuizProgress(isCorrect, currentQ.category);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="text-gray-600 font-semibold">Loading Exam Database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('dashboard')}>
            <div className={`w-8 h-8 rounded flex items-center justify-center text-white font-bold ${view === 'flashcards' ? 'bg-purple-600' : 'bg-red-600'}`}>
              MN
            </div>
            <span className="font-semibold text-gray-800 hidden sm:block">Sprinkler Fitter Journeyman Exam Prep</span>
          </div>
          
          {view === 'quiz' && (
            <div className="text-sm font-medium text-gray-600">
              Q: {quizState.currentIndex + 1} / {quizState.questions.length}
            </div>
          )}
          
          {view === 'flashcards' && (
             <div className="text-sm font-medium text-gray-600">
                 Learned in Session: {learnedCount}
             </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      {view === 'dashboard' ? (
        <Dashboard 
            onStartQuiz={startQuiz} 
            userProgress={userProgress}
            allQuestions={allQuestions}
        />
      ) : (
        <div className="container mx-auto px-4 py-8">
          
          {/* QUIZ VIEW */}
          {view === 'quiz' && (
             quizState.isFinished ? (
                <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center animate-fade-in">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Quiz Complete!</h2>
                  <div className="text-6xl font-black text-red-600 mb-2">
                    {quizState.questions.length > 0 
                      ? Math.round((quizState.score / quizState.questions.length) * 100) 
                      : 0}%
                  </div>
                  <p className="text-gray-600 mb-8">
                    You got {quizState.score} out of {quizState.questions.length} questions correct.
                  </p>
                  <button 
                    onClick={() => setView('dashboard')}
                    className="w-full py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900"
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
                      onOptionSelect={handleOptionSelect}
                      onNext={handleNextQuestion}
                      onExplain={() => setIsTutorOpen(true)}
                    />
                )
              )
          )}

          {/* FLASHCARD VIEW */}
          {view === 'flashcards' && (
              flashcardQueue.length === 0 ? (
                <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center animate-fade-in">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Stack Cleared!</h2>
                    <p className="text-gray-600 mb-8">
                      You've reviewed all cards in this set. Great job!
                    </p>
                    <button 
                      onClick={() => setView('dashboard')}
                      className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
                    >
                      Back to Dashboard
                    </button>
                </div>
              ) : (
                  <Flashcard 
                    question={flashcardQueue[0]}
                    remainingCount={flashcardQueue.length}
                    onResult={handleFlashcardResult}
                    onExplain={() => setIsTutorOpen(true)}
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
    </div>
  );
};

export default App;
