import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  Home,
  Briefcase,
  PlusCircle,
  Globe2,
  Wallet,
  CalendarDays,
  User as UserIcon,
  Settings,
  LogOut,
  Camera,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { User } from '../../types';
import { authService } from '../../services/authService';

interface SidebarProps {
  currentUser: User | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const navigationItems = [
    { label: 'Home', path: '/dashboard', icon: Home },
    { label: 'My Trips', path: '/trips', icon: Briefcase },
    { label: 'Explore', path: '/explore', icon: Globe2 },
  ];

  const studioItems = [
    { label: 'Photoshoot Studio', path: '/photoshoot-planner', icon: Camera },
  ];

  const planningItems = [
    { label: 'Plan New Trip', path: '/plan-trip', icon: PlusCircle },
    { label: 'Budget', path: '/budget', icon: Wallet },
    { label: 'Calendar', path: '/calendar', icon: CalendarDays },
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
      className={`hidden md:flex flex-col ${isCollapsed ? 'w-20 bg-[#F4F1EA]' : 'w-64 lg:w-72 bg-white/90 backdrop-blur-xl'} transition-all duration-300 ease-in-out border-r border-[#EAE6DD]/80 min-h-screen sticky top-0 h-screen select-none shrink-0 z-20 shadow-[10px_0_30px_rgba(23,32,29,0.03)]`}
    >
      {/* Brand Header */}
      <div className={`p-5 pb-4 flex items-center border-b border-[#F4F1EA] ${isCollapsed ? 'justify-center px-2' : 'justify-between'}`}>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF6B4A] rounded-xl p-1"
          aria-label="GlobeTrotter Home"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF6B4A] to-[#FF8E72] flex items-center justify-center text-white shadow-sm shadow-[#FF6B4A]/25 group-hover:scale-105 transition-transform duration-200">
            <Compass className="w-5 h-5" />
          </div>
          <div className={isCollapsed ? 'hidden' : 'block'}>
            <span className="font-extrabold text-lg text-[#17201D] tracking-tight block">
              GlobeTrotter
            </span>
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#20B8A6] block -mt-0.5">
              Smart Travel Planner
            </span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setIsCollapsed((previous) => !previous)}
          className="rounded-xl p-2 text-[#68736F] transition-all duration-200 hover:bg-[#FFF2EE] hover:text-[#FF6B4A] hover:scale-105 cursor-pointer"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Scrollable Area */}
      <div className={`flex-1 overflow-y-auto py-4 space-y-4 ${isCollapsed ? 'px-2' : 'px-3.5'}`}>
        {[
          { label: 'Navigation', items: navigationItems },
          { label: 'Studio & Experiences', items: studioItems },
          { label: 'Planning Tools', items: planningItems },
        ].map((section) => (
          <div key={section.label}>
            <div className={`px-3 mb-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#98A29F] ${isCollapsed ? 'hidden' : 'block'}`}>
              {section.label}
            </div>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer ${isCollapsed ? 'justify-center px-2' : ''} ${
                        isActive
                          ? 'bg-[#FFF2EE] text-[#FF6B4A] shadow-[0_4px_16px_rgba(255,107,74,0.12)]'
                          : 'text-[#4A5551] hover:-translate-y-0.5 hover:bg-[#F9F7F1] hover:text-[#17201D]'
                      }`
                    }
                    aria-current={location.pathname === item.path ? 'page' : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        <span className={`absolute left-0 h-6 w-1 rounded-r-full transition-all duration-200 ${isActive ? 'bg-[#FF6B4A] shadow-[0_0_10px_rgba(255,107,74,0.7)]' : 'bg-transparent group-hover:bg-[#FFB09B]'}`} />
                        <Icon className={`w-4.5 h-4.5 shrink-0 transition-transform duration-200 ${isActive ? 'scale-105' : 'group-hover:scale-110'}`} />
                        <span className={isCollapsed ? 'hidden' : 'block'}>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}

      </div>

      {/* Bottom Area: Settings + User Mini Profile */}
      <div className={`p-3 border-t border-[#EAE6DD] bg-[#FCFBF8] space-y-2 ${isCollapsed ? 'px-2' : ''}`}>
        <nav className="space-y-0.5">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${isCollapsed ? 'justify-center px-2' : ''} ${
                    isActive
                      ? 'bg-[#FFF2EE] text-[#FF6B4A]'
                      : 'text-[#68736F] hover:text-[#17201D] hover:bg-[#F4F1EA]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className={isCollapsed ? 'hidden' : 'block'}>{item.label}</span>
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
            <div className={`min-w-0 ${isCollapsed ? 'hidden' : 'block'}`}>
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
