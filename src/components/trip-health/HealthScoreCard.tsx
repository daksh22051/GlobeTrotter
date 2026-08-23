import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartPulse,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Wallet,
  Compass,
  Clock,
  Wand2,
} from 'lucide-react';
import { TripHealthBreakdown } from '../../types/intelligence';
import { Trip } from '../../types/trip';

interface HealthScoreCardProps {
  trip: Trip;
  health: TripHealthBreakdown;
  onOpenFixModal?: () => void;
  variant?: 'compact' | 'full' | 'hero';
}

export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({
  trip,
  health,
  onOpenFixModal,
  variant = 'full',
}) => {
  const navigate = useNavigate();

  // Circular progress calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (health.score / 100) * circumference;

  return (
    <div
      id="trip-health-score-card"
      className="bg-white rounded-3xl p-6 border border-[#EAE6DD] shadow-2xs relative overflow-hidden transition-all duration-200"
    >
      {/* Background Accent Mesh */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#EAF8F5]/60 to-transparent rounded-full pointer-events-none -mr-12 -mt-12" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#F4F1EA] mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#EAF8F5] text-[#20B8A6] flex items-center justify-center border border-[#B2E6DC]/40 shadow-xs">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#17201D] uppercase tracking-wider">
              Trip Health
            </h3>
            <p className="text-xs text-[#838F8B]">Real-time balance & conflict score</p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-black border ${health.badgeBg} ${health.badgeText}`}
        >
          {health.label}
        </span>
      </div>

      {/* Score Visualization & Hero Metric */}
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
        {/* Circular Progress Gauge */}
        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
            {/* Background Ring */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="#F4F1EA"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Value Ring */}
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke={health.progressColor}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-[#17201D] leading-none">
              {health.score}
            </span>
            <span className="text-[10px] font-bold text-[#838F8B] uppercase tracking-widest mt-0.5">
              / 100
            </span>
          </div>
        </div>

        {/* Narrative & Status Highlight */}
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm text-[#4A5551] leading-relaxed mb-2 font-medium">
            {health.recommendation}
          </p>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {health.criticalCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#FFF0F0] text-[#C72E33] border border-[#FDB8B8] text-xs font-bold">
                <AlertTriangle className="w-3 h-3" />
                {health.criticalCount} Critical Conflict{health.criticalCount > 1 ? 's' : ''}
              </span>
            ) : null}
            {health.warningCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#FEF6E8] text-[#B86E00] border border-[#FCE2B6] text-xs font-bold">
                <AlertTriangle className="w-3 h-3" />
                {health.warningCount} Timing Warning{health.warningCount > 1 ? 's' : ''}
              </span>
            ) : null}
            {health.criticalCount === 0 && health.warningCount === 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#E8F8F5] text-[#1F8A70] border border-[#A3E5D8] text-xs font-bold">
                <CheckCircle2 className="w-3 h-3" />
                All Days Conflict-Free
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Subscores Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-6">
        <div className="p-3 rounded-2xl bg-[#F9F7F1] border border-[#EAE6DD]/70 text-center">
          <span className="text-[11px] font-bold text-[#838F8B] block mb-0.5">Schedule</span>
          <span className="text-base font-black text-[#17201D]">{health.subscores.schedule}</span>
        </div>
        <div className="p-3 rounded-2xl bg-[#F9F7F1] border border-[#EAE6DD]/70 text-center">
          <span className="text-[11px] font-bold text-[#838F8B] block mb-0.5">Budget</span>
          <span className="text-base font-black text-[#17201D]">{health.subscores.budget}</span>
        </div>
        <div className="p-3 rounded-2xl bg-[#F9F7F1] border border-[#EAE6DD]/70 text-center">
          <span className="text-[11px] font-bold text-[#838F8B] block mb-0.5">Travel</span>
          <span className="text-base font-black text-[#17201D]">{health.subscores.travel}</span>
        </div>
        <div className="p-3 rounded-2xl bg-[#F9F7F1] border border-[#EAE6DD]/70 text-center">
          <span className="text-[11px] font-bold text-[#838F8B] block mb-0.5">Balance</span>
          <span className="text-base font-black text-[#17201D]">{health.subscores.balance}</span>
        </div>
        <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-[#F9F7F1] border border-[#EAE6DD]/70 text-center">
          <span className="text-[11px] font-bold text-[#838F8B] block mb-0.5">Planning</span>
          <span className="text-base font-black text-[#17201D]">{health.subscores.planning}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-[#F4F1EA]">
        <button
          type="button"
          onClick={() => navigate(`/trip/${trip.id}/health`)}
          className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-white border border-[#EAE6DD] hover:border-[#17201D] text-[#17201D] text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>View Health Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {health.issues.length > 0 && onOpenFixModal && (
          <button
            type="button"
            onClick={onOpenFixModal}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#20B8A6] hover:bg-[#1CA393] text-white text-xs font-black transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Fix Issues</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => navigate(`/trip/${trip.id}/what-if`)}
          className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-[#FFF8ED] hover:bg-[#FFECC9] text-[#B86E00] border border-[#FCE2B6] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FFB020]" />
          <span>What-If</span>
        </button>
      </div>
    </div>
  );
};
