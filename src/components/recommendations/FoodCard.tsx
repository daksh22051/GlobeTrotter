import React from 'react';
import { Star, MapPin, UtensilsCrossed, Bookmark, Check, Plus, Quote, Clock } from 'lucide-react';
import { Recommendation } from '../../types/recommendation';
import { formatCurrency } from '../../utils/currency';
import { getActivityImage, handleActivityImageError } from '../../utils/activityImage';

interface FoodCardProps {
  item: Recommendation;
  isSaved: boolean;
  isAdded: boolean;
  onToggleSave: (id: string) => void;
  onToggleAdd: (item: Recommendation) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  item,
  isSaved,
  isAdded,
  onToggleSave,
  onToggleAdd,
}) => {
  const foodInfo = item.foodDetails;

  return (
    <div className="group flex flex-col bg-white rounded-3xl border border-[#EAE6DD] hover:border-[#F59E0B]/40 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Image Container */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[#202725]">
        <img
          src={getActivityImage(item)}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(event) => handleActivityImageError(event, item)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white text-xs font-black shadow-xs">
            <span className="text-[#F59E0B]">{item.matchScore}%</span>
            <span className="text-[10px] text-white/80 font-normal">Match</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(item.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-xs ${
              isSaved
                ? 'bg-[#F59E0B] text-white'
                : 'bg-black/60 hover:bg-black/80 text-white/90 hover:text-white'
            }`}
            title={isSaved ? 'Remove from bookmarks' : 'Save dining'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Bottom Details on Image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs z-10">
          <div className="flex items-center gap-1 text-white/90 font-semibold truncate max-w-[65%]">
            <UtensilsCrossed className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
            <span className="truncate">{foodInfo?.cuisine || 'Local Gastronomy'}</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-xs font-black">
            {formatCurrency(item.estimatedCost, item.currency)}
            <span className="text-[10px] font-normal text-white/80"> / meal</span>
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Title & Rating */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-extrabold text-[#17201D] group-hover:text-[#F59E0B] transition-colors leading-snug">
              {item.name}
            </h3>
            <div className="flex items-center gap-1 text-xs font-extrabold text-[#17201D] bg-[#FFF8ED] px-2 py-0.5 rounded-md border border-[#F59E0B]/20 shrink-0">
              <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
              <span>{item.rating.toFixed(1)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-[#68736F]">
            <MapPin className="w-3 h-3 text-[#838F8B]" />
            <span className="truncate">{item.location}</span>
          </div>

          <p className="text-xs text-[#68736F] leading-relaxed line-clamp-2">
            {item.description}
          </p>

          {/* Signature Dish & Timing Chips */}
          <div className="space-y-1.5 pt-1">
            {foodInfo?.signatureDish && (
              <div className="flex items-center gap-1.5 text-xs text-[#4E5955] bg-[#F4F1EA] px-2.5 py-1 rounded-lg">
                <span className="font-bold text-[#17201D] text-[11px]">Must try:</span>
                <span className="text-[11px] truncate">{foodInfo.signatureDish}</span>
              </div>
            )}
            {item.bestTime && (
              <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#838F8B]">
                <Clock className="w-3 h-3 text-[#838F8B]" />
                <span>{item.bestTime}</span>
              </div>
            )}
          </div>

          {/* Personalized Why it matches */}
          {item.whyRecommended && (
            <div className="p-2.5 rounded-2xl bg-[#FFFDF7] border border-[#F59E0B]/25 text-xs text-[#8A5A00] flex items-start gap-2">
              <Quote className="w-3.5 h-3.5 text-[#F59E0B] shrink-0 mt-0.5" />
              <p className="leading-snug text-[11px] font-medium">
                <span className="font-bold">Why it matches:</span> {item.whyRecommended}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
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
                <span>Add Food</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
