import React from 'react';
import {
  CreditCard,
  Clock,
  Utensils,
  Footprints,
  Ticket,
  Compass,
  Shield,
  Navigation,
  Calendar,
  Coffee,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { SmartTravelTip } from '../../types/recommendation';

interface TravelTipsProps {
  tips: SmartTravelTip[];
  destination: string;
}

const renderTipIcon = (iconName: string) => {
  const props = { className: 'w-5 h-5 text-[#FF6B4A]' };
  switch (iconName.toLowerCase()) {
    case 'creditcard':
      return <CreditCard {...props} />;
    case 'clock':
      return <Clock {...props} />;
    case 'utensils':
      return <Utensils {...props} />;
    case 'footprints':
      return <Footprints {...props} />;
    case 'ticket':
      return <Ticket {...props} />;
    case 'compass':
      return <Compass {...props} />;
    case 'shield':
      return <Shield {...props} />;
    case 'navigation':
      return <Navigation {...props} />;
    case 'calendar':
      return <Calendar {...props} />;
    case 'coffee':
      return <Coffee {...props} />;
    default:
      return <Lightbulb {...props} />;
  }
};

export const TravelTips: React.FC<TravelTipsProps> = ({ tips, destination }) => {
  if (!tips || tips.length === 0) return null;

  return (
    <div className="w-full bg-[#FCFBF8] rounded-3xl border border-[#EAE6DD] p-6 sm:p-8 mb-8 select-none">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-[#F59E0B]" />
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#17201D] tracking-tight">
              Smart travel tips for {destination}
            </h2>
            <p className="text-xs text-[#68736F]">
              Curated insider advice for effortless navigation and local culture.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tips.map((tip, idx) => (
          <div
            key={tip.id || `smart-tip-${idx}`}
            className="p-4 rounded-2xl bg-white border border-[#EAE6DD] shadow-2xs flex flex-col justify-between space-y-3 hover:border-[#FF6B4A]/30 transition-colors"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-[#FFF9F6] border border-[#FF6B4A]/20">
                  {renderTipIcon(tip.iconName)}
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#838F8B] bg-[#F4F1EA] px-2 py-0.5 rounded-md">
                  {tip.category}
                </span>
              </div>

              <h3 className="text-sm font-extrabold text-[#17201D]">
                {tip.title}
              </h3>

              <p className="text-xs text-[#68736F] leading-relaxed">
                {tip.tip}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
