import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Compass } from 'lucide-react';
import { TRAVEL_IMAGES } from '../../assets/images';

interface InspirationTile {
  id: string;
  title: string;
  tagline: string;
  duration: string;
  image: string;
  tag: string;
}

const INSPIRATION_TILES: InspirationTile[] = [
  {
    id: 'weekend',
    title: 'Weekend Escapes',
    tagline: 'Quick 2–3 day recharging getaways with zero planning fatigue',
    duration: '2–3 Days',
    image: TRAVEL_IMAGES.inspireWeekend,
    tag: 'Quick Breaks',
  },
  {
    id: 'hidden-gems',
    title: 'Hidden Gems',
    tagline: 'Secret coastal villages, quiet valley hamlets & off-grid retreats',
    duration: '4–7 Days',
    image: TRAVEL_IMAGES.inspireGems,
    tag: 'Off The Beaten Path',
  },
  {
    id: 'food-journeys',
    title: 'Food Journeys',
    tagline: 'Michelin street corners, wine valleys & culinary masterclasses',
    duration: '5–8 Days',
    image: TRAVEL_IMAGES.inspireFood,
    tag: 'Gastronomy',
  },
  {
    id: 'mountain-adventures',
    title: 'Mountain Adventures',
    tagline: 'Glacial panoramic heights, alpine summits & pristine lakes',
    duration: '5–10 Days',
    image: TRAVEL_IMAGES.inspireMountains,
    tag: 'High Altitude',
  },
  {
    id: 'beach-getaways',
    title: 'Beach Getaways',
    tagline: 'Turquoise lagoons, coastal breezes & golden sunset sands',
    duration: '4–7 Days',
    image: TRAVEL_IMAGES.inspireBeaches,
    tag: 'Coastal Sun',
  },
];

export const TravelInspirationStrip: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="travel-inspiration" aria-label="Travel Inspiration" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-extrabold text-[#17201D] tracking-tight">
              Travel inspiration
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FFF6DB] text-[#D97706] text-[10px] font-bold">
              Curated Collections
            </span>
          </div>
          <p className="text-xs text-[#68736F]">
            Editorial themes to spark your next journey
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/explore')}
          className="text-xs font-bold text-[#FF6B4A] hover:text-[#E55837] inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
        >
          <span>See all themes</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Horizontal Scroll / Grid Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {INSPIRATION_TILES.map((tile) => (
          <div
            key={tile.id}
            onClick={() => navigate('/explore')}
            className="group relative rounded-3xl overflow-hidden aspect-[4/5] sm:aspect-auto sm:h-72 border border-[#EAE6DD] shadow-2xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-end p-4 text-white"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/explore')}
            aria-label={`Explore ${tile.title}`}
          >
            {/* Background Image */}
            <img
              src={tile.image}
              alt={tile.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              loading="lazy"
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 group-hover:via-black/45 transition-colors" />

            {/* Top Tag */}
            <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-extrabold border border-white/20 uppercase tracking-wider">
                {tile.tag}
              </span>
              <span className="text-[10px] font-bold text-white/80 bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                {tile.duration}
              </span>
            </div>

            {/* Bottom Content */}
            <div className="relative z-10 space-y-1.5 transform group-hover:-translate-y-1 transition-transform duration-200">
              <h4 className="text-base font-extrabold text-white tracking-tight leading-tight">
                {tile.title}
              </h4>
              <p className="text-[11px] text-white/85 line-clamp-2 leading-relaxed">
                {tile.tagline}
              </p>
              <div className="pt-2 flex items-center gap-1 text-xs font-bold text-[#FF8E72] group-hover:text-white transition-colors">
                <span>Explore theme</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
