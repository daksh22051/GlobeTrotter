import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Calendar,
  Users,
  Clock,
  Wallet,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Share2,
  Copy,
  Check,
  Mail,
  MessageCircle,
  FileText,
  Download,
  AlertCircle,
  ExternalLink,
  Utensils,
  Hotel,
  Landmark,
} from 'lucide-react';
import { sharingService } from '../services/sharingService';
import { travelGuideService } from '../services/travelGuideService';
import { ShareTripPayload } from '../types/sharing';
import { formatCurrency } from '../utils/currency';
import { CurrencyCode } from '../types/profile';
import { authService } from '../services/authService';

export const SharedTripPage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();

  const [payload, setPayload] = useState<ShareTripPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDayNumber, setActiveDayNumber] = useState<number>(1);
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({ 1: true });
  const [isCopied, setIsCopied] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const loadSharedTrip = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!shareToken) {
        setError('Invalid share link.');
        setIsLoading(false);
        return;
      }
      const data = await sharingService.fetchSharedTrip(shareToken);
      if (!data) {
        setError('This trip link is invalid or has expired.');
      } else {
        setPayload(data);
      }
    } catch (err) {
      console.error(err);
      setError('Could not load the shared travel plan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSharedTrip();
  }, [shareToken]);

  const toggleDay = (dayNum: number) => {
    setExpandedDays((prev) => ({ ...prev, [dayNum]: !prev[dayNum] }));
  };

  const publicUrl = `${window.location.origin}/shared/trip/${shareToken || ''}`;

  const copyPublicUrl = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 2500);
  };

  const openSocialShare = (network: 'whatsapp' | 'twitter' | 'email') => {
    const text = `Take a look at my GlobeTrotter itinerary: ${payload?.trip.name || 'my trip'}`;
    const shareTargets = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${publicUrl}`)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(publicUrl)}`,
      email: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(publicUrl)}`,
    };
    window.open(shareTargets[network], '_blank', 'noopener,noreferrer');
  };

  const copyTripToAccount = async () => {
    if (!shareToken) return;
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    setIsCopying(true);
    setCopyMessage(null);
    try {
      const copiedTrip = await sharingService.copySharedTrip(shareToken);
      navigate(`/trip/${copiedTrip.id}/itinerary`);
    } catch (err) {
      console.error(err);
      setCopyMessage('Could not copy this trip. Please try again.');
    } finally {
      setIsCopying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex flex-col items-center justify-center p-6 select-none">
        <div className="max-w-3xl w-full space-y-6 animate-pulse">
          <div className="h-64 bg-[#F4F1EA] rounded-3xl" />
          <div className="h-10 bg-[#F4F1EA] rounded-2xl w-1/2" />
          <div className="h-40 bg-[#F4F1EA] rounded-3xl" />
          <div className="h-60 bg-[#F4F1EA] rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !payload) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-[#EAE6DD] shadow-xs flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF2EE] text-[#FF6B4A] flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-[#17201D] mb-2">
            {error || 'Link unavailable'}
          </h2>
          <p className="text-xs sm:text-sm text-[#68736F] mb-6">
            The traveler may have moved or removed this public itinerary.
          </p>
          <button
            type="button"
            onClick={() => navigate('/plan-trip')}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Plan your own journey</span>
          </button>
        </div>
      </div>
    );
  }

  const { trip, itinerary, recommendations, budget } = payload;
  const days = itinerary?.days || [];
  const totalActivities = days.reduce((sum, d) => sum + (d.activities?.length || 0), 0);

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#17201D] flex flex-col font-sans selection:bg-[#FF6B4A]/20">
      {/* Top Banner: Read Only badge + CTA */}
      <header className="sticky top-0 z-40 bg-[#FFFDF8]/90 backdrop-blur-md border-b border-[#EAE6DD] px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF6B4A] to-[#FF8E72] text-white flex items-center justify-center shadow-xs">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black text-[#17201D] tracking-tight">GlobeTrotter</span>
            <span className="hidden sm:inline text-xs text-[#838F8B]"> · Shared Travel Plan</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E8F8F5] text-[#179E8E] text-[11px] font-bold border border-[#20B8A6]/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Read-Only Plan
          </span>

          <button
            type="button"
            onClick={() => navigate(`/trip/${trip.id}/guide`)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#EAE6DD] hover:border-[#17201D] text-[#17201D] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-[#FF6B4A]" />
            <span>View Guide</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/plan-trip')}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            <span>Create Your Trip</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={copyPublicUrl}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-[#20B8A6]" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Copied' : 'Share'}</span>
          </button>

          <button
            type="button"
            onClick={copyTripToAccount}
            disabled={isCopying}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#20B8A6] hover:bg-[#179E8E] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{isCopying ? 'Copying...' : 'Copy Trip'}</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative bg-[#17201D] text-white overflow-hidden">
        {/* Cover Image with gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={
              trip.coverImage ||
              'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80'
            }
            alt={trip.name}
            className="w-full h-full object-cover opacity-35 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#17201D] via-[#17201D]/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-[#FAF8F5]">
            <MapPin className="w-3.5 h-3.5 text-[#FF6B4A]" />
            <span>
              {trip.destination}, {trip.country}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white max-w-3xl">
            {trip.name}
          </h1>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-3 text-xs sm:text-sm font-semibold text-white/90">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <Calendar className="w-3.5 h-3.5 text-[#20B8A6]" />
              <span>{trip.dateDisplay || `${trip.durationDays} Days`}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <Users className="w-3.5 h-3.5 text-[#FFB020]" />
              <span>
                {trip.travelersCount} {trip.travelersCount === 1 ? 'Traveler' : 'Travelers'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <Clock className="w-3.5 h-3.5 text-[#FF8E72]" />
              <span>{totalActivities} Activities Scheduled</span>
            </div>

            {budget && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                <Wallet className="w-3.5 h-3.5 text-[#20B8A6]" />
                <span>
                  Budget: {formatCurrency(trip.budget || 50000, trip.currency || 'INR')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* Share actions */}
        <section className="bg-white/70 backdrop-blur-md rounded-3xl border border-[#EAE6DD] p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm sm:text-base font-black text-[#17201D]">Share this itinerary</h2>
            <p className="text-xs text-[#68736F] mt-1">Send a read-only link to your travel group.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={copyPublicUrl} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#17201D] text-white text-xs font-bold cursor-pointer">
              {isCopied ? <Check className="w-3.5 h-3.5 text-[#20B8A6]" /> : <Copy className="w-3.5 h-3.5" />}
              {isCopied ? 'Copied' : 'Copy link'}
            </button>
            <button type="button" onClick={() => openSocialShare('whatsapp')} aria-label="Share on WhatsApp" className="p-2 rounded-xl bg-[#E8F8F5] text-[#179E8E] cursor-pointer"><MessageCircle className="w-4 h-4" /></button>
            <button type="button" onClick={() => openSocialShare('twitter')} aria-label="Share on X" className="p-2 rounded-xl bg-[#F4F1EA] text-[#17201D] cursor-pointer"><span className="text-xs font-black">X</span></button>
            <button type="button" onClick={() => openSocialShare('email')} aria-label="Share by email" className="p-2 rounded-xl bg-[#FFF2EE] text-[#FF6B4A] cursor-pointer"><Mail className="w-4 h-4" /></button>
          </div>
        </section>

        {copyMessage && <p className="text-xs font-semibold text-[#D9573A] -mt-6">{copyMessage}</p>}

        {/* Day by Day Itinerary Stream */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#17201D] tracking-tight">
                Day-by-Day Itinerary
              </h2>
              <p className="text-xs text-[#68736F] mt-0.5">
                Explore the daily timeline, planned stops, and activity schedule.
              </p>
            </div>

            <span className="text-xs font-bold text-[#FF6B4A]">
              {days.length} {days.length === 1 ? 'Day' : 'Days'} planned
            </span>
          </div>

          <div className="space-y-4">
            {days.map((day) => {
              const isExpanded = expandedDays[day.dayNumber] !== false;
              const dayActivities = day.activities || [];

              return (
                <div
                  key={day.id || day.dayNumber}
                  className="bg-white rounded-3xl border border-[#EAE6DD] shadow-xs overflow-hidden transition-all"
                >
                  {/* Day Header */}
                  <button
                    type="button"
                    onClick={() => toggleDay(day.dayNumber)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-[#FCFBF8] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#FFF2EE] text-[#FF6B4A] font-black flex flex-col items-center justify-center shrink-0 border border-[#FFE0D6]">
                        <span className="text-[10px] uppercase font-bold leading-none">Day</span>
                        <span className="text-lg leading-none mt-0.5">{day.dayNumber}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-extrabold text-[#17201D]">
                            {day.title || `Day ${day.dayNumber} in ${trip.destination}`}
                          </h3>
                          {day.theme && (
                            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-[#F4F1EA] text-[#68736F] text-[10px] font-bold">
                              {day.theme}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#838F8B] font-medium mt-0.5">
                          {day.dateDisplay || `Day ${day.dayNumber}`} · {dayActivities.length} activities
                        </p>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-[#F4F1EA] text-[#68736F]">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Day Activities List */}
                  {isExpanded && (
                    <div className="p-5 sm:p-6 pt-0 border-t border-[#F4F1EA] divide-y divide-[#F4F1EA]">
                      {dayActivities.length === 0 ? (
                        <p className="py-4 text-xs text-[#838F8B] italic text-center">
                          No specific activities scheduled for this day yet.
                        </p>
                      ) : (
                        dayActivities.map((act, actIdx) => (
                          <div key={act.id || actIdx} className="py-3.5 flex items-start gap-3.5">
                            {/* Time badge */}
                            <div className="w-14 text-[11px] font-bold text-[#838F8B] shrink-0 pt-0.5">
                              {act.startTime || '—'}
                            </div>

                            {/* Dot / Icon */}
                            <div className="w-7 h-7 rounded-xl bg-[#FAF8F5] border border-[#EAE6DD] text-[#FF6B4A] flex items-center justify-center shrink-0 mt-0.5">
                              {act.category === 'food' ? (
                                <Utensils className="w-3.5 h-3.5" />
                              ) : act.category === 'hotel' ? (
                                <Hotel className="w-3.5 h-3.5" />
                              ) : (
                                <Landmark className="w-3.5 h-3.5" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-xs sm:text-sm font-bold text-[#17201D]">
                                  {act.title}
                                </h4>
                                {act.estimatedCost > 0 && (
                                  <span className="text-xs font-semibold text-[#68736F]">
                                    {formatCurrency(act.estimatedCost, act.currency || trip.currency || 'INR')}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#68736F] mt-0.5 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#98A29F]" />
                                <span className="truncate">{act.location}</span>
                              </p>
                              {act.notes && (
                                <p className="text-[11px] text-[#838F8B] mt-1 bg-[#FCFBF8] p-2 rounded-xl border border-[#F4F1EA]">
                                  {act.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {budget && (
          <section className="bg-white/70 backdrop-blur-md rounded-3xl border border-[#EAE6DD] p-6 sm:p-8 shadow-xs">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#17201D] tracking-tight">Cost breakdown</h2>
                <p className="text-xs text-[#68736F] mt-1">A clear view of the shared trip budget.</p>
              </div>
              <Wallet className="w-5 h-5 text-[#20B8A6]" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                ['Total budget', budget.totalBudget],
                ['Estimated cost', budget.estimatedCost],
                ['Spent', budget.actualSpent],
                ['Remaining', budget.remaining],
              ].map(([label, value]) => (
                <div key={label as string} className="rounded-2xl bg-[#FAF8F5] border border-[#F4F1EA] p-4">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-[#838F8B]">{label}</p>
                  <p className="text-base sm:text-lg font-black text-[#17201D] mt-1">{formatCurrency(Number(value) || 0, (budget.currency || trip.currency || 'INR') as CurrencyCode)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Selected Places & Food */}
        {recommendations && (
          <section className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-[#17201D] tracking-tight">
              Curated Places & Dining
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...(recommendations.places || []).slice(0, 3), ...(recommendations.food || []).slice(0, 3)].map(
                (rec) => (
                  <div
                    key={rec.id}
                    className="bg-white rounded-3xl border border-[#EAE6DD] overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col"
                  >
                    <div className="h-36 w-full relative overflow-hidden bg-[#FAF8F5]">
                      <img
                        src={rec.image}
                        alt={rec.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase">
                        {rec.category}
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#17201D] line-clamp-1">
                          {rec.name}
                        </h4>
                        <p className="text-[11px] text-[#68736F] line-clamp-2 mt-1">
                          {rec.description}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-[#F4F1EA] flex items-center justify-between text-xs text-[#838F8B]">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#FF6B4A]" />
                          <span className="truncate max-w-[120px]">{rec.location}</span>
                        </span>
                        <span className="font-bold text-[#17201D]">
                          {formatCurrency(rec.estimatedCost, rec.currency || 'INR')}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        )}

        {/* Bottom CTA Card */}
        <section className="bg-gradient-to-tr from-[#17201D] to-[#2D3A35] text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Ready to plan your next escape?
            </h3>
            <p className="text-xs sm:text-sm text-white/80 max-w-md">
              Create AI-powered itineraries, track real-time budgets, and curate trips with GlobeTrotter.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/plan-trip')}
            className="px-6 py-3 rounded-2xl bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs sm:text-sm font-black transition-all shadow-md cursor-pointer shrink-0"
          >
            Start Planning Free
          </button>
        </section>
      </main>
    </div>
  );
};
