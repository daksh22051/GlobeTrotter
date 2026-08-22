import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  MapPin,
  Plus,
  ArrowRight,
  Sparkles,
  Compass,
  CheckCircle2,
  Layers,
  Map as MapIcon,
  Wallet,
  Clock,
} from 'lucide-react';
import { Trip } from '../../types/trip';
import { formatCurrency } from '../../utils/currency';

interface UpcomingTripsSectionProps {
  trips: Trip[];
}

export const UpcomingTripsSection: React.FC<UpcomingTripsSectionProps> = ({ trips }) => {
  const navigate = useNavigate();

  return (
    <section id="upcoming-trips" aria-label="Upcoming Trips" className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-[#17201D] tracking-tight">
            Upcoming trips
          </h3>
          <p className="text-xs text-[#68736F]">Your active itineraries and journeys</p>
        </div>

        {trips.length > 0 && (
          <button
            type="button"
            onClick={() => navigate('/plan-trip')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFF2EE] hover:bg-[#FFE5DC] text-[#FF6B4A] text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Trip</span>
          </button>
        )}
      </div>

      {trips.length === 0 ? (
        /* Empty State */
        <div className="relative overflow-hidden rounded-3xl bg-white border border-[#EAE6DD] p-8 sm:p-10 text-center shadow-2xs">
          <div className="max-w-md mx-auto flex flex-col items-center">
            {/* Visual Icon Halo */}
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#FFF1EC] to-[#FFE2D9] text-[#FF6B4A] flex items-center justify-center mb-4 shadow-sm border border-[#FFD3C4]">
              <Compass className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF9F6] text-[#FF6B4A] text-[11px] font-extrabold border border-[#FFE0D6] mb-3">
              <Sparkles className="w-3 h-3" />
              <span>Ready for takeoff</span>
            </div>

            <h4 className="text-lg sm:text-xl font-extrabold text-[#17201D] mb-2 tracking-tight">
              Your next adventure starts here.
            </h4>
            <p className="text-xs sm:text-sm text-[#68736F] max-w-sm mb-6 leading-relaxed">
              You haven't planned a trip yet. Let's change that — GlobeTrotter will help you assemble days, activities, and budgets in minutes.
            </p>

            <button
              type="button"
              onClick={() => navigate('/plan-trip')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs sm:text-sm font-bold shadow-sm shadow-[#FF6B4A]/25 hover:shadow-md hover:shadow-[#FF6B4A]/30 active:scale-[0.98] transition-all cursor-pointer group"
            >
              <span>Plan Your First Trip</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      ) : (
        /* Trip Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trips.map((trip) => (
            <div
              key={trip.id}
              onClick={() => navigate(`/trip/${trip.id}/recommendations`)}
              className="group bg-white rounded-3xl overflow-hidden border border-[#EAE6DD] hover:border-[#FF6B4A]/50 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col"
            >
              {/* Trip Image Header */}
              <div className="relative h-40 overflow-hidden bg-[#F4F1EA]">
                <img
                  src={trip.coverImage}
                  alt={trip.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[#20B8A6] text-[10px] font-extrabold flex items-center gap-1 border border-white/10">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>AI Plan</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[#17201D] text-[10px] font-extrabold uppercase tracking-wider">
                    {trip.status}
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-base font-extrabold truncate">{trip.name}</p>
                  <p className="text-xs text-white/90 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-[#FF8E72]" />
                    <span>{trip.destination}, {trip.country}</span>
                  </p>
                </div>
              </div>

              {/* Trip Details */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-2 text-xs text-[#5E6B67]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#98A29F]" />
                    <span className="truncate">{trip.dateDisplay}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#98A29F]" />
                    <span>{trip.travelersCount} travelers</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F4F1EA] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#98A29F] uppercase font-bold block">
                      Estimated Budget
                    </span>
                    <span className="text-xs font-black text-[#17201D]">
                      {formatCurrency(trip.budget, trip.currency)}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#FF6B4A] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                    <span>AI Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* Quick Feature Navigation Pills */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="grid grid-cols-4 gap-1 pt-2 border-t border-[#F4F1EA]"
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/trip/${trip.id}/itinerary`)}
                    className="py-1 px-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F4F1EA] text-[10px] font-bold text-[#556960] hover:text-[#17201D] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="Itinerary Builder"
                  >
                    <Layers className="w-3 h-3 text-[#FF6B4A]" />
                    <span className="hidden sm:inline">Plan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/trip/${trip.id}/map`)}
                    className="py-1 px-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F4F1EA] text-[10px] font-bold text-[#556960] hover:text-[#17201D] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="Interactive Map"
                  >
                    <MapIcon className="w-3 h-3 text-[#FF6B4A]" />
                    <span className="hidden sm:inline">Map</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/trip/${trip.id}/budget`)}
                    className="py-1 px-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F4F1EA] text-[10px] font-bold text-[#556960] hover:text-[#17201D] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="Smart Budget Tracker"
                  >
                    <Wallet className="w-3 h-3 text-[#20B8A6]" />
                    <span className="hidden sm:inline">Budget</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/trip/${trip.id}/calendar`)}
                    className="py-1 px-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F4F1EA] text-[10px] font-bold text-[#556960] hover:text-[#17201D] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="Trip Timeline & Calendar"
                  >
                    <Clock className="w-3 h-3 text-[#E08A00]" />
                    <span className="hidden sm:inline">Timeline</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
