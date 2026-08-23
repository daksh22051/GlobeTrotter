/**
 * AI Itinerary Service
 * 
 * Orchestrates intelligent schedule optimization with asynchronous
 * visual reasoning steps, connecting local deterministic algorithms
 * and future Gemini AI pipelines.
 */

import { Itinerary, OptimizationResult } from '../types/itinerary';
import { Trip } from '../types/trip';
import { optimizeItineraryLocally } from './itineraryOptimizer';

export interface AIOptimizeProgressStep {
  id: string;
  label: string;
  detail: string;
}

export const AI_OPTIMIZATION_STEPS: AIOptimizeProgressStep[] = [
  { id: '1', label: 'Analyzing your itinerary...', detail: 'Evaluating activities, dates, and locations' },
  { id: '2', label: 'Checking travel times...', detail: 'Calculating optimal transit routes between neighborhoods' },
  { id: '3', label: 'Resolving conflicts...', detail: 'Adjusting timings and creating leisurely pauses' },
  { id: '4', label: 'Optimizing your schedule...', detail: 'Finalizing day timelines and meal timings' },
];

export const itineraryAIService = {
  /**
   * Optimizes the itinerary with AI reasoning feedback
   */
  async optimizeItinerary(
    itinerary: Itinerary,
    trip?: Trip,
    onStepChange?: (stepIndex: number) => void
  ): Promise<OptimizationResult> {
    // Keep simulation for visual flair
    for (let i = 0; i < AI_OPTIMIZATION_STEPS.length; i++) {
      if (onStepChange) {
        onStepChange(i);
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    try {
      const response = await fetch(`/api/itinerary/${itinerary.id}/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // The data contains a 'days' array with high-quality generated content
        // We now run the local optimizer on this new content to ensure timing/transit is perfect
        const aiItinerary: Itinerary = {
          ...itinerary,
          days: data.days,
          updatedAt: new Date().toISOString(),
        };

        const result = optimizeItineraryLocally(aiItinerary, trip);
        
        // Add a note about content optimization
        result.changes.unshift('Repetitive content replaced with diverse, destination-specific activities');
        result.summary = 'Your itinerary was fully transformed with unique, destination-specific content and intelligently sequenced for optimal pacing.';
        
        return result;
      }
    } catch (error) {
      console.error('AI Optimization failed, falling back to local engine:', error);
    }

    // Run deterministic engine as fallback
    const result = optimizeItineraryLocally(itinerary, trip);
    return result;
  },
};
