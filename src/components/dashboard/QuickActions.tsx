import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Briefcase, Globe2, ArrowUpRight } from 'lucide-react';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="quick-actions" aria-label="Start Planning Actions" className="space-y-3.5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold text-[#17201D] tracking-tight">
          Start planning
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Card 1: PLAN NEW TRIP (Most Prominent) */}
        <div
          onClick={() => navigate('/plan-trip')}
          className="group relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-[#FFF1EC] via-[#FFEBE4] to-[#FFF7F4] border-2 border-[#FFD3C4] hover:border-[#FF6B4A] shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/plan-trip')}
          aria-label="Plan New Trip - Build your perfect itinerary"
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B4A] text-white flex items-center justify-center shadow-md shadow-[#FF6B4A]/25 group-hover:scale-110 transition-transform duration-200">
              <PlusCircle className="w-6 h-6 stroke-[2.2]" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-base font-extrabold text-[#17201D] group-hover:text-[#FF6B4A] transition-colors">
                Plan New Trip
              </h4>
              <ArrowUpRight className="w-4 h-4 text-[#FF6B4A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <p className="text-xs text-[#5E6B67] leading-relaxed">
              Build your perfect itinerary tailored to your preferences and pace.
            </p>
          </div>
        </div>

        {/* Card 2: MY TRIPS */}
        <div
          onClick={() => navigate('/trips')}
          className="group relative overflow-hidden rounded-3xl p-5 bg-white border border-[#EAE6DD] hover:border-[#20B8A6] shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/trips')}
          aria-label="My Trips - Continue a saved journey"
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#DDF7F2] text-[#20B8A6] flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Briefcase className="w-6 h-6 stroke-[2.2]" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-base font-extrabold text-[#17201D] group-hover:text-[#20B8A6] transition-colors">
                My Trips
              </h4>
              <ArrowUpRight className="w-4 h-4 text-[#98A29F] group-hover:text-[#20B8A6] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <p className="text-xs text-[#68736F] leading-relaxed">
              Continue a saved journey, manage reservations, or invite friends.
            </p>
          </div>
        </div>

        {/* Card 3: EXPLORE */}
        <div
          onClick={() => navigate('/explore')}
          className="group relative overflow-hidden rounded-3xl p-5 bg-white border border-[#EAE6DD] hover:border-[#17201D] shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/explore')}
          aria-label="Explore - Find your next destination"
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF6DB] text-[#D97706] flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Globe2 className="w-6 h-6 stroke-[2.2]" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-base font-extrabold text-[#17201D] group-hover:text-[#D97706] transition-colors">
                Explore Destinations
              </h4>
              <ArrowUpRight className="w-4 h-4 text-[#98A29F] group-hover:text-[#D97706] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <p className="text-xs text-[#68736F] leading-relaxed">
              Find your next destination with travel guides and daily budget breakdowns.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
