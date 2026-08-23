import React from 'react';
import { User as UserIcon, Sparkles, CheckCircle2, ShieldCheck, Camera, Calendar } from 'lucide-react';
import { User } from '../../types';
import { UserPreferences } from '../../types/profile';

interface ProfileHeaderProps {
  user: User;
  preferences: UserPreferences;
  isSaving: boolean;
  isSaved: boolean;
  onSave: () => void;
  onAvatarClick?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  preferences,
  isSaving,
  isSaved,
  onSave,
  onAvatarClick,
}) => {
  const memberSince = user.memberSince || 'November 2026';
  const initials = (user.name || 'TR')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="w-full bg-white rounded-3xl border border-[#EAE6DD] shadow-sm relative overflow-hidden">
      <div className="h-28 sm:h-36 bg-gradient-to-r from-[#DDF7F2] via-[#FFF4D6] to-[#FFEAE5]" />

      <div className="relative z-10 -mt-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5 p-6 sm:p-8">
        {/* Left: Avatar + Identity */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="relative group">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-white shadow-md ring-2 ring-[#EAE6DD]"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-[#FF6B4A] via-[#FF8E72] to-[#20B8A6] text-white flex items-center justify-center text-2xl font-black shadow-md">
                {initials}
              </div>
            )}

            {onAvatarClick && (
              <button
                type="button"
                onClick={onAvatarClick}
                className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-[#17201D] text-white hover:bg-[#FF6B4A] transition-colors shadow-sm cursor-pointer"
                title="Change Avatar"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#17201D] tracking-tight">
                {user.name}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E8F8F5] text-[#179E8E] text-[11px] font-bold border border-[#20B8A6]/20">
                <ShieldCheck className="w-3 h-3" />
                Verified Explorer
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#68736F] font-medium">{user.email}</p>

            <div className="flex items-center gap-4 pt-1 text-xs text-[#838F8B]">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#20B8A6]" />
                Member since {memberSince}
              </span>
              <span>·</span>
              <span className="capitalize font-semibold text-[#17201D]">
                {preferences.travelPersonality || 'Explorer'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Save CTA */}
        <div className="w-full sm:w-auto flex items-center gap-3">
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all shadow-sm cursor-pointer ${
              isSaved
                ? 'bg-[#20B8A6] text-white shadow-[#20B8A6]/25'
                : 'bg-[#FF6B4A] hover:bg-[#E55837] text-white shadow-[#FF6B4A]/25'
            }`}
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Saved ✓</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#FFF275]" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
