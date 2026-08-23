import React from 'react';
import { Calculator, Edit2, PiggyBank, Wallet } from 'lucide-react';
import { Trip } from '../../types/trip';
import { BudgetSnapshot } from '../../types/budget';
import { formatCurrency } from '../../utils/currency';

interface BudgetOverviewCardProps {
  trip: Trip;
  snapshot: BudgetSnapshot;
  onOpenEditBudget: () => void;
}

export const BudgetOverviewCard: React.FC<BudgetOverviewCardProps> = ({
  trip,
  snapshot,
  onOpenEditBudget,
}) => {
  const currency = trip.currency || 'INR';
  const metrics = [
    {
      label: 'Total Budget',
      value: snapshot.totalBudget,
      detail: 'Set by you',
      icon: Wallet,
      color: '#17201D',
      background: '#FAF8F5',
    },
    {
      label: 'Estimated Itinerary Cost',
      value: snapshot.estimatedCost,
      detail: 'Activities and stays',
      icon: Calculator,
      color: '#2563EB',
      background: '#EFF6FF',
    },
    {
      label: 'Remaining Balance',
      value: snapshot.remaining,
      detail: snapshot.remaining >= 0 ? 'Available for your trip' : 'Over the set budget',
      icon: PiggyBank,
      color: snapshot.remaining >= 0 ? '#0D9488' : '#DC2626',
      background: snapshot.remaining >= 0 ? '#E8F8F5' : '#FEF2F2',
    },
  ];

  return (
    <section className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE6DD] shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-[#17201D] tracking-tight">
            Trip budget
          </h2>
          <p className="text-xs text-[#68736F] mt-0.5">
            {trip.destination} · Updated from your itinerary
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenEditBudget}
          className="inline-flex items-center gap-1.5 self-start px-3.5 py-2 rounded-full bg-[#FAF8F5] hover:bg-[#EAE6DD] text-[#17201D] text-xs font-bold border border-[#EAE6DD] transition-colors cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit budget</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="rounded-2xl p-4 sm:p-5 border border-[#EAE6DD]"
              style={{ backgroundColor: metric.background }}
            >
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#68736F]">
                  {metric.label}
                </span>
                <Icon className="w-4 h-4" style={{ color: metric.color }} />
              </div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: metric.color }}>
                {formatCurrency(metric.value, currency)}
              </div>
              <p className="text-[11px] text-[#68736F] mt-1">{metric.detail}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
