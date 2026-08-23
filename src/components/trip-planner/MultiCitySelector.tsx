import React from 'react';
import { TripCity } from '../../types/trip';
import { DestinationSearch } from './DestinationSearch';
import { Plus, Minus, Trash2, ArrowUp, ArrowDown, MapPin, Building2, Calendar } from 'lucide-react';

interface MultiCitySelectorProps {
  isMultiCity: boolean;
  onToggleMultiCity: (isMulti: boolean) => void;
  primaryDestination: string;
  primaryCountry: string;
  primaryImage: string;
  cities: TripCity[];
  startDate: string;
  endDate: string;
  onUpdatePrimary: (dest: { name: string; country: string; imageUrl: string; destinationId?: string }) => void;
  onUpdateCities: (cities: TripCity[]) => void;
  error?: string;
}

export const MultiCitySelector: React.FC<MultiCitySelectorProps> = ({
  isMultiCity,
  onToggleMultiCity,
  primaryDestination,
  primaryCountry,
  primaryImage,
  cities,
  startDate,
  endDate,
  onUpdatePrimary,
  onUpdateCities,
  error,
}) => {
  const handleAddCity = (dest: { name: string; country: string; imageUrl: string; destinationId?: string }) => {
    if (!dest.name) return;
    const newCity: TripCity = {
      cityName: dest.name,
      country: dest.country,
      orderIndex: cities.length,
      stayDurationDays: 3,
    };
    const updated = [...cities, newCity];
    onUpdateCities(updated);
  };

  const handleRemoveCity = (index: number) => {
    const updated = cities.filter((_, i) => i !== index).map((c, idx) => ({
      ...c,
      orderIndex: idx,
    }));
    onUpdateCities(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...cities];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    onUpdateCities(updated.map((c, idx) => ({ ...c, orderIndex: idx })));
  };

  const handleMoveDown = (index: number) => {
    if (index >= cities.length - 1) return;
    const updated = [...cities];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    onUpdateCities(updated.map((c, idx) => ({ ...c, orderIndex: idx })));
  };

  const handleUpdateDuration = (index: number, days: number | undefined) => {
    const updated = [...cities];
    updated[index] = {
      ...updated[index],
      stayDurationDays: days && days > 0 ? days : undefined,
    };
    onUpdateCities(updated);
  };

  const adjustDuration = (index: number, delta: number) => {
    const currentDays = cities[index].stayDurationDays || 1;
    handleUpdateDuration(index, Math.max(1, currentDays + delta));
  };

  return (
    <div className="space-y-4">
      {/* Mode Switcher */}
      <div className="flex items-center justify-between pb-1 border-b border-[#F0EBE1]">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#FF6B4A]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#4A5551]">
            Trip Itinerary Route
          </span>
        </div>
        <div className="flex items-center p-1 rounded-xl bg-[#F4F1EA] text-xs font-bold">
          <button
            type="button"
            onClick={() => onToggleMultiCity(false)}
            className={`px-3 py-1 rounded-lg transition-all ${
              !isMultiCity
                ? 'bg-white text-[#17201D] shadow-xs'
                : 'text-[#68736F] hover:text-[#17201D]'
            }`}
          >
            Single City
          </button>
          <button
            type="button"
            onClick={() => {
              onToggleMultiCity(true);
              if (cities.length === 0 && primaryDestination) {
                onUpdateCities([
                  { cityName: primaryDestination, country: primaryCountry, orderIndex: 0, stayDurationDays: 3 }
                ]);
              }
            }}
            className={`px-3 py-1 rounded-lg transition-all ${
              isMultiCity
                ? 'bg-white text-[#17201D] shadow-xs'
                : 'text-[#68736F] hover:text-[#17201D]'
            }`}
          >
            Multi-City Route
          </button>
        </div>
      </div>

      {!isMultiCity ? (
        /* Single Destination Search */
        <DestinationSearch
          value={primaryDestination}
          country={primaryCountry}
          imageUrl={primaryImage}
          error={error}
          onSelect={onUpdatePrimary}
        />
      ) : (
        /* Multi-City Management */
        <div className="space-y-3">
          <p className="text-xs text-[#5E6B67]">
            Build your multi-destination route. Add stops, reorder them, and specify stay duration per city.
          </p>

          {/* Cities List */}
          {cities.length > 0 ? (
            <div className="space-y-2">
              {cities.map((city, idx) => (
                <div
                  key={`${city.cityName}-${idx}`}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#EAE6DD] shadow-xs hover:border-[#D1CCC2] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[#FFF2EE] text-[#FF6B4A] font-extrabold text-xs flex items-center justify-center shrink-0 border border-[#FFE0D6]">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-extrabold text-[#17201D] truncate">
                          {city.cityName}
                        </span>
                        {city.country && (
                          <span className="text-xs text-[#68736F] truncate">
                            · {city.country}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#5E6B67]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#20B8A6]" />
                          <button
                            type="button"
                            onClick={() => adjustDuration(idx, -1)}
                            disabled={(city.stayDurationDays || 1) <= 1}
                            className="w-5 h-5 rounded-md border border-[#EAE6DD] bg-white text-[#68736F] hover:text-[#17201D] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                            aria-label={`Decrease ${city.cityName} stay duration`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={city.stayDurationDays ?? ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              handleUpdateDuration(idx, value === '' ? undefined : Number(value));
                            }}
                            onBlur={() => {
                              if (!city.stayDurationDays || city.stayDurationDays < 1) {
                                handleUpdateDuration(idx, 1);
                              }
                            }}
                            className="w-10 px-1 py-0.5 text-center font-bold bg-[#F4F1EA] rounded border border-[#EAE6DD] text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => adjustDuration(idx, 1)}
                            className="w-5 h-5 rounded-md border border-[#EAE6DD] bg-white text-[#68736F] hover:text-[#17201D] flex items-center justify-center"
                            aria-label={`Increase ${city.cityName} stay duration`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <span>days stay</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Move Up, Move Down, Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveUp(idx)}
                      title="Move stop earlier"
                      className="p-1.5 rounded-lg text-[#68736F] hover:bg-[#F4F1EA] disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === cities.length - 1}
                      onClick={() => handleMoveDown(idx)}
                      title="Move stop later"
                      className="p-1.5 rounded-lg text-[#68736F] hover:bg-[#F4F1EA] disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveCity(idx)}
                      title="Remove stop"
                      className="p-1.5 rounded-lg text-[#E55837] hover:bg-[#FFF2EE]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-dashed border-[#D1CCC2] text-center">
              <Building2 className="w-8 h-8 text-[#98A29F] mx-auto mb-1.5" />
              <p className="text-xs font-bold text-[#17201D]">No stops added yet</p>
              <p className="text-[11px] text-[#68736F]">Search and select your starting destination below</p>
            </div>
          )}

          {/* Add Another Stop Search */}
          <div className="pt-2">
            <DestinationSearch
              value=""
              placeholder="Search to add next city stop (e.g. Kyoto, Rome, Barcelona)..."
              onSelect={(res) => handleAddCity(res)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
