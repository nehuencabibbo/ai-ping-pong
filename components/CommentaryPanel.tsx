import React, { useEffect, useRef } from 'react';
import { CommentaryMessage } from '../types';

interface CommentaryPanelProps {
  messages: CommentaryMessage[];
  isGenerating: boolean;
}

export const CommentaryPanel: React.FC<CommentaryPanelProps> = ({ messages, isGenerating }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 bg-slate-900 rounded-xl border border-slate-700 overflow-hidden flex flex-col h-48 shadow-xl">
      <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Live Commentary</h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">Gemini 2.5 Flash</span>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-slate-500 text-center italic text-sm mt-4">Waiting for match start...</p>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === 'system' ? 'justify-center' : 'justify-start'}`}>
            {msg.type === 'system' ? (
               <span className="text-xs font-medium text-slate-500 bg-slate-800/50 px-2 py-1 rounded-full">
                 {msg.text}
               </span>
            ) : (
              <div className="bg-gradient-to-r from-indigo-900/40 to-slate-800/40 border-l-2 border-indigo-500 pl-3 py-1 pr-2 rounded-r">
                <p className="text-sm text-indigo-100 leading-relaxed">
                  "{msg.text}"
                </p>
                <span className="text-[10px] text-indigo-400/60 uppercase font-bold">Analyst</span>
              </div>
            )}
          </div>
        ))}

        {isGenerating && (
          <div className="flex items-center gap-2 text-indigo-400 text-xs animate-pulse">
             <span className="w-1 h-1 bg-indigo-400 rounded-full"></span>
             <span className="w-1 h-1 bg-indigo-400 rounded-full animation-delay-75"></span>
             <span className="w-1 h-1 bg-indigo-400 rounded-full animation-delay-150"></span>
             <span>Analyzing play...</span>
          </div>
        )}
      </div>
    </div>
  );
};