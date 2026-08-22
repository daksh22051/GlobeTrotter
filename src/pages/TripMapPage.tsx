import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowLeft,
  Plus,
  Sparkles,
  Map as MapIcon,
  ListFilter,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { tripService } from '../services/tripService';
import { itineraryService } from '../services/itineraryService';
import { routeOptimizationService, RouteOptimizationOutput } from '../services/routeOptimizationService';
import { Trip } from '../types/trip';
import { Itinerary, ItineraryActivity, ItineraryDay } from '../types/itinerary';
import {
  MapMarkerLocation,
  RouteSegment,
  UserCurrentLocation,
  TripMapStats,
} from '../types/map';
import {
  extractMapMarkers,
  calculateDayRouteSegments,
  calculateTripMapStats,
} from '../utils/routeCalculator';

// Subcomponents
import { MapHeader } from '../components/trip-map/MapHeader';
import { DayFilter } from '../components/trip-map/DayFilter';
import { JourneyList } from '../components/trip-map/JourneyList';
import { TripMap } from '../components/trip-map/TripMap';
import { RouteSummaryCard } from '../components/trip-map/RouteSummaryCard';
import { MapControls } from '../components/trip-map/MapControls';
import { MapLegend } from '../components/trip-map/MapLegend';
import { LocationDetailsDrawer } from '../components/trip-map/LocationDetailsDrawer';
import { AddPlaceDrawer } from '../components/trip-map/AddPlaceDrawer';
import { RouteOptimizationModal } from '../components/trip-map/RouteOptimizationModal';
import { EditActivityModal } from '../components/trip-map/EditActivityModal';
import { MoveActivityModal } from '../components/trip-map/MoveActivityModal';
import { DeleteConfirmationModal } from '../components/trip-map/DeleteConfirmationModal';

export const TripMapPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  // Core Data State
  const [trip, setTrip] = useState<Trip | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Undo History
  const [history, setHistory] = useState<Itinerary[]>([]);
  const [undoToast, setUndoToast] = useState<{ message: string; prevItinerary: Itinerary } | null>(null);

  // Map Filter & View State
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | 'all'>('all');
  const [mobileTab, setMobileTab] = useState<'map' | 'places'>('map');

  // Interaction State
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);
  const [selectedMarkerForDrawer, setSelectedMarkerForDrawer] = useState<MapMarkerLocation | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  // Geolocation
  const [userLocation, setUserLocation] = useState<UserCurrentLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Modals
  const [isAddPlaceOpen, setIsAddPlaceOpen] = useState(false);
  const [addPlaceDefaultDay, setAddPlaceDefaultDay] = useState<number>(1);
  const [isOptimizeModalOpen, setIsOptimizeModalOpen] = useState(false);

  // Activity Edit/Move/Delete
  const [editingActivity, setEditingActivity] = useState<{ act: ItineraryActivity; dayNumber: number } | null>(null);
  const [movingActivity, setMovingActivity] = useState<{ act: ItineraryActivity; fromDayNumber: number } | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<{ act: ItineraryActivity; dayNumber: number } | null>(null);

  // Global Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Load Trip & Itinerary
  useEffect(() => {
    if (!tripId) return;

    const loadedTrip = tripService.getTripById(tripId);
    if (loadedTrip) {
      setTrip(loadedTrip);
      const loadedItinerary = itineraryService.getItinerary(tripId, loadedTrip);
      setItinerary(loadedItinerary);
    }
    setIsLoading(false);
  }, [tripId]);

  // Commit itinerary change with persistence
  const commitChange = useCallback(
    (newItinerary: Itinerary, withUndoText?: string) => {
      if (itinerary) {
        setHistory((prev) => [...prev.slice(-10), itinerary]);
        if (withUndoText) {
          setUndoToast({ message: withUndoText, prevItinerary: itinerary });
          setTimeout(() => setUndoToast(null), 4500);
        }
      }
      setItinerary(newItinerary);

      // Autosave
      setIsSaving(true);
      setTimeout(() => {
        itineraryService.saveItinerary(newItinerary);
        setIsSaving(false);
      }, 300);
    },
    [itinerary]
  );

  const handleUndo = () => {
    if (undoToast?.prevItinerary) {
      setItinerary(undoToast.prevItinerary);
      itineraryService.saveItinerary(undoToast.prevItinerary);
      setUndoToast(null);
      showToast('Action undone ✓');
    }
  };

  // 2. Computed Map Markers & Route Segments
  const currentMarkers = useMemo(() => {
    if (!itinerary) return [];
    return extractMapMarkers(itinerary, selectedDayNumber);
  }, [itinerary, selectedDayNumber]);

  const currentSegments = useMemo(() => {
    if (!itinerary) return [];
    if (selectedDayNumber === 'all') {
      const allSegments: RouteSegment[] = [];
      itinerary.days.forEach((day) => {
        const segs = calculateDayRouteSegments(day, itinerary.destination);
        allSegments.push(...segs);
      });
      return allSegments;
    } else {
      const targetDay = itinerary.days.find((d) => d.dayNumber === selectedDayNumber);
      return targetDay ? calculateDayRouteSegments(targetDay, itinerary.destination) : [];
    }
  }, [itinerary, selectedDayNumber]);

  const tripStats: TripMapStats = useMemo(() => {
    if (!itinerary) {
      return {
        totalPlaces: 0,
        totalDays: 0,
        totalDistanceKm: 0,
        totalTravelMinutes: 0,
        totalCost: 0,
        conflictsCount: 0,
        healthScore: 100,
        healthStatus: 'Excellent',
        healthMessage: 'Start adding places to build your journey.',
      };
    }
    return calculateTripMapStats(itinerary);
  }, [itinerary]);

  const totalActivitiesCount = useMemo(() => {
    if (!itinerary) return 0;
    return itinerary.days.reduce((sum, d) => sum + d.activities.length, 0);
  }, [itinerary]);

  // 3. User Geolocation Handler
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      showToast('Location access is unavailable on this browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
        setIsLocating(false);
        showToast('Located your position on the map 📍');
      },
      (error) => {
        setIsLocating(false);
        showToast('Location access was denied or timed out.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // 4. Activity CRUD Handlers
  const handleAddActivity = (newAct: ItineraryActivity, dayNumber: number) => {
    if (!itinerary) return;
    const updatedDays = itinerary.days.map((d) => {
      if (d.dayNumber === dayNumber) {
        return {
          ...d,
          activities: [...d.activities, { ...newAct, dayNumber, status: 'Scheduled' as const }],
        };
      }
      return d;
    });

    commitChange({ ...itinerary, days: updatedDays });
    showToast(`Added "${newAct.title}" to Day ${dayNumber} ✨`);
  };

  const handleEditActivitySave = (updated: Partial<ItineraryActivity>, dayNumber: number) => {
    if (!itinerary || !editingActivity) return;

    const updatedDays = itinerary.days.map((d) => {
      if (d.dayNumber === dayNumber) {
        return {
          ...d,
          activities: d.activities.map((a) =>
            a.id === editingActivity.act.id ? { ...a, ...updated } : a
          ),
        };
      }
      return d;
    });

    commitChange({ ...itinerary, days: updatedDays });
    showToast('Activity details updated ✓');
  };

  const handleMoveActivity = (targetDayNumber: number) => {
    if (!itinerary || !movingActivity) return;
    const { act, fromDayNumber } = movingActivity;
    if (fromDayNumber === targetDayNumber) return;

    const updatedDays = itinerary.days.map((d) => {
      if (d.dayNumber === fromDayNumber) {
        return {
          ...d,
          activities: d.activities.filter((a) => a.id !== act.id),
        };
      }
      if (d.dayNumber === targetDayNumber) {
        return {
          ...d,
          activities: [...d.activities, { ...act, dayNumber: targetDayNumber }],
        };
      }
      return d;
    });

    commitChange({ ...itinerary, days: updatedDays });
    showToast(`Moved "${act.title}" to Day ${targetDayNumber}`);
  };

  const handleDeleteActivity = () => {
    if (!itinerary || !deletingActivity) return;
    const { act, dayNumber } = deletingActivity;

    const updatedDays = itinerary.days.map((d) => {
      if (d.dayNumber === dayNumber) {
        return {
          ...d,
          activities: d.activities.filter((a) => a.id !== act.id),
        };
      }
      return d;
    });

    commitChange({ ...itinerary, days: updatedDays }, `Removed "${act.title}" from itinerary`);
  };

  // 5. AI Route Optimization Handlers
  const handleConfirmOptimize = async (): Promise<RouteOptimizationOutput | null> => {
    if (!itinerary) return null;
    return await routeOptimizationService.optimizeRoute(itinerary, selectedDayNumber);
  };

  const handleApplyOptimization = (output: RouteOptimizationOutput) => {
    commitChange(output.itinerary);
    showToast(`Route optimized: saved ~${output.travelMinutesSaved} min of travel ✨`);
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-[#FFF0ED] text-[#FF6B4A] flex items-center justify-center text-3xl mb-4 animate-bounce">
          🗺️
        </div>
        <h2 className="text-xl font-extrabold text-[#17201D]">
          Preparing your journey map...
        </h2>
        <p className="text-xs text-[#68736F] max-w-sm mt-1">
          Resolving geographical coordinates, calculating route polylines, and loading interactive tiles.
        </p>
      </div>
    );
  }

  // Not Found State
  if (!trip || !itinerary) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-[#FFE4DD] text-[#FF6B4A] flex items-center justify-center text-3xl mb-4">
          🧭
        </div>
        <h2 className="text-xl font-extrabold text-[#17201D]">Trip Not Found</h2>
        <p className="text-xs text-[#68736F] max-w-md mt-1 mb-6">
          We couldn't locate the requested journey map. It may have been archived or removed.
        </p>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2.5 rounded-full bg-[#17201D] text-white text-xs font-bold shadow-md hover:bg-[#FF6B4A] transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Empty Itinerary State
  if (totalActivitiesCount === 0) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex flex-col">
        <MapHeader
          trip={trip}
          onOpenOptimize={() => showToast('Add places to your trip before optimizing routes.')}
        />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-[#FFF0ED] text-[#FF6B4A] flex items-center justify-center text-4xl mb-4 shadow-sm border border-[#FFE4DD]">
            🗺️
          </div>
          <h2 className="text-2xl font-black text-[#17201D] tracking-tight">
            Your map is waiting.
          </h2>
          <p className="text-sm text-[#68736F] mt-2 leading-relaxed">
            Add places, dining, and scenic experiences to your itinerary and watch your entire journey come alive on the map.
          </p>
          <div className="flex items-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setAddPlaceDefaultDay(1);
                setIsAddPlaceOpen(true);
              }}
              className="px-5 py-2.5 rounded-full bg-[#FF6B4A] text-white text-xs font-black shadow-md hover:bg-[#E55837] transition-all"
            >
              + Add First Place
            </button>
            <button
              type="button"
              onClick={() => navigate(`/trip/${trip.id}/itinerary`)}
              className="px-5 py-2.5 rounded-full bg-white border border-[#EAE6DD] text-[#17201D] text-xs font-bold shadow-2xs hover:bg-[#F9F7F1] transition-all"
            >
              Build Itinerary →
            </button>
          </div>
        </div>

        {/* Add Place Drawer in Empty State */}
        <AddPlaceDrawer
          isOpen={isAddPlaceOpen}
          onClose={() => setIsAddPlaceOpen(false)}
          destination={trip.destination}
          days={itinerary.days}
          defaultDayNumber={1}
          onAddActivity={handleAddActivity}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF8]">
      {/* 1. Top Page Header */}
      <MapHeader
        trip={trip}
        onOpenOptimize={() => setIsOptimizeModalOpen(true)}
        isSaving={isSaving}
      />

      {/* 2. Day Filter Bar */}
      <DayFilter
        days={itinerary.days}
        selectedDayNumber={selectedDayNumber}
        onSelectDay={(day) => {
          setSelectedDayNumber(day);
          setActiveMarkerId(null);
        }}
        totalActivitiesCount={totalActivitiesCount}
      />

      {/* 3. Mobile View Mode Toggle (Map | Places) */}
      <div className="md:hidden flex items-center justify-center p-2 bg-white border-b border-[#EAE6DD]">
        <div className="inline-flex p-1 rounded-full bg-[#F4F1EA] border border-[#EAE6DD]">
          <button
            type="button"
            onClick={() => setMobileTab('map')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              mobileTab === 'map'
                ? 'bg-white text-[#17201D] shadow-xs'
                : 'text-[#68736F]'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Interactive Map</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('places')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              mobileTab === 'places'
                ? 'bg-white text-[#17201D] shadow-xs'
                : 'text-[#68736F]'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Places List ({currentMarkers.length})</span>
          </button>
        </div>
      </div>

      {/* 4. Main Two-Column Layout */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden" style={{ minHeight: 'calc(100vh - 120px)' }}>
        {/* Left Column (Desktop 38-40% / Mobile Places Tab) */}
        <div
          className={`w-full md:w-[38%] lg:w-[36%] xl:w-[34%] h-auto md:h-[calc(100vh-120px)] ${
            mobileTab === 'places' ? 'block' : 'hidden md:block'
          }`}
        >
          <JourneyList
            itinerary={itinerary}
            selectedDayNumber={selectedDayNumber}
            activeMarkerId={activeMarkerId}
            hoveredMarkerId={hoveredMarkerId}
            onSelectActivity={(act, dayNum) => {
              const markerId = `marker_${dayNum}_${act.id}`;
              setActiveMarkerId(markerId);
              if (window.innerWidth < 768) {
                setMobileTab('map');
              }
            }}
            onHoverActivity={(markerId) => setHoveredMarkerId(markerId)}
            onOpenAddPlace={(dayNum) => {
              setAddPlaceDefaultDay(dayNum || 1);
              setIsAddPlaceOpen(true);
            }}
            onEditActivity={(act, dayNum) => setEditingActivity({ act, dayNumber: dayNum })}
            onMoveActivity={(act, fromDayNum) =>
              setMovingActivity({ act, fromDayNumber: fromDayNum })
            }
            onDeleteActivity={(act, dayNum) =>
              setDeletingActivity({ act, dayNumber: dayNum })
            }
          />
        </div>

        {/* Right Column (Desktop 60-62% / Mobile Map Tab) */}
        <div
          className={`w-full md:flex-1 h-[550px] md:h-[calc(100vh-120px)] relative ${
            mobileTab === 'map' ? 'block' : 'hidden md:block'
          }`}
        >
          {/* Leaflet Interactive Map */}
          <TripMap
            markers={currentMarkers}
            segments={currentSegments}
            selectedDayNumber={selectedDayNumber}
            activeMarkerId={activeMarkerId}
            hoveredMarkerId={hoveredMarkerId}
            userLocation={userLocation}
            onMarkerClick={(marker) => {
              setActiveMarkerId(marker.id);
            }}
            onMarkerHover={(markerId) => setHoveredMarkerId(markerId)}
            onOpenDetails={(marker) => {
              setSelectedMarkerForDrawer(marker);
              setIsDrawerOpen(true);
            }}
          />

          {/* Floating Trip Summary Card (Top Left of Map) */}
          <div className="absolute top-4 left-4 z-20 max-w-xs sm:max-w-sm">
            <RouteSummaryCard
              stats={tripStats}
              selectedDayNumber={selectedDayNumber}
            />
          </div>

          {/* Floating Map Controls (Bottom Right of Map) */}
          <div className="absolute bottom-6 right-4 z-20 flex flex-col items-end gap-3">
            {/* Map Legend Popup */}
            <MapLegend
              isOpen={isLegendOpen}
              onClose={() => setIsLegendOpen(false)}
              days={itinerary.days}
            />

            <MapControls
              onZoomIn={() => {
                const mapEl = document.querySelector('.leaflet-container');
                if (mapEl) {
                  // Standard zoom in trigger
                  const zoomBtn = mapEl.querySelector('.leaflet-control-zoom-in') as HTMLAnchorElement;
                  if (zoomBtn) zoomBtn.click();
                }
              }}
              onZoomOut={() => {
                const mapEl = document.querySelector('.leaflet-container');
                if (mapEl) {
                  const zoomBtn = mapEl.querySelector('.leaflet-control-zoom-out') as HTMLAnchorElement;
                  if (zoomBtn) zoomBtn.click();
                }
              }}
              onRecenter={() => {
                // Re-trigger bounds fit
                setSelectedDayNumber((prev) => (prev === 'all' ? 1 : 'all'));
                setTimeout(() => setSelectedDayNumber(selectedDayNumber), 50);
                showToast('Recenetred map view 📍');
              }}
              onLocateMe={handleLocateMe}
              isLocating={isLocating}
              onToggleLegend={() => setIsLegendOpen(!isLegendOpen)}
              isLegendOpen={isLegendOpen}
            />
          </div>
        </div>
      </div>

      {/* 5. Location Details Drawer */}
      <LocationDetailsDrawer
        marker={selectedMarkerForDrawer}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedMarkerForDrawer(null);
        }}
        onEdit={(marker) => {
          const act = itinerary.days
            .find((d) => d.dayNumber === marker.dayNumber)
            ?.activities.find((a) => a.id === marker.activityId);
          if (act) {
            setEditingActivity({ act, dayNumber: marker.dayNumber });
          }
        }}
        onMove={(marker) => {
          const act = itinerary.days
            .find((d) => d.dayNumber === marker.dayNumber)
            ?.activities.find((a) => a.id === marker.activityId);
          if (act) {
            setMovingActivity({ act, fromDayNumber: marker.dayNumber });
          }
        }}
        onRemove={(marker) => {
          const act = itinerary.days
            .find((d) => d.dayNumber === marker.dayNumber)
            ?.activities.find((a) => a.id === marker.activityId);
          if (act) {
            setDeletingActivity({ act, dayNumber: marker.dayNumber });
          }
        }}
      />

      {/* 6. Add Place Drawer */}
      <AddPlaceDrawer
        isOpen={isAddPlaceOpen}
        onClose={() => setIsAddPlaceOpen(false)}
        destination={trip.destination}
        days={itinerary.days}
        defaultDayNumber={addPlaceDefaultDay}
        onAddActivity={handleAddActivity}
      />

      {/* 7. AI Route Optimization Modal */}
      <RouteOptimizationModal
        isOpen={isOptimizeModalOpen}
        onClose={() => setIsOptimizeModalOpen(false)}
        onConfirmOptimize={handleConfirmOptimize}
        onApplyResult={handleApplyOptimization}
      />

      {/* 8. Edit Activity Modal */}
      <EditActivityModal
        activity={editingActivity?.act || null}
        dayNumber={editingActivity?.dayNumber || 1}
        isOpen={!!editingActivity}
        onClose={() => setEditingActivity(null)}
        onSave={handleEditActivitySave}
      />

      {/* 9. Move Activity Modal */}
      <MoveActivityModal
        activity={movingActivity?.act || null}
        currentDayNumber={movingActivity?.fromDayNumber || 1}
        days={itinerary.days}
        isOpen={!!movingActivity}
        onClose={() => setMovingActivity(null)}
        onConfirmMove={handleMoveActivity}
      />

      {/* 10. Delete Activity Modal */}
      <DeleteConfirmationModal
        activity={deletingActivity?.act || null}
        dayNumber={deletingActivity?.dayNumber || 1}
        isOpen={!!deletingActivity}
        onClose={() => setDeletingActivity(null)}
        onConfirm={handleDeleteActivity}
      />

      {/* 11. Undo Toast Notification */}
      {undoToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#17201D] text-white text-xs font-bold shadow-2xl animate-in slide-in-from-bottom duration-300">
          <span>{undoToast.message}</span>
          <button
            type="button"
            onClick={handleUndo}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Undo</span>
          </button>
        </div>
      )}

      {/* 12. General Toast Notification */}
      {toastMessage && !undoToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#17201D]/90 text-white text-xs font-bold shadow-xl backdrop-blur-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#20B8A6]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
