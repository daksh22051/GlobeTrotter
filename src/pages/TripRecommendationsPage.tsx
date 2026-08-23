import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Compass,
  ArrowLeft,
  Calendar,
  Layers,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  SlidersHorizontal,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Trip, TripPlannerDraft } from '../types/trip';
import { TripRecommendations, Recommendation, RecommendationCategory } from '../types/recommendation';
import { tripService } from '../services/tripService';
import { profileService } from '../services/profileService';
import { aiTravelService } from '../services/aiTravelService';
import { AIHero } from '../components/recommendations/AIHero';
import { AIRecommendationLoader } from '../components/recommendations/AIRecommendationLoader';
import { RecommendationFilters, FilterCategory, SortOption } from '../components/recommendations/RecommendationFilters';
import { PlaceCard } from '../components/recommendations/PlaceCard';
import { HotelCard } from '../components/recommendations/HotelCard';
import { FoodCard } from '../components/recommendations/FoodCard';
import { ExperienceCard } from '../components/recommendations/ExperienceCard';
import { CostBreakdown } from '../components/recommendations/CostBreakdown';
import { AIInsightCard } from '../components/recommendations/AIInsightCard';
import { TravelTips } from '../components/recommendations/TravelTips';
import { PersonalizeModal } from '../components/recommendations/PersonalizeModal';
import { ToastNotification } from '../components/recommendations/ToastNotification';
import { getPhotoshootPackages } from '../data/photoshootPackages';

export const TripRecommendationsPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [recommendations, setRecommendations] = useState<TripRecommendations | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('match');

  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [personalizeOverrides, setPersonalizeOverrides] = useState<Partial<TripPlannerDraft>>({});
  const [isPersonalizeOpen, setIsPersonalizeOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'added' | 'saved' | 'info' } | null>(null);
  const [showPhotoshootPackages, setShowPhotoshootPackages] = useState(false);
  const selectedCount = useMemo(() => trip?.items?.length ?? addedIds.length, [trip?.items, addedIds]);
  const photoshootPackages = useMemo(() => trip ? getPhotoshootPackages(trip) : [], [trip]);

  const syncTripSelectionState = useCallback((tripIdValue?: string) => {
    if (!tripIdValue) return;

    const refreshedTrip = tripService.getTripById(tripIdValue);
    if (!refreshedTrip) return;

    setTrip(refreshedTrip);
    setAddedIds((refreshedTrip.items || []).map((item) => item.recommendationId));
  }, []);

  // Load trip and initial data
  useEffect(() => {
    if (!tripId) return;

    const loadedTrip = tripService.getTripById(tripId);
    if (loadedTrip) {
      setTrip(loadedTrip);
      setSavedIds(loadedTrip.savedRecommendationIds || []);
      const items = loadedTrip.items || [];
      setAddedIds(items.map((i) => i.recommendationId));
    } else {
      setIsLoading(false);
    }
  }, [tripId]);

  // Generate recommendations
  const generateRecommendationsData = useCallback(async (
    targetTrip: Trip,
    overrides?: Partial<TripPlannerDraft>
  ) => {
    const prefs = profileService.getPreferences();
    const result = await aiTravelService.generateTripRecommendations(targetTrip, prefs, overrides);
    setRecommendations(result);
  }, []);

  // Initial load effect
  useEffect(() => {
    if (!trip) return;
    generateRecommendationsData(trip, personalizeOverrides).then(() => {
      setIsLoading(false);
    });
  }, [trip, generateRecommendationsData]);

  // Refresh handler
  const handleRefresh = async () => {
    if (!trip) return;
    setIsRefreshing(true);
    await generateRecommendationsData(trip, personalizeOverrides);
    setIsRefreshing(false);
    setToast({ message: 'Recommendations refreshed with the latest travel intelligence.', type: 'info' });
  };

  // Personalization apply handler
  const handleApplyPersonalize = async (overrides: Partial<TripPlannerDraft>) => {
    if (!trip) return;
    setPersonalizeOverrides(overrides);
    setIsRefreshing(true);
    await generateRecommendationsData(trip, overrides);
    setIsRefreshing(false);
    setToast({ message: 'Personalized filters applied to recommendations.', type: 'info' });
  };

  // Bookmark / Save toggle
  const handleToggleSave = (recId: string) => {
    if (!trip) return;
    const isCurrentlySaved = savedIds.includes(recId);
    if (isCurrentlySaved) {
      aiTravelService.removeRecommendation(trip.id, recId);
      setSavedIds((prev) => prev.filter((id) => id !== recId));
      setToast({ message: 'Removed from saved recommendations.', type: 'saved' });
    } else {
      aiTravelService.saveRecommendation(trip.id, recId);
      setSavedIds((prev) => [...prev, recId]);
      setToast({ message: 'Saved to your trip bookmarks.', type: 'saved' });
    }
  };

  // Add / Remove from trip plan
  const handleToggleAdd = (rec: Recommendation) => {
    if (!trip) return;
    const isCurrentlyAdded = addedIds.includes(rec.id);
    if (isCurrentlyAdded) {
      aiTravelService.removeTripItem(trip.id, rec.id);
      setAddedIds((prev) => prev.filter((id) => id !== rec.id));
      syncTripSelectionState(trip.id);
      setToast({ message: `Removed ${rec.name} from trip items.`, type: 'info' });
    } else {
      aiTravelService.addTripItem(trip.id, rec);
      setAddedIds((prev) => [...prev, rec.id]);
      syncTripSelectionState(trip.id);
      setToast({ message: `Added ${rec.name} to your trip plan!`, type: 'added' });
    }
  };

  const recommendationSections = useMemo(() => {
    if (!recommendations) return [] as Array<{ key: string; label: string; items: Recommendation[] }>;

    const sortRecommendations = (items: Recommendation[]) => {
      const sorted = [...items];

      if (sortBy === 'match') {
        sorted.sort((a, b) => b.matchScore - a.matchScore);
      } else if (sortBy === 'rating') {
        sorted.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === 'cost_asc') {
        sorted.sort((a, b) => a.estimatedCost - b.estimatedCost);
      } else if (sortBy === 'cost_desc') {
        sorted.sort((a, b) => b.estimatedCost - a.estimatedCost);
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return sorted.filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.location.toLowerCase().includes(q) ||
            (item.tags || []).some((t) => t.toLowerCase().includes(q)) ||
            item.foodDetails?.cuisine?.toLowerCase().includes(q) ||
            item.foodDetails?.signatureDish?.toLowerCase().includes(q)
        );
      }

      return sorted;
    };

    const sections = [
      { key: 'place', label: 'Sightseeing Attractions', items: sortRecommendations(recommendations.places) },
      { key: 'hotel', label: 'Hotels & Stays', items: sortRecommendations(recommendations.hotels) },
      { key: 'food', label: 'Food & Dining', items: sortRecommendations(recommendations.food) },
      { key: 'experience', label: 'Experiences', items: sortRecommendations(recommendations.attractions) },
    ];

    if (selectedCategory !== 'all') {
      const selected = sections.find((section) => section.key === selectedCategory);
      return selected ? [selected] : [];
    }

    return sections.filter((section) => section.items.length > 0);
  }, [recommendations, searchQuery, selectedCategory, sortBy]);

  // Filter & Search & Sort pipeline
  const filteredAndSortedList = useMemo(() => {
    if (!recommendations) return [];

    let list: Recommendation[] = [];
    if (selectedCategory === 'all') {
      list = [...recommendations.allRecommendations];
    } else if (selectedCategory === 'place') {
      list = [...recommendations.places];
    } else if (selectedCategory === 'hotel') {
      list = [...recommendations.hotels];
    } else if (selectedCategory === 'food') {
      list = [...recommendations.food];
    } else if (selectedCategory === 'experience') {
      list = [...recommendations.attractions];
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          (item.tags || []).some((t) => t.toLowerCase().includes(q)) ||
          item.foodDetails?.cuisine?.toLowerCase().includes(q) ||
          item.foodDetails?.signatureDish?.toLowerCase().includes(q)
      );
    }

    // Sort order
    if (sortBy === 'match') {
      list.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'cost_asc') {
      list.sort((a, b) => a.estimatedCost - b.estimatedCost);
    } else if (sortBy === 'cost_desc') {
      list.sort((a, b) => b.estimatedCost - a.estimatedCost);
    }

    return list;
  }, [recommendations, selectedCategory, searchQuery, sortBy]);

  // Counts for category badges
  const categoryCounts = useMemo(() => {
    if (!recommendations) {
      return { all: 0, place: 0, hotel: 0, food: 0, experience: 0 };
    }
    return {
      all: recommendations.allRecommendations.length,
      place: recommendations.places.length,
      hotel: recommendations.hotels.length,
      food: recommendations.food.length,
      experience: recommendations.attractions.length,
    };
  }, [recommendations]);

  // Trip Not Found State
  if (!trip && !isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F1EA] flex items-center justify-center p-6 text-center select-none">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#EAE6DD] shadow-sm">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#FFF9F6] text-[#FF6B4A] flex items-center justify-center">
            <Compass className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-[#17201D] mb-2">Trip Not Found</h2>
          <p className="text-xs sm:text-sm text-[#68736F] mb-6">
            We couldn't locate this trip in your library. It may have been deleted or moved.
          </p>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 rounded-full bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs sm:text-sm font-extrabold shadow-sm transition-colors cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#17201D] font-sans antialiased pb-28">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 bg-[#F4F1EA]/90 backdrop-blur-md border-b border-[#EAE6DD]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 group text-inherit no-underline"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF6B4A] to-[#FF8E72] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-base sm:text-lg font-black tracking-tight text-[#17201D]">
                Globe<span className="text-[#FF6B4A]">Trotter</span>
              </span>
            </Link>

            <span className="text-[#838F8B] text-xs font-bold hidden sm:inline-block">/</span>
            <span className="text-xs font-bold text-[#838F8B] hidden sm:inline-block truncate max-w-xs">
              {trip?.name || 'Trip Intelligence'}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#4E5955] hover:bg-white/80 border border-[#EAE6DD] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(`/trip/${trip?.id}/itinerary`)}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs font-extrabold shadow-xs transition-all cursor-pointer"
            >
              <span>Build Itinerary</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Page Container */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Loading Staged Experience */}
        {isLoading ? (
          <AIRecommendationLoader
            destination={trip?.destination}
            onComplete={() => setIsLoading(false)}
          />
        ) : trip && recommendations ? (
          <div className="w-full">
            {/* Left Content / Main Grid */}
            <div className="w-full min-w-0">
              {/* 1. Hero Section */}
              <AIHero
                trip={trip}
                destinationHeroImage={recommendations.destinationHeroImage}
                destinationSummary={recommendations.destinationSummary}
                onRefresh={handleRefresh}
                onOpenPersonalize={() => setIsPersonalizeOpen(true)}
                onBuildItinerary={() => navigate(`/trip/${trip.id}/itinerary`)}
                onBackToDashboard={() => navigate('/dashboard')}
                isRefreshing={isRefreshing}
              />

              {/* 2. AI Insight Banner */}
              <AIInsightCard insight={recommendations.aiInsight} />

              {trip.tripType === 'photoshoot' && (
                <section className="mb-8 bg-[#17201D] text-white rounded-3xl p-5 sm:p-7 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#5EEAD4]">Photography collection</p>
                      <h2 className="text-xl sm:text-2xl font-black mt-1">Wedding & pre-wedding packages</h2>
                      <p className="text-xs text-white/70 mt-1 max-w-xl">Professional local photographers, curated themes, shoot locations, and transparent package pricing.</p>
                    </div>
                    <button type="button" onClick={() => setShowPhotoshootPackages((visible) => !visible)} className="px-4 py-2 rounded-full bg-[#20B8A6] hover:bg-[#179E8E] text-xs font-extrabold text-white cursor-pointer">
                      {showPhotoshootPackages ? 'Hide packages' : 'View packages'}
                    </button>
                  </div>
                  {showPhotoshootPackages && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {photoshootPackages.map((pkg) => {
                        const isAdded = addedIds.includes(pkg.id);
                        return (
                          <article key={pkg.id} className="bg-white text-[#17201D] rounded-2xl overflow-hidden">
                            <img src={pkg.image} alt={pkg.name} className="h-36 w-full object-cover" />
                            <div className="p-4 space-y-2">
                              <p className="text-[10px] font-black uppercase tracking-wider text-[#FF6B4A]">{pkg.photoshootDetails?.theme}</p>
                              <h3 className="text-sm font-extrabold">{pkg.name}</h3>
                              <p className="text-xs text-[#68736F]">{pkg.location} · {pkg.duration}</p>
                              <p className="text-base font-black">{pkg.currency} {pkg.estimatedCost.toLocaleString()}</p>
                              <p className="text-[11px] text-[#68736F]">Includes: {pkg.photoshootDetails?.packageIncludes.join(' · ')}</p>
                              <button type="button" onClick={() => handleToggleAdd(pkg)} className={`w-full py-2 rounded-xl text-xs font-extrabold cursor-pointer ${isAdded ? 'bg-[#EAF8F5] text-[#179E8E]' : 'bg-[#FF6B4A] text-white hover:bg-[#E55837]'}`}>
                                {isAdded ? 'Added to trip plan' : 'Add package to trip'}
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}

              {/* 3. Filter & Sort Bar */}
              <RecommendationFilters
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortChange={setSortBy}
                counts={categoryCounts}
              />

              {/* 4. Recommendations Card Grid */}
              <div className="space-y-6 pb-20">
                {filteredAndSortedList.length > 0 ? (
                  <div className="space-y-8 pb-12">
                    {recommendationSections.map((section) => (
                      <section key={section.key} className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full bg-[#FF6B4A]" />
                            <h2 className="text-base sm:text-lg font-black text-[#17201D] tracking-tight">
                              {section.label}
                            </h2>
                          </div>
                          <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#838F8B] bg-[#F4F1EA] px-2.5 py-1 rounded-full">
                            {section.items.length} items
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {section.items.map((item, index) => {
                            const isSaved = savedIds.includes(item.id);
                            const isAdded = addedIds.includes(item.id);
                            const itemKey = item.id ? `rec-${item.id}` : `rec-${item.category}-${index}`;

                            const cardContent = (() => {
                              if (item.category === 'place') {
                                return (
                                  <PlaceCard
                                    item={item}
                                    isSaved={isSaved}
                                    isAdded={isAdded}
                                    onToggleSave={handleToggleSave}
                                    onToggleAdd={handleToggleAdd}
                                  />
                                );
                              } else if (item.category === 'hotel') {
                                return (
                                  <HotelCard
                                    item={item}
                                    isSaved={isSaved}
                                    isAdded={isAdded}
                                    onToggleSave={handleToggleSave}
                                    onToggleAdd={handleToggleAdd}
                                  />
                                );
                              } else if (item.category === 'food') {
                                return (
                                  <FoodCard
                                    item={item}
                                    isSaved={isSaved}
                                    isAdded={isAdded}
                                    onToggleSave={handleToggleSave}
                                    onToggleAdd={handleToggleAdd}
                                  />
                                );
                              }

                              return (
                                <ExperienceCard
                                  item={item}
                                  isSaved={isSaved}
                                  isAdded={isAdded}
                                  onToggleSave={handleToggleSave}
                                  onToggleAdd={handleToggleAdd}
                                />
                              );
                            })();

                            return (
                              <motion.div
                                key={itemKey}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: Math.min(index * 0.06, 0.4), ease: 'easeOut' }}
                                whileHover={{ y: -4 }}
                                className="transition-all duration-300"
                              >
                                {cardContent}
                              </motion.div>
                            );
                          })}
                        </div>
                      </section>
                    ))}
                  </div>
                ) : (
                  <div className="w-full bg-white rounded-3xl p-12 text-center border border-[#EAE6DD] shadow-2xs mb-12 select-none">
                    <Search className="w-10 h-10 text-[#838F8B] mx-auto mb-3" />
                    <h3 className="text-base font-extrabold text-[#17201D] mb-1">
                      No recommendations found
                    </h3>
                    <p className="text-xs sm:text-sm text-[#68736F] max-w-sm mx-auto mb-4">
                      We couldn't find any recommendations matching "{searchQuery}". Try a different keyword or category.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      className="px-4 py-2 rounded-full bg-[#FCFBF8] border border-[#EAE6DD] text-xs font-bold text-[#17201D] hover:bg-[#F4F1EA] cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
                
                {/* 5. Cost Estimation & Breakdown */}
                <CostBreakdown
                  costEstimate={recommendations.costEstimate}
                  currency={trip.currency}
                  tripBudget={trip.budget}
                  onOpenPersonalize={() => setIsPersonalizeOpen(true)}
                />

                {/* 6. Destination Smart Travel Tips */}
                <TravelTips
                  tips={recommendations.travelTips}
                  destination={trip.destination}
                />
              </div>
            </div>

          </div>
        ) : null}
      </main>

      {/* Floating Action Strip (Quick Add count & Next Step CTA) */}
      {trip && (
        <div className="fixed bottom-4 left-4 right-4 max-w-4xl mx-auto z-40">
          <div className="bg-[#17201D]/95 backdrop-blur-md text-white rounded-full p-2.5 sm:p-3 px-5 sm:px-6 shadow-2xl border border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#20B8A6] text-white text-xs font-black">
                {selectedCount}
              </div>
              <div className="text-xs">
                <p className="font-extrabold text-white">
                  {selectedCount === 1 ? '1 item selected' : `${selectedCount} items selected`}
                </p>
                <p className="text-[10px] text-white/70 hidden sm:block">
                  Saved directly to your {trip.destination} itinerary workspace
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPersonalizeOpen(true)}
                className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Personalize Filters"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate(`/trip/${trip.id}/itinerary`)}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs sm:text-sm font-extrabold shadow-xs transition-transform active:scale-95 cursor-pointer"
              >
                <span>Build Itinerary</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Personalize Modal */}
      {trip && (
        <PersonalizeModal
          isOpen={isPersonalizeOpen}
          onClose={() => setIsPersonalizeOpen(false)}
          trip={trip}
          onApply={handleApplyPersonalize}
          currentOverrides={personalizeOverrides}
        />
      )}

      {/* Floating Toast Notification */}
      <ToastNotification
        message={toast?.message || null}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
};
