import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

interface OnboardingProgressProps {
  currentStep: number; // 1 to 5
  totalSteps?: number;
  onStepClick?: (step: number) => void;
  allowStepClick?: boolean;
}

const STEP_LABELS = [
  'Interests',
  'Travel Style',
  'Budget',
  'Preferences',
  'Personality',
];

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps = 5,
  onStepClick,
  allowStepClick = false,
}) => {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="w-full max-w-2xl mx-auto mb-6 sm:mb-8 select-none">
      {/* Mobile Top Counter */}
      <div className="flex items-center justify-between sm:hidden mb-2 text-xs font-bold">
        <span className="text-[#FF6B4A]">Step {currentStep} of {totalSteps}</span>
        <span className="text-[#68736F]">{STEP_LABELS[currentStep - 1]}</span>
        <span className="text-[#17201D] font-mono">{percentage}%</span>
      </div>

      {/* Desktop Stepper: 01 ───── 02 ───── 03 ───── 04 ───── 05 */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Connecting Background Line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-[#EAE6DD] -z-0 rounded-full" />

        {/* Connecting Active Progress Line */}
        <motion.div
          className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-[#FF6B4A] -z-0 rounded-full"
          initial={false}
          animate={{
            width: `${((Math.min(currentStep, totalSteps) - 1) / (totalSteps - 1)) * 100}%`,
            maxWidth: 'calc(100% - 3rem)',
          }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        />

        {/* Step Nodes */}
        {STEP_LABELS.map((label, index) => {
          const stepNum = index + 1;
          const isCompleted = currentStep > stepNum;
          const isCurrent = currentStep === stepNum;
          const isClickable = allowStepClick && (isCompleted || isCurrent);

          return (
            <button
              key={stepNum}
              type="button"
              onClick={() => isClickable && onStepClick?.(stepNum)}
              disabled={!isClickable}
              className={`relative z-10 flex flex-col items-center group transition-all duration-200 ${
                isClickable ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.15 : 1,
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors duration-300 shadow-sm ${
                  isCompleted
                    ? 'bg-[#20B8A6] border-[#20B8A6] text-white'
                    : isCurrent
                    ? 'bg-[#FF6B4A] border-[#FF6B4A] text-white ring-4 ring-[#FF6B4A]/20'
                    : 'bg-white border-[#EAE6DD] text-[#8C9894]'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <span>0{stepNum}</span>
                )}
              </motion.div>

              <span
                className={`mt-1.5 text-[11px] font-semibold tracking-tight transition-colors whitespace-nowrap ${
                  isCurrent
                    ? 'text-[#17201D] font-bold'
                    : isCompleted
                    ? 'text-[#20B8A6]'
                    : 'text-[#8C9894]'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mobile Continuous Progress Bar */}
      <div className="sm:hidden w-full h-1.5 bg-[#EAE6DD] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#FF6B4A] rounded-full"
          initial={false}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};
