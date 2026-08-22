import React, { useState } from 'react';
import { X, Share2, Copy, Check, Users, Sparkles } from 'lucide-react';
import { Trip } from '../../types/trip';

interface ShareTripModalProps {
  isOpen: boolean;
  trip: Trip;
  onClose: () => void;
}

export const ShareTripModal: React.FC<ShareTripModalProps> = ({
  isOpen,
  trip,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#17201D]/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="relative w-full max-w-md bg-[#FFFDF8] rounded-3xl p-6 shadow-2xl border border-[#EAE6DD] z-10 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#EAE6DD]">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#FF6B4A]" />
            <h3 className="text-base font-extrabold text-[#17201D]">
              Share Trip Itinerary
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#838F8B] hover:text-[#17201D] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FFEAE5] text-[#FF6B4A] flex items-center justify-center mx-auto mb-4 border border-[#FF6B4A]/20">
            <Users className="w-7 h-7" />
          </div>

          <h4 className="text-base font-black text-[#17201D]">
            Collaborate with Travel Companions
          </h4>
          <p className="text-xs text-[#556960] mt-1.5 max-w-xs mx-auto">
            Share your itinerary with friends or family traveling to <strong>{trip.destination}</strong>.
          </p>

          <div className="mt-5 flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 rounded-xl bg-[#FAF7EE] border border-[#EAE6DD] text-xs text-[#556960] font-mono focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#17201D] text-white hover:bg-[#2A3833] text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#20B8A6]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#EAE6DD]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white border border-[#EAE6DD] hover:bg-[#F4F1EA] text-xs font-bold text-[#556960] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
