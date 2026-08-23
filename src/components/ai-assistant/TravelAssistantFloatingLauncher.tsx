import React from 'react';
import { Sparkles } from 'lucide-react';

interface TravelAssistantFloatingLauncherProps {
  onClick: () => void;
  hasIssues?: boolean;
}

export const TravelAssistantFloatingLauncher: React.FC<TravelAssistantFloatingLauncherProps> = ({
  onClick,
  hasIssues = false,
}) => {
  return (
    <button
      id="ai-travel-assistant-launcher"
      type="button"
      onClick={onClick}
      className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 sm:bottom-6 sm:right-6 z-[60] max-w-[calc(100vw-2rem)] bg-gradient-to-tr from-[#17201D] to-[#2A3632] hover:from-[#20B8A6] hover:to-[#1F8A70] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2.5 group cursor-pointer border border-white/10"
      title="Open AI Travel Copilot"
    >
      <div className="relative flex items-center justify-center">
        <Sparkles className="w-5 h-5 text-[#20B8A6] group-hover:text-white transition-colors" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#20B8A6] animate-ping" />
      </div>

      <span className="text-xs sm:text-sm font-extrabold tracking-wide pr-1">
        AI Copilot
      </span>

      {hasIssues && (
        <span className="w-2 h-2 rounded-full bg-[#FFB020]" />
      )}
    </button>
  );
};
