import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  User as UserIcon,
  Settings,
  LogOut,
  Sliders,
  Check,
  Compass,
  MapPin,
  Sparkles,
  Home,
  Briefcase,
  PlusCircle,
  Globe2,
  Menu,
  X,
} from 'lucide-react';
import { User } from '../../types';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  onOpenSearch: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'tip' | 'reminder' | 'welcome';
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Profile Tailored ✨',
    message: 'Your onboarding preferences are active and curating recommendations.',
    time: 'Just now',
    read: false,
    type: 'welcome',
  },
  {
    id: '2',
    title: 'Ready to Plan?',
    message: 'Create your first multi-day trip with AI itinerary suggestions.',
    time: '1h ago',
    read: false,
    type: 'tip',
  },
  {
    id: '3',
    title: 'Explore Curated Spots',
    message: 'Check out 10+ destinations handpicked for your travel personality.',
    time: '2h ago',
    read: true,
    type: 'reminder',
  },
];

export const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, onOpenSearch }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Explorer';
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Close open menus when focus moves outside or Escape is pressed.
  useEffect(() => {
    const handlePointerDownOutside = (e: PointerEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDownOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const userInitials = (firstName || 'TR').slice(0, 2).toUpperCase();

  return (
    <header
      id="dashboard-header"
      className="sticky top-0 z-30 bg-[#FFFDF8]/90 backdrop-blur-md border-b border-[#EAE6DD]/80 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 select-none"
    >
      {/* Left: Dynamic Greeting */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {/* Mobile Logo Brand icon */}
          <div className="md:hidden flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowMobileMenu((previous) => !previous)}
              className="p-2 rounded-xl text-[#4A5551] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
              aria-label={showMobileMenu ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={showMobileMenu}
            >
              {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF6B4A] to-[#FF8E72] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h1 className="text-base sm:text-lg lg:text-xl font-extrabold text-[#17201D] tracking-tight truncate flex items-center gap-1.5">
              <span>{getGreeting()}, {firstName}</span>
              <span className="text-sm">👋</span>
            </h1>
            <p className="text-xs text-[#68736F] font-medium hidden sm:block">
              Where will you go next?
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls: Search, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Trigger Button */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl bg-white border border-[#EAE6DD] hover:border-[#D1CBC0] text-[#68736F] hover:text-[#17201D] text-xs font-medium transition-all shadow-2xs group cursor-pointer"
          aria-label="Search destinations and trips"
        >
          <Search className="w-4 h-4 text-[#98A29F] group-hover:text-[#FF6B4A] transition-colors" />
          <span className="hidden sm:inline-block max-w-[140px] md:max-w-[200px] lg:max-w-[240px] truncate text-left">
            Search destinations, trips...
          </span>
          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-[#98A29F] bg-[#F4F1EA] rounded-md">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setShowNotifications((previous) => !previous);
              setShowProfileMenu(false);
            }}
            className={`relative p-2.5 rounded-2xl border transition-all cursor-pointer ${
              showNotifications
                ? 'bg-[#FFF2EE] border-[#FF6B4A]/30 text-[#FF6B4A]'
                : 'bg-white border-[#EAE6DD] text-[#4A5551] hover:text-[#17201D] hover:bg-[#F9F7F1]'
            }`}
            aria-label="Notifications"
            aria-expanded={showNotifications}
            aria-controls="notifications-popover"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#FF6B4A] rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Popover */}
          {showNotifications && (
            <div id="notifications-popover" role="dialog" aria-label="Notifications" className="absolute right-0 mt-2 w-80 sm:w-92 bg-white rounded-3xl border border-[#EAE6DD] shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#F4F1EA] mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#17201D]">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#FFF2EE] text-[#FF6B4A] text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-[11px] font-semibold text-[#20B8A6] hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl text-left transition-colors ${
                      item.read ? 'bg-[#FCFBF8]' : 'bg-[#FFF9F6] border border-[#FFE7DE]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-xs font-bold text-[#17201D]">{item.title}</p>
                      <span className="text-[10px] text-[#98A29F] whitespace-nowrap">{item.time}</span>
                    </div>
                    <p className="text-xs text-[#68736F] leading-relaxed">{item.message}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#F4F1EA] text-center">
                <p className="text-[11px] text-[#98A29F]">GlobeTrotter local smart updates</p>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Menu */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1 pl-1.5 rounded-2xl bg-white border border-[#EAE6DD] hover:border-[#D1CBC0] transition-all cursor-pointer group"
            aria-label="User menu"
            aria-expanded={showProfileMenu}
          >
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={firstName}
                className="w-7 h-7 rounded-xl object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#FF6B4A] to-[#FF8E72] text-white font-bold text-xs flex items-center justify-center">
                {userInitials}
              </div>
            )}
            <span className="hidden md:inline-block text-xs font-bold text-[#17201D] max-w-[90px] truncate pr-1.5">
              {firstName}
            </span>
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl border border-[#EAE6DD] shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3 bg-[#FCFBF8] rounded-2xl mb-2 border border-[#F4F1EA]">
                <p className="text-xs font-bold text-[#17201D] truncate">{currentUser?.name}</p>
                <p className="text-[11px] text-[#68736F] truncate">{currentUser?.email}</p>
              </div>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#4A5551] hover:text-[#17201D] hover:bg-[#F9F7F1] transition-colors cursor-pointer"
                >
                  <UserIcon className="w-4 h-4 text-[#98A29F]" />
                  <span>My Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/onboarding');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#4A5551] hover:text-[#17201D] hover:bg-[#F9F7F1] transition-colors cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-[#98A29F]" />
                  <span>Travel Preferences</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#4A5551] hover:text-[#17201D] hover:bg-[#F9F7F1] transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-[#98A29F]" />
                  <span>Settings</span>
                </button>
              </div>

              <div className="my-2 h-px bg-[#F4F1EA]" />

              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#D94F3D] hover:bg-[#FFF2EE] transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {showMobileMenu && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-[#EAE6DD] shadow-lg p-3 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
          <nav className="grid grid-cols-2 gap-2" aria-label="Mobile navigation">
            {[
              { label: 'Home', path: '/dashboard', icon: Home },
              { label: 'My Trips', path: '/trips', icon: Briefcase },
              { label: 'Explore', path: '/explore', icon: Globe2 },
              { label: 'Plan New Trip', path: '/plan-trip', icon: PlusCircle },
              { label: 'Profile', path: '/profile', icon: UserIcon },
              { label: 'Settings', path: '/settings', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    setShowMobileMenu(false);
                    navigate(item.path);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-[#EAE6DD] bg-[#FCFBF8] px-3 py-2.5 text-left text-xs font-bold text-[#4A5551] hover:border-[#FFB09B] hover:bg-[#FFF2EE] hover:text-[#17201D] transition-colors cursor-pointer"
                >
                  <Icon className="w-4 h-4 text-[#FF6B4A]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};
