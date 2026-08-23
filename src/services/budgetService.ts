/**
 * GlobeTrotter Smart Budget Service
 * 
 * Central persistence and data calculations for trip expenses,
 * category breakdowns, allocations, and live financial synchronization with PostgreSQL.
 */

import { Trip } from '../types/trip';
import { Itinerary } from '../types/itinerary';
import {
  Expense,
  ExpenseCategory,
  BudgetAllocation,
  BudgetSnapshot,
  CategorySummary,
  DailySpendPoint,
} from '../types/budget';
import { authService } from './authService';
import { estimateTripCost } from '../utils/tripCostEstimator';
import {
  autoAllocateBudget,
  CATEGORY_METADATA,
  DEFAULT_ALLOCATIONS,
} from '../utils/budgetAllocator';
import { calculateBudgetHealth } from '../utils/budgetHealthCalculator';
import { apiRequest } from './apiClient';

const EXPENSES_STORAGE_KEY_PREFIX = 'globetrotter_expenses';
const ALLOCATIONS_STORAGE_KEY_PREFIX = 'globetrotter_budget_alloc';

const getExpensesStorageKey = (userId?: string): string => {
  const currentUser = authService.getCurrentUser();
  const id = userId || currentUser?.id || 'guest';
  return `${EXPENSES_STORAGE_KEY_PREFIX}_${id}`;
};

const getAllocationsStorageKey = (userId?: string): string => {
  const currentUser = authService.getCurrentUser();
  const id = userId || currentUser?.id || 'guest';
  return `${ALLOCATIONS_STORAGE_KEY_PREFIX}_${id}`;
};

export const budgetService = {
  /**
   * Fetch expenses from PostgreSQL
   */
  async fetchExpenses(tripId: string): Promise<Expense[]> {
    try {
      const serverExpenses = await apiRequest<any[]>(`/trips/${tripId}/expenses`);
      if (Array.isArray(serverExpenses)) {
        const mapped: Expense[] = serverExpenses.map((se) => ({
          id: se.id,
          tripId: se.tripId,
          name: se.title || se.name || 'Expense',
          category: (se.category?.toLowerCase() || 'other') as any,
          amount: Number(se.amount) || 0,
          currency: se.currency || 'INR',
          date: se.date,
          paymentMethod: se.paymentMethod || 'Credit Card',
          notes: se.notes || '',
          createdAt: se.createdAt ? new Date(se.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: se.updatedAt ? new Date(se.updatedAt).toISOString() : new Date().toISOString(),
        }));

        const all = this.getAllExpenses();
        all[tripId] = mapped;
        localStorage.setItem(getExpensesStorageKey(), JSON.stringify(all));
        return mapped;
      }
      return this.getExpenses(tripId);
    } catch {
      return this.getExpenses(tripId);
    }
  },

  getAllExpenses(userId?: string): Record<string, Expense[]> {
    try {
      const key = getExpensesStorageKey(userId);
      const raw = localStorage.getItem(key);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch {
      return {};
    }
  },

  getExpenses(tripId: string, userId?: string): Expense[] {
    const all = this.getAllExpenses(userId);
    return (all[tripId] || []).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },

  addExpense(
    expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>,
    userId?: string
  ): Expense {
    const currentUser = authService.getCurrentUser();
    const effectiveUserId = userId || currentUser?.id;
    const all = this.getAllExpenses(effectiveUserId);
    const tripExpenses = all[expenseData.tripId] || [];

    const expId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`;
    const newExpense: Expense = {
      ...expenseData,
      id: expId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    all[expenseData.tripId] = [newExpense, ...tripExpenses];

    try {
      const key = getExpensesStorageKey(effectiveUserId);
      localStorage.setItem(key, JSON.stringify(all));
    } catch {
      // storage fallback
    }

    // Async persist to PostgreSQL
    if (authService.isAuthenticated()) {
      apiRequest(`/trips/${expenseData.tripId}/expenses`, {
        method: 'POST',
        body: JSON.stringify({
          id: expId,
          title: expenseData.name,
          category: expenseData.category,
          amount: expenseData.amount,
          currency: expenseData.currency,
          date: expenseData.date,
          paymentMethod: expenseData.paymentMethod,
          notes: expenseData.notes,
        }),
      }).catch((err) => console.log('Expense persist sync:', err.message));
    }

    return newExpense;
  },

  updateExpense(
    expenseId: string,
    updates: Partial<Expense>,
    userId?: string
  ): Expense | null {
    const currentUser = authService.getCurrentUser();
    const effectiveUserId = userId || currentUser?.id;
    const all = this.getAllExpenses(effectiveUserId);

    let updatedExp: Expense | null = null;
    let foundTripId: string | null = null;

    for (const tripId in all) {
      const list = all[tripId];
      const index = list.findIndex((e) => e.id === expenseId);
      if (index !== -1) {
        foundTripId = tripId;
        updatedExp = {
          ...list[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        list[index] = updatedExp;
        break;
      }
    }

    if (updatedExp) {
      try {
        const key = getExpensesStorageKey(effectiveUserId);
        localStorage.setItem(key, JSON.stringify(all));
      } catch {
        // storage fallback
      }

      // Sync to PostgreSQL
      if (authService.isAuthenticated() && !expenseId.startsWith('exp_temp')) {
        apiRequest(`/expenses/${expenseId}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: updates.name,
            category: updates.category,
            amount: updates.amount,
            currency: updates.currency,
            date: updates.date,
            paymentMethod: updates.paymentMethod,
            notes: updates.notes,
          }),
        }).catch((err) => console.log('Expense update sync:', err.message));
      }
    }

    return updatedExp;
  },

  deleteExpense(expenseId: string, userId?: string): { success: boolean; deletedExpense: Expense | null } {
    const currentUser = authService.getCurrentUser();
    const effectiveUserId = userId || currentUser?.id;
    const all = this.getAllExpenses(effectiveUserId);

    let deletedExpense: Expense | null = null;
    let found = false;

    for (const tripId in all) {
      const list = all[tripId];
      const target = list.find((e) => e.id === expenseId);
      if (target) {
        deletedExpense = target;
        all[tripId] = list.filter((e) => e.id !== expenseId);
        found = true;
        break;
      }
    }

    if (found) {
      try {
        const key = getExpensesStorageKey(effectiveUserId);
        localStorage.setItem(key, JSON.stringify(all));
      } catch {
        // storage fallback
      }

      // Sync delete to PostgreSQL
      if (authService.isAuthenticated() && !expenseId.startsWith('exp_temp')) {
        apiRequest(`/expenses/${expenseId}`, {
          method: 'DELETE',
        }).catch((err) => console.log('Expense delete sync:', err.message));
      }
    }

    return { success: found, deletedExpense };
  },

  getBudgetAllocations(
    tripId: string,
    trip: Trip,
    userId?: string
  ): Record<ExpenseCategory, number> {
    try {
      const currentUser = authService.getCurrentUser();
      const effectiveUserId = userId || currentUser?.id;
      const key = getAllocationsStorageKey(effectiveUserId);
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed[tripId]) {
          return parsed[tripId];
        }
      }
    } catch {
      // fallback
    }

    const computed = autoAllocateBudget(trip);
    return computed;
  },

  saveBudgetAllocations(
    tripId: string,
    allocations: Record<ExpenseCategory, number>,
    userId?: string
  ): boolean {
    try {
      const currentUser = authService.getCurrentUser();
      const effectiveUserId = userId || currentUser?.id;
      const key = getAllocationsStorageKey(effectiveUserId);
      const raw = localStorage.getItem(key);
      const all = raw ? JSON.parse(raw) : {};

      all[tripId] = allocations;
      localStorage.setItem(key, JSON.stringify(all));

      // Persist to PostgreSQL
      if (authService.isAuthenticated()) {
        const allocArray = Object.entries(allocations).map(([category, percentage]) => ({
          category,
          percentage,
        }));

        apiRequest(`/trips/${tripId}/budget`, {
          method: 'PUT',
          body: JSON.stringify({ allocations: allocArray }),
        }).catch((err) => console.log('Budget allocation sync:', err.message));
      }

      return true;
    } catch {
      return false;
    }
  },

  getCategoryEstimates(
    trip: Trip,
    itinerary: Itinerary | null
  ): Record<ExpenseCategory, number> {
    const estimates: Record<ExpenseCategory, number> = {
      accommodation: 0,
      food: 0,
      transport: 0,
      activities: 0,
      shopping: 0,
      miscellaneous: 0,
    };

    let itinActivitiesCost = 0;
    let itinFoodCost = 0;
    let itinHotelCost = 0;

    if (itinerary) {
      const allActivities = [
        ...itinerary.days.flatMap((d) => d.activities),
        ...itinerary.unscheduledActivities,
      ];

      for (const act of allActivities) {
        const cost = act.estimatedCost || 0;
        if (act.category === 'food') {
          itinFoodCost += cost;
        } else if (act.category === 'hotel') {
          itinHotelCost += cost;
        } else {
          itinActivitiesCost += cost;
        }
      }
    }

    const baseBreakdown = estimateTripCost({
      destination: trip.destination,
      country: trip.country,
      durationDays: trip.durationDays || 3,
      travelersCount: trip.travelersCount || 1,
      budgetStyle: trip.budgetStyle,
      accommodationStyle: trip.accommodationStyle,
      transportPreferences: trip.transportPreferences,
      currency: trip.currency,
    });

    estimates.accommodation = itinHotelCost > 0 ? itinHotelCost : baseBreakdown.accommodationEstimate;
    estimates.food = itinFoodCost > 0 ? itinFoodCost : Math.round(baseBreakdown.activitiesFoodEstimate * 0.55);
    estimates.activities = itinActivitiesCost > 0 ? itinActivitiesCost : Math.round(baseBreakdown.activitiesFoodEstimate * 0.45);
    estimates.transport = baseBreakdown.transportEstimate;
    estimates.shopping = Math.round(trip.budget * 0.05);
    estimates.miscellaneous = Math.round(trip.budget * 0.05);

    return estimates;
  },

  getEstimatedCost(trip: Trip, itinerary: Itinerary | null): number {
    const estimates = this.getCategoryEstimates(trip, itinerary);
    return (Object.values(estimates) as number[]).reduce((a: number, b: number) => a + b, 0);
  },

  getCategoryActuals(expenses: Expense[]): Record<ExpenseCategory, number> {
    const actuals: Record<ExpenseCategory, number> = {
      accommodation: 0,
      food: 0,
      transport: 0,
      activities: 0,
      shopping: 0,
      miscellaneous: 0,
    };

    for (const exp of expenses) {
      if (actuals[exp.category] !== undefined) {
        actuals[exp.category] += exp.amount || 0;
      } else {
        actuals.miscellaneous += exp.amount || 0;
      }
    }

    return actuals;
  },

  getCategorySummaries(
    trip: Trip,
    itinerary: Itinerary | null,
    expenses: Expense[],
    allocations: Record<ExpenseCategory, number>
  ): CategorySummary[] {
    const totalBudget = trip.budget || 50000;
    const categoryEstimates = this.getCategoryEstimates(trip, itinerary);
    const categoryActuals = this.getCategoryActuals(expenses);

    const categories: ExpenseCategory[] = [
      'accommodation',
      'food',
      'transport',
      'activities',
      'shopping',
      'miscellaneous',
    ];

    return categories.map((cat) => {
      const meta = CATEGORY_METADATA[cat];
      const allocPct = allocations[cat] || DEFAULT_ALLOCATIONS[cat];
      const budgetAmount = Math.round((totalBudget * allocPct) / 100);
      const estimated = categoryEstimates[cat] || 0;
      const actual = categoryActuals[cat] || 0;
      const committed = Math.max(estimated, actual);
      const remaining = budgetAmount - committed;
      const percentageSpent = budgetAmount > 0 ? Math.round((committed / budgetAmount) * 100) : 0;

      return {
        category: cat,
        label: meta.label,
        icon: meta.icon,
        color: meta.color,
        budget: budgetAmount,
        estimated,
        actual,
        remaining,
        percentageOfBudget: allocPct,
        percentageSpent,
        isOverBudget: remaining < 0,
      };
    });
  },

  getDailySpendTimeline(trip: Trip, expenses: Expense[]): DailySpendPoint[] {
    if (expenses.length === 0) return [];

    const dateMap: Record<string, { total: number; count: number }> = {};
    expenses.forEach((e) => {
      if (!dateMap[e.date]) {
        dateMap[e.date] = { total: 0, count: 0 };
      }
      dateMap[e.date].total += e.amount;
      dateMap[e.date].count += 1;
    });

    const sortedDates = Object.keys(dateMap).sort();
    let cumulative = 0;

    return sortedDates.map((date, idx) => {
      cumulative += dateMap[date].total;
      let dateDisplay = date;
      try {
        const d = new Date(date);
        dateDisplay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } catch {
        // fallback
      }

      return {
        date,
        dateDisplay,
        dayNumber: idx + 1,
        amount: dateMap[date].total,
        cumulative,
        expensesCount: dateMap[date].count,
      };
    });
  },

  getBudgetSnapshot(
    trip: Trip,
    itinerary: Itinerary | null,
    expenses: Expense[],
    allocations: Record<ExpenseCategory, number>
  ): BudgetSnapshot {
    const totalBudget = trip.budget || 50000;
    const estimatedCost = this.getEstimatedCost(trip, itinerary);
    const actualSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const committedCost = Math.max(estimatedCost, actualSpent);
    const remaining = totalBudget - committedCost;
    const percentageSpent = totalBudget > 0 ? Math.round((committedCost / totalBudget) * 100) : 0;

    const projectedCost = committedCost;
    const projectedBuffer = totalBudget - projectedCost;

    const categoryActuals = this.getCategoryActuals(expenses);
    const health = calculateBudgetHealth({
      budget: totalBudget,
      estimatedCost,
      actualSpent,
      daysCount: trip.durationDays || 3,
      expenses,
      allocations,
      categoryActuals,
    });

    return {
      tripId: trip.id,
      totalBudget,
      estimatedCost,
      actualSpent,
      remaining,
      projectedCost,
      projectedBuffer,
      percentageSpent,
      healthScore: health.score,
      currency: trip.currency || 'INR',
    };
  },
};
