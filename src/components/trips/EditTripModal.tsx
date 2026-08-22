import React, { useState, useEffect } from 'react';
import { Trip, TripType } from '../../types/trip';
import { CurrencyCode } from '../../types/profile';
import { X, Edit3, Save, MapPin, Calendar, Users, Wallet, Tag } from 'lucide-react';

interface EditTripModalProps {
  isOpen: boolean;
  trip: Trip | null;
  onClose: () => void;
  onSave: (tripId: string, updates: Partial<Trip>) => void;
  isSaving?: boolean;
}

const TRIP_TYPES: { value: TripType; label: string }[] = [
  { value: 'adventure', label: 'Adventure' },
  { value: 'leisure', label: 'Leisure & Relaxation' },
  { value: 'food_culture', label: 'Food & Culture' },
  { value: 'romantic', label: 'Romantic' },
  { value: 'family', label: 'Family' },
  { value: 'backpacking', label: 'Backpacking' },
  { value: 'photography', label: 'Photography' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'business', label: 'Business' },
];

const CURRENCIES: CurrencyCode[] = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'SGD', 'AED'];

const AVAILABLE_INTERESTS = [
  'Historical Sites',
  'Street Food',
  'Fine Dining',
  'Museums & Art',
  'Scenic Nature',
  'Nightlife',
  'Shopping',
  'Local Markets',
  'Beaches',
  'Architecture',
  'Temples & Shrines',
  'Adventure Sports',
];

export const EditTripModal: React.FC<EditTripModalProps> = ({
  isOpen,
  trip,
  onClose,
  onSave,
  isSaving = false,
}) => {
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [country, setCountry] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelersCount, setTravelersCount] = useState<number>(1);
  const [budget, setBudget] = useState<number>(50000);
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [tripType, setTripType] = useState<TripType>('leisure');
  const [interests, setInterests] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (trip && isOpen) {
      setName(trip.name || '');
      setDestination(trip.destination || '');
      setCountry(trip.country || '');
      setStartDate(trip.startDate || '');
      setEndDate(trip.endDate || '');
      setTravelersCount(trip.travelersCount || 1);
      setBudget(trip.budget || 50000);
      setCurrency(trip.currency || 'INR');
      setTripType(trip.tripType || 'leisure');
      setInterests(trip.interests || []);
      setNotes(trip.notes || '');
    }
  }, [trip, isOpen]);

  if (!isOpen || !trip) return null;

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !destination.trim()) return;

    // Calculate duration in days if start & end dates provided
    let durationDays = trip.durationDays || 3;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
        durationDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      }
    }

    const updates: Partial<Trip> = {
      name: name.trim(),
      destination: destination.trim(),
      country: country.trim() || destination.trim(),
      startDate,
      endDate,
      durationDays,
      travelersCount: Math.max(1, travelersCount),
      budget: Math.max(0, budget),
      currency,
      tripType,
      interests,
      notes: notes.trim(),
    };

    onSave(trip.id, updates);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#17201D]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#EAE6DD] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#F4F1EA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFF2EE] text-[#FF6B4A] flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 id="edit-modal-title" className="text-lg font-bold text-[#17201D]">
                Edit Trip Details
              </h3>
              <p className="text-xs text-[#68736F]">Modify destination, dates, and preferences</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#8C9B95] hover:text-[#17201D] rounded-full hover:bg-[#F4F1EA] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Trip Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#68736F] mb-1">
              Trip Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Japan Spring Adventure"
              className="w-full bg-[#FAF8F5] border border-[#EAE6DD] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#17201D] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/30 focus:bg-white transition-all"
            />
          </div>

          {/* Destination & Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#68736F] mb-1">
                Destination City/Region *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C9B95]" />
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g., Tokyo"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#EAE6DD] rounded-xl text-sm font-semibold text-[#17201D] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/30 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#68736F] mb-1">
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g., Japan"
                className="w-full bg-[#FAF8F5] border border-[#EAE6DD] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#17201D] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/30 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#68736F] mb-1">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C9B95]" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#EAE6DD] rounded-xl text-sm font-semibold text-[#17201D] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/30 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#68736F] mb-1">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C9B95]" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#EAE6DD] rounded-xl text-sm font-semibold text-[#17201D] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/30 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Travelers & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#68736F] mb-1">
                Travelers
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C9B95]" />
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={travelersCount}
                  onChange={(e) => setTravelersCount(parseInt(e.target.value) || 1)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#EAE6DD] rounded-xl text-sm font-semibold text-[#17201D] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/30 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#68736F] mb-1">
                Budget Target
              </label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C9B95]" />
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={budget}
                  onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF8F5] border border-[#EAE6DD] rounded-xl text-sm font-semibold text-[#17201D] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/30 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#68736F] mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full bg-[#FAF8F5] border border-[#EAE6DD] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#17201D] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/30 focus:bg-white transition-all cursor-pointer"
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Trip Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#68736F] mb-1">
              Trip Theme & Type
            </label>
            <select
              value={tripType}
              onChange={(e) => setTripType(e.target.value as TripType)}
              className="w-full bg-[#FAF8F5] border border-[#EAE6DD] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#17201D] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/30 focus:bg-white transition-all cursor-pointer"
            >
              {TRIP_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Interests Pills */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#68736F] mb-2 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-[#FF6B4A]" />
              Interests & Travel Focus
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_INTERESTS.map((interest) => {
                const isSelected = interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-[#FFF2EE] border-[#FF6B4A] text-[#FF6B4A]'
                        : 'bg-[#FAF8F5] border-[#EAE6DD] text-[#556960] hover:border-[#17201D]/40'
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 bg-[#FAF8F5] border-t border-[#EAE6DD] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl border border-[#EAE6DD] hover:bg-white text-xs font-bold text-[#17201D] transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleFormSubmit}
            disabled={isSaving || !name.trim() || !destination.trim()}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#17201D] hover:bg-[#FF6B4A] text-white text-xs font-bold shadow-md shadow-[#17201D]/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <span>Saving...</span>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
