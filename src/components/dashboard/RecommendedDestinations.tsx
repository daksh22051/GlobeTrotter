import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart, ArrowUpRight, MapPin } from 'lucide-react';
import { ScoredDestination } from '../../services/recommendationService';
import { CurrencyCode } from '../../types/profile';
import { formatCurrency } from '../../utils/currency';

interface RecommendedDestinationsProps {
  destinations: ScoredDestination[];
  currency: CurrencyCode;
}

export const RecommendedDestinations: React.FC<RecommendedDestinationsProps> = ({
  destinations,
  currency,
}) => {
  const navigate = useNavigate();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(['bali', 'kyoto']));

  const toggleSave = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section id="recommended-destinations" aria-label="Picked For You" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-extrabold text-[#17201D] tracking-tight">
              Picked for you
            </h3>
          </div>
          <p className="text-xs text-[#68736F]">
            Destinations aligned with your travel interests, style, and pacing
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/explore')}
          className="text-xs font-bold text-[#FF6B4A] hover:text-[#E55837] inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
        >
          <span>View all destinations</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {destinations.map((dest) => {
          const isSaved = savedIds.has(dest.id);
          const formattedDaily = formatCurrency(dest.estimatedDailyBudget, currency);

          return (
            <div
              key={dest.id}
              onClick={() => navigate(`/plan-trip?dest=${encodeURIComponent(dest.id)}&quick=1`)}
              className="group bg-white rounded-3xl overflow-hidden border border-[#EAE6DD] hover:border-[#FF6B4A]/50 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/plan-trip?dest=${encodeURIComponent(dest.id)}&quick=1`)}
              aria-label={`View ${dest.name}, ${dest.country}`}
            >
              {/* Image Container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F4F1EA]">
                <img
                  src={dest.image || dest.imageUrl}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                {/* Save / Favorite Button */}
                <button
                  type="button"
                  onClick={(e) => toggleSave(e, dest.id)}
                  className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer ${
                    isSaved
                      ? 'bg-[#FF6B4A] text-white shadow-xs'
                      : 'bg-black/40 text-white/90 hover:bg-white hover:text-[#FF6B4A]'
                  }`}
                  aria-label={isSaved ? 'Remove from saved' : 'Save destination'}
                >
                  <Heart
                    className={`w-4 h-4 ${isSaved ? 'fill-current' : 'stroke-[2]'}`}
                  />
                </button>

                {/* Bottom Destination Label */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-extrabold tracking-tight truncate drop-shadow-xs">
                      {dest.name}
                    </h4>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300 shrink-0">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{dest.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-white/90 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-[#FF8E72]" />
                    <span>{dest.country}</span>
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                {/* Match Reason or Short Tagline */}
                <p className="text-xs text-[#5E6B67] line-clamp-2 leading-relaxed">
                  {dest.shortDescription || dest.tagline}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {(dest.tags || []).slice(0, 3).map((tag, idx) => (
                    <span
                      key={`${dest.id}-tag-${idx}`}
                      className="px-2 py-0.5 rounded-lg bg-[#F9F7F1] border border-[#EAE6DD] text-[#5E6B67] text-[10px] font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Price & Action Footer */}
                <div className="pt-2.5 border-t border-[#F4F1EA] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#98A29F] uppercase font-bold block">
                      Daily Estimate
                    </span>
                    <span className="text-xs font-black text-[#17201D]">
                      From {formattedDaily}
                      <span className="text-[10px] text-[#98A29F] font-normal"> / day</span>
                    </span>
                  </div>

                  <div className="w-7 h-7 rounded-full bg-[#FFF2EE] text-[#FF6B4A] flex items-center justify-center group-hover:bg-[#FF6B4A] group-hover:text-white transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
