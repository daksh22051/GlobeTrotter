import React from 'react';
import { Check, Clock, MapPin, Plus, Wallet } from 'lucide-react';
import { Recommendation, RecommendationCategory } from '../../types/recommendation';
import { formatCurrency } from '../../utils/currency';
import { getActivityImage, handleActivityImageError } from '../../utils/activityImage';

interface CategoryRecommendationPanelProps {
  category: RecommendationCategory;
  recommendations: Recommendation[];
  addedRecommendationIds: string[];
  currency: string;
  dayNumber: number;
  onAdd: (recommendation: Recommendation, dayNumber: number) => void;
  onRemove: (recommendation: Recommendation) => void;
}

const CATEGORY_LABELS: Record<RecommendationCategory, string> = {
  hotel: 'Hotels & Stays',
  food: 'Food & Dining',
  place: 'Sightseeing Attractions',
  experience: 'Experiences',
};

export const CategoryRecommendationPanel: React.FC<CategoryRecommendationPanelProps> = ({
  category,
  recommendations,
  addedRecommendationIds,
  currency,
  dayNumber,
  onAdd,
  onRemove,
}) => (
  <section className="bg-white rounded-3xl border border-[#EAE6DD] shadow-2xs p-5 sm:p-6 space-y-5">
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#F4F1EA] pb-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#FF6B4A]">Day {dayNumber} planning</p>
        <h2 className="text-xl font-black text-[#17201D] mt-1">{CATEGORY_LABELS[category]}</h2>
        <p className="text-xs text-[#68736F] mt-1">Select an option to add it directly to your day timeline.</p>
      </div>
      <span className="text-xs font-bold text-[#68736F]">{recommendations.length} recommendations</span>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {recommendations.map((recommendation) => {
        const isAdded = addedRecommendationIds.includes(recommendation.id);
        return (
          <article key={recommendation.id} className="flex gap-3 rounded-2xl border border-[#EAE6DD] bg-[#FCFBF8] p-3.5">
            <img
              src={getActivityImage(recommendation)}
              alt={recommendation.name}
              className="w-20 h-20 rounded-xl object-cover shrink-0"
              referrerPolicy="no-referrer"
              onError={(event) => handleActivityImageError(event, recommendation)}
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-extrabold text-[#17201D] line-clamp-2">{recommendation.name}</h3>
              <p className="text-[11px] text-[#68736F] truncate mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#FF6B4A] shrink-0" /> {recommendation.location}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-[#68736F] mt-1.5">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{recommendation.duration || 'Flexible'}</span>
                <span className="flex items-center gap-1 font-bold text-[#17201D]"><Wallet className="w-3 h-3 text-[#20B8A6]" />{formatCurrency(recommendation.estimatedCost, currency)}</span>
              </div>
              <button
                type="button"
                onClick={() => isAdded ? onRemove(recommendation) : onAdd(recommendation, dayNumber)}
                className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold cursor-pointer ${isAdded ? 'bg-[#EAF8F5] text-[#179E8E] border border-[#20B8A6]/30' : 'bg-[#FF6B4A] text-white hover:bg-[#E55837]'}`}
              >
                {isAdded ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                {isAdded ? 'Added to timeline' : 'Add to timeline'}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  </section>
);