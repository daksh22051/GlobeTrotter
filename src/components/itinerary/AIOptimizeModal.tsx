import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Navigation,
  Compass,
  ArrowRight,
  X,
  HeartPulse,
} from 'lucide-react';
import { OptimizationResult } from '../../types/itinerary';
import { AI_OPTIMIZATION_STEPS } from '../../services/itineraryAIService';

interface AIOptimizeModalProps {
  isOpen: boolean;
  isOptimizing: boolean;
  currentStepIndex: number;
  result: OptimizationResult | null;
  onClose: () => void;
  onApply: () => void;
}

export const AIOptimizeModal: React.FC<AIOptimizeModalProps> = ({
  isOpen,
  isOptimizing,
  currentStepIndex,
  result,
  onClose,
  onApply,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={isOptimizing ? undefined : onClose}
        className="fixed inset-0 bg-[#17201D]/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-[#FFFDF8] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#EAE6DD] z-10 animate-in zoom-in-95 duration-200">
        {/* Close button if not currently running */}
        {!isOptimizing && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-[#838F8B] hover:text-[#17201D] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {isOptimizing ? (
          /* Step-by-Step AI Thinking Animation */
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#FF6B4A] to-[#20B8A6] text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#FF6B4A]/25 animate-pulse">
              <Sparkles className="w-8 h-8 animate-spin-slow" />
            </div>

            <h3 className="text-xl font-extrabold text-[#17201D] tracking-tight">
              AI Itinerary Optimizer
            </h3>
            <p className="text-xs sm:text-sm text-[#68736F] mt-1 mb-8">
              Sequencing stops, calculating transit buffers, and balancing daily energy.
            </p>

            {/* Step Progress Tracker */}
            <div className="space-y-3 max-w-sm mx-auto text-left">
              {AI_OPTIMIZATION_STEPS.map((step, idx) => {
                const isCompleted = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-white border-[#FF6B4A] shadow-xs'
                        : isCompleted
                        ? 'bg-[#EAF8F5]/60 border-[#20B8A6]/30 text-[#179E8E]'
                        : 'bg-[#F9F7F1]/60 border-[#EAE6DD]/60 opacity-50'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-[#20B8A6]" />
                      ) : isCurrent ? (
                        <div className="w-4 h-4 rounded-full border-2 border-[#FF6B4A] border-t-transparent animate-spin" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-[#A0AAA6]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-bold ${
                          isCurrent ? 'text-[#17201D]' : 'text-[#5E6B67]'
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-[10px] text-[#838F8B] truncate">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : result ? (
          /* Optimization Result Summary */
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#EAF8F5] text-[#20B8A6] mb-3">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#17201D] tracking-tight">
                Your itinerary was optimized ✨
              </h3>
              <p className="text-xs sm:text-sm text-[#68736F] mt-1">
                {result.summary}
              </p>
            </div>

            {/* Health Score & Time Saved Highlights */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#F9F7F1] border border-[#EAE6DD] text-center">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#838F8B]">
                  Planning Health
                </span>
                <div className="flex items-center justify-center gap-1.5 mt-1 text-base font-black">
                  <span className="text-[#838F8B] line-through text-xs">
                    {result.healthImprovement.before}%
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#20B8A6]" />
                  <span className="text-[#20B8A6]">
                    {result.healthImprovement.after}%
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F9F7F1] border border-[#EAE6DD] text-center">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#838F8B]">
                  Transit Saved
                </span>
                <p className="text-base font-black text-[#17201D] mt-1">
                  ~{result.travelTimeSavedMinutes || 35} mins
                </p>
              </div>
            </div>

            {/* Bulleted Changes List */}
            <div className="p-4 rounded-2xl bg-white border border-[#EAE6DD] space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#838F8B]">
                Applied Improvements
              </h4>
              {result.changes.map((change, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-[#17201D]">
                  <CheckCircle2 className="w-4 h-4 text-[#20B8A6] shrink-0 mt-0.5" />
                  <span className="font-medium">{change}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-full bg-white border border-[#EAE6DD] hover:bg-[#F9F7F1] text-xs sm:text-sm font-bold text-[#5E6B67] transition-colors cursor-pointer"
              >
                Keep Reviewing
              </button>

              <button
                type="button"
                onClick={onApply}
                className="flex-1 py-3 rounded-full bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs sm:text-sm font-black shadow-md shadow-[#FF6B4A]/25 transition-all cursor-pointer"
              >
                Apply Journey Plan
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
