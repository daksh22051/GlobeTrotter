import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Navigation,
  Wallet,
  Activity,
  ChevronUp,
  ChevronDown,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { TripMapStats } from '../../types/map';
import { locationService } from '../../services/locationService';

interface RouteSummaryCardProps {
  stats: TripMapStats;
  selectedDayNumber: number | 'all';
}

export const RouteSummaryCard: React.FC<RouteSummaryCardProps> = ({
  stats,
  selectedDayNumber,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-[#EAE6DD] shadow-xl overflow-hidden font-sans transition-all">
      {/* Header Bar */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#FFFDF8] border-b border-[#EAE6DD] text-left hover:bg-[#F9F7F1] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#FFF0ED] text-[#FF6B4A] flex items-center justify-center text-xs">
            🗺️
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-[#17201D]">
              {selectedDayNumber === 'all'
                ? 'Trip Journey Summary'
                : `Day ${selectedDayNumber} Summary`}
            </h3>
            <span className="text-[10px] text-[#838F8B]">Calculated from stops</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Route Health Pill */}
          <div
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
              stats.healthStatus === 'Excellent'
                ? 'bg-[#DDF7F2] text-[#179E8E]'
                : stats.healthStatus === 'Great'
                ? 'bg-[#FEF3C7] text-[#D97706]'
                : 'bg-[#FFE4DD] text-[#FF6B4A]'
            }`}
          >
            {stats.healthStatus === 'Excellent' ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <AlertCircle className="w-3 h-3" />
            )}
            <span>Route: {stats.healthStatus}</span>
          </div>

          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-[#838F8B]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#838F8B]" />
          )}
        </div>
      </button>

      {/* Expanded Metrics Grid */}
      {isExpanded && (
        <div className="p-3.5 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            {/* Total Places */}
            <div className="p-2 rounded-xl bg-[#F9F7F1] border border-[#EAE6DD]/70">
              <span className="text-[10px] font-bold text-[#838F8B] uppercase">
                Places
              </span>
              <div className="text-sm font-black text-[#17201D] mt-0.5">
                {stats.totalPlaces}
              </div>
            </div>

            {/* Est Distance */}
            <div className="p-2 rounded-xl bg-[#F9F7F1] border border-[#EAE6DD]/70">
              <span className="text-[10px] font-bold text-[#838F8B] uppercase">
                Est. Distance
              </span>
              <div className="text-sm font-black text-[#17201D] mt-0.5">
                {stats.totalDistanceKm} km
              </div>
            </div>

            {/* Est Travel Time */}
            <div className="p-2 rounded-xl bg-[#F9F7F1] border border-[#EAE6DD]/70">
              <span className="text-[10px] font-bold text-[#838F8B] uppercase">
                Est. Travel
              </span>
              <div className="text-sm font-black text-[#17201D] mt-0.5">
                {locationService.formatTravelTime(stats.totalTravelMinutes)}
              </div>
            </div>
          </div>

          {/* Second Row: Activity Cost & Conflicts */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#EAE6DD]">
              <div className="flex items-center gap-1.5 text-xs text-[#68736F]">
                <Wallet className="w-3.5 h-3.5 text-[#FF6B4A]" />
                <span>Est. Activity Cost</span>
              </div>
              <span className="text-xs font-bold text-[#17201D]">
                ₹{stats.totalCost.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#EAE6DD]">
              <div className="flex items-center gap-1.5 text-xs text-[#68736F]">
                <Activity className="w-3.5 h-3.5 text-[#20B8A6]" />
                <span>Time Conflicts</span>
              </div>
              <span
                className={`text-xs font-bold ${
                  stats.conflictsCount === 0 ? 'text-[#20B8A6]' : 'text-[#E55837]'
                }`}
              >
                {stats.conflictsCount}
              </span>
            </div>
          </div>

          {/* Route Assessment Banner */}
          <div className="p-2.5 rounded-xl bg-[#FFF8ED] border border-[#FFE4DD]/80 flex items-start gap-2 text-[11px] text-[#5E6B67]">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6B4A] shrink-0 mt-0.5" />
            <div className="leading-snug">
              <span className="font-bold text-[#17201D]">Route Quality ({stats.healthScore}/100): </span>
              {stats.healthMessage}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
