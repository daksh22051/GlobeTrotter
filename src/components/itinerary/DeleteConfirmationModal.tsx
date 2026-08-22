import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  activityTitle: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  activityTitle,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#17201D]/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="relative w-full max-w-sm bg-[#FFFDF8] rounded-3xl p-6 shadow-2xl border border-[#EAE6DD] z-10 text-center animate-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-[#FFF0EC] text-[#E55837] flex items-center justify-center mx-auto mb-3">
          <Trash2 className="w-6 h-6" />
        </div>

        <h3 className="text-base font-extrabold text-[#17201D]">
          Remove Activity?
        </h3>
        <p className="text-xs text-[#68736F] mt-1 mb-6">
          Are you sure you want to remove <strong className="text-[#17201D]">"{activityTitle}"</strong> from your itinerary? You can re-add it anytime from recommendations.
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full bg-white border border-[#EAE6DD] hover:bg-[#F9F7F1] text-xs font-bold text-[#5E6B67] transition-colors cursor-pointer"
          >
            Keep It
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-full bg-[#E55837] hover:bg-[#C94727] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};
