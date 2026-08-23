import React from 'react';
import { WhatIfSimulationResult } from '../../types/intelligence';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  HeartPulse,
  DollarSign,
  Calendar,
  Clock,
  Compass,
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { CurrencyCode } from '../../types/profile';

interface ScenarioComparisonProps {
  simulation: WhatIfSimulationResult;
}

export const ScenarioComparison: React.FC<ScenarioComparisonProps> = ({
  simulation,
}) => {
  const { originalTrip, simulatedTrip, originalHealth, simulatedHealth, healthImpact, budgetImpact } = simulation;
  const currency = (originalTrip.currency || 'INR') as CurrencyCode;

  const budgetDelta = simulatedTrip.budget - originalTrip.budget;
  const isBudgetSaving = budgetDelta < 0;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE6DD] shadow-2xs space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[#F4F1EA]">
        <div>
          <h3 className="text-sm font-extrabold text-[#17201D] uppercase tracking-wider">
            Live Impact Comparison
          </h3>
          <p className="text-xs text-[#838F8B]">Side-by-side metric comparison</p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-black border ${
              healthImpact >= 0
                ? 'bg-[#E8F8F5] text-[#1F8A70] border-[#A3E5D8]'
                : 'bg-[#FFF0F0] text-[#C72E33] border-[#FDB8B8]'
            }`}
          >
            {healthImpact >= 0 ? `+${healthImpact}` : healthImpact} Health Score Delta
          </span>
        </div>
      </div>

      {/* Side-by-Side Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Current Plan Card */}
        <div className="p-5 rounded-2xl bg-[#F9F7F1] border border-[#EAE6DD] space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#838F8B] uppercase tracking-wider">
              Current Plan
            </span>
            <span className="text-xs font-bold text-[#5E6B67] bg-white px-2.5 py-0.5 rounded-md border border-[#EAE6DD]">
              Active Baseline
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#5E6B67] flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-[#838F8B]" />
                Trip Health
              </span>
              <span className="text-sm font-extrabold text-[#17201D]">
                {originalHealth.score}/100 ({originalHealth.label})
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-[#5E6B67] flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#838F8B]" />
                Target Budget
              </span>
              <span className="text-sm font-extrabold text-[#17201D]">
                {formatCurrency(originalTrip.budget, currency)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-[#5E6B67] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#838F8B]" />
                Duration
              </span>
              <span className="text-sm font-extrabold text-[#17201D]">
                {originalTrip.durationDays || 5} Days
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-[#5E6B67] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#838F8B]" />
                Pace
              </span>
              <span className="text-sm font-extrabold text-[#17201D] capitalize">
                {originalTrip.travelPace || 'Balanced'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Simulated Scenario Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#EAF8F5]/80 to-[#F9F7F1] border border-[#20B8A6]/40 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#168376] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#20B8A6]" />
              Simulated Scenario
            </span>
            <span className="text-xs font-black text-[#1F8A70] bg-white px-2.5 py-0.5 rounded-md border border-[#A3E5D8]">
              {simulation.scenario.presetName}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#168376] font-medium flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-[#20B8A6]" />
                Simulated Health
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-[#17201D]">
                  {simulatedHealth.score}/100
                </span>
                <span
                  className={`text-[10px] font-black px-1.5 py-0.2 rounded-sm ${
                    healthImpact >= 0
                      ? 'bg-[#E8F8F5] text-[#1F8A70]'
                      : 'bg-[#FFF0F0] text-[#C72E33]'
                  }`}
                >
                  {healthImpact >= 0 ? `+${healthImpact}` : healthImpact}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-[#168376] font-medium flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#20B8A6]" />
                Simulated Budget
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-[#17201D]">
                  {formatCurrency(simulatedTrip.budget, currency)}
                </span>
                {budgetDelta !== 0 && (
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.2 rounded-sm ${
                      isBudgetSaving
                        ? 'bg-[#E8F8F5] text-[#1F8A70]'
                        : 'bg-[#FEF6E8] text-[#B86E00]'
                    }`}
                  >
                    {isBudgetSaving
                      ? `-${formatCurrency(Math.abs(budgetDelta), currency)}`
                      : `+${formatCurrency(budgetDelta, currency)}`}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-[#168376] font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#20B8A6]" />
                Duration
              </span>
              <span className="text-sm font-black text-[#17201D]">
                {simulatedTrip.durationDays} Days ({simulation.simulatedItinerary.days.length} Active Days)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-[#168376] font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#20B8A6]" />
                Pace
              </span>
              <span className="text-sm font-black text-[#17201D] capitalize">
                {simulatedTrip.travelPace} (~{simulation.paceImpact.freeTimeHoursPerDay}h free time)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Simulation Narrative */}
      <div className="p-4 rounded-2xl bg-[#F9F7F1] border border-[#EAE6DD] flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#20B8A6] shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-[#17201D] mb-1 uppercase tracking-wider">
            AI Trade-Off Analysis
          </h4>
          <p className="text-xs sm:text-sm text-[#4A5551] leading-relaxed">
            {simulation.aiExplanation}
          </p>
        </div>
      </div>
    </div>
  );
};
