import { Recommendation } from '../types/recommendation';
import { Trip } from '../types/trip';

const PACKAGE_IMAGES = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=85',
];

const destinationThemes: Record<string, { theme: string; locations: string[]; style: string }> = {
  udaipur: { theme: 'Royal Heritage', locations: ['City Palace Courtyards', 'Lake Pichola Ghats', 'Jag Mandir Waterfront'], style: 'regal editorial portraits' },
  goa: { theme: 'Cinematic Beach', locations: ['Palolem Beach', 'Fontainhas Lanes', 'Chapora Cliff'], style: 'sunlit coastal frames' },
  bali: { theme: 'Tropical Ceremony', locations: ['Ubud Rice Terraces', 'Tegalalang Valley', 'Uluwatu Cliffs'], style: 'lush island romance' },
  jaipur: { theme: 'Pink City Royalty', locations: ['Amber Fort', 'Patrika Gate', 'Jal Mahal Viewpoint'], style: 'architectural fashion portraits' },
  manali: { theme: 'Alpine Adventure', locations: ['Solang Valley', 'Old Manali Forests', 'Beas River Banks'], style: 'cinematic mountain storytelling' },
  paris: { theme: 'Parisian Fine Art', locations: ['Eiffel Tower Dawn', 'Montmartre Streets', 'Seine River Quays'], style: 'timeless fine-art romance' },
  tokyo: { theme: 'Neon & Tradition', locations: ['Asakusa Lantern Streets', 'Shibuya Skyline', 'Meiji Jingu Forest'], style: 'editorial city contrast' },
  mumbai: { theme: 'Urban Cinema', locations: ['Marine Drive', 'Gateway of India', 'Kala Ghoda'], style: 'high-energy cinematic portraits' },
};

export function getPhotoshootPackages(trip: Trip): Recommendation[] {
  const key = trip.destination.toLowerCase().trim();
  const setting = destinationThemes[key] || {
    theme: 'Destination Story',
    locations: [`${trip.destination} Old Town`, `${trip.destination} Scenic Lookout`, `${trip.destination} Golden Hour View`],
    style: 'personalized destination portraits',
  };
  const currency = trip.currency || 'INR';
  const prices = [28000, 52000, 86000];
  const names = ['Essential Couple Session', 'Signature Wedding Story', 'Cinematic Pre-Wedding Editorial'];
  const includes = [
    ['4 hours with a local photographer', '80 edited digital images', 'One destination location'],
    ['8 hours with lead photographer and assistant', '180 edited digital images', 'Three destination locations', 'Private online gallery'],
    ['Full-day creative production', 'Two photographers and styling consultation', '300 edited digital images', 'Same-day preview gallery', 'Album design consultation'],
  ];

  return names.map((name, index) => ({
    id: `photoshoot_${key}_${index + 1}`,
    name,
    category: 'experience',
    description: `A ${setting.style} package designed for wedding and pre-wedding memories in ${trip.destination}.`,
    image: PACKAGE_IMAGES[index],
    location: setting.locations[index % setting.locations.length],
    destination: trip.destination,
    country: trip.country,
    rating: 4.8 + index * 0.05,
    reviewCount: 120 + index * 63,
    priceLevel: index === 0 ? '$$' : index === 1 ? '$$$' : '$$$$',
    estimatedCost: prices[index],
    currency,
    duration: index === 0 ? '4 hours' : index === 1 ? '8 hours' : 'Full day',
    bestTime: 'Golden hour included',
    tags: ['Wedding', 'Pre-Wedding', setting.theme, 'Professional Photographer'],
    whyRecommended: `Curated for ${setting.theme} photographs with transparent package pricing.`,
    matchScore: 98 - index,
    experienceDetails: { activityType: 'Professional Photoshoot Package', fitnessLevel: 'Easy', groupSize: 'Private Session' },
    photoshootDetails: {
      theme: setting.theme,
      locations: setting.locations,
      packageIncludes: includes[index],
      packageDuration: index === 0 ? '4 hours' : index === 1 ? '8 hours' : 'Full day',
    },
  }));
}
