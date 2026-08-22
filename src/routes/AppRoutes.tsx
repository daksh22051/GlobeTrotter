import React from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { SplashPage } from '../pages/SplashPage';
import { LoginPage } from '../pages/LoginPage';
import { SignUpPage } from '../pages/SignUpPage';
import { OnboardingPage } from '../pages/OnboardingPage';
import { DashboardPage } from '../pages/DashboardPage';
import { PlanTripPage } from '../pages/PlanTripPage';
import { TripRecommendationsPage } from '../pages/TripRecommendationsPage';
import { ItineraryPage } from '../pages/ItineraryPage';
import { TripMapPage } from '../pages/TripMapPage';
import { TripBudgetPage } from '../pages/TripBudgetPage';
import { TripCalendarPage } from '../pages/TripCalendarPage';
import { TripsPage } from '../pages/TripsPage';
import { authService } from '../services/authService';
import { tripService } from '../services/tripService';
import { ArrowLeft, Compass, Sparkles, Calendar, Layers, MapPin, Wallet, Clock } from 'lucide-react';

/**
 * Smart Calendar Entry Point: Redirects to current active trip calendar or shows clean prompt
 */
const CalendarRouteHandler: React.FC = () => {
  const currentUser = authService.getCurrentUser();
  const trips = currentUser ? tripService.getUserTrips(currentUser.id) : [];

  if (trips.length > 0) {
    return <Navigate to={`/trip/${trips[0].id}/calendar`} replace />;
  }

  return (
    <ModulePlaceholderView
      title="No Active Trips"
      subtitle="Plan a trip to unlock the interactive Trip Timeline and Calendar."
      badge="Trip Timeline & Calendar"
      actionText="Plan a New Trip"
      actionPath="/plan-trip"
    />
  );
};

/**
 * Smart Budget Entry Point: Redirects to current active trip budget or shows clean picker
 */
const BudgetRouteHandler: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const trips = currentUser ? tripService.getUserTrips(currentUser.id) : [];

  if (trips.length > 0) {
    return <Navigate to={`/trip/${trips[0].id}/budget`} replace />;
  }

  return (
    <ModulePlaceholderView
      title="No Active Trips"
      subtitle="Plan a trip to unlock the Smart Budget Tracker and Live Budget Optimizer."
      badge="Smart Budget Tracker"
      actionText="Plan a New Trip"
      actionPath="/plan-trip"
    />
  );
};

/**
 * Route protection wrapper: ensures user is authenticated before accessing private routes
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

/**
 * Clean development placeholder view for future feature modules
 */
const ModulePlaceholderView: React.FC<{
  title: string;
  subtitle: string;
  badge?: string;
  actionText?: string;
  actionPath?: string;
}> = ({
  title,
  subtitle,
  badge = 'Upcoming Feature Module',
  actionText = 'Back to Dashboard',
  actionPath = '/dashboard',
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#FFFDF8] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-[#EAE6DD] shadow-xs flex flex-col items-center">
        {/* Brand Icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF6B4A] to-[#FF8E72] text-white flex items-center justify-center mb-4 shadow-sm shadow-[#FF6B4A]/25">
          <Compass className="w-7 h-7" />
        </div>

        {/* Feature Module Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF2EE] text-[#FF6B4A] text-xs font-bold mb-3 border border-[#FFE0D6]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{badge}</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-[#17201D] mb-2 tracking-tight">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-[#68736F] mb-6 leading-relaxed">
          {subtitle}
        </p>

        <div className="w-full space-y-2.5">
          <button
            type="button"
            onClick={() => navigate(actionPath)}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#FF6B4A] hover:bg-[#E55837] text-white text-sm font-bold shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{actionText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Splash Screen */}
      <Route path="/" element={<SplashPage />} />
      <Route path="/splash" element={<SplashPage />} />

      {/* Feature 2: Premium Login Experience */}
      <Route path="/login" element={<LoginPage />} />

      {/* Feature 3: Premium Sign Up Experience */}
      <Route path="/signup" element={<SignUpPage />} />

      {/* Feature 4: Personalized Travel Onboarding */}
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* Feature 5: Real Home Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Feature 6: Smart Multi-Step Trip Planner */}
      <Route
        path="/plan-trip"
        element={
          <ProtectedRoute>
            <PlanTripPage />
          </ProtectedRoute>
        }
      />

      {/* Feature 7: AI Trip Intelligence Recommendations */}
      <Route
        path="/trip/:tripId/recommendations"
        element={
          <ProtectedRoute>
            <TripRecommendationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trips/:tripId/recommendations"
        element={
          <ProtectedRoute>
            <TripRecommendationsPage />
          </ProtectedRoute>
        }
      />

      {/* Feature 8: Day-by-Day Interactive AI Itinerary Builder */}
      <Route
        path="/trip/:tripId/itinerary"
        element={
          <ProtectedRoute>
            <ItineraryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trips/:tripId/itinerary"
        element={
          <ProtectedRoute>
            <ItineraryPage />
          </ProtectedRoute>
        }
      />

      {/* Feature 9: Interactive Trip Map */}
      <Route
        path="/trip/:tripId/map"
        element={
          <ProtectedRoute>
            <TripMapPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trips/:tripId/map"
        element={
          <ProtectedRoute>
            <TripMapPage />
          </ProtectedRoute>
        }
      />

      {/* Feature 10: Smart Budget Tracker + Live Budget Optimizer */}
      <Route
        path="/trip/:tripId/budget"
        element={
          <ProtectedRoute>
            <TripBudgetPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trips/:tripId/budget"
        element={
          <ProtectedRoute>
            <TripBudgetPage />
          </ProtectedRoute>
        }
      />

      {/* Feature 11: Smart Calendar + Trip Timeline */}
      <Route
        path="/trip/:tripId/calendar"
        element={
          <ProtectedRoute>
            <TripCalendarPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trips/:tripId/calendar"
        element={
          <ProtectedRoute>
            <TripCalendarPage />
          </ProtectedRoute>
        }
      />

      {/* Feature 12: My Trips Personal Travel Collection */}
      <Route
        path="/trips"
        element={
          <ProtectedRoute>
            <TripsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trips/:tripId"
        element={
          <ProtectedRoute>
            <TripsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/explore"
        element={
          <ProtectedRoute>
            <ModulePlaceholderView
              title="Explore Destinations"
              subtitle="The Global Discovery Catalog with interactive destination filters, neighborhood guides, and seasonal insights will be built in the next feature phase."
              badge="Feature Module: Explore & Discover"
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/budget"
        element={
          <ProtectedRoute>
            <BudgetRouteHandler />
          </ProtectedRoute>
        }
      />

      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <CalendarRouteHandler />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ModulePlaceholderView
              title="Traveler Profile"
              subtitle="Manage your personal traveler passport, travel style preferences, saved destinations, and connected accounts."
              badge="User Profile & Settings"
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <ModulePlaceholderView
              title="Application Settings"
              subtitle="Preferences for default currency, notification alerts, language localization, and security."
              badge="Settings & Preferences"
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <ModulePlaceholderView
            title="Reset Password"
            subtitle="Password recovery and email verification will be introduced in an upcoming feature phase."
            actionText="Back to Login"
            badge="Security"
          />
        }
      />

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
