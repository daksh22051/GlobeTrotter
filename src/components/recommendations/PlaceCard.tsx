import React from 'react';
import { Star, MapPin, Clock, Sun, Bookmark, Check, Plus, Quote } from 'lucide-react';
import { Recommendation } from '../../types/recommendation';
import { formatCurrency } from '../../utils/currency';

interface PlaceCardProps {
  item: Recommendation;
  isSaved: boolean;
  isAdded: boolean;
  onToggleSave: (id: string) => void;
  onToggleAdd: (item: Recommendation) => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  item,
  isSaved,
  isAdded,
  onToggleSave,
  onToggleAdd,
}) => {
  return (
    <div className="group flex flex-col bg-white rounded-3xl border border-[#EAE6DD] hover:border-[#FF6B4A]/40 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Image Container */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[#202725]">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Badges: Category & Match Score */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          {/* Match Score Badge */}
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white text-xs font-black shadow-xs">
            <span className="text-[#20B8A6]">{item.matchScore}%</span>
            <span className="text-[10px] text-white/80 font-normal">Match</span>
          </div>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(item.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-xs ${
              isSaved
                ? 'bg-[#FF6B4A] text-white'
                : 'bg-black/60 hover:bg-black/80 text-white/90 hover:text-white'
            }`}
            title={isSaved ? 'Remove from bookmarks' : 'Save place'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Bottom Info on Image: Price & Location */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs z-10">
          <div className="flex items-center gap-1 text-white/90 font-semibold truncate max-w-[65%]">
            <MapPin className="w-3.5 h-3.5 text-[#FF8E72] shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[11px] font-extrabold">
            {item.estimatedCost > 0 ? formatCurrency(item.estimatedCost, item.currency) : 'Free Entry'}
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Header Row: Title & Rating */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-extrabold text-[#17201D] group-hover:text-[#FF6B4A] transition-colors leading-snug">
              {item.name}
            </h3>
            <div className="flex items-center gap-1 text-xs font-extrabold text-[#17201D] bg-[#FFF8ED] px-2 py-0.5 rounded-md border border-[#F59E0B]/20 shrink-0">
              <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
              <span>{item.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-[#68736F] leading-relaxed line-clamp-2">
            {item.description}
          </p>

          {/* Duration & Best Time Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {item.duration && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4E5955] bg-[#F4F1EA] px-2.5 py-1 rounded-lg">
                <Clock className="w-3 h-3 text-[#FF6B4A]" />
                <span>{item.duration}</span>
              </span>
            )}
            {item.bestTime && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4E5955] bg-[#F4F1EA] px-2.5 py-1 rounded-lg">
                <Sun className="w-3 h-3 text-[#F59E0B]" />
                <span>{item.bestTime}</span>
              </span>
            )}
          </div>

          {/* Personalized "Why you'll love it" highlight block */}
          {item.whyRecommended && (
            <div className="p-2.5 rounded-2xl bg-[#FFF9F6] border border-[#FF6B4A]/15 text-xs text-[#8C3A24] flex items-start gap-2">
              <Quote className="w-3.5 h-3.5 text-[#FF6B4A] shrink-0 mt-0.5" />
              <p className="leading-snug text-[11px] font-medium">
                <span className="font-bold">Why it matches:</span> {item.whyRecommended}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions & Add to Trip */}
        <div className="pt-2 border-t border-[#F0ECE1] flex items-center justify-between">
          <div className="flex flex-wrap gap-1 max-w-[55%]">
            {(item.tags || []).slice(0, 2).map((tag, tagIdx) => (
              <span key={`${item.id}-tag-${tagIdx}-${tag}`} className="text-[10px] font-semibold text-[#838F8B] bg-[#FCFBF8] border border-[#EAE6DD] px-2 py-0.5 rounded-md">
                #{tag}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onToggleAdd(item)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer shadow-2xs ${
              isAdded
                ? 'bg-[#E6F7F4] text-[#179E8E] border border-[#20B8A6]/30 hover:bg-[#D5F2EC]'
                : 'bg-[#FF6B4A] hover:bg-[#E55837] text-white shadow-xs'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#179E8E]" />
                <span>Added ✓</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Trip</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
