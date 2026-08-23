import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  SlidersHorizontal,
  Edit2,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  Calendar,
  Filter,
} from 'lucide-react';
import { Trip } from '../../types/trip';
import { Expense, ExpenseCategory } from '../../types/budget';
import { formatCurrency } from '../../utils/currency';
import { CATEGORY_METADATA } from '../../utils/budgetAllocator';

interface ExpenseListSectionProps {
  trip: Trip;
  expenses: Expense[];
  onOpenAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expense: Expense) => void;
}

export const ExpenseListSection: React.FC<ExpenseListSectionProps> = ({
  trip,
  expenses,
  onOpenAddExpense,
  onEditExpense,
  onDeleteExpense,
}) => {
  const currency = trip.currency || 'INR';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter expenses
  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exp.notes && exp.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'all' || exp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Helper for Payment Method Icon
  const getPaymentBadge = (method?: string) => {
    if (!method) return null;
    switch (method) {
      case 'card':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#1E40AF] text-[10px] font-bold border border-[#BFDBFE]">
            <CreditCard className="w-2.5 h-2.5" />
            <span>Card</span>
          </span>
        );
      case 'cash':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#ECFDF5] text-[#065F46] text-[10px] font-bold border border-[#A7F3D0]">
            <Banknote className="w-2.5 h-2.5" />
            <span>Cash</span>
          </span>
        );
      case 'upi':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F5F3FF] text-[#6D28D9] text-[10px] font-bold border border-[#DDD6FE]">
            <Smartphone className="w-2.5 h-2.5" />
            <span>UPI</span>
          </span>
        );
      case 'bank_transfer':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF8F5] text-[#17201D] text-[10px] font-bold border border-[#EAE6DD]">
            <Building className="w-2.5 h-2.5" />
            <span>Bank</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#475569] text-[10px] font-bold border border-[#CBD5E1]">
            <span>{method}</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE6DD] shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#FFF2EE] border border-[#FFE0D6] flex items-center justify-center text-[#FF6B4A] shadow-2xs">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#17201D] tracking-tight">
              Recent Expenses
            </h2>
            <p className="text-xs text-[#68736F]">
              {expenses.length} logged {expenses.length === 1 ? 'transaction' : 'transactions'} • Totaling{' '}
              <strong className="text-[#17201D]">
                {formatCurrency(
                  expenses.reduce((s, e) => s + e.amount, 0),
                  currency
                )}
              </strong>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAddExpense}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#17201D] hover:bg-[#2A3833] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-5">
        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#8A9591] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expenses..."
            className="w-full pl-9 pr-3.5 py-1.5 bg-[#FAF8F5] border border-[#EAE6DD] rounded-full text-xs text-[#17201D] placeholder-[#8A9591] focus:outline-none focus:border-[#FF6B4A]"
          />
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#17201D] text-white shadow-2xs'
                : 'bg-[#FAF8F5] text-[#68736F] hover:text-[#17201D] border border-[#EAE6DD]'
            }`}
          >
            All ({expenses.length})
          </button>
          {(
            [
              'accommodation',
              'food',
              'transport',
              'activities',
              'shopping',
              'miscellaneous',
            ] as ExpenseCategory[]
          ).map((cat) => {
            const meta = CATEGORY_METADATA[cat];
            const count = expenses.filter((e) => e.category === cat).length;
            if (count === 0 && selectedCategory !== cat) return null;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#17201D] text-white shadow-2xs'
                    : 'bg-[#FAF8F5] text-[#68736F] hover:text-[#17201D] border border-[#EAE6DD]'
                }`}
              >
                <span>{meta.icon}</span>
                <span>{meta.label}</span>
                <span className="opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expenses List View */}
      {filteredExpenses.length === 0 ? (
        /* Empty State */
        <div className="py-12 px-4 rounded-2xl bg-[#FAF8F5] border border-dashed border-[#EAE6DD] text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF2EE] border border-[#FFE0D6] text-[#FF6B4A] flex items-center justify-center mb-3 shadow-2xs">
            <Receipt className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-[#17201D] mb-1">
            {expenses.length === 0
              ? 'Your spending journey starts here.'
              : 'No expenses found matching filter.'}
          </h3>
          <p className="text-xs text-[#68736F] max-w-sm mb-4">
            {expenses.length === 0
              ? 'Add your first expense to start tracking your real trip costs in real time.'
              : 'Try clearing your search query or selecting another category.'}
          </p>
          <button
            type="button"
            onClick={onOpenAddExpense}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF6B4A] hover:bg-[#E55837] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Expense</span>
          </button>
        </div>
      ) : (
        <div className="divide-y divide-[#EAE6DD] border border-[#EAE6DD] rounded-2xl overflow-hidden">
          {filteredExpenses.map((expense) => {
            const meta = CATEGORY_METADATA[expense.category] || CATEGORY_METADATA.miscellaneous;
            let formattedDate = expense.date;
            try {
              const d = new Date(expense.date);
              formattedDate = d.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });
            } catch {
              // fallback
            }

            return (
              <div
                key={expense.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F5] transition-colors group"
              >
                {/* Left: Category Icon, Name, Date, Payment Method */}
                <div className="flex items-start gap-3.5">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 shadow-2xs"
                    style={{
                      backgroundColor: meta.bgLight,
                      border: `1px solid ${meta.borderColor}`,
                    }}
                  >
                    {meta.icon}
                  </div>

                  <div>
                    <div className="flex items-center flex-wrap gap-2">
                      <h4 className="text-sm font-black text-[#17201D]">
                        {expense.name}
                      </h4>
                      <span
                        className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: meta.bgLight,
                          color: meta.color,
                        }}
                      >
                        {meta.label}
                      </span>
                      {getPaymentBadge(expense.paymentMethod)}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#68736F] mt-1">
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3 text-[#8A9591]" />
                        {formattedDate}
                      </span>
                      {expense.notes && (
                        <span className="text-[#8A9591] italic border-l border-[#EAE6DD] pl-3 truncate max-w-xs">
                          {expense.notes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Action Buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EAE6DD]">
                  <div className="text-right">
                    <span className="text-base sm:text-lg font-black text-[#17201D]">
                      {formatCurrency(expense.amount, expense.currency || currency)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditExpense(expense)}
                      className="p-2 rounded-xl bg-white hover:bg-[#EAE6DD] text-[#5E6B67] hover:text-[#17201D] border border-[#EAE6DD] transition-colors cursor-pointer"
                      title="Edit expense"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteExpense(expense)}
                      className="p-2 rounded-xl bg-white hover:bg-[#FEE2E2] text-[#5E6B67] hover:text-[#EF4444] border border-[#EAE6DD] hover:border-[#FECACA] transition-colors cursor-pointer"
                      title="Delete expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
