import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Share2,
  Calendar,
  Sparkles,
  MapPin,
  FileText,
  Printer,
  ChevronRight,
  AlertCircle,
  Edit3,
} from 'lucide-react';
import { travelGuideService } from '../services/travelGuideService';
import { TravelGuideData } from '../types/travelGuide';
import { GuideHero } from '../components/travel-guide/GuideHero';
import { GuideOverview } from '../components/travel-guide/GuideOverview';
import { GuideHighlights } from '../components/travel-guide/GuideHighlights';
import { GuideDay } from '../components/travel-guide/GuideDay';
import { GuidePlaces } from '../components/travel-guide/GuidePlaces';
import { GuideFood } from '../components/travel-guide/GuideFood';
import { GuideHotels } from '../components/travel-guide/GuideHotels';
import { GuideBudget } from '../components/travel-guide/GuideBudget';
import { PDFDownloadModal } from '../components/travel-guide/PDFDownloadModal';
import { ShareTripModal } from '../components/sharing/ShareTripModal';

export const TravelGuidePage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  const [guideData, setGuideData] = useState<TravelGuideData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // PDF Generation states
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [pdfStep, setPdfStep] = useState(1);
  const [pdfStepLabel, setPdfStepLabel] = useState('Preparing your travel guide...');
  const [isPDFReady, setIsPDFReady] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Share Modal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const loadGuide = () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!tripId) {
        setError('No trip specified.');
        setIsLoading(false);
        return;
      }
      const data = travelGuideService.getGuideData(tripId);
      if (!data) {
        setError('Trip not found or has been removed.');
      } else {
        setGuideData(data);
      }
    } catch (err) {
      console.error(err);
      setError('Could not load travel guide.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGuide();
  }, [tripId]);

  const handleStartPDFDownload = async () => {
    if (!tripId) return;
    setIsPDFModalOpen(true);
    setPdfStep(1);
    setPdfStepLabel('Preparing your travel guide...');
    setIsPDFReady(false);
    setPdfError(null);

    try {
      await travelGuideService.generatePDF(tripId, (step, label, isDone) => {
        setPdfStep(step);
        setPdfStepLabel(label);
        if (isDone) {
          setIsPDFReady(true);
        }
      });
    } catch (err: any) {
      setPdfError(err?.message || 'Failed to generate PDF');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex flex-col items-center justify-center p-6">
        <div className="max-w-4xl w-full space-y-6 animate-pulse">
          <div className="h-72 bg-[#F4F1EA] rounded-3xl" />
          <div className="h-24 bg-[#F4F1EA] rounded-3xl" />
          <div className="h-48 bg-[#F4F1EA] rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !guideData) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#EAE6DD] shadow-xs">
          <AlertCircle className="w-12 h-12 text-[#FF6B4A] mx-auto mb-3" />
          <h2 className="text-xl font-extrabold text-[#17201D] mb-1">{error || 'Guide Unavailable'}</h2>
          <p className="text-xs text-[#68736F] mb-6">
            We couldn't generate the guide for this trip. Check if the trip exists in your dashboard.
          </p>
          <button
            type="button"
            onClick={() => navigate('/trips')}
            className="w-full py-3 rounded-full bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Go to My Trips
          </button>
        </div>
      </div>
    );
  }

  const { trip, quickFacts, highlights, days, places, food, hotels, budgetSnapshot, categorySummaries, travelNotes } =
    guideData;

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#17201D] flex flex-col font-sans selection:bg-[#FF6B4A]/20">
      {/* Top Bar Navigation (Hidden in Print Mode) */}
      <header className="print:hidden sticky top-0 z-40 bg-[#FFFDF8]/90 backdrop-blur-md border-b border-[#EAE6DD] px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(`/trip/${trip.id}/itinerary`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#EAE6DD] text-[#5E6B67] hover:text-[#17201D] hover:border-[#17201D] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Itinerary</span>
          </button>

          <span className="hidden md:inline text-xs text-[#838F8B]">
            {trip.name} · Travel Magazine
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#EAE6DD] hover:border-[#17201D] text-[#17201D] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5 text-[#FF6B4A]" />
            <span>Share</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/trip/${trip.id}/itinerary`)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FCFBF8] border border-[#EAE6DD] hover:border-[#17201D] text-[#17201D] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#20B8A6]" />
            <span>Edit Trip</span>
          </button>

          <button
            type="button"
            onClick={handleStartPDFDownload}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </header>

      {/* Guide Content Magazine Layout */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12 print:p-0 print:m-0 print:max-w-none">
        {/* 1. Hero Cover */}
        <GuideHero trip={trip} />

        {/* 2. Overview & Quick Facts */}
        <GuideOverview
          quickFacts={quickFacts}
          travelNotes={travelNotes}
          destination={trip.destination}
        />

        {/* 3. Top Highlights */}
        <GuideHighlights highlights={highlights} />

        {/* 4. Day by Day Itinerary */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#17201D] tracking-tight">
              Day-by-Day Travel Program
            </h2>
            <p className="text-xs text-[#68736F] mt-0.5">
              Comprehensive schedule with timings, routes, and activities.
            </p>
          </div>

          <div className="space-y-6">
            {days.map((day) => (
              <GuideDay
                key={day.dayNumber}
                day={day}
                currency={trip.currency || 'INR'}
              />
            ))}
          </div>
        </section>

        {/* 5. Key Attractions */}
        <GuidePlaces places={places} currency={trip.currency || 'INR'} />

        {/* 6. Food & Dining */}
        <GuideFood food={food} currency={trip.currency || 'INR'} />

        {/* 7. Accommodations */}
        <GuideHotels hotels={hotels} currency={trip.currency || 'INR'} />

        {/* 8. Budget & Financial Matrix */}
        <GuideBudget
          budgetSnapshot={budgetSnapshot}
          categorySummaries={categorySummaries}
          currency={trip.currency || 'INR'}
          totalBudget={trip.budget || 50000}
        />

        {/* 9. Editorial Colophon / Footer */}
        <footer className="pt-8 pb-12 border-t border-[#EAE6DD] text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF6B4A]" />
            <span className="text-xs font-black uppercase tracking-widest text-[#17201D]">
              GlobeTrotter Travel Dossier
            </span>
            <span className="w-2 h-2 rounded-full bg-[#20B8A6]" />
          </div>
          <p className="text-xs text-[#838F8B]">
            Generated on {new Date(guideData.generatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} for {trip.destination}.
          </p>
        </footer>
      </main>

      {/* Modals */}
      <PDFDownloadModal
        isOpen={isPDFModalOpen}
        tripId={trip.id}
        tripName={trip.name}
        step={pdfStep}
        stepLabel={pdfStepLabel}
        isReady={isPDFReady}
        error={pdfError}
        onClose={() => setIsPDFModalOpen(false)}
        onRetry={handleStartPDFDownload}
      />

      <ShareTripModal
        isOpen={isShareModalOpen}
        trip={trip}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};
