import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  Layers,
  MapPin,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Trip } from '../types/trip';
import {
  Itinerary,
  ItineraryDay,
  ItineraryActivity,
  DayHealthResult,
  OptimizationResult,
} from '../types/itinerary';
import { Recommendation, RecommendationCategory } from '../types/recommendation';
import { tripService } from '../services/tripService';
import { itineraryService, recommendationToActivity } from '../services/itineraryService';
import { calculateDayHealth } from '../utils/dayHealthCalculator';
import { detectDayConflicts } from '../utils/itineraryConflictDetector';
import { itineraryAIService } from '../services/itineraryAIService';
import { mockRecommendations } from '../data/mockRecommendations';

// Subcomponents
import { TripCalendarHeader } from '../components/trip-calendar/TripCalendarHeader';
import { TripSummaryBar } from '../components/trip-calendar/TripSummaryBar';
import {
  TimelineFilters,
  TimelineFilterCategory,
} from '../components/trip-calendar/TimelineFilters';
import { TripTimeline } from '../components/trip-calendar/TripTimeline';
import { TripMonthCalendar } from '../components/trip-calendar/TripMonthCalendar';
import { DayDetailsPanel } from '../components/trip-calendar/DayDetailsPanel';
import { ScheduleEditorModal } from '../components/trip-calendar/ScheduleEditorModal';
import { ExportTripModal } from '../components/trip-calendar/ExportTripModal';
import { ShareTripModal } from '../components/trip-calendar/ShareTripModal';

// Shared Itinerary Modals from Feature 8
import { ActivityEditorModal } from '../components/itinerary/ActivityEditorModal';
import { MoveActivityModal } from '../components/itinerary/MoveActivityModal';
import { DeleteConfirmationModal } from '../components/itinerary/DeleteConfirmationModal';
import { RecommendationDrawer } from '../components/itinerary/RecommendationDrawer';
import { AIOptimizeModal } from '../components/itinerary/AIOptimizeModal';

export const TripCalendarPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  // Core Data State
  const [trip, setTrip] = useState<Trip | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  // Undo History Stack
  const [history, setHistory] = useState<Itinerary[]>([]);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    undoable?: boolean;
  } | null>(null);

  // View Mode & Navigation
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<TimelineFilterCategory>('all');

  // Modals State
  const [scheduleModalActivity, setScheduleModalActivity] = useState<ItineraryActivity | null>(null);
  const [editorModalActivity, setEditorModalActivity] = useState<Partial<ItineraryActivity> | null>(null);
  const [moveModalActivity, setMoveModalActivity] = useState<ItineraryActivity | null>(null);
  const [deleteModalActivity, setDeleteModalActivity] = useState<ItineraryActivity | null>(null);

  // Recommendation Drawer
  const [isRecommendationDrawerOpen, setIsRecommendationDrawerOpen] = useState(false);
  const [drawerTargetDay, setDrawerTargetDay] = useState<number>(1);
  const [drawerCategory, setDrawerCategory] = useState<RecommendationCategory | 'all'>('all');

  // AI Optimizer Modal
  const [isOptimizeModalOpen, setIsOptimizeModalOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeStepIndex, setOptimizeStepIndex] = useState(0);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);

  // Export & Share Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // 1. Initial Load
  useEffect(() => {
    if (!tripId) return;

    setIsLoading(true);
    const foundTrip = tripService.getTripById(tripId);

    if (!foundTrip) {
      setIsLoading(false);
      return;
    }

    setTrip(foundTrip);
    const loadedItinerary = itineraryService.getItinerary(tripId, foundTrip);
    setItinerary(loadedItinerary);
    setIsLoading(false);
  }, [tripId]);

  // Push to history before mutating
  const pushHistory = (current: Itinerary) => {
    setHistory((prev) => [...prev.slice(-10), JSON.parse(JSON.stringify(current))]);
  };

  const triggerToast = (text: string, undoable = false) => {
    setToastMessage({ text, undoable });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  // Undo Handler
  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setItinerary(previous);
    itineraryService.saveItinerary(previous);
    triggerToast('Change undone', false);
  };

  // Save changes to single source of truth
  const commitItineraryChanges = useCallback(
    (updated: Itinerary, message?: string) => {
      if (!itinerary) return;
      pushHistory(itinerary);
      setIsSaving(true);
      setItinerary(updated);
      itineraryService.saveItinerary(updated);
      setTimeout(() => {
        setIsSaving(false);
        setLastSavedAt(new Date().toLocaleTimeString());
        if (message) {
          triggerToast(message, true);
        }
      }, 200);
    },
    [itinerary]
  );

  // 2. Day Health Calculation per Day
  const dayHealths = useMemo(() => {
    if (!itinerary || !trip) return {};
    const map: Record<number, DayHealthResult> = {};

    itinerary.days.forEach((d) => {
      map[d.dayNumber] = calculateDayHealth(d);
    });
    return map;
  }, [itinerary, trip]);

  // Calculate total conflict count
  const totalConflictCount = useMemo(() => {
    if (!itinerary) return 0;
    return itinerary.days.reduce((sum, d) => {
      return sum + detectDayConflicts(d).length;
    }, 0);
  }, [itinerary]);

  // Added activity recommendation IDs
  const addedActivityRecommendationIds = useMemo(() => {
    if (!itinerary) return [];
    const ids: string[] = [];
    itinerary.days.forEach((d) => {
      d.activities.forEach((a) => {
        if (a.recommendationId) ids.push(a.recommendationId);
      });
    });
    return ids;
  }, [itinerary]);

  // Handler: Add Activity / Open Drawer
  const handleOpenAddActivity = (dayNumber: number, suggestedStartTime?: string) => {
    setDrawerTargetDay(dayNumber);
    setDrawerCategory('all');
    setIsRecommendationDrawerOpen(true);
  };

  const handleFindFood = (dayNumber: number, mealType: 'breakfast' | 'lunch' | 'dinner') => {
    setDrawerTargetDay(dayNumber);
    setDrawerCategory('food');
    setIsRecommendationDrawerOpen(true);
  };

  // Handler: Add from Drawer
  const handleAddRecommendation = (rec: Recommendation, dayNumber: number) => {
    if (!tripId || !itinerary) return;
    const act = recommendationToActivity(rec, dayNumber);
    const updated = itineraryService.addActivity(itinerary, act, dayNumber);
    commitItineraryChanges(updated, `Added "${rec.name}" to Day ${dayNumber}`);
  };

  // Handler: Save Schedule Modal changes
  const handleSaveSchedule = (
    activityId: string,
    updates: {
      dayNumber: number;
      startTime: string;
      durationMinutes: number;
      duration: string;
    }
  ) => {
    if (!tripId || !itinerary) return;
    const updated = itineraryService.updateActivity(
      itinerary,
      activityId,
      updates
    );
    setScheduleModalActivity(null);
    commitItineraryChanges(updated, 'Schedule updated');
  };

  // Handler: Save Full Activity Editor
  const handleSaveActivityEditor = (updatedActivity: Partial<ItineraryActivity>) => {
    if (!tripId || !itinerary || !updatedActivity.id) return;
    const updated = itineraryService.updateActivity(
      itinerary,
      updatedActivity.id,
      updatedActivity
    );
    setEditorModalActivity(null);
    commitItineraryChanges(updated, `Updated "${updatedActivity.title}"`);
  };

  // Handler: Move Activity across days
  const handleMoveActivity = (
    activityId: string,
    targetDayNumber: number | null,
    newStartTime?: string
  ) => {
    if (!tripId || !itinerary) return;
    const updated = itineraryService.moveActivity(
      itinerary,
      activityId,
      targetDayNumber,
      undefined,
      newStartTime
    );
    setMoveModalActivity(null);
    commitItineraryChanges(
      updated,
      targetDayNumber
        ? `Moved activity to Day ${targetDayNumber}`
        : 'Moved activity to unscheduled'
    );
  };

  // Handler: Move by Drag & Drop to a specific Date (in Calendar view)
  const handleMoveActivityToDate = (
    activityId: string,
    targetDateISO: string,
    targetDayNumber?: number
  ) => {
    if (!tripId || !itinerary) return;
    let dayNum = targetDayNumber;
    if (!dayNum) {
      const match = itinerary.days.find((d) => d.date === targetDateISO);
      dayNum = match?.dayNumber;
    }
    if (dayNum) {
      handleMoveActivity(activityId, dayNum);
    }
  };

  // Handler: Delete Activity
  const handleDeleteActivity = (activity: ItineraryActivity) => {
    setDeleteModalActivity(activity);
  };

  const handleConfirmDelete = () => {
    if (!tripId || !itinerary || !deleteModalActivity) return;
    const updated = itineraryService.removeActivity(
      itinerary,
      deleteModalActivity.id
    );
    const actTitle = deleteModalActivity.title;
    setDeleteModalActivity(null);
    commitItineraryChanges(updated, `Removed "${actTitle}"`);
  };

  // Handler: View on Map
  const handleViewOnMap = (activity?: ItineraryActivity) => {
    if (!trip) return;
    navigate(`/trip/${trip.id}/map`);
  };

  // Handler: AI Schedule Optimization
  const handleStartScheduleOptimization = async (dayNumber?: number) => {
    if (!trip || !itinerary) return;
    setIsOptimizeModalOpen(true);
    setIsOptimizing(true);
    setOptimizeStepIndex(0);
    setOptimizationResult(null);

    try {
      const result = await itineraryAIService.optimizeItinerary(
        itinerary,
        trip,
        (stepIndex) => {
          setOptimizeStepIndex(stepIndex);
        }
      );
      setOptimizationResult(result);
    } catch (err) {
      console.error('Optimization error:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApplyOptimization = () => {
    if (!optimizationResult || !tripId) return;
    commitItineraryChanges(
      optimizationResult.optimizedItinerary,
      'Trip schedule successfully optimized ✨'
    );
    setIsOptimizeModalOpen(false);
    setOptimizationResult(null);
  };

  // 404 / Loading States
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7EE] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#FF6B4A] text-white flex items-center justify-center mx-auto mb-3 animate-pulse shadow-md shadow-[#FF6B4A]/20">
            <Clock className="w-6 h-6 animate-spin-slow" />
          </div>
          <h2 className="text-base font-extrabold text-[#17201D]">Loading Trip Timeline...</h2>
          <p className="text-xs text-[#556960] mt-1">Connecting to your synchronized itinerary</p>
        </div>
      </div>
    );
  }

  if (!trip || !itinerary) {
    return (
      <div className="min-h-screen bg-[#FAF7EE] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#EAE6DD] text-center shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-[#FFEAE5] text-[#FF6B4A] flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-[#17201D]">Trip Not Found</h2>
          <p className="text-xs sm:text-sm text-[#556960] mt-1.5 mb-6">
            The trip you are looking for does not exist or has been removed.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#17201D] text-white text-xs font-bold hover:bg-[#2A3833] transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  const selectedDay =
    itinerary.days.find((d) => d.dayNumber === selectedDayNumber) || itinerary.days[0];
  const selectedDayHealth =
    dayHealths[selectedDay.dayNumber] || {
      dayNumber: selectedDay.dayNumber,
      score: 90,
      status: 'Balanced',
      totalActivities: 0,
      totalCost: 0,
      totalTravelMinutes: 0,
      freeTimeMinutes: 0,
      conflictCount: 0,
      reasons: [],
    };

  return (
    <div className="min-h-screen bg-[#FAF7EE] text-[#17201D] flex flex-col antialiased">
      {/* 1. Header with View Switcher, Optimize CTA & Actions */}
      <TripCalendarHeader
        trip={trip}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOptimizeClick={() => handleStartScheduleOptimization()}
        onExportClick={() => setIsExportModalOpen(true)}
        onShareClick={() => setIsShareModalOpen(true)}
        isSaving={isSaving}
        lastSavedAt={lastSavedAt}
        canUndo={history.length > 0}
        onUndo={handleUndo}
      />

      {/* 2. Trip Summary Bar & Density Strip */}
      <TripSummaryBar
        trip={trip}
        itinerary={itinerary}
        dayHealths={dayHealths}
        selectedDayNumber={selectedDayNumber}
        onSelectDay={(dayNum) => {
          setSelectedDayNumber(dayNum);
          if (viewMode === 'timeline') {
            const el = document.getElementById(`timeline-day-${dayNum}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        }}
        onOptimizeDay={handleStartScheduleOptimization}
      />

      {/* 3. Search & Category Filters Bar */}
      <TimelineFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        conflictCount={totalConflictCount}
        onClearFilters={() => {
          setSearchQuery('');
          setSelectedFilter('all');
        }}
      />

      {/* 4. Main Body Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewMode === 'timeline' ? (
          /* TIMELINE VIEW */
          <div className="max-w-4xl mx-auto">
            <TripTimeline
              itinerary={itinerary}
              dayHealths={dayHealths}
              currency={trip.currency || 'INR'}
              tripBudget={trip.budget || 50000}
              selectedDayNumber={selectedDayNumber}
              onSelectDay={setSelectedDayNumber}
              onEditActivity={(act) => setScheduleModalActivity(act)}
              onMoveActivity={(act) => setMoveModalActivity(act)}
              onDeleteActivity={handleDeleteActivity}
              onViewOnMap={handleViewOnMap}
              onAddActivity={handleOpenAddActivity}
              onFindFood={handleFindFood}
              onOptimizeDay={handleStartScheduleOptimization}
              onReorderOrMove={(actId, targetDay) => handleMoveActivity(actId, targetDay)}
              filterCategory={selectedFilter}
              searchQuery={searchQuery}
            />
          </div>
        ) : (
          /* CALENDAR VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TripMonthCalendar
                itinerary={itinerary}
                dayHealths={dayHealths}
                currency={trip.currency || 'INR'}
                selectedDayNumber={selectedDayNumber}
                onSelectDay={setSelectedDayNumber}
                onAddActivity={handleOpenAddActivity}
                onActivityClick={(act) => setScheduleModalActivity(act)}
                onMoveActivityDate={handleMoveActivityToDate}
              />
            </div>

            {/* Dedicated Right-Side Day Details Panel */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <DayDetailsPanel
                  day={selectedDay}
                  health={selectedDayHealth}
                  currency={trip.currency || 'INR'}
                  onAddActivity={handleOpenAddActivity}
                  onViewOnMap={() => handleViewOnMap()}
                  onEditActivity={(act) => setScheduleModalActivity(act)}
                  onMoveActivity={(act) => setMoveModalActivity(act)}
                  onDeleteActivity={handleDeleteActivity}
                  onOptimizeDay={handleStartScheduleOptimization}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 5. Modals & Drawers */}

      {/* Schedule Editor Modal (Quick timing adjustment) */}
      <ScheduleEditorModal
        isOpen={!!scheduleModalActivity}
        activity={scheduleModalActivity}
        days={itinerary.days}
        onClose={() => setScheduleModalActivity(null)}
        onSave={handleSaveSchedule}
      />

      {/* Full Activity Details Editor */}
      <ActivityEditorModal
        isOpen={!!editorModalActivity}
        activity={editorModalActivity}
        dayCount={itinerary.days.length}
        currency={trip.currency || 'INR'}
        onClose={() => setEditorModalActivity(null)}
        onSave={handleSaveActivityEditor}
      />

      {/* Move Activity Modal */}
      <MoveActivityModal
        isOpen={!!moveModalActivity}
        activity={moveModalActivity}
        days={itinerary.days}
        onClose={() => setMoveModalActivity(null)}
        onMove={handleMoveActivity}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteModalActivity}
        activityTitle={deleteModalActivity?.title || 'Activity'}
        onClose={() => setDeleteModalActivity(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Add Recommendation Drawer */}
      <RecommendationDrawer
        isOpen={isRecommendationDrawerOpen}
        onClose={() => setIsRecommendationDrawerOpen(false)}
        targetDayNumber={drawerTargetDay}
        savedRecommendations={[]}
        allRecommendations={mockRecommendations}
        addedActivityRecommendationIds={addedActivityRecommendationIds}
        onAddRecommendation={handleAddRecommendation}
        currency={trip.currency || 'INR'}
        initialFilter={drawerCategory}
      />

      {/* AI Schedule Optimizer Modal */}
      <AIOptimizeModal
        isOpen={isOptimizeModalOpen}
        isOptimizing={isOptimizing}
        currentStepIndex={optimizeStepIndex}
        result={optimizationResult}
        onClose={() => setIsOptimizeModalOpen(false)}
        onApply={handleApplyOptimization}
      />

      {/* Export & Share Modals */}
      <ExportTripModal
        isOpen={isExportModalOpen}
        trip={trip}
        onClose={() => setIsExportModalOpen(false)}
      />

      <ShareTripModal
        isOpen={isShareModalOpen}
        trip={trip}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className="px-4 py-3 rounded-2xl bg-[#17201D] text-white text-xs sm:text-sm font-semibold shadow-xl flex items-center gap-3 border border-[#303E39]">
            <CheckCircle2 className="w-4 h-4 text-[#20B8A6] shrink-0" />
            <span>{toastMessage.text}</span>
            {toastMessage.undoable && history.length > 0 && (
              <button
                type="button"
                onClick={handleUndo}
                className="px-2.5 py-1 rounded-lg bg-[#2A3833] hover:bg-[#394C45] text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Undo
              </button>
            )}
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-[#838F8B] hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
