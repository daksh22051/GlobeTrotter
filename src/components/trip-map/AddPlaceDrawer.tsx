import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Plus,
  Clock,
  MapPin,
  Sparkles,
  Check,
  Calendar,
} from 'lucide-react';
import { Recommendation, RecommendationCategory } from '../../types/recommendation';
import { buildTripRecommendations } from '../../utils/recommendationMatcher';
import { ItineraryDay, ItineraryActivity } from '../../types/itinerary';
import { recommendationToActivity } from '../../services/itineraryService';
import { getActivityImage, handleActivityImageError } from '../../utils/activityImage';

interface AddPlaceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  destination: string;
  days: ItineraryDay[];
  defaultDayNumber?: number;
  onAddActivity: (activity: ItineraryActivity, dayNumber: number) => void;
}

export const AddPlaceDrawer: React.FC<AddPlaceDrawerProps> = ({
  isOpen,
  onClose,
  destination,
  days,
  defaultDayNumber = 1,
  onAddActivity,
}) => {
  const [activeCategory, setActiveCategory] = useState<RecommendationCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState<number>(defaultDayNumber);
  const [selectedTime, setSelectedTime] = useState<string>('11:00');
  const [addedItemIds, setAddedItemIds] = useState<Set<string>>(new Set());

  // Filter recommendations matching destination
  const availableRecommendations = useMemo(() => {
    const tripObj = { destination: destination || 'Destination', country: '', currency: 'INR' } as any;
    const recs = buildTripRecommendations(tripObj);
    let list = recs.allRecommendations;

    if (activeCategory !== 'all') {
      list = list.filter((item) => item.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
      );
    }

    return list;
  }, [destination, activeCategory, searchQuery]);

  if (!isOpen) return null;

  const handleAdd = (rec: Recommendation) => {
    const act = recommendationToActivity(rec, selectedDay, selectedTime);
    onAddActivity(act, selectedDay);

    setAddedItemIds((prev) => new Set(prev).add(rec.id));
    setTimeout(() => {
      setAddedItemIds((prev) => {
        const next = new Set(prev);
        next.delete(rec.id);
        return next;
      });
    }, 2000);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:max-w-md bg-[#FFFDF8] border-l border-[#EAE6DD] shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-[#EAE6DD] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFF0ED] text-[#FF6B4A] flex items-center justify-center text-base">
              📍
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#17201D]">Add Places to Map</h3>
              <p className="text-xs text-[#838F8B]">
                Curated highlights for {destination || 'your destination'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#F4F1EA] text-[#5E6B67] hover:text-[#17201D]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Schedule Target Settings */}
        <div className="p-4 bg-[#F9F7F1] border-b border-[#EAE6DD] space-y-2.5">
          <span className="text-[10px] font-bold text-[#838F8B] uppercase tracking-wider">
            Schedule Target
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-[#5E6B67] block mb-1">
                Day
              </label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#EAE6DD] text-xs font-bold text-[#17201D] outline-none"
              >
                {days.map((d) => (
                  <option key={d.id || d.dayNumber} value={d.dayNumber}>
                    Day {d.dayNumber} ({d.activities.length} stops)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#5E6B67] block mb-1">
                Time Slot
              </label>
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#EAE6DD] text-xs font-bold text-[#17201D] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Category Tabs & Search */}
        <div className="p-3 border-b border-[#EAE6DD] space-y-2 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#838F8B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recommendations..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#F9F7F1] border border-[#EAE6DD] text-xs text-[#17201D] placeholder:text-[#838F8B] outline-none"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {(['all', 'place', 'food', 'hotel', 'experience'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  activeCategory === cat
                    ? 'bg-[#17201D] text-white'
                    : 'bg-[#F4F1EA] text-[#5E6B67] hover:text-[#17201D]'
                }`}
              >
                {cat === 'all'
                  ? 'All'
                  : cat === 'place'
                  ? '📍 Places'
                  : cat === 'food'
                  ? '🍜 Food'
                  : cat === 'hotel'
                  ? '🏨 Stays'
                  : '🎭 Tours'}
              </button>
            ))}
          </div>
        </div>

        {/* List of Recommendations */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {availableRecommendations.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#838F8B]">
              No recommendations match the filter.
            </div>
          ) : (
            availableRecommendations.map((rec) => {
              const isAdded = addedItemIds.has(rec.id);

              return (
                <div
                  key={rec.id}
                  className="p-3 rounded-xl bg-white border border-[#EAE6DD] hover:border-[#D6D0C3] transition-all flex items-start gap-3 shadow-2xs"
                >
                  <img
                    src={getActivityImage(rec)}
                    alt={rec.name}
                    className="w-16 h-16 rounded-lg object-cover border border-[#EAE6DD] shrink-0"
                    referrerPolicy="no-referrer"
                    onError={(event) => handleActivityImageError(event, rec.category)}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#FF6B4A] uppercase">
                        {rec.category}
                      </span>
                      <span className="text-[11px] font-bold text-[#17201D]">
                        {rec.estimatedCost > 0
                          ? `₹${rec.estimatedCost.toLocaleString()}`
                          : 'Free'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#17201D] truncate mt-0.5">
                      {rec.name}
                    </h4>

                    <p className="text-[11px] text-[#68736F] line-clamp-1 mt-0.5">
                      📍 {rec.location}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#F4F1EA]">
                      <span className="text-[10px] text-[#838F8B]">
                        ⏱ {rec.duration || '2 hours'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleAdd(rec)}
                        disabled={isAdded}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          isAdded
                            ? 'bg-[#20B8A6] text-white'
                            : 'bg-[#FF6B4A] hover:bg-[#E55837] text-white shadow-2xs'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Added!</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            <span>Add to Day {selectedDay}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};
