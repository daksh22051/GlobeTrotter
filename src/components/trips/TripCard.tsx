import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trip } from '../../types/trip';
import { TripCoverImage } from './TripCoverImage';
import { determineNextTripAction } from '../../utils/nextTripAction';
import {
  Calendar,
  MapPin,
  Users,
  MoreVertical,
  Heart,
  Pin,
  Copy,
  Trash2,
  Edit3,
  ExternalLink,
  ArrowRight,
  FileText,
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

        {/* Floating Favorite and More Actions */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
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

      {/* 2. Card Body: Essential trip details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Meta Line: Dates & Travelers */}
        <div className="flex items-center justify-between text-xs text-[#556960] font-medium border-b border-[#F4F1EA] pb-3">
          <div className="flex items-center gap-1.5 truncate">
            <Calendar className="w-3.5 h-3.5 text-[#8C9B95] shrink-0" />
            <span className="truncate">{trip.dateDisplay || `${trip.startDate || 'TBD'}`}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2 font-semibold text-[#17201D]">
            <Users className="w-3.5 h-3.5 text-[#8C9B95]" />
            <span>{travelersCount} {travelersCount === 1 ? 'traveler' : 'travelers'}</span>
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

        </div>
      </div>
    </div>
  );
};
