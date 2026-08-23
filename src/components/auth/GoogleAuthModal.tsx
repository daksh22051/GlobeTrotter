import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, ShieldCheck, ArrowRight, Check } from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: { email: string; name: string; avatarUrl?: string }) => void;
  isLoading?: boolean;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
  isLoading = false,
}) => {
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  const presetAccounts = [
    {
      name: 'Daksh Khamar',
      email: 'dakshkhamar78@gmail.com',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Daksh%20Khamar%2078',
      tag: 'Primary Google Account',
    },
    {
      name: 'Daksh Khamar',
      email: 'Dakshkhamar22@gmail.com',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Daksh%20Khamar',
      tag: 'Personal',
    },
    {
      name: 'Alex Morgan',
      email: 'alex.morgan@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      tag: 'Traveler Profile',
    },
  ];

  const handleSelect = (account: { email: string; name: string; avatarUrl?: string }) => {
    setSelectedEmail(account.email);
    onSelectAccount(account);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) return;
    const name = customName.trim() || customEmail.split('@')[0];
    handleSelect({
      email: customEmail.trim().toLowerCase(),
      name,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isLoading ? undefined : onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Google Authentication Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#EAE6DD] overflow-hidden z-10"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#EAE6DD] flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Authentic Google Icon */}
              <div className="w-10 h-10 rounded-2xl bg-[#FFFDF8] border border-[#EAE6DD] flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#17201D]">Sign in with Google</h3>
                <p className="text-xs text-[#68736F]">to continue to GlobeTrotter</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="p-2 rounded-full text-[#68736F] hover:text-[#17201D] hover:bg-[#FFF8ED] transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body: Account List */}
          <div className="p-6 space-y-3">
            <p className="text-xs font-semibold text-[#8C9894] uppercase tracking-wider mb-2">
              Choose an account
            </p>

            <div className="space-y-2.5">
              {presetAccounts.map((account) => {
                const isThisSelected = selectedEmail === account.email && isLoading;

                return (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => handleSelect(account)}
                    disabled={isLoading}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                      isThisSelected
                        ? 'border-[#FF6B4A] bg-[#FFF8ED] shadow-sm'
                        : 'border-[#EAE6DD] hover:border-[#FF6B4A]/60 hover:bg-[#FFFDF8] hover:shadow-[0_2px_12px_rgba(23,32,29,0.04)]'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={account.avatarUrl}
                        alt={account.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border border-[#EAE6DD] shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-[#17201D] truncate">{account.name}</p>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFE4DD] text-[#FF6B4A] shrink-0">
                            {account.tag}
                          </span>
                        </div>
                        <p className="text-xs text-[#68736F] truncate">{account.email}</p>
                      </div>
                    </div>

                    {isThisSelected ? (
                      <span className="inline-block h-4 w-4 rounded-full border-2 border-[#FF6B4A] border-t-transparent animate-spin shrink-0 ml-2" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-[#8C9894] shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Google Account Option */}
            {!showCustomInput ? (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                disabled={isLoading}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-dashed border-[#D1CCC0] hover:border-[#FF6B4A] hover:bg-[#FFF8ED]/40 transition-colors text-left cursor-pointer mt-2 text-xs font-semibold text-[#17201D]"
              >
                <div className="w-8 h-8 rounded-full bg-[#EAE6DD]/60 flex items-center justify-center text-[#68736F]">
                  <Plus className="w-4 h-4" />
                </div>
                <span>Use another Google account</span>
              </button>
            ) : (
              <form onSubmit={handleCustomSubmit} className="mt-3 p-4 rounded-2xl bg-[#FFF8ED] border border-[#FFE4DD] space-y-3">
                <div className="text-xs font-bold text-[#17201D]">Enter Google Account Email</div>
                <input
                  type="email"
                  placeholder="e.g. dakshkhamar78@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE6DD] text-xs text-[#17201D] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/30 focus:border-[#FF6B4A]"
                />
                <input
                  type="text"
                  placeholder="Full Name (optional)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE6DD] text-xs text-[#17201D] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/30 focus:border-[#FF6B4A]"
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#68736F] hover:text-[#17201D]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !customEmail}
                    className="px-4 py-1.5 rounded-lg bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? 'Verifying...' : 'Sign In'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer Security Badge */}
          <div className="px-6 py-4 bg-[#FFFDF8] border-t border-[#EAE6DD] flex items-center justify-between text-[11px] text-[#68736F]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#20B8A6]" />
              <span>Integrated with Local PostgreSQL Database</span>
            </div>
            <span className="font-semibold text-[#17201D]">Fast & Secure</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
