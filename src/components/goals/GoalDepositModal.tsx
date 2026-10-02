import React, { useState } from 'react';
import { X, PiggyBank } from 'lucide-react';
import { FinancialGoal } from '../../types/finance';
import { formatBRL } from '../../utils/formatters';

interface GoalDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: FinancialGoal | null;
  onUpdateAmount: (goalId: string, newAmount: number) => void;
}

export const GoalDepositModal: React.FC<GoalDepositModalProps> = ({
  isOpen,
  onClose,
  goal,
  onUpdateAmount,
}) => {
  const [amountStr, setAmountStr] = useState('');
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !goal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amountStr.replace(',', '.'));
    if (isNaN(val) || val <= 0) {
      setErrorMsg('Informe um valor válido maior que zero.');
      return;
    }

    let nextAmount = goal.currentAmount;
    if (mode === 'deposit') {
      nextAmount += val;
    } else {
      nextAmount = Math.max(0, nextAmount - val);
    }

    onUpdateAmount(goal.id, nextAmount);
    setAmountStr('');
    setErrorMsg('');
    onClose();
  };

  const parsedVal = parseFloat(amountStr.replace(',', '.')) || 0;
  const simulatedTotal =
    mode === 'deposit'
      ? goal.currentAmount + parsedVal
      : Math.max(0, goal.currentAmount - parsedVal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-slate-800 dark:text-slate-200" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
              {mode === 'deposit' ? 'Novo Aporte na Meta' : 'Retirar Valor'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
            Meta: <strong className="text-slate-900 dark:text-slate-100">{goal.title}</strong>
          </p>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setMode('deposit')}
              className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === 'deposit'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              + Depositar / Aporte
            </button>
            <button
              type="button"
              onClick={() => setMode('withdraw')}
              className={`py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === 'withdraw'
                  ? 'bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              - Resgatar / Retirar
            </button>
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{errorMsg}</p>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Valor do {mode === 'deposit' ? 'Aporte' : 'Resgate'} (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                R$
              </span>
              <input
                type="number"
                step="10"
                min="1"
                required
                autoFocus
                placeholder="Ex: 500"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm font-mono tabular-nums font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 pt-1">
            {[100, 250, 500, 1000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmountStr(val.toString())}
                className="text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-1 rounded transition-colors"
              >
                +R${val}
              </button>
            ))}
          </div>

          {/* Preview result */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs border border-slate-100 dark:border-slate-800 space-y-1">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Saldo Atual da Meta:</span>
              <span className="font-mono">{formatBRL(goal.currentAmount)}</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200 pt-1 border-t border-slate-200/60 dark:border-slate-700">
              <span>Novo Saldo Estimado:</span>
              <span className="font-mono text-emerald-700 dark:text-emerald-400">{formatBRL(simulatedTotal)}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 rounded-lg shadow-xs"
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
