import { CurrencyCode } from '../types/profile';

export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  symbol: string;
  flagEmoji: string;
  defaultBudget: number;
  minBudget: number;
  maxBudget: number;
  stepBudget: number;
  budgetPresets: { value: number; label: string }[];
}

export const CURRENCY_MAP: Record<CurrencyCode, CurrencyConfig> = {
  INR: {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    flagEmoji: '🇮🇳',
    defaultBudget: 50000,
    minBudget: 10000,
    maxBudget: 250000,
    stepBudget: 5000,
    budgetPresets: [
      { value: 10000, label: '₹10,000' },
      { value: 25000, label: '₹25,000' },
      { value: 50000, label: '₹50,000' },
      { value: 75000, label: '₹75,000' },
      { value: 100000, label: '₹1,00,000' },
      { value: 200000, label: '₹2,00,000+' },
    ],
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    flagEmoji: '🇺🇸',
    defaultBudget: 1500,
    minBudget: 300,
    maxBudget: 10000,
    stepBudget: 100,
    budgetPresets: [
      { value: 500, label: '$500' },
      { value: 1000, label: '$1,000' },
      { value: 1500, label: '$1,500' },
      { value: 2500, label: '$2,500' },
      { value: 5000, label: '$5,000' },
      { value: 8000, label: '$8,000+' },
    ],
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    flagEmoji: '🇪🇺',
    defaultBudget: 1400,
    minBudget: 300,
    maxBudget: 9000,
    stepBudget: 100,
    budgetPresets: [
      { value: 450, label: '€450' },
      { value: 900, label: '€900' },
      { value: 1400, label: '€1,400' },
      { value: 2300, label: '€2,300' },
      { value: 4500, label: '€4,500' },
      { value: 7500, label: '€7,500+' },
    ],
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    flagEmoji: '🇬🇧',
    defaultBudget: 1200,
    minBudget: 250,
    maxBudget: 8000,
    stepBudget: 100,
    budgetPresets: [
      { value: 400, label: '£400' },
      { value: 800, label: '£800' },
      { value: 1200, label: '£1,200' },
      { value: 2000, label: '£2,000' },
      { value: 4000, label: '£4,000' },
      { value: 6500, label: '£6,500+' },
    ],
  },
  AED: {
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'AED',
    flagEmoji: '🇦🇪',
    defaultBudget: 5500,
    minBudget: 1000,
    maxBudget: 35000,
    stepBudget: 500,
    budgetPresets: [
      { value: 1800, label: 'AED 1,800' },
      { value: 3600, label: 'AED 3,600' },
      { value: 5500, label: 'AED 5,500' },
      { value: 9000, label: 'AED 9,000' },
      { value: 18000, label: 'AED 18,000' },
      { value: 30000, label: 'AED 30,000+' },
    ],
  },
  JPY: {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    flagEmoji: '🇯🇵',
    defaultBudget: 200000,
    minBudget: 40000,
    maxBudget: 1500000,
    stepBudget: 10000,
    budgetPresets: [
      { value: 70000, label: '¥70,000' },
      { value: 140000, label: '¥140,000' },
      { value: 200000, label: '¥200,000' },
      { value: 350000, label: '¥350,000' },
      { value: 700000, label: '¥700,000' },
      { value: 1200000, label: '¥1,200,000+' },
    ],
  },
  AUD: {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    flagEmoji: '🇦🇺',
    defaultBudget: 2200,
    minBudget: 500,
    maxBudget: 15000,
    stepBudget: 100,
    budgetPresets: [
      { value: 750, label: 'A$750' },
      { value: 1500, label: 'A$1,500' },
      { value: 2200, label: 'A$2,200' },
      { value: 3800, label: 'A$3,800' },
      { value: 7500, label: 'A$7,500' },
      { value: 12000, label: 'A$12,000+' },
    ],
  },
  CAD: {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    flagEmoji: '🇨🇦',
    defaultBudget: 2000,
    minBudget: 400,
    maxBudget: 14000,
    stepBudget: 100,
    budgetPresets: [
      { value: 700, label: 'C$700' },
      { value: 1400, label: 'C$1,400' },
      { value: 2000, label: 'C$2,000' },
      { value: 3500, label: 'C$3,500' },
      { value: 7000, label: 'C$7,000' },
      { value: 11000, label: 'C$11,000+' },
    ],
  },
  SGD: {
    code: 'SGD',
    name: 'Singapore Dollar',
    symbol: 'S$',
    flagEmoji: '🇸🇬',
    defaultBudget: 2000,
    minBudget: 400,
    maxBudget: 14000,
    stepBudget: 100,
    budgetPresets: [
      { value: 700, label: 'S$700' },
      { value: 1400, label: 'S$1,400' },
      { value: 2000, label: 'S$2,000' },
      { value: 3500, label: 'S$3,500' },
      { value: 7000, label: 'S$7,000' },
      { value: 11000, label: 'S$11,000+' },
    ],
  },
};

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = Object.values(CURRENCY_MAP);
export const CURRENCIES = CURRENCY_MAP;

/**
 * Approximate exchange rates relative to 1 USD
 */
const USD_RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.67,
  JPY: 155.0,
  AUD: 1.52,
  CAD: 1.37,
  SGD: 1.35,
};

/**
 * Currency conversion utility
 */
export const convertCurrency = (
  amount: number,
  from: CurrencyCode = 'INR',
  to: CurrencyCode = 'INR'
): number => {
  if (from === to) return amount;
  const fromRate = USD_RATES[from] || 1;
  const toRate = USD_RATES[to] || 1;
  const inUSD = amount / fromRate;
  return inUSD * toRate;
};

/**
 * Formats a monetary amount into a clean localized currency string
 */
export const formatCurrency = (
  amount: number,
  currencyCode: CurrencyCode = 'INR'
): string => {
  const config = CURRENCY_MAP[currencyCode] || CURRENCY_MAP.INR;

  if (currencyCode === 'INR') {
    // Format according to Indian numbering system (e.g. ₹50,000, ₹1,00,000)
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
};
