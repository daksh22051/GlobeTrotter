/**
 * GlobeTrotter Design Tokens & Global Theme System
 * "Plan smarter. Travel better."
 */

export const THEME_COLORS = {
  // Backgrounds
  background: '#FFFDF8', // Warm Ivory Canvas
  backgroundSecondary: '#FFF8ED', // Soft Sand Surface
  backgroundElevated: '#FFFFFF', // Pure White for elevated cards
  
  // Accents
  primary: '#FF6B4A', // Sunset Coral (Primary CTA)
  primaryHover: '#E55837',
  primarySoft: '#FFE4DD', // Soft Coral Pill / Badge
  
  secondary: '#20B8A6', // Coastal Teal
  secondaryHover: '#179E8E',
  secondarySoft: '#DDF7F2', // Soft Teal Pill / Badge
  
  sun: '#FFC857', // Golden Sun Warmth
  sunSoft: '#FFF4D6',
  
  // Typography
  textPrimary: '#17201D', // Deep Forest / Charcoal
  textSecondary: '#68736F', // Muted Sage Gray
  textTertiary: '#9BA3A0', // Subtle captions
  
  // Borders & Dividers
  border: '#EAE6DD', // Warm Gray Border
  borderSubtle: '#F4F1EA',
  borderStrong: '#D6D0C3',
} as const;

export const THEME_RADII = {
  sm: '8px',
  md: '12px',
  lg: '18px',
  xl: '24px',
  '2xl': '28px',
  full: '9999px',
} as const;

export const THEME_SHADOWS = {
  subtle: '0 2px 8px -2px rgba(23, 32, 29, 0.05)',
  card: '0 8px 30px -6px rgba(23, 32, 29, 0.07)',
  cardHover: '0 16px 40px -10px rgba(23, 32, 29, 0.12)',
  glowCoral: '0 10px 25px -5px rgba(255, 107, 74, 0.35)',
  glowTeal: '0 10px 25px -5px rgba(32, 184, 166, 0.35)',
} as const;
