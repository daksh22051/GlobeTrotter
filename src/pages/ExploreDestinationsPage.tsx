import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Compass,
  Search,
  SlidersHorizontal,
  MapPin,
  Star,
  Calendar,
  Sparkles,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  DollarSign,
  Info,
  X,
  ExternalLink,
} from 'lucide-react';
import { FEATURED_DESTINATIONS } from '../data/destinations';
import { Destination } from '../types';

export const ExploreDestinationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'india' | 'international'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'budget-asc' | 'budget-desc' | 'name'>('rating');
  const [savedDestinationIds, setSavedDestinationIds] = useState<string[]>([]);
  const [selectedDestForModal, setSelectedDestForModal] = useState<Destination | null>(null);

  const tags = ['All', 'Culture', 'Food', 'Mountains', 'Beaches', 'Luxury', 'History', 'Nature', 'Adventure', 'Wellness'];
  const regions = ['All', 'India', 'Western Europe', 'Southern Europe', 'East Asia', 'Southeast Asia', 'Middle East', 'North America', 'Oceania'];

  const vibeToTag: Record<string, string> = {
    weekend: 'Nature',
    'hidden-gems': 'Nature',
    'food-journeys': 'Food',
    'mountain-adventures': 'Mountains',
    'beach-getaways': 'Beaches',
  };

  // Inspiration links arrive as stable theme IDs so the catalog opens filtered.
  useEffect(() => {
    const vibe = searchParams.get('vibe')?.toLowerCase() || '';
    const mappedTag = vibeToTag[vibe];
    setSelectedTag(mappedTag || 'All');
  }, [searchParams]);

  const filteredDestinations = useMemo(() => {
    return FEATURED_DESTINATIONS.filter((dest) => {
      const isIndia = dest.country.toLowerCase() === 'india' || dest.isDomestic;
      if (scopeFilter === 'india' && !isIndia) return false;
      if (scopeFilter === 'international' && isIndia) return false;

      const matchesSearch =
        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dest.region && dest.region.toLowerCase().includes(searchQuery.toLowerCase())) ||
        dest.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTag =
        selectedTag === 'All' ||
        dest.tags?.some((t) => t.toLowerCase() === selectedTag.toLowerCase());

      const matchesRegion =
        selectedRegion === 'All' ||
        dest.region === selectedRegion ||
        (selectedRegion === 'India' && isIndia);

      return matchesSearch && matchesTag && matchesRegion;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'budget-asc') return a.estimatedDailyBudget - b.estimatedDailyBudget;
      if (sortBy === 'budget-desc') return b.estimatedDailyBudget - a.estimatedDailyBudget;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [searchQuery, selectedTag, selectedRegion, scopeFilter, sortBy]);

  const toggleSaveDestination = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedDestinationIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handlePlanTrip = (destName: string) => {
    navigate(`/plan-trip?dest=${encodeURIComponent(destName)}&quick=1`);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#17201D] pb-24">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF8F5] text-[#179E8E] flex items-center justify-center font-bold">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#17201D]">Explore Destinations</h1>
              <p className="text-xs text-[#68736F]">Global Discovery Catalog & Curated Itineraries</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl border border-[#E2E8F0] hover:bg-[#F1F5F9] text-sm font-medium transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[linear-gradient(118deg,#0d5f57_0%,#138978_38%,#1bb49d_72%,#0f746b_100%)] text-white py-14 sm:py-18 px-4 sm:px-6 lg:px-8 shadow-[0_18px_45px_rgba(15,116,107,0.2)]">
        <div className="pointer-events-none absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_12%_20%,rgba(255,255,255,0.18)_0_1px,transparent_1.5px),radial-gradient(circle_at_84%_72%,rgba(255,255,255,0.14)_0_1px,transparent_1.5px)] bg-[length:28px_28px,36px_36px]" />
        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-[30rem] rotate-12 rounded-[40%] bg-[#5eead4]/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 bottom-[-9rem] h-72 w-[34rem] -rotate-12 rounded-[45%] bg-[#064e3b]/25 blur-3xl" />
        <div className="relative z-10 max-w-7xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/12 border border-white/20 backdrop-blur-md text-[10px] sm:text-xs font-semibold tracking-[0.14em] uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            Global Discovery Engine
          </span>
          <h2 className="text-3xl sm:text-5xl md:text-6xl leading-[1.05] font-black tracking-tight max-w-4xl mx-auto drop-shadow-sm">
            Where do you want to explore next?
          </h2>
          <p className="text-white/85 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Discover breathtaking world capitals, Himalayan mountain retreats, serene beaches, and historic architectural wonders hand-picked for your travel style.
          </p>

          {/* Search Box */}
          <div className="max-w-3xl mx-auto mt-7 p-2 rounded-[1.35rem] bg-white/14 border border-white/25 backdrop-blur-xl shadow-[0_18px_50px_rgba(4,47,46,0.26)] flex flex-col sm:flex-row items-center gap-2">
            <div className="flex items-center gap-3 px-4 py-3 w-full sm:flex-1 rounded-xl bg-white/90 shadow-inner">
              <Search className="w-5 h-5 text-[#179E8E] shrink-0" />
              <input
                type="text"
                placeholder="Search by city, country, or vibe (e.g. Paris, Tokyo, Himalayas)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-[#17201D] placeholder-[#68736F] text-sm focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-[#68736F] hover:text-[#17201D]"
                >
                  Clear
                </button>
              )}
            </div>
            <button
              onClick={() => {}}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#FF6B4A] hover:bg-[#E55837] text-white font-bold text-sm shadow-[0_8px_18px_rgba(255,107,74,0.28)] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              Search Catalog
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        {/* Filters & Tags Bar */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4">
          {/* Scope Segment: All vs India vs International */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setScopeFilter('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  scopeFilter === 'all'
                    ? 'bg-white text-[#17201D] shadow-xs'
                    : 'text-[#68736F] hover:text-[#17201D]'
                }`}
              >
                All Destinations ({FEATURED_DESTINATIONS.length})
              </button>
              <button
                type="button"
                onClick={() => setScopeFilter('india')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  scopeFilter === 'india'
                    ? 'bg-[#FF6B4A] text-white shadow-xs'
                    : 'text-[#68736F] hover:text-[#17201D]'
                }`}
              >
                <span>Incredible India 🇮🇳</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${scopeFilter === 'india' ? 'bg-white/20 text-white' : 'bg-[#EAE6DD] text-[#68736F]'}`}>
                  {FEATURED_DESTINATIONS.filter((d) => d.country.toLowerCase() === 'india' || d.isDomestic).length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setScopeFilter('international')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  scopeFilter === 'international'
                    ? 'bg-[#179E8E] text-white shadow-xs'
                    : 'text-[#68736F] hover:text-[#17201D]'
                }`}
              >
                <span>International ✈️</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${scopeFilter === 'international' ? 'bg-white/20 text-white' : 'bg-[#EAE6DD] text-[#68736F]'}`}>
                  {FEATURED_DESTINATIONS.filter((d) => d.country.toLowerCase() !== 'india' && !d.isDomestic).length}
                </span>
              </button>
            </div>
            
            <p className="text-xs text-[#68736F]">
              Showing balanced domestic & global inspirations
            </p>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Tag Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
              <span className="text-xs font-bold text-[#68736F] uppercase tracking-wider mr-2 shrink-0">
                Vibe:
              </span>
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-[#179E8E] text-white shadow-xs'
                      : 'bg-[#F1F5F9] text-[#68736F] hover:bg-[#E2E8F0]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>


            {/* Sort & Region Controls */}
            <div className="flex items-center gap-3 shrink-0">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs font-medium bg-white text-[#17201D] focus:outline-none focus:ring-2 focus:ring-[#179E8E]"
              >
                {regions.map((reg) => (
                  <option key={reg} value={reg}>
                    Region: {reg}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs font-medium bg-white text-[#17201D] focus:outline-none focus:ring-2 focus:ring-[#179E8E]"
              >
                <option value="rating">Sort: Top Rated</option>
                <option value="budget-asc">Budget: Low to High</option>
                <option value="budget-desc">Budget: High to Low</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[#68736F]">
            Showing <span className="text-[#17201D] font-bold">{filteredDestinations.length}</span> curated destinations
          </p>
          {(searchQuery || selectedTag !== 'All' || selectedRegion !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTag('All');
                setSelectedRegion('All');
              }}
              className="text-xs text-[#179E8E] font-bold hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Destination Cards Grid */}
        {filteredDestinations.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-[#E2E8F0] space-y-4">
            <Compass className="w-12 h-12 text-[#68736F] mx-auto opacity-50" />
            <h3 className="text-lg font-bold text-[#17201D]">No destinations found</h3>
            <p className="text-sm text-[#68736F] max-w-md mx-auto">
              We couldn't find any destinations matching your current filters. Try searching for another city or resetting filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTag('All');
                setSelectedRegion('All');
              }}
              className="px-5 py-2 rounded-xl bg-[#179E8E] text-white text-xs font-bold"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDestinations.map((dest) => {
              const isSaved = savedDestinationIds.includes(dest.id);
              return (
                <div
                  key={dest.id}
                  onClick={() => handlePlanTrip(dest.id)}
                  className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer group"
                >
                  {/* Card Image Banner */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={dest.imageUrl || dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    
                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-[#17201D] shadow-xs">
                        {dest.region}
                      </span>
                      <button
                        onClick={(e) => toggleSaveDestination(dest.id, e)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${
                          isSaved ? 'bg-[#FF6B4A] text-white' : 'bg-white/80 text-[#17201D] hover:bg-white'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Bottom Image Overlay text */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="flex items-center gap-1.5 text-xs text-yellow-300 font-bold mb-1">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{dest.rating}</span>
                        <span className="text-white/80 font-normal">({dest.reviewCount}+ reviews)</span>
                      </div>
                      <h3 className="text-2xl font-extrabold tracking-tight">{dest.name}, {dest.country}</h3>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-[#179E8E]">{dest.tagline}</p>
                      <p className="text-xs text-[#68736F] line-clamp-2">{dest.shortDescription}</p>

                      {/* Highlights Pill */}
                      {dest.highlights && dest.highlights.length > 0 && (
                        <div className="pt-2 border-t border-[#F1F5F9] flex flex-wrap gap-1.5">
                          {dest.highlights.slice(0, 3).map((h, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-[#EAF8F5] text-[#179E8E] text-[10px] font-semibold"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer Budget & Plan CTA */}
                    <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#68736F] font-bold uppercase tracking-wider block">
                          Est. Daily Budget
                        </span>
                        <span className="text-sm font-bold text-[#17201D]">
                          ₹{dest.estimatedDailyBudget?.toLocaleString()} / day
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlanTrip(dest.name);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        <span>Plan Trip</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Destination Detail Modal */}
      {selectedDestForModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E2E8F0]">
            <div className="relative h-72">
              <img
                src={selectedDestForModal.imageUrl || selectedDestForModal.image}
                alt={selectedDestForModal.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <button
                onClick={() => setSelectedDestForModal(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="px-3 py-1 rounded-full bg-[#179E8E] text-white text-xs font-bold mb-2 inline-block">
                  {selectedDestForModal.region}
                </span>
                <h2 className="text-3xl font-extrabold">{selectedDestForModal.name}, {selectedDestForModal.country}</h2>
                <p className="text-white/90 text-sm">{selectedDestForModal.tagline}</p>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#68736F] uppercase tracking-wider">Overview</h4>
                <p className="text-sm text-[#17201D] leading-relaxed">{selectedDestForModal.shortDescription}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-[#F8F9FA] p-4 rounded-2xl border border-[#E2E8F0]">
                <div>
                  <span className="text-xs text-[#68736F] font-bold block">Estimated Daily Budget</span>
                  <span className="text-lg font-extrabold text-[#17201D]">₹{selectedDestForModal.estimatedDailyBudget?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-xs text-[#68736F] font-bold block">Traveler Rating</span>
                  <span className="text-lg font-extrabold text-[#179E8E] flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current text-yellow-500" />
                    {selectedDestForModal.rating} / 5.0
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#68736F] uppercase tracking-wider">Top Highlights & Landmarks</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedDestForModal.highlights?.map((h, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-[#EAF8F5]/50 border border-[#179E8E]/20 text-xs font-bold text-[#17201D]">
                      <CheckCircle2 className="w-4 h-4 text-[#179E8E]" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedDestForModal(null)}
                  className="px-5 py-2.5 rounded-xl border border-[#E2E8F0] text-xs font-bold hover:bg-[#F1F5F9]"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const name = selectedDestForModal.name;
                    setSelectedDestForModal(null);
                    handlePlanTrip(name);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  <span>Plan Trip to {selectedDestForModal.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
