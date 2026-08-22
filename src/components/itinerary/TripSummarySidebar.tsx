import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Wallet,
  Clock,
  AlertTriangle,
  HeartPulse,
  MapPin,
  Sparkles,
  ArrowRight,
  Compass,
  CheckCircle2,
  TrendingDown,
  Info,
} from 'lucide-react';
import { Itinerary, ItineraryStats } from '../../types/itinerary';
import { Trip } from '../../types/trip';
import { formatTravelTime } from '../../utils/travelTimeEstimator';
import { generateItineraryInsights } from '../../utils/itineraryInsights';

interface TripSummarySidebarProps {
  trip: Trip;
  itinerary: Itinerary;
  stats: ItineraryStats;
  onOpenAIOptimize: () => void;
}

export const TripSummarySidebar: React.FC<TripSummarySidebarProps> = ({
  trip,
  itinerary,
  stats,
  onOpenAIOptimize,
}) => {
  const navigate = useNavigate();
  const [showBudgetTip, setShowBudgetTip] = useState(false);

  const currency = trip.currency || '₹';
  const insights = generateItineraryInsights(itinerary, trip.budget);
  const primaryInsight = insights[0];

  return (
    <div className="space-y-6">
      {/* 1. Trip Stats Live Dashboard Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE6DD] shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#F4F1EA] mb-4">
          <h3 className="text-sm sm:text-base font-extrabold text-[#17201D]">
            Trip Overview
          </h3>
          <span className="text-[11px] font-bold text-[#20B8A6] bg-[#EAF8F5] px-2.5 py-0.5 rounded-full border border-[#20B8A6]/20">
            Live Journey Metrics
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Total Activities */}
          <div className="p-3.5 rounded-2xl bg-[#F9F7F1] border border-[#EAE6DD]/70">
            <div className="flex items-center gap-1.5 text-[#5E6B67] text-xs font-semibold mb-1">
              <Compass className="w-3.5 h-3.5 text-[#FF6B4A]" />
              <span>Activities</span>
            </div>
            <p className="text-lg font-black text-[#17201D]">
              {stats.totalActivities}{' '}
              <span className="text-[11px] font-normal text-[#838F8B]">
                ({stats.scheduledActivities} scheduled)
              </span>
            </p>
          </div>

          {/* Planning Health */}
          <div className="p-3.5 rounded-2xl bg-[#F9F7F1] border border-[#EAE6DD]/70">
            <div className="flex items-center gap-1.5 text-[#5E6B67] text-xs font-semibold mb-1">
              <HeartPulse className="w-3.5 h-3.5 text-[#20B8A6]" />
              <span>Planning Health</span>
            </div>
            <p className="text-lg font-black text-[#17201D]">
              {stats.planningHealthScore}%
            </p>
          </div>

          {/* Estimated Cost */}
          <div className="p-3.5 rounded-2xl bg-[#F9F7F1] border border-[#EAE6DD]/70">
            <div className="flex items-center gap-1.5 text-[#5E6B67] text-xs font-semibold mb-1">
              <Wallet className="w-3.5 h-3.5 text-[#179E8E]" />
              <span>Estimated Cost</span>
            </div>
            <p className="text-base font-black text-[#17201D]">
              {currency}{stats.totalEstimatedCost.toLocaleString()}
            </p>
          </div>

          {/* Budget Remaining */}
          <div
            className={`p-3.5 rounded-2xl border ${
              stats.isOverBudget
                ? 'bg-[#FFF0EC] border-[#FF6B4A]/30'
                : 'bg-[#F9F7F1] border-[#EAE6DD]/70'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[#5E6B67] text-xs font-semibold mb-1">
              <span>Remaining Budget</span>
            </div>
            <p
              className={`text-base font-black ${
                stats.isOverBudget ? 'text-[#E55837]' : 'text-[#20B8A6]'
              }`}
            >
              {stats.isOverBudget ? '-' : ''}
              {currency}
              {Math.abs(stats.remainingBudget).toLocaleString()}
            </p>
          </div>

          {/* Total Travel Time */}
          <div className="p-3.5 rounded-2xl bg-[#F9F7F1] border border-[#EAE6DD]/70">
            <div className="flex items-center gap-1.5 text-[#5E6B67] text-xs font-semibold mb-1">
              <Clock className="w-3.5 h-3.5 text-[#5E6B67]" />
              <span>Travel Time</span>
            </div>
            <p className="text-base font-black text-[#17201D]">
              {formatTravelTime(stats.totalTravelMinutes)}
            </p>
          </div>

          {/* Schedule Conflicts */}
          <div
            className={`p-3.5 rounded-2xl border ${
              stats.totalConflicts > 0
                ? 'bg-[#FFF8E7] border-[#FFB020]/30'
                : 'bg-[#F9F7F1] border-[#EAE6DD]/70'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[#5E6B67] text-xs font-semibold mb-1">
              <AlertTriangle
                className={`w-3.5 h-3.5 ${
                  stats.totalConflicts > 0 ? 'text-[#D97706]' : 'text-[#838F8B]'
                }`}
              />
              <span>Conflicts</span>
            </div>
            <p
              className={`text-base font-black ${
                stats.totalConflicts > 0 ? 'text-[#D97706]' : 'text-[#17201D]'
              }`}
            >
              {stats.totalConflicts}
            </p>
          </div>
        </div>

        {/* 2. Budget Warning & Optimization CTA */}
        {stats.isOverBudget && (
          <div className="p-4 rounded-2xl bg-[#FFF2EE] border border-[#FF6B4A]/30 mb-5">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[#FF6B4A] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[#E55837]">⚠ Over Budget</h4>
                <p className="text-xs text-[#68736F] mt-0.5">
                  Your current itinerary is approximately {currency}
                  {stats.overBudgetAmount.toLocaleString()} over your target budget of{' '}
                  {currency}{trip.budget.toLocaleString()}.
                </p>

                <button
                  type="button"
                  onClick={() => setShowBudgetTip(!showBudgetTip)}
                  className="mt-2 text-xs font-bold text-[#FF6B4A] hover:text-[#E55837] underline cursor-pointer"
                >
                  {showBudgetTip ? 'Hide suggestion' : 'Optimize Budget'}
                </button>

                {showBudgetTip && (
                  <div className="mt-2 p-2.5 rounded-xl bg-white text-[11px] text-[#5E6B67] border border-[#FF6B4A]/20">
                    💡 <strong>Tip:</strong> Try swapping high-cost premium experiences with
                    free public landmarks or relaxed neighborhood walks to bring costs back into
                    balance.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. AI Insight Panel */}
        {primaryInsight && (
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-[#FFFDF8] to-[#FFF8F5] border border-[#FF6B4A]/25 mb-5 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-extrabold text-[#17201D] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF6B4A]" />
                <span>Your itinerary insight ✨</span>
              </span>
              <span className="text-[10px] font-bold text-[#FF6B4A] bg-[#FFF2EE] px-2 py-0.5 rounded-full border border-[#FF6B4A]/20">
                {primaryInsight.badgeText}
              </span>
            </div>
            <p className="text-xs text-[#5E6B67] leading-relaxed">
              {primaryInsight.message}
            </p>
          </div>
        )}

        {/* 4. Compact Map Preview Placeholder */}
        <div className="relative rounded-2xl overflow-hidden border border-[#EAE6DD] bg-[#EAF2F0] p-4 text-center group">
          {/* Subtle Map Stylized Graphics */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#179E8E_1px,transparent_1px)] [background-size:12px_12px]" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-2xl bg-white shadow-xs flex items-center justify-center text-[#20B8A6] mb-2 group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5 text-[#FF6B4A]" />
            </div>
            <h4 className="text-xs font-extrabold text-[#17201D]">
              {trip.destination} Route Map
            </h4>
            <p className="text-[11px] text-[#68736F] mt-0.5 mb-3">
              Explore geocoded stops, neighborhood clusters, and transit lines.
            </p>

            <button
              type="button"
              onClick={() => navigate(`/trip/${trip.id}/map`)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-[#F9F7F1] border border-[#EAE6DD] text-xs font-bold text-[#17201D] shadow-2xs transition-colors cursor-pointer group-hover:border-[#FF6B4A]/40"
            >
              <span>View route on map</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FF6B4A]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
