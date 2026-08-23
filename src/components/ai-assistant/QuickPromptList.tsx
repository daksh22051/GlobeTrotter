import React from 'react';
import { Sparkles } from 'lucide-react';

interface QuickPromptListProps {
  onSelectPrompt: (prompt: string) => void;
}

export const QuickPromptList: React.FC<QuickPromptListProps> = ({ onSelectPrompt }) => {
  const quickPrompts = [
    'Make Day 3 less hectic',
    'Reduce my budget to ₹60,000',
    'Optimize my itinerary',
    'Find free time',
    'Suggest food nearby',
    'Where am I overscheduled?',
    'Make this trip more relaxed',
  ];

  return (
    <div className="py-2">
      <span className="text-[11px] font-bold text-[#838F8B] uppercase tracking-wider block mb-2 px-1">
        Quick Suggestions:
      </span>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSelectPrompt(prompt)}
            className="px-3 py-1.5 rounded-full bg-[#F9F7F1] hover:bg-[#EAE6DD] border border-[#EAE6DD] text-xs font-semibold text-[#5E6B67] hover:text-[#17201D] transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};
