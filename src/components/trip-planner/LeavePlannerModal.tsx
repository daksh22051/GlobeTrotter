import React from 'react';
import { Modal } from '../ui/Modal';
import { Bookmark, Trash2, ArrowLeft, Sparkles } from 'lucide-react';

interface LeavePlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDraftAndLeave: () => void;
  onDiscardAndLeave: () => void;
}

export const LeavePlannerModal: React.FC<LeavePlannerModalProps> = ({
  isOpen,
  onClose,
  onSaveDraftAndLeave,
  onDiscardAndLeave,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Save your trip draft?"
      size="md"
    >
      <div className="space-y-5 text-left">
        <p className="text-sm text-[#5E6B67] leading-relaxed">
          You have unsaved changes in your trip planner. Would you like to save your progress as a draft so you can pick up right where you left off?
        </p>

        <div className="p-3.5 rounded-2xl bg-[#FFF9F6] border border-[#FFD9CE] flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#FF6B4A] text-white flex items-center justify-center shrink-0">
            <Bookmark className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-[#8C341F]">
            Drafts will be automatically loaded the next time you open the Trip Planner.
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          {/* Action 1: Save Draft & Exit */}
          <button
            type="button"
            onClick={onSaveDraftAndLeave}
            className="w-full py-3 px-4 rounded-full bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs sm:text-sm font-extrabold shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Bookmark className="w-4 h-4" />
            <span>Save Draft & Exit</span>
          </button>

          {/* Action 2: Continue Planning */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-full bg-white hover:bg-[#F9F7F1] text-[#17201D] text-xs sm:text-sm font-bold border border-[#EAE6DD] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue Planning</span>
          </button>

          {/* Action 3: Discard */}
          <button
            type="button"
            onClick={onDiscardAndLeave}
            className="w-full py-2 text-xs font-bold text-[#E55837] hover:text-[#C43818] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Discard Changes & Leave</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
