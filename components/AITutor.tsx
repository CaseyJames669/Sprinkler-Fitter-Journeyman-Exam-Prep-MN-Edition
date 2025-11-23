import React, { useState, useRef, useEffect } from 'react';
import { Question, ChatMessage } from '../types';
import { askTutor } from '../services/geminiService';

interface AITutorProps {
  currentQuestion: Question;
  isOpen: boolean;
  onClose: () => void;
}

export const AITutor: React.FC<AITutorProps> = ({ currentQuestion, isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "I'm your Sprinkler Fitter AI Tutor. What's confusing you about this question?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  // Reset chat when question changes
  useEffect(() => {
    setMessages([{ role: 'model', text: "I'm your Sprinkler Fitter AI Tutor. What's confusing you about this question?" }]);
  }, [currentQuestion.id]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const response = await askTutor(userMsg, currentQuestion);

    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg h-[80vh] md:h-[600px] rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="bg-purple-700 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            </div>
            <div>
                <h3 className="font-bold">AI Tutor</h3>
                <p className="text-xs text-purple-200">Expert on MN Code & NFPA</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user' 
                  ? 'bg-purple-600 text-white rounded-br-none' 
                  : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none'
              }`}>
                {msg.text.split('\n').map((line, i) => (
                    <p key={i} className="mb-1 last:mb-0">{line}</p>
                ))}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 flex gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about this question..."
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button 
                onClick={handleSend}
                disabled={isLoading}
                className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto scrollbar-hide">
              <button onClick={() => setInput("Explain why the answer is correct.")} className="whitespace-nowrap text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-600">Explain Answer</button>
              <button onClick={() => setInput("What is the mnemonic for this?")} className="whitespace-nowrap text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-600">Give Mnemonic</button>
              <button onClick={() => setInput("Explain the math logic.")} className="whitespace-nowrap text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-gray-600">Explain Math</button>
          </div>
        </div>

      </div>
    </div>
  );
};