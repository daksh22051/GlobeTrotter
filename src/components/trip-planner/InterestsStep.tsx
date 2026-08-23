import React, { useMemo, useState } from 'react';
import { Sparkles, Check, ChevronDown, ChevronUp, Heart, MessageSquare } from 'lucide-react';

interface InterestsStepProps {
  interests: string[];
  notes: string;
  onUpdate: (updates: Partial<{ interests: string[]; notes: string }>) => void;
  error?: string | null;
}

const INTEREST_ITEMS = [
  { id: 'Food', label: 'Food & Dining', emoji: '🍜', description: 'Street food, fine dining, local tastings' },
  { id: 'Nature', label: 'Nature & Wildlife', emoji: '🌲', description: 'National parks, reserves, scenic vistas' },
  { id: 'Adventure', label: 'Outdoor Adventure', emoji: '🧗', description: 'Treks, rafting, zip-lines, thrills' },
  { id: 'History', label: 'History & Heritage', emoji: '🏛️', description: 'Ancient ruins, castles, historic districts' },
  { id: 'Culture', label: 'Art & Culture', emoji: '🎭', description: 'Live theatre, artisan studios, traditions' },
  { id: 'Beaches', label: 'Beaches & Ocean', emoji: '🏖️', description: 'Coastal coves, snorkeling, sunset swims' },
  { id: 'Mountains', label: 'Mountains & Peaks', emoji: '🏔️', description: 'Alpine hikes, panoramic summits, snow' },
  { id: 'Nightlife', label: 'Nightlife & Bars', emoji: '🍸', description: 'Rooftop lounges, live music, night clubs' },
  { id: 'Shopping', label: 'Shopping & Bazaars', emoji: '🛍️', description: 'Local artisan markets, designer streets' },
  { id: 'Photography', label: 'Photography Spots', emoji: '📸', description: 'Golden hour vantage points, scenery' },
  { id: 'Architecture', label: 'Architecture', emoji: '🕌', description: 'Iconic landmarks, palaces, cathedrals' },
  { id: 'Museums', label: 'Museums & Galleries', emoji: '🖼️', description: 'World-renowned collections & curation' },
  { id: 'Local Experiences', label: 'Local Experiences', emoji: '🗺️', description: 'Hidden gems, neighborhood cafes & craft' },
  { id: 'Wellness', label: 'Wellness & Spa', emoji: '🧘', description: 'Thermal baths, yoga, peaceful retreats' },
  { id: 'Sports', label: 'Active & Sports', emoji: '🏄', description: 'Surfing, cycling, golf, outdoor sports' },
];

export const InterestsStep: React.FC<InterestsStepProps> = ({
  interests,
  notes,
  onUpdate,
  error,
}) => {
  const [showAllInterests, setShowAllInterests] = useState(false);
  const [showNotes, setShowNotes] = useState(Boolean(notes));
  const visibleInterests = showAllInterests ? INTEREST_ITEMS : INTEREST_ITEMS.slice(0, 4);

  const toggleInterest = (id: string) => {
    const exists = interests.includes(id);
    let updated: string[];
    if (exists) {
      updated = interests.filter((i) => i !== id);
    } else {
      updated = [...interests, id];
    }
    onUpdate({ interests: updated });
  };

  // Smart matching dynamic feedback text based on local frontend logic
  const smartInsightMessage = useMemo(() => {
    if (interests.length === 0) return null;
    const labels = interests.slice(0, 3).map((id) => {
      const match = INTEREST_ITEMS.find((item) => item.id.toLowerCase() === id.toLowerCase());
      return match ? match.label.toLowerCase() : id.toLowerCase();
    });

    if (labels.length === 1) {
      return `Great choice! We'll prioritize ${labels[0]} throughout your itinerary.`;
    } else if (labels.length === 2) {
      return `Smart combination! We'll curate the best ${labels[0]} and ${labels[1]} highlights for your journey.`;
    } else {
      return `Exciting theme! We'll balance ${labels[0]}, ${labels[1]}, and ${labels[2]} across your daily schedule.`;
    }
  }, [interests]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF2EE] text-[#FF6B4A] text-xs font-bold mb-2 border border-[#FFE0D6]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 03 / Trip Style & Interests</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17201D] tracking-tight">
          What should we include?
        </h2>
        <p className="text-sm text-[#5E6B67] mt-1 leading-relaxed">
          Choose the experiences you don't want to miss. Select all that spark your curiosity.
        </p>
      </div>

      {/* Smart Matching Live Message Banner */}
      {smartInsightMessage && (
        <div
          key={smartInsightMessage}
          role="status"
          className="min-h-12 p-3 rounded-2xl bg-gradient-to-r from-[#EDFAF7] via-[#F4FBFA] to-[#E5F7F3] border border-[#C6EFE7] flex items-center gap-2.5 shadow-2xs transition-all duration-200 animate-in fade-in"
        >
          <div className="w-7 h-7 rounded-lg bg-[#20B8A6] text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <p className="text-xs font-bold text-[#106F63] leading-snug">
            {smartInsightMessage}
          </p>
        </div>
      )}

      {/* Interest Chips Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#4A5551]">
            Experience Highlights <span className="text-[#FF6B4A]">*</span>
          </label>
          <span className="text-xs font-bold text-[#20B8A6]">
            {interests.length} {interests.length === 1 ? 'Selected' : 'Selected'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {visibleInterests.map((item) => {
            const isSelected = interests.includes(item.id);
            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => toggleInterest(item.id)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleInterest(item.id)}
                className={`p-3.5 rounded-2xl border-2 text-left cursor-pointer transition-all duration-150 flex items-center gap-3 ${
                  isSelected
                    ? 'border-[#FF6B4A] bg-[#FFF2EE] shadow-xs scale-[1.01]'
                    : 'border-[#EAE6DD] bg-white hover:border-[#D1CCC2] hover:bg-[#FAF9F5]'
                }`}
              >
                <span className="text-2xl shrink-0" role="img" aria-hidden="true">
                  {item.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-extrabold text-[#17201D] truncate">
                    {item.label}
                  </p>
                  <p className="text-[11px] text-[#68736F] truncate mt-0.5">
                    {item.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#FF6B4A] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {INTEREST_ITEMS.length > 4 && (
          <button
            type="button"
            onClick={() => setShowAllInterests((current) => !current)}
            className="mx-auto mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#EAE6DD] bg-white px-4 py-2 text-xs font-bold text-[#5E6B67] transition-colors hover:border-[#17201D] hover:text-[#17201D]"
          >
            <span>{showAllInterests ? 'Show less' : `Show all ${INTEREST_ITEMS.length} interests`}</span>
            {showAllInterests ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}

        {error && (
          <p className="text-xs font-semibold text-[#E55837] mt-1.5">{error}</p>
        )}
      </div>

      {/* Optional Traveler Notes Accordion */}
      <div className="pt-1 rounded-2xl border border-[#EAE6DD] bg-white overflow-hidden">
        <button
          type="button"
          onClick={() => setShowNotes((current) => !current)}
          aria-expanded={showNotes}
          aria-controls="trip-notes-panel"
          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#FAF9F5] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4A5551]">
            <MessageSquare className="w-3.5 h-3.5 text-[#98A29F]" />
            <span>Additional Notes (Optional)</span>
          </span>
          <span className="flex items-center gap-2 text-[10px] text-[#98A29F]">
            {notes ? 'Added' : 'Optional'}
            {showNotes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </button>

        {showNotes && (
          <div id="trip-notes-panel" className="px-4 pb-4 space-y-2 animate-in slide-in-from-top-1 duration-150">
            <div className="flex items-center justify-end">
              <span className={`text-xs font-semibold ${notes.length > 450 ? 'text-[#E55837] font-bold' : 'text-[#98A29F]'}`}>
                {notes.length}/500
              </span>
            </div>
            <textarea
              id="trip-notes-textarea"
              maxLength={500}
              rows={3}
              value={notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="Special occasions, accessibility needs, places you want to avoid, must-visit spots, dietary restrictions or flight arrival notes..."
              className="w-full p-3 rounded-xl bg-[#FCFBF8] text-xs sm:text-sm font-medium text-[#17201D] placeholder:text-[#98A29F] border border-[#EAE6DD] hover:border-[#D1CCC2] focus:border-[#FF6B4A] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/20 transition-all resize-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};
