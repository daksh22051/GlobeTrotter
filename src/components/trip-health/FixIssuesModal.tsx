import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  CheckCircle2,
  ArrowRight,
  X,
  AlertTriangle,
  HeartPulse,
} from 'lucide-react';
import { Itinerary } from '../../types/itinerary';
import { Trip } from '../../types/trip';

interface FixIssuesModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  healthBefore: number;
  healthAfter: number;
  improvements: string[];
  optimizedItinerary: Itinerary;
  onApply: (optimizedItinerary: Itinerary) => void;
}

export const FixIssuesModal: React.FC<FixIssuesModalProps> = ({
  isOpen,
  onClose,
  trip,
  healthBefore,
  healthAfter,
  improvements,
  optimizedItinerary,
  onApply,
}) => {
  const [isApplying, setIsApplying] = useState(false);

  if (!isOpen) return null;

  const scoreDiff = healthAfter - healthBefore;

  const handleApply = () => {
    setIsApplying(true);
    setTimeout(() => {
      onApply(optimizedItinerary);
      setIsApplying(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 border border-[#EAE6DD] shadow-xl relative overflow-hidden">
        {/* Background Gradient Mesh */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#EAF8F5]/80 to-transparent rounded-full pointer-events-none -mr-20 -mt-20" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#838F8B] hover:text-[#17201D] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#20B8A6] to-[#1F8A70] text-white flex items-center justify-center shadow-sm shadow-[#20B8A6]/30">
            <Wand2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#17201D]">
              Intelligent Itinerary Auto-Fix
            </h3>
            <p className="text-xs sm:text-sm text-[#68736F]">
              GlobeTrotter resolved schedule conflicts and optimized pacing.
            </p>
          </div>
        </div>

        {/* Before / After Score Highlight Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#F9F7F1] border border-[#EAE6DD] mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[11px] font-bold text-[#838F8B] uppercase tracking-wider block">
                Current Health
              </span>
              <span className="text-2xl font-black text-[#838F8B]">
                {healthBefore}
                <span className="text-xs font-semibold">/100</span>
              </span>
            </div>

            <ArrowRight className="w-5 h-5 text-[#20B8A6] shrink-0" />

            <div>
              <span className="text-[11px] font-bold text-[#20B8A6] uppercase tracking-wider block">
                Optimized Health
              </span>
              <span className="text-2xl font-black text-[#1F8A70]">
                {healthAfter}
                <span className="text-xs font-semibold">/100</span>
              </span>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-full bg-[#E8F8F5] border border-[#A3E5D8] text-[#1F8A70] text-xs font-black shrink-0">
            +{Math.max(1, scoreDiff)} Health Improvement
          </div>
        </div>

        {/* Improvements List */}
        <div className="mb-6">
          <h4 className="text-xs font-bold text-[#17201D] uppercase tracking-wider mb-3">
            Proposed Improvements ({improvements.length})
          </h4>
          <div className="max-h-56 overflow-y-auto space-y-2.5 pr-1">
            {improvements.map((imp, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white border border-[#EAE6DD] flex items-start gap-2.5 text-xs text-[#4A5551]"
              >
                <CheckCircle2 className="w-4 h-4 text-[#20B8A6] shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{imp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#F4F1EA]">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#EAE6DD] hover:bg-[#F9F7F1] text-xs font-bold text-[#5E6B67] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isApplying}
            onClick={handleApply}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#20B8A6] hover:bg-[#1CA393] text-white text-xs font-black shadow-md shadow-[#20B8A6]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isApplying ? 'Applying Improvements...' : 'Apply Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
