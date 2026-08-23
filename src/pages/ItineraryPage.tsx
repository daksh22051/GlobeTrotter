import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Compass, ArrowLeft, Plus, Sparkles, CheckCircle2 } from 'lucide-react';
import { tripService } from '../services/tripService';
import { itineraryService, recommendationToActivity } from '../services/itineraryService';
import { itineraryAIService } from '../services/itineraryAIService';
import { Trip } from '../types/trip';
import {
  Itinerary,
  ItineraryActivity,
  OptimizationResult,
} from '../types/itinerary';
import { Recommendation, RecommendationCategory } from '../types/recommendation';
import { mockRecommendations } from '../data/mockRecommendations';
import { detectDayConflicts } from '../utils/itineraryConflictDetector';
import { calculateDayHealth, calculateItineraryStats, normalizeItinerarySchedule } from '../utils/dayHealthCalculator';
import { buildTripRecommendations } from '../utils/recommendationMatcher';

// Subcomponents
import { ItineraryHeader } from '../components/itinerary/ItineraryHeader';
import { TripOverviewBar } from '../components/itinerary/TripOverviewBar';
import { DaySelector } from '../components/itinerary/DaySelector';
import { DayTimeline } from '../components/itinerary/DayTimeline';
import { CalendarView } from '../components/itinerary/CalendarView';
import { TripSummarySidebar } from '../components/itinerary/TripSummarySidebar';
import { RecommendationDrawer } from '../components/itinerary/RecommendationDrawer';
import { CategoryRecommendationPanel } from '../components/itinerary/CategoryRecommendationPanel';
import { AIOptimizeModal } from '../components/itinerary/AIOptimizeModal';
import { ActivityEditorModal } from '../components/itinerary/ActivityEditorModal';
import { MoveActivityModal } from '../components/itinerary/MoveActivityModal';
import { DeleteConfirmationModal } from '../components/itinerary/DeleteConfirmationModal';
import { TravelAssistantFloatingLauncher } from '../components/ai-assistant/TravelAssistantFloatingLauncher';
import { TravelAssistantDrawer } from '../components/ai-assistant/TravelAssistantDrawer';
import { MobileBottomNav } from '../components/dashboard/MobileBottomNav';
import { MultiCityStopCards } from '../components/itinerary/MultiCityStopCards';

export const ItineraryPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  // Trip & Itinerary Core State
  const [trip, setTrip] = useState<Trip | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Undo History
  const [history, setHistory] = useState<Itinerary[]>([]);

  // Navigation & View State
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');
  const [workspaceTab, setWorkspaceTab] = useState<'timeline' | RecommendationCategory>('timeline');

  // Modal & Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerFilter, setDrawerFilter] = useState<RecommendationCategory | 'all'>('all');
  
  // AI Optimize Modal State
  const [isAIOptimizeOpen, setIsAIOptimizeOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeStepIndex, setOptimizeStepIndex] = useState(0);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);

  // AI Assistant Copilot Drawer State
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Activity Editor State
  const [editingActivity, setEditingActivity] = useState<Partial<ItineraryActivity> | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Move Modal State
  const [activityToMove, setActivityToMove] = useState<ItineraryActivity | null>(null);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

  // Delete Modal State
  const [activityToDelete, setActivityToDelete] = useState<ItineraryActivity | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Initial Data Loading
  useEffect(() => {
    if (!tripId) return;

    const loadedTrip = tripService.getTripById(tripId);
    if (loadedTrip) {
      setTrip(loadedTrip);
      const loadedItinerary = normalizeItinerarySchedule(itineraryService.getItinerary(tripId, loadedTrip));
      setItinerary(loadedItinerary);
      itineraryService.saveItinerary(loadedItinerary, loadedTrip.userId);
    }
    setIsLoading(false);

    // Background fetch from PostgreSQL
    tripService.fetchTripById(tripId).then((freshTrip) => {
      if (freshTrip) {
        const cachedTrip = tripService.getTripById(tripId);
        const tripWithCachedItems = {
          ...freshTrip,
          items: freshTrip.items || cachedTrip?.items || [],
        };
        setTrip(tripWithCachedItems);
        itineraryService.fetchItinerary(tripId).then((freshItin) => {
          if (freshItin) {
            const seededItinerary = itineraryService.seedTripItems(freshItin, tripWithCachedItems);
            const normalizedItinerary = normalizeItinerarySchedule(seededItinerary);
            setItinerary(normalizedItinerary);
            itineraryService.saveItinerary(normalizedItinerary, tripWithCachedItems.userId);
          }
        });
      }
    }).catch(() => {});
  }, [tripId]);

  // Helper to commit state changes with undo history tracking & autosave
  const commitItineraryChange = useCallback(
    (newItinerary: Itinerary, saveToDisk = true) => {
      if (itinerary) {
        setHistory((prev) => [...prev.slice(-10), itinerary]);
      }
      setItinerary(newItinerary);

      if (saveToDisk) {
        setIsSaving(true);
        itineraryService.saveItinerary(newItinerary, trip?.userId);
        itineraryService.batchSyncItinerary(newItinerary).catch((err) => {
          console.warn('Backend sync deferred:', err);
        });
        setTimeout(() => {
          setIsSaving(false);
        }, 300);
      }
    },
    [itinerary, trip?.userId]
  );

  // Undo Handler
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setItinerary(previous);
    itineraryService.saveItinerary(previous, trip?.userId);
    showToast('Reverted last change');
  }, [history, trip?.userId]);

  // Derived calculations
  const stats = useMemo(() => {
    if (!itinerary) {
      return {
        totalActivities: 0,
        scheduledActivities: 0,
        unscheduledActivities: 0,
        totalEstimatedCost: 0,
        tripBudget: trip?.budget || 50000,
        remainingBudget: trip?.budget || 50000,
        isOverBudget: false,
        overBudgetAmount: 0,
        totalTravelMinutes: 0,
        totalConflicts: 0,
        planningHealthScore: 0,
        dayHealths: {},
      };
    }
    return calculateItineraryStats(itinerary, trip?.budget || 50000);
  }, [itinerary, trip?.budget]);

  const currentDay = useMemo(() => {
    if (!itinerary?.days || itinerary.days.length === 0) return null;
    return (
      itinerary.days.find((d) => d.dayNumber === selectedDayNumber) ||
      itinerary.days[0]
    );
  }, [itinerary, selectedDayNumber]);

  const currentDayConflicts = useMemo(() => {
    if (!currentDay) return [];
    return detectDayConflicts(currentDay);
  }, [currentDay]);

  const currentDayHealth = useMemo(() => {
    return currentDay ? calculateDayHealth(currentDay) : null;
  }, [currentDay, selectedDayNumber]);

  // Recommendations for drawer
  const savedRecommendationsList = useMemo(() => {
    if (!trip?.items) return [];
    return trip.items as Recommendation[];
  }, [trip]);

  const allRecommendationsList = useMemo(() => {
    if (!trip) return mockRecommendations;
    const recs = buildTripRecommendations(trip);
    return recs.allRecommendations;
  }, [trip]);

  const addedRecIds = useMemo(() => {
    if (!itinerary) return [];
    const ids: string[] = [];
    (itinerary.days || []).forEach((d) => {
      d.activities.forEach((a) => {
        if (a.recommendationId) ids.push(a.recommendationId);
      });
    });
    (itinerary.unscheduledActivities || []).forEach((a) => {
      if (a.recommendationId) ids.push(a.recommendationId);
    });
    return ids;
  }, [itinerary]);

  const recommendationsByCategory = useMemo(() => {
    const categories = allRecommendationsList.reduce<Record<RecommendationCategory, Recommendation[]>>(
      (grouped, recommendation) => {
        grouped[recommendation.category].push(recommendation);
        return grouped;
      },
      { hotel: [], food: [], place: [], experience: [] }
    );
    return categories;
  }, [allRecommendationsList]);

  // ==========================================
  // HANDLERS
  // ==========================================

  // Auto-Fill Day with Recommendations
  const handleAutoFillDay = (dayNumber: number) => {
    if (!trip || !itinerary) return;
    const recs = buildTripRecommendations(trip);
    const pool = [...recs.places, ...recs.attractions, ...recs.food];
    if (pool.length === 0) return;

    const existingRecIds = new Set<string>();
    itinerary.days.forEach((d) => d.activities.forEach((a) => {
      if (a.recommendationId) existingRecIds.add(a.recommendationId);
    }));

    const available = pool.filter((r) => !existingRecIds.has(r.id));
    const toAdd = (available.length > 0 ? available : pool).slice(0, 3);
    const timeSlots = ['09:30', '13:30', '17:00'];

    let updated = itinerary;
    toAdd.forEach((rec, idx) => {
      const slot = timeSlots[idx % timeSlots.length];
      const act = recommendationToActivity(rec, dayNumber, slot);
      updated = itineraryService.addActivity(updated, act, dayNumber);
    });

    commitItineraryChange(updated);
    showToast(`✨ Auto-filled Day ${dayNumber} with ${toAdd.length} recommendations!`);
  };

  // Add Recommendation from Drawer
  const handleAddRecommendation = (rec: Recommendation, dayNumber: number) => {
    if (!itinerary) return;
    const newAct = recommendationToActivity(rec, dayNumber);
    const updated = itineraryService.addActivity(itinerary, newAct, dayNumber);
    commitItineraryChange(updated);
    showToast(`Added "${rec.name}" to Day ${dayNumber}`);
  };

  const handleRemoveRecommendation = (rec: Recommendation) => {
    if (!itinerary) return;
    const activity = itinerary.days
      .flatMap((day) => day.activities)
      .find((candidate) => candidate.recommendationId === rec.id);
    if (!activity) return;
    commitItineraryChange(itineraryService.removeActivity(itinerary, activity.id));
    showToast(`Removed "${rec.name}" from the itinerary`);
  };

  // Add / Save Custom Activity from Editor Modal
  const handleSaveActivityModal = (activityData: Partial<ItineraryActivity>) => {
    if (!itinerary) return;

    if (activityData.id) {
      // Update existing
      const updated = itineraryService.updateActivity(itinerary, activityData.id, activityData);
      commitItineraryChange(updated);
      showToast('Activity details updated');
    } else {
      // Create new
      const updated = itineraryService.addActivity(itinerary, activityData, activityData.dayNumber);
      commitItineraryChange(updated);
      showToast('Custom activity added');
    }
    setIsEditorOpen(false);
    setEditingActivity(null);
  };

  // Remove Activity
  const handleConfirmDelete = () => {
    if (!itinerary || !activityToDelete) return;
    const updated = itineraryService.removeActivity(itinerary, activityToDelete.id);
    commitItineraryChange(updated);
    showToast(`Removed "${activityToDelete.title}"`);
    setIsDeleteModalOpen(false);
    setActivityToDelete(null);
  };

  // Duplicate Activity
  const handleDuplicateActivity = (activityId: string) => {
    if (!itinerary) return;
    const updated = itineraryService.duplicateActivity(itinerary, activityId);
    commitItineraryChange(updated);
    showToast('Activity duplicated');
  };

  // Move Activity via Modal
  const handleMoveActivityModalConfirm = (
    activityId: string,
    targetDayNumber: number | null,
    newStartTime?: string
  ) => {
    if (!itinerary) return;
    const updated = itineraryService.moveActivity(
      itinerary,
      activityId,
      targetDayNumber,
      undefined,
      newStartTime
    );
    commitItineraryChange(updated);
    showToast(
      targetDayNumber
        ? `Moved activity to Day ${targetDayNumber}`
        : 'Moved activity to Unscheduled'
    );
    setIsMoveModalOpen(false);
    setActivityToMove(null);
  };

  // Reorder within day
  const handleReorder = (dayNumber: number, sourceIdx: number, destIdx: number) => {
    if (!itinerary) return;
    const updated = itineraryService.reorderActivities(itinerary, dayNumber, sourceIdx, destIdx);
    commitItineraryChange(updated);
  };

  // Drag across days or from unscheduled
  const handleMoveActivityAcrossDays = (
    activityId: string,
    targetDayNumber: number,
    insertIndex?: number
  ) => {
    if (!itinerary) return;
    const updated = itineraryService.moveActivity(
      itinerary,
      activityId,
      targetDayNumber,
      insertIndex
    );
    commitItineraryChange(updated);
    showToast(`Activity moved to Day ${targetDayNumber}`);
  };

  // Run AI Optimization
  const handleStartAIOptimize = async () => {
    if (!itinerary || !trip) return;
    setIsAIOptimizeOpen(true);
    setIsOptimizing(true);
    setOptimizeStepIndex(0);

    try {
      const result = await itineraryAIService.optimizeItinerary(
        itinerary,
        trip,
        (step) => setOptimizeStepIndex(step)
      );
      setOptimizationResult(result);
    } catch (err) {
      console.error(err);
      setIsAIOptimizeOpen(false);
      setOptimizationResult(null);
      showToast('Optimization could not be completed. Your current itinerary is unchanged.');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Apply AI Optimization
  const handleApplyOptimization = () => {
    if (!optimizationResult) return;
    commitItineraryChange(optimizationResult.itinerary);
    setIsAIOptimizeOpen(false);
    setOptimizationResult(null);
    showToast('✨ AI Optimized itinerary applied!');
  };

  // Loading or Not Found States
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF2EE] text-[#FF6B4A] flex items-center justify-center mx-auto mb-3 animate-pulse">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <p className="text-sm font-bold text-[#17201D]">Loading your itinerary...</p>
        </div>
      </div>
    );
  }

  if (!trip || !itinerary) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
        <div className="text-center max-w-sm bg-white p-8 rounded-3xl border border-[#EAE6DD] shadow-2xs">
          <Compass className="w-12 h-12 text-[#A0AAA6] mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[#17201D]">Trip Not Found</h2>
          <p className="text-xs text-[#68736F] mt-1 mb-5">
            We could not find the trip requested. It may have been deleted.
          </p>
          <button
            type="button"
            onClick={() => navigate('/trips')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF6B4A] text-white text-xs font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Trips</span>
          </button>
        </div>
      </div>
    );
  }

  const currency = trip.currency || '₹';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="min-h-screen bg-[#FFFDF8] text-[#17201D] flex flex-col font-sans selection:bg-[#FF6B4A]/20 pb-24 lg:pb-8"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#17201D] text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#20B8A6]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header */}
      <ItineraryHeader
        trip={trip}
        onSave={() => {
          const savedTrip = tripService.saveTrip(trip.id, trip.userId);
          if (savedTrip) setTrip(savedTrip);
          itineraryService.saveItinerary(itinerary, trip.userId);
          showToast(savedTrip ? 'Trip and itinerary saved successfully' : 'Itinerary saved successfully');
        }}
        onUndo={handleUndo}
        canUndo={history.length > 0}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* 2. Compact Trip Overview Bar */}
      <TripOverviewBar trip={trip} />

      <MultiCityStopCards
        days={itinerary.days}
        selectedDayNumber={selectedDayNumber}
        onSelectDay={(dayNumber) => {
          setSelectedDayNumber(dayNumber);
          setViewMode('timeline');
        }}
      />

      {/* 3. Day Selector Bar (Timeline Mode) */}
      {viewMode === 'timeline' && (
        <DaySelector
          days={itinerary.days}
          selectedDayNumber={selectedDayNumber}
          onSelectDay={setSelectedDayNumber}
          dayHealths={stats.dayHealths}
          onDropOnDay={(dayNum, actId) => handleMoveActivityAcrossDays(actId, dayNum)}
        />
      )}

      {/* 4. Main Body Content */}
      <main className="relative z-0 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 lg:pt-8 pb-6 sm:pb-8 overflow-x-hidden">
        <div className={`w-full grid grid-cols-1 gap-5 sm:gap-6 lg:gap-8 items-start ${
          viewMode === 'timeline' ? 'lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]' : ''
        }`}>
          {/* Main Left Column (Timeline / Calendar View) */}
          <div className="w-full min-w-0 overflow-x-hidden space-y-8">
            {viewMode === 'timeline' ? (
              currentDay && currentDayHealth && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 p-3 bg-white rounded-2xl border border-[#EAE6DD] shadow-2xs">
                    <span className="text-xs font-extrabold text-[#17201D] mr-1">Plan Day {currentDay.dayNumber}</span>
                    <button
                      type="button"
                      onClick={() => setWorkspaceTab('timeline')}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold transition-colors cursor-pointer ${workspaceTab === 'timeline' ? 'bg-[#17201D] text-white' : 'bg-[#F9F7F1] border border-[#EAE6DD] text-[#4E5955]'}`}
                    >
                      Daily Timeline
                    </button>
                    {[
                      { id: 'hotel', label: 'Hotels & Stays' },
                      { id: 'food', label: 'Food & Dining' },
                      { id: 'place', label: 'Sightseeing Attractions' },
                    ].map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => {
                          setDrawerFilter(category.id as RecommendationCategory);
                          setWorkspaceTab(category.id as RecommendationCategory);
                        }}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold transition-colors cursor-pointer ${workspaceTab === category.id ? 'bg-[#FF6B4A] text-white' : 'bg-[#F9F7F1] border border-[#EAE6DD] text-[#4E5955] hover:border-[#FF6B4A]/50 hover:text-[#17201D]'}`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>

                  {workspaceTab === 'timeline' ? (
                    <DayTimeline
                  day={currentDay}
                  conflicts={currentDayConflicts}
                  dayHealth={currentDayHealth}
                  currency={currency}
                  onAddActivityClick={() => {
                    setDrawerFilter('all');
                    setIsDrawerOpen(true);
                  }}
                  onFindFoodClick={() => {
                    setDrawerFilter('food');
                    setIsDrawerOpen(true);
                  }}
                  onEditActivity={(act) => {
                    setEditingActivity(act);
                    setIsEditorOpen(true);
                  }}
                  onDuplicateActivity={handleDuplicateActivity}
                  onRemoveActivity={(actId) => {
                    const found = currentDay.activities.find((a) => a.id === actId);
                    if (found) {
                      setActivityToDelete(found);
                      setIsDeleteModalOpen(true);
                    }
                  }}
                  onMoveToDay={(act) => {
                    setActivityToMove(act);
                    setIsMoveModalOpen(true);
                  }}
                  onReorder={handleReorder}
                  onMoveActivityAcrossDays={handleMoveActivityAcrossDays}
                  onAutoFillDay={() => handleAutoFillDay(currentDay.dayNumber)}
                  />
                  ) : (
                    <CategoryRecommendationPanel
                      category={workspaceTab}
                      recommendations={recommendationsByCategory[workspaceTab]}
                      addedRecommendationIds={addedRecIds}
                      currency={currency}
                      dayNumber={currentDay.dayNumber}
                      onAdd={handleAddRecommendation}
                      onRemove={handleRemoveRecommendation}
                    />
                  )}
                </div>
              )
            ) : (
              /* Calendar View */
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE6DD] shadow-2xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F4F1EA]">
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-[#17201D]">
                      Calendar Journey Overview
                    </h2>
                    <p className="text-xs text-[#838F8B]">
                      Multi-day planner with drag-and-drop between columns
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingActivity({ dayNumber: selectedDayNumber });
                      setIsEditorOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Activity</span>
                  </button>
                </div>

                <CalendarView
                  days={itinerary.days}
                  dayHealths={stats.dayHealths}
                  currency={currency}
                  onSelectDay={(dayNum) => {
                    setSelectedDayNumber(dayNum);
                    setViewMode('timeline');
                  }}
                  onEditActivity={(act) => {
                    setEditingActivity(act);
                    setIsEditorOpen(true);
                  }}
                  onAddActivity={(dayNum) => {
                    setSelectedDayNumber(dayNum);
                    setDrawerFilter('all');
                    setIsDrawerOpen(true);
                  }}
                  onMoveActivity={(actId, targetDay) =>
                    handleMoveActivityAcrossDays(actId, targetDay)
                  }
                />
              </div>
            )}

          </div>

          {/* Right Column: Live Summary Sidebar (Timeline only) */}
          {viewMode === 'timeline' && (
            <div className="w-full min-w-0 overflow-hidden lg:sticky lg:top-24">
              <TripSummarySidebar
                trip={trip}
                itinerary={itinerary}
                stats={stats}
                onOpenAIOptimize={handleStartAIOptimize}
              />
            </div>
          )}
        </div>
      </main>

      {/* Recommendation Drawer */}
      <RecommendationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        targetDayNumber={selectedDayNumber}
        savedRecommendations={savedRecommendationsList}
        allRecommendations={allRecommendationsList}
        addedActivityRecommendationIds={addedRecIds}
        onAddRecommendation={handleAddRecommendation}
        currency={currency}
        initialFilter={drawerFilter}
      />

      {/* AI Optimize Modal */}
      <AIOptimizeModal
        isOpen={isAIOptimizeOpen}
        isOptimizing={isOptimizing}
        currentStepIndex={optimizeStepIndex}
        result={optimizationResult}
        onClose={() => {
          setIsAIOptimizeOpen(false);
          setOptimizationResult(null);
        }}
        onApply={handleApplyOptimization}
      />

      {/* Activity Editor / Custom Activity Modal */}
      <ActivityEditorModal
        isOpen={isEditorOpen}
        activity={editingActivity}
        dayCount={itinerary.days.length}
        currency={currency}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingActivity(null);
        }}
        onSave={handleSaveActivityModal}
      />

      {/* Move Activity Modal */}
      <MoveActivityModal
        isOpen={isMoveModalOpen}
        activity={activityToMove}
        days={itinerary.days}
        onClose={() => {
          setIsMoveModalOpen(false);
          setActivityToMove(null);
        }}
        onMove={handleMoveActivityModalConfirm}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        activityTitle={activityToDelete?.title || 'Activity'}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setActivityToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      {/* Floating AI Assistant Copilot Launcher & Drawer */}
      <TravelAssistantFloatingLauncher
        onClick={() => setIsAssistantOpen(true)}
      />
      <TravelAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        trip={trip}
        onStateChange={() => {
          if (tripId && trip) {
            const reloaded = itineraryService.getItinerary(tripId, trip);
            setItinerary(reloaded);
          }
        }}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </motion.div>
  );
};
