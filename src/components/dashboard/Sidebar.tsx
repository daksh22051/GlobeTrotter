import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Compass,
  Home,
  Briefcase,
  PlusCircle,
  Globe2,
  Wallet,
  Calendar,
  User as UserIcon,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { User } from '../../types';
import { authService } from '../../services/authService';

interface SidebarProps {
  currentUser: User | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();

  const primaryNavItems = [
    { label: 'Home', path: '/dashboard', icon: Home },
    { label: 'My Trips', path: '/trips', icon: Briefcase },
    { label: 'Plan New Trip', path: '/plan-trip', icon: PlusCircle, highlight: true },
    { label: 'Explore', path: '/explore', icon: Globe2 },
  ];

  const secondaryNavItems = [
    { label: 'Budget', path: '/budget', icon: Wallet },
    { label: 'Calendar', path: '/calendar', icon: Calendar },
  ];

  const bottomNavItems = [
    { label: 'Profile', path: '/profile', icon: UserIcon },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const userDisplayName = currentUser?.name || 'Traveler';
  const userInitials = userDisplayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside
      id="dashboard-sidebar"
      aria-label="Main Navigation"
      className="hidden md:flex flex-col w-64 lg:w-72 bg-white border-r border-[#EAE6DD] min-h-screen sticky top-0 h-screen select-none shrink-0 z-20"
    >
      {/* Brand Header */}
      <div className="p-6 pb-5 flex items-center justify-between border-b border-[#F4F1EA]">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] rounded-xl p-1"
          aria-label="GlobeTrotter Home"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF6B4A] to-[#FF8E72] flex items-center justify-center text-white shadow-sm shadow-[#FF6B4A]/25 group-hover:scale-105 transition-transform duration-200">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-[#17201D] tracking-tight block">
              GlobeTrotter
            </span>
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#20B8A6] block -mt-0.5">
              Smart Travel Planner
            </span>
          </div>
        </button>
      </div>

      {/* Navigation Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {/* Primary Navigation */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-[#98A29F]">
            Navigation
          </div>
          <nav className="space-y-1">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-[#FFF2EE] text-[#FF6B4A] shadow-xs'
                        : 'text-[#4A5551] hover:text-[#17201D] hover:bg-[#F9F7F1]'
                    } ${item.highlight && !location.pathname.includes(item.path) ? 'text-[#FF6B4A]' : ''}`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4.5 h-4.5 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.highlight && (
                    <span className="w-2 h-2 rounded-full bg-[#FF6B4A] animate-pulse" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Separator */}
        <div className="h-px bg-[#F4F1EA] mx-3" />

        {/* Secondary Navigation */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-[#98A29F]">
            Planning Tools
          </div>
          <nav className="space-y-1">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-[#FFF2EE] text-[#FF6B4A] shadow-xs'
                        : 'text-[#4A5551] hover:text-[#17201D] hover:bg-[#F9F7F1]'
                    }`
                  }
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Quick CTA Box */}
        <div className="mx-1 p-4 rounded-2xl bg-gradient-to-br from-[#F6FBFA] to-[#EDFAF7] border border-[#D0F0EA] relative overflow-hidden">
          <div className="flex items-center gap-1.5 text-[#20B8A6] text-xs font-bold mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Assistant</span>
          </div>
          <p className="text-xs text-[#4A5551] leading-relaxed mb-3">
            Get personalized multi-city itinerary recommendations in seconds.
          </p>
          <button
            type="button"
            onClick={() => navigate('/plan-trip')}
            className="w-full py-2 px-3 rounded-xl bg-[#20B8A6] hover:bg-[#1CA393] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            Create Itinerary
          </button>
        </div>
      </div>

      {/* Bottom Area: Settings + User Mini Profile */}
      <div className="p-4 border-t border-[#EAE6DD] bg-[#FCFBF8] space-y-3">
        <nav className="space-y-0.5">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#FFF2EE] text-[#FF6B4A]'
                      : 'text-[#68736F] hover:text-[#17201D] hover:bg-[#F4F1EA]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Authenticated User Card */}
        <div className="pt-2 border-t border-[#EAE6DD]/70 flex items-center justify-between gap-3">
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1"
            title="View Profile"
          >
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={userDisplayName}
                className="w-9 h-9 rounded-full object-cover border border-[#EAE6DD] shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#FF6B4A]/10 text-[#FF6B4A] font-bold text-xs flex items-center justify-center border border-[#FF6B4A]/20 shrink-0">
                {userInitials}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#17201D] truncate group-hover:text-[#FF6B4A] transition-colors">
                {userDisplayName}
              </p>
              <p className="text-[10px] font-medium text-[#68736F] truncate">
                Ready to explore?
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="p-1.5 rounded-lg text-[#98A29F] hover:text-[#D94F3D] hover:bg-white transition-colors cursor-pointer"
            title="Log out"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
