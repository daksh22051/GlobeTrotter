import React from 'react';
import { Trip } from '../../types/trip';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteTripModalProps {
  isOpen: boolean;
  trip: Trip | null;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export const DeleteTripModal: React.FC<DeleteTripModalProps> = ({
  isOpen,
  trip,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  if (!isOpen || !trip) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#17201D]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#EAE6DD] overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        {/* Header */}
        <div className="p-6 pb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0F0] text-[#E5484D] flex items-center justify-center shrink-0 border border-[#FDB8B8]">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 id="delete-modal-title" className="text-lg font-extrabold text-[#17201D]">
                Delete this trip?
              </h3>
              <p className="text-xs text-[#E5484D] font-bold mt-0.5">
                Destructive action
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

        {/* Body */}
        <div className="px-6 py-2 space-y-4">
          <p className="text-sm text-[#556960] leading-relaxed">
            Are you sure you want to delete <strong className="text-[#17201D] font-bold">&ldquo;{trip.name}&rdquo;</strong>? This will permanently remove the trip and its planning data.
          </p>

          <div className="p-3.5 rounded-2xl bg-[#FFF0F0] border border-[#FDB8B8] flex items-start gap-2.5 text-xs text-[#C72E33]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              All itinerary stops, timeline entries, and associated budget breakdowns for this journey will be removed. You can undo immediately after deletion.
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="p-6 pt-4 flex items-center justify-end gap-3 border-t border-[#F4F1EA] mt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 rounded-xl border border-[#EAE6DD] hover:bg-[#FAF8F5] text-xs font-bold text-[#17201D] transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#E5484D] hover:bg-[#C72E33] text-white text-xs font-bold shadow-md shadow-[#E5484D]/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <span>Deleting...</span>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Trip</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
