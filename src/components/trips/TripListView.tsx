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
  ArrowRight,
  Clock,
  CheckCircle2,
  FileText,
  Activity,
  Sparkles,
} from 'lucide-react';

interface TripListViewProps {
  trips: Trip[];
  onEdit: (trip: Trip) => void;
  onDuplicate: (trip: Trip) => void;
  onDelete: (trip: Trip) => void;
  onToggleFavorite: (tripId: string) => void;
  onTogglePin: (tripId: string) => void;
  onOpenSummary: (trip: Trip) => void;
}

export const TripListView: React.FC<TripListViewProps> = ({
  trips,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite,
  onTogglePin,
  onOpenSummary,
}) => {
  return (
    <div className="space-y-3">
      {trips.map((trip) => (
        <TripListItem
          key={trip.id}
          trip={trip}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onToggleFavorite={onToggleFavorite}
          onTogglePin={onTogglePin}
          onOpenSummary={onOpenSummary}
        />
      ))}
    </div>
  );
};

interface TripListItemProps {
  trip: Trip;
  onEdit: (trip: Trip) => void;
  onDuplicate: (trip: Trip) => void;
  onDelete: (trip: Trip) => void;
  onToggleFavorite: (tripId: string) => void;
  onTogglePin: (tripId: string) => void;
  onOpenSummary: (trip: Trip) => void;
}

const TripListItem: React.FC<TripListItemProps> = ({
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

  const handleRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) return;
    navigate(`/trip/${trip.id}/itinerary`);
  };

  return (
    <div
      onClick={handleRowClick}
      className={`group relative bg-white border rounded-2xl p-3 sm:p-4 transition-all duration-200 shadow-2xs hover:shadow-md hover:border-[#17201D]/30 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        trip.isPinned ? 'border-[#20B8A6] ring-1 ring-[#20B8A6]/20' : 'border-[#EAE6DD]'
      }`}
    >
      {/* Left: Thumbnail & Details */}
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        {/* Cover Thumbnail */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 relative bg-[#FAF8F5]">
          <TripCoverImage
            src={trip.coverImage}
            destination={trip.destination}
            tripName={trip.name}
            imageClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {trip.isPinned && (
            <div className="absolute top-1 left-1 p-0.5 rounded-md bg-white/90 text-[#1F8A70]">
              <Pin className="w-3 h-3 fill-[#1F8A70]" />
            </div>
          )}
        </div>

        {/* Info text */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Pill */}
            {status === 'upcoming' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#FFF2EE] text-[#FF6B4A] border border-[#FFD9CE]">
                <Calendar className="w-2.5 h-2.5" />
                {countdown.label}
              </span>
            )}
            {status === 'ongoing' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#E8F8F5] text-[#1F8A70] border border-[#B2E6DC] animate-pulse">
                <Clock className="w-2.5 h-2.5" />
                {countdown.label}
              </span>
            )}
            {status === 'completed' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#FAF8F5] text-[#556960] border border-[#EAE6DD]">
                <CheckCircle2 className="w-2.5 h-2.5 text-[#20B8A6]" />
                Completed
              </span>
            )}
            {status === 'draft' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#FFF8ED] text-[#E08A00] border border-[#FCE2B6]">
                <Sparkles className="w-2.5 h-2.5" />
                Draft
              </span>
            )}

            <span className="text-[11px] font-bold text-[#8C9B95] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#FF6B4A]" />
              <span className="truncate">
                {trip.destination}
                {trip.country && trip.country !== trip.destination ? `, ${trip.country}` : ''}
              </span>
            </span>
          </div>

          <h3 className="text-base font-extrabold text-[#17201D] tracking-tight truncate">
            {trip.name}
          </h3>

          <div className="flex items-center gap-3 text-xs text-[#68736F] font-medium truncate">
            <span className="truncate">{trip.dateDisplay || trip.startDate || 'Dates TBD'}</span>
            <span>•</span>
            <span>
              {trip.durationDays || 3}d ({travelersCount} pax)
            </span>
          </div>
        </div>
      </div>

      {/* Middle Stats: Budget & Health & Progress */}
      <div className="flex items-center gap-6 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#F4F1EA]">
        {/* Budget */}
        <div className="hidden lg:block text-right">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C9B95]">Budget</div>
          <div className="text-xs font-extrabold text-[#17201D]">
            {formatCurrency(trip.budget || 50000, trip.currency || 'INR')}
          </div>
        </div>

        {/* Planning Progress */}
        <div className="w-28 sm:w-36 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-[#68736F]">Planning</span>
            <span className="font-extrabold text-[#17201D]">{progress.percentage}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#F4F1EA] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[#20B8A6]"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        {/* Health */}
        <div className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${health.badgeBg} ${health.badgeText}`}>
          <Activity className="w-3.5 h-3.5" />
          <span>{health.score}</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 pt-2 md:pt-0">
        {/* Quick CTA */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(nextAction.route);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#17201D] hover:bg-[#FF6B4A] text-white text-xs font-bold transition-colors cursor-pointer"
        >
          <span>{nextAction.ctaText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {/* Favorite toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(trip.id);
          }}
          aria-label={trip.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
            trip.isFavorite
              ? 'bg-[#FFF2EE] border-[#FFD9CE] text-[#FF6B4A]'
              : 'border-[#EAE6DD] text-[#8C9B95] hover:text-[#FF6B4A] hover:bg-[#F9F7F1]'
          }`}
        >
          <Heart className={`w-4 h-4 ${trip.isFavorite ? 'fill-[#FF6B4A]' : ''}`} />
        </button>

        {/* Summary Modal Trigger */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenSummary(trip);
          }}
          title="View summary"
          className="p-2 rounded-xl border border-[#EAE6DD] text-[#556960] hover:text-[#17201D] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
        >
          <FileText className="w-4 h-4" />
        </button>

        {/* ⋯ Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            aria-label="More actions"
            className="p-2 rounded-xl border border-[#EAE6DD] text-[#556960] hover:text-[#17201D] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-full mt-1 w-44 bg-white rounded-2xl shadow-xl border border-[#EAE6DD] py-1.5 z-30 animate-in fade-in zoom-in-95 duration-150 text-xs font-semibold text-[#17201D]"
            >
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate(`/trip/${trip.id}/itinerary`);
                }}
                className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-[#FAF8F5] cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#68736F]" />
                <span>Open Workspace</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onEdit(trip);
                }}
                className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-[#FAF8F5] cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#68736F]" />
                <span>Edit Trip</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onDuplicate(trip);
                }}
                className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-[#FAF8F5] cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-[#68736F]" />
                <span>Duplicate</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onTogglePin(trip.id);
                }}
                className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-[#FAF8F5] cursor-pointer"
              >
                <Pin className="w-3.5 h-3.5 text-[#68736F]" />
                <span>{trip.isPinned ? 'Unpin' : 'Pin to Top'}</span>
              </button>

              <div className="my-1 border-t border-[#F4F1EA]" />

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onDelete(trip);
                }}
                className="w-full px-3.5 py-2 text-left flex items-center gap-2 text-[#E5484D] hover:bg-[#FFF0F0] cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Trip</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
