import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Plus,
  SlidersHorizontal,
  MapPin,
  Calendar,
  Layers,
  Map as MapIcon,
} from 'lucide-react';
import { Trip } from '../../types/trip';
import { formatCurrency } from '../../utils/currency';

interface BudgetHeaderProps {
  trip: Trip;
  onOpenAddExpense: () => void;
  onOpenOptimizer: () => void;
  onOpenAllocation: () => void;
}

export const BudgetHeader: React.FC<BudgetHeaderProps> = ({
  trip,
  onOpenAddExpense,
  onOpenOptimizer,
  onOpenAllocation,
}) => {
  const navigate = useNavigate();
  const currency = trip.currency || 'INR';

  return (
    <header className="w-full bg-[#FFFDF8] border-b border-[#EAE6DD] sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        {/* Top breadcrumb & navigation bar */}
        <div className="flex items-center justify-between gap-3 mb-2 sm:mb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/trip/${trip.id}/itinerary`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#EAE6DD] hover:border-[#17201D] text-[#17201D] text-xs font-bold shadow-2xs transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#5E6B67]" />
              <span className="hidden sm:inline">Back to Itinerary</span>
              <span className="sm:hidden">Itinerary</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(`/trip/${trip.id}/map`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#EAE6DD] hover:border-[#17201D] text-[#17201D] text-xs font-bold shadow-2xs transition-all cursor-pointer"
            >
              <MapIcon className="w-3.5 h-3.5 text-[#FF6B4A]" />
              <span className="hidden sm:inline">Map View</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(`/trip/${trip.id}/calendar`)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#EAE6DD] hover:border-[#17201D] text-[#17201D] text-xs font-bold shadow-2xs transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#20B8A6]" />
              <span className="hidden sm:inline">Timeline</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onOpenAllocation}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-white border border-[#EAE6DD] hover:border-[#17201D] text-[#17201D] text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              title="Configure Category Allocations"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#5E6B67]" />
              <span className="hidden md:inline">Allocations</span>
            </button>

            <button
              type="button"
              onClick={onOpenAddExpense}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#17201D] hover:bg-[#2A3833] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </button>

            <button
              type="button"
              onClick={onOpenOptimizer}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-[#FF6B4A] via-[#FF7E5F] to-[#20B8A6] text-white text-xs sm:text-sm font-black shadow-md shadow-[#FF6B4A]/25 hover:shadow-lg hover:shadow-[#FF6B4A]/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FFF275] animate-spin-slow" />
              <span>Optimize Budget ✨</span>
            </button>
          </div>
        </div>

        {/* Title, destination badge & subtitle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
          <div>
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFF2EE] text-[#FF6B4A] text-[11px] font-extrabold border border-[#FFE0D6]">
                <MapPin className="w-3 h-3" />
                {trip.destination}, {trip.country}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F5F3FF] text-[#8B5CF6] text-[11px] font-bold border border-[#DDD6FE]">
                <Calendar className="w-3 h-3" />
                {trip.durationDays || 3} Days
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E6FAF8] text-[#0D9488] text-[11px] font-bold border border-[#B2F0E8]">
                <Layers className="w-3 h-3" />
                {trip.travelersCount || 1} {trip.travelersCount === 1 ? 'Traveler' : 'Travelers'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#17201D] tracking-tight">
              Your trip budget
            </h1>
            <p className="text-xs sm:text-sm text-[#68736F] mt-0.5">
              Stay on track without compromising the experiences that matter.
            </p>
          </div>

          <div className="text-right hidden lg:block">
            <div className="text-[11px] font-bold text-[#8A9591] uppercase tracking-wider">
              Total Budget
            </div>
            <div className="text-xl font-black text-[#17201D]">
              {formatCurrency(trip.budget || 50000, currency)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
