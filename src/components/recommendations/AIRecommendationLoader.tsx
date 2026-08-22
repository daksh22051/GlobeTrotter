import React, { useEffect, useState } from 'react';
import { Sparkles, Check, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface AIRecommendationLoaderProps {
  onComplete?: () => void;
  destination?: string;
  isInitialLoad?: boolean;
}

interface StepItem {
  id: number;
  text: string;
}

const STAGES: StepItem[] = [
  { id: 1, text: 'Analyzing your travel style...' },
  { id: 2, text: 'Finding experiences...' },
  { id: 3, text: 'Checking your budget...' },
  { id: 4, text: 'Matching destinations...' },
  { id: 5, text: 'Building recommendations...' },
];

export const AIRecommendationLoader: React.FC<AIRecommendationLoaderProps> = ({
  onComplete,
  destination = 'your destination',
  isInitialLoad = true,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isDone, setIsDone] = useState<boolean>(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Step timing intervals for snappy UX (approx 350ms per step)
    const stepDuration = 360;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STAGES.length) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsDone(true);
          setTimeout(() => {
            onComplete?.();
          }, 450);
          return prev;
        }
      });
    }, stepDuration);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="w-full max-w-xl mx-auto my-12 p-8 sm:p-10 bg-white rounded-3xl border border-[#EAE6DD] shadow-sm text-center select-none">
      {/* Animated AI Halo Icon */}
      <motion.div
        animate={prefersReducedMotion ? {} : { rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-tr from-[#FF6B4A] to-[#FF937B] text-white flex items-center justify-center shadow-md shadow-[#FF6B4A]/25"
      >
        <Sparkles className="w-8 h-8" />
      </motion.div>

      {/* Main Title */}
      <h2 className="text-xl sm:text-2xl font-black text-[#17201D] mb-1.5 tracking-tight">
        {isDone ? 'Your recommendations are ready.' : `Curating recommendations for ${destination}`}
      </h2>
      <p className="text-xs sm:text-sm text-[#68736F] mb-8">
        GlobeTrotter AI is synthesizing your interests, schedule, and budget.
      </p>

      {/* Staged Checklist Progress */}
      <div className="space-y-3 max-w-md mx-auto text-left mb-8">
        {STAGES.map((step) => {
          const isFinished = currentStep > step.id || isDone;
          const isCurrent = currentStep === step.id && !isDone;

          return (
            <div
              key={step.id}
              className={`flex items-center justify-between p-3 rounded-2xl transition-all duration-300 ${
                isFinished
                  ? 'bg-[#F2FBF9] text-[#179E8E] border border-[#20B8A6]/20'
                  : isCurrent
                  ? 'bg-[#FFF7F4] text-[#17201D] border border-[#FF6B4A]/30 shadow-2xs'
                  : 'bg-[#FCFBF8] text-[#9CA7A4] border border-transparent opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isFinished
                      ? 'bg-[#20B8A6] text-white'
                      : isCurrent
                      ? 'bg-[#FF6B4A] text-white animate-pulse'
                      : 'bg-[#EAE6DD] text-[#838F8B]'
                  }`}
                >
                  {isFinished ? <Check className="w-3.5 h-3.5" /> : step.id}
                </div>
                <span className="text-xs sm:text-sm font-semibold">{step.text}</span>
              </div>

              {isFinished && (
                <span className="text-xs font-extrabold text-[#20B8A6]">✓</span>
              )}
              {isCurrent && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B4A] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6B4A]" />
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#F4F1EA] h-2 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-[#FF6B4A] to-[#20B8A6]"
          initial={{ width: '10%' }}
          animate={{
            width: isDone ? '100%' : `${(currentStep / STAGES.length) * 100}%`,
          }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
};
