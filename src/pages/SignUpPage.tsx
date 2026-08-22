import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Sparkles, Compass, MapPin, Globe2 } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { SignUpForm } from '../components/auth/SignUpForm';
import { TRAVEL_IMAGES } from '../assets/images';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#FFFDF8] flex flex-col lg:flex-row text-[#17201D] selection:bg-[#FF6B4A]/20 selection:text-[#FF6B4A]">
      {/* ========================================================================= */}
      {/* LEFT PANEL (DESKTOP): Editorial Immersive Travel Visual (~45% width)      */}
      {/* ========================================================================= */}
      <div className="hidden lg:relative lg:flex lg:w-[46%] xl:w-[44%] min-h-screen bg-[#17201D] overflow-hidden flex-col justify-between p-12 select-none">
        {/* Background Panoramic Photography */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={TRAVEL_IMAGES.signupHero}
            alt="Scenic mountain valley and reflection lake"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center scale-105 animate-fade-in transition-transform duration-1000"
          />
          {/* Multi-layer atmospheric tint and warm gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#17201D]/60 via-[#17201D]/20 to-[#17201D]/90 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#17201D] via-[#17201D]/40 to-transparent" />
          <div className="absolute inset-0 bg-[#FF6B4A]/10 mix-blend-overlay" />
        </div>

        {/* Top Floating Header with Logo & Back Link */}
        <div className="relative z-10 flex items-center justify-between">
          <Link
            to="/"
            className="group flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-semibold transition-all duration-200"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Home</span>
          </Link>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/15 text-white/90 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6B4A]" />
            <span>AI Travel Studio</span>
          </div>
        </div>

        {/* Center Editorial Quote & Brand Tagline */}
        <div className="relative z-10 my-auto py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B4A]/20 backdrop-blur-md border border-[#FF6B4A]/40 text-[#FFA085] text-xs font-bold uppercase tracking-wider mb-4">
              <Compass className="w-3.5 h-3.5" />
              <span>Smart Itineraries</span>
            </div>

            <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight tracking-tight mb-3">
              Your journey begins here.
            </h2>
            <p className="text-white/80 text-sm xl:text-base leading-relaxed max-w-md font-normal">
              Join thousands of modern travelers who craft personalized itineraries, discover hidden
              gems, and travel with seamless confidence.
            </p>
          </motion.div>
        </div>

        {/* Bottom Floating Feature Badge & Stats */}
        <div className="relative z-10 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)] flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#20B8A6]/20 border border-[#20B8A6]/40 flex items-center justify-center text-[#20B8A6] shadow-sm">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">120+ Curated Destinations</p>
                <p className="text-white/70 text-xs">AI-optimized routes & budgets</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#FFA085] bg-[#FF6B4A]/20 px-2.5 py-1 rounded-full border border-[#FF6B4A]/30">
              <MapPin className="w-3 h-3" />
              <span>Global</span>
            </div>
          </motion.div>

          <p className="text-[11px] text-white/50 text-center">
            © 2026 GlobeTrotter AI. Built for explorers everywhere.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT PANEL: Sign Up Form & Interaction Area (~55% width)                */}
      {/* ========================================================================= */}
      <div className="flex-1 min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 overflow-y-auto">
        {/* Mobile Header / Desktop Brand Row */}
        <div className="w-full max-w-md mx-auto flex items-center justify-between mb-6 sm:mb-8">
          <Logo size="md" />

          {/* Quick toggle link */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-[#68736F]">Have an account?</span>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="px-3.5 py-1.5 rounded-full border border-[#EAE6DD] hover:border-[#17201D] text-xs font-bold text-[#17201D] hover:bg-white transition-all cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Mobile Visual Header Card (Small screens only) */}
        <div className="lg:hidden w-full max-w-md mx-auto mb-6 relative rounded-2xl overflow-hidden shadow-sm h-32">
          <img
            src={TRAVEL_IMAGES.signupHero}
            alt="Yosemite sunrise"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#17201D]/90 via-[#17201D]/40 to-transparent flex items-end p-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B4A] bg-black/40 px-2 py-0.5 rounded-full">
                Your Next Adventure
              </span>
              <h3 className="text-white font-black text-base mt-1">Your journey begins here.</h3>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full my-auto py-2">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <SignUpForm />
          </motion.div>
        </div>

        {/* Footer info & links */}
        <div className="w-full max-w-md mx-auto pt-6 text-center text-xs text-[#8C9894]">
          <div className="flex items-center justify-center gap-4 text-[11px]">
            <Link to="/" className="hover:text-[#17201D] transition-colors">
              Splash Screen
            </Link>
            <span>•</span>
            <Link to="/login" className="hover:text-[#17201D] transition-colors">
              Log In
            </Link>
            <span>•</span>
            <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-[#17201D] transition-colors">
              Terms
            </a>
            <span>•</span>
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-[#17201D] transition-colors">
              Privacy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
