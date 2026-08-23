import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User as UserIcon,
  Compass,
  Coins,
  Shield,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Heart,
  Languages,
  MapPin,
} from 'lucide-react';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { tripService } from '../services/tripService';
import { User } from '../types';
import { UserPreferences, CurrencyCode } from '../types/profile';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { PersonalInfo } from '../components/profile/PersonalInfo';
import { TravelPreferences } from '../components/profile/TravelPreferences';
import { CurrencyPreferences } from '../components/profile/CurrencyPreferences';
import { AccountSettings } from '../components/profile/AccountSettings';

type ActiveTab = 'personal' | 'travel' | 'currency' | 'account';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('personal');

  // Saving states
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [formErrors, setFormErrors] = useState<{ name?: string }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load User and Preferences
  const loadProfile = () => {
    setIsLoading(true);
    setError(null);
    try {
      const user = authService.getCurrentUser();
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }
      setCurrentUser(user);
      setFullName(user.name || '');
      setEmail(user.email || '');
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');

      const prefs =
        profileService.getPreferences(user.id) || profileService.getDefaultPreferences(user.id);
      setPreferences(prefs);
    } catch (err) {
      console.error(err);
      setError("Couldn't load your profile.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handlePreferencesChange = (updates: Partial<UserPreferences>) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      ...updates,
    });
    setIsSaved(false);
  };

  const handleSave = () => {
    if (!currentUser || !preferences) return;

    // Validate
    const errors: { name?: string; email?: string } = {};
    if (!fullName.trim()) {
      errors.name = 'Full name is required';
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      errors.email = 'Enter a valid email address';
    }
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSaving(true);
    setIsSaved(false);

    try {
      const result = profileService.updateProfile(
        currentUser.id,
        {
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          bio: bio.trim(),
          avatarUrl,
          preferredCurrency: preferences.currency,
          languagePreference: preferences.languagePreference || 'English',
        },
        preferences
      );

      if (result.user) {
        setCurrentUser(result.user);
      }
      setPreferences(result.preferences);

      setIsSaving(false);
      setIsSaved(true);
      setToastMessage('Profile and preferences updated successfully!');

      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
      setIsSaving(false);
      setToastMessage('Failed to save changes. Please try again.');
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] p-4 sm:p-8 flex flex-col items-center justify-center">
        <div className="max-w-4xl w-full space-y-6 animate-pulse">
          <div className="h-32 bg-[#F4F1EA] rounded-3xl" />
          <div className="h-12 bg-[#F4F1EA] rounded-2xl w-2/3" />
          <div className="h-64 bg-[#F4F1EA] rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !currentUser || !preferences) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#EAE6DD] shadow-sm text-center">
          <AlertCircle className="w-10 h-10 text-[#D94F3D] mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[#17201D] mb-1">
            {error || "Couldn't load your profile."}
          </h2>
          <p className="text-xs text-[#68736F] mb-6">
            Please check your connection and try loading your profile again.
          </p>
          <button
            type="button"
            onClick={loadProfile}
            className="w-full py-3 rounded-2xl bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#17201D] flex flex-col font-sans selection:bg-[#FF6B4A]/20">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#17201D] text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#20B8A6]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Navigation */}
      <header className="sticky top-0 z-30 bg-[#FFFDF8]/90 backdrop-blur-md border-b border-[#EAE6DD] px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#EAE6DD] text-[#5E6B67] hover:text-[#17201D] hover:border-[#FF6B4A]/40 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#68736F] hidden sm:inline">GlobeTrotter Passport</span>
          <span className="w-2 h-2 rounded-full bg-[#20B8A6]" />
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6">
        {/* Profile Hero Header */}
        <ProfileHeader
          user={currentUser}
          preferences={preferences}
          isSaving={isSaving}
          isSaved={isSaved}
          onSave={handleSave}
        />

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1 bg-white border border-[#EAE6DD] rounded-2xl overflow-x-auto no-scrollbar shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'personal'
                ? 'bg-[#17201D] text-white shadow-sm'
                : 'text-[#68736F] hover:text-[#17201D]'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5 text-[#FF6B4A]" />
            <span>Personal Info</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('travel')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'travel'
                ? 'bg-[#17201D] text-white shadow-sm'
                : 'text-[#68736F] hover:text-[#17201D]'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#20B8A6]" />
            <span>Travel Preferences</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('currency')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'currency'
                ? 'bg-[#17201D] text-white shadow-sm'
                : 'text-[#68736F] hover:text-[#17201D]'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-[#FFB020]" />
            <span>Currency & Budget</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'account'
                ? 'bg-[#17201D] text-white shadow-sm'
                : 'text-[#68736F] hover:text-[#17201D]'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#5E6B67]" />
            <span>Security & Account</span>
          </button>
        </div>

        {/* Tab Panels */}
        <div className="space-y-6">
          {activeTab === 'personal' && (
            <PersonalInfo
              name={fullName}
                  email={email}
              bio={bio}
              avatarUrl={avatarUrl}
              errors={formErrors}
              onNameChange={(val) => {
                setFullName(val);
                setIsSaved(false);
              }}
              onEmailChange={(val) => {
                setEmail(val);
                setIsSaved(false);
              }}
              onBioChange={(val) => {
                setBio(val);
                setIsSaved(false);
              }}
              onAvatarSelect={(url) => {
                setAvatarUrl(url);
                setIsSaved(false);
              }}
            />
          )}

          {activeTab === 'travel' && (
            <TravelPreferences
              preferences={preferences}
              onChange={handlePreferencesChange}
            />
          )}

          {activeTab === 'currency' && (
            <CurrencyPreferences
              currency={preferences.currency}
              onCurrencyChange={(curr: CurrencyCode) => handlePreferencesChange({ currency: curr })}
            />
          )}

          {activeTab === 'personal' && (
            <div className="bg-white rounded-3xl border border-[#EAE6DD] p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-[#20B8A6]" />
                <div>
                  <h2 className="text-lg font-extrabold text-[#17201D]">Language Preference</h2>
                  <p className="text-xs text-[#68736F] mt-0.5">Choose the language used for your travel planning experience.</p>
                </div>
              </div>
              <select
                value={preferences.languagePreference || 'English'}
                onChange={(event) => handlePreferencesChange({ languagePreference: event.target.value })}
                className="w-full sm:max-w-xs px-3.5 py-2.5 rounded-2xl bg-[#FCFBF8] border border-[#EAE6DD] text-sm font-medium text-[#17201D] focus:outline-none focus:border-[#FF6B4A]"
              >
                <option>English</option>
                <option>Hindi</option>
                <option>Spanish</option>
                <option>French</option>
                <option>Japanese</option>
              </select>
            </div>
          )}

          {activeTab === 'personal' && (
            <div className="bg-white rounded-3xl border border-[#EAE6DD] p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-4 h-4 text-[#FF6B4A]" />
                <div>
                  <h2 className="text-lg font-extrabold text-[#17201D]">Saved Destinations</h2>
                  <p className="text-xs text-[#68736F] mt-0.5">Your favorite trips and saved places in one view.</p>
                </div>
              </div>
              {(() => {
                const savedTrips = currentUser ? tripService.getUserTrips(currentUser.id).filter((trip) => trip.isFavorite) : [];
                const savedPlaces = savedTrips.flatMap((trip) => (trip.items || []).map((item) => `${item.name} · ${trip.destination}`));
                const destinations = [...savedTrips.map((trip) => `${trip.destination}, ${trip.country}`), ...savedPlaces];
                return destinations.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {destinations.map((destination, index) => (
                      <div key={`${destination}-${index}`} className="flex items-center gap-2 p-3 rounded-2xl bg-[#FCFBF8] border border-[#EAE6DD] text-xs font-bold text-[#17201D]">
                        <MapPin className="w-3.5 h-3.5 text-[#FF6B4A] shrink-0" />
                        <span className="truncate">{destination}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-[#68736F]">No saved destinations yet. Favorite a trip to see it here.</p>;
              })()}
            </div>
          )}

          {activeTab === 'account' && (
            <AccountSettings onLogout={handleLogout} />
          )}
        </div>
      </main>
    </div>
  );
};
