import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  ArrowLeft,
  SlidersHorizontal,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Layers,
  MapPin,
} from 'lucide-react';
import { Trip } from '../types/trip';
import { Itinerary } from '../types/itinerary';
import {
  Expense,
  ExpenseCategory,
  BudgetSnapshot,
  CategorySummary,
  DailySpendPoint,
  BudgetHealth,
  BudgetInsight,
  PaymentMethod,
} from '../types/budget';
import { CurrencyCode } from '../types/profile';
import { tripService } from '../services/tripService';
import { itineraryService } from '../services/itineraryService';
import { budgetService } from '../services/budgetService';
import { calculateBudgetHealth } from '../utils/budgetHealthCalculator';
import { generateBudgetInsights } from '../utils/budgetInsights';
import { formatCurrency } from '../utils/currency';

// Component imports
import { BudgetHeader } from '../components/budget/BudgetHeader';
import { BudgetHeroCard } from '../components/budget/BudgetHeroCard';
import { EstimatedVsActualCard } from '../components/budget/EstimatedVsActualCard';
import { DailySpendingCard } from '../components/budget/DailySpendingCard';
import { CategoryBreakdownSection } from '../components/budget/CategoryBreakdownSection';
import { ExpenseListSection } from '../components/budget/ExpenseListSection';
import { SmartInsightsSection } from '../components/budget/SmartInsightsSection';
import { WhatIfMiniCard } from '../components/budget/WhatIfMiniCard';
import { AddEditExpenseModal } from '../components/budget/AddEditExpenseModal';
import { DeleteExpenseConfirmModal } from '../components/budget/DeleteExpenseConfirmModal';
import { BudgetAllocationModal } from '../components/budget/BudgetAllocationModal';
import { EditTripBudgetModal } from '../components/budget/EditTripBudgetModal';
import { LiveBudgetOptimizerModal } from '../components/budget/LiveBudgetOptimizerModal';

export const TripBudgetPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [allocations, setAllocations] = useState<Record<ExpenseCategory, number> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false);
  const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);

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

  const dailyTimeline: DailySpendPoint[] = budgetService.getDailySpendTimeline(
    trip,
    expenses
  );

  const categoryActuals = budgetService.getCategoryActuals(expenses);

  const health: BudgetHealth = calculateBudgetHealth({
    budget: trip.budget || 50000,
    estimatedCost: snapshot.estimatedCost,
    actualSpent: snapshot.actualSpent,
    daysCount: trip.durationDays || 3,
    expenses,
    allocations,
    categoryActuals,
  });

  const categoryEstimates = budgetService.getCategoryEstimates(trip, itinerary);

  const insights: BudgetInsight[] = generateBudgetInsights({
    trip,
    itinerary,
    expenses,
    allocations,
    categoryActuals,
    categoryEstimates,
    estimatedCost: snapshot.estimatedCost,
    actualSpent: snapshot.actualSpent,
    remainingBudget: snapshot.remaining,
  });

  // Expense Handlers
  const handleSaveExpense = async (data: {
    id?: string;
    tripId: string;
    name: string;
    amount: number;
    currency: CurrencyCode;
    category: ExpenseCategory;
    date: string;
    paymentMethod?: PaymentMethod;
    notes?: string;
  }) => {
    if (data.id) {
      budgetService.updateExpense(data.id, data);
      setToastMessage({ text: `Updated "${data.name}"`, type: 'success' });
    } else {
      budgetService.addExpense(data);
      setToastMessage({ text: `Logged "${data.name}"`, type: 'success' });
    }
    loadData();
  };

  const handleDeleteExpenseConfirm = () => {
    if (!deletingExpense) return;
    const deleted = deletingExpense;
    const { success } = budgetService.deleteExpense(deleted.id);
    setDeletingExpense(null);

    if (success) {
      loadData();
      setToastMessage({
        text: `Deleted "${deleted.name}"`,
        type: 'info',
        undoAction: () => {
          budgetService.addExpense({
            tripId: deleted.tripId,
            name: deleted.name,
            amount: deleted.amount,
            currency: deleted.currency,
            category: deleted.category,
            date: deleted.date,
            paymentMethod: deleted.paymentMethod,
            notes: deleted.notes,
          });
          loadData();
          setToastMessage({ text: `Restored "${deleted.name}"`, type: 'success' });
        },
      });
    }
  };

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

  const handleOptimizationsApplied = (message: string) => {
    loadData();
    setToastMessage({ text: message, type: 'success' });
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#17201D] flex flex-col pb-24 md:pb-16 font-sans">
      {/* Sticky Header */}
      <BudgetHeader
        trip={trip}
        onOpenAddExpense={() => {
          setEditingExpense(null);
          setIsAddExpenseOpen(true);
        }}
        onOpenOptimizer={() => setIsOptimizerOpen(true)}
        onOpenAllocation={() => setIsAllocationModalOpen(true)}
      />

      {/* Main Budget Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 flex-1 w-full">
        {/* 1. Hero Financial Overview Card */}
        <section aria-label="Financial Overview">
          <BudgetHeroCard
            trip={trip}
            snapshot={snapshot}
            health={health}
            onOpenEditBudget={() => setIsEditBudgetOpen(true)}
          />
        </section>

        {/* 2. Side-by-Side: Estimated vs Actual Variance & Daily Spending Pace */}
        <section
          aria-label="Spending Analysis and Forecast"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <EstimatedVsActualCard
            trip={trip}
            snapshot={snapshot}
            onOpenOptimizer={() => setIsOptimizerOpen(true)}
          />
          <DailySpendingCard
            trip={trip}
            expenses={expenses}
            dailyPoints={dailyTimeline}
            remainingBudget={snapshot.remaining}
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

        {/* 4. Smart Insights & What-If Sandbox */}
        <section
          aria-label="Smart Insights and Sandbox"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2">
            <SmartInsightsSection insights={insights} />
          </div>
          <div className="lg:col-span-1">
            <WhatIfMiniCard
              trip={trip}
              onOpenOptimizer={() => setIsOptimizerOpen(true)}
            />
          </div>
        </section>

        {/* 5. Recent Logged Expenses List */}
        <section aria-label="Expense Ledger">
          <ExpenseListSection
            trip={trip}
            expenses={expenses}
            onOpenAddExpense={() => {
              setEditingExpense(null);
              setIsAddExpenseOpen(true);
            }}
            onEditExpense={(expense) => {
              setEditingExpense(expense);
              setIsAddExpenseOpen(true);
            }}
            onDeleteExpense={(expense) => setDeletingExpense(expense)}
          />
        </section>
      </main>

      {/* Floating Action Bar for Mobile Viewports */}
      <div className="md:hidden fixed bottom-4 inset-x-4 z-30 flex items-center gap-2 p-2 bg-[#17201D]/90 backdrop-blur-md rounded-full shadow-xl border border-white/10">
        <button
          type="button"
          onClick={() => {
            setEditingExpense(null);
            setIsAddExpenseOpen(true);
          }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full bg-white text-[#17201D] text-xs font-black shadow-xs active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>

        <button
          type="button"
          onClick={() => setIsOptimizerOpen(true)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full bg-gradient-to-r from-[#FF6B4A] to-[#20B8A6] text-white text-xs font-black shadow-md shadow-[#FF6B4A]/30 active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FFF275]" />
          <span>Optimize ✨</span>
        </button>
      </div>

      {/* Modals */}
      <AddEditExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        trip={trip}
        initialExpense={editingExpense}
      />

      <DeleteExpenseConfirmModal
        isOpen={!!deletingExpense}
        onClose={() => setDeletingExpense(null)}
        onConfirm={handleDeleteExpenseConfirm}
        expense={deletingExpense}
        currency={trip.currency || 'INR'}
      />

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

      <LiveBudgetOptimizerModal
        isOpen={isOptimizerOpen}
        onClose={() => setIsOptimizerOpen(false)}
        trip={trip}
        itinerary={itinerary}
        expenses={expenses}
        allocations={allocations}
        onOptimizationsApplied={handleOptimizationsApplied}
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
    </div>
  );
};
