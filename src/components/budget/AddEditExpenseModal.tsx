import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Edit2,
  Check,
  Calendar,
  DollarSign,
  AlertCircle,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  Sparkles,
} from 'lucide-react';
import { Trip } from '../../types/trip';
import { Expense, ExpenseCategory, PaymentMethod } from '../../types/budget';
import { CurrencyCode } from '../../types/profile';
import { SUPPORTED_CURRENCIES } from '../../utils/currency';
import { CATEGORY_METADATA } from '../../utils/budgetAllocator';

interface AddEditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expenseData: {
    id?: string;
    tripId: string;
    name: string;
    amount: number;
    currency: CurrencyCode;
    category: ExpenseCategory;
    date: string;
    paymentMethod?: PaymentMethod;
    notes?: string;
  }) => Promise<void>;
  trip: Trip;
  initialExpense?: Expense | null;
}

const CATEGORIES: ExpenseCategory[] = [
  'accommodation',
  'food',
  'transport',
  'activities',
  'shopping',
  'miscellaneous',
];

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { id: 'card', label: 'Card', icon: <CreditCard className="w-3.5 h-3.5" /> },
  { id: 'cash', label: 'Cash', icon: <Banknote className="w-3.5 h-3.5" /> },
  { id: 'upi', label: 'UPI', icon: <Smartphone className="w-3.5 h-3.5" /> },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: <Building className="w-3.5 h-3.5" /> },
  { id: 'other', label: 'Other', icon: <DollarSign className="w-3.5 h-3.5" /> },
];

export const AddEditExpenseModal: React.FC<AddEditExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  trip,
  initialExpense,
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(trip.currency || 'INR');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [date, setDate] = useState(
    trip.startDate || new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | undefined>('card');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (initialExpense) {
      setName(initialExpense.name);
      setAmount(initialExpense.amount.toString());
      setCurrency(initialExpense.currency || trip.currency || 'INR');
      setCategory(initialExpense.category);
      setDate(initialExpense.date);
      setPaymentMethod(initialExpense.paymentMethod);
      setNotes(initialExpense.notes || '');
    } else {
      setName('');
      setAmount('');
      setCurrency(trip.currency || 'INR');
      setCategory('food');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('card');
      setNotes('');
    }
    setErrors({});
    setIsSaved(false);
    setIsSaving(false);
  }, [initialExpense, isOpen, trip]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = 'Expense description/name is required';
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      errs.amount = 'Please enter a valid amount greater than 0';
    }

    if (!category) {
      errs.category = 'Please choose an expense category';
    }

    if (!date) {
      errs.date = 'Date is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);

    try {
      await onSave({
        id: initialExpense?.id,
        tripId: trip.id,
        name: name.trim(),
        amount: parseFloat(amount),
        currency,
        category,
        date,
        paymentMethod,
        notes: notes.trim() || undefined,
      });

      setIsSaved(true);
      setTimeout(() => {
        onClose();
      }, 500);
    } catch {
      setErrors({ form: 'Could not save this expense. Please try again.' });
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFFDF8] w-full max-w-lg rounded-3xl border border-[#EAE6DD] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#EAE6DD] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF2EE] border border-[#FFE0D6] flex items-center justify-center text-[#FF6B4A]">
              {initialExpense ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#17201D]">
                {initialExpense ? 'Edit Expense' : 'Log New Expense'}
              </h3>
              <p className="text-xs text-[#68736F]">
                {trip.destination} • {trip.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#FAF8F5] hover:bg-[#EAE6DD] text-[#5E6B67] hover:text-[#17201D] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {errors.form && (
            <div className="p-3 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-xs font-bold text-[#991B1B] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Expense Name */}
          <div>
            <label className="block text-xs font-black text-[#17201D] uppercase tracking-wider mb-1.5">
              Expense Name <span className="text-[#FF6B4A]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              placeholder="e.g. Traditional Ramen Lunch, Airport Metro Pass"
              className={`w-full px-4 py-2.5 rounded-2xl bg-white border text-sm text-[#17201D] placeholder-[#8A9591] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/20 transition-all ${
                errors.name ? 'border-[#EF4444]' : 'border-[#EAE6DD] focus:border-[#FF6B4A]'
              }`}
            />
            {errors.name && (
              <p className="text-[11px] font-bold text-[#EF4444] mt-1">{errors.name}</p>
            )}
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-black text-[#17201D] uppercase tracking-wider mb-1.5">
                Amount <span className="text-[#FF6B4A]">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (errors.amount) setErrors({ ...errors, amount: '' });
                  }}
                  placeholder="0.00"
                  className={`w-full px-4 py-2.5 rounded-2xl bg-white border text-sm font-bold text-[#17201D] placeholder-[#8A9591] focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/20 transition-all ${
                    errors.amount ? 'border-[#EF4444]' : 'border-[#EAE6DD] focus:border-[#FF6B4A]'
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="text-[11px] font-bold text-[#EF4444] mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-black text-[#17201D] uppercase tracking-wider mb-1.5">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full px-3 py-2.5 rounded-2xl bg-white border border-[#EAE6DD] text-xs font-bold text-[#17201D] focus:outline-none focus:border-[#FF6B4A]"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Cards (Beautiful Visual Selector) */}
          <div>
            <label className="block text-xs font-black text-[#17201D] uppercase tracking-wider mb-2">
              Category <span className="text-[#FF6B4A]">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const meta = CATEGORY_METADATA[cat];
                const isSelected = category === cat;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#17201D] text-white border-[#17201D] shadow-xs'
                        : 'bg-white text-[#17201D] border-[#EAE6DD] hover:border-[#C4BEB1]'
                    }`}
                  >
                    <span className="text-xl" role="img" aria-label={meta.label}>
                      {meta.icon}
                    </span>
                    <div>
                      <div className="text-xs font-extrabold leading-tight">
                        {meta.label}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.category && (
              <p className="text-[11px] font-bold text-[#EF4444] mt-1">{errors.category}</p>
            )}
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-[#17201D] uppercase tracking-wider mb-1.5">
                Date <span className="text-[#FF6B4A]">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#EAE6DD] text-xs font-bold text-[#17201D] focus:outline-none focus:border-[#FF6B4A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-[#17201D] uppercase tracking-wider mb-1.5">
                Payment Method
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      paymentMethod === m.id
                        ? 'bg-[#FF6B4A] text-white border-[#FF6B4A]'
                        : 'bg-white text-[#68736F] border-[#EAE6DD] hover:border-[#17201D]'
                    }`}
                  >
                    {m.icon}
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-black text-[#17201D] uppercase tracking-wider mb-1.5">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Split with Sarah, cash receipt in backpack pocket..."
              className="w-full px-4 py-2 rounded-2xl bg-white border border-[#EAE6DD] text-xs text-[#17201D] placeholder-[#8A9591] focus:outline-none focus:border-[#FF6B4A]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-full bg-[#FAF8F5] hover:bg-[#EAE6DD] text-[#17201D] text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving || isSaved}
              className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer ${
                isSaved
                  ? 'bg-[#10B981]'
                  : 'bg-[#FF6B4A] hover:bg-[#E55837] active:scale-95'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved ✓</span>
                </>
              ) : isSaving ? (
                <span>Saving...</span>
              ) : (
                <span>{initialExpense ? 'Save Changes' : 'Add Expense'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
