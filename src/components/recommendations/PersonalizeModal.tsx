import React, { useState } from 'react';
import { X, SlidersHorizontal, Sparkles, Check, RotateCcw } from 'lucide-react';
import { Trip, TripPlannerDraft } from '../../types/trip';
import { TravelStyle } from '../../types/profile';
import { formatCurrency } from '../../utils/currency';

interface PersonalizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  onApply: (overrides: Partial<TripPlannerDraft>) => void;
  currentOverrides?: Partial<TripPlannerDraft>;
}

const INTEREST_OPTIONS = [
  'Food & Culinary',
  'Photography',
  'History & Heritage',
  'Art & Museums',
  'Nature & Parks',
  'Adventure & Treks',
  'Relaxation & Spa',
  'Architecture',
  'Coffee & Cafes',
  'Nightlife & Bars',
  'Local Markets',
];

export const PersonalizeModal: React.FC<PersonalizeModalProps> = ({
  isOpen,
  onClose,
  trip,
  onApply,
  currentOverrides,
}) => {
  const [budget, setBudget] = useState<number>(
    currentOverrides?.budget || trip.budget || 50000
  );
  const [travelPace, setTravelPace] = useState<TravelStyle>(
    (currentOverrides?.travelPace || trip.travelPace || 'balanced') as TravelStyle
  );
  const [accommodationStyle, setAccommodationStyle] = useState<string>(
    currentOverrides?.accommodationStyle || trip.accommodationStyle || 'boutique_hotel'
  );
  const [interests, setInterests] = useState<string[]>(
    currentOverrides?.interests || trip.interests || ['Culture', 'Food & Culinary']
  );

  if (!isOpen) return null;

  const toggleInterest = (tag: string) => {
    if (interests.includes(tag)) {
      setInterests(interests.filter((i) => i !== tag));
    } else {
      setInterests([...interests, tag]);
    }
  };

  const handleReset = () => {
    setBudget(trip.budget);
    setTravelPace((trip.travelPace || 'balanced') as TravelStyle);
    setAccommodationStyle(trip.accommodationStyle || 'boutique_hotel');
    setInterests(trip.interests || ['Culture', 'Food & Culinary']);
  };

  const handleApply = () => {
    onApply({
      budget,
      travelPace,
      accommodationStyle: accommodationStyle as any,
      interests,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE6DD] shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-[#F4F1EA] text-[#838F8B] hover:text-[#17201D] cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-1">
          <SlidersHorizontal className="w-5 h-5 text-[#FF6B4A]" />
          <h2 className="text-xl font-black text-[#17201D]">Personalize Recommendations</h2>
        </div>
        <p className="text-xs sm:text-sm text-[#68736F] mb-6">
          Adjust your trip parameters below to fine-tune AI recommendations without changing your global profile.
        </p>

        <div className="space-y-6">
          {/* 1. Target Budget */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="budget-slider-input" className="text-xs font-extrabold text-[#17201D] uppercase tracking-wider">
                Trip Budget Target
              </label>
              <span className="text-sm font-black text-[#FF6B4A]">
                {formatCurrency(budget, trip.currency)}
              </span>
            </div>
            <input
              id="budget-slider-input"
              type="range"
              min={10000}
              max={500000}
              step={5000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full h-2 bg-[#F4F1EA] rounded-lg appearance-none cursor-pointer accent-[#FF6B4A]"
            />
            <div className="flex justify-between text-[10px] font-bold text-[#838F8B] mt-1">
              <span>{formatCurrency(10000, trip.currency)}</span>
              <span>{formatCurrency(250000, trip.currency)}</span>
              <span>{formatCurrency(500000, trip.currency)}</span>
            </div>
          </div>

          {/* 2. Travel Pace */}
          <div>
            <label className="block text-xs font-extrabold text-[#17201D] uppercase tracking-wider mb-2.5">
              Travel Pace
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'relaxed', label: 'Relaxed', desc: '1–2 spots / day' },
                { id: 'balanced', label: 'Balanced', desc: '3–4 spots / day' },
                { id: 'packed', label: 'Packed', desc: '5+ sights / day' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setTravelPace(p.id as TravelStyle)}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    travelPace === p.id
                      ? 'bg-[#FFF9F6] border-[#FF6B4A] shadow-xs'
                      : 'bg-[#FCFBF8] border-[#EAE6DD] hover:border-[#838F8B]'
                  }`}
                >
                  <p className={`text-xs font-extrabold ${travelPace === p.id ? 'text-[#FF6B4A]' : 'text-[#17201D]'}`}>
                    {p.label}
                  </p>
                  <p className="text-[10px] text-[#838F8B]">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Accommodation Preference */}
          <div>
            <label htmlFor="accom-style-select" className="block text-xs font-extrabold text-[#17201D] uppercase tracking-wider mb-2">
              Accommodation Style
            </label>
            <select
              id="accom-style-select"
              value={accommodationStyle}
              onChange={(e) => setAccommodationStyle(e.target.value)}
              className="w-full p-3 rounded-2xl bg-[#FCFBF8] border border-[#EAE6DD] text-xs font-bold text-[#17201D] focus:outline-none focus:border-[#FF6B4A]"
            >
              <option value="budget_hotel">Budget Hotel / Value Stay</option>
              <option value="boutique_hotel">Boutique & Design Hotel</option>
              <option value="resort">Resort & Spa</option>
              <option value="apartment">Private Apartment / Studio</option>
              <option value="luxury_hotel">Luxury 5-Star Heritage Stay</option>
              <option value="hostel">Social Hostel</option>
            </select>
          </div>

          {/* 4. Interests & Focus */}
          <div>
            <label className="block text-xs font-extrabold text-[#17201D] uppercase tracking-wider mb-2.5">
              Trip Focus & Interests ({interests.length} selected)
            </label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((tag) => {
                const selected = interests.some((i) => i.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(i.toLowerCase()));
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selected
                        ? 'bg-[#17201D] text-white shadow-2xs'
                        : 'bg-[#FCFBF8] hover:bg-[#F4F1EA] text-[#4E5955] border border-[#EAE6DD]'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3 text-[#20B8A6]" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-4 border-t border-[#F0ECE1] flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#838F8B] hover:text-[#17201D] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-bold text-[#68736F] hover:bg-[#F4F1EA] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs font-extrabold shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply & Regenerate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
