import React, { useState } from 'react';
import {
  Layers,
  PieChart as PieChartIcon,
  SlidersHorizontal,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Trip } from '../../types/trip';
import { CategorySummary, ExpenseCategory } from '../../types/budget';
import { formatCurrency } from '../../utils/currency';

interface CategoryBreakdownSectionProps {
  trip: Trip;
  categories: CategorySummary[];
  onOpenAllocation: () => void;
  onSelectCategory?: (category: ExpenseCategory) => void;
}

export const CategoryBreakdownSection: React.FC<CategoryBreakdownSectionProps> = ({
  trip,
  categories,
  onOpenAllocation,
  onSelectCategory,
}) => {
  const currency = trip.currency || 'INR';
  const [activeCategory, setActiveCategory] = useState<ExpenseCategory | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const visibleCategories = showAllCategories ? categories : categories.slice(0, 4);

  // Compute total spent across all categories
  const totalActual = categories.reduce((sum, c) => sum + c.actual, 0);

  // Calculate donut chart stroke dash arrays
  let cumulativeAngle = 0;
  const radius = 64;
  const circumference = 2 * Math.PI * radius;

  const donutSegments = categories.map((cat) => {
    const value = totalActual > 0 ? cat.actual : cat.budget;
    const total = totalActual > 0 ? totalActual : categories.reduce((s, c) => s + c.budget, 1);
    const fraction = Math.max(0.01, value / total);
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativeAngle * circumference;
    cumulativeAngle += fraction;

    return {
      category: cat.category,
      label: cat.label,
      color: cat.color,
      value,
      fraction,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE6DD] shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#F5F3FF] border border-[#DDD6FE] flex items-center justify-center text-[#8B5CF6] shadow-2xs">
            <PieChartIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#17201D] tracking-tight">
              Category Breakdown
            </h2>
            <p className="text-xs text-[#68736F]">
              Planned allocation vs actual spending across travel verticals
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAllocation}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FAF8F5] hover:bg-[#EAE6DD] text-[#17201D] text-xs font-bold border border-[#EAE6DD] transition-colors cursor-pointer self-start sm:self-auto"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#5E6B67]" />
          <span>Adjust Allocations</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left side: Light Donut Chart Visualization (4 cols) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DD]">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Background circle track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-[#EAE6DD]"
                strokeWidth="18"
                fill="transparent"
              />
              {/* Segments */}
              {donutSegments.map((seg) => (
                <circle
                  key={seg.category}
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke={seg.color}
                  strokeWidth={activeCategory === seg.category ? '22' : '18'}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setActiveCategory(seg.category)}
                  onMouseLeave={() => setActiveCategory(null)}
                />
              ))}
            </svg>

            {/* Inner Center Info */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[10px] font-bold text-[#8A9591] uppercase tracking-wider">
                {totalActual > 0 ? 'Total Spent' : 'Total Budget'}
              </span>
              <span className="text-lg font-black text-[#17201D] mt-0.5">
                {formatCurrency(totalActual > 0 ? totalActual : trip.budget || 50000, currency)}
              </span>
              <span className="text-[10px] text-[#68736F] font-bold mt-0.5">
                {categories.length} Categories
              </span>
            </div>
          </div>

          {/* Quick interactive category chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4">
            {visibleCategories.map((c) => (
              <button
                key={c.category}
                type="button"
                onMouseEnter={() => setActiveCategory(c.category)}
                onMouseLeave={() => setActiveCategory(null)}
                onClick={() => onSelectCategory?.(c.category)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                  activeCategory === c.category
                    ? 'bg-[#17201D] text-white shadow-2xs'
                    : 'bg-white text-[#17201D] border border-[#EAE6DD] hover:border-[#17201D]'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: c.color }}
                />
                <span>{c.label}</span>
              </button>
            ))}
          </div>
          {categories.length > 4 && (
            <button
              type="button"
              onClick={() => setShowAllCategories((current) => !current)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#EAE6DD] bg-white px-3 py-1.5 text-[11px] font-bold text-[#5E6B67] transition-colors hover:border-[#17201D] hover:text-[#17201D]"
            >
              <span>{showAllCategories ? 'Show less' : `View all ${categories.length} categories`}</span>
              {showAllCategories ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Right side: Detailed Category Breakdown Cards Grid (8 cols) */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {visibleCategories.map((cat) => {
            const isHovered = activeCategory === cat.category;
            const percentageSpent = cat.percentageSpent;
            const isOverBudget = cat.isOverBudget;

            return (
              <div
                key={cat.category}
                onMouseEnter={() => setActiveCategory(cat.category)}
                onMouseLeave={() => setActiveCategory(null)}
                className={`p-4 rounded-2xl border transition-all duration-200 ${
                  isHovered
                    ? 'bg-[#FFFDF8] border-[#17201D] shadow-xs scale-[1.01]'
                    : 'bg-[#FAF8F5] border-[#EAE6DD] hover:border-[#C4BEB1]'
                }`}
              >
                {/* Category Card Header */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl" role="img" aria-label={cat.label}>
                      {cat.icon}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-[#17201D] leading-tight">
                        {cat.label}
                      </h4>
                      <span className="text-[10px] font-bold text-[#8A9591]">
                        {cat.percentageOfBudget}% of budget
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                      isOverBudget
                        ? 'bg-[#FEE2E2] text-[#991B1B]'
                        : percentageSpent >= 80
                        ? 'bg-[#FEF3C7] text-[#92400E]'
                        : 'bg-[#D1FAE5] text-[#065F46]'
                    }`}
                  >
                    {percentageSpent}%
                  </span>
                </div>

                {/* 4 Financial Sub-metrics */}
                <div className="grid grid-cols-4 gap-1.5 text-center p-2 rounded-xl bg-white border border-[#EAE6DD] mb-2.5">
                  <div>
                    <div className="text-[9px] font-bold text-[#8A9591] uppercase">
                      Budget
                    </div>
                    <div className="text-[11px] font-extrabold text-[#17201D]">
                      {formatCurrency(cat.budget, currency)}
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] font-bold text-[#8A9591] uppercase">
                      Estimated
                    </div>
                    <div className="text-[11px] font-extrabold text-[#3B82F6]">
                      {formatCurrency(cat.estimated, currency)}
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] font-bold text-[#8A9591] uppercase">
                      Actual
                    </div>
                    <div className="text-[11px] font-extrabold text-[#FF6B4A]">
                      {formatCurrency(cat.actual, currency)}
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] font-bold text-[#8A9591] uppercase">
                      Remaining
                    </div>
                    <div
                      className={`text-[11px] font-extrabold ${
                        cat.remaining >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                      }`}
                    >
                      {formatCurrency(cat.remaining, currency)}
                    </div>
                  </div>
                </div>

                {/* Category Progress Bar */}
                <div className="w-full bg-[#EAE6DD] h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, percentageSpent)}%`,
                      backgroundColor: isOverBudget ? '#EF4444' : cat.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
