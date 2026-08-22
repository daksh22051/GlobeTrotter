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
  { id: '3', label: 'Balancing your days...', detail: 'Resolving schedule conflicts and creating leisurely pauses' },
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
    // Simulate realistic AI thought progression for hackathon WOW presentation
    for (let i = 0; i < AI_OPTIMIZATION_STEPS.length; i++) {
      if (onStepChange) {
        onStepChange(i);
      }
      await new Promise((resolve) => setTimeout(resolve, 450));
    }

    // Run deterministic engine
    const result = optimizeItineraryLocally(itinerary, trip);
    return result;
  },
};
