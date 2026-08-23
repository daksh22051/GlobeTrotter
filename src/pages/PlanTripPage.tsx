import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Sparkles,
  Compass,
  CheckCircle,
  RotateCcw,
  X,
} from 'lucide-react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { tripService } from '../services/tripService';
import { User } from '../types';
import { CurrencyCode, BudgetStyle, TravelStyle } from '../types/profile';
import { Trip, TripType, TransportPreference, AccommodationStyle, TripPlannerDraft, TripCity } from '../types/trip';
import { TripProgress } from '../components/trip-planner/TripProgress';
import { BasicDetailsStep } from '../components/trip-planner/BasicDetailsStep';
import { PreferencesStep } from '../components/trip-planner/PreferencesStep';
import { InterestsStep } from '../components/trip-planner/InterestsStep';
import { ReviewStep } from '../components/trip-planner/ReviewStep';
import { TripSummary } from '../components/trip-planner/TripSummary';
import { TripSuccess } from '../components/trip-planner/TripSuccess';
import { LeavePlannerModal } from '../components/trip-planner/LeavePlannerModal';
import { FEATURED_DESTINATIONS } from '../data/destinations';
import { buildTripRecommendations } from '../utils/recommendationMatcher';
import { itineraryService } from '../services/itineraryService';

const getCurrencyForCountry = (country: string): CurrencyCode => {
  const normalizedCountry = country.toLowerCase();
  if (normalizedCountry === 'india') return 'INR';
  if (normalizedCountry.includes('japan')) return 'JPY';
  if (normalizedCountry.includes('uae') || normalizedCountry.includes('emirates')) return 'AED';
  if (normalizedCountry.includes('united kingdom') || normalizedCountry.includes('britain')) return 'GBP';
  if (normalizedCountry.includes('australia')) return 'AUD';
  if (normalizedCountry.includes('canada')) return 'CAD';
  if (normalizedCountry.includes('singapore')) return 'SGD';
  if (['france', 'italy', 'spain', 'germany', 'netherlands', 'greece'].some((countryName) => normalizedCountry.includes(countryName))) return 'EUR';
  return 'USD';
};

export const PlanTripPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefersReducedMotion = useReducedMotion();

  // Current authenticated user
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getCurrentUser());
  const userId = currentUser?.id || 'guest';

  // Planning State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxAccessibleStep, setMaxAccessibleStep] = useState<number>(1);

  // Form Fields
  const [name, setName] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [destinationImage, setDestinationImage] = useState<string>('');
  const [destinationId, setDestinationId] = useState<string>('');
  const [cities, setCities] = useState<TripCity[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [arrivalLocation, setArrivalLocation] = useState<string>('');
  const [arrivalTime, setArrivalTime] = useState<string>('');
  const [adultsCount, setAdultsCount] = useState<number>(2);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [tripType, setTripType] = useState<TripType>('leisure');

  const [budget, setBudget] = useState<number>(50000);
  const [isBudgetConfigured, setIsBudgetConfigured] = useState(false);
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [budgetStyle, setBudgetStyle] = useState<BudgetStyle>('balanced');
  const [travelPace, setTravelPace] = useState<TravelStyle>('balanced');
  const [transportPreferences, setTransportPreferences] = useState<TransportPreference[]>(['flights']);
  const [accommodationStyle, setAccommodationStyle] = useState<AccommodationStyle>('boutique_hotel');

  const [interests, setInterests] = useState<string[]>(['Food', 'Culture', 'Nature']);
  const [notes, setNotes] = useState<string>('');

  // Status & Validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdTrip, setCreatedTrip] = useState<Trip | null>(null);
  const [hasRestoredDraft, setHasRestoredDraft] = useState<boolean>(false);
  const [draftToast, setDraftToast] = useState<string | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);

  const destQuery = searchParams.get('dest');
  const isQuickTrip = searchParams.get('quick') === '1' && Boolean(destQuery);

  // Initialize from destination query param or preferences/draft
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    setCurrentUser(user);

    const userPrefs = profileService.getPreferences(user.id);

    // Check if query param pre-fills destination (e.g. from Dashboard explore links: /plan-trip?dest=Tokyo)
    if (destQuery) {
      const match = FEATURED_DESTINATIONS.find(
        (d) => d.name.toLowerCase() === destQuery.toLowerCase() || d.id === destQuery
      );
      if (match) {
        const defaultDurationDays = 4;
        const defaultStartDate = new Date();
        const defaultEndDate = new Date(defaultStartDate);
        defaultEndDate.setDate(defaultStartDate.getDate() + defaultDurationDays - 1);
        const popularityMultiplier = 1 + Math.max(0, match.rating - 4.5) * 0.1;
        const costMultiplier = match.costIndex === 'Budget' ? 0.9 : match.costIndex === 'Luxury' ? 1.25 : 1;

        setDestination(match.name);
        setCountry(match.country);
        setCurrency(getCurrencyForCountry(match.country));
        setDestinationImage(match.imageUrl || match.image);
        setDestinationId(match.id);
        setName(`${match.name} Getaway`);
        if (isQuickTrip) {
          setStartDate(defaultStartDate.toISOString().split('T')[0]);
          setEndDate(defaultEndDate.toISOString().split('T')[0]);
          setBudget(Math.round(match.estimatedDailyBudget * defaultDurationDays * 2 * popularityMultiplier * costMultiplier));
          setIsBudgetConfigured(true);
          setInterests(match.tags.slice(0, 3));
          setCities([{
            cityName: match.name,
            country: match.country,
            orderIndex: 0,
            stayDurationDays: defaultDurationDays,
            latitude: match.coordinates?.latitude,
            longitude: match.coordinates?.longitude,
          }]);
        }
      }
    }

    // Check for saved draft
    const savedDraft = tripService.getDraft(user.id);
    if (savedDraft && !destQuery) {
      if (savedDraft.name) setName(savedDraft.name);
      if (savedDraft.destination) setDestination(savedDraft.destination);
      if (savedDraft.country) setCountry(savedDraft.country);
      if (savedDraft.destinationImage) setDestinationImage(savedDraft.destinationImage);
      if (savedDraft.destinationId) setDestinationId(savedDraft.destinationId);
      if (savedDraft.cities && savedDraft.cities.length > 0) setCities(savedDraft.cities);
      if (savedDraft.startDate) setStartDate(savedDraft.startDate);
      if (savedDraft.endDate) setEndDate(savedDraft.endDate);
      if (savedDraft.arrivalLocation) setArrivalLocation(savedDraft.arrivalLocation);
      if (savedDraft.arrivalTime) setArrivalTime(savedDraft.arrivalTime);
      if (savedDraft.adultsCount) setAdultsCount(savedDraft.adultsCount);
      if (savedDraft.childrenCount !== undefined) setChildrenCount(savedDraft.childrenCount);
      if (savedDraft.tripType) setTripType(savedDraft.tripType);
      if (savedDraft.budget) setBudget(savedDraft.budget);
      if (savedDraft.budget) setIsBudgetConfigured(true);
      if (savedDraft.currency) setCurrency(savedDraft.currency);
      if (savedDraft.budgetStyle) setBudgetStyle(savedDraft.budgetStyle);
      if (savedDraft.travelPace) setTravelPace(savedDraft.travelPace);
      if (savedDraft.transportPreferences && savedDraft.transportPreferences.length > 0) {
        setTransportPreferences(savedDraft.transportPreferences.slice(0, 1));
      } else {
        setTransportPreferences(['flights']);
      }
      if (savedDraft.accommodationStyle) setAccommodationStyle(savedDraft.accommodationStyle);
      if (savedDraft.interests && savedDraft.interests.length > 0) setInterests(savedDraft.interests);
      if (savedDraft.notes) setNotes(savedDraft.notes);
      if (savedDraft.currentStep) {
        setCurrentStep(savedDraft.currentStep);
        setMaxAccessibleStep(Math.max(1, savedDraft.currentStep));
      }
      setHasRestoredDraft(true);
    } else if (userPrefs) {
      // Pre-fill from profile preferences
      if (userPrefs.currency) setCurrency(userPrefs.currency);
      if (userPrefs.interests && userPrefs.interests.length > 0) setInterests(userPrefs.interests);
      if (userPrefs.budgetStyle) setBudgetStyle(userPrefs.budgetStyle as BudgetStyle);
      if (userPrefs.travelStyle) setTravelPace(userPrefs.travelStyle as TravelStyle);
    }
  }, [navigate, destQuery, isQuickTrip]);

  // Handle draft toast timeout
  useEffect(() => {
    if (draftToast) {
      const timer = setTimeout(() => setDraftToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [draftToast]);

  // Current draft object builder
  const buildCurrentDraft = useCallback((): TripPlannerDraft => {
    return {
      currentStep,
      name,
      destination,
      country,
      destinationImage,
      destinationId,
      cities,
      startDate,
      endDate,
      arrivalLocation,
      arrivalTime,
      adultsCount,
      childrenCount,
      tripType,
      budget,
      currency,
      budgetStyle: budgetStyle || 'balanced',
      travelPace: travelPace || 'balanced',
      transportPreferences,
      accommodationStyle: accommodationStyle || 'boutique_hotel',
      interests,
      notes,
      updatedAt: new Date().toISOString(),
    };
  }, [
    currentStep,
    name,
    destination,
    country,
    destinationImage,
    destinationId,
    cities,
    startDate,
    endDate,
    arrivalLocation,
    arrivalTime,
    adultsCount,
    childrenCount,
    tripType,
    budget,
    currency,
    budgetStyle,
    travelPace,
    transportPreferences,
    accommodationStyle,
    interests,
    notes,
  ]);

  // Save draft manually or on finish later
  const handleSaveDraft = (showToast = true) => {
    const draft = buildCurrentDraft();
    tripService.saveDraft(userId, draft);
    if (showToast) {
      setDraftToast('Trip draft saved successfully.');
    }
  };

  // Clear draft
  const handleClearDraft = () => {
    tripService.clearDraft(userId);
    setHasRestoredDraft(false);
    setDraftToast('Draft cleared.');
  };

  // Validation logic per step
  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!name.trim() || name.trim().length < 2) {
        newErrors.name = 'Give your trip a memorable name (at least 2 characters).';
      }
      if (!destination.trim()) {
        newErrors.destination = 'Please choose or search a destination city or country.';
      }
      if (!startDate) {
        newErrors.dates = 'Please select your departure / start date.';
      } else if (!endDate) {
        newErrors.dates = 'Please select your return / end date.';
      } else if (new Date(endDate) < new Date(startDate)) {
        newErrors.dates = 'Return date cannot be earlier than start date.';
      }
    } else if (stepNumber === 2) {
      if (budget <= 0) {
        newErrors.budget = 'Please set a budget for your trip.';
      }
    } else if (stepNumber === 3) {
      if (interests.length === 0) {
        newErrors.interests = 'Please select at least 1 interest or highlight.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step advancement
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setErrors({});
      const next = currentStep + 1;
      setCurrentStep(next);
      setMaxAccessibleStep((prev) => Math.max(prev, next));
      // Auto-save draft on step transition
      tripService.saveDraft(userId, { ...buildCurrentDraft(), currentStep: next });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setErrors({});
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = (step: number) => {
    if (step < currentStep || validateStep(currentStep)) {
      setErrors({});
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Final Trip Creation
  const handleCreateTrip = () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      setDraftToast('Please review required trip details.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(async () => {
      try {
        const totalTravelers = adultsCount + childrenCount;
        
        // Calculate date display & duration
        const s = new Date(startDate);
        const e = new Date(endDate);
        const diffDays = Math.max(1, Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
        const dateDisplay = `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

        const newTrip = await tripService.createTrip({
          name: name.trim(),
          destination: destination.trim(),
          country: country.trim() || 'Global Destination',
          coverImage: destinationImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=85',
          startDate,
          endDate,
          arrivalLocation: arrivalLocation.trim() || undefined,
          arrivalTime: arrivalTime || undefined,
          dateDisplay,
          durationDays: diffDays,
          travelersCount: totalTravelers,
          adultsCount,
          childrenCount,
          tripType,
          budget,
          currency,
          budgetStyle: budgetStyle || 'balanced',
          travelPace: travelPace || 'balanced',
          transportPreferences,
          accommodationStyle: accommodationStyle || 'boutique_hotel',
          interests,
          cities: cities.length > 0 ? cities : [
            { cityName: destination.trim(), country: country.trim(), orderIndex: 0, stayDurationDays: diffDays }
          ],
          notes: notes.trim() || undefined,
          status: 'planning',
        }, userId);

        // Clear draft on successful creation
        tripService.clearDraft(userId);
        setCreatedTrip(newTrip);
        itineraryService.getItinerary(newTrip.id, newTrip);
        navigate(`/trip/${newTrip.id}/itinerary`);
      } catch (err) {
        console.error('Error creating trip:', err);
        setDraftToast('We could not save your trip. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }, 600);
  };

  const handleBuildAIItinerary = () => {
    if (!createdTrip) return;
    itineraryService.getItinerary(createdTrip.id, createdTrip);
    navigate(`/trip/${createdTrip.id}/itinerary`);
  };

  // Exit handlers
  const handleExitClick = () => {
    // If user has entered any data and is not on success screen, show confirmation modal
    if (currentStep < 5 && (name || destination || startDate)) {
      setShowLeaveModal(true);
    } else {
      navigate('/dashboard');
    }
  };

  const handleSaveDraftAndExit = () => {
    handleSaveDraft(false);
    setShowLeaveModal(false);
    navigate('/dashboard');
  };

  const handleDiscardAndExit = () => {
    tripService.clearDraft(userId);
    setShowLeaveModal(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen w-full bg-[#FFFDF8] text-[#17201D] antialiased flex flex-col relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 map-contour-bg opacity-70" />
      {/* 1. Planner Top Header */}
      <header
        id="planner-header"
        className="sticky top-0 z-30 bg-[#FFFDF8]/85 backdrop-blur-xl border-b border-[#EAE6DD]/80 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all"
      >
        {/* Left: Back / Exit & Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExitClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold text-[#4A5551] hover:text-[#17201D] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Exit</span>
          </button>

          <div className="h-4 w-px bg-[#EAE6DD] hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#17201D] text-white flex items-center justify-center shadow-sm">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-black tracking-tight text-[#17201D] block">Trip Planner</span>
              <span className="text-[10px] text-[#838F8B] font-medium block">Shape your next story</span>
            </div>
          </div>
        </div>

        {/* Center: Current step label on mobile */}
        {currentStep <= 4 && (
          <div className="sm:hidden text-xs font-black text-[#FF6B4A]">
            Step 0{currentStep}/04
          </div>
        )}

        {/* Right: Save & Finish Later */}
        {currentStep <= 4 && (
          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              onClick={() => handleSaveDraft(true)}
              whileHover={prefersReducedMotion ? undefined : { scale: 1.03, y: -1 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFF8F5] hover:bg-[#FFF1EC] text-[#FF6B4A] text-xs font-bold border border-[#FFD9CE] transition-colors cursor-pointer"
              title="Save draft and continue later"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </motion.button>
          </div>
        )}
      </header>

      {/* 2. Draft Restored Banner */}
      {hasRestoredDraft && currentStep <= 4 && (
        <div className="bg-[#FFF9F6] border-b border-[#FFD9CE] px-4 py-2 text-xs text-[#8C341F] flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-2xl mx-auto w-full justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <Bookmark className="w-3.5 h-3.5 text-[#FF6B4A]" />
              <span>Draft loaded from your previous session.</span>
            </span>
            <button
              type="button"
              onClick={handleClearDraft}
              className="text-[11px] font-bold text-[#E55837] hover:underline cursor-pointer ml-3 shrink-0"
            >
              Clear Draft
            </button>
          </div>
        </div>
      )}

      {/* 3. Draft Toast Alert */}
      <AnimatePresence>
        {draftToast && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#17201D] text-white text-xs font-bold shadow-lg flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-[#20B8A6]" />
            <span>{draftToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Main Planner Workspace */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {currentStep === 5 && createdTrip ? (
          /* Step 5: Trip Created Success View */
          <TripSuccess
            trip={createdTrip}
            recommendations={buildTripRecommendations(createdTrip, profileService.getPreferences(userId))}
            onBuildAIItinerary={handleBuildAIItinerary}
          />
        ) : (
          <div className="space-y-8">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-1">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#FF6B4A] mb-2">Your next chapter</p>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#17201D]">Plan a trip worth remembering.</h1>
                <p className="text-sm text-[#68736F] mt-2 max-w-xl">Tell us the essentials, and we&apos;ll turn your ideas into a thoughtful route with room for discovery.</p>
              </div>
              <div className="flex items-center gap-3 self-start sm:self-auto px-3.5 py-2.5 rounded-2xl bg-white/75 border border-[#EAE6DD] shadow-2xs">
                <div className="relative w-9 h-9 flex items-center justify-center">
                  <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#F4F1EA" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#FF6B4A" strokeWidth="3" strokeDasharray={`${(currentStep / 4) * 94} 94`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-[10px] font-black text-[#17201D]">{currentStep}/4</span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#838F8B]">Planning progress</p>
                  <p className="text-xs font-extrabold text-[#17201D]">{currentStep === 1 ? 'Start with the essentials' : currentStep === 2 ? 'Set your travel rhythm' : currentStep === 3 ? 'Add your inspiration' : 'Ready to create'}</p>
                </div>
              </div>
            </div>
            {/* Top Stepper Indicator */}
            {!isQuickTrip && (
              <div className="max-w-xl mx-auto mb-6">
                <TripProgress
                  currentStep={currentStep}
                  totalSteps={4}
                  onStepClick={handleStepClick}
                  maxAccessibleStep={maxAccessibleStep}
                />
              </div>
            )}

            {/* 2-Column Responsive Layout */}
            <motion.div
              key={`planner-step-${currentStep}`}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Left Column: Interactive Form Steps (7 or 8 cols on lg) */}
              <div className="lg:col-span-7 xl:col-span-8 bg-white/95 rounded-[2rem] p-6 sm:p-8 lg:p-10 border border-[#EAE6DD] shadow-[0_18px_55px_rgba(23,32,29,0.07)]">
                {/* Step 1: Basic Details */}
                {currentStep === 1 && (
                  <BasicDetailsStep
                    name={name}
                    destination={destination}
                    country={country}
                    destinationImage={destinationImage}
                    cities={cities}
                    startDate={startDate}
                    endDate={endDate}
                    arrivalLocation={arrivalLocation}
                    arrivalTime={arrivalTime}
                    adultsCount={adultsCount}
                    childrenCount={childrenCount}
                    tripType={tripType}
                    errors={errors}
                    onUpdate={(updates) => {
                      if (updates.name !== undefined) setName(updates.name);
                      if (updates.destination !== undefined) setDestination(updates.destination);
                      if (updates.country !== undefined) {
                        setCountry(updates.country);
                        setCurrency(getCurrencyForCountry(updates.country));
                      }
                      if (updates.destinationImage !== undefined) setDestinationImage(updates.destinationImage);
                      if (updates.destinationId !== undefined) setDestinationId(updates.destinationId);
                      if (updates.cities !== undefined) setCities(updates.cities);
                      if (updates.startDate !== undefined) setStartDate(updates.startDate);
                      if (updates.endDate !== undefined) setEndDate(updates.endDate);
                      if (updates.arrivalLocation !== undefined) setArrivalLocation(updates.arrivalLocation);
                      if (updates.arrivalTime !== undefined) setArrivalTime(updates.arrivalTime);
                      if (updates.adultsCount !== undefined) setAdultsCount(updates.adultsCount);
                      if (updates.childrenCount !== undefined) setChildrenCount(updates.childrenCount);
                      if (updates.tripType !== undefined) setTripType(updates.tripType);
                    }}
                  />
                )}

                {/* Step 2: Preferences */}
                {currentStep === 2 && (
                  <PreferencesStep
                    budget={budget}
                    currency={currency}
                    budgetStyle={budgetStyle}
                    travelPace={travelPace}
                    transportPreferences={transportPreferences}
                    accommodationStyle={accommodationStyle}
                    onUpdate={(updates) => {
                      if (updates.budget !== undefined) {
                        setBudget(updates.budget);
                        setIsBudgetConfigured(true);
                      }
                      if (updates.currency !== undefined) setCurrency(updates.currency);
                      if (updates.budgetStyle !== undefined) setBudgetStyle(updates.budgetStyle);
                      if (updates.travelPace !== undefined) setTravelPace(updates.travelPace);
                      if (updates.transportPreferences !== undefined) setTransportPreferences(updates.transportPreferences);
                      if (updates.accommodationStyle !== undefined) setAccommodationStyle(updates.accommodationStyle);
                    }}
                  />
                )}

                {/* Step 3: Interests & Style */}
                {currentStep === 3 && (
                  <InterestsStep
                    interests={interests}
                    notes={notes}
                    error={errors.interests}
                    onUpdate={(updates) => {
                      if (updates.interests !== undefined) setInterests(updates.interests);
                      if (updates.notes !== undefined) setNotes(updates.notes);
                    }}
                  />
                )}

                {/* Step 4: Review Trip */}
                {currentStep === 4 && (
                  <ReviewStep
                    name={name}
                    destination={destination}
                    country={country}
                    destinationImage={destinationImage}
                    startDate={startDate}
                    endDate={endDate}
                    adultsCount={adultsCount}
                    childrenCount={childrenCount}
                    tripType={tripType}
                    budget={budget}
                    currency={currency}
                    budgetStyle={budgetStyle}
                    travelPace={travelPace}
                    transportPreferences={transportPreferences}
                    accommodationStyle={accommodationStyle}
                    interests={interests}
                    notes={notes}
                    isSubmitting={isSubmitting}
                    onGoToStep={handleStepClick}
                    onSubmit={handleCreateTrip}
                  />
                )}

                {/* Bottom Navigation Buttons (Steps 1 to 3) */}
                {currentStep <= 3 && (
                  <div className="pt-8 mt-8 border-t border-[#F4F1EA] flex items-center justify-between gap-4">
                    {currentStep > 1 ? (
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="py-3 px-5 rounded-full bg-white hover:bg-[#F9F7F1] text-[#4A5551] text-xs sm:text-sm font-bold border border-[#EAE6DD] transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </button>
                    ) : (
                      <div />
                    )}

                    <motion.button
                      type="button"
                      onClick={isQuickTrip ? handleCreateTrip : handleNextStep}
                      disabled={isSubmitting}
                      whileHover={prefersReducedMotion ? undefined : { scale: 1.02, y: -2 }}
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                      className="py-3.5 px-7 rounded-full bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs sm:text-sm font-extrabold shadow-sm shadow-[#FF6B4A]/25 hover:shadow-md hover:shadow-[#FF6B4A]/30 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer ml-auto"
                    >
                      <span>{isQuickTrip ? (isSubmitting ? 'Creating...' : 'Create Quick Trip') : 'Continue'}</span>
                      {isQuickTrip ? <Sparkles className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Right Column: Live Sticky Summary Panel (5 or 4 cols on lg) */}
              <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-20">
                <TripSummary
                  name={name}
                  destination={destination}
                  country={country}
                  destinationImage={destinationImage}
                  startDate={startDate}
                  endDate={endDate}
                  adultsCount={adultsCount}
                  childrenCount={childrenCount}
                  tripType={tripType}
                  budget={budget}
                  currency={currency}
                  budgetStyle={budgetStyle}
                  travelPace={travelPace}
                  transportPreferences={transportPreferences}
                  accommodationStyle={accommodationStyle}
                  interests={interests}
                  destinationId={destinationId}
                  isBudgetConfigured={isBudgetConfigured}
                />
              </div>
            </motion.div>
          </div>
        )}
      </main>

      {/* 5. Leave Planner Modal */}
      <LeavePlannerModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onSaveDraftAndLeave={handleSaveDraftAndExit}
        onDiscardAndLeave={handleDiscardAndExit}
      />
    </div>
  );
};
