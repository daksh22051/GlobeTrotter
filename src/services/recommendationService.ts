/**
 * Recommendation Service
 * 
 * Scores and curates destinations dynamically based on user onboarding preferences.
 * Prepares the foundation for future Gemini AI-powered travel recommendations.
 */

import { Destination } from '../types/destination';
import { UserPreferences, TravelInterest } from '../types/profile';
import { FEATURED_DESTINATIONS } from '../data/destinations';

export interface ScoredDestination extends Destination {
  matchScore: number;
  matchReason: string;
  isSaved?: boolean;
}

const INTEREST_TAG_MAPPING: Record<TravelInterest, string[]> = {
  food: ['Food', 'Gastronomy', 'Culinary', 'Dining'],
  mountains: ['Mountains', 'Alps', 'Glacial', 'Highlands'],
  beaches: ['Beaches', 'Coast', 'Islands', 'Coastal'],
  history: ['History', 'Heritage', 'Ancient', 'Monuments'],
  art: ['Art', 'Museums', 'Galleries', 'Culture'],
  nature: ['Nature', 'Sanctuary', 'Lakes', 'Wilderness'],
  adventure: ['Adventure', 'Outdoor', 'Trekking', 'Sports'],
  photography: ['Photography', 'Sunsets', 'Scenery', 'Vistas'],
  shopping: ['Shopping', 'Boutiques', 'Markets'],
  nightlife: ['Nightlife', 'Bars', 'Clubs', 'Evening'],
  spirituality: ['Spirituality', 'Temples', 'Wellness', 'Zen'],
  architecture: ['Architecture', 'Modernist', 'Gothic', 'Temples'],
};

export const recommendationService = {
  /**
   * Generates prioritized personalized recommendations based on onboarding preferences
   */
  getRecommendations(
    preferences?: UserPreferences | null,
    limit: number = 4
  ): ScoredDestination[] {
    const userInterests = preferences?.interests || ['nature', 'food', 'photography'];
    const travelStyle = preferences?.travelStyle || 'balanced';
    const personality = preferences?.travelPersonality || 'explorer';

    const scored = FEATURED_DESTINATIONS.map((dest) => {
      let score = 50; // base score
      const matchedReasons: string[] = [];

      // Check interests
      userInterests.forEach((interest) => {
        const relatedTags = INTEREST_TAG_MAPPING[interest] || [];
        const hasDirectMatch = dest.tags.some((tag) =>
          relatedTags.some((rt) => rt.toLowerCase() === tag.toLowerCase()) ||
          tag.toLowerCase() === interest.toLowerCase()
        );

        if (hasDirectMatch) {
          score += 15;
          matchedReasons.push(interest.charAt(0).toUpperCase() + interest.slice(1));
        }
      });

      // Check style match
      if (dest.tags.some((t) => t.toLowerCase() === travelStyle.toLowerCase())) {
        score += 10;
      }

      // Check personality match
      if (personality === 'foodie' && dest.tags.includes('Food')) score += 15;
      if (personality === 'adventure_seeker' && dest.tags.includes('Adventure')) score += 15;
      if (personality === 'culture_lover' && (dest.tags.includes('Culture') || dest.tags.includes('History'))) score += 15;
      if (personality === 'relaxer' && (dest.tags.includes('Relaxed') || dest.tags.includes('Beaches'))) score += 15;
      if (personality === 'photographer' && dest.tags.includes('Photography')) score += 15;
      if (personality === 'explorer' && dest.tags.includes('Nature')) score += 12;

      // Add a slight rating weight
      score += Math.round(dest.rating * 4);

      // Clamp score to 99% max
      const finalScore = Math.min(99, Math.max(72, score));

      // Build humanized match reason
      let matchReason = '';
      if (matchedReasons.length >= 2) {
        matchReason = `Matches your love for ${matchedReasons.slice(0, 2).join(' & ')}`;
      } else if (matchedReasons.length === 1) {
        matchReason = `Ideal for your ${matchedReasons[0]} exploration`;
      } else {
        matchReason = `Top match for ${dest.bestFor.toLowerCase()}`;
      }

      return {
        ...dest,
        matchScore: finalScore,
        matchReason,
      };
    });

    // Separate domestic (India) and international for intelligent balanced mix
    const domestic = scored.filter((d) => d.country.toLowerCase() === 'india' || d.isDomestic);
    const international = scored.filter((d) => d.country.toLowerCase() !== 'india' && !d.isDomestic);

    // Sort both descending by score
    domestic.sort((a, b) => b.matchScore - a.matchScore || b.rating - a.rating);
    international.sort((a, b) => b.matchScore - a.matchScore || b.rating - a.rating);

    // If requesting 4 items, present 2 domestic and 2 international (or balanced proportion)
    const result: ScoredDestination[] = [];
    const targetDomestic = Math.floor(limit / 2);
    const targetInternational = limit - targetDomestic;

    result.push(...domestic.slice(0, targetDomestic));
    result.push(...international.slice(0, targetInternational));

    // If either ran out, fill from the other
    if (result.length < limit) {
      const remainingNeeded = limit - result.length;
      const alreadyIds = new Set(result.map((r) => r.id));
      const leftovers = scored
        .filter((s) => !alreadyIds.has(s.id))
        .sort((a, b) => b.matchScore - a.matchScore);
      result.push(...leftovers.slice(0, remainingNeeded));
    }

    // Sort final result by match score
    result.sort((a, b) => b.matchScore - a.matchScore);

    return result;
  },

  /**
   * Search and filter all destinations by query term
   */
  searchDestinations(query: string): Destination[] {
    if (!query.trim()) return FEATURED_DESTINATIONS;
    const q = query.toLowerCase().trim();

    return FEATURED_DESTINATIONS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        (d.region && d.region.toLowerCase().includes(q)) ||
        d.shortDescription.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q)) ||
        d.bestFor.toLowerCase().includes(q)
    );
  },
};

