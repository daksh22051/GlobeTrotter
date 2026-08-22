/**
 * Smart Spending Insights Utility
 * 
 * Generates deterministic, highly personalized, and actionable financial insights
 * from actual trip data, itinerary activity costs, allocations, and logged expenses.
 */

import { Trip } from '../types/trip';
import { Itinerary } from '../types/itinerary';
import { Expense, ExpenseCategory, BudgetInsight } from '../types/budget';
import { formatCurrency } from './currency';
import { CATEGORY_METADATA } from './budgetAllocator';

interface InsightParams {
  trip: Trip;
  itinerary: Itinerary | null;
  expenses: Expense[];
  allocations: Record<ExpenseCategory, number>;
  categoryActuals: Record<ExpenseCategory, number>;
  categoryEstimates: Record<ExpenseCategory, number>;
  estimatedCost: number;
  actualSpent: number;
  remainingBudget: number;
}

export function generateBudgetInsights(params: InsightParams): BudgetInsight[] {
  const {
    trip,
    expenses,
    allocations,
    categoryActuals,
    categoryEstimates,
    estimatedCost,
    actualSpent,
    remainingBudget,
  } = params;

  const insights: BudgetInsight[] = [];
  const currency = trip.currency || 'INR';
  const duration = Math.max(1, trip.durationDays || 3);
  const totalBudget = trip.budget || 50000;

  // 1. Overall Spend Status Insight
  if (expenses.length === 0) {
    insights.push({
      id: 'ins_starter',
      type: 'info',
      title: 'Planned Spending Readiness',
      message: `Your estimated trip cost (${formatCurrency(estimatedCost, currency)}) is ${
        estimatedCost <= totalBudget
          ? `${formatCurrency(totalBudget - estimatedCost, currency)} comfortably below your total budget.`
          : `${formatCurrency(estimatedCost - totalBudget, currency)} above your target budget.`
      }`,
      metric: `${Math.round((estimatedCost / totalBudget) * 100)}% estimated`,
    });
  } else {
    const spendPct = Math.round((actualSpent / totalBudget) * 100);
    if (spendPct > 100) {
      insights.push({
        id: 'ins_over_budget',
        type: 'warning',
        title: 'Budget Limit Exceeded',
        message: `You have spent ${formatCurrency(actualSpent, currency)}, which is ${formatCurrency(actualSpent - totalBudget, currency)} (${spendPct - 100}%) above your planned total budget.`,
        metric: `+${spendPct - 100}% over`,
      });
    } else if (spendPct >= 80) {
      insights.push({
        id: 'ins_near_limit',
        type: 'warning',
        title: 'Approaching Budget Ceiling',
        message: `You've utilized ${spendPct}% of your total funds. You have ${formatCurrency(remainingBudget, currency)} remaining for the rest of the journey.`,
        metric: `${100 - spendPct}% remaining`,
      });
    } else {
      insights.push({
        id: 'ins_healthy_spend',
        type: 'positive',
        title: 'Comfortably On Track',
        message: `Actual spending (${formatCurrency(actualSpent, currency)}) is well controlled at ${spendPct}% of your allocated ${formatCurrency(totalBudget, currency)}.`,
        metric: `${spendPct}% spent`,
      });
    }
  }

  // 2. Daily Allowance Insight
  const dailyAllowance = Math.round(remainingBudget / duration);
  const avgSpentPerDay = expenses.length > 0 ? Math.round(actualSpent / Math.min(duration, Math.max(1, new Set(expenses.map(e => e.date)).size))) : 0;

  if (remainingBudget > 0) {
    insights.push({
      id: 'ins_daily_allowance',
      type: 'info',
      title: 'Remaining Daily Allowance',
      message: `You have ${formatCurrency(remainingBudget, currency)} remaining across ${duration} days (~${formatCurrency(dailyAllowance, currency)}/day).`,
      metric: `${formatCurrency(dailyAllowance, currency)}/day`,
    });
  }

  // 3. Category Comparison & Variance Insights
  const categories: ExpenseCategory[] = [
    'accommodation',
    'food',
    'transport',
    'activities',
    'shopping',
    'miscellaneous',
  ];

  for (const cat of categories) {
    const actual = categoryActuals[cat] || 0;
    const estimated = categoryEstimates[cat] || 0;
    const allocated = (totalBudget * (allocations[cat] || 0)) / 100;
    const meta = CATEGORY_METADATA[cat];

    // Overage vs allocation
    if (allocated > 0 && actual > allocated) {
      const overPct = Math.round(((actual - allocated) / allocated) * 100);
      insights.push({
        id: `ins_alloc_over_${cat}`,
        type: 'warning',
        category: cat,
        title: `${meta.label} Exceeded Planned Share`,
        message: `${meta.label} has reached ${formatCurrency(actual, currency)}, exceeding its planned allocation of ${allocations[cat]}% (${formatCurrency(allocated, currency)}) by ${overPct}%.`,
        metric: `+${overPct}% over plan`,
      });
    }

    // Comparison against estimated cost (when both have substantial values)
    if (actual > 0 && estimated > 0) {
      if (actual < estimated * 0.85) {
        const savingPct = Math.round(((estimated - actual) / estimated) * 100);
        insights.push({
          id: `ins_frugal_${cat}`,
          type: 'positive',
          category: cat,
          title: `Smart Savings on ${meta.label}`,
          message: `${meta.label} spending is currently ${savingPct}% below your initial itinerary estimate (${formatCurrency(estimated, currency)}).`,
          metric: `-${savingPct}% variance`,
        });
      } else if (actual > estimated * 1.15) {
        const overEstPct = Math.round(((actual - estimated) / estimated) * 100);
        insights.push({
          id: `ins_over_est_${cat}`,
          type: 'warning',
          category: cat,
          title: `${meta.label} Running Above Estimate`,
          message: `You are spending ${overEstPct}% faster than the itinerary's scheduled cost for ${meta.label.toLowerCase()}.`,
          metric: `+${overEstPct}% over estimate`,
        });
      }
    }

    // Proportion check: e.g. Accommodation using > 40% of entire budget
    if (totalBudget > 0 && actual > totalBudget * 0.38 && cat === 'accommodation') {
      const propPct = Math.round((actual / totalBudget) * 100);
      insights.push({
        id: `ins_high_prop_${cat}`,
        type: 'tip',
        category: cat,
        title: 'Accommodation Heavy Ratio',
        message: `Accommodation is currently consuming ${propPct}% of your entire trip budget. Consider using the Live Optimizer for boutique alternatives.`,
        metric: `${propPct}% of total`,
      });
    }
  }

  // 4. Projected Finish Forecast
  const projectedTotal = actualSpent + Math.max(0, estimatedCost - actualSpent);
  const diffFromBudget = totalBudget - projectedTotal;

  if (diffFromBudget >= 0) {
    insights.push({
      id: 'ins_forecast_surplus',
      type: 'positive',
      title: 'Projected Trip Surplus',
      message: `At your current spending pace and scheduled stops, you're projected to finish approximately ${formatCurrency(diffFromBudget, currency)} under budget.`,
      metric: `+${formatCurrency(diffFromBudget, currency)} buffer`,
    });
  } else {
    insights.push({
      id: 'ins_forecast_deficit',
      type: 'warning',
      title: 'Projected Overage Risk',
      message: `Based on your remaining planned stops, you may finish approximately ${formatCurrency(Math.abs(diffFromBudget), currency)} over budget without adjustments.`,
      metric: `-${formatCurrency(Math.abs(diffFromBudget), currency)} risk`,
    });
  }

  return insights.slice(0, 5);
}
