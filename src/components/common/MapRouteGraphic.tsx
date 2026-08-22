import React from 'react';
import { Plane, Compass, Navigation } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export const MapRouteGraphic: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-10">
      <svg
        className="w-full h-full overflow-visible"
        viewBox="0 0 600 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B4A" />
            <stop offset="50%" stopColor="#FFC857" />
            <stop offset="100%" stopColor="#20B8A6" />
          </linearGradient>

          <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Faint contour topology lines */}
        <path
          d="M 20 180 C 120 120, 220 220, 360 140 C 460 80, 520 160, 580 120"
          stroke="#EAE6DD"
          strokeWidth="1.2"
          strokeDasharray="4 6"
          strokeOpacity="0.7"
          fill="none"
        />
        <path
          d="M 50 320 C 180 260, 290 380, 440 290 C 510 240, 560 310, 590 280"
          stroke="#EAE6DD"
          strokeWidth="1"
          strokeDasharray="3 5"
          strokeOpacity="0.5"
          fill="none"
        />

        {/* Main Connected Travel Route Path: Paris (x:110, y:290) -> Amsterdam (x:260, y:120) -> Rome (x:490, y:360) */}
        <path
          id="travelPath"
          d="M 110 290 C 140 180, 210 130, 260 120 C 340 100, 430 220, 490 360"
          stroke="url(#routeGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="6 7"
          className={!prefersReducedMotion ? 'animate-[dash_35s_linear_infinite]' : ''}
          fill="none"
        />

        {/* Secondary branch line to coastal destination */}
        <path
          d="M 260 120 C 320 80, 420 70, 470 90"
          stroke="#20B8A6"
          strokeWidth="1.5"
          strokeDasharray="3 4"
          strokeOpacity="0.6"
          fill="none"
        />

        {/* Waypoint 1: PARIS */}
        <g transform="translate(110, 290)">
          <circle r="16" fill="#FFE4DD" fillOpacity="0.6" className={!prefersReducedMotion ? 'animate-pulse' : ''} />
          <circle r="8" fill="#FFFFFF" stroke="#FF6B4A" strokeWidth="3" />
          <circle r="3" fill="#FF6B4A" />
          <g transform="translate(-32, 18)">
            <rect width="64" height="22" rx="11" fill="#FFFFFF" stroke="#EAE6DD" filter="url(#subtleGlow)" />
            <text x="32" y="15" textAnchor="middle" fill="#17201D" fontSize="10" fontWeight="700" fontFamily="Plus Jakarta Sans">
              PARIS
            </text>
          </g>
        </g>

        {/* Waypoint 2: AMSTERDAM */}
        <g transform="translate(260, 120)">
          <circle r="16" fill="#FFF4D6" fillOpacity="0.6" className={!prefersReducedMotion ? 'animate-pulse' : ''} />
          <circle r="8" fill="#FFFFFF" stroke="#FFC857" strokeWidth="3" />
          <circle r="3" fill="#FFC857" />
          <g transform="translate(-48, -32)">
            <rect width="96" height="22" rx="11" fill="#FFFFFF" stroke="#EAE6DD" filter="url(#subtleGlow)" />
            <text x="48" y="15" textAnchor="middle" fill="#17201D" fontSize="10" fontWeight="700" fontFamily="Plus Jakarta Sans">
              AMSTERDAM
            </text>
          </g>
        </g>

        {/* Waypoint 3: ROME */}
        <g transform="translate(490, 360)">
          <circle r="16" fill="#DDF7F2" fillOpacity="0.6" className={!prefersReducedMotion ? 'animate-pulse' : ''} />
          <circle r="8" fill="#FFFFFF" stroke="#20B8A6" strokeWidth="3" />
          <circle r="3" fill="#20B8A6" />
          <g transform="translate(-32, 18)">
            <rect width="64" height="22" rx="11" fill="#FFFFFF" stroke="#EAE6DD" filter="url(#subtleGlow)" />
            <text x="32" y="15" textAnchor="middle" fill="#17201D" fontSize="10" fontWeight="700" fontFamily="Plus Jakarta Sans">
              ROME
            </text>
          </g>
        </g>

        {/* Subtle Decorative Compass Rose */}
        <g transform="translate(530, 80)" opacity="0.35">
          <circle r="22" stroke="#68736F" strokeWidth="1" strokeDasharray="2 3" fill="none" />
          <path d="M 0 -18 L 4 -4 L 18 0 L 4 4 L 0 18 L -4 4 L -18 0 L -4 -4 Z" fill="#68736F" />
        </g>
      </svg>

      {/* CSS-Animated Plane travelling smoothly along path */}
      {!prefersReducedMotion && (
        <div
          className="absolute w-8 h-8 rounded-full bg-white text-[#FF6B4A] shadow-[0_4px_16px_rgba(255,107,74,0.35)] border border-[#FF6B4A]/20 flex items-center justify-center pointer-events-none"
          style={{
            offsetPath: 'path("M 110 290 C 140 180, 210 130, 260 120 C 340 100, 430 220, 490 360")',
            animation: 'routeFlight 18s ease-in-out infinite',
          }}
        >
          <Plane className="w-4 h-4 transform rotate-45" />
        </div>
      )}
    </div>
  );
};
