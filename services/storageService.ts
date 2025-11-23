import { UserProgress } from '../types';

const STORAGE_KEY = 'mn_sprinkler_progress';

const DEFAULT_PROGRESS: UserProgress = {
  totalQuestionsAnswered: 0,
  totalCorrect: 0,
  flashcardsLearned: 0,
  statsByCategory: {}
};

export const loadProgress = (): UserProgress => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with default to ensure new fields exist if schema changes
      return { ...DEFAULT_PROGRESS, ...parsed };
    }
  } catch (e) {
    console.warn("Failed to load progress", e);
  }
  return DEFAULT_PROGRESS;
};

export const saveProgress = (progress: UserProgress) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn("Failed to save progress", e);
  }
};