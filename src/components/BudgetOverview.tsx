import React from 'react';
import { Target, Settings, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Category, Transaction } from '../types/finance';
import { formatBRL } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface BudgetOverviewProps {
  categories: Category[];
  transactions: Transaction[];
  currentMonthKey: string;
  onOpenBudgetManager: () => void;
  onFilterByCategory: (categoryId: string) => void;
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  categories,
  transactions,
  currentMonthKey,
  onOpenBudgetManager,
  onFilterByCategory,
}) => {
  const expenseCategories = categories.filter((c) => c.type === 'expense' || c.type === 'both');

  // Month expenses
  const monthExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(currentMonthKey)
  );

  const spentMap = new Map<string, number>();
  for (const t of monthExpenses) {
    spentMap.set(t.categoryId, (spentMap.get(t.categoryId) || 0) + t.amount);
  }

  const totalSpent = monthExpenses.reduce((sum, t) => sum + t.amount, 0);
  const totalBudget = expenseCategories.reduce((sum, c) => sum + (c.budgetLimit || 0), 0);
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-slate-800 dark:text-slate-200" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Orçamentos & Metas de Gastos
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Acompanhamento detalhado do consumo dos seus limites mensais planejados
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenBudgetManager}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 rounded-xl transition-colors shadow-xs"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Configurar Tetos Orçamentários</span>
          </button>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Consumo Geral do Orçamento:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-500 dark:text-slate-400">
                {formatBRL(totalSpent)} de {formatBRL(totalBudget)}
              </span>
              <span
                className={`font-bold font-mono px-2 py-0.5 rounded text-xs ${
                  overallPercentage >= 100
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                    : overallPercentage >= 80
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                {overallPercentage.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallPercentage >= 100
                  ? 'bg-rose-600 dark:bg-rose-500'
                  : overallPercentage >= 80
                  ? 'bg-amber-500 dark:bg-amber-400'
                  : 'bg-emerald-500 dark:bg-emerald-400'
              }`}
              style={{ width: `${Math.min(overallPercentage, 100)}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>
              Saldo Restante Geral:{' '}
              <strong className="font-mono tabular-nums text-slate-800 dark:text-slate-200">
                {formatBRL(Math.max(0, totalBudget - totalSpent))}
              </strong>
            </span>
            <span>
              {overallPercentage >= 100 ? (
                <span className="text-rose-600 dark:text-rose-400 font-semibold">Teto geral excedido</span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Dentro do limite planejado</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Category Budgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {expenseCategories.map((cat) => {
          const spent = spentMap.get(cat.id) || 0;
          const limit = cat.budgetLimit || 0;
          const percentage = limit > 0 ? (spent / limit) * 100 : 0;
          const remaining = Math.max(0, limit - spent);
          const isOver = limit > 0 && spent > limit;
          const isWarning = limit > 0 && percentage >= 80 && percentage < 100;

          return (
            <div
              key={cat.id}
              className={`bg-white dark:bg-slate-900 rounded-xl border p-4.5 transition-all shadow-xs flex flex-col justify-between ${
                isOver
                  ? 'border-rose-300 dark:border-rose-900 ring-1 ring-rose-200 dark:ring-rose-950'
                  : isWarning
                  ? 'border-amber-300 dark:border-amber-900 ring-1 ring-amber-100 dark:ring-amber-950'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: cat.bgColor }}
                    >
                      <CategoryIcon
                        name={cat.icon}
                        className="w-4 h-4"
                        style={{ color: cat.color }}
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{cat.name}</h4>
                      <div className="flex items-center gap-1.5 text-xs mt-0.5">
                        {isOver ? (
                          <span className="text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Limite Excedido
                          </span>
                        ) : isWarning ? (
                          <span className="text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Atenção (80%+)
                          </span>
                        ) : limit > 0 ? (
                          <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Dentro do Limite
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">Sem limite estipulado</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {limit > 0 && (
                    <span
                      className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
                        isOver
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                          : isWarning
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {percentage.toFixed(0)}%
                    </span>
                  )}
                </div>

                {limit > 0 ? (
                  <div className="mt-4 space-y-2">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOver
                            ? 'bg-rose-500'
                            : isWarning
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      <div>
                        <span className="block text-[11px] text-slate-400 dark:text-slate-500">Gasto Atual</span>
                        <strong className="font-mono tabular-nums text-slate-900 dark:text-slate-100">
                          {formatBRL(spent)}
                        </strong>
                      </div>
                      <div className="text-right">
                        <span className="block text-[11px] text-slate-400 dark:text-slate-500">Teto Mensal</span>
                        <strong className="font-mono tabular-nums text-slate-900 dark:text-slate-100">
                          {formatBRL(limit)}
                        </strong>
                      </div>
                    </div>

                    <div className="text-xs pt-1 flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400">
                        {isOver ? 'Excedente:' : 'Disponível:'}
                      </span>
                      <strong
                        className={`font-mono tabular-nums ${
                          isOver ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {isOver
                          ? `+${formatBRL(spent - limit)}`
                          : formatBRL(remaining)}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 py-3 text-center bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs text-slate-500 dark:text-slate-400">
                    Gasto no mês: <strong className="font-mono text-slate-800 dark:text-slate-200">{formatBRL(spent)}</strong>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onFilterByCategory(cat.id)}
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Ver lançamentos &rarr;
                </button>
                <button
                  type="button"
                  onClick={onOpenBudgetManager}
                  className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  Editar teto
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
