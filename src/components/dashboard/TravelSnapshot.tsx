import React from 'react';
import { Plane, Compass, MapPin, Wallet, Sparkles } from 'lucide-react';
import { TripStats } from '../../types/trip';
import { CurrencyCode } from '../../types/profile';
import { formatCurrency } from '../../utils/currency';

interface TravelSnapshotProps {
  stats: TripStats;
  currency: CurrencyCode;
}

export const TravelSnapshot: React.FC<TravelSnapshotProps> = ({ stats, currency }) => {
  const formattedBudget = formatCurrency(stats.preferredBudget || 50000, currency);

  const statCards = [
    {
      id: 'trips',
      label: 'Trips Planned',
      value: stats.tripsPlanned,
      icon: Plane,
      color: '#FF6B4A',
      bgColor: '#FFF2EE',
      subtext: stats.tripsPlanned === 0 ? 'Ready for your 1st trip' : 'Itineraries created',
    },
    {
      id: 'countries',
      label: 'Countries Visited',
      value: stats.countriesVisited,
      icon: Compass,
      color: '#20B8A6',
      bgColor: '#DDF7F2',
      subtext: stats.countriesVisited === 0 ? 'World awaits' : 'Destinations explored',
    },
    {
      id: 'cities',
      label: 'Cities Explored',
      value: stats.citiesExplored,
      icon: MapPin,
      color: '#3B82F6',
      bgColor: '#EFF6FF',
      subtext: stats.citiesExplored === 0 ? 'Zero footprint so far' : 'Urban & scenic stops',
    },
    {
      id: 'budget',
      label: 'Preferred Budget',
      value: formattedBudget,
      icon: Wallet,
      color: '#D97706',
      bgColor: '#FFF6DB',
      subtext: 'From your profile',
      isText: true,
    },
  ];

  return (
    <section id="travel-snapshot" aria-label="Travel Snapshot" className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-extrabold text-[#17201D] tracking-tight">
            Your travel snapshot
          </h3>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F4F1EA] text-[#68736F] text-[10px] font-bold">
            Live Activity
          </span>
        </div>
        <span className="text-xs font-semibold text-[#98A29F]">Synchronized with profile</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EAE6DD] shadow-2xs hover:border-[#D1CBC0] transition-colors flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-[#68736F]">{card.label}</span>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: card.bgColor, color: card.color }}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="text-xl sm:text-2xl font-black text-[#17201D] tracking-tight truncate">
                  {card.value}
                </div>
                <p className="text-[11px] font-medium text-[#98A29F] mt-0.5 truncate">
                  {card.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
