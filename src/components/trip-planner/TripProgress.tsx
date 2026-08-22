import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface TripProgressProps {
  currentStep: number;
  totalSteps?: number;
  onStepClick?: (step: number) => void;
  maxAccessibleStep?: number;
}

const STEPS = [
  { number: 1, label: 'Details', shortLabel: 'Details' },
  { number: 2, label: 'Preferences', shortLabel: 'Preferences' },
  { number: 3, label: 'Interests', shortLabel: 'Interests' },
  { number: 4, label: 'Review', shortLabel: 'Review' },
];

export const TripProgress: React.FC<TripProgressProps> = ({
  currentStep,
  totalSteps = 4,
  onStepClick,
  maxAccessibleStep = 4,
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="w-full select-none" aria-label="Trip planning progress">
      {/* Top Mobile Step Counter */}
      <div className="flex sm:hidden items-center justify-between mb-3 text-xs font-semibold text-[#68736F]">
        <span className="text-[#FF6B4A] font-bold">Step {currentStep} of {totalSteps}</span>
        <span>{STEPS[currentStep - 1]?.label || 'Planning'}</span>
      </div>

      {/* Main Stepper Bar */}
      <div className="relative flex items-center justify-between max-w-2xl mx-auto">
        {/* Background Connecting Line */}
        <div
          className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-0.5 bg-[#EAE6DD] -z-0"
          aria-hidden="true"
        />

        {/* Active Progress Fill Line */}
        <motion.div
          className="absolute top-1/2 left-4 -translate-y-1/2 h-0.5 bg-[#FF6B4A] -z-0 origin-left"
          initial={false}
          animate={{
            width: `${Math.max(0, ((currentStep - 1) / (STEPS.length - 1)) * 100)}%`,
          }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.35, ease: 'easeInOut' }}
          style={{ maxWidth: 'calc(100% - 2rem)' }}
          aria-hidden="true"
        />

        {/* Step Nodes */}
        {STEPS.map((step) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isClickable = onStepClick && step.number <= maxAccessibleStep;

          return (
            <div
              key={step.number}
              className="relative z-10 flex flex-col items-center group"
            >
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick?.(step.number)}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] focus:ring-offset-2 ${
                  isCompleted
                    ? 'bg-[#FF6B4A] text-white shadow-xs hover:bg-[#E55837] cursor-pointer'
                    : isCurrent
                    ? 'bg-white text-[#FF6B4A] border-2 border-[#FF6B4A] shadow-md ring-4 ring-[#FFE8E2]'
                    : 'bg-white text-[#98A29F] border border-[#EAE6DD]'
                } ${isClickable && !isCurrent ? 'hover:border-[#FF6B4A] cursor-pointer' : 'cursor-default'}`}
                aria-label={`Step ${step.number}: ${step.label}`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                ) : (
                  <span>0{step.number}</span>
                )}
              </button>

              {/* Step Label (Desktop & Tablet) */}
              <span
                className={`mt-2 text-xs font-bold transition-colors hidden sm:block whitespace-nowrap ${
                  isCurrent
                    ? 'text-[#17201D]'
                    : isCompleted
                    ? 'text-[#5E6B67]'
                    : 'text-[#98A29F]'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
