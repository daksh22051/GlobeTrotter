import React from 'react';
import { Hotel, MapPin, Star } from 'lucide-react';
import { Recommendation } from '../../types/recommendation';
import { formatCurrency } from '../../utils/currency';
import { CurrencyCode } from '../../types/profile';

interface GuideHotelsProps {
  hotels: Recommendation[];
  currency: string;
}

export const GuideHotels: React.FC<GuideHotelsProps> = ({ hotels, currency }) => {
  const currencyCode = (currency || 'INR') as CurrencyCode;
  if (!hotels || hotels.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#17201D] tracking-tight">
            Recommended Accommodations
          </h2>
          <p className="text-xs text-[#68736F] mt-0.5">
            Stays matching your preferred comfort and location.
          </p>
        </div>
        <span className="text-xs font-bold text-[#FFB020]">
          {hotels.length} stays
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hotels.map((hotel) => (
          <div
            key={hotel.id}
            className="bg-white rounded-3xl border border-[#EAE6DD] overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col"
          >
            <div className="relative h-40 w-full bg-[#FAF8F5]">
              <img
                src={hotel.image}
                alt={hotel.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-xs font-bold flex items-center gap-1">
                <Star className="w-3 h-3 text-[#FFB020] fill-[#FFB020]" />
                <span>{hotel.rating.toFixed(1)}</span>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
              <div>
                <h4 className="text-sm font-black text-[#17201D] line-clamp-1">{hotel.name}</h4>
                <p className="text-[11px] text-[#68736F] line-clamp-2 mt-1">{hotel.description}</p>
              </div>

              <div className="pt-2 border-t border-[#F4F1EA] flex items-center justify-between text-xs text-[#838F8B]">
                <span className="flex items-center gap-1 truncate max-w-[140px]">
                  <MapPin className="w-3 h-3 text-[#FF6B4A]" />
                  <span className="truncate">{hotel.location}</span>
                </span>
                <span className="font-bold text-[#17201D]">
                  {formatCurrency(hotel.estimatedCost, (hotel.currency || currencyCode) as CurrencyCode)}/night
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
