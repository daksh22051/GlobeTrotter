import React from 'react';
import { X, Sparkles, CheckCircle2, Download, Printer, FileText, AlertCircle } from 'lucide-react';
import { travelGuideService, PDF_GENERATION_STEPS } from '../../services/travelGuideService';

interface PDFDownloadModalProps {
  isOpen: boolean;
  tripId: string;
  tripName: string;
  step: number;
  stepLabel: string;
  isReady: boolean;
  error?: string | null;
  onClose: () => void;
  onRetry: () => void;
}

export const PDFDownloadModal: React.FC<PDFDownloadModalProps> = ({
  isOpen,
  tripId,
  tripName,
  step,
  stepLabel,
  isReady,
  error,
  onClose,
  onRetry,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    travelGuideService.printGuide();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl border border-[#EAE6DD] shadow-2xl p-6 sm:p-8 overflow-hidden animate-in zoom-in-95 duration-200 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#838F8B] hover:text-[#17201D] hover:bg-[#F4F1EA] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#FF6B4A] to-[#FF8E72] text-white flex items-center justify-center mx-auto mb-4 shadow-md shadow-[#FF6B4A]/25">
          {isReady ? <CheckCircle2 className="w-8 h-8 text-[#FFF275]" /> : <FileText className="w-8 h-8" />}
        </div>

        <h3 className="text-xl font-black text-[#17201D] tracking-tight mb-1">
          {isReady ? 'Travel Guide Ready' : 'Generating Personal PDF Guide'}
        </h3>
        <p className="text-xs text-[#68736F] mb-6">
          {tripName} · Editorial Travel Dossier
        </p>

        {error ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#FFF2EE] border border-[#FFE0D6] text-xs font-bold text-[#D94F3D] flex items-center gap-2 text-left">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={onRetry}
              className="w-full py-3 rounded-2xl bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Retry Generation
            </button>
          </div>
        ) : !isReady ? (
          <div className="space-y-5">
            {/* Step Progress List */}
            <div className="space-y-2.5 text-left bg-[#FCFBF8] p-4 rounded-2xl border border-[#EAE6DD]">
              {PDF_GENERATION_STEPS.map((s) => {
                const isCurrent = step === s.step;
                const isCompleted = step > s.step;
                return (
                  <div key={s.step} className="flex items-center gap-3 text-xs">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-[#20B8A6] shrink-0" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 border-2 border-[#FF6B4A] border-t-transparent rounded-full animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-[#D1CBC0] shrink-0" />
                    )}
                    <span
                      className={`truncate ${
                        isCurrent
                          ? 'font-bold text-[#FF6B4A]'
                          : isCompleted
                          ? 'font-semibold text-[#17201D]'
                          : 'text-[#98A29F]'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-xs font-semibold text-[#838F8B] animate-pulse">
              {stepLabel || 'Formatting travel magazine...'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#E8F8F5] border border-[#20B8A6]/20 text-left space-y-1">
              <p className="text-xs font-bold text-[#179E8E] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Dossier Compiled Successfully
              </p>
              <p className="text-[11px] text-[#556960] leading-relaxed">
                Includes cover page, day-by-day timetable, curated attractions, culinary picks, and budget matrix.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs font-black transition-colors shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Save to PDF / Print</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#F4F1EA] text-xs font-bold text-[#68736F] transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
