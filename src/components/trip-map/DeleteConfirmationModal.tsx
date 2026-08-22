import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { ItineraryActivity } from '../../types/itinerary';
import { MapMarkerLocation } from '../../types/map';

interface DeleteConfirmationModalProps {
  activity: ItineraryActivity | MapMarkerLocation | null;
  dayNumber: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  activity,
  dayNumber,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !activity) return null;

  const title = (activity as any).name || (activity as any).title;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm rounded-2xl bg-[#FFFDF8] border border-[#EAE6DD] shadow-2xl p-6 overflow-hidden font-sans z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-2xl bg-[#FFF0ED] text-[#E55837] flex items-center justify-center text-xl mx-auto mb-3">
          <Trash2 className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1.5">
          <h3 className="text-base font-black text-[#17201D]">
            Remove this place from itinerary?
          </h3>
          <p className="text-xs text-[#68736F] leading-relaxed">
            "<span className="font-bold text-[#17201D]">{title}</span>" will be removed from Day {dayNumber}. You can undo this action immediately.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 mt-6 pt-3 border-t border-[#F4F1EA]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-white border border-[#EAE6DD] hover:bg-[#F9F7F1] text-[#5E6B67] text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2 rounded-xl bg-[#E55837] hover:bg-[#D44726] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            Remove Place
          </button>
        </div>
      </div>
    </div>
  );
};
