import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  RotateCcw,
  Sliders,
  CheckCircle2,
  HeartPulse,
  Calendar,
  Wallet,
  Compass,
} from 'lucide-react';
import { tripService } from '../services/tripService';
import { itineraryService } from '../services/itineraryService';
import { whatIfService } from '../services/whatIfService';
import { Trip } from '../types/trip';
import {
  WhatIfScenario,
  WhatIfSimulationResult,
  ScenarioPreset,
} from '../types/intelligence';

// Subcomponents
import { ScenarioControls } from '../components/what-if/ScenarioControls';
import { ScenarioComparison } from '../components/what-if/ScenarioComparison';
import { ScenarioAlternatives } from '../components/what-if/ScenarioAlternatives';
import { ApplyScenarioModal } from '../components/what-if/ApplyScenarioModal';
import { TravelAssistantFloatingLauncher } from '../components/ai-assistant/TravelAssistantFloatingLauncher';
import { TravelAssistantDrawer } from '../components/ai-assistant/TravelAssistantDrawer';
import { CurrencyCode } from '../types/profile';

export const WhatIfPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [scenario, setScenario] = useState<WhatIfScenario | null>(null);
  const [hasUndo, setHasUndo] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = () => {
    if (!tripId) return;
    const loadedTrip = tripService.getTripById(tripId);
    if (loadedTrip) {
      setTrip(loadedTrip);
      setScenario(whatIfService.getDefaultScenario(loadedTrip));
      setHasUndo(whatIfService.hasUndoSnapshot(tripId));
    }
  };

  useEffect(() => {
    loadData();
  }, [tripId]);

  // Compute Simulation Result dynamically
  const simulation: WhatIfSimulationResult | null = useMemo(() => {
    if (!trip || !scenario) return null;
    return whatIfService.simulateTrip(trip, scenario);
  }, [trip, scenario]);

  const handleSelectPreset = (preset: ScenarioPreset) => {
    if (!trip) return;
    const presetScenario = whatIfService.getPresetScenario(trip, preset);
    setScenario(presetScenario);
  };

  const handleReset = () => {
    if (!trip) return;
    setScenario(whatIfService.getDefaultScenario(trip));
  };

  const handleConfirmApply = () => {
    if (!simulation) return;
    const success = whatIfService.applyScenario(simulation);
    if (success) {
      setHasUndo(true);
      loadData();
      showToast('Scenario successfully applied to your active trip!');
    }
  };

  const handleUndo = () => {
    if (!tripId) return;
    const success = whatIfService.undoScenario(tripId);
    if (success) {
      setHasUndo(false);
      loadData();
      showToast('Reverted to previous trip plan.');
    }
  };

  if (!trip || !scenario || !simulation) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#FFB020] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-[#5E6B67]">Loading Simulator...</p>
        </div>
      </div>
    );
  }

  const currency = (trip.currency || 'INR') as CurrencyCode;

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#17201D] flex flex-col antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#17201D] text-white text-xs sm:text-sm font-bold py-3 px-5 rounded-2xl shadow-xl border border-white/10 flex items-center gap-2 animate-in slide-in-from-bottom">
          <CheckCircle2 className="w-4 h-4 text-[#20B8A6]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Header */}
      <header className="w-full bg-white border-b border-[#EAE6DD] sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(`/trip/${trip.id}/itinerary`)}
              className="p-2 rounded-xl text-[#5E6B67] hover:text-[#17201D] hover:bg-[#F9F7F1] transition-colors cursor-pointer"
              title="Back to Itinerary"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-[#17201D] truncate">
                  What-If Scenario Simulator
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FFF8ED] text-[#B86E00] border border-[#FCE2B6]">
                  Simulation Mode
                </span>
              </div>
              <p className="text-xs text-[#838F8B]">
                {trip.name} · {trip.destination} · Explore alternative budgets, pacing, & stays
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/trip/${trip.id}/health`)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#EAE6DD] hover:border-[#17201D] text-xs font-bold text-[#5E6B67] transition-all cursor-pointer"
            >
              <HeartPulse className="w-3.5 h-3.5 text-[#20B8A6]" />
              <span>Trip Health</span>
            </button>

            {hasUndo && (
              <button
                type="button"
                onClick={handleUndo}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F4F1EA] hover:bg-[#EAE6DD] text-[#5E6B67] text-xs font-bold transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Undo Applied Scenario</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsApplyModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#17201D] hover:bg-[#2A3632] text-white text-xs sm:text-sm font-black shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#20B8A6]" />
              <span>Apply This Plan</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Undo Available Banner */}
        {hasUndo && (
          <div className="p-4 rounded-2xl bg-[#E8F8F5] border border-[#A3E5D8] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#168376] font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#20B8A6] shrink-0" />
              <span>A previous scenario is active on your trip. You can restore your baseline anytime.</span>
            </div>
            <button
              type="button"
              onClick={handleUndo}
              className="px-3 py-1 rounded-xl bg-white border border-[#A3E5D8] font-bold text-[#168376] hover:bg-[#EAF8F5] transition-colors cursor-pointer shrink-0"
            >
              Restore Baseline
            </button>
          </div>
        )}

        {/* Primary Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Scenario Controls */}
          <div className="lg:col-span-5 space-y-6">
            <ScenarioControls
              trip={trip}
              scenario={scenario}
              onChange={setScenario}
              onSelectPreset={handleSelectPreset}
              onReset={handleReset}
            />
          </div>

          {/* Right Column: Live Impact Comparison & Alternatives */}
          <div className="lg:col-span-7 space-y-6">
            <ScenarioComparison simulation={simulation} />
            <ScenarioAlternatives
              alternatives={simulation.alternatives}
              currency={currency}
            />
          </div>
        </div>
      </main>

      {/* Apply Scenario Confirmation Modal */}
      <ApplyScenarioModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        simulation={simulation}
        onConfirmApply={handleConfirmApply}
      />

      {/* Floating AI Assistant Launcher & Drawer */}
      <TravelAssistantFloatingLauncher
        onClick={() => setIsAssistantOpen(true)}
      />
      <TravelAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        trip={trip}
        onStateChange={loadData}
      />
    </div>
  );
};
