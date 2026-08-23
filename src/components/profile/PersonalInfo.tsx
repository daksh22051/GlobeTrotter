import React from 'react';
import { User as UserIcon, Mail, FileText, Image as ImageIcon } from 'lucide-react';

interface PersonalInfoProps {
  name: string;
  email: string;
  bio: string;
  avatarUrl: string;
  errors: { name?: string; email?: string };
  onNameChange: (val: string) => void;
  onEmailChange: (val: string) => void;
  onBioChange: (val: string) => void;
  onAvatarSelect: (url: string) => void;
}

const PRESET_AVATARS = [
  { label: 'Woman · Professional', gender: 'Female', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=85' },
  { label: 'Man · Professional', gender: 'Male', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=85' },
  { label: 'Woman · Creative', gender: 'Female', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=85' },
  { label: 'Man · Explorer', gender: 'Male', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=85' },
];

export const PersonalInfo: React.FC<PersonalInfoProps> = ({
  name,
  email,
  bio,
  avatarUrl,
  errors,
  onNameChange,
  onEmailChange,
  onBioChange,
  onAvatarSelect,
}) => {
  return (
    <div className="bg-white rounded-3xl border border-[#EAE6DD] p-6 sm:p-8 shadow-xs space-y-6">
      <div>
        <h2 className="text-lg font-extrabold text-[#17201D] tracking-tight">Personal Information</h2>
        <p className="text-xs text-[#68736F] mt-0.5">
          Update your public explorer profile and contact details.
        </p>
      </div>

      {/* Preset Avatar Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-[#17201D] flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-[#FF6B4A]" />
          <span>Choose Avatar Preset</span>
        </label>
        <div className="flex items-center gap-3 overflow-x-auto py-1">
          {PRESET_AVATARS.map((avatar) => (
            <button
              key={avatar.url}
              type="button"
              onClick={() => onAvatarSelect(avatar.url)}
              className={`relative rounded-2xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                avatarUrl === avatar.url
                  ? 'border-[#FF6B4A] scale-105 shadow-md ring-2 ring-[#FF6B4A]/20'
                  : 'border-[#EAE6DD] hover:border-[#17201D]/40 opacity-80 hover:opacity-100'
              }`}
            >
              <img src={avatar.url} alt={avatar.label} className="w-14 h-14 object-cover" />
              <span className="absolute bottom-0 inset-x-0 bg-black/55 px-1 py-0.5 text-[8px] font-bold text-white">{avatar.gender}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label htmlFor="profile-name" className="block text-xs font-bold text-[#17201D]">
            Full Name <span className="text-[#FF6B4A]">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#838F8B]">
              <UserIcon className="w-4 h-4" />
            </div>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g. Taylor Reed"
              className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FCFBF8] border text-xs sm:text-sm font-medium text-[#17201D] placeholder-[#98A29F] focus:bg-white focus:outline-none transition-all ${
                errors.name
                  ? 'border-[#D94F3D] focus:ring-2 focus:ring-[#D94F3D]/20'
                  : 'border-[#EAE6DD] focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20'
              }`}
            />
          </div>
          {errors.name && <p className="text-[11px] font-bold text-[#D94F3D]">{errors.name}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="profile-email" className="block text-xs font-bold text-[#17201D]">
              Email Address
            </label>
            {errors.email && <span className="text-[10px] font-bold text-[#D94F3D]">{errors.email}</span>}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#838F8B]">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FCFBF8] border border-[#EAE6DD] text-xs sm:text-sm font-medium text-[#17201D] focus:bg-white focus:outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-1.5">
        <label htmlFor="profile-bio" className="block text-xs font-bold text-[#17201D] flex items-center gap-1">
          <FileText className="w-3.5 h-3.5 text-[#20B8A6]" />
          <span>Traveler Bio</span>
        </label>
        <textarea
          id="profile-bio"
          rows={3}
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
          placeholder="Share your travel philosophy, favorite destinations, or dream adventures..."
          className="w-full p-3.5 rounded-2xl bg-[#FCFBF8] border border-[#EAE6DD] text-xs sm:text-sm font-medium text-[#17201D] placeholder-[#98A29F] focus:bg-white focus:outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 transition-all resize-none"
        />
      </div>
    </div>
  );
};
