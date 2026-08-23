import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Expense } from '../../types/budget';
import { CurrencyCode } from '../../types/profile';
import { formatCurrency } from '../../utils/currency';
import { CATEGORY_METADATA } from '../../utils/budgetAllocator';

interface DeleteExpenseConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  expense: Expense | null;
  currency: CurrencyCode;
}

export const DeleteExpenseConfirmModal: React.FC<DeleteExpenseConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  expense,
  currency,
}) => {
  if (!isOpen || !expense) return null;

  const meta = CATEGORY_METADATA[expense.category] || CATEGORY_METADATA.miscellaneous;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-sm rounded-3xl border border-[#EAE6DD] shadow-2xl p-6 flex flex-col items-center text-center">
        {/* Warning Icon */}
        <div className="w-12 h-12 rounded-2xl bg-[#FEE2E2] border border-[#FECACA] text-[#EF4444] flex items-center justify-center mb-4 shadow-2xs">
          <Trash2 className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-black text-[#17201D] mb-1">
          Delete this expense?
        </h3>
        <p className="text-xs text-[#68736F] mb-4">
          This entry will be removed from your spending records and budget calculations. You can undo this action immediately after.
        </p>

        {/* Expense Summary Box */}
        <div className="w-full p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DD] mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-left">
            <span className="text-xl">{meta.icon}</span>
            <div>
              <div className="text-xs font-black text-[#17201D]">
                {expense.name}
              </div>
              <div className="text-[10px] font-bold text-[#8A9591]">
                {meta.label} • {expense.date}
              </div>
            </div>
          </div>
          <div className="text-sm font-black text-[#17201D]">
            {formatCurrency(expense.amount, expense.currency || currency)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full bg-[#FAF8F5] hover:bg-[#EAE6DD] text-[#17201D] text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-full bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
