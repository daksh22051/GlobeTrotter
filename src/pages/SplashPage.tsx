import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Compass,
  Sparkles,
  MapPin,
  Calendar,
  Globe2,
  TrendingUp,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Plane,
} from 'lucide-react';
import { Logo } from '../components/common/Logo';
import {
  FloatingCardParis,
  FloatingCardCost,
  FloatingCardDuration,
  FloatingCardAi,
} from '../components/common/FloatingTravelCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { TRAVEL_IMAGES } from '../assets/images';
import { FEATURED_DESTINATIONS } from '../data/destinations';
import { useReducedMotion } from '../hooks/useReducedMotion';

export const SplashPage: React.FC = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const [isExploreModalOpen, setIsExploreModalOpen] = useState(false);

  const handleGetStarted = () => {
    navigate('/login');
  };

  const handleExploreClick = () => {
    setIsExploreModalOpen(true);
  };

  const animationVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: custom * 0.1,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FFFDF8] text-[#17201D] font-sans overflow-hidden flex flex-col justify-between selection:bg-[#FFE4DD] selection:text-[#FF6B4A]">
      {/* Background Ambient Blur Geometry */}
      <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-[#FFF8ED] rounded-full blur-[100px] opacity-60 pointer-events-none" />
      <div className="absolute top-1/2 -left-32 w-[400px] h-[400px] bg-[#DDF7F2] rounded-full blur-[80px] opacity-40 pointer-events-none" />

      {/* Navigation Header */}
      <nav className="flex justify-between items-center px-6 sm:px-12 py-6 sm:py-8 z-20 w-full max-w-7xl mx-auto">
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={animationVariants}
        >
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-[#FF6B4A] rounded-xl flex items-center justify-center shadow-[0_4px_14px_rgba(255,107,74,0.3)]">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#17201D]">GlobeTrotter</span>
          </div>
        </motion.div>

        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={animationVariants}
          className="flex items-center space-x-6 sm:space-x-8 text-sm font-medium text-[#68736F]"
        >
          <button
            onClick={handleExploreClick}
            className="hover:text-[#FF6B4A] cursor-pointer transition-colors hidden sm:inline-block font-semibold"
          >
            Destinations
          </button>
          <button
            onClick={handleExploreClick}
            className="hover:text-[#FF6B4A] cursor-pointer transition-colors hidden md:inline-block font-semibold"
          >
            About
          </button>
          <button
            onClick={handleGetStarted}
            className="px-5 py-2.5 border border-[#EAE6DD] rounded-full hover:bg-white hover:border-[#17201D]/20 text-[#17201D] font-semibold transition-all shadow-sm cursor-pointer"
          >
            Log In
          </button>
        </motion.div>
      </nav>

      {/* Main Hero Section with Geometric Balance Layout */}
      <main className="flex-1 flex flex-col lg:flex-row items-center px-6 sm:px-12 pb-12 lg:pb-16 z-10 w-full max-w-7xl mx-auto gap-12 lg:gap-8">
        
        {/* Left Column: Brand Message & Typography */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center lg:pr-8 text-left">
          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={animationVariants}
            className="mb-6"
          >
            <span className="inline-block px-4 py-1.5 bg-[#FFE4DD] text-[#FF6B4A] rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
              Personalized Travel Planning
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-extrabold leading-[1.05] tracking-tight mb-6 text-[#17201D]">
              Your next great <br />
              <span className="text-[#FF6B4A]">journey</span> starts here.
            </h1>
            <p className="text-lg sm:text-xl text-[#68736F] leading-relaxed max-w-[480px]">
              Discover places, build unforgettable itineraries, and let AI make every journey smarter.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={animationVariants}
            className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4"
          >
            <button
              onClick={handleGetStarted}
              className="bg-[#FF6B4A] text-white px-8 py-4 rounded-full font-bold text-base sm:text-lg shadow-lg shadow-[#FF6B4A]/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center cursor-pointer group"
            >
              <span>Get Started</span>
              <svg
                className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <button
              onClick={handleExploreClick}
              className="text-[#17201D] px-8 py-4 rounded-full font-bold text-base sm:text-lg border border-[#EAE6DD] hover:bg-[#FFF8ED] hover:border-[#17201D]/20 transition-all text-center cursor-pointer shadow-sm"
            >
              Explore destinations
            </button>
          </motion.div>

          {/* Social Proof / Active Travelers Count */}
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={animationVariants}
            className="mt-10 sm:mt-12 flex items-center space-x-4 sm:space-x-6"
          >
            <div className="flex -space-x-3">
              <img
                src={TRAVEL_IMAGES.traveler1}
                alt="Traveler"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm"
              />
              <img
                src={TRAVEL_IMAGES.traveler2}
                alt="Traveler"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm"
              />
              <img
                src={TRAVEL_IMAGES.traveler3}
                alt="Traveler"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm"
              />
            </div>
            <p className="text-sm text-[#68736F]">
              <span className="font-bold text-[#17201D]">2,400+</span> travelers planned trips today
            </p>
          </motion.div>
        </div>

        {/* Right Column: Geometric Composition with Offset Frame & Floating Cards */}
        <div className="w-full lg:w-1/2 relative flex items-center justify-center min-h-[460px] sm:min-h-[540px] my-6 lg:my-0">
          <motion.div
            custom={2}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[480px] h-[480px] sm:h-[540px]"
          >
            {/* Geometric Rotated Offset Backing */}
            <div className="absolute inset-0 bg-[#EAE6DD] rounded-[48px] rotate-3 translate-x-4 translate-y-4 opacity-50" />

            {/* Primary Hero Destination Card */}
            <div className="absolute inset-0 bg-gray-200 rounded-[48px] overflow-hidden shadow-2xl border-8 border-white group z-10">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10 pointer-events-none" />
              <img
                src={TRAVEL_IMAGES.heroAlps}
                alt="The Swiss Alps"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute bottom-8 left-8 text-white z-20 text-left">
                <p className="text-sm font-medium opacity-90 tracking-wide">Featured Destination</p>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mt-0.5">The Swiss Alps</h3>
              </div>
            </div>

            {/* Card 1: Top-Left Paris Rating */}
            <div className="absolute -top-6 sm:-top-8 -left-4 sm:-left-12 z-30">
              <FloatingCardParis />
            </div>

            {/* Card 2: Top-Right Estimated Cost with Teal Progress Meter */}
            <div className="absolute top-1/4 -right-4 sm:-right-16 z-30">
              <FloatingCardCost />
            </div>

            {/* Card 3: Bottom-Right AI Optimized with Pulse Node */}
            <div className="absolute bottom-10 sm:bottom-12 -right-4 sm:-right-12 z-30">
              <FloatingCardAi />
            </div>

            {/* Card 4: Bottom-Left Dark Accent Duration & Cities Pill */}
            <div className="absolute -bottom-6 left-4 sm:left-12 z-30">
              <FloatingCardDuration />
            </div>

            {/* Subtle Geometric Route Arc SVG */}
            <svg
              className="absolute top-1/2 left-0 w-full h-full pointer-events-none z-20 overflow-visible"
              style={{ transform: 'translate(-30%, -20%) rotate(-10deg)' }}
              viewBox="0 0 500 200"
            >
              <path
                d="M 100 100 Q 250 50 400 150"
                stroke="#FF6B4A"
                strokeWidth="2.5"
                strokeDasharray="6 6"
                fill="transparent"
                opacity="0.5"
              />
              <circle cx="100" cy="100" r="5" fill="#FF6B4A" />
              <circle cx="400" cy="150" r="5" fill="#FF6B4A" />
            </svg>
          </motion.div>
        </div>

      </main>

      {/* Footer */}
      <footer className="px-6 sm:px-12 py-6 flex flex-col sm:flex-row justify-between items-center border-t border-[#EAE6DD] text-xs text-[#68736F] uppercase tracking-widest font-bold gap-4 z-20 w-full max-w-7xl mx-auto">
        <div className="flex space-x-6 sm:space-x-8">
          <span className="hover:text-[#17201D] transition-colors cursor-pointer" onClick={handleExploreClick}>
            Smart Routes
          </span>
          <span className="hover:text-[#17201D] transition-colors cursor-pointer" onClick={handleExploreClick}>
            Cost Analysis
          </span>
          <span className="hover:text-[#17201D] transition-colors cursor-pointer" onClick={handleExploreClick}>
            Local Insights
          </span>
        </div>
        <div className="flex space-x-4">
          <span className="text-[#17201D] opacity-40">2024 GlobeTrotter AI</span>
        </div>
      </footer>

      {/* Explore Destinations Informational Preview Modal */}
      <Modal
        isOpen={isExploreModalOpen}
        onClose={() => setIsExploreModalOpen(false)}
        title="Featured Travel Destinations"
        description="Explore top hand-picked global spots ready for AI itinerary generation."
        size="lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 max-h-[60vh] overflow-y-auto pr-1">
          {FEATURED_DESTINATIONS.map((dest) => (
            <Card
              key={dest.id}
              variant="interactive"
              padding="sm"
              radius="xl"
              onClick={() => {
                setIsExploreModalOpen(false);
                navigate('/login');
              }}
              className="flex items-center gap-3.5 group text-left"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-[#EAE6DD]">
                <img
                  src={dest.imageUrl}
                  alt={dest.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#17201D] truncate">{dest.name}</h4>
                  <Badge variant="sun" size="sm">
                    ★ {dest.rating}
                  </Badge>
                </div>
                <p className="text-xs text-[#68736F] truncate mt-0.5">{dest.country}</p>
                <p className="text-[11px] font-semibold text-[#FF6B4A] mt-1">
                  Est. ₹{(dest.estimatedCostPerDay || dest.estimatedDailyBudget)?.toLocaleString()}/day
                </p>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-[#EAE6DD] flex items-center justify-between">
          <p className="text-xs text-[#68736F]">
            Ready to craft your custom AI itinerary?
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setIsExploreModalOpen(false);
              navigate('/login');
            }}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Start Planning
          </Button>
        </div>
      </Modal>
    </div>
  );
};

