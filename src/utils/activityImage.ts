import { TRAVEL_IMAGES } from '../assets/images';
import type { SyntheticEvent } from 'react';

interface ActivityImageSource {
  id?: string;
  image?: string;
  cover_image?: string;
  category?: string;
  priceLevel?: string;
  hotelDetails?: { accommodationType?: string };
}

export const FOOD_IMAGE_URLS = [
  'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=85',
];

export const EXPERIENCE_IMAGE_URLS = [
  'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1501555088652-02162c672b0d?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1521336575822-6da63fb45455?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85',
];

export const PLACE_IMAGE_URLS = [
  'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1501555088652-02162c672b0d?auto=format&fit=crop&w=1000&q=85',
];

const HOTEL_IMAGE_URLS = [
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=85',
];

function getHotelImage(activity: ActivityImageSource, position?: number): string {
  const identity = `${activity.id || activity.image || 'hotel'}:${activity.priceLevel || activity.hotelDetails?.accommodationType || ''}`;
  const numericId = activity.id?.match(/(?:_|-)(\d+)(?:$|:)/)?.[1];
  const hash = position !== undefined
    ? position
    : numericId
    ? Number(numericId) - 1
    : Array.from(identity).reduce((total, character) => total + character.charCodeAt(0), 0);
  return HOTEL_IMAGE_URLS[Math.abs(hash) % HOTEL_IMAGE_URLS.length];
}

function getCategoryImage(activity: ActivityImageSource, images: string[], position?: number): string {
  const identity = `${activity.id || activity.image || 'recommendation'}:${activity.priceLevel || ''}`;
  const numericId = activity.id?.match(/(?:_|-)(\d+)(?:$|:)/)?.[1];
  const hash = position !== undefined
    ? position
    : numericId
    ? Number(numericId) - 1
    : Array.from(identity).reduce((total, character) => total + character.charCodeAt(0), 0);
  return images[Math.abs(hash) % images.length];
}

export function getActivityImage(activity: ActivityImageSource, position?: number): string {
  const category = String(activity.category || '').toLowerCase();
  if (category === 'hotel') {
    return getHotelImage(activity, position);
  }
  if (category === 'food') return getCategoryImage(activity, FOOD_IMAGE_URLS, position);
  if (category === 'experience') return getCategoryImage(activity, EXPERIENCE_IMAGE_URLS, position);
  if (category === 'place' || category === 'attraction' || category === 'sightseeing') {
    return getCategoryImage(activity, PLACE_IMAGE_URLS, position);
  }

  const primaryImage = activity.image || activity.cover_image;
  if (primaryImage && primaryImage.trim().length > 0) return primaryImage;

  switch (String(activity.category || '').toLowerCase()) {
    case 'food':
      return TRAVEL_IMAGES.catFood;
    case 'experience':
      return TRAVEL_IMAGES.catExperience;
    case 'hotel':
      return TRAVEL_IMAGES.catHotel;
    case 'place':
    case 'attraction':
    case 'sightseeing':
    default:
      return TRAVEL_IMAGES.catPlace;
  }
}

export function handleActivityImageError(
  event: SyntheticEvent<HTMLImageElement>,
  activityOrCategory?: ActivityImageSource | string
): void {
  const image = event.currentTarget;
  const fallbackImage = getActivityImage(
    typeof activityOrCategory === 'string'
      ? { category: activityOrCategory }
      : activityOrCategory || {}
  );

  if (image.dataset.fallbackApplied === 'true' || image.src === fallbackImage) {
    image.style.display = 'none';
    return;
  }

  image.dataset.fallbackApplied = 'true';
  image.src = fallbackImage;
}
