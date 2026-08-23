import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  X,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { WhatIfSimulationResult } from '../../types/intelligence';
import { formatCurrency } from '../../utils/currency';
import { CurrencyCode } from '../../types/profile';

interface ApplyScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  simulation: WhatIfSimulationResult;
  onConfirmApply: () => void;
}

export const ApplyScenarioModal: React.FC<ApplyScenarioModalProps> = ({
  isOpen,
  onClose,
  simulation,
  onConfirmApply,
}) => {
  const [isApplying, setIsApplying] = useState(false);

  if (!isOpen) return null;

  const { originalTrip, simulatedTrip, originalHealth, simulatedHealth, changesSummary, healthImpact } = simulation;
  const currency = (originalTrip.currency || 'INR') as CurrencyCode;

  const handleApply = () => {
    setIsApplying(true);
    setTimeout(() => {
      onConfirmApply();
      setIsApplying(false);
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#EAE6DD] shadow-xl relative overflow-hidden">
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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#17201D] to-[#20B8A6] text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-6 h-6 text-[#20B8A6]" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#17201D]">
              Apply What-If Scenario to Trip?
            </h3>
            <p className="text-xs text-[#838F8B]">
              This will update your active itinerary, budget targets, and timeline.
            </p>
          </div>
        </div>

        {/* Metric Comparison Banner */}
        <div className="p-4 rounded-2xl bg-[#F9F7F1] border border-[#EAE6DD] mb-5 grid grid-cols-2 gap-4 text-center">
          <div>
            <span className="text-[10px] font-bold text-[#838F8B] uppercase tracking-wider block">
              Budget Target
            </span>
            <span className="text-sm font-black text-[#17201D]">
              {formatCurrency(simulatedTrip.budget, currency)}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#838F8B] uppercase tracking-wider block">
              Trip Health
            </span>
            <span className="text-sm font-black text-[#1F8A70]">
              {simulatedHealth.score}/100 ({healthImpact >= 0 ? `+${healthImpact}` : healthImpact})
            </span>
          </div>
        </div>

        {/* Changes Summary Checklist */}
        <div className="mb-6">
          <h4 className="text-xs font-bold text-[#17201D] uppercase tracking-wider mb-2.5">
            Key Changes to be Applied:
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {changesSummary.map((change, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-white border border-[#EAE6DD] flex items-start gap-2 text-xs text-[#4A5551]"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#20B8A6] shrink-0 mt-0.5" />
                <span className="font-medium">{change}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#FFF8ED] border border-[#FCE2B6] text-xs text-[#B86E00] flex items-center gap-2 mb-6">
          <RotateCcw className="w-4 h-4 text-[#FFB020] shrink-0" />
          <span>Don't worry! You can instantly undo this action at any time.</span>
        </div>

        {/* Actions */}
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
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#17201D] hover:bg-[#2A3632] text-white text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-[#20B8A6]" />
            <span>{isApplying ? 'Applying Scenario...' : 'Confirm & Apply This Plan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
