import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trip } from '../../types/trip';
import { TripCoverImage } from './TripCoverImage';
import { getTripStatus, getTripCountdown } from '../../utils/tripStatus';
import { calculateTripProgress } from '../../utils/tripProgressCalculator';
import { calculateTripHealthSummary } from '../../utils/tripHealthSummary';
import { determineNextTripAction } from '../../utils/nextTripAction';
import { formatCurrency } from '../../utils/currency';
import {
  Calendar,
  MapPin,
  Users,
  Wallet,
  MoreVertical,
  Heart,
  Pin,
  Copy,
  Trash2,
  Edit3,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  FileText,
  Activity,
} from 'lucide-react';

interface TripCardProps {
  trip: Trip;
  onEdit: (trip: Trip) => void;
  onDuplicate: (trip: Trip) => void;
  onDelete: (trip: Trip) => void;
  onToggleFavorite: (tripId: string) => void;
  onTogglePin: (tripId: string) => void;
  onOpenSummary: (trip: Trip) => void;
}

export const TripCard: React.FC<TripCardProps> = ({
  trip,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite,
  onTogglePin,
  onOpenSummary,
}) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const status = getTripStatus(trip);
  const countdown = getTripCountdown(trip);
  const progress = calculateTripProgress(trip);
  const health = calculateTripHealthSummary(trip);
  const nextAction = determineNextTripAction(trip);

  const travelersCount = trip.travelersCount || 1;

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Avoid triggering when clicking internal interactive buttons
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('select')) {
      return;
    }
    navigate(`/trip/${trip.id}/itinerary`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col bg-white rounded-3xl border transition-all duration-300 overflow-hidden shadow-2xs hover:shadow-xl hover:-translate-y-1 cursor-pointer ${
        trip.isPinned ? 'border-[#20B8A6] ring-1 ring-[#20B8A6]/20' : 'border-[#EAE6DD] hover:border-[#17201D]/30'
      }`}
    >
      {/* 1. Card Top: Destination Image & Floating Badges */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[#FAF8F5]">
        <TripCoverImage
          src={trip.coverImage}
          destination={trip.destination}
          tripName={trip.name}
          imageClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        {/* Top Badges: Status + Pinned/Favorite Icons */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          {/* Status Badge */}
          <div className="flex items-center gap-1.5">
            {status === 'upcoming' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#17201D]/80 backdrop-blur-md text-[#FAF8F5] border border-white/20 shadow-xs">
                <Calendar className="w-3 h-3 text-[#FF6B4A]" />
                {countdown.label}
              </span>
            )}
            {status === 'ongoing' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#20B8A6] text-white shadow-xs animate-pulse">
                <Clock className="w-3 h-3" />
                {countdown.label}
              </span>
            )}
            {status === 'completed' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#556960]/90 backdrop-blur-md text-white border border-white/20">
                <CheckCircle2 className="w-3 h-3 text-[#20B8A6]" />
                Completed
              </span>
            )}
            {status === 'draft' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#E08A00] text-white shadow-xs">
                <Sparkles className="w-3 h-3" />
                Draft
              </span>
            )}

            {trip.isPinned && (
              <span className="inline-flex items-center gap-0.5 px-2 py-1 rounded-full text-[10px] font-bold bg-[#E8F8F5] text-[#1F8A70] border border-[#B2E6DC] shadow-xs">
                <Pin className="w-3 h-3 fill-[#1F8A70]" />
                Pinned
              </span>
            )}
          </div>

          {/* Quick Floating Actions (Heart & Menu) */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(trip.id);
              }}
              aria-label={trip.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                trip.isFavorite
                  ? 'bg-white text-[#FF6B4A] shadow-md scale-105'
                  : 'bg-black/40 text-white hover:bg-white hover:text-[#FF6B4A]'
              }`}
            >
              <Heart className={`w-4 h-4 ${trip.isFavorite ? 'fill-[#FF6B4A]' : ''}`} />
            </button>

            {/* Context Menu Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                aria-label="Trip actions menu"
                className="p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-white hover:text-[#17201D] transition-all cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-[#EAE6DD] py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150 text-xs font-semibold text-[#17201D]"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate(`/trip/${trip.id}/itinerary`);
                    }}
                    className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#68736F]" />
                    <span>Open Trip Workspace</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenSummary(trip);
                    }}
                    className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#68736F]" />
                    <span>View Quick Summary</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onEdit(trip);
                    }}
                    className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#68736F]" />
                    <span>Edit Trip Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onDuplicate(trip);
                    }}
                    className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#68736F]" />
                    <span>Duplicate Trip</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onTogglePin(trip.id);
                    }}
                    className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    <Pin className="w-3.5 h-3.5 text-[#68736F]" />
                    <span>{trip.isPinned ? 'Unpin Trip' : 'Pin to Top'}</span>
                  </button>

                  <div className="my-1 border-t border-[#F4F1EA]" />

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onDelete(trip);
                    }}
                    className="w-full px-3.5 py-2 text-left flex items-center gap-2 text-[#E5484D] hover:bg-[#FFF0F0] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Trip</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Floating Info Over Image */}
        <div className="absolute bottom-3 left-3 right-3 text-white z-10">
          <div className="flex items-center gap-1.5 text-xs text-white/90 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#FF6B4A] shrink-0" />
            <span className="truncate">
              {trip.destination}
              {trip.country && trip.country !== trip.destination ? ` · ${trip.country}` : ''}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight truncate mt-0.5">
            {trip.name}
          </h3>
        </div>
      </div>

      {/* 2. Card Body: Dates, Travelers, Health, Budget */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Meta Line: Dates & Travelers */}
        <div className="flex items-center justify-between text-xs text-[#556960] font-medium border-b border-[#F4F1EA] pb-3">
          <div className="flex items-center gap-1.5 truncate">
            <Calendar className="w-3.5 h-3.5 text-[#8C9B95] shrink-0" />
            <span className="truncate">{trip.dateDisplay || `${trip.startDate || 'TBD'}`}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2 font-semibold text-[#17201D]">
            <Users className="w-3.5 h-3.5 text-[#8C9B95]" />
            <span>
              {trip.durationDays || 3}d · {travelersCount} {travelersCount === 1 ? 'pax' : 'pax'}
            </span>
          </div>
        </div>

        {/* Financial & Health Matrix */}
        <div className="grid grid-cols-2 gap-2">
          {/* Budget Widget */}
          <div className="bg-[#FAF8F5] rounded-2xl p-2.5 border border-[#EAE6DD]/60">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C9B95] flex items-center gap-1">
              <Wallet className="w-3 h-3 text-[#FF6B4A]" />
              Budget
            </div>
            <div className="text-sm font-extrabold text-[#17201D] mt-0.5 truncate">
              {formatCurrency(trip.budget || 50000, trip.currency || 'INR')}
            </div>
          </div>

          {/* Health Score Widget */}
          <div className={`rounded-2xl p-2.5 border ${health.badgeBg}`}>
            <div className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1 text-[#68736F]">
                <Activity className="w-3 h-3 text-[#20B8A6]" />
                Health
              </span>
              <span className={`font-extrabold ${health.colorClass}`}>{health.score}</span>
            </div>
            <div className={`text-xs font-bold truncate mt-0.5 ${health.badgeText}`}>
              {health.label}
            </div>
          </div>
        </div>

        {/* Planning Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#68736F] flex items-center gap-1">
              <span>Planning</span>
              <span className="text-[10px] font-normal text-[#8C9B95]">
                ({progress.scheduledActivitiesCount} activities)
              </span>
            </span>
            <span className="font-extrabold text-[#17201D]">{progress.percentage}%</span>
          </div>
          <div className="w-full h-2 bg-[#F4F1EA] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progress.percentage >= 80
                  ? 'bg-[#20B8A6]'
                  : progress.percentage >= 40
                  ? 'bg-[#FF6B4A]'
                  : 'bg-[#E08A00]'
              }`}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        {/* 3. Card Footer: Primary CTA & Summary Trigger */}
        <div className="pt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(nextAction.route);
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-2xl bg-[#17201D] hover:bg-[#FF6B4A] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer group/btn"
          >
            <span>{nextAction.ctaText}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenSummary(trip);
            }}
            title="View quick trip summary"
            className="p-2.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#F4F1EA] border border-[#EAE6DD] text-[#556960] hover:text-[#17201D] transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
