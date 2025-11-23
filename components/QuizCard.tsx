
import React, { useEffect, useState } from 'react';
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
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop speech when component unmounts or question changes
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    };
  }, [question.id]);

  const speakText = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Cancel any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    // Attempt to pick a decent voice (optional, browser dependent)
    const voices = window.speechSynthesis.getVoices();
    // Prefer a US English voice
    const voice = voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) || voices.find(v => v.lang === 'en-US');
    if (voice) utterance.voice = voice;
    
    // Slightly slower rate for clarity
    utterance.rate = 0.95; 

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleReadQuestion = () => {
    let textToRead = `Question: ${question.question}. `;
    shuffledOptions.forEach((opt, index) => {
      textToRead += `Option ${index + 1}: ${opt}. `;
    });
    speakText(textToRead);
  };

  const handleReadExplanation = () => {
    const isCorrect = selectedOption === question.answer;
    let textToRead = isCorrect ? "That is Correct. " : "That is Incorrect. ";
    
    if (!isCorrect) {
      textToRead += `The correct answer is ${question.answer}. `;
    }
    
    textToRead += `Explanation: ${question.code_text}`;
    speakText(textToRead);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'Medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'Hard': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300';
      default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const isCorrect = selectedOption === question.answer;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-6 md:p-8 max-w-2xl w-full mx-auto transition-colors duration-200 relative overflow-hidden">
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 to-orange-500"></div>

      <div className="flex justify-between items-start mb-6 mt-2">
        <div className="flex gap-2 flex-wrap items-center">
          <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full uppercase tracking-wide">
            {question.category}
          </span>
          <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${getDifficultyColor(question.difficulty)}`}>
            {question.difficulty}
          </span>
          {/* ALWAYS show Sprinkler Type, if generic/N/A show N/A */}
          <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-xs font-bold rounded-full uppercase tracking-wide">
            {question.sprinklerType === 'General' || !question.sprinklerType ? 'N/A' : question.sprinklerType}
          </span>
        </div>
        <div className="flex items-center gap-2">
           {/* Question Speaker Button */}
          {!showAnswer && (
            <button
              onClick={handleReadQuestion}
              className={`p-2 rounded-full transition-colors ${isSpeaking ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'}`}
              aria-label="Read Question Aloud"
              title="Read Question"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          {question.is_mn_amendment && (
            <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-bold rounded-full ml-2 border border-blue-200 dark:border-blue-800">
              MN Amendment
            </span>
          )}
        </div>
      </div>

      <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-8 leading-snug">
        {question.question}
      </h2>

      <div className="space-y-3 mb-8">
        {shuffledOptions.map((option, idx) => {
          let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium text-base ";

          if (showAnswer) {
            if (option === question.answer) {
              btnClass += "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-sm ring-1 ring-emerald-500/50";
            } else if (option === selectedOption && option !== question.answer) {
              btnClass += "bg-rose-50 dark:bg-rose-900/20 border-rose-500 text-rose-800 dark:text-rose-300 opacity-80";
            } else {
              btnClass += "bg-slate-50 dark:bg-slate-800/50 border-transparent opacity-40 text-slate-400 dark:text-slate-600 grayscale";
            }
          } else {
            if (selectedOption === option) {
              btnClass += "bg-slate-100 dark:bg-slate-800 border-indigo-500 text-slate-900 dark:text-white";
            } else {
              btnClass += "bg-slate-50 dark:bg-slate-800 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600";
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
         <div className={`animate-fade-in mt-6 mb-8 rounded-xl border-l-4 shadow-sm p-5 transition-all duration-300 ${
             isCorrect 
               ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500' 
               : 'bg-rose-50 dark:bg-rose-900/10 border-rose-500'
         }`}>
           <div className="flex items-start gap-3">
               <div className={`mt-0.5 p-1.5 rounded-full flex-shrink-0 ${isCorrect ? 'bg-emerald-200 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200' : 'bg-rose-200 text-rose-700 dark:bg-rose-800 dark:text-rose-200'}`}>
                   {isCorrect ? (
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                       </svg>
                   ) : (
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                           <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                       </svg>
                   )}
               </div>
               <div className="flex-1">
                   <div className="flex justify-between items-start">
                     <h3 className={`text-lg font-bold mb-1 leading-none ${isCorrect ? 'text-emerald-900 dark:text-emerald-400' : 'text-rose-900 dark:text-rose-400'}`}>
                         {isCorrect ? 'That is Correct!' : 'Incorrect'}
                     </h3>
                     {/* Explanation Speaker Button */}
                     <button
                        onClick={handleReadExplanation}
                        className={`p-1.5 rounded-full transition-colors ml-2 -mt-1 ${isSpeaking ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 animate-pulse' : 'bg-white/50 text-slate-500 hover:bg-white dark:bg-black/20 dark:text-slate-400 dark:hover:bg-black/40'}`}
                        aria-label="Read Explanation Aloud"
                        title="Read Explanation"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                        </svg>
                      </button>
                   </div>
                   
                   {!isCorrect && (
                       <div className="mb-3 text-slate-800 dark:text-slate-200 font-medium text-sm">
                           The correct answer is: <span className="font-bold text-emerald-600 dark:text-emerald-400">{question.answer}</span>
                       </div>
                   )}
   
                   <div className="bg-white/60 dark:bg-black/20 rounded-lg p-4 text-sm text-slate-700 dark:text-slate-300 mt-3 border border-slate-100 dark:border-slate-800">
                       <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-wider opacity-60 text-indigo-900 dark:text-indigo-300">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                           </svg>
                           Tutor's Explanation
                       </div>
                       <p className="leading-relaxed italic mb-3">
                           "{question.code_text}"
                       </p>
                       <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-2 py-1 rounded bg-slate-200 dark:bg-slate-700/50 text-xs font-mono text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600">
                               Ref: {question.citation}
                            </span>
                       </div>
                   </div>
   
                   {question.mnemonic && (
                        <div className="mt-3 text-sm bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 p-3 rounded-lg flex gap-3 border border-purple-100 dark:border-purple-800/30">
                           <span className="text-lg">💡</span>
                           <div>
                                <strong className="block text-xs uppercase opacity-70 mb-0.5">Memory Aid</strong>
                                {question.mnemonic}
                           </div>
                        </div>
                   )}
               </div>
           </div>
         </div>
      )}

      <div className="flex gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
        <button
          onClick={onExplain}
          disabled={isAiLoading}
          className={`flex-1 py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${isAiLoading ? 'opacity-80 cursor-wait' : 'shadow-lg shadow-violet-500/20'}`}
        >
          {isAiLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="animate-pulse">Connecting...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Chat with Tutor
            </>
          )}
        </button>

        {showAnswer && (
          <button
            onClick={onNext}
            disabled={isAiLoading} // Prevent skipping while loading
            className="flex-1 py-3 px-4 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
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
