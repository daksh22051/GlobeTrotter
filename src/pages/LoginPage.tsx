import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { Sparkles, MapPin, Compass, ArrowLeft, Globe2 } from 'lucide-react';
import { LoginForm } from '../components/auth/LoginForm';
import { TRAVEL_IMAGES } from '../assets/images';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const fadeUpVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
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
    <div className="min-h-screen w-full bg-[#FFFDF8] text-[#17201D] font-sans flex flex-col justify-between selection:bg-[#FFE4DD] selection:text-[#FF6B4A]">
      {/* Background Ambient Warmth Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#FFF8ED] blur-[100px] opacity-70" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[#DDF7F2] blur-[120px] opacity-40" />
      </div>

      {/* Main Two-Panel Layout */}
      <div className="relative z-10 w-full flex-1 flex flex-col lg:flex-row min-h-screen">
        {/* ========================================================
            LEFT PANEL: Immersive Travel Scene & Editorial Composition
            (Desktop 45% / Hidden or Compact on Mobile)
           ======================================================== */}
        <div className="hidden lg:flex lg:w-[45%] xl:w-[46%] relative bg-[#17201D] text-white p-10 xl:p-14 flex-col justify-between overflow-hidden">
          {/* Background Travel Photography with Warm Editorial Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={TRAVEL_IMAGES.loginAlpine}
              alt="Turquoise alpine mountain lake landscape"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover scale-105 transform hover:scale-100 transition-transform duration-1000 ease-out opacity-85"
            />
            {/* Multi-layered atmospheric warm gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#17201D] via-[#17201D]/40 to-black/30" />
            <div className="absolute inset-0 bg-[#FF6B4A]/10 mix-blend-overlay" />
          </div>

          {/* Subtle Decorative Map Flight Route SVG Overlay */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-40 overflow-visible"
            viewBox="0 0 600 800"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M 50 150 Q 300 250 450 500 T 200 700"
              stroke="#FFE4DD"
              strokeWidth="2"
              strokeDasharray="6 8"
            />
            <circle cx="50" cy="150" r="4" fill="#FF6B4A" />
            <circle cx="450" cy="500" r="5" fill="#20B8A6" />
            <circle cx="200" cy="700" r="4" fill="#FFC857" />
          </svg>

          {/* Top Brand Bar & Return Link */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeUpVariants}
            className="relative z-20 flex items-center justify-between"
          >
            <div
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 bg-[#FF6B4A] rounded-xl flex items-center justify-center shadow-lg shadow-[#FF6B4A]/30 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">GlobeTrotter</span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-semibold tracking-wide border border-white/15 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to home</span>
            </button>
          </motion.div>

          {/* Middle: Floating Interactive Travel Card */}
          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUpVariants}
            className="relative z-20 my-auto py-10"
          >
            <div className="inline-block bg-white/90 backdrop-blur-md text-[#17201D] p-5 rounded-3xl shadow-2xl border border-white/40 max-w-[320px] transition-transform hover:-translate-y-1 duration-300">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FFE4DD] flex items-center justify-center text-[#FF6B4A]">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="text-xs font-black tracking-wider uppercase text-[#FF6B4A]">
                  Explore The World
                </span>
              </div>
              <p className="text-lg font-black tracking-tight text-[#17201D] leading-snug">
                Your next adventure is waiting.
              </p>
              <div className="mt-3 pt-3 border-t border-[#EAE6DD] flex items-center justify-between text-xs text-[#68736F] font-semibold">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#20B8A6]" />
                  <span>140+ Destinations</span>
                </span>
                <span className="text-[#20B8A6] font-bold">✨ Smart AI Ready</span>
              </div>
            </div>
          </motion.div>

          {/* Bottom Left Editorial Tagline */}
          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeUpVariants}
            className="relative z-20 space-y-2"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-bold text-[#FFE4DD] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#FFC857]" />
              <span>GlobeTrotter AI Itineraries</span>
            </div>
            <h3 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-white leading-snug max-w-sm">
              &ldquo;Every journey starts with a single step.&rdquo;
            </h3>
            <p className="text-xs text-white/70 tracking-wide font-medium">
              Curating unforgettable memories across the globe.
            </p>
          </motion.div>
        </div>

        {/* ========================================================
            RIGHT PANEL: Premium Login Experience
            (Desktop ~55% / Mobile 100%)
           ======================================================== */}
        <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-16">
          {/* Mobile-Only Top Navigation Header */}
          <div className="lg:hidden flex items-center justify-between pb-6 border-b border-[#EAE6DD] mb-6">
            <div
              className="flex items-center space-x-2.5 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="w-9 h-9 bg-[#FF6B4A] rounded-xl flex items-center justify-center shadow-md shadow-[#FF6B4A]/25">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
              </div>
              <span className="text-xl font-black tracking-tight text-[#17201D]">GlobeTrotter</span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-xs font-semibold text-[#68736F] hover:text-[#17201D] flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>

          {/* Center Form Area */}
          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeUpVariants}
            className="my-auto py-6 sm:py-10 flex items-center justify-center w-full"
          >
            <LoginForm />
          </motion.div>

          {/* Minimalist Bottom Footer */}
          <div className="pt-6 border-t border-[#EAE6DD]/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#68736F]">
            <div className="flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-[#FF6B4A]" />
              <span>© {new Date().getFullYear()} GlobeTrotter. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-4 font-medium">
              <button
                type="button"
                onClick={() => navigate('/splash')}
                className="hover:text-[#17201D] transition-colors cursor-pointer"
              >
                Home
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => navigate('/explore')}
                className="hover:text-[#17201D] transition-colors cursor-pointer"
              >
                Destinations
              </button>
              <span>•</span>
              <span className="text-[#20B8A6] font-bold">Hackathon Build v2.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
