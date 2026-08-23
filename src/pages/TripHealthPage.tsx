import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HeartPulse,
  ArrowLeft,
  Wand2,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  Navigation,
  Compass,
  Wallet,
  FileText,
  Filter,
} from 'lucide-react';
import { tripService } from '../services/tripService';
import { itineraryService } from '../services/itineraryService';
import { tripHealthService } from '../services/tripHealthService';
import { Trip } from '../types/trip';
import { Itinerary } from '../types/itinerary';
import { TripHealthBreakdown, TripHealthIssue, IssueSeverity } from '../types/intelligence';

// Subcomponents
import { HealthScoreCard } from '../components/trip-health/HealthScoreCard';
import { HealthBreakdown } from '../components/trip-health/HealthBreakdown';
import { HealthIssueItem } from '../components/trip-health/HealthIssueItem';
import { FixIssuesModal } from '../components/trip-health/FixIssuesModal';
import { TravelAssistantFloatingLauncher } from '../components/ai-assistant/TravelAssistantFloatingLauncher';
import { TravelAssistantDrawer } from '../components/ai-assistant/TravelAssistantDrawer';
import { MobileBottomNav } from '../components/dashboard/MobileBottomNav';

export const TripHealthPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [health, setHealth] = useState<TripHealthBreakdown | null>(null);
  const [severityFilter, setSeverityFilter] = useState<'all' | IssueSeverity>('all');

  // Fix Modal State
  const [isFixModalOpen, setIsFixModalOpen] = useState(false);
  const [fixPlan, setFixPlan] = useState<{
    optimizedItinerary: Itinerary;
    improvements: string[];
    healthBefore: number;
    healthAfter: number;
  } | null>(null);

  // AI Assistant State
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Initial Data Loading
  const loadData = () => {
    if (!tripId) return;
    const loadedTrip = tripService.getTripById(tripId);
    if (loadedTrip) {
      setTrip(loadedTrip);
      const loadedItin = itineraryService.getItinerary(tripId, loadedTrip);
      setItinerary(loadedItin);
      const computedHealth = tripHealthService.calculateHealth(loadedTrip, loadedItin);
      setHealth(computedHealth);
    }
  };

  useEffect(() => {
    loadData();
  }, [tripId]);

  // Filtered Issues
  const filteredIssues = useMemo(() => {
    if (!health) return [];
    if (severityFilter === 'all') return health.issues;
    return health.issues.filter((i) => i.severity === severityFilter);
  }, [health, severityFilter]);

  // Open Auto-Fix Modal
  const handleOpenFixAll = () => {
    if (!trip) return;
    const plan = tripHealthService.generateAutoFixPlan(trip);
    setFixPlan(plan);
    setIsFixModalOpen(true);
  };

  // Apply Auto-Fix Plan
  const handleApplyFixPlan = (optimizedItinerary: Itinerary) => {
    if (!trip) return;
    tripHealthService.applyAutoFix(trip, optimizedItinerary);
    setItinerary(optimizedItinerary);
    const newHealth = tripHealthService.calculateHealth(trip, optimizedItinerary);
    setHealth(newHealth);
    showToast(`Applied improvements! Health score increased to ${newHealth.score}/100.`);
  };

  // Apply Single Issue Fix
  const handleApplySingleFix = (issue: TripHealthIssue) => {
    if (!trip) return;
    const updated = tripHealthService.applySingleIssueFix(trip, issue);
    if (updated) {
      setItinerary(updated);
      const newHealth = tripHealthService.calculateHealth(trip, updated);
      setHealth(newHealth);
      showToast(`Resolved: ${issue.title}`);
    }
  };

  if (!trip || !health) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#20B8A6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-[#5E6B67]">Analyzing Trip Health...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#17201D] flex flex-col antialiased pb-24 lg:pb-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#17201D] text-white text-xs sm:text-sm font-bold py-3 px-5 rounded-2xl shadow-xl border border-white/10 flex items-center gap-2 animate-in slide-in-from-bottom">
          <CheckCircle2 className="w-4 h-4 text-[#20B8A6]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
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
                  {trip.name} Health Center
                </h1>
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${health.badgeBg} ${health.badgeText}`}>
                  {health.score}/100 {health.label}
                </span>
              </div>
              <p className="text-xs text-[#838F8B]">
                {trip.destination}, {trip.country} · {trip.durationDays} Days · {trip.currency || '₹'}{trip.budget.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Quick Navigation Tabs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/trip/${trip.id}/itinerary`)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#EAE6DD] hover:border-[#17201D] text-xs font-bold text-[#5E6B67] transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Itinerary</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(`/trip/${trip.id}/what-if`)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFF8ED] hover:bg-[#FFECC9] border border-[#FCE2B6] text-xs font-bold text-[#B86E00] transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FFB020]" />
              <span>What-If Simulator</span>
            </button>

            {health.issues.length > 0 && (
              <button
                type="button"
                onClick={handleOpenFixAll}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#20B8A6] hover:bg-[#1CA393] text-white text-xs sm:text-sm font-black shadow-md shadow-[#20B8A6]/25 transition-all cursor-pointer"
              >
                <Wand2 className="w-4 h-4" />
                <span>Fix All Issues</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        {/* Top Grid: Hero Health Score Card + Positive Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <HealthScoreCard
              trip={trip}
              health={health}
              onOpenFixModal={handleOpenFixAll}
            />
          </div>

          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#EAE6DD] shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F4F1EA]">
              <h3 className="text-sm font-extrabold text-[#17201D] uppercase tracking-wider">
                Trip Highlights & Balance
              </h3>
              <span className="text-[11px] font-bold text-[#20B8A6] bg-[#EAF8F5] px-2.5 py-0.5 rounded-full">
                Audit Verified
              </span>
            </div>

            <div className="space-y-2.5">
              {health.positiveHighlights.map((hl, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[#F9F7F1] border border-[#EAE6DD]/70 flex items-start gap-2.5 text-xs text-[#4A5551]"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#1F8A70] shrink-0 mt-0.5" />
                  <span className="font-semibold">{hl}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#F4F1EA] flex items-center justify-between">
              <span className="text-xs text-[#838F8B]">Need to adjust budget or duration?</span>
              <button
                type="button"
                onClick={() => navigate(`/trip/${trip.id}/what-if`)}
                className="text-xs font-bold text-[#FF6B4A] hover:underline cursor-pointer"
              >
                Try What-If Simulator →
              </button>
            </div>
          </div>
        </div>

        {/* 7-Component Mathematical Breakdown */}
        <HealthBreakdown health={health} />

        {/* Issues Found & Action Center */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE6DD] shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F4F1EA]">
            <div>
              <h3 className="text-lg font-extrabold text-[#17201D]">
                Detected Issues & Recommendations ({health.issues.length})
              </h3>
              <p className="text-xs sm:text-sm text-[#68736F]">
                Automated schedule conflict, impossible travel, and meal gap inspection
              </p>
            </div>

            {/* Severity Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-[#F9F7F1] rounded-2xl border border-[#EAE6DD] self-start sm:self-auto overflow-x-auto">
              <button
                type="button"
                onClick={() => setSeverityFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  severityFilter === 'all'
                    ? 'bg-white text-[#17201D] shadow-xs'
                    : 'text-[#838F8B] hover:text-[#17201D]'
                }`}
              >
                All ({health.issues.length})
              </button>

              <button
                type="button"
                onClick={() => setSeverityFilter('critical')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  severityFilter === 'critical'
                    ? 'bg-[#FFF0F0] text-[#C72E33] shadow-xs'
                    : 'text-[#838F8B] hover:text-[#C72E33]'
                }`}
              >
                <AlertCircle className="w-3 h-3" />
                <span>Critical ({health.criticalCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setSeverityFilter('warning')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  severityFilter === 'warning'
                    ? 'bg-[#FEF6E8] text-[#B86E00] shadow-xs'
                    : 'text-[#838F8B] hover:text-[#B86E00]'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Warnings ({health.warningCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setSeverityFilter('suggestion')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  severityFilter === 'suggestion'
                    ? 'bg-[#EAF8F5] text-[#168376] shadow-xs'
                    : 'text-[#838F8B] hover:text-[#168376]'
                }`}
              >
                Suggestions ({health.suggestionCount})
              </button>
            </div>
          </div>

          {/* Issues List */}
          {filteredIssues.length > 0 ? (
            <div className="space-y-3.5">
              {filteredIssues.map((issue) => (
                <HealthIssueItem
                  key={issue.id}
                  issue={issue}
                  onApplyFix={handleApplySingleFix}
                  onNavigateToDay={(dayNum) => navigate(`/trip/${trip.id}/itinerary`)}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center bg-[#F9F7F1] rounded-2xl border border-[#EAE6DD]/70">
              <CheckCircle2 className="w-10 h-10 text-[#1F8A70] mx-auto mb-3" />
              <h4 className="text-base font-extrabold text-[#17201D]">
                No {severityFilter !== 'all' ? severityFilter : ''} issues detected!
              </h4>
              <p className="text-xs text-[#838F8B] mt-1 max-w-sm mx-auto">
                Your itinerary schedule and transit buffers are completely harmonious.
              </p>
            </div>
          )}
        </div>

        {/* Day-by-Day Health Summary Cards */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE6DD] shadow-2xs space-y-6">
          <div className="pb-4 border-b border-[#F4F1EA]">
            <h3 className="text-lg font-extrabold text-[#17201D]">
              Day-by-Day Journey Health
            </h3>
            <p className="text-xs sm:text-sm text-[#68736F]">
              Individual daily pacing scores and scheduled load
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {itinerary.days.map((day) => {
              const dayH = health.dayHealths[day.dayNumber] || {
                score: 85,
                status: 'Balanced',
                totalActivities: day.activities.length,
                totalTravelMinutes: 30,
                freeTimeMinutes: 240,
              };

              const statusColor =
                dayH.score >= 90
                  ? 'text-[#1F8A70] bg-[#E8F8F5] border-[#A3E5D8]'
                  : dayH.score >= 75
                  ? 'text-[#20B8A6] bg-[#EAF8F5] border-[#B2E6DC]'
                  : dayH.score >= 60
                  ? 'text-[#B86E00] bg-[#FEF6E8] border-[#FCE2B6]'
                  : 'text-[#C72E33] bg-[#FFF0F0] border-[#FDB8B8]';

              return (
                <div
                  key={day.id}
                  className="p-5 rounded-2xl bg-[#F9F7F1] border border-[#EAE6DD] hover:border-[#D0C9BA] transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#17201D]">
                      Day {day.dayNumber} · {day.dateDisplay}
                    </span>
                    <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${statusColor}`}>
                      {dayH.score}/100 {dayH.status}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-[#5E6B67] mb-4 truncate">
                    {day.title || 'Sightseeing & Exploration'}
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 border-t border-[#EAE6DD]/70">
                    <div>
                      <span className="text-[10px] text-[#838F8B] block">Activities</span>
                      <span className="font-bold text-[#17201D]">{day.activities.length}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#838F8B] block">Transit</span>
                      <span className="font-bold text-[#17201D]">~{dayH.totalTravelMinutes}m</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#838F8B] block">Free Time</span>
                      <span className="font-bold text-[#17201D]">~{Math.round(dayH.freeTimeMinutes / 60)}h</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Auto Fix Modal */}
      {fixPlan && (
        <FixIssuesModal
          isOpen={isFixModalOpen}
          onClose={() => setIsFixModalOpen(false)}
          trip={trip}
          healthBefore={fixPlan.healthBefore}
          healthAfter={fixPlan.healthAfter}
          improvements={fixPlan.improvements}
          optimizedItinerary={fixPlan.optimizedItinerary}
          onApply={handleApplyFixPlan}
        />
      )}

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

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};
