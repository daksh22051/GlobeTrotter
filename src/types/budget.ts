/**
 * GlobeTrotter Budget Tracker Data Models
 */

import { CurrencyCode } from './profile';

export type ExpenseCategory =
  | 'accommodation'
  | 'food'
  | 'transport'
  | 'activities'
  | 'shopping'
  | 'miscellaneous';

export type PaymentMethod =
  | 'cash'
  | 'card'
  | 'upi'
  | 'bank_transfer'
  | 'other';

export interface Expense {
  id: string;
  tripId: string;
  name: string;
  amount: number;
  currency: CurrencyCode;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetAllocation {
  category: ExpenseCategory;
  percentage: number; // e.g. 35 for 35%
  amount: number; // Total trip budget * percentage / 100
}

export interface CategorySummary {
  category: ExpenseCategory;
  label: string;
  icon: string; // Emoji
  color: string; // Hex / Tailwind class
  budget: number;
  estimated: number;
  actual: number;
  remaining: number;
  percentageOfBudget: number;
  percentageSpent: number;
  isOverBudget: boolean;
}

export interface BudgetSnapshot {
  tripId: string;
  totalBudget: number;
  estimatedCost: number;
  actualSpent: number;
  remaining: number;
  projectedCost: number;
  projectedBuffer: number;
  percentageSpent: number;
  healthScore: number;
  currency: CurrencyCode;
}

export type OptimizationSuggestionType =
  | 'hotel_downgrade'
  | 'transport_alternative'
  | 'meal_adjustment'
  | 'activity_free_tier'
  | 'category_rebalance';

export interface BudgetOptimizationSuggestion {
  id: string;
  type: OptimizationSuggestionType;
  title: string;
  description: string;
  category: ExpenseCategory;
  currentChoice: string;
  suggestedAlternative: string;
  currentCost: number;
  suggestedCost: number;
  potentialSavings: number;
  reason: string;
  status: 'pending' | 'applied' | 'ignored';
  targetActivityId?: string;
}

export interface BudgetOptimizationResult {
  suggestions: BudgetOptimizationSuggestion[];
  totalPotentialSavings: number;
  projectedTripCost: number;
  budgetHealthScore: number;
  explanation: string;
}

export type BudgetInsightType = 'positive' | 'warning' | 'info' | 'tip';

export interface BudgetInsight {
  id: string;
  type: BudgetInsightType;
  title: string;
  message: string;
  category?: ExpenseCategory;
  metric?: string;
}

export interface BudgetHealth {
  score: number; // 0 - 100
  status: 'Excellent' | 'Healthy' | 'Watch spending' | 'Needs attention';
  label: string;
  color: string;
  badgeBg: string;
  textColor: string;
  description: string;
}

export interface DailySpendPoint {
  date: string;
  dateDisplay: string;
  dayNumber?: number;
  amount: number;
  cumulative: number;
  expensesCount: number;
}
