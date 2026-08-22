import React from 'react';
import { Trip } from '../../types/trip';
import { Copy, X, Sparkles, Check } from 'lucide-react';

interface DuplicateTripModalProps {
  isOpen: boolean;
  trip: Trip | null;
  onClose: () => void;
  onConfirm: () => void;
  isDuplicating?: boolean;
}

export const DuplicateTripModal: React.FC<DuplicateTripModalProps> = ({
  isOpen,
  trip,
  onClose,
  onConfirm,
  isDuplicating = false,
}) => {
  if (!isOpen || !trip) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#17201D]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#EAE6DD] overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="duplicate-modal-title"
      >
        {/* Header */}
        <div className="p-6 pb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF8ED] text-[#E08A00] flex items-center justify-center shrink-0">
              <Copy className="w-6 h-6" />
            </div>
            <div>
              <h3 id="duplicate-modal-title" className="text-lg font-extrabold text-[#17201D]">
                Duplicate this trip?
              </h3>
              <p className="text-xs text-[#68736F] mt-0.5">
                Creating a new draft from &ldquo;{trip.name}&rdquo;
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#8C9B95] hover:text-[#17201D] rounded-full hover:bg-[#F4F1EA] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 py-2 space-y-4">
          <p className="text-sm text-[#556960] leading-relaxed">
            Your itinerary, preferences and planning structure will be copied into a new draft journey named{' '}
            <strong className="text-[#17201D] font-bold">{trip.name} (Copy)</strong>.
          </p>

          <div className="bg-[#FAF8F5] rounded-2xl p-3.5 border border-[#EAE6DD] space-y-2 text-xs text-[#556960]">
            <div className="font-bold text-[#17201D] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6B4A]" />
              What will be copied:
            </div>
            <ul className="space-y-1 pl-5 list-disc">
              <li>Destination, duration, and traveler preferences</li>
              <li>Complete day-by-day itinerary activities structure</li>
              <li>Bookmarked places and travel style tags</li>
              <li>Fresh draft status ready for customized editing</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-4 flex items-center justify-end gap-3 border-t border-[#F4F1EA] mt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isDuplicating}
            className="px-4 py-2.5 rounded-xl border border-[#EAE6DD] hover:bg-[#FAF8F5] text-xs font-bold text-[#17201D] transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDuplicating}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B4A] to-[#FF8E72] hover:from-[#E85535] hover:to-[#FF7859] text-white text-xs font-bold shadow-md shadow-[#FF6B4A]/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {isDuplicating ? (
              <span>Duplicating...</span>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate Trip</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
