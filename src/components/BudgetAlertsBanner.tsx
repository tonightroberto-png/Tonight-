import React from 'react';
import { AlertTriangle, AlertCircle, ArrowRight, Settings } from 'lucide-react';
import { BudgetAlert } from '../types/finance';
import { formatBRL } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface BudgetAlertsBannerProps {
  alerts: BudgetAlert[];
  onFilterByCategory?: (categoryId: string) => void;
  onOpenBudgetManager: () => void;
}

export const BudgetAlertsBanner: React.FC<BudgetAlertsBannerProps> = ({
  alerts,
  onFilterByCategory,
  onOpenBudgetManager,
}) => {
  if (alerts.length === 0) return null;

  const dangerAlerts = alerts.filter((a) => a.severity === 'danger');
  const warningAlerts = alerts.filter((a) => a.severity === 'warning');

  return (
    <div className="space-y-3">
      {/* Alert Header Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {dangerAlerts.length > 0 ? (
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          )}
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Alertas de Limite de Gastos ({alerts.length})
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {dangerAlerts.length > 0
              ? `${dangerAlerts.length} categoria(s) estouraram o teto mensal`
              : 'Atenção aos limites estabelecidos'}
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenBudgetManager}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          Ajustar Orçamentos
        </button>
      </div>

      {/* Grid of Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {alerts.map((alert) => {
          const isDanger = alert.severity === 'danger';
          return (
            <div
              key={alert.categoryId}
              className={`p-3.5 rounded-xl border transition-all ${
                isDanger
                  ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-950 dark:text-rose-100'
                  : 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-950 dark:text-amber-100'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: isDanger ? '#FEE2E2' : '#FEF3C7' }}
                  >
                    <CategoryIcon
                      name={alert.categoryIcon}
                      className="w-4 h-4"
                      style={{ color: alert.color }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate text-slate-900 dark:text-slate-100">
                      {alert.categoryName}
                    </p>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {isDanger ? (
                        <span className="text-rose-600 dark:text-rose-400 font-semibold">
                          Excedido em {formatBRL(alert.overAmount)}
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400">
                          {alert.percentage.toFixed(0)}% do limite utilizado
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
                    isDanger
                      ? 'bg-rose-200/80 dark:bg-rose-900/70 text-rose-900 dark:text-rose-200'
                      : 'bg-amber-200/80 dark:bg-amber-900/70 text-amber-900 dark:text-amber-200'
                  }`}
                >
                  {alert.percentage.toFixed(0)}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 w-full bg-black/10 dark:bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isDanger ? 'bg-rose-600 dark:bg-rose-500' : 'bg-amber-500 dark:bg-amber-400'
                  }`}
                  style={{ width: `${Math.min(alert.percentage, 100)}%` }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>
                  Gasto: <strong className="font-mono tabular-nums text-slate-900 dark:text-slate-100">{formatBRL(alert.spent)}</strong>
                </span>
                <span>
                  Teto: <strong className="font-mono tabular-nums text-slate-900 dark:text-slate-100">{formatBRL(alert.limit)}</strong>
                </span>
              </div>

              {onFilterByCategory && (
                <button
                  type="button"
                  onClick={() => onFilterByCategory(alert.categoryId)}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 bg-white/90 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 rounded-lg transition-colors"
                >
                  <span>Ver despesas desta categoria</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
