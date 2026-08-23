import React from 'react';
import { X, Download, FileText, CheckCircle2, Sparkles } from 'lucide-react';
import { Trip } from '../../types/trip';

interface ExportTripModalProps {
  isOpen: boolean;
  trip: Trip;
  onClose: () => void;
}

export const ExportTripModal: React.FC<ExportTripModalProps> = ({
  isOpen,
  trip,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#17201D]/50 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="relative w-full max-w-md bg-[#FFFDF8] rounded-3xl p-6 shadow-2xl border border-[#EAE6DD] z-10 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#EAE6DD]">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-[#20B8A6]" />
            <h3 className="text-base font-extrabold text-[#17201D]">
              Export Trip Guide
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
          <div className="w-14 h-14 rounded-2xl bg-[#E8F8F5] text-[#20B8A6] flex items-center justify-center mx-auto mb-4 border border-[#20B8A6]/20">
            <FileText className="w-7 h-7" />
          </div>

          <h4 className="text-base font-black text-[#17201D]">
            PDF & Offline Itinerary Export
          </h4>
          <p className="text-xs text-[#556960] mt-1.5 max-w-xs mx-auto">
            A printable offline pocket guide for <strong>{trip.destination}</strong> with daily timelines, maps, and reservation barcodes will be generated in an upcoming update.
          </p>

          <div className="mt-5 p-3 rounded-2xl bg-[#FAF7EE] border border-[#EAE6DD] text-left text-xs text-[#556960] space-y-1.5">
            <div className="flex items-center gap-2 text-[#17201D] font-bold">
              <CheckCircle2 className="w-4 h-4 text-[#20B8A6]" />
              <span>Full multi-day chronological timeline</span>
            </div>
            <div className="flex items-center gap-2 text-[#17201D] font-bold">
              <CheckCircle2 className="w-4 h-4 text-[#20B8A6]" />
              <span>Transit routes & emergency contact card</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#EAE6DD]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#17201D] hover:bg-[#2A3833] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
