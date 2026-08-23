import React from 'react';
import {
  Compass,
  Heart,
  Home,
  Navigation,
  Gauge,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  TravelInterest,
  TravelStyle,
  TravelCompanion,
  AccommodationPreference,
  TransportStylePreference,
  UserPreferences,
} from '../../types/profile';

interface TravelPreferencesProps {
  preferences: UserPreferences;
  onChange: (updates: Partial<UserPreferences>) => void;
}

const INTERESTS_OPTIONS: { id: TravelInterest; label: string; emoji: string }[] = [
  { id: 'food', label: 'Food & Culinary', emoji: '🍜' },
  { id: 'history', label: 'History & Culture', emoji: '🏛️' },
  { id: 'mountains', label: 'Mountains & Peaks', emoji: '⛰️' },
  { id: 'beaches', label: 'Beaches & Ocean', emoji: '🏖️' },
  { id: 'nature', label: 'Nature & Wildlife', emoji: '🌿' },
  { id: 'adventure', label: 'Adventure Sports', emoji: '🧗' },
  { id: 'photography', label: 'Photography', emoji: '📸' },
  { id: 'shopping', label: 'Local Markets', emoji: '🛍️' },
  { id: 'nightlife', label: 'Nightlife & Bars', emoji: '🍸' },
  { id: 'art', label: 'Art & Museums', emoji: '🎨' },
  { id: 'spirituality', label: 'Spirituality & Zen', emoji: '🧘' },
  { id: 'architecture', label: 'Architecture', emoji: '🏰' },
];

const COMPANIONS: { id: TravelCompanion; label: string; desc: string; emoji: string }[] = [
  { id: 'solo', label: 'Solo Traveler', desc: 'Freedom to wander at your rhythm', emoji: '🎒' },
  { id: 'partner', label: 'Couple', desc: 'Romantic getaways & duo experiences', emoji: '✨' },
  { id: 'family', label: 'Family', desc: 'Kid-friendly & relaxed logistics', emoji: '🏡' },
  { id: 'friends', label: 'Friends Group', desc: 'Social vibes & shared adventures', emoji: '🍻' },
  { id: 'business', label: 'Business Travel', desc: 'Productivity & convenient stays', emoji: '💼' },
];

const ACCOMMODATIONS: { id: AccommodationPreference; label: string; desc: string; emoji: string }[] = [
  { id: 'budget', label: 'Budget & Hostels', desc: 'Backpacker gems & shared stays', emoji: '🛏️' },
  { id: 'comfort', label: 'Comfort & Boutique', desc: '3-4★ quality local hotels', emoji: '🏨' },
  { id: 'premium', label: 'Premium & Design', desc: '4-5★ curated boutique stays', emoji: '⭐' },
  { id: 'luxury', label: 'Ultra Luxury & Resorts', desc: '5★ luxury & bespoke villas', emoji: '👑' },
];

const TRANSPORTS: { id: TransportStylePreference; label: string; emoji: string }[] = [
  { id: 'walking', label: 'Walking', emoji: '👟' },
  { id: 'public_transport', label: 'Public Transit', emoji: '🚇' },
  { id: 'train', label: 'Trains & Rail', emoji: '🚆' },
  { id: 'bus', label: 'Buses', emoji: '🚌' },
  { id: 'rental_car', label: 'Rental Car', emoji: '🚗' },
  { id: 'taxi', label: 'Taxi & Rideshare', emoji: '🚕' },
  { id: 'flight', label: 'Flights', emoji: '✈️' },
];

const PACES: { id: TravelStyle; label: string; desc: string; badge: string }[] = [
  { id: 'relaxed', label: 'Relaxed', desc: '1-2 key activities daily with abundant cafe time', badge: 'Zen Pace' },
  { id: 'balanced', label: 'Balanced', desc: '3-4 activities with free evenings & meal breaks', badge: 'Recommended' },
  { id: 'packed', label: 'High Energy', desc: 'Full-day itinerary maximizing sights & culture', badge: 'Non-Stop' },
];

export const TravelPreferences: React.FC<TravelPreferencesProps> = ({ preferences, onChange }) => {
  const toggleInterest = (id: TravelInterest) => {
    const current = preferences.interests || [];
    const exists = current.includes(id);
    const updated = exists ? current.filter((i) => i !== id) : [...current, id];
    onChange({ interests: updated });
  };

  return (
    <div className="bg-white rounded-3xl border border-[#EAE6DD] p-6 sm:p-8 shadow-xs space-y-8">
      <div>
        <h2 className="text-lg font-extrabold text-[#17201D] tracking-tight">Travel Preferences</h2>
        <p className="text-xs text-[#68736F] mt-0.5">
          These preferences automatically power AI recommendations and itinerary pacing for your trips.
        </p>
      </div>

      {/* 1. Travel Companion / Style */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-[#17201D] flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-[#FF6B4A]" />
          <span>Primary Travel Companion</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {COMPANIONS.map((comp) => {
            const isSelected = preferences.travelCompanion === comp.id;
            return (
              <button
                key={comp.id}
                type="button"
                onClick={() => onChange({ travelCompanion: comp.id })}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#FFF2EE] border-[#FF6B4A] shadow-xs'
                    : 'bg-[#FCFBF8] border-[#EAE6DD] hover:border-[#17201D]/30'
                }`}
              >
                <div className="text-xl mb-1">{comp.emoji}</div>
                <div>
                  <p className="text-xs font-bold text-[#17201D]">{comp.label}</p>
                  <p className="text-[10px] text-[#838F8B] line-clamp-1 mt-0.5">{comp.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interests Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-[#17201D] flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-[#FF6B4A]" />
            <span>Trip Interests (Select all that apply)</span>
          </label>
          <span className="text-[11px] font-bold text-[#20B8A6]">
            {(preferences.interests || []).length} selected
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {INTERESTS_OPTIONS.map((item) => {
            const isSelected = (preferences.interests || []).includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleInterest(item.id)}
                className={`px-3 py-2.5 rounded-2xl text-left border text-xs font-bold transition-all cursor-pointer flex items-center justify-between gap-2 ${
                  isSelected
                    ? 'bg-[#E8F8F5] border-[#20B8A6] text-[#179E8E] shadow-2xs'
                    : 'bg-[#FCFBF8] border-[#EAE6DD] text-[#4A5551] hover:border-[#17201D]/30'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <span>{item.emoji}</span>
                  <span className="truncate">{item.label}</span>
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#20B8A6] shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Pace Selection */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-[#17201D] flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5 text-[#FFB020]" />
          <span>Preferred Itinerary Pace</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PACES.map((pace) => {
            const isSelected = preferences.travelStyle === pace.id;
            return (
              <button
                key={pace.id}
                type="button"
                onClick={() => onChange({ travelStyle: pace.id })}
                className={`p-4 rounded-2xl text-left border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-[#FFF9F0] border-[#FFB020] shadow-xs'
                    : 'bg-[#FCFBF8] border-[#EAE6DD] hover:border-[#17201D]/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold text-[#17201D]">{pace.label}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F4F1EA] text-[#68736F]">
                    {pace.badge}
                  </span>
                </div>
                <p className="text-[11px] text-[#68736F] leading-relaxed">{pace.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Accommodation Preference */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-[#17201D] flex items-center gap-1.5">
          <Home className="w-3.5 h-3.5 text-[#20B8A6]" />
          <span>Accommodation Style</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {ACCOMMODATIONS.map((acc) => {
            const isSelected = preferences.accommodationPreference === acc.id;
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => onChange({ accommodationPreference: acc.id })}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#E8F8F5] border-[#20B8A6] shadow-xs'
                    : 'bg-[#FCFBF8] border-[#EAE6DD] hover:border-[#17201D]/30'
                }`}
              >
                <div className="text-xl mb-1">{acc.emoji}</div>
                <div>
                  <p className="text-xs font-bold text-[#17201D]">{acc.label}</p>
                  <p className="text-[10px] text-[#838F8B] line-clamp-1 mt-0.5">{acc.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Transport Preference */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-[#17201D] flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-[#FF6B4A]" />
          <span>Preferred Transit Mode</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {TRANSPORTS.map((tr) => {
            const isSelected = preferences.transportPreference === tr.id;
            return (
              <button
                key={tr.id}
                type="button"
                onClick={() => onChange({ transportPreference: tr.id })}
                className={`p-2.5 rounded-2xl text-center border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FFF2EE] border-[#FF6B4A] text-[#FF6B4A] font-bold shadow-2xs'
                    : 'bg-[#FCFBF8] border-[#EAE6DD] text-[#4A5551] hover:border-[#17201D]/30'
                }`}
              >
                <div className="text-base mb-0.5">{tr.emoji}</div>
                <div className="text-[11px] truncate">{tr.label}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
