import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Bookmark,
  Sparkles,
  Plus,
  Check,
  Compass,
  Utensils,
  Hotel,
  Landmark,
  Clock,
  Wallet,
  GripVertical,
} from 'lucide-react';
import { Recommendation, RecommendationCategory } from '../../types/recommendation';
import { ItineraryActivity } from '../../types/itinerary';
import { mockRecommendations } from '../../data/mockRecommendations';

interface RecommendationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  targetDayNumber: number;
  savedRecommendations: Recommendation[];
  allRecommendations: Recommendation[];
  addedActivityRecommendationIds: string[];
  onAddRecommendation: (rec: Recommendation, dayNumber: number) => void;
  currency: string;
  initialFilter?: RecommendationCategory | 'all';
}

export const RecommendationDrawer: React.FC<RecommendationDrawerProps> = ({
  isOpen,
  onClose,
  targetDayNumber,
  savedRecommendations,
  allRecommendations,
  addedActivityRecommendationIds,
  onAddRecommendation,
  currency,
  initialFilter = 'all',
}) => {
  const [activeTab, setActiveTab] = useState<'saved' | 'recommended' | 'search'>('recommended');
  const [selectedCategory, setSelectedCategory] = useState<RecommendationCategory | 'all'>(
    initialFilter
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Sync initialFilter if provided
  React.useEffect(() => {
    if (initialFilter) {
      setSelectedCategory(initialFilter);
    }
  }, [initialFilter]);

  // Combine recommendations
  const pool = useMemo(() => {
    if (activeTab === 'saved') {
      return savedRecommendations.length > 0
        ? savedRecommendations
        : allRecommendations.slice(0, 4);
    }
    if (activeTab === 'recommended') {
      return allRecommendations.length > 0 ? allRecommendations : mockRecommendations;
    }
    // Search tab pool
    return allRecommendations.length > 0 ? allRecommendations : mockRecommendations;
  }, [activeTab, savedRecommendations, allRecommendations]);

  // Filtered recommendations
  const filteredList = useMemo(() => {
    return pool.filter((item) => {
      const matchCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.tags || []).some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchCategory && matchSearch;
    });
  }, [pool, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#17201D]/40 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md md:max-w-lg bg-[#FFFDF8] h-full shadow-2xl border-l border-[#EAE6DD] flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#EAE6DD] bg-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FFF2EE] text-[#FF6B4A] text-[11px] font-black uppercase">
                <span>DAY {targetDayNumber}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#17201D] mt-1">
                Add to your day
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-[#838F8B] hover:text-[#17201D] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs: Saved | Recommended | Search */}
          <div className="flex items-center gap-1 p-1 bg-[#F4F1EA] rounded-2xl mt-4 border border-[#EAE6DD]">
            <button
              type="button"
              onClick={() => setActiveTab('recommended')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'recommended'
                  ? 'bg-white text-[#17201D] shadow-2xs'
                  : 'text-[#68736F] hover:text-[#17201D]'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF6B4A]" />
                <span>Recommended</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-white text-[#17201D] shadow-2xs'
                  : 'text-[#68736F] hover:text-[#17201D]'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-[#20B8A6]" />
                <span>Saved ({savedRecommendations.length})</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'search'
                  ? 'bg-white text-[#17201D] shadow-2xs'
                  : 'text-[#68736F] hover:text-[#17201D]'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-[#5E6B67]" />
                <span>Search</span>
              </span>
            </button>
          </div>

          {/* Search Input if on Search tab or quick filter */}
          <div className="relative mt-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#838F8B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search places, food, experiences..."
              className="w-full pl-9.5 pr-4 py-2 rounded-xl bg-[#F9F7F1] border border-[#EAE6DD] text-xs sm:text-sm text-[#17201D] placeholder-[#A0AAA6] focus:outline-none focus:border-[#FF6B4A] transition-colors"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-3">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'place', label: 'Places' },
                { id: 'food', label: 'Food' },
                { id: 'hotel', label: 'Stays' },
                { id: 'experience', label: 'Experiences' },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-[#17201D] text-white shadow-2xs'
                    : 'bg-white border border-[#EAE6DD] text-[#5E6B67] hover:border-[#D0C9B8]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* List of Recommendation Cards */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
          {filteredList.length === 0 ? (
            <div className="text-center py-12">
              <Compass className="w-10 h-10 text-[#A0AAA6] mx-auto mb-2" />
              <p className="text-sm font-bold text-[#17201D]">No matches found</p>
              <p className="text-xs text-[#68736F] mt-0.5">
                Try switching tabs or adjusting your search keywords.
              </p>
            </div>
          ) : (
            filteredList.map((rec) => {
              const isAdded = addedActivityRecommendationIds.includes(rec.id);

              return (
                <div
                  key={rec.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', rec.id);
                    e.dataTransfer.setData('application/json', JSON.stringify(rec));
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  className="group bg-white rounded-2xl p-3.5 sm:p-4 border border-[#EAE6DD] hover:border-[#FF6B4A]/40 shadow-2xs flex items-center justify-between gap-3.5 transition-all"
                >
                  {/* Image & Details */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-[#F4F1EA] shrink-0">
                      <img
                        src={rec.image}
                        alt={rec.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-bold text-[#FF6B4A] uppercase">
                          {rec.category}
                        </span>
                        <span className="text-[10px] text-[#838F8B]">·</span>
                        <span className="text-[10px] text-[#838F8B] truncate">
                          {rec.location}
                        </span>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-[#17201D] truncate">
                        {rec.name}
                      </h4>

                      <div className="flex items-center gap-3 text-[11px] text-[#68736F] mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {rec.duration}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-[#17201D]">
                          <Wallet className="w-3 h-3 text-[#20B8A6]" />
                          {currency}
                          {rec.estimatedCost?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Add Button */}
                  <button
                    type="button"
                    onClick={() => onAddRecommendation(rec, targetDayNumber)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                      isAdded
                        ? 'bg-[#EAF8F5] text-[#179E8E] border border-[#20B8A6]/30'
                        : 'bg-[#FF6B4A] hover:bg-[#E55837] text-white shadow-xs'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added ✓</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
