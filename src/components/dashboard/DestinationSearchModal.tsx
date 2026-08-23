import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, MapPin, Star, ArrowRight, Tag, Sparkles } from 'lucide-react';
import { FEATURED_DESTINATIONS } from '../../data/destinations';
import { Destination } from '../../types/destination';
import { CurrencyCode } from '../../types/profile';
import { formatCurrency } from '../../utils/currency';

interface DestinationSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyCode;
}

const QUICK_FILTERS = ['All', 'Mountains', 'Beaches', 'Food', 'Culture', 'Adventure', 'Architecture'];

export const DestinationSearchModal: React.FC<DestinationSearchModalProps> = ({
  isOpen,
  onClose,
  currency,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setActiveFilter('All');
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredDestinations = FEATURED_DESTINATIONS.filter((dest) => {
    const matchesFilter =
      activeFilter === 'All' ||
      dest.tags.some((t) => t.toLowerCase() === activeFilter.toLowerCase());

    if (!matchesFilter) return false;

    if (!query.trim()) return true;

    const q = query.toLowerCase();
    return (
      dest.name.toLowerCase().includes(q) ||
      dest.country.toLowerCase().includes(q) ||
      dest.shortDescription.toLowerCase().includes(q) ||
      dest.tags.some((t) => t.toLowerCase().includes(q)) ||
      dest.bestFor.toLowerCase().includes(q)
    );
  });

  const handleSelectDestination = (dest: Destination) => {
    onClose();
    navigate('/plan-trip');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 sm:p-6 md:p-12 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl border border-[#EAE6DD] shadow-2xl overflow-hidden mt-6 sm:mt-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Header */}
        <div className="p-4 sm:p-5 border-b border-[#F4F1EA] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#FF6B4A] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search destinations, trips, or experiences..."
            className="w-full text-base sm:text-lg font-medium text-[#17201D] placeholder-[#98A29F] bg-transparent focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-[#98A29F] hover:text-[#17201D] hover:bg-[#F4F1EA] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 rounded-xl bg-[#F4F1EA] hover:bg-[#EAE6DD] text-[#68736F] text-xs font-bold transition-colors shrink-0"
          >
            Esc
          </button>
        </div>

        {/* Quick Filter Tags */}
        <div className="px-4 sm:px-5 py-3 bg-[#FCFBF8] border-b border-[#F4F1EA] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-[#98A29F] uppercase tracking-wider mr-1 shrink-0">
            Filter:
          </span>
          {QUICK_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                activeFilter === filter
                  ? 'bg-[#FF6B4A] text-white shadow-xs'
                  : 'bg-white text-[#5E6B67] hover:bg-[#F4F1EA] border border-[#EAE6DD]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 sm:p-4 space-y-2">
          {filteredDestinations.length === 0 ? (
            <div className="py-12 text-center text-[#68736F]">
              <p className="text-sm font-bold text-[#17201D] mb-1">No destinations found</p>
              <p className="text-xs">Try searching for &quot;Bali&quot;, &quot;Mountains&quot;, or &quot;Europe&quot;</p>
            </div>
          ) : (
            filteredDestinations.map((dest) => (
              <div
                key={dest.id}
                onClick={() => handleSelectDestination(dest)}
                className="group flex items-center justify-between gap-3 p-3 rounded-2xl hover:bg-[#FFF9F6] border border-transparent hover:border-[#FFE2D9] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img
                    src={dest.image || dest.imageUrl}
                    alt={dest.name}
                    className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-[#EAE6DD]"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-[#17201D] group-hover:text-[#FF6B4A] transition-colors truncate">
                        {dest.name}
                      </h4>
                      <span className="text-xs text-[#68736F] truncate">• {dest.country}</span>
                      <div className="flex items-center gap-0.5 text-xs text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{dest.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#5E6B67] truncate mt-0.5">{dest.shortDescription}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {(dest.tags || []).slice(0, 3).map((tag, idx) => (
                        <span
                          key={`${dest.id}-tag-${idx}`}
                          className="px-1.5 py-0.2 rounded bg-[#F4F1EA] text-[10px] font-semibold text-[#68736F]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-[#98A29F] uppercase font-bold block">
                      Est. Daily
                    </span>
                    <span className="text-xs font-black text-[#17201D]">
                      {formatCurrency(dest.estimatedDailyBudget, currency)}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white border border-[#EAE6DD] group-hover:bg-[#FF6B4A] group-hover:border-[#FF6B4A] group-hover:text-white flex items-center justify-center text-[#98A29F] transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#FCFBF8] border-t border-[#F4F1EA] flex items-center justify-between text-xs text-[#98A29F]">
          <span>Tip: Click any destination to start planning a customized trip</span>
          <span className="hidden sm:inline">Press Esc to close</span>
        </div>
      </div>
    </div>
  );
};
