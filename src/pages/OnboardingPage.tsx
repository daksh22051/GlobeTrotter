import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { UserPreferences, TravelInterest, TravelStyle, BudgetStyle, CurrencyCode, TravelCompanion, TravelPersonality } from '../types/profile';
import { profileService, DEFAULT_PREFERENCES } from '../services/profileService';
import { authService } from '../services/authService';
import { TRAVEL_IMAGES } from '../assets/images';
import { OnboardingProgress } from '../components/onboarding/OnboardingProgress';
import { StepInterests } from '../components/onboarding/StepInterests';
import { StepTravelStyle } from '../components/onboarding/StepTravelStyle';
import { StepBudget } from '../components/onboarding/StepBudget';
import { StepCurrencyCompanion } from '../components/onboarding/StepCurrencyCompanion';
import { StepPersonality } from '../components/onboarding/StepPersonality';
import { StepReview } from '../components/onboarding/StepReview';
import { ArrowLeft, ArrowRight, Compass, Sparkles, MapPin } from 'lucide-react';

const STEP_VISUALS = [
  {
    step: 1,
    image: TRAVEL_IMAGES.onboardingInterests,
    location: 'Lisbon, Portugal',
    quote: 'The world is a book and those who do not travel read only one page.',
    tip: 'Select at least one interest to kickstart personalized curations.',
  },
  {
    step: 2,
    image: TRAVEL_IMAGES.onboardingStyle,
    location: 'Dolomites, Italy',
    quote: 'Travel isn’t always about checking boxes; it’s about savoring the rhythm.',
    tip: 'Your travel pace shapes the density of day-by-day itineraries.',
  },
  {
    step: 3,
    image: TRAVEL_IMAGES.onboardingBudget,
    location: 'Bali, Indonesia',
    quote: 'Smart spending leads to richer journeys and unforgettable moments.',
    tip: 'GlobeTrotter finds hidden gems across every spend bracket.',
  },
  {
    step: 4,
    image: TRAVEL_IMAGES.onboardingPreferences,
    location: 'Amalfi Coast, Italy',
    quote: 'A journey is best measured in friends rather than miles.',
    tip: 'We adjust hotel layouts and route timings based on your crew.',
  },
  {
    step: 5,
    image: TRAVEL_IMAGES.onboardingPersonality,
    location: 'Banff National Park, Canada',
    quote: 'Discovering who you are begins when you leave your doorstep.',
    tip: 'Your archetype helps our AI match you with resonant destinations.',
  },
];

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser] = useState<User | null>(() => authService.getCurrentUser());

  // Load existing preferences or initialize default with currency synced
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const existing = profileService.getPreferences(currentUser?.id);
    if (existing) {
      return {
        ...existing,
        currency: (currentUser?.preferredCurrency as CurrencyCode) || existing.currency,
      };
    }
    const def = profileService.getDefaultPreferences(currentUser?.id);
    if (currentUser?.preferredCurrency) {
      def.currency = currentUser.preferredCurrency as CurrencyCode;
    }
    return def;
  });

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  // Persist draft changes on every step update
  const updatePreferenceDraft = (updates: Partial<UserPreferences>) => {
    setError(null);
    setPreferences((prev) => {
      const next = { ...prev, ...updates };
      profileService.savePreferences(next);
      return next;
    });
  };

  // Step Validation logic
  const validateCurrentStep = (step: number): boolean => {
    setError(null);
    if (step === 1) {
      if (!preferences.interests || preferences.interests.length === 0) {
        setError('Please select at least one travel interest to continue.');
        return false;
      }
    } else if (step === 2) {
      if (!preferences.travelStyle) {
        setError('Please choose your preferred travel pace.');
        return false;
      }
    } else if (step === 3) {
      if (!preferences.budget || preferences.budget <= 0) {
        setError('Please choose a valid travel budget.');
        return false;
      }
      if (!preferences.budgetStyle) {
        setError('Please choose your spend style.');
        return false;
      }
    } else if (step === 4) {
      if (!preferences.currency) {
        setError('Please select your preferred currency.');
        return false;
      }
      if (!preferences.travelCompanion) {
        setError('Please select who you usually travel with.');
        return false;
      }
    } else if (step === 5) {
      if (!preferences.travelPersonality) {
        setError('Please select your travel personality archetype.');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateCurrentStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSkip = () => {
    // Save draft preferences with isComplete: false and navigate to /dashboard
    profileService.savePreferences({
      ...preferences,
      isComplete: false,
    });
    navigate('/dashboard');
  };

  const handleFinishOnboarding = () => {
    // Save finalized preferences
    profileService.savePreferences({
      ...preferences,
      isComplete: true,
    });
    navigate('/dashboard');
  };

  const currentVisual = STEP_VISUALS[Math.min(currentStep, 5) - 1] || STEP_VISUALS[0];

  return (
    <div className="min-h-screen w-full bg-[#FFFDF8] text-[#17201D] flex flex-col font-sans selection:bg-[#FF6B4A]/20">
      {/* Top Navbar */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-[#EAE6DD] sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF6B4A] to-[#FF9F1C] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <span className="text-lg font-black tracking-tight text-[#17201D]">
            Globe<span className="text-[#FF6B4A]">Trotter</span>
          </span>
        </div>

        {/* Center Subtitle for larger screens */}
        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-[#68736F] bg-[#F4EFE6] px-3.5 py-1.5 rounded-full border border-[#EAE6DD]">
          <Sparkles className="w-3.5 h-3.5 text-[#FF6B4A]" />
          <span>Traveler Profile Onboarding</span>
          {currentUser?.name && (
            <span className="text-[#17201D] font-extrabold">• {currentUser.name}</span>
          )}
        </div>

        {/* Skip for Now Subtle CTA */}
        <div>
          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs font-bold text-[#68736F] hover:text-[#17201D] px-3 py-1.5 rounded-full border border-transparent hover:border-[#EAE6DD] hover:bg-[#F4EFE6] transition-all cursor-pointer"
            >
              Skip for now
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-xs font-bold text-[#FF6B4A] hover:underline cursor-pointer"
            >
              Restart Steps
            </button>
          )}
        </div>
      </header>

      {/* Main Layout Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
        {/* Top Progress Stepper (01 ──── 02 ──── 03 ──── 04 ──── 05) */}
        {currentStep <= 5 && (
          <OnboardingProgress
            currentStep={currentStep}
            totalSteps={5}
            onStepClick={(step) => {
              if (step < currentStep || validateCurrentStep(currentStep)) {
                setCurrentStep(step);
              }
            }}
            allowStepClick={true}
          />
        )}

        {/* Step Content Area */}
        <div className="flex-1 flex flex-col justify-center my-2 sm:my-4">
          {currentStep <= 5 ? (
            /* Split 2-Panel Composition for Steps 1-5 */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Side: Travel Inspiration Visual Panel (Desktop) */}
              <div className="hidden lg:block lg:col-span-4 sticky top-24">
                <div className="relative rounded-3xl overflow-hidden shadow-lg border border-[#EAE6DD] group h-[520px]">
                  <img
                    src={currentVisual.image}
                    alt={currentVisual.location}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#17201D]/90 via-[#17201D]/30 to-transparent" />

                  {/* Top Badge */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/85 backdrop-blur-md text-[#17201D] text-xs font-bold shadow-sm">
                      <MapPin className="w-3.5 h-3.5 text-[#FF6B4A]" />
                      <span>{currentVisual.location}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#17201D]/50 backdrop-blur-md text-white flex items-center justify-center text-xs font-bold font-mono">
                      0{currentStep}
                    </div>
                  </div>

                  {/* Bottom Editorial Content */}
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <p className="text-sm font-medium italic text-white/90 leading-relaxed mb-3">
                      "{currentVisual.quote}"
                    </p>
                    <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#FFD166] mb-0.5">
                        💡 Traveler Tip
                      </div>
                      <p className="text-xs text-white/90 leading-snug">
                        {currentVisual.tip}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side: Interactive Step Form */}
              <div className="lg:col-span-8 bg-white/80 backdrop-blur-sm rounded-3xl p-5 sm:p-8 lg:p-10 border border-[#EAE6DD] shadow-sm flex flex-col justify-between min-h-[520px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="flex-1"
                  >
                    {currentStep === 1 && (
                      <StepInterests
                        selectedInterests={preferences.interests}
                        onChange={(interests: TravelInterest[]) =>
                          updatePreferenceDraft({ interests })
                        }
                        error={error}
                      />
                    )}

                    {currentStep === 2 && (
                      <StepTravelStyle
                        travelStyle={preferences.travelStyle}
                        pace={preferences.travelStylePace}
                        onStyleChange={(style: TravelStyle, pace: number) =>
                          updatePreferenceDraft({ travelStyle: style, travelStylePace: pace })
                        }
                        onPaceChange={(pace: number) =>
                          updatePreferenceDraft({ travelStylePace: pace })
                        }
                        error={error}
                      />
                    )}

                    {currentStep === 3 && (
                      <StepBudget
                        budget={preferences.budget}
                        budgetStyle={preferences.budgetStyle}
                        currency={preferences.currency}
                        onBudgetChange={(budget: number) => updatePreferenceDraft({ budget })}
                        onBudgetStyleChange={(budgetStyle: BudgetStyle) =>
                          updatePreferenceDraft({ budgetStyle })
                        }
                        error={error}
                      />
                    )}

                    {currentStep === 4 && (
                      <StepCurrencyCompanion
                        currency={preferences.currency}
                        companion={preferences.travelCompanion}
                        onCurrencyChange={(currency: CurrencyCode) =>
                          updatePreferenceDraft({ currency })
                        }
                        onCompanionChange={(travelCompanion: TravelCompanion) =>
                          updatePreferenceDraft({ travelCompanion })
                        }
                        error={error}
                      />
                    )}

                    {currentStep === 5 && (
                      <StepPersonality
                        personality={preferences.travelPersonality}
                        onPersonalityChange={(travelPersonality: TravelPersonality) =>
                          updatePreferenceDraft({ travelPersonality })
                        }
                        error={error}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Bottom Navigation Buttons */}
                <div className="mt-8 pt-5 border-t border-[#EAE6DD] flex items-center justify-between gap-4">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="flex items-center gap-2 px-5 py-3 rounded-full border border-[#EAE6DD] hover:border-[#17201D] text-[#17201D] text-sm font-bold transition-all cursor-pointer hover:bg-[#FDFBF7]"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#FF6B4A] hover:bg-[#E55837] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>{currentStep === 5 ? 'Review Profile' : 'Continue'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Centered Editorial Review Screen (Step 6) */
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto w-full bg-white rounded-3xl p-6 sm:p-10 border border-[#EAE6DD] shadow-sm"
            >
              <StepReview
                preferences={preferences}
                userName={currentUser?.name}
                onEditStep={(stepNum: number) => {
                  setCurrentStep(stepNum);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onFinish={handleFinishOnboarding}
              />
            </motion.div>
          )}
        </div>

        {/* Footer info note */}
        <footer className="mt-6 pt-4 border-t border-[#EAE6DD]/50 text-center text-xs text-[#8C9894] flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>GlobeTrotter Personalization Engine v1.0</span>
          <span>Your preferences dynamically configure future AI itineraries</span>
        </footer>
      </main>
    </div>
  );
};
