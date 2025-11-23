import React, { useState, useEffect } from 'react';
import { Question } from '../types';

interface FlashcardProps {
  question: Question;
  remainingCount: number;
  isAiLoading?: boolean;
  onResult: (result: 'learned' | 'review') => void;
  onExplain: () => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({
  question,
  remainingCount,
  isAiLoading = false,
  onResult,
  onExplain
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when question changes
  useEffect(() => {
    setIsFlipped(false);
  }, [question.id]);

  return (
    <div className="max-w-xl mx-auto w-full perspective-1000">

      {/* Progress Indicator */}
      <div className="mb-4 flex justify-between items-center text-sm font-medium text-gray-500 dark:text-gray-400">
        <span>Cards in stack: {remainingCount}</span>
        <button
          onClick={onExplain}
          disabled={isAiLoading}
          className={`text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1 transition-colors ${isAiLoading ? 'opacity-50 cursor-wait' : ''}`}
        >
          {isAiLoading ? (
            <svg className="animate-spin h-4 w-4 text-purple-600 dark:text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {isAiLoading ? 'Connecting...' : 'Ask AI Tutor'}
        </button>
      </div>

      <div className="relative h-[450px] w-full" style={{ perspective: '1000px' }}>
        <div
          className={`relative w-full h-full transition-transform duration-500 transform-style-3d shadow-2xl rounded-2xl ${isFlipped ? 'rotate-y-180' : ''}`}
          style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >

          {/* FRONT OF CARD */}
          <div
            className="absolute inset-0 w-full h-full bg-white dark:bg-gray-800 rounded-2xl p-8 flex flex-col items-center justify-center backface-hidden border-t-4 border-indigo-500 transition-colors duration-200"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            <div className="absolute top-6 left-6">
              <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold rounded-full uppercase tracking-wide">
                {question.category}
              </span>
            </div>

            <h3 className="text-2xl font-bold text-gray-800 dark:text-white text-center leading-relaxed">
              {question.question}
            </h3>

            <p className="text-gray-400 dark:text-gray-500 mt-6 text-sm italic">Tap to flip</p>

            <button
              onClick={() => setIsFlipped(true)}
              className="absolute bottom-0 w-full p-4 bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 font-semibold rounded-b-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Show Answer
            </button>
          </div>

          {/* BACK OF CARD */}
          <div
            className="absolute inset-0 w-full h-full bg-indigo-50 dark:bg-gray-800 rounded-2xl p-8 flex flex-col justify-between backface-hidden rotate-y-180 border-t-4 border-indigo-600 transition-colors duration-200"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="overflow-y-auto flex-1 pr-2">
              <div className="mb-6">
                <h4 className="text-sm uppercase tracking-wider text-indigo-400 dark:text-indigo-300 font-bold mb-2">Answer</h4>
                <p className="text-xl font-bold text-indigo-900 dark:text-indigo-100 leading-snug">{question.answer}</p>
              </div>

              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-indigo-100 dark:border-gray-600">
                  <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Code Reference</h5>
                  <p className="text-sm font-mono text-gray-700 dark:text-gray-200">{question.citation}</p>
                  <p className="text-sm italic text-gray-600 dark:text-gray-300 mt-1">"{question.code_text}"</p>
                </div>

                {question.mnemonic && (
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                    <p className="text-sm text-purple-800 dark:text-purple-200 font-medium">💡 {question.mnemonic}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t border-indigo-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setIsFlipped(false); // Reset for animation smoothness
                  setTimeout(() => onResult('review'), 150);
                }}
                className="flex-1 py-3 px-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg font-bold transition-colors text-sm"
              >
                Build Confidence
                <span className="block text-xs font-normal opacity-75">(Keep in stack)</span>
              </button>
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setTimeout(() => onResult('learned'), 150);
                }}
                className="flex-1 py-3 px-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition-colors text-sm shadow-md"
              >
                Mark Learned
                <span className="block text-xs font-normal opacity-90">(Remove from stack)</span>
              </button>
            </div>
          </div>

        </div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-6">
        "Learned" removes the card. "Build Confidence" shuffles it back in.
      </p>
    </div>
  );
};