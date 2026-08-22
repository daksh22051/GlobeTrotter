import React, { useState } from 'react';

interface TripCoverImageProps {
  src?: string;
  destination?: string;
  tripName?: string;
  alt?: string;
  className?: string;
  imageClassName?: string;
}

const DESTINATION_FALLBACKS: Record<string, string> = {
  tokyo: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
  japan: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
  france: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
  rome: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
  italy: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
  indonesia: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
  newyork: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
  london: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
  uk: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
  switzerland: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
  swiss: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
  dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
  jaipur: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
  india: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
  iceland: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80',
  kyoto: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
  amsterdam: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=1200&q=80',
  barcelona: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80',
  santorini: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
  greece: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
  default: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
};

/**
 * Deterministically picks a cover image based on destination keyword matching
 */
export function getDeterministicCoverImage(destination?: string, tripName?: string): string {
  const combined = `${destination || ''} ${tripName || ''}`.toLowerCase().replace(/[^a-z0-9]/g, '');

  for (const [key, url] of Object.entries(DESTINATION_FALLBACKS)) {
    if (key !== 'default' && combined.includes(key)) {
      return url;
    }
  }

  return DESTINATION_FALLBACKS.default;
}

export const TripCoverImage: React.FC<TripCoverImageProps> = ({
  src,
  destination,
  tripName,
  alt = 'Trip cover',
  className = 'w-full h-full',
  imageClassName = 'w-full h-full object-cover',
}) => {
  const fallbackUrl = getDeterministicCoverImage(destination, tripName);
  const initialUrl = src && src.trim().length > 0 ? src : fallbackUrl;

  const [currentSrc, setCurrentSrc] = useState<string>(initialUrl);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const handleError = () => {
    if (!hasError && currentSrc !== fallbackUrl) {
      setHasError(true);
      setCurrentSrc(fallbackUrl);
    }
  };

  return (
    <div className={`relative overflow-hidden bg-[#EAE6DD]/50 ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#F4F1EA] animate-pulse" />
      )}
      <img
        src={currentSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={handleError}
        className={`transition-transform duration-500 ease-out ${imageClassName} ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
