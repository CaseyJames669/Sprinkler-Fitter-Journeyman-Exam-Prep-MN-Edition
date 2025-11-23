
import { UserProgress } from '../types';

const STORAGE_KEY = 'mn_sprinkler_progress';

const DEFAULT_PROGRESS: UserProgress = {
  totalQuestionsAnswered: 0,
  totalCorrect: 0,
  flashcardsLearned: 0,
  statsByCategory: {},
  targetExamDate: null,
  missedQuestionIds: []
};

export const loadProgress = (): UserProgress => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      
      // Migration Logic: Ensure all categories have the new fields
      if (parsed.statsByCategory) {
        Object.keys(parsed.statsByCategory).forEach(key => {
          const stat = parsed.statsByCategory[key];
          
          // Initialize streak if missing
          if (typeof stat.streak === 'undefined') {
            stat.streak = 0;
          }
          
          // Initialize masteryLevel if missing
          if (typeof stat.masteryLevel === 'undefined') {
            // Backfill calculation based on existing data
            stat.masteryLevel = stat.answered > 0 
              ? Math.round((stat.correct / stat.answered) * 100) 
              : 0;
          }
        });
      }

      // Ensure missedQuestionIds exists (migration)
      if (!parsed.missedQuestionIds) {
        parsed.missedQuestionIds = [];
      }

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