import React from 'react';
import { Question } from '../types';

interface QuizCardProps {
  question: Question;
  shuffledOptions: string[];
  selectedOption: string | null;
  showAnswer: boolean;
  isAiLoading?: boolean;
  onOptionSelect: (option: string) => void;
  onNext: () => void;
  onExplain: () => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  question,
  shuffledOptions,
  selectedOption,
  showAnswer,
  isAiLoading = false,
  onOptionSelect,
  onNext,
  onExplain
}) => {

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 max-w-2xl w-full mx-auto border-t-4 border-red-600 transition-colors duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2 flex-wrap items-center">
          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full uppercase tracking-wide">
            {question.category}
          </span>
          <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${getDifficultyColor(question.difficulty)}`}>
            {question.difficulty}
          </span>
          {question.sprinklerType && question.sprinklerType !== 'General' && (
            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full uppercase tracking-wide">
              {question.sprinklerType}
            </span>
          )}
        </div>
        {question.is_mn_amendment && (
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full ml-2">
            MN Amendment
          </span>
        )}
      </div>

      <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-6 leading-snug">
        {question.question}
      </h2>

      <div className="space-y-3 mb-8">
        {shuffledOptions.map((option, idx) => {
          let btnClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 font-medium ";

          if (showAnswer) {
            if (option === question.answer) {
              btnClass += "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-300";
            } else if (option === selectedOption && option !== question.answer) {
              btnClass += "bg-red-50 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-300";
            } else {
              btnClass += "bg-gray-50 dark:bg-gray-700 border-transparent opacity-50 text-gray-500 dark:text-gray-500";
            }
          } else {
            if (selectedOption === option) {
              btnClass += "bg-red-50 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-300";
            } else {
              btnClass += "bg-gray-50 dark:bg-gray-700 border-transparent hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => !showAnswer && onOptionSelect(option)}
              disabled={showAnswer}
              className={btnClass}
            >
              {option}
            </button>
          );
        })}
      </div>

      {showAnswer && (
        <div className="animate-fade-in mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
          <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-1">Code Reference</h3>
          <p className="text-blue-800 dark:text-blue-200 text-sm mb-2 font-mono">{question.citation}</p>
          <p className="text-gray-700 dark:text-gray-300 text-sm italic">"{question.code_text}"</p>
          {question.mnemonic && (
            <p className="mt-2 text-sm text-purple-700 dark:text-purple-300 font-semibold">💡 Tip: {question.mnemonic}</p>
          )}
        </div>
      )}

      <div className="flex gap-4 border-t dark:border-gray-700 pt-6">
        <button
          onClick={onExplain}
          disabled={isAiLoading}
          className={`flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${isAiLoading ? 'opacity-75 cursor-wait' : ''}`}
        >
          {isAiLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Ask AI Tutor
            </>
          )}
        </button>

        {showAnswer && (
          <button
            onClick={onNext}
            disabled={isAiLoading} // Prevent skipping while loading
            className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            Next Question
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};