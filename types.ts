export type DifficultyLevel = 'Any' | 'Easy' | 'Medium' | 'Hard';

export type SprinklerType = 'Any' | 'Standard Spray' | 'Residential' | 'ESFR/Storage' | 'Dry/Preaction' | 'General';

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
  FLASHCARDS = 'FLASHCARDS'
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

export interface UserProgress {
  totalQuestionsAnswered: number;
  totalCorrect: number;
  flashcardsLearned: number;
  statsByCategory: Record<string, { answered: number; correct: number }>;
}