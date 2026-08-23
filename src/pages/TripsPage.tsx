import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trip } from '../types/trip';
import { tripService } from '../services/tripService';
import { authService } from '../services/authService';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Header } from '../components/dashboard/Header';
import { MyTripsHeader } from '../components/trips/MyTripsHeader';
import { TripStatusTabs } from '../components/trips/TripStatusTabs';
import { TripFilterBar } from '../components/trips/TripFilterBar';
import { TripFilterModal } from '../components/trips/TripFilterModal';
import { FeaturedNextTripCard } from '../components/trips/FeaturedNextTripCard';
import { TripCard } from '../components/trips/TripCard';
import { TripListView } from '../components/trips/TripListView';
import { TripSummaryDrawer } from '../components/trips/TripSummaryDrawer';
import { DuplicateTripModal } from '../components/trips/DuplicateTripModal';
import { DeleteTripModal } from '../components/trips/DeleteTripModal';
import { EditTripModal } from '../components/trips/EditTripModal';
import { EmptyTripsState } from '../components/trips/EmptyTripsState';
import { TripCardSkeleton } from '../components/trips/TripCardSkeleton';
import { DestinationSearchModal } from '../components/dashboard/DestinationSearchModal';
import {
  TripFilterState,
  StatusFilter,
  DEFAULT_TRIP_FILTERS,
  applyTripFilters,
  countActiveFilters,
} from '../utils/tripFilters';
import { TripSortOption, sortTrips } from '../utils/tripSorting';
import { searchTrips } from '../utils/tripSearch';
import { getTripStatusCounts, getNextUpcomingTrip } from '../utils/tripStatus';
import { Undo2, X, Sparkles, Check, ChevronDown, ChevronUp } from 'lucide-react';

export const TripsPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const currentUserId = currentUser?.id;

  // Primary data state
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // View mode state (grid vs list)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<TripFilterState>(DEFAULT_TRIP_FILTERS);
  const [sortOption, setSortOption] = useState<TripSortOption>('upcoming_first');
  const [showAllJourneys, setShowAllJourneys] = useState(false);

  // Modals state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [summaryTrip, setSummaryTrip] = useState<Trip | null>(null);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [duplicatingTrip, setDuplicatingTrip] = useState<Trip | null>(null);
  const [deletingTrip, setDeletingTrip] = useState<Trip | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Operation progress
  const [isProcessing, setIsProcessing] = useState(false);

  // Undo Toast state
  const [lastDeletedTrip, setLastDeletedTrip] = useState<Trip | null>(null);
  const [undoToastTimeout, setUndoToastTimeout] = useState<NodeJS.Timeout | null>(null);

  // Load trips from tripService
  const loadTrips = useCallback(() => {
    if (!currentUserId) return;
    setIsLoading(true);
    setFetchError(null);
    try {
      const userTrips = tripService.getUserTrips(currentUserId);
      setTrips(userTrips);
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setIsLoading(false);
    }

    // Background fetch from PostgreSQL
    tripService.fetchTrips(currentUserId).then((freshTrips) => {
      setTrips(freshTrips);
    }).catch((error) => {
      console.error('Failed to fetch trips from the server:', error);
      setFetchError('We could not refresh your trips.');
    });
  }, [currentUserId]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  // Destination list for filter suggestions
  const availableDestinations = useMemo(() => {
    const dests = new Set<string>();
    trips.forEach((t) => {
      if (t.destination) dests.add(t.destination);
    });
    return Array.from(dests).sort();
  }, [trips]);

  // Overall status counts across all raw user trips
  const statusCounts = useMemo(() => {
    return getTripStatusCounts(trips);
  }, [trips]);

  // Featured next adventure (only shown if not aggressively searching / filtering non-upcoming)
  const featuredTrip = useMemo(() => {
    if (filters.status !== 'all' && filters.status !== 'upcoming' && filters.status !== 'ongoing') {
      return null;
    }
    if (searchQuery.trim().length > 0) {
      return null;
    }
    return getNextUpcomingTrip(trips);
  }, [trips, filters.status, searchQuery]);

  // Processed and filtered trips list
  const filteredAndSortedTrips = useMemo(() => {
    // 1. Search
    let result = searchTrips(trips, searchQuery);

    // 2. Filter criteria
    result = applyTripFilters(result, filters);

    // 3. Sort (preserving pinned on top)
    result = sortTrips(result, sortOption, true);

    return result;
  }, [trips, searchQuery, filters, sortOption]);

  const journeyTrips = useMemo(() => {
    if (!featuredTrip) return filteredAndSortedTrips;
    return filteredAndSortedTrips.filter((trip) => trip.id !== featuredTrip.id);
  }, [filteredAndSortedTrips, featuredTrip]);

  const visibleJourneyTrips = useMemo(
    () => (showAllJourneys ? journeyTrips : journeyTrips.slice(0, 4)),
    [journeyTrips, showAllJourneys]
  );

  // Handler: Toggle Favorite
  const handleToggleFavorite = (tripId: string) => {
    const updated = tripService.toggleFavorite(tripId);
    if (updated) {
      setTrips((prev) => prev.map((t) => (t.id === tripId ? updated : t)));
    }
  };

  // Handler: Toggle Pin
  const handleTogglePin = (tripId: string) => {
    const updated = tripService.togglePinned(tripId);
    if (updated) {
      setTrips((prev) => prev.map((t) => (t.id === tripId ? updated : t)));
    }
  };

  // Handler: Edit Save
  const handleSaveEdit = (tripId: string, updates: Partial<Trip>) => {
    setIsProcessing(true);
    try {
      const updated = tripService.updateTrip(tripId, updates);
      if (updated) {
        setTrips((prev) => prev.map((t) => (t.id === tripId ? updated : t)));
      }
      setEditingTrip(null);
    } catch (err) {
      console.error('Failed to update trip:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler: Duplicate Trip
  const handleConfirmDuplicate = async () => {
    if (!duplicatingTrip) return;
    setIsProcessing(true);
    try {
      const duplicated = await tripService.duplicateTrip(duplicatingTrip.id);
      if (duplicated) {
        setTrips((prev) => [duplicated, ...prev]);
      }
      setDuplicatingTrip(null);
    } catch (err) {
      console.error('Failed to duplicate trip:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler: Delete Trip with Undo support
  const handleConfirmDelete = () => {
    if (!deletingTrip) return;
    setIsProcessing(true);
    try {
      const tripToDelete = { ...deletingTrip };
      const success = tripService.deleteTrip(deletingTrip.id);
      if (success) {
        setTrips((prev) => prev.filter((t) => t.id !== tripToDelete.id));

        // Setup Undo notification
        if (undoToastTimeout) clearTimeout(undoToastTimeout);
        setLastDeletedTrip(tripToDelete);
        const timeout = setTimeout(() => {
          setLastDeletedTrip(null);
        }, 6000);
        setUndoToastTimeout(timeout);
      }
      setDeletingTrip(null);
    } catch (err) {
      console.error('Failed to delete trip:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler: Undo Delete
  const handleUndoDelete = () => {
    if (!lastDeletedTrip) return;
    const restored = tripService.restoreTrip(lastDeletedTrip);
    if (restored) {
      setTrips((prev) => [restored, ...prev]);
    }
    setLastDeletedTrip(null);
    if (undoToastTimeout) clearTimeout(undoToastTimeout);
  };

  // Status tab change handler
  const handleSelectStatus = (status: StatusFilter) => {
    setFilters((prev) => ({ ...prev, status }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_TRIP_FILTERS);
    setSearchQuery('');
  };

  const handleClearAllTrips = () => {
    if (trips.length === 0) return;
    const confirmed = window.confirm('Remove all saved trips from My Trips? This cannot be undone.');
    if (!confirmed) return;
    if (tripService.deleteAllTrips(currentUserId)) {
      setTrips([]);
      setSummaryTrip(null);
      setEditingTrip(null);
      setDuplicatingTrip(null);
      setDeletingTrip(null);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex text-[#17201D]">
      {/* Sidebar navigation */}
      <Sidebar currentUser={currentUser} onLogout={handleLogout} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <Header
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenSearch={() => setIsSearchModalOpen(true)}
        />

        {/* Page Body Container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 sm:py-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8">
          {/* 1. Page Title & Action Header */}
          <MyTripsHeader
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            totalTripsCount={trips.length}
            onClearAll={handleClearAllTrips}
          />

          {/* 2. Status Category Tabs */}
          <TripStatusTabs
            activeStatus={filters.status}
            onSelectStatus={handleSelectStatus}
            counts={statusCounts}
          />

          {/* 3. Search & Comprehensive Filter Bar */}
          <TripFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filters={filters}
            onOpenFilterModal={() => setIsFilterModalOpen(true)}
            onResetFilters={handleResetFilters}
            sortOption={sortOption}
            onSortChange={setSortOption}
            totalFilteredCount={filteredAndSortedTrips.length}
          />

          {/* 4. Featured / Next Adventure Highlight (if eligible) */}
          {featuredTrip && (
            <section aria-label="Next upcoming adventure">
              <FeaturedNextTripCard trip={featuredTrip} />
            </section>
          )}

          {/* 5. Main Trips Grid / List Collection */}
          <section aria-label="Trips collection" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#17201D] tracking-tight">
                {filters.status === 'all'
                  ? 'All Journeys'
                  : `${filters.status.charAt(0).toUpperCase() + filters.status.slice(1)} Journeys`}
                <span className="text-xs font-semibold text-[#8C9B95] ml-2">
                  ({journeyTrips.length})
                </span>
              </h2>

              {filters.pinnedOnly && (
                <span className="text-xs font-bold text-[#1F8A70] bg-[#E8F8F5] px-2.5 py-0.5 rounded-full border border-[#B2E6DC]">
                  Showing Pinned Only
                </span>
              )}
            </div>

            {/* Skeleton Loading State */}
            {isLoading ? (
              <TripCardSkeleton viewMode={viewMode} count={6} />
            ) : fetchError && trips.length === 0 ? (
              <div className="text-center py-16 px-6 bg-white rounded-3xl border border-[#EAE6DD] shadow-2xs max-w-2xl mx-auto my-8">
                <h3 className="text-xl font-extrabold text-[#17201D] tracking-tight">
                  We couldn&apos;t load your journeys
                </h3>
                <p className="text-sm text-[#556960] mt-2">{fetchError}</p>
                <button
                  type="button"
                  onClick={loadTrips}
                  className="mt-6 px-5 py-2.5 rounded-xl bg-[#17201D] text-white text-sm font-bold hover:bg-[#FF6B4A] transition-colors cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            ) : trips.length === 0 ? (
              /* Case A: Zero trips in total */
              <EmptyTripsState type="zero_trips" />
            ) : journeyTrips.length === 0 ? (
              /* Case B: Filters or search yielded no results */
              <EmptyTripsState
                type={searchQuery ? 'no_search_results' : 'no_status_results'}
                searchQuery={searchQuery}
                status={filters.status}
                onClearFilters={handleResetFilters}
              />
            ) : viewMode === 'grid' ? (
              /* Grid Layout */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleJourneyTrips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onEdit={(t) => setEditingTrip(t)}
                    onDuplicate={(t) => setDuplicatingTrip(t)}
                    onDelete={(t) => setDeletingTrip(t)}
                    onToggleFavorite={handleToggleFavorite}
                    onTogglePin={handleTogglePin}
                    onOpenSummary={(t) => setSummaryTrip(t)}
                  />
                ))}
              </div>
            ) : (
              /* List Layout */
              <TripListView
                trips={visibleJourneyTrips}
                onEdit={(t) => setEditingTrip(t)}
                onDuplicate={(t) => setDuplicatingTrip(t)}
                onDelete={(t) => setDeletingTrip(t)}
                onToggleFavorite={handleToggleFavorite}
                onTogglePin={handleTogglePin}
              />
            )}

            {journeyTrips.length > 4 && (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowAllJourneys((previous) => !previous)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#EAE6DD] bg-white px-4 py-2.5 text-xs font-bold text-[#556960] shadow-2xs transition-colors hover:border-[#FF6B4A] hover:text-[#FF6B4A] cursor-pointer"
                  aria-expanded={showAllJourneys}
                >
                  <span>{showAllJourneys ? 'Show fewer journeys' : `View all ${journeyTrips.length} journeys`}</span>
                  {showAllJourneys ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Filter Modal */}
      <TripFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={setFilters}
        availableDestinations={availableDestinations}
      />

      {/* Summary Slide-over Drawer */}
      <TripSummaryDrawer
        trip={summaryTrip}
        isOpen={Boolean(summaryTrip)}
        onClose={() => setSummaryTrip(null)}
        onEdit={(t) => setEditingTrip(t)}
        onDuplicate={(t) => setDuplicatingTrip(t)}
        onDelete={(t) => setDeletingTrip(t)}
      />

      {/* Edit Trip Modal */}
      <EditTripModal
        isOpen={Boolean(editingTrip)}
        trip={editingTrip}
        onClose={() => setEditingTrip(null)}
        onSave={handleSaveEdit}
        isSaving={isProcessing}
      />

      {/* Duplicate Trip Confirmation Modal */}
      <DuplicateTripModal
        isOpen={Boolean(duplicatingTrip)}
        trip={duplicatingTrip}
        onClose={() => setDuplicatingTrip(null)}
        onConfirm={handleConfirmDuplicate}
        isDuplicating={isProcessing}
      />

      {/* Delete Trip Confirmation Modal */}
      <DeleteTripModal
        isOpen={Boolean(deletingTrip)}
        trip={deletingTrip}
        onClose={() => setDeletingTrip(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isProcessing}
      />

      {/* Global Quick Search Modal */}
      <DestinationSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        currency={currentUser?.preferredCurrency || 'INR'}
      />

      {/* Floating Undo Toast Notification */}
      {lastDeletedTrip && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#17201D] text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <div className="text-xs font-semibold">
            Trip &ldquo;{lastDeletedTrip.name}&rdquo; was deleted
          </div>
          <button
            type="button"
            onClick={handleUndoDelete}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FF6B4A] hover:bg-[#E85535] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
          <button
            type="button"
            onClick={() => setLastDeletedTrip(null)}
            className="text-white/60 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
