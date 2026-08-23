import React from 'react';
import { Star, Sparkles, MapPin, Calendar, TrendingUp } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface FloatingCardParisProps {
  className?: string;
}

export const FloatingCardParis: React.FC<FloatingCardParisProps> = ({ className }) => (
  <div
    className={cn(
      'bg-white p-3.5 sm:p-4 rounded-3xl shadow-xl border border-[#EAE6DD] flex items-center space-x-3 select-none transition-transform hover:scale-105 duration-200',
      'animate-float-1',
      className
    )}
  >
    <div className="w-10 h-10 bg-[#FFF8ED] rounded-xl flex items-center justify-center text-lg text-[#FF6B4A] shrink-0 font-bold">
      <Star className="w-5 h-5 fill-[#FFC857] text-[#FFC857]" />
    </div>
    <div className="text-left">
      <p className="text-xs text-[#68736F] font-bold uppercase tracking-wider">Paris, France</p>
      <p className="text-sm font-extrabold text-[#17201D]">4.8 Rating</p>
    </div>
  </div>
);

export interface FloatingCardCostProps {
  className?: string;
}

export const FloatingCardCost: React.FC<FloatingCardCostProps> = ({ className }) => (
  <div
    className={cn(
      'bg-white p-4 sm:p-5 rounded-3xl shadow-xl border border-[#EAE6DD] select-none transition-transform hover:scale-105 duration-200 min-w-[170px]',
      'animate-float-2',
      className
    )}
  >
    <p className="text-xs text-[#68736F] font-bold uppercase tracking-wider mb-1">Estimated Cost</p>
    <p className="text-2xl font-black text-[#20B8A6] leading-none">₹74,500</p>
    <div className="w-full bg-[#DDF7F2] h-1.5 rounded-full mt-2.5 overflow-hidden">
      <div className="bg-[#20B8A6] w-3/4 h-full rounded-full" />
    </div>
  </div>
);

export interface FloatingCardAiProps {
  className?: string;
}

export const FloatingCardAi: React.FC<FloatingCardAiProps> = ({ className }) => (
  <div
    className={cn(
      'bg-white px-4 sm:px-5 py-3.5 sm:py-4 rounded-3xl shadow-xl border border-[#EAE6DD] flex items-center space-x-3 select-none transition-transform hover:scale-105 duration-200',
      'animate-float-4',
      className
    )}
  >
    <div className="w-8 h-8 bg-[#DDF7F2] rounded-full flex items-center justify-center shrink-0">
      <div className="w-2.5 h-2.5 bg-[#20B8A6] rounded-full animate-pulse" />
    </div>
    <div className="text-left">
      <p className="text-[10px] text-[#68736F] font-bold uppercase tracking-wider">AI Optimized</p>
      <p className="text-sm font-extrabold text-[#17201D]">87 Health Score</p>
    </div>
  </div>
);

export interface FloatingCardDurationProps {
  className?: string;
}

export const FloatingCardDuration: React.FC<FloatingCardDurationProps> = ({ className }) => (
  <div
    className={cn(
      'bg-[#17201D] text-white px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl shadow-xl flex items-center space-x-4 select-none transition-transform hover:scale-105 duration-200',
      'animate-float-3',
      className
    )}
  >
    <div className="text-center">
      <p className="text-[10px] opacity-60 uppercase font-bold tracking-wider">Days</p>
      <p className="text-lg font-bold leading-tight">10</p>
    </div>
    <div className="h-8 w-px bg-white/20" />
    <div className="text-center">
      <p className="text-[10px] opacity-60 uppercase font-bold tracking-wider">Cities</p>
      <p className="text-lg font-bold leading-tight">03</p>
    </div>
  </div>
);
