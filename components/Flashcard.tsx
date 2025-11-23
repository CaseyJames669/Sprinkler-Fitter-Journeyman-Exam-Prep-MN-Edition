
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
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Reset flip state and cancel speech when question changes
  useEffect(() => {
    setIsFlipped(false);
    cancelSpeech();
    return () => cancelSpeech();
  }, [question.id]);

  const cancelSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const speakText = (text: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip
    if (isSpeaking) {
      cancelSpeech();
      return;
    }

    cancelSpeech(); // Ensure clean slate
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    utterance.rate = 0.95; 

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSpeakFront = (e: React.MouseEvent) => {
    speakText(question.question, e);
  };

  const handleSpeakBack = (e: React.MouseEvent) => {
    const text = `The answer is ${question.answer}. Reference: ${question.code_text}`;
    speakText(text, e);
  };

  return (
    <div className="max-w-xl mx-auto w-full perspective-1000">

      {/* Progress Indicator */}
      <div className="mb-4 flex justify-between items-center text-sm font-medium text-slate-500 dark:text-slate-400">
        <span className="bg-slate-200 dark:bg-slate-800 px-3 py-1 rounded-full">Stack: {remainingCount} left</span>
        <button
          onClick={onExplain}
          disabled={isAiLoading}
          className={`text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1 transition-colors ${isAiLoading ? 'opacity-70 cursor-wait' : ''}`}
        >
          {isAiLoading ? (
            <svg className="animate-spin h-4 w-4 text-violet-600 dark:text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {isAiLoading ? <span className="animate-pulse">Connecting...</span> : 'Ask AI Tutor'}
        </button>
      </div>

      <div className="relative h-[450px] w-full" style={{ perspective: '1000px' }}>
        <div
          className={`relative w-full h-full transition-transform duration-500 transform-style-3d shadow-2xl rounded-2xl ${isFlipped ? 'rotate-y-180' : ''}`}
          style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >

          {/* FRONT OF CARD */}
          <div
            className="absolute inset-0 w-full h-full bg-white dark:bg-slate-900 rounded-2xl p-8 flex flex-col items-center justify-center backface-hidden border-t-4 border-violet-500 transition-colors duration-200"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            <div className="absolute top-6 left-6 flex justify-between w-[85%]">
              <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-full uppercase tracking-wide">
                {question.category}
              </span>
            </div>
            
            {/* Speak Button Front */}
            <div className="absolute top-6 right-6">
                <button
                    onClick={handleSpeakFront}
                    className={`p-2 rounded-full transition-colors z-20 relative ${isSpeaking && !isFlipped ? 'bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-400 animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'}`}
                    aria-label="Read Question"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            <h3 className="text-2xl font-bold text-slate-800 dark:text-white text-center leading-relaxed px-4">
              {question.question}
            </h3>

            <p className="text-slate-400 dark:text-slate-500 mt-8 text-sm italic flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Tap to flip
            </p>

            <button
              onClick={() => setIsFlipped(true)}
              className="absolute bottom-0 w-full p-5 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold rounded-b-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Show Answer
            </button>
          </div>

          {/* BACK OF CARD */}
          <div
            className="absolute inset-0 w-full h-full bg-indigo-50 dark:bg-slate-800 rounded-2xl p-8 flex flex-col justify-between backface-hidden rotate-y-180 border-t-4 border-indigo-600 transition-colors duration-200"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
             {/* Speak Button Back */}
             <div className="absolute top-6 right-6">
                <button
                    onClick={handleSpeakBack}
                    className={`p-2 rounded-full transition-colors z-20 relative ${isSpeaking && isFlipped ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 animate-pulse' : 'bg-white/50 text-slate-500 hover:bg-white dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600'}`}
                    aria-label="Read Answer"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-2">
              <div className="mb-6">
                <h4 className="text-xs uppercase tracking-wider text-indigo-500 dark:text-indigo-400 font-bold mb-2">Answer</h4>
                <p className="text-xl font-bold text-slate-900 dark:text-white leading-snug">{question.answer}</p>
              </div>

              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-700/50 p-4 rounded-xl shadow-sm border border-indigo-100 dark:border-slate-600">
                  <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Code Reference</h5>
                  <p className="text-sm font-mono text-slate-700 dark:text-slate-200">{question.citation}</p>
                  <p className="text-sm italic text-slate-600 dark:text-slate-300 mt-1">"{question.code_text}"</p>
                </div>

                {question.mnemonic && (
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                    <p className="text-sm text-purple-800 dark:text-purple-200 font-medium">💡 {question.mnemonic}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t border-indigo-200 dark:border-slate-600">
              <button
                onClick={() => {
                  setIsFlipped(false); // Reset for animation smoothness
                  setTimeout(() => onResult('review'), 150);
                }}
                className="flex-1 py-3 px-2 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 rounded-xl font-bold transition-colors text-sm"
              >
                Keep Studying
                <span className="block text-xs font-normal opacity-75 mt-0.5">(Review later)</span>
              </button>
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setTimeout(() => onResult('learned'), 150);
                }}
                className="flex-1 py-3 px-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors text-sm shadow-md"
              >
                Mark Learned
                <span className="block text-xs font-normal opacity-90 mt-0.5">(Remove card)</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
