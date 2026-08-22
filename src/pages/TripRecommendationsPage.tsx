import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Compass,
  ArrowLeft,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  SlidersHorizontal,
  RefreshCw,
  Search,
  Map as MapIcon,
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

  // Initial loader completion
  const handleLoaderComplete = useCallback(async () => {
    if (trip) {
      await generateRecommendationsData(trip, personalizeOverrides);
    }
    setIsLoading(false);
  }, [trip, personalizeOverrides, generateRecommendationsData]);

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
      setToast({ message: `Removed ${rec.name} from trip items.`, type: 'info' });
    } else {
      aiTravelService.addTripItem(trip.id, rec);
      setAddedIds((prev) => [...prev, rec.id]);
      setToast({ message: `Added ${rec.name} to your trip plan!`, type: 'added' });
    }
  };

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
              onClick={() => navigate(`/trip/${trip?.id}/map`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#EAE6DD] hover:border-[#17201D] text-[#17201D] text-xs font-bold shadow-2xs transition-all cursor-pointer"
            >
              <MapIcon className="w-3.5 h-3.5 text-[#FF6B4A]" />
              <span className="hidden sm:inline">Map View</span>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Loading Staged Experience */}
        {isLoading ? (
          <AIRecommendationLoader
            destination={trip?.destination}
            onComplete={handleLoaderComplete}
          />
        ) : trip && recommendations ? (
          <>
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
            {filteredAndSortedList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {filteredAndSortedList.map((item, index) => {
                  const isSaved = savedIds.includes(item.id);
                  const isAdded = addedIds.includes(item.id);
                  const itemKey = item.id ? `rec-${item.id}` : `rec-${item.category}-${index}`;

                  if (item.category === 'place') {
                    return (
                      <PlaceCard
                        key={itemKey}
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
                        key={itemKey}
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
                        key={itemKey}
                        item={item}
                        isSaved={isSaved}
                        isAdded={isAdded}
                        onToggleSave={handleToggleSave}
                        onToggleAdd={handleToggleAdd}
                      />
                    );
                  } else {
                    return (
                      <ExperienceCard
                        key={itemKey}
                        item={item}
                        isSaved={isSaved}
                        isAdded={isAdded}
                        onToggleSave={handleToggleSave}
                        onToggleAdd={handleToggleAdd}
                      />
                    );
                  }
                })}
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

            {/* Floating Action Strip (Quick Add count & Next Step CTA) */}
            <div className="fixed bottom-4 left-4 right-4 max-w-4xl mx-auto z-40">
              <div className="bg-[#17201D]/95 backdrop-blur-md text-white rounded-full p-2.5 sm:p-3 px-5 sm:px-6 shadow-2xl border border-white/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#20B8A6] text-white text-xs font-black">
                    {addedIds.length}
                  </div>
                  <div className="text-xs">
                    <p className="font-extrabold text-white">
                      {addedIds.length === 1 ? '1 item selected' : `${addedIds.length} items selected`}
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

            {/* Personalize Modal */}
            <PersonalizeModal
              isOpen={isPersonalizeOpen}
              onClose={() => setIsPersonalizeOpen(false)}
              trip={trip}
              onApply={handleApplyPersonalize}
              currentOverrides={personalizeOverrides}
            />
          </>
        ) : null}
      </main>

      {/* Floating Toast Notification */}
      <ToastNotification
        message={toast?.message || null}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
};
