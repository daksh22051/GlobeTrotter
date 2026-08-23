import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { Trip } from '../types/trip';
import { Itinerary } from '../types/itinerary';
import {
  Expense,
  ExpenseCategory,
  BudgetSnapshot,
  CategorySummary,
} from '../types/budget';
import { CurrencyCode } from '../types/profile';
import { tripService } from '../services/tripService';
import { itineraryService } from '../services/itineraryService';
import { budgetService } from '../services/budgetService';
import { budgetOptimizationService } from '../services/budgetOptimizationService';
import { formatCurrency } from '../utils/currency';

// Component imports
import { BudgetHeader } from '../components/budget/BudgetHeader';
import { BudgetOverviewCard } from '../components/budget/BudgetOverviewCard';
import { CategoryBreakdownSection } from '../components/budget/CategoryBreakdownSection';
import { BudgetAllocationModal } from '../components/budget/BudgetAllocationModal';
import { EditTripBudgetModal } from '../components/budget/EditTripBudgetModal';
import { MobileBottomNav } from '../components/dashboard/MobileBottomNav';

export const TripBudgetPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [allocations, setAllocations] = useState<Record<ExpenseCategory, number> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Toast / Undo notification state
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type?: 'success' | 'info' | 'warning';
    undoAction?: () => void;
  } | null>(null);

  // Load trip, itinerary, expenses, and allocations
  const loadData = useCallback(() => {
    if (!tripId) return;

    const currentTrip = tripService.getTripById(tripId);
    if (!currentTrip) {
      setIsLoading(false);
      return;
    }

    setTrip(currentTrip);

    const currentItinerary = itineraryService.getItinerary(tripId);
    setItinerary(currentItinerary);

    const currentExpenses = budgetService.getExpenses(tripId);
    setExpenses(currentExpenses);

    const currentAlloc = budgetService.getBudgetAllocations(tripId, currentTrip);
    setAllocations(currentAlloc);

    setIsLoading(false);

    // Background fetch from PostgreSQL
    budgetService.fetchExpenses(tripId).then((freshExpenses) => {
      setExpenses(freshExpenses);
    }).catch(() => {});
  }, [tripId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Toast timer
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF2EE] text-[#FF6B4A] flex items-center justify-center mx-auto mb-3 animate-spin">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-[#17201D]">
            Loading your trip budget...
          </p>
        </div>
      </div>
    );
  }

  if (!trip || !allocations) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center p-4">
        <div className="max-w-md text-center bg-white p-8 rounded-3xl border border-[#EAE6DD] shadow-sm">
          <AlertCircle className="w-10 h-10 text-[#EF4444] mx-auto mb-3" />
          <h2 className="text-lg font-black text-[#17201D] mb-2">Trip Not Found</h2>
          <p className="text-xs text-[#68736F] mb-6">
            The requested trip could not be located in your saved journeys.
          </p>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 rounded-full bg-[#17201D] text-white text-xs font-bold"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Derive calculated metrics
  const snapshot: BudgetSnapshot = budgetService.getBudgetSnapshot(
    trip,
    itinerary,
    expenses,
    allocations
  );

  const categorySummaries: CategorySummary[] = budgetService.getCategorySummaries(
    trip,
    itinerary,
    expenses,
    allocations
  );

  const handleSaveAllocations = (newAllocations: Record<ExpenseCategory, number>) => {
    budgetService.saveBudgetAllocations(trip.id, newAllocations);
    setAllocations(newAllocations);
    setToastMessage({ text: 'Category allocations updated', type: 'success' });
  };

  const handleSaveBudget = (newBudget: number, newCurrency: CurrencyCode) => {
    const updated = {
      ...trip,
      budget: newBudget,
      currency: newCurrency,
    };
    tripService.updateTrip(trip.id, updated);
    setTrip(updated);
    setToastMessage({
      text: `Budget updated to ${formatCurrency(newBudget, newCurrency)}`,
      type: 'success',
    });
  };

  const handleOptimizeBudget = async () => {
    if (!itinerary || isOptimizing) return;
    setIsOptimizing(true);
    try {
      const result = await budgetOptimizationService.optimizeBudget(
        trip,
        itinerary,
        expenses,
        allocations
      );
      let updatedTrip = trip;
      let updatedItinerary = itinerary;
      result.suggestions.forEach((suggestion) => {
        const applied = budgetOptimizationService.applyOptimization(
          updatedTrip,
          updatedItinerary,
          suggestion
        );
        updatedTrip = applied.updatedTrip;
        updatedItinerary = applied.updatedItinerary || updatedItinerary;
      });
      const balancedAllocations = {
        ...allocations,
        accommodation: 30,
        food: 25,
        transport: 20,
        activities: 20,
        shopping: 3,
        miscellaneous: 2,
      };
      budgetService.saveBudgetAllocations(trip.id, balancedAllocations);
      setTrip(updatedTrip);
      setItinerary(updatedItinerary);
      setAllocations(balancedAllocations);
      setToastMessage({ text: 'Budget categories balanced around your itinerary.', type: 'success' });
    } catch (error) {
      console.error('Budget optimization failed:', error);
      setToastMessage({ text: 'Budget optimization could not be completed.', type: 'warning' });
    } finally {
      setIsOptimizing(false);
    }
  };

  const hasItineraryActivities = Boolean(
    itinerary?.days.some((day) => day.activities.some((activity) => activity.status !== 'Unscheduled'))
  );

  if (!hasItineraryActivities) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center p-4">
        <div className="max-w-md text-center bg-white p-8 rounded-3xl border border-[#EAE6DD] shadow-sm">
          <AlertCircle className="w-10 h-10 text-[#FF6B4A] mx-auto mb-3" />
          <h2 className="text-lg font-black text-[#17201D] mb-2">Build your itinerary first</h2>
          <p className="text-xs text-[#68736F] mb-6">
            Choose a destination and add activities before viewing budget estimates.
          </p>
          <button
            type="button"
            onClick={() => navigate(`/trip/${trip.id}/itinerary`)}
            className="px-6 py-2.5 rounded-full bg-[#17201D] text-white text-xs font-bold"
          >
            Open Itinerary
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#17201D] flex flex-col pb-24 md:pb-16 font-sans">
      {/* Sticky Header */}
      <BudgetHeader
        trip={trip}
        onOpenOptimizer={handleOptimizeBudget}
        isOptimizing={isOptimizing}
        onOpenAllocation={() => setIsAllocationModalOpen(true)}
      />

      {/* Main Budget Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 flex-1 w-full">
        {/* 1. Hero Financial Overview Card */}
        <section aria-label="Financial Overview">
          <BudgetOverviewCard
            trip={trip}
            snapshot={snapshot}
            onOpenEditBudget={() => setIsEditBudgetOpen(true)}
          />
        </section>

        {/* 3. Category Breakdown & Interactive Allocation Donut */}
        <section aria-label="Category Breakdown">
          <CategoryBreakdownSection
            trip={trip}
            categories={categorySummaries}
            onOpenAllocation={() => setIsAllocationModalOpen(true)}
          />
        </section>

      </main>

      <BudgetAllocationModal
        isOpen={isAllocationModalOpen}
        onClose={() => setIsAllocationModalOpen(false)}
        trip={trip}
        currentAllocations={allocations}
        onSaveAllocations={handleSaveAllocations}
      />

      <EditTripBudgetModal
        isOpen={isEditBudgetOpen}
        onClose={() => setIsEditBudgetOpen(false)}
        trip={trip}
        onSaveBudget={handleSaveBudget}
      />

      {/* Floating Undo Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-3 px-4 py-3 bg-[#17201D] text-white rounded-2xl shadow-xl border border-white/10 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
            <span>{toastMessage.text}</span>
            {toastMessage.undoAction && (
              <button
                type="button"
                onClick={() => {
                  toastMessage.undoAction?.();
                  setToastMessage(null);
                }}
                className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-[#FFF275] text-[11px] font-extrabold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Undo</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};
