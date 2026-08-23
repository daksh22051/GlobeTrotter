import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X, Sparkles, Check } from 'lucide-react';
import { FEATURED_DESTINATIONS } from '../../data/destinations';
import { Destination } from '../../types';

interface DestinationSearchProps {
  value: string;
  country?: string;
  imageUrl?: string;
  onSelect: (destination: {
    name: string;
    country: string;
    imageUrl: string;
    destinationId?: string;
  }) => void;
  error?: string | null;
  placeholder?: string;
}

const DEFAULT_DESTINATION_PLACEHOLDER = 'Search a city or country (e.g. Tokyo, Bali, Paris)';

export const DestinationSearch: React.FC<DestinationSearchProps> = ({
  value,
  country,
  imageUrl,
  onSelect,
  error,
  placeholder,
}) => {
  const [searchTerm, setSearchTerm] = useState(value ? (country ? `${value}, ${country}` : value) : '');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [destinationScope, setDestinationScope] = useState<'domestic' | 'international'>('domestic');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal search input if external value changes
  useEffect(() => {
    if (value) {
      setSearchTerm(country ? `${value}, ${country}` : value);
      if (country) {
        setDestinationScope(country.toLowerCase() === 'india' ? 'domestic' : 'international');
      }
    }
  }, [value, country]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter destinations from dataset
  const scopedDestinations = FEATURED_DESTINATIONS.filter((destination) =>
    destination.isDomestic === (destinationScope === 'domestic')
  );
  const searchQuery = searchTerm.split(',')[0].toLowerCase().trim();
  const scopePlaceholder = destinationScope === 'domestic'
    ? 'e.g. Manali, Goa, Jaipur, Udaipur'
    : 'e.g. Paris, Tokyo, Bali, London';
  const inputPlaceholder = placeholder && placeholder !== DEFAULT_DESTINATION_PLACEHOLDER
    ? placeholder
    : scopePlaceholder;
  const filteredDestinations = searchQuery
    ? scopedDestinations.filter((d) => {
        return (
          d.name.toLowerCase().includes(searchQuery) ||
          d.country.toLowerCase().includes(searchQuery) ||
          d.region?.toLowerCase().includes(searchQuery) ||
          d.tags.some((t) => t.toLowerCase().includes(searchQuery))
        );
      })
    : scopedDestinations.slice(0, 6);

  const handleSelectDestination = (dest: Destination) => {
    setSearchTerm(`${dest.name}, ${dest.country}`);
    onSelect({
      name: dest.name,
      country: dest.country,
      imageUrl: dest.imageUrl || dest.image,
      destinationId: dest.id,
    });
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleCustomEntry = () => {
    if (!searchTerm.trim()) return;
    const parts = searchTerm.split(',').map((s) => s.trim());
    const destName = parts[0];
    const countryName = parts[1] || '';
    onSelect({
      name: destName,
      country: countryName,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
    });
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) setIsOpen(true);
      setHighlightedIndex((prev) =>
        prev < filteredDestinations.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredDestinations.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0 && filteredDestinations[highlightedIndex]) {
        handleSelectDestination(filteredDestinations[highlightedIndex]);
      } else if (searchTerm.trim()) {
        handleCustomEntry();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    onSelect({
      name: '',
      country: '',
      imageUrl: '',
    });
    setIsOpen(true);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <label
        htmlFor="destination-search-input"
        className="block text-xs font-bold uppercase tracking-wider text-[#4A5551] mb-1.5"
      >
        Destination <span className="text-[#FF6B4A]">*</span>
      </label>

      <div className="flex items-center gap-1 p-1 mb-2 rounded-xl bg-[#F4F1EA] border border-[#EAE6DD]">
        {(['domestic', 'international'] as const).map((scope) => (
          <button
            key={scope}
            type="button"
            onClick={() => {
              setDestinationScope(scope);
              setHighlightedIndex(0);
              setIsOpen(true);
            }}
            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              destinationScope === scope
                ? 'bg-white text-[#17201D] shadow-xs'
                : 'text-[#68736F] hover:text-[#17201D]'
            }`}
          >
            {scope === 'domestic' ? 'Domestic (India)' : 'International'}
          </button>
        ))}
      </div>

      {/* Input container */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#98A29F]">
          <Search className="w-4.5 h-4.5" />
        </div>

        <input
          id="destination-search-input"
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={inputPlaceholder}
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-invalid={!!error}
          className={`w-full pl-10 pr-10 py-3 rounded-2xl bg-white text-sm font-semibold text-[#17201D] placeholder:text-[#98A29F] border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/20 ${
            error
              ? 'border-[#E55837] focus:border-[#E55837] bg-[#FFF8F6]'
              : isOpen
              ? 'border-[#FF6B4A] shadow-xs'
              : 'border-[#EAE6DD] hover:border-[#D1CCC2]'
          }`}
        />

        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#98A29F] hover:text-[#17201D] cursor-pointer"
            aria-label="Clear destination"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-xs font-semibold text-[#E55837] flex items-center gap-1">
          <span>{error}</span>
        </p>
      )}

      {/* Dropdown Suggestions */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl border border-[#EAE6DD] shadow-xl overflow-hidden max-h-72 overflow-y-auto antialiased"
        >
          {/* Header Banner */}
          <div className="px-3.5 py-2 bg-[#FCFBF8] border-b border-[#F4F1EA] flex items-center justify-between text-[11px] font-bold text-[#68736F] uppercase tracking-wider">
            <span>{searchTerm.trim() ? 'Matching Destinations' : 'Popular Suggestions'}</span>
            <span className="text-[10px] text-[#20B8A6] lowercase font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              curated guides
            </span>
          </div>

          {filteredDestinations.length > 0 ? (
            <div className="p-1.5 space-y-1">
              {filteredDestinations.map((dest, index) => {
                const isSelected =
                  value?.toLowerCase() === dest.name.toLowerCase();
                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={dest.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectDestination(dest)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                      isHighlighted
                        ? 'bg-[#FFF2EE] text-[#17201D]'
                        : 'hover:bg-[#F9F7F1] text-[#2B3632]'
                    }`}
                  >
                    {/* Destination Thumbnail */}
                    <div className="w-11 h-11 rounded-lg overflow-hidden bg-[#F4F1EA] shrink-0 border border-[#EAE6DD]">
                      <img
                        src={dest.imageUrl || dest.image}
                        alt={dest.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Destination Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-extrabold text-[#17201D] truncate">
                          {dest.name}
                        </p>
                        <span className="text-xs text-[#68736F] font-medium truncate">
                          · {dest.country}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5E6B67] truncate mt-0.5">
                        {dest.tagline || dest.shortDescription}
                      </p>
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[#FF6B4A] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* No Matches Found / Custom Destination Option */
            <div className="p-4 text-center">
              <p className="text-xs font-bold text-[#17201D] mb-1">
                No predefined destinations found for "{searchTerm}"
              </p>
              <p className="text-xs text-[#68736F] mb-3">
                You can still plan a trip to this location anywhere in the world!
              </p>
              <button
                type="button"
                onClick={handleCustomEntry}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Use "{searchTerm}" as Destination</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
