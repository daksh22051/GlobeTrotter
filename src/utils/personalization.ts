import { UserPreferences, TravelInterest } from '../types/profile';
import { formatCurrency } from './currency';

const INTEREST_NAMES: Record<TravelInterest, string> = {
  food: 'culinary food trails',
  mountains: 'mountain peaks',
  beaches: 'coastal beaches',
  history: 'historical heritage',
  art: 'art & museums',
  nature: 'untouched nature',
  adventure: 'outdoor adventure',
  photography: 'scenic photography',
  shopping: 'boutique shopping',
  nightlife: 'vibrant nightlife',
  spirituality: 'peaceful retreats',
  architecture: 'striking architecture',
};

const PERSONALITY_TITLES: Record<string, string> = {
  explorer: 'The Explorer',
  foodie: 'The Foodie',
  culture_lover: 'The Culture Lover',
  adventure_seeker: 'The Adventure Seeker',
  relaxer: 'The Relaxer',
  photographer: 'The Photographer',
};

export interface PersonalizationSummary {
  headline: string;
  description: string;
  travelDNA: string[];
  recommendationFocus: string;
}

/**
 * Generates an AI-style personalization summary strictly from selected user preferences
 */
export const generatePersonalizationSummary = (
  prefs: Partial<UserPreferences>
): PersonalizationSummary => {
  const personality = PERSONALITY_TITLES[prefs.travelPersonality || 'explorer'] || 'The Explorer';
  const style = prefs.travelStyle || 'balanced';
  const interests = prefs.interests && prefs.interests.length > 0 ? prefs.interests : ['food', 'nature'];
  const companion = prefs.travelCompanion || 'friends';
  const budgetStyle = prefs.budgetStyle || 'balanced';
  const budgetAmount = prefs.budget || 50000;
  const currency = prefs.currency || 'INR';

  // Format first 3 interest labels
  const interestLabels = interests.slice(0, 3).map((i) => INTEREST_NAMES[i] || i);
  const formattedInterests =
    interestLabels.length === 1
      ? interestLabels[0]
      : interestLabels.length === 2
      ? `${interestLabels[0]} and ${interestLabels[1]}`
      : `${interestLabels[0]}, ${interestLabels[1]}, and ${interestLabels[2]}`;

  // Style wording
  const styleDescriptor =
    style === 'relaxed'
      ? 'a relaxed, mindful pace with unhurried mornings'
      : style === 'packed'
      ? 'an energetic, action-packed itinerary covering maximum highlights'
      : 'a balanced rhythm combining exploration with rejuvenating downtime';

  // Companion wording
  const companionDescriptor =
    companion === 'solo'
      ? 'independent solo adventures'
      : companion === 'partner'
      ? 'romantic getaways for two'
      : companion === 'family'
      ? 'memorable family-friendly experiences'
      : companion === 'business'
      ? 'efficient bleisure travel'
      : 'shared adventures with friends';

  // Budget style wording
  const budgetDescriptor =
    budgetStyle === 'luxury'
      ? 'premium boutique stays and five-star experiences'
      : budgetStyle === 'comfort'
      ? 'comfort-first lodging and verified top-tier spots'
      : budgetStyle === 'budget_friendly'
      ? 'high-value smart-spend gems and authentic local spots'
      : 'high-quality value with strategic splurges';

  const formattedBudget = formatCurrency(budgetAmount, currency);

  const headline = `You're ${style === 'balanced' ? 'a balanced' : style === 'relaxed' ? 'a relaxed' : 'an energetic'} ${personality.replace(
    'The ',
    ''
  )} who loves ${formattedInterests}.`;

  const description = `We'll prioritize ${formattedInterests} curated for ${companionDescriptor}. Your journeys will be optimized for ${styleDescriptor} and tuned to ${budgetDescriptor} around ${formattedBudget} per trip.`;

  const travelDNA = [
    personality,
    style.toUpperCase(),
    `${formattedBudget} / trip`,
    companion.charAt(0).toUpperCase() + companion.slice(1),
    ...interests.slice(0, 2).map((i) => i.charAt(0).toUpperCase() + i.slice(1)),
  ];

  const recommendationFocus =
    style === 'relaxed'
      ? 'Scenic viewpoints, slow dining, and serene accommodations.'
      : style === 'packed'
      ? 'Fast-track passes, multi-stop scenic routes, and landmark clusters.'
      : 'Optimal morning activities, curated local lunches, and flexible evening hours.';

  return {
    headline,
    description,
    travelDNA,
    recommendationFocus,
  };
};
