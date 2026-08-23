import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Navigation,
  ArrowRight,
  RotateCcw,
  X,
} from 'lucide-react';
import { RouteOptimizationOutput } from '../../services/routeOptimizationService';

interface RouteOptimizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmOptimize: () => Promise<RouteOptimizationOutput | null>;
  onApplyResult: (output: RouteOptimizationOutput) => void;
}

export const RouteOptimizationModal: React.FC<RouteOptimizationModalProps> = ({
  isOpen,
  onClose,
  onConfirmOptimize,
  onApplyResult,
}) => {
  const [step, setStep] = useState<'confirm' | 'loading' | 'result'>('confirm');
  const [loadingProgressText, setLoadingProgressText] = useState('Analyzing your route...');
  const [optimizationResult, setOptimizationResult] = useState<RouteOptimizationOutput | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('confirm');
      setOptimizationResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartOptimization = async () => {
    setStep('loading');

    const progressMessages = [
      'Analyzing your route...',
      'Checking nearby places & districts...',
      'Reducing unnecessary travel & detours...',
      'Balancing your day schedule...',
    ];

    let msgIndex = 0;
    const interval = setInterval(() => {
      msgIndex++;
      if (msgIndex < progressMessages.length) {
        setLoadingProgressText(progressMessages[msgIndex]);
      }
    }, 400);

    const res = await onConfirmOptimize();
    clearInterval(interval);

    if (res) {
      setOptimizationResult(res);
      setStep('result');
    } else {
      onClose();
    }
  };

  const handleApply = () => {
    if (optimizationResult) {
      onApplyResult(optimizationResult);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={step !== 'loading' ? onClose : undefined}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg rounded-2xl bg-[#FFFDF8] border border-[#EAE6DD] shadow-2xl p-6 overflow-hidden font-sans z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        {step !== 'loading' && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#F4F1EA] text-[#5E6B67] hover:text-[#17201D] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* STEP 1: CONFIRMATION */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0ED] text-[#FF6B4A] flex items-center justify-center text-2xl mx-auto shadow-xs">
              ✨
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-black text-[#17201D]">
                Optimize this route?
              </h3>
              <p className="text-xs text-[#68736F] max-w-sm mx-auto leading-relaxed">
                GlobeTrotter will reorder locations to reduce estimated travel while preserving all your selected activities and sensible meal times.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#EAE6DD] space-y-2 text-xs text-[#5E6B67]">
              <div className="flex items-center gap-2 font-bold text-[#17201D]">
                <Sparkles className="w-4 h-4 text-[#FF6B4A]" />
                <span>What AI Route Optimization will do:</span>
              </div>
              <ul className="space-y-1.5 pl-6 list-disc text-[11px] leading-snug">
                <li>Sequence stops using shortest geographic proximity paths</li>
                <li>Eliminate unnecessary backtracking across neighborhoods</li>
                <li>Align dining stops with natural lunchtime and dinner hours</li>
                <li>Preserve all activity durations and notes intact</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white border border-[#EAE6DD] hover:bg-[#F9F7F1] text-[#5E6B67] text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartOptimization}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF6B4A] to-[#20B8A6] text-white text-xs font-black shadow-md hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
              >
                Optimize Route ✨
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: LOADING PROGRESS */}
        {step === 'loading' && (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#FFE4DD] border-t-[#FF6B4A] animate-spin" />
              <Sparkles className="w-6 h-6 text-[#FF6B4A] animate-pulse" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-[#17201D]">
                {loadingProgressText}
              </h4>
              <p className="text-xs text-[#838F8B]">
                Computing nearest geographic clusters & transit buffers...
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: RESULT PREVIEW */}
        {step === 'result' && optimizationResult && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#DDF7F2] text-[#179E8E] flex items-center justify-center text-2xl mx-auto shadow-xs">
              ✓
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-[#17201D]">
                Route optimized ✨
              </h3>
              <p className="text-xs text-[#68736F]">
                Here are the improvements generated for your journey:
              </p>
            </div>

            {/* Metrics Improvements Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-xl bg-white border border-[#20B8A6]/40 shadow-xs">
                <span className="text-[10px] font-bold text-[#838F8B] uppercase">
                  Travel Saved
                </span>
                <div className="text-base font-black text-[#179E8E] mt-0.5">
                  ~{optimizationResult.travelMinutesSaved} min
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#20B8A6]/40 shadow-xs">
                <span className="text-[10px] font-bold text-[#838F8B] uppercase">
                  Distance Saved
                </span>
                <div className="text-base font-black text-[#179E8E] mt-0.5">
                  {optimizationResult.distanceKmSaved} km
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#20B8A6]/40 shadow-xs">
                <span className="text-[10px] font-bold text-[#838F8B] uppercase">
                  Places Grouped
                </span>
                <div className="text-base font-black text-[#179E8E] mt-0.5">
                  {optimizationResult.groupedLocationsCount} spots
                </div>
              </div>
            </div>

            {/* Changes Summary Checklist */}
            <div className="p-3.5 rounded-xl bg-[#F9F7F1] border border-[#EAE6DD] space-y-2">
              <span className="text-[10px] font-bold text-[#838F8B] uppercase tracking-wider">
                Summary of Adjustments
              </span>
              <ul className="space-y-1 text-xs text-[#17201D]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#20B8A6] shrink-0" />
                  <span>
                    Reduced estimated travel by {optimizationResult.travelMinutesSaved} minutes
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#20B8A6] shrink-0" />
                  <span>
                    Grouped {optimizationResult.groupedLocationsCount} nearby locations in district sequence
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#20B8A6] shrink-0" />
                  <span>Removed unnecessary cross-town backtracking</span>
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white border border-[#EAE6DD] hover:bg-[#F9F7F1] text-[#5E6B67] text-xs font-bold transition-colors cursor-pointer"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-5 py-2 rounded-xl bg-[#17201D] hover:bg-[#FF6B4A] text-white text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Apply & Save to Itinerary
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
