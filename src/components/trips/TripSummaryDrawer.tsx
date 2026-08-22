import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trip } from '../../types/trip';
import { TripCoverImage } from './TripCoverImage';
import { getTripStatus, getTripCountdown } from '../../utils/tripStatus';
import { calculateTripProgress } from '../../utils/tripProgressCalculator';
import { calculateTripHealthSummary } from '../../utils/tripHealthSummary';
import { determineNextTripAction } from '../../utils/nextTripAction';
import { formatCurrency } from '../../utils/currency';
import {
  X,
  MapPin,
  Calendar,
  Users,
  Wallet,
  Compass,
  Map,
  Activity,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface TripSummaryDrawerProps {
  trip: Trip | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (trip: Trip) => void;
  onDuplicate: (trip: Trip) => void;
  onDelete: (trip: Trip) => void;
}

export const TripSummaryDrawer: React.FC<TripSummaryDrawerProps> = ({
  trip,
  isOpen,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const navigate = useNavigate();

  if (!isOpen || !trip) return null;

  const status = getTripStatus(trip);
  const countdown = getTripCountdown(trip);
  const progress = calculateTripProgress(trip);
  const health = calculateTripHealthSummary(trip);
  const nextAction = determineNextTripAction(trip);

  const travelersCount = trip.travelersCount || 1;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#17201D]/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-[#FFFDF8] h-full shadow-2xl flex flex-col overflow-hidden border-l border-[#EAE6DD] animate-in slide-in-from-right duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-trip-name"
      >
        {/* Top Sticky Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#EAE6DD] flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FAF8F5] border border-[#EAE6DD] text-[#17201D]">
              <Compass className="w-3.5 h-3.5 text-[#FF6B4A]" />
              Journey Summary
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${health.badgeBg} ${health.badgeText}`}>
              <Activity className="w-3 h-3" />
              Health: {health.score}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="p-2 text-[#8C9B95] hover:text-[#17201D] hover:bg-[#F4F1EA] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Cover & Core Header */}
          <div className="rounded-2xl overflow-hidden relative h-52 sm:h-60 shadow-md border border-[#EAE6DD]">
            <TripCoverImage
              src={trip.coverImage}
              destination={trip.destination}
              tripName={trip.name}
              imageClassName="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center gap-1.5 text-xs text-white/90 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#FF6B4A]" />
                <span>
                  {trip.destination}
                  {trip.country && trip.country !== trip.destination ? ` · ${trip.country}` : ''}
                </span>
              </div>
              <h2
                id="drawer-trip-name"
                className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-0.5"
              >
                {trip.name}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/20">
                  {countdown.label}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-black/40 backdrop-blur-md text-white/90">
                  {trip.tripType?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-3 border border-[#EAE6DD] shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C9B95] flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#FF6B4A]" />
                Duration
              </div>
              <div className="text-sm font-extrabold text-[#17201D] mt-1">
                {trip.durationDays || 3} Days
              </div>
              <div className="text-[10px] text-[#68736F] truncate mt-0.5">
                {trip.dateDisplay || 'Dates set'}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-3 border border-[#EAE6DD] shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C9B95] flex items-center gap-1">
                <Users className="w-3 h-3 text-[#20B8A6]" />
                Travelers
              </div>
              <div className="text-sm font-extrabold text-[#17201D] mt-1">
                {travelersCount} {travelersCount === 1 ? 'Person' : 'People'}
              </div>
              <div className="text-[10px] text-[#68736F] truncate mt-0.5">
                {trip.travelPace || 'Balanced'} pace
              </div>
            </div>

            <div className="bg-white rounded-2xl p-3 border border-[#EAE6DD] shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C9B95] flex items-center gap-1">
                <Wallet className="w-3 h-3 text-[#E08A00]" />
                Budget
              </div>
              <div className="text-sm font-extrabold text-[#17201D] mt-1">
                {formatCurrency(trip.budget || 50000, trip.currency || 'INR')}
              </div>
              <div className="text-[10px] text-[#68736F] truncate mt-0.5">
                {trip.budgetStyle || 'Standard'} tier
              </div>
            </div>
          </div>

          {/* Smart Next Action Highlight */}
          <div className="bg-gradient-to-r from-[#FFF8ED] to-[#FFF2EE] border border-[#FCE2B6] rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#E08A00] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Recommended Next Step
              </span>
              <span className="text-[10px] font-extrabold text-[#FF6B4A] uppercase">
                {nextAction.priority} Priority
              </span>
            </div>
            <div className="text-sm font-extrabold text-[#17201D]">{nextAction.label}</div>
            <p className="text-xs text-[#68736F]">{nextAction.description}</p>
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate(nextAction.route);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#17201D] hover:bg-[#FF6B4A] text-white text-xs font-bold transition-all cursor-pointer mt-1"
            >
              <span>{nextAction.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Planning Progress Breakdown */}
          <div className="bg-white rounded-2xl p-4 border border-[#EAE6DD] space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#17201D] uppercase tracking-wider">
                Planning Readiness ({progress.percentage}%)
              </span>
              <span className="text-xs font-extrabold text-[#20B8A6]">
                {progress.isFullyPlanned ? 'Ready to Travel' : 'In Progress'}
              </span>
            </div>

            <div className="w-full h-2.5 bg-[#F4F1EA] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FF6B4A] via-[#FF8E72] to-[#20B8A6] transition-all duration-500"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>

            {/* Checklist items */}
            <div className="space-y-1.5 pt-1 text-xs">
              {progress.completedTasks.map((task, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[#1F8A70]">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#20B8A6]" />
                  <span>{task}</span>
                </div>
              ))}

              {progress.pendingTasks.map((task, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[#68736F]">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-[#D1DDD7] shrink-0" />
                  <span>{task}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Navigation Links to Trip Workspaces */}
          <div className="bg-white rounded-2xl p-4 border border-[#EAE6DD] space-y-2 shadow-2xs">
            <div className="text-xs font-bold text-[#17201D] uppercase tracking-wider mb-2">
              Trip Workspaces
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/trip/${trip.id}/itinerary`);
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#FFF2EE] hover:text-[#FF6B4A] border border-[#EAE6DD] text-xs font-bold transition-all text-left cursor-pointer group"
              >
                <span className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#FF6B4A]" />
                  <span>Itinerary Builder</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#8C9B95] group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/trip/${trip.id}/map`);
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#E8F8F5] hover:text-[#1F8A70] border border-[#EAE6DD] text-xs font-bold transition-all text-left cursor-pointer group"
              >
                <span className="flex items-center gap-2">
                  <Map className="w-4 h-4 text-[#20B8A6]" />
                  <span>Interactive Map</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#8C9B95] group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/trip/${trip.id}/budget`);
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#FFF8ED] hover:text-[#E08A00] border border-[#EAE6DD] text-xs font-bold transition-all text-left cursor-pointer group"
              >
                <span className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#E08A00]" />
                  <span>Budget Tracker</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#8C9B95] group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/trip/${trip.id}/calendar`);
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] hover:bg-[#FFF2EE] hover:text-[#FF6B4A] border border-[#EAE6DD] text-xs font-bold transition-all text-left cursor-pointer group"
              >
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#FF6B4A]" />
                  <span>Timeline Calendar</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#8C9B95] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Actions Footer */}
        <div className="p-4 bg-white border-t border-[#EAE6DD] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(trip);
              }}
              className="px-3.5 py-2.5 rounded-xl border border-[#EAE6DD] hover:bg-[#FAF8F5] text-xs font-bold text-[#17201D] transition-colors cursor-pointer"
            >
              Edit Details
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onDuplicate(trip);
              }}
              className="px-3.5 py-2.5 rounded-xl border border-[#EAE6DD] hover:bg-[#FAF8F5] text-xs font-bold text-[#17201D] transition-colors cursor-pointer"
            >
              Duplicate
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              navigate(`/trip/${trip.id}/itinerary`);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B4A] to-[#FF8E72] hover:from-[#E85535] hover:to-[#FF7859] text-white text-xs font-bold shadow-md shadow-[#FF6B4A]/25 transition-all cursor-pointer"
          >
            <span>Open Trip Workspace</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
