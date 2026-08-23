import React from 'react';
import { Star, MapPin, Sparkles } from 'lucide-react';
import { GuideHighlightItem } from '../../types/travelGuide';

interface GuideHighlightsProps {
  highlights: GuideHighlightItem[];
}

export const GuideHighlights: React.FC<GuideHighlightsProps> = ({ highlights }) => {
  if (!highlights || highlights.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#17201D] tracking-tight">
            Top Trip Highlights
          </h2>
          <p className="text-xs text-[#68736F] mt-0.5">
            Key experiences, signature vistas, and memorable dining hand-selected for this journey.
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFF2EE] text-[#FF6B4A] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          Featured Highlights
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {highlights.map((item, idx) => (
          <div
            key={item.id || idx}
            className="group bg-white rounded-3xl border border-[#EAE6DD] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
          >
            {/* Image */}
            <div className="relative h-44 w-full bg-[#FAF8F5] overflow-hidden">
              <img
                src={
                  item.image ||
                  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
                }
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[#17201D] text-[10px] font-black uppercase tracking-wider">
                {item.category}
              </span>

              {item.rating && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-xs font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 text-[#FFB020] fill-[#FFB020]" />
                  <span>{item.rating.toFixed(1)}</span>
                </div>
              )}

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h3 className="text-sm font-black truncate">{item.name}</h3>
                {item.location && (
                  <p className="text-[11px] text-white/80 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-[#FF6B4A]" />
                    <span>{item.location}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <p className="text-xs text-[#5E6B67] leading-relaxed line-clamp-3">
                {item.description}
              </p>

              {item.whySpecial && (
                <div className="p-2.5 rounded-2xl bg-[#FCFBF8] border border-[#F4F1EA] text-[11px] font-semibold text-[#179E8E] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span className="line-clamp-1">{item.whySpecial}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
