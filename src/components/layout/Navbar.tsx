import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Globe2, Compass, ArrowRight } from 'lucide-react';
import { Logo } from '../common/Logo';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export interface NavbarProps {
  onExploreClick?: () => void;
  onGetStartedClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onExploreClick, onGetStartedClick }) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleGetStarted = () => {
    if (onGetStartedClick) {
      onGetStartedClick();
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="w-full bg-[#FFFDF8]/90 backdrop-blur-md sticky top-0 z-40 border-b border-[#EAE6DD]/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={handleLogoClick}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B4A]/50 rounded-lg text-left"
          aria-label="GlobeTrotter Home"
        >
          <Logo size="md" showTagline={false} />
        </button>

        {/* Center Tag / Status indicator */}
        <div className="hidden md:flex items-center gap-3">
          <Badge variant="teal" size="sm" icon={<Sparkles className="w-3.5 h-3.5" />}>
            Intelligent Travel Engine
          </Badge>
          <span className="text-xs font-semibold text-[#68736F] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#20B8A6] animate-pulse" />
            AI Itinerary v2.4 Active
          </span>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExploreClick}
            className="hidden sm:inline-flex text-[#17201D] hover:bg-[#FFF8ED]"
          >
            Explore
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleGetStarted}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            className="shadow-[0_4px_14px_rgba(255,107,74,0.25)]"
          >
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
};
