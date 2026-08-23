import React from 'react';
import { TripHealthBreakdown, HealthComponentScore } from '../../types/intelligence';
import {
  Calendar,
  AlertOctagon,
  Navigation,
  Coffee,
  Wallet,
  Compass,
  CheckSquare,
} from 'lucide-react';

interface HealthBreakdownProps {
  health: TripHealthBreakdown;
}

export const HealthBreakdown: React.FC<HealthBreakdownProps> = ({ health }) => {
  const getIconForComponent = (key: string) => {
    switch (key) {
      case 'scheduleBalance':
        return <Calendar className="w-4 h-4 text-[#FF6B4A]" />;
      case 'conflictFree':
        return <AlertOctagon className="w-4 h-4 text-[#20B8A6]" />;
      case 'travelEfficiency':
        return <Navigation className="w-4 h-4 text-[#FFB020]" />;
      case 'freeTime':
        return <Coffee className="w-4 h-4 text-[#20B8A6]" />;
      case 'budgetHealth':
        return <Wallet className="w-4 h-4 text-[#1F8A70]" />;
      case 'activityDistribution':
        return <Compass className="w-4 h-4 text-[#FF6B4A]" />;
      case 'planningCompleteness':
        return <CheckSquare className="w-4 h-4 text-[#20B8A6]" />;
      default:
        return <Calendar className="w-4 h-4 text-[#5E6B67]" />;
    }
  };

  const componentsList: HealthComponentScore[] = Object.values(health.components);

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#EAE6DD] shadow-2xs space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[#F4F1EA]">
        <div>
          <h3 className="text-base font-extrabold text-[#17201D]">
            Weighted Health Components
          </h3>
          <p className="text-xs text-[#838F8B]">
            Mathematical score breakdown across 7 dimensions
          </p>
        </div>
        <span className="text-xs font-bold text-[#1F8A70] bg-[#E8F8F5] px-3 py-1 rounded-full border border-[#A3E5D8]">
          Total: 100% Weight
        </span>
      </div>

      {/* Component Bars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {componentsList.map((comp) => {
          const barColor =
            comp.score >= 90
              ? 'bg-[#1F8A70]'
              : comp.score >= 75
              ? 'bg-[#20B8A6]'
              : comp.score >= 60
              ? 'bg-[#FFB020]'
              : 'bg-[#FF6B4A]';

          return (
            <div
              key={comp.key}
              className="p-4 rounded-2xl bg-[#F9F7F1] border border-[#EAE6DD]/80 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white border border-[#EAE6DD]">
                    {getIconForComponent(comp.key)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#17201D]">{comp.name}</h4>
                    <span className="text-[10px] text-[#838F8B] font-semibold">
                      Weight: {Math.round(comp.weight * 100)}%
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-[#17201D]">
                    {comp.score}
                    <span className="text-[10px] font-normal text-[#838F8B]">/100</span>
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#EAE6DD]/70 h-2 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full ${barColor} transition-all duration-500 rounded-full`}
                  style={{ width: `${comp.score}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#5E6B67]">
                <span className="truncate">{comp.summary}</span>
                <span className="font-bold text-[#17201D] shrink-0 ml-2">
                  +{comp.weightedScore} pts
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
