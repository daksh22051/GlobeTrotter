import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Briefcase, Plus, Globe2, User, Camera } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const navItems = [
    { label: 'Home', path: '/dashboard', icon: Home },
    { label: 'Trips', path: '/trips', icon: Briefcase },
    { label: 'Plan', path: '/plan-trip', icon: Plus, isAction: true },
    { label: 'Explore', path: '/explore', icon: Globe2 },
    { label: 'Studio', path: '/photoshoot-planner', icon: Camera },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#EAE6DD] px-3 py-2 flex items-center justify-around select-none shadow-lg"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        if (item.isAction) {
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center -mt-5 focus:outline-none"
              aria-label="Plan New Trip"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF6B4A] to-[#FF8E72] text-white flex items-center justify-center shadow-lg shadow-[#FF6B4A]/30 border-4 border-white hover:scale-105 active:scale-95 transition-transform">
                <Icon className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-bold text-[#FF6B4A] mt-0.5">Plan</span>
            </NavLink>
          );
        }

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
                isActive ? 'text-[#FF6B4A]' : 'text-[#68736F] hover:text-[#17201D]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className={`text-[10px] mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
};
