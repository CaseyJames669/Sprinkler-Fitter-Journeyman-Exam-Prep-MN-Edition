
export type DifficultyLevel = 'Any' | 'Easy' | 'Medium' | 'Hard';

export type SprinklerType = 'Any' | 'Standard Spray' | 'Residential' | 'ESFR/Storage' | 'Dry/Preaction' | 'General' | 'N/A';

export interface Question {
  id: number;
  category: string;
  topic: string;
  question: string;
  answer: string;
  distractors: string[];
  citation: string;
  code_text: string;
  is_mn_amendment?: boolean;
  mnemonic?: string;
  math_logic?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  sprinklerType: SprinklerType;
}

export enum QuizMode {
  ALL = 'ALL',
  MN_ONLY = 'MN_ONLY',
  HYDRAULICS = 'HYDRAULICS',
  NFPA25 = 'NFPA25',
  NFPA13 = 'NFPA13',
  FLASHCARDS = 'FLASHCARDS',
  FAST_10 = 'FAST_10'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface QuizState {
  questions: Question[];
  currentIndex: number;
  score: number;
  showAnswer: boolean;
  selectedOption: string | null;
  isFinished: boolean;
  shuffledOptions: string[];
}

export interface CategoryStats {
  answered: number;
  correct: number;
  streak: number;
  masteryLevel: number;
  lastAnsweredDate?: string;
}

export interface UserProgress {
  totalQuestionsAnswered: number;
  totalCorrect: number;
  flashcardsLearned: number;
  statsByCategory: Record<string, CategoryStats>;
  targetExamDate?: string | null; // ISO Date string
}

export interface ExamSchedule {
  id: string;
  date: string; // ISO Date string (YYYY-MM-DD)
  deadline: string; // ISO Date string
  location: string;
}
