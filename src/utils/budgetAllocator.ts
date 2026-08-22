/**
 * Smart Budget Allocator Utility
 * 
 * Computes intelligent category allocations based on trip preferences:
 * - Trip type (e.g. food_culture vs adventure vs wellness)
 * - Accommodation style (e.g. luxury_hotel vs hostel)
 * - Transport preferences (e.g. flights vs train vs walking)
 * - Budget style (e.g. budget_friendly vs comfort vs luxury)
 * - Travelers count and duration
 */

import { Trip } from '../types/trip';
import { ExpenseCategory } from '../types/budget';

export const DEFAULT_ALLOCATIONS: Record<ExpenseCategory, number> = {
  accommodation: 35,
  food: 25,
  transport: 15,
  activities: 15,
  shopping: 5,
  miscellaneous: 5,
};

export const CATEGORY_METADATA: Record<
  ExpenseCategory,
  { label: string; icon: string; color: string; bgLight: string; borderColor: string }
> = {
  accommodation: {
    label: 'Accommodation',
    icon: '🏨',
    color: '#3B82F6', // Blue
    bgLight: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  food: {
    label: 'Food & Dining',
    icon: '🍜',
    color: '#FF6B4A', // Coral
    bgLight: '#FFF2EE',
    borderColor: '#FFE0D6',
  },
  transport: {
    label: 'Transport',
    icon: '🚆',
    color: '#20B8A6', // Teal
    bgLight: '#E6FAF8',
    borderColor: '#B2F0E8',
  },
  activities: {
    label: 'Activities',
    icon: '🎟',
    color: '#8B5CF6', // Purple
    bgLight: '#F5F3FF',
    borderColor: '#DDD6FE',
  },
  shopping: {
    label: 'Shopping',
    icon: '🛍',
    color: '#F59E0B', // Amber
    bgLight: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  miscellaneous: {
    label: 'Miscellaneous',
    icon: '📱',
    color: '#64748B', // Slate
    bgLight: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
};

export function autoAllocateBudget(trip: Trip): Record<ExpenseCategory, number> {
  const allocation: Record<ExpenseCategory, number> = {
    accommodation: 35,
    food: 25,
    transport: 15,
    activities: 15,
    shopping: 5,
    miscellaneous: 5,
  };

  // 1. Adjust based on Accommodation style
  switch (trip.accommodationStyle) {
    case 'luxury_hotel':
    case 'resort':
      allocation.accommodation += 8;
      allocation.food -= 3;
      allocation.shopping -= 3;
      allocation.miscellaneous -= 2;
      break;
    case 'boutique_hotel':
      allocation.accommodation += 3;
      allocation.shopping -= 3;
      break;
    case 'budget_hotel':
    case 'apartment':
      allocation.accommodation -= 5;
      allocation.food += 3;
      allocation.activities += 2;
      break;
    case 'hostel':
      allocation.accommodation -= 12;
      allocation.food += 4;
      allocation.activities += 5;
      allocation.shopping += 3;
      break;
  }

  // 2. Adjust based on Trip Type / Focus
  switch (trip.tripType) {
    case 'food_culture':
      allocation.food += 8;
      allocation.activities += 2;
      allocation.accommodation -= 5;
      allocation.shopping -= 5;
      break;
    case 'adventure':
    case 'photography':
      allocation.activities += 8;
      allocation.transport += 2;
      allocation.accommodation -= 5;
      allocation.shopping -= 5;
      break;
    case 'leisure':
    case 'wellness':
    case 'romantic':
      allocation.accommodation += 5;
      allocation.food += 3;
      allocation.transport -= 4;
      allocation.shopping -= 4;
      break;
    case 'backpacking':
      allocation.accommodation -= 8;
      allocation.activities += 5;
      allocation.food += 3;
      break;
  }

  // 3. Adjust based on Transport Preferences
  if (trip.transportPreferences?.includes('flights')) {
    allocation.transport += 5;
    allocation.miscellaneous -= 5;
  } else if (trip.transportPreferences?.includes('walking')) {
    allocation.transport -= 4;
    allocation.activities += 4;
  }

  // 4. Adjust for Budget Style
  if (trip.budgetStyle === 'budget_friendly') {
    allocation.food += 3;
    allocation.shopping -= 3;
  } else if (trip.budgetStyle === 'luxury') {
    allocation.accommodation += 5;
    allocation.shopping += 3;
    allocation.miscellaneous -= 8;
  }

  // Normalize to guarantee strictly 100% total
  return normalizeAllocations(allocation);
}

/**
 * Normalizes allocation percentages so the sum is always exactly 100%
 */
export function normalizeAllocations(
  raw: Record<ExpenseCategory, number>
): Record<ExpenseCategory, number> {
  const categories: ExpenseCategory[] = [
    'accommodation',
    'food',
    'transport',
    'activities',
    'shopping',
    'miscellaneous',
  ];

  // Enforce minimum 2% per category to avoid 0% lock
  const clamped: Record<ExpenseCategory, number> = {} as any;
  let sum = 0;

  for (const cat of categories) {
    const val = Math.max(2, Math.round(raw[cat] || DEFAULT_ALLOCATIONS[cat]));
    clamped[cat] = val;
    sum += val;
  }

  // Distribute difference to food/accommodation
  const diff = 100 - sum;
  clamped.accommodation += diff;

  return clamped;
}
