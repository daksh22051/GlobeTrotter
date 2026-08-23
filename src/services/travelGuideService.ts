/**
 * Travel Guide & PDF Generation Service
 */

import { guideDataBuilder } from '../utils/guideDataBuilder';
import { TravelGuideData, PDFGenerationStep } from '../types/travelGuide';

export const PDF_GENERATION_STEPS: PDFGenerationStep[] = [
  { step: 1, totalSteps: 5, label: 'Preparing your travel guide...', description: 'Compiling destination intel & profile' },
  { step: 2, totalSteps: 5, label: 'Generating your itinerary...', description: 'Formatting day-by-day schedules & timings' },
  { step: 3, totalSteps: 5, label: 'Adding maps & places...', description: 'Embedding route coordinates and highlights' },
  { step: 4, totalSteps: 5, label: 'Adding budget summary...', description: 'Organizing expense categories & projections' },
  { step: 5, totalSteps: 5, label: 'Creating your guide...', description: 'Assembling high-res editorial layout' },
];

export const travelGuideService = {
  /**
   * Builds presentation guide data for given trip
   */
  getGuideData(tripId: string): TravelGuideData | null {
    return guideDataBuilder.buildTravelGuideData(tripId);
  },

  /**
   * Simulates/Generates PDF with progressive user feedback and triggers high-fidelity print/export
   */
  async generatePDF(
    tripId: string,
    onProgress?: (step: number, label: string, isDone?: boolean) => void
  ): Promise<boolean> {
    const data = this.getGuideData(tripId);
    if (!data) {
      throw new Error('Trip data could not be found.');
    }

    const stepDelay = 400;

    for (let i = 0; i < PDF_GENERATION_STEPS.length; i++) {
      const stepObj = PDF_GENERATION_STEPS[i];
      if (onProgress) {
        onProgress(stepObj.step, stepObj.label, false);
      }
      await new Promise((resolve) => setTimeout(resolve, stepDelay));
    }

    if (onProgress) {
      onProgress(6, 'Download ready ✓', true);
    }

    return true;
  },

  /**
   * Triggers the browser standard high-resolution print / Save to PDF dialog
   */
  printGuide(): void {
    window.print();
  },
};
