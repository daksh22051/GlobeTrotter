import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Header } from '../components/dashboard/Header';
import { MobileBottomNav } from '../components/dashboard/MobileBottomNav';
import { PersonalizedHero } from '../components/dashboard/PersonalizedHero';
import { QuickActions } from '../components/dashboard/QuickActions';
import { UpcomingTripsSection } from '../components/dashboard/UpcomingTripsSection';
import { RecommendedDestinations } from '../components/dashboard/RecommendedDestinations';
import { DestinationSearchModal } from '../components/dashboard/DestinationSearchModal';

import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { tripService } from '../services/tripService';
import { migrationService } from '../services/migrationService';
import { recommendationService, ScoredDestination } from '../services/recommendationService';
import { User } from '../types';
import { UserPreferences, CurrencyCode } from '../types/profile';
import { Trip } from '../types/trip';
import { getNextUpcomingTrip } from '../utils/tripStatus';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  // Authentication & Profile States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [recommendations, setRecommendations] = useState<ScoredDestination[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Verify User Authentication
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    setCurrentUser(user);

    // 2. Fetch User Preferences & Defaults
    const prefs =
      profileService.getPreferences(user.id) ||
      profileService.getDefaultPreferences(user.id);
    setPreferences(prefs);

    // 3. Load Trips & Stats (from local cache then background refresh)
    const userTrips = tripService.getUserTrips(user.id);
    setTrips(userTrips);

    // Asynchronously fetch fresh data from PostgreSQL and run migration if needed
    migrationService.runMigration(user.id).then(() => {
      tripService.fetchTrips(user.id).then((freshTrips) => {
        setTrips(freshTrips);
      });
    });

    // 4. Compute Personalized Recommendations
    const recs = recommendationService.getRecommendations(prefs, 4);
    setRecommendations(recs);

    setIsLoading(false);
  }, [navigate]);

  // Global Keyboard Shortcut for Search (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login', { replace: true });
  };

  const activeCurrency: CurrencyCode = preferences?.currency || 'INR';
  const dashboardTrips = useMemo(() => {
    const nextTrip = getNextUpcomingTrip(trips);
    return nextTrip ? [nextTrip] : trips.slice(0, 2);
  }, [trips]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#FFFDF8] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#FF6B4A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="min-h-screen w-full bg-[#FFFDF8] flex text-[#17201D] antialiased"
    >
      {/* 1. Desktop Persistent Sidebar */}
      <Sidebar currentUser={currentUser} onLogout={handleLogout} />

      {/* 2. Main Scrollable View Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-12">
        {/* Top Header */}
        <Header
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        {/* Content Container */}
        <main
          id="dashboard-main-content"
          tabIndex={-1}
          className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto space-y-8 sm:space-y-10"
        >
          {/* Section 1: Personalized Hero with Editorial Visual */}
          <PersonalizedHero
            currentUser={currentUser}
            preferences={preferences}
          />

          {/* Section 2: Quick Actions ("Start Planning") */}
          <QuickActions />

          {/* Section 3: Upcoming Trips & Clean Zero State */}
          <UpcomingTripsSection trips={dashboardTrips} />

          {/* Section 4: Picked For You (Recommended Destinations) */}
          <RecommendedDestinations
            destinations={recommendations}
            currency={activeCurrency}
          />


        </main>
      </div>

      {/* 3. Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* 4. Global Search Modal */}
      <DestinationSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        currency={activeCurrency}
      />
    </motion.div>
  );
};
