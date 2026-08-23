import React from 'react';
import {
  WhatIfScenario,
  ScenarioPreset,
  TransportPreference,
  AccommodationLevel,
  TravelPace,
} from '../../types/intelligence';
import { Trip } from '../../types/trip';
import {
  Sparkles,
  Sliders,
  DollarSign,
  Calendar,
  Users,
  Plane,
  Train,
  Car,
  Bus,
  Bed,
  Flame,
  Coffee,
  RotateCcw,
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { CurrencyCode } from '../../types/profile';

interface ScenarioControlsProps {
  trip: Trip;
  scenario: WhatIfScenario;
  onChange: (updated: WhatIfScenario) => void;
  onSelectPreset: (preset: ScenarioPreset) => void;
  onReset: () => void;
}

export const ScenarioControls: React.FC<ScenarioControlsProps> = ({
  trip,
  scenario,
  onChange,
  onSelectPreset,
  onReset,
}) => {
  const currency = (trip.currency || 'INR') as CurrencyCode;

  const presets: ScenarioPreset[] = [
    'Save Money',
    'More Relaxed',
    'More Experiences',
    'Faster Trip',
    'Family Friendly',
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EAE6DD] shadow-2xs space-y-6">
      {/* Header & Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F4F1EA]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FFF8ED] text-[#FFB020] flex items-center justify-center border border-[#FCE2B6]">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#17201D] uppercase tracking-wider">
              Scenario Controls
            </h3>
            <p className="text-xs text-[#838F8B]">Experiment with budget, duration, & tiers</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#838F8B] hover:text-[#17201D] transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Trip Default</span>
        </button>
      </div>

      {/* Preset Pills */}
      <div>
        <span className="text-xs font-bold text-[#17201D] block mb-2">
          One-Click Simulation Presets:
        </span>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => {
            const isSelected = scenario.presetName === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => onSelectPreset(preset)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#17201D] text-white shadow-xs'
                    : 'bg-[#F9F7F1] text-[#5E6B67] hover:bg-[#EAE6DD] border border-[#EAE6DD]'
                }`}
              >
                {preset === 'Save Money' && '💰 '}
                {preset === 'More Relaxed' && '🌿 '}
                {preset === 'More Experiences' && '✨ '}
                {preset === 'Faster Trip' && '⚡ '}
                {preset === 'Family Friendly' && '👨‍👩‍👧 '}
                {preset}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Budget Slider */}
      <div className="p-4 rounded-2xl bg-[#F9F7F1] border border-[#EAE6DD]/80 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#17201D] flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-[#20B8A6]" />
            <span>Target Budget</span>
          </label>
          <span className="text-sm font-black text-[#17201D]">
            {formatCurrency(scenario.budget, currency)}
          </span>
        </div>

        <input
          type="range"
          min={Math.max(10000, Math.round(trip.budget * 0.3))}
          max={Math.round(trip.budget * 2.2)}
          step={2000}
          value={scenario.budget}
          onChange={(e) =>
            onChange({
              ...scenario,
              budget: parseInt(e.target.value, 10),
              presetName: 'Custom',
            })
          }
          className="w-full h-2 bg-[#EAE6DD] rounded-lg appearance-none cursor-pointer accent-[#20B8A6]"
        />

        <div className="flex justify-between text-[10px] text-[#838F8B] font-semibold">
          <span>{formatCurrency(Math.max(10000, Math.round(trip.budget * 0.3)), currency)}</span>
          <span className="text-[#20B8A6] font-bold">Original: {formatCurrency(trip.budget, currency)}</span>
          <span>{formatCurrency(Math.round(trip.budget * 2.2), currency)}</span>
        </div>
      </div>

      {/* 2. Duration Slider */}
      <div className="p-4 rounded-2xl bg-[#F9F7F1] border border-[#EAE6DD]/80 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#17201D] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#FF6B4A]" />
            <span>Duration (Days)</span>
          </label>
          <span className="text-sm font-black text-[#17201D]">
            {scenario.durationDays} Days
          </span>
        </div>

        <input
          type="range"
          min={2}
          max={14}
          step={1}
          value={scenario.durationDays}
          onChange={(e) =>
            onChange({
              ...scenario,
              durationDays: parseInt(e.target.value, 10),
              presetName: 'Custom',
            })
          }
          className="w-full h-2 bg-[#EAE6DD] rounded-lg appearance-none cursor-pointer accent-[#FF6B4A]"
        />

        <div className="flex justify-between text-[10px] text-[#838F8B] font-semibold">
          <span>2 Days (Express)</span>
          <span className="text-[#FF6B4A] font-bold">Original: {trip.durationDays || 5} Days</span>
          <span>14 Days (Extended)</span>
        </div>
      </div>

      {/* 3. Transport Preference Selector */}
      <div>
        <label className="text-xs font-bold text-[#17201D] block mb-2">
          Transport Mode:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { key: 'flight', label: 'Flight', icon: <Plane className="w-3.5 h-3.5" /> },
            { key: 'train', label: 'Rail / Train', icon: <Train className="w-3.5 h-3.5" /> },
            { key: 'rental_car', label: 'Rental Car', icon: <Car className="w-3.5 h-3.5" /> },
            { key: 'public_transit', label: 'Public Transit', icon: <Bus className="w-3.5 h-3.5" /> },
          ].map((mode) => {
            const isSelected = scenario.transportPreference === mode.key;
            return (
              <button
                key={mode.key}
                type="button"
                onClick={() =>
                  onChange({
                    ...scenario,
                    transportPreference: mode.key as TransportPreference,
                    presetName: 'Custom',
                  })
                }
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#E8F8F5] border-[#20B8A6] text-[#168376] shadow-xs'
                    : 'bg-white border-[#EAE6DD] text-[#5E6B67] hover:bg-[#F9F7F1]'
                }`}
              >
                {mode.icon}
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Accommodation Tier Selector */}
      <div>
        <label className="text-xs font-bold text-[#17201D] block mb-2">
          Accommodation Tier:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { key: 'luxury', label: 'Luxury Resort' },
            { key: 'premium', label: 'Premium Boutique' },
            { key: 'comfort', label: 'Comfort Heritage' },
            { key: 'budget', label: 'Budget Pods' },
          ].map((tier) => {
            const isSelected = scenario.accommodationLevel === tier.key;
            return (
              <button
                key={tier.key}
                type="button"
                onClick={() =>
                  onChange({
                    ...scenario,
                    accommodationLevel: tier.key as AccommodationLevel,
                    presetName: 'Custom',
                  })
                }
                className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FFF8ED] border-[#FFB020] text-[#B86E00] shadow-xs'
                    : 'bg-white border-[#EAE6DD] text-[#5E6B67] hover:bg-[#F9F7F1]'
                }`}
              >
                {tier.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Travel Pace */}
      <div>
        <label className="text-xs font-bold text-[#17201D] block mb-2">
          Travel Pace:
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: 'relaxed', label: 'Relaxed', sub: '~3.5h Free Time' },
            { key: 'balanced', label: 'Balanced', sub: '~2.5h Free Time' },
            { key: 'fast-paced', label: 'Fast-Paced', sub: '~1h Free Time' },
          ].map((pace) => {
            const isSelected = scenario.travelPace === pace.key;
            return (
              <button
                key={pace.key}
                type="button"
                onClick={() =>
                  onChange({
                    ...scenario,
                    travelPace: pace.key as TravelPace,
                    presetName: 'Custom',
                  })
                }
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#17201D] border-[#17201D] text-white shadow-xs'
                    : 'bg-white border-[#EAE6DD] text-[#5E6B67] hover:bg-[#F9F7F1]'
                }`}
              >
                <span className="text-xs font-bold block">{pace.label}</span>
                <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-[#838F8B]'}`}>
                  {pace.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
