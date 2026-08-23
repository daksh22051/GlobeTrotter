import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Mail,
  UserPlus,
  Globe2,
  Lock,
  Calendar,
  MapPin,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';
import { Trip } from '../../types/trip';
import { Collaborator, CollaboratorRole, SharePermission, SharedTripLink } from '../../types/sharing';
import { sharingService } from '../../services/sharingService';
import { authService } from '../../services/authService';
import { CollaboratorList } from './CollaboratorList';

interface ShareTripModalProps {
  isOpen: boolean;
  trip: Trip;
  onClose: () => void;
}

export const ShareTripModal: React.FC<ShareTripModalProps> = ({ isOpen, trip, onClose }) => {
  const [activeTab, setActiveTab] = useState<'link' | 'invite'>('link');
  const [shareLink, setShareLink] = useState<SharedTripLink | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  // Invite Form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<CollaboratorRole>('viewer');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const currentUser = authService.getCurrentUser();

  // Load share link and collaborators on open
  useEffect(() => {
    if (isOpen && trip) {
      const link = sharingService.createShareLink(trip.id, 'view');
      setShareLink(link);
      setCollaborators(sharingService.getCollaborators(trip.id));
      setIsCopied(false);
      setInviteSuccess(false);
      setInviteError(null);
    }
  }, [isOpen, trip]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !trip) return null;

  const fullShareUrl = `${window.location.origin}/shared-trip/${shareLink?.shareToken || trip.id}`;

  const handleCopyLink = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullShareUrl);
      } else {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = fullShareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  const handlePermissionChange = (perm: SharePermission) => {
    if (!shareLink) return;
    const updated = sharingService.createShareLink(trip.id, perm);
    setShareLink(updated);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);

    const email = inviteEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInviteError('Please provide a valid email address');
      return;
    }

    try {
      sharingService.inviteCollaborator(trip.id, email, inviteRole, inviteMessage);
      setCollaborators(sharingService.getCollaborators(trip.id));
      setInviteEmail('');
      setInviteMessage('');
      setInviteSuccess(true);
      setTimeout(() => setInviteSuccess(false), 3500);
    } catch (err) {
      console.error(err);
      setInviteError("Couldn't send invite. Please try again.");
    }
  };

  const handleUpdateCollaboratorPermission = (collabId: string, role: CollaboratorRole) => {
    sharingService.updatePermission(trip.id, collabId, role);
    setCollaborators(sharingService.getCollaborators(trip.id));
  };

  const handleRemoveCollaborator = (collabId: string) => {
    sharingService.removeCollaborator(trip.id, collabId);
    setCollaborators(sharingService.getCollaborators(trip.id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl border border-[#EAE6DD] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Trip Thumbnail */}
        <div className="relative p-6 bg-gradient-to-b from-[#FCFBF8] to-white border-b border-[#EAE6DD]">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-[#838F8B] hover:text-[#17201D] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5 pr-8">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-[#EAE6DD] shadow-xs">
              <img
                src={
                  trip.coverImage ||
                  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=300&q=80'
                }
                alt={trip.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-[#FF6B4A] font-bold uppercase tracking-wider mb-0.5">
                <Share2 className="w-3.5 h-3.5" />
                <span>Share your trip</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#17201D] tracking-tight truncate">
                {trip.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-[#68736F]">
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-[#FF6B4A]" />
                  {trip.destination}
                </span>
                <span>·</span>
                <span>{trip.dateDisplay || `${trip.durationDays} Days`}</span>
              </div>
            </div>
          </div>

          {/* Modal Tab Switcher */}
          <div className="flex items-center gap-2 mt-5 p-1 bg-[#F4F1EA] rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab('link')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'link'
                  ? 'bg-white text-[#17201D] shadow-2xs'
                  : 'text-[#68736F] hover:text-[#17201D]'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5 text-[#20B8A6]" />
              <span>Shareable Link</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('invite')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'invite'
                  ? 'bg-white text-[#17201D] shadow-2xs'
                  : 'text-[#68736F] hover:text-[#17201D]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-[#FF6B4A]" />
              <span>Invite Friends</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Shareable Link */}
        {activeTab === 'link' && (
          <div className="p-6 space-y-6">
            {/* Link Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#17201D] flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-[#20B8A6]" />
                  <span>Public Itinerary Link</span>
                </label>
                <span className="text-[10px] font-bold text-[#20B8A6] px-2 py-0.5 rounded-full bg-[#E8F8F5]">
                  Read-only view
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 px-3.5 py-2.5 rounded-2xl bg-[#FCFBF8] border border-[#EAE6DD] text-xs font-mono text-[#5E6B67] truncate select-all">
                  {fullShareUrl}
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs ${
                    isCopied
                      ? 'bg-[#20B8A6] text-white shadow-[#20B8A6]/20'
                      : 'bg-[#17201D] hover:bg-[#FF6B4A] text-white'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Link copied ✓</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-[#838F8B] leading-relaxed">
                Anyone with this link can view the complete itinerary, interactive map, and curated
                recommendations without editing permissions or accessing private notes.
              </p>
            </div>

            {/* Collaborators preview */}
            <div className="border-t border-[#F4F1EA] pt-5">
              <CollaboratorList
                ownerName={currentUser?.name || 'You'}
                ownerEmail={currentUser?.email}
                collaborators={collaborators}
                onUpdatePermission={handleUpdateCollaboratorPermission}
                onRemoveCollaborator={handleRemoveCollaborator}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Invite Friends Form */}
        {activeTab === 'invite' && (
          <div className="p-6 space-y-6">
            <form onSubmit={handleSendInvite} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#17201D]">
                  Friend's Email Address <span className="text-[#FF6B4A]">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#838F8B]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="e.g. friend@example.com"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-[#FCFBF8] border border-[#EAE6DD] text-xs font-medium text-[#17201D] placeholder-[#98A29F] focus:bg-white focus:outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-[#FF6B4A]/20 transition-all"
                    />
                  </div>

                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as CollaboratorRole)}
                    className="px-3 py-2.5 rounded-2xl bg-[#FCFBF8] border border-[#EAE6DD] text-xs font-bold text-[#17201D] focus:outline-none cursor-pointer"
                  >
                    <option value="viewer">Can view</option>
                    <option value="editor">Can edit</option>
                  </select>
                </div>
                {inviteError && <p className="text-[11px] font-bold text-[#D94F3D]">{inviteError}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#17201D]">
                  Custom Note <span className="text-[#838F8B] font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Hey! Check out our upcoming journey to..."
                  className="w-full p-3 rounded-2xl bg-[#FCFBF8] border border-[#EAE6DD] text-xs font-medium text-[#17201D] placeholder-[#98A29F] focus:bg-white focus:outline-none focus:border-[#FF6B4A] transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs font-black transition-colors cursor-pointer shadow-xs"
              >
                <UserPlus className="w-4 h-4" />
                <span>Send Invitation</span>
              </button>

              {inviteSuccess && (
                <div className="p-3 rounded-2xl bg-[#E8F8F5] border border-[#20B8A6]/30 text-xs font-bold text-[#179E8E] flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#20B8A6]" />
                  <span>Invitation created & sent!</span>
                </div>
              )}
            </form>

            {/* Collaborators list */}
            <div className="border-t border-[#F4F1EA] pt-4">
              <CollaboratorList
                ownerName={currentUser?.name || 'You'}
                ownerEmail={currentUser?.email}
                collaborators={collaborators}
                onUpdatePermission={handleUpdateCollaboratorPermission}
                onRemoveCollaborator={handleRemoveCollaborator}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#FAF8F5] border-t border-[#EAE6DD] flex items-center justify-between text-xs text-[#838F8B]">
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-[#20B8A6]" />
            Private expenses & tokens are shielded
          </span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-[#17201D] hover:underline cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
