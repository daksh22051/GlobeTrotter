import React from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  Clock,
  Navigation,
  Utensils,
  Wand2,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { TripHealthIssue } from '../../types/intelligence';

interface HealthIssueItemProps {
  issue: TripHealthIssue;
  onApplyFix?: (issue: TripHealthIssue) => void;
  onNavigateToDay?: (dayNumber: number) => void;
}

export const HealthIssueItem: React.FC<HealthIssueItemProps> = ({
  issue,
  onApplyFix,
  onNavigateToDay,
}) => {
  const getSeverityBadge = () => {
    switch (issue.severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-[#FFF0F0] text-[#C72E33] border border-[#FDB8B8]">
            <AlertCircle className="w-3 h-3" />
            Critical Conflict
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEF6E8] text-[#B86E00] border border-[#FCE2B6]">
            <AlertTriangle className="w-3 h-3" />
            Schedule Warning
          </span>
        );
      case 'suggestion':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EAF8F5] text-[#168376] border border-[#B2E6DC]">
            <Lightbulb className="w-3 h-3" />
            Suggestion
          </span>
        );
    }
  };

  const getActionLabel = () => {
    switch (issue.fixActionType) {
      case 'FIX_OVERLAP':
        return 'Fix Schedule';
      case 'ADD_TRAVEL_TIME':
        return 'Add Transit Buffer';
      case 'MOVE_TO_DAY':
      case 'SPREAD_ACTIVITIES':
        return 'Move Activity';
      case 'ADD_MEAL':
      case 'EXPLORE_FOOD':
        return 'Add Meal Spot';
      case 'REDUCE_BUDGET':
        return 'Open What-If';
      default:
        return 'Fix Issue';
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EAE6DD] hover:border-[#D0C9BA] transition-all shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {getSeverityBadge()}
          {issue.dayNumber && (
            <span className="text-xs font-bold text-[#5E6B67] bg-[#F4F1EA] px-2.5 py-0.5 rounded-md">
              Day {issue.dayNumber}
            </span>
          )}
        </div>

        {onApplyFix && (
          <button
            type="button"
            onClick={() => onApplyFix(issue)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#20B8A6] hover:bg-[#1CA393] text-white text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer self-start"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>{getActionLabel()}</span>
          </button>
        )}
      </div>

      <h4 className="text-sm font-extrabold text-[#17201D] mb-1">{issue.title}</h4>
      <p className="text-xs sm:text-sm text-[#4A5551] leading-relaxed mb-3">
        {issue.description}
      </p>

      {/* Suggested Fix Hint */}
      <div className="p-3 rounded-xl bg-[#F9F7F1] border border-[#EAE6DD]/70 flex items-start gap-2 text-xs text-[#20B8A6]">
        <Lightbulb className="w-4 h-4 text-[#20B8A6] shrink-0 mt-0.5" />
        <span className="font-semibold text-[#17201D]">
          <span className="text-[#20B8A6] font-bold">Recommendation: </span>
          {issue.suggestedFix}
        </span>
      </div>
    </div>
  );
};
