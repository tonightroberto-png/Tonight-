import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Category, Transaction } from '../types/finance';
import { formatBRL } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface BudgetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  transactions: Transaction[];
  currentMonthKey: string;
  onUpdateCategoryLimits: (updatedLimits: Record<string, number>) => void;
}

export const BudgetManagerModal: React.FC<BudgetManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  transactions,
  currentMonthKey,
  onUpdateCategoryLimits,
}) => {
  const expenseCategories = categories.filter((c) => c.type === 'expense' || c.type === 'both');

  // Compute current spent per category in currentMonthKey
  const currentMonthExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(currentMonthKey)
  );
  const spentMap = new Map<string, number>();
  for (const t of currentMonthExpenses) {
    spentMap.set(t.categoryId, (spentMap.get(t.categoryId) || 0) + t.amount);
  }

  // Local draft state for limits
  const [limits, setLimits] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const cat of expenseCategories) {
      initial[cat.id] = cat.budgetLimit || 0;
    }
    return initial;
  });

  if (!isOpen) return null;

  const handleInputChange = (categoryId: string, valStr: string) => {
    const parsed = parseFloat(valStr) || 0;
    setLimits((prev) => ({
      ...prev,
      [categoryId]: Math.max(0, parsed),
    }));
  };

  const handleSave = () => {
    onUpdateCategoryLimits(limits);
    onClose();
  };

  const totalMonthlyLimit = Object.values(limits).reduce((acc, val) => acc + val, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Limites de Gastos por Categoria</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Defina o teto mensal para receber alertas automáticos ao atingir 80% e 100%
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Budget Summary bar */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Teto Total Mensal Planejado:</span>
          <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
            {formatBRL(totalMonthlyLimit)}
          </span>
        </div>

        {/* List of categories with editable inputs */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {expenseCategories.map((cat) => {
            const currentSpent = spentMap.get(cat.id) || 0;
            const currentLimit = limits[cat.id] ?? (cat.budgetLimit || 0);
            const percentage = currentLimit > 0 ? (currentSpent / currentLimit) * 100 : 0;
            const isExceeded = currentLimit > 0 && currentSpent > currentLimit;

            return (
              <div
                key={cat.id}
                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 transition-colors space-y-2.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: cat.bgColor }}
                    >
                      <CategoryIcon
                        name={cat.icon}
                        className="w-4 h-4"
                        style={{ color: cat.color }}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{cat.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Gasto neste mês: <strong className="font-mono tabular-nums text-slate-700 dark:text-slate-300">{formatBRL(currentSpent)}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Limite:</span>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                        R$
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={limits[cat.id] ?? ''}
                        onChange={(e) => handleInputChange(cat.id, e.target.value)}
                        placeholder="Sem limite"
                        className="w-28 pl-8 pr-2.5 py-1.5 text-xs font-mono tabular-nums font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 text-right"
                      />
                    </div>
                  </div>
                </div>

                {/* Real-time preview bar */}
                {currentLimit > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className={isExceeded ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}>
                        {percentage.toFixed(0)}% utilizado
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 font-mono">
                        {currentSpent > currentLimit
                          ? `Excedeu em ${formatBRL(currentSpent - currentLimit)}`
                          : `Restam ${formatBRL(currentLimit - currentSpent)}`}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          percentage >= 100
                            ? 'bg-rose-500'
                            : percentage >= 80
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 rounded-lg shadow-sm transition-colors"
          >
            <Check className="w-4 h-4" />
            Salvar Limites
          </button>
        </div>
      </div>
    </div>
  );
};
