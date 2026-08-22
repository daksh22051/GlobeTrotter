import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  MoreVertical,
  Clock,
  MapPin,
  Edit3,
  ArrowRightLeft,
  Trash2,
  Navigation,
  Sparkles,
} from 'lucide-react';
import { Itinerary, ItineraryDay, ItineraryActivity } from '../../types/itinerary';
import { MAP_CONFIG, getDayColor } from '../../config/mapConfig';
import { locationService } from '../../services/locationService';

interface JourneyListProps {
  itinerary: Itinerary;
  selectedDayNumber: number | 'all';
  activeMarkerId: string | null;
  hoveredMarkerId: string | null;
  onSelectActivity: (activity: ItineraryActivity, dayNumber: number) => void;
  onHoverActivity: (activityId: string | null) => void;
  onOpenAddPlace: (dayNumber?: number) => void;
  onEditActivity: (activity: ItineraryActivity, dayNumber: number) => void;
  onMoveActivity: (activity: ItineraryActivity, fromDayNumber: number) => void;
  onDeleteActivity: (activity: ItineraryActivity, dayNumber: number) => void;
}

export const JourneyList: React.FC<JourneyListProps> = ({
  itinerary,
  selectedDayNumber,
  activeMarkerId,
  hoveredMarkerId,
  onSelectActivity,
  onHoverActivity,
  onOpenAddPlace,
  onEditActivity,
  onMoveActivity,
  onDeleteActivity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuActId, setOpenMenuActId] = useState<string | null>(null);

  // Filter days according to selectedDayNumber
  const displayDays = useMemo(() => {
    if (selectedDayNumber === 'all') {
      return itinerary.days;
    }
    return itinerary.days.filter((d) => d.dayNumber === selectedDayNumber);
  }, [itinerary.days, selectedDayNumber]);

  // Filter activities by search query
  const filteredDays = useMemo(() => {
    if (!searchQuery.trim()) return displayDays;
    const q = searchQuery.toLowerCase();

    return displayDays
      .map((day) => ({
        ...day,
        activities: day.activities.filter(
          (act) =>
            act.title.toLowerCase().includes(q) ||
            act.location.toLowerCase().includes(q) ||
            act.category.toLowerCase().includes(q) ||
            (act.notes && act.notes.toLowerCase().includes(q))
        ),
      }))
      .filter((day) => day.activities.length > 0);
  }, [displayDays, searchQuery]);

  const totalFilteredStops = filteredDays.reduce((sum, d) => sum + d.activities.length, 0);

  return (
    <div className="flex flex-col h-full bg-[#FFFDF8] border-r border-[#EAE6DD] overflow-hidden">
      {/* Search & Add Place Top Bar */}
      <div className="p-4 border-b border-[#EAE6DD] bg-white sticky top-0 z-10 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-[#17201D]">Your Journey</h2>
            <p className="text-xs text-[#838F8B]">
              {selectedDayNumber === 'all'
                ? `All ${itinerary.days.length} days (${totalFilteredStops} places)`
                : `Day ${selectedDayNumber} (${totalFilteredStops} places)`}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              onOpenAddPlace(selectedDayNumber === 'all' ? 1 : selectedDayNumber)
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Place</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#838F8B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search places in your trip..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F9F7F1] border border-[#EAE6DD] focus:border-[#FF6B4A] focus:bg-white text-xs text-[#17201D] placeholder:text-[#838F8B] outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#838F8B] hover:text-[#17201D] px-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Activities List Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {totalFilteredStops === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0ED] text-[#FF6B4A] mx-auto flex items-center justify-center text-xl mb-3">
              📍
            </div>
            <h4 className="text-sm font-bold text-[#17201D]">No places found</h4>
            <p className="text-xs text-[#68736F] max-w-xs mx-auto mt-1 mb-4">
              {searchQuery
                ? 'No activities match your search keyword. Try another place name.'
                : 'This day does not have any scheduled places yet.'}
            </p>
            <button
              type="button"
              onClick={() =>
                onOpenAddPlace(selectedDayNumber === 'all' ? 1 : selectedDayNumber)
              }
              className="px-4 py-2 rounded-xl bg-[#17201D] text-white text-xs font-bold hover:bg-[#FF6B4A] transition-colors"
            >
              + Add Place from Recommendations
            </button>
          </div>
        ) : (
          filteredDays.map((day) => {
            const dayColor = getDayColor(day.dayNumber);

            return (
              <div key={day.id || day.dayNumber} className="space-y-2.5">
                {/* Day Header Banner */}
                <div className="flex items-center justify-between py-1 border-b border-[#F4F1EA]">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: dayColor.primary }}
                    />
                    <h3 className="text-xs font-extrabold text-[#17201D] uppercase tracking-wider">
                      Day {day.dayNumber} · {day.title || day.dateDisplay}
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#838F8B] font-medium">
                    {day.activities.length} stops
                  </span>
                </div>

                {/* Day Activities Cards */}
                <div className="space-y-2">
                  {day.activities.map((act, index) => {
                    const isSelected =
                      activeMarkerId === act.id ||
                      activeMarkerId === `marker_${day.dayNumber}_${act.id}`;
                    const isHovered =
                      hoveredMarkerId === act.id ||
                      hoveredMarkerId === `marker_${day.dayNumber}_${act.id}`;
                    const category =
                      MAP_CONFIG.categoryConfig[act.category] ||
                      MAP_CONFIG.categoryConfig.place;

                    return (
                      <div
                        key={act.id}
                        onMouseEnter={() =>
                          onHoverActivity(`marker_${day.dayNumber}_${act.id}`)
                        }
                        onMouseLeave={() => onHoverActivity(null)}
                        onClick={() => onSelectActivity(act, day.dayNumber)}
                        className={`group relative rounded-xl border p-3 transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-white border-2 shadow-md scale-[1.01]'
                            : isHovered
                            ? 'bg-[#FDFBF7] border-[#D6D0C3] shadow-xs'
                            : 'bg-white border-[#EAE6DD] hover:border-[#D6D0C3]'
                        }`}
                        style={{
                          borderColor: isSelected ? dayColor.primary : undefined,
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {/* Stop Number & Category Icon */}
                          <div className="flex flex-col items-center shrink-0">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-2xs text-white"
                              style={{ backgroundColor: dayColor.primary }}
                            >
                              {index + 1}
                            </div>
                            <span className="text-xs mt-1">{category.emoji}</span>
                          </div>

                          {/* Image Thumbnail (if available) */}
                          {act.image && (
                            <img
                              src={act.image}
                              alt={act.title}
                              className="w-14 h-14 rounded-lg object-cover border border-[#EAE6DD] shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          )}

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className="text-[10px] font-bold uppercase tracking-wider"
                                style={{ color: dayColor.primary }}
                              >
                                {category.label}
                              </span>

                              {/* More Options Menu */}
                              <div
                                className="relative"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenMenuActId(
                                      openMenuActId === act.id ? null : act.id
                                    )
                                  }
                                  className="p-1 rounded-md text-[#838F8B] hover:text-[#17201D] hover:bg-[#F4F1EA] transition-colors"
                                  title="Options"
                                >
                                  <MoreVertical className="w-3.5 h-3.5" />
                                </button>

                                {openMenuActId === act.id && (
                                  <div className="absolute right-0 top-6 w-36 rounded-xl bg-white border border-[#EAE6DD] shadow-lg py-1 z-30 font-sans">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuActId(null);
                                        onEditActivity(act, day.dayNumber);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#17201D] hover:bg-[#F9F7F1]"
                                    >
                                      <Edit3 className="w-3.5 h-3.5 text-[#5E6B67]" />
                                      <span>Edit details</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuActId(null);
                                        onMoveActivity(act, day.dayNumber);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#17201D] hover:bg-[#F9F7F1]"
                                    >
                                      <ArrowRightLeft className="w-3.5 h-3.5 text-[#5E6B67]" />
                                      <span>Move to day</span>
                                    </button>
                                    <div className="h-px bg-[#F4F1EA] my-1" />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuActId(null);
                                        onDeleteActivity(act, day.dayNumber);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#E55837] hover:bg-[#FFF0ED]"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Remove</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <h4 className="text-xs sm:text-sm font-bold text-[#17201D] truncate leading-tight mt-0.5">
                              {act.title}
                            </h4>

                            <div className="flex items-center gap-2 text-[11px] text-[#68736F] mt-1">
                              <span className="flex items-center gap-0.5 font-medium text-[#17201D]">
                                <Clock className="w-3 h-3 text-[#838F8B]" />
                                {act.startTime}
                              </span>
                              <span>•</span>
                              <span>{act.duration}</span>
                            </div>

                            <div className="flex items-center justify-between text-[11px] mt-1.5 pt-1.5 border-t border-[#F4F1EA]">
                              <span className="text-[#838F8B] truncate max-w-[120px]">
                                📍 {act.location}
                              </span>
                              <span className="font-semibold text-[#17201D]">
                                {act.estimatedCost > 0
                                  ? `₹${act.estimatedCost.toLocaleString()}`
                                  : 'Free'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
