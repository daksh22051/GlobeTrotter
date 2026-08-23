/**
 * Budget Health Score Calculator
 * 
 * Computes a robust 0-100 financial health index for the trip, considering:
 * 1. Planned Budget vs Estimated Itinerary Cost ratio
 * 2. Actual Spending vs Projected Daily Burn Rate
 * 3. Category Allocation compliance (overages reduce score)
 * 4. Remaining financial buffer
 */

import { BudgetHealth, Expense, ExpenseCategory } from '../types/budget';

interface HealthCalcParams {
  budget: number;
  estimatedCost: number;
  actualSpent: number;
  daysCount: number;
  expenses: Expense[];
  allocations: Record<ExpenseCategory, number>;
  categoryActuals?: Record<ExpenseCategory, number>;
}

export function calculateBudgetHealth(params: HealthCalcParams): BudgetHealth {
  const {
    budget,
    estimatedCost,
    actualSpent,
    daysCount = 1,
    allocations,
    categoryActuals = {} as Record<ExpenseCategory, number>,
  } = params;

  if (budget <= 0) {
    return {
      score: 50,
      status: 'Watch spending',
      label: 'Watch spending',
      color: '#F59E0B',
      badgeBg: '#FEF3C7',
      textColor: '#92400E',
      description: 'Trip budget has not been set yet.',
    };
  }

  let score = 100;

  // Factor 1: Estimated cost vs Budget ratio (Weight: 35 points)
  const estRatio = estimatedCost / budget;
  if (estRatio > 1.2) {
    // Estimated is more than 20% over budget
    score -= 30;
  } else if (estRatio > 1.05) {
    // Estimated is 5-20% over budget
    score -= 18;
  } else if (estRatio > 0.95) {
    // Tight budget
    score -= 8;
  } else if (estRatio < 0.7) {
    // Very healthy buffer
    score += 0;
  }

  // Factor 2: Actual spending vs Budget ratio (Weight: 45 points)
  const actualRatio = actualSpent / budget;
  if (actualRatio > 1.1) {
    // Over budget already
    score -= 45;
  } else if (actualRatio > 0.9) {
    score -= 28;
  } else if (actualRatio > 0.75) {
    score -= 15;
  } else if (actualRatio > 0.5) {
    score -= 5;
  }

  // Factor 3: Category Allocation Overages (Weight: 20 points)
  const categories: ExpenseCategory[] = [
    'accommodation',
    'food',
    'transport',
    'activities',
    'shopping',
    'miscellaneous',
  ];

  let overageCount = 0;
  for (const cat of categories) {
    const allocatedBudget = (budget * (allocations[cat] || 0)) / 100;
    const spent = categoryActuals[cat] || 0;
    if (allocatedBudget > 0 && spent > allocatedBudget * 1.15) {
      overageCount++;
    }
  }

  if (overageCount > 0) {
    score -= Math.min(20, overageCount * 7);
  }

  // Ensure bounds
  const clampedScore = Math.max(15, Math.min(100, Math.round(score)));

  if (clampedScore >= 90) {
    return {
      score: clampedScore,
      status: 'Excellent',
      label: 'Excellent',
      color: '#10B981',
      badgeBg: '#D1FAE5',
      textColor: '#065F46',
      description: 'Your finances are exceptionally well-balanced with a generous buffer.',
    };
  }

  if (clampedScore >= 75) {
    return {
      score: clampedScore,
      status: 'Healthy',
      label: 'Healthy',
      color: '#20B8A6',
      badgeBg: '#CCFBF1',
      textColor: '#115E59',
      description: 'Spending is well aligned with your itinerary and allocated categories.',
    };
  }

  if (clampedScore >= 50) {
    return {
      score: clampedScore,
      status: 'Watch spending',
      label: 'Watch spending',
      color: '#F59E0B',
      badgeBg: '#FEF3C7',
      textColor: '#92400E',
      description: 'Approaching planned limits in key categories. Monitor recent additions.',
    };
  }

  return {
    score: clampedScore,
    status: 'Needs attention',
    label: 'Needs attention',
    color: '#EF4444',
    badgeBg: '#FEE2E2',
    textColor: '#991B1B',
    description: 'Current spend or itinerary estimates exceed your planned overall budget.',
  };
}
