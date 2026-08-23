import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  HeartPulse,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Itinerary, ItineraryStats } from '../../types/itinerary';
import { Trip } from '../../types/trip';
import { tripHealthService } from '../../services/tripHealthService';

interface TripSummarySidebarProps {
  trip: Trip;
  itinerary: Itinerary;
  stats: ItineraryStats;
  onOpenAIOptimize: () => void;
}

export const TripSummarySidebar: React.FC<TripSummarySidebarProps> = ({
  trip,
  itinerary,
  stats,
  onOpenAIOptimize,
}) => {
  const navigate = useNavigate();
  const [showBudgetTip, setShowBudgetTip] = useState(false);
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const rotateX = useTransform(pointerY, [0, 1], [4, -4]);
  const rotateY = useTransform(pointerX, [0, 1], [-4, 4]);

  if (!trip || !itinerary) return null;

  const currency = trip.currency || '₹';

  // Calculate live trip health breakdown
  const health = tripHealthService.calculateHealth(trip, itinerary);

  const handlePointerMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width);
    pointerY.set((event.clientY - bounds.top) / bounds.height);
  };

  const resetPointer = () => {
    pointerX.set(0.5);
    pointerY.set(0.5);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 18, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.18, ease: 'easeOut' }}
      onMouseMove={handlePointerMove}
      onMouseLeave={resetPointer}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      className="w-full min-w-0 border border-[#FFD3C4] rounded-2xl bg-gradient-to-br from-[#FFF0EA] via-[#FFF8ED] to-[#EAF8F5] p-6 shadow-[0_16px_38px_rgba(255,107,74,0.14)] space-y-6"
    >
      {/* 1. Trip Health Quick Card */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F4F1EA]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EAF8F5] text-[#20B8A6] flex items-center justify-center border border-[#B2E6DC]/40">
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-[#17201D] uppercase tracking-wider">
                Trip Health
              </h3>
              <span className="text-[10px] text-[#838F8B]">Pacing & Conflict Audit</span>
            </div>
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border border-white/10 ${health.badgeBg} ${health.badgeText}`}>
            {health.score}/100 {health.label}
          </span>
        </div>

        <p className="text-xs text-[#4A5551] leading-relaxed font-medium">
          {health.recommendation}
        </p>

        {stats.isOverBudget && (
          <div className="p-3.5 rounded-2xl bg-[#FFF2EE] border border-[#FF6B4A]/30">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[#FF6B4A] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[#E55837]">⚠ Over Budget</h4>
                <p className="text-xs text-[#68736F] mt-0.5">
                  Your current itinerary is approximately {currency}
                  {stats.overBudgetAmount.toLocaleString()} over your target budget of{' '}
                  {currency}{trip.budget.toLocaleString()}.
                </p>

                <button
                  type="button"
                  onClick={() => setShowBudgetTip(!showBudgetTip)}
                  className="mt-2 text-xs font-bold text-[#FF6B4A] hover:text-[#E55837] underline cursor-pointer"
                >
                  {showBudgetTip ? 'Hide suggestion' : 'Optimize Budget'}
                </button>

                {showBudgetTip && (
                  <div className="mt-2 p-2.5 rounded-xl bg-white text-[11px] text-[#5E6B67] border border-[#FF6B4A]/20">
                    💡 <strong>Tip:</strong> Use the{' '}
                    <span
                      onClick={() => navigate(`/trip/${trip.id}/what-if`)}
                      className="text-[#20B8A6] font-bold cursor-pointer underline"
                    >
                      What-If Simulator
                    </span>{' '}
                    to test lower-cost hotels and transport alternatives.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => navigate(`/trip/${trip.id}/health`)}
            className="w-full py-2 px-3 rounded-xl bg-white border border-[#EAE6DD] hover:border-[#17201D] text-[#17201D] text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>View Health Details</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => navigate(`/trip/${trip.id}/what-if`)}
            className="w-full py-2 px-3 rounded-xl bg-[#FFF8ED] hover:bg-[#FFECC9] text-[#B86E00] border border-[#FCE2B6] text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-[#FFB020]" />
            <span>What-If</span>
          </button>
        </div>
      </div>

    </motion.div>
  );
};
