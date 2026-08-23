import React, { useState } from 'react';
import { AssistantAction } from '../../types/intelligence';
import { Trip } from '../../types/trip';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Wand2,
  Calendar,
  DollarSign,
  HeartPulse,
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { CurrencyCode } from '../../types/profile';

interface ActionPreviewCardProps {
  action: AssistantAction;
  trip: Trip;
  onApply: (action: AssistantAction) => void;
  onCancel: (action: AssistantAction) => void;
}

export const ActionPreviewCard: React.FC<ActionPreviewCardProps> = ({
  action,
  trip,
  onApply,
  onCancel,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const currency = (trip.currency || 'INR') as CurrencyCode;

  const handleApply = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onApply(action);
      setIsProcessing(false);
    }, 400);
  };

  const isApplied = action.status === 'applied';
  const isCancelled = action.status === 'cancelled';

  return (
    <div
      id={`action-card-${action.id}`}
      className="p-4 rounded-2xl bg-white border border-[#20B8A6]/40 shadow-sm space-y-3 mt-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#EAF8F5] text-[#20B8A6] flex items-center justify-center">
            <Wand2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-black text-[#17201D]">{action.title}</span>
        </div>

        {isApplied ? (
          <span className="text-[10px] font-bold text-[#1F8A70] bg-[#E8F8F5] px-2 py-0.5 rounded-full border border-[#A3E5D8] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Applied
          </span>
        ) : isCancelled ? (
          <span className="text-[10px] font-bold text-[#838F8B] bg-[#F4F1EA] px-2 py-0.5 rounded-full">
            Declined
          </span>
        ) : (
          <span className="text-[10px] font-black text-[#20B8A6] bg-[#EAF8F5] px-2 py-0.5 rounded-full border border-[#B2E6DC]">
            Action Proposed
          </span>
        )}
      </div>

      <p className="text-xs text-[#5E6B67] leading-relaxed">{action.description}</p>

      {/* Impact Indicator Banner */}
      <div className="p-3 rounded-xl bg-[#F9F7F1] border border-[#EAE6DD] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-[#17201D] font-bold">
          <HeartPulse className="w-3.5 h-3.5 text-[#20B8A6]" />
          <span>
            Health: {action.impact.healthBefore} →{' '}
            <span className="text-[#1F8A70]">{action.impact.healthAfter}/100</span>
          </span>
        </div>

        {action.impact.budgetDelta !== undefined && action.impact.budgetDelta !== 0 && (
          <div className="flex items-center gap-1 text-xs font-bold text-[#17201D]">
            <DollarSign className="w-3.5 h-3.5 text-[#838F8B]" />
            <span
              className={action.impact.budgetDelta < 0 ? 'text-[#1F8A70]' : 'text-[#FF6B4A]'}
            >
              {action.impact.budgetDelta < 0 ? '-' : '+'}
              {formatCurrency(Math.abs(action.impact.budgetDelta), currency)}
            </span>
          </div>
        )}
      </div>

      {/* Confirmation Actions */}
      {!isApplied && !isCancelled && (
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => onCancel(action)}
            className="px-3 py-1.5 rounded-xl border border-[#EAE6DD] text-xs font-bold text-[#838F8B] hover:text-[#17201D] hover:bg-[#F9F7F1] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleApply}
            className="px-4 py-1.5 rounded-xl bg-[#20B8A6] hover:bg-[#1CA393] text-white text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isProcessing ? 'Applying...' : 'Apply Changes'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
