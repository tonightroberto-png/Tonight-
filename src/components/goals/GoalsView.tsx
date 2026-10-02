import React, { useState } from 'react';
import {
  Target,
  Plus,
  Calendar,
  Sparkles,
  CheckCircle2,
  Edit2,
  Trash2,
  PiggyBank
} from 'lucide-react';
import { FinancialGoal } from '../../types/finance';
import { calculateGoalMetrics } from '../../utils/goalUtils';
import { formatBRL, formatDateBR } from '../../utils/formatters';
import { CategoryIcon } from '../CategoryIcon';
import { GoalModal } from './GoalModal';
import { GoalDepositModal } from './GoalDepositModal';

interface GoalsViewProps {
  goals: FinancialGoal[];
  onAddGoal: (goal: Omit<FinancialGoal, 'id' | 'createdAt'>) => void;
  onEditGoal: (goal: Omit<FinancialGoal, 'id' | 'createdAt'>, id: string) => void;
  onDeleteGoal: (id: string) => void;
  onUpdateGoalAmount: (goalId: string, newAmount: number) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onUpdateGoalAmount,
}) => {
  const [filter, setFilter] = useState<'all' | 'ongoing' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [depositGoal, setDepositGoal] = useState<FinancialGoal | null>(null);

  // Compute metrics for all goals
  const goalsWithMetrics = goals.map((g) => ({
    goal: g,
    metrics: calculateGoalMetrics(g, '2026-10-02'),
  }));

  // Aggregated totals
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalCurrent = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallPercentage = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

  // Total monthly savings recommended across all ongoing goals
  const totalMonthlySavingsRecommended = goalsWithMetrics
    .filter((gm) => !gm.metrics.isCompleted && !gm.metrics.isExpired)
    .reduce((sum, gm) => sum + gm.metrics.monthlySavingsNeeded, 0);

  const filteredGoals = goalsWithMetrics.filter((gm) => {
    if (filter === 'ongoing') return !gm.metrics.isCompleted;
    if (filter === 'completed') return gm.metrics.isCompleted;
    return true;
  });

  const handleOpenNew = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleSaveGoal = (
    data: Omit<FinancialGoal, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      onEditGoal(data, existingId);
    } else {
      onAddGoal(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Main KPIs */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-slate-800 dark:text-slate-200" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Módulo de Metas Financeiras
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Planeje sonhos, defina datas e acompanhe a sugestão mensal de economia
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenNew}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Meta Financeira</span>
          </button>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Total das Metas</span>
            <span className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5 block">
              {formatBRL(totalTarget)}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Total Já Guardado</span>
            <span className="text-base font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400 mt-0.5 block">
              {formatBRL(totalCurrent)}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Progresso Médio</span>
            <span className="text-base font-bold font-mono tabular-nums text-blue-700 dark:text-blue-400 mt-0.5 block">
              {overallPercentage.toFixed(1)}%
            </span>
          </div>

          <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/60">
            <span className="text-[11px] font-semibold text-blue-900 dark:text-blue-300 block flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              Economia Mensal Recomendada
            </span>
            <span className="text-base font-bold font-mono tabular-nums text-blue-950 dark:text-blue-200 mt-0.5 block">
              {formatBRL(totalMonthlySavingsRecommended)}/mês
            </span>
          </div>
        </div>
      </div>

      {/* Segmented Filter Control */}
      <div className="flex items-center justify-between">
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Todas as Metas ({goals.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('ongoing')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === 'ongoing'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Em Andamento ({goalsWithMetrics.filter((g) => !g.metrics.isCompleted).length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === 'completed'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Concluídas ({goalsWithMetrics.filter((g) => g.metrics.isCompleted).length})
          </button>
        </div>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <Target className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Nenhuma meta encontrada</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Defina objetivos como 'Viagem de Férias', 'Entrada da Casa' ou 'Reserva de Emergência' e acompanhe a sugestão mensal de economia.
          </p>
          <button
            type="button"
            onClick={handleOpenNew}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-emerald-600 rounded-lg hover:bg-slate-800 dark:hover:bg-emerald-500 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Criar Minha Primeira Meta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map(({ goal, metrics }) => {
            const isDone = metrics.isCompleted;

            return (
              <div
                key={goal.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 transition-all shadow-xs flex flex-col justify-between ${
                  isDone
                    ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Goal Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                        style={{ backgroundColor: goal.color || '#3B82F6' }}
                      >
                        <CategoryIcon
                          name={goal.icon || 'Target'}
                          className="w-5 h-5 text-white"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {goal.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>Prazo: {formatDateBR(goal.deadline)}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-slate-600 dark:text-slate-300">
                            {metrics.statusText}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(goal)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Editar meta"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Tem certeza que deseja excluir a meta "${goal.title}"?`)) {
                            onDeleteGoal(goal.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Excluir meta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Financial Values & Progress */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-baseline justify-between text-xs">
                      <div>
                        <span className="text-slate-400 dark:text-slate-500 text-[11px] block">Acumulado</span>
                        <span className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                          {formatBRL(goal.currentAmount)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 dark:text-slate-500 text-[11px] block">Valor Alvo</span>
                        <span className="text-sm font-semibold font-mono tabular-nums text-slate-600 dark:text-slate-400">
                          {formatBRL(goal.targetAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Track */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${metrics.percentage}%`,
                          backgroundColor: isDone ? '#10B981' : goal.color || '#3B82F6',
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      <span>{metrics.percentage.toFixed(0)}% concluído</span>
                      <span>
                        {isDone
                          ? 'Meta 100% atingida!'
                          : `Faltam ${formatBRL(metrics.remainingAmount)}`}
                      </span>
                    </div>
                  </div>

                  {/* Monthly Suggestion Box */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100/80 dark:border-slate-800 text-xs">
                    {isDone ? (
                      <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{metrics.suggestionText}</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span>Sugestão de Economia:</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">
                          Economize{' '}
                          <strong className="text-slate-900 dark:text-slate-100 font-mono font-bold">
                            {formatBRL(metrics.monthlySavingsNeeded)}/mês
                          </strong>{' '}
                          durante os próximos {metrics.monthsRemaining} meses para alcançar o valor.
                        </p>
                      </div>
                    )}
                  </div>

                  {goal.notes && (
                    <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500 italic">
                      {goal.notes}
                    </p>
                  )}
                </div>

                {/* Footer Action Button */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                    {metrics.daysRemaining > 0
                      ? `${metrics.daysRemaining} dias restantes`
                      : isDone
                      ? 'Concluída'
                      : 'Prazo encerrado'}
                  </span>

                  <button
                    type="button"
                    onClick={() => setDepositGoal(goal)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg shadow-xs transition-colors"
                  >
                    <PiggyBank className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                    <span>Guardar / Aporte</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Goal Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveGoal}
        initialGoal={editingGoal}
      />

      {/* Quick Deposit Modal */}
      <GoalDepositModal
        isOpen={Boolean(depositGoal)}
        onClose={() => setDepositGoal(null)}
        goal={depositGoal}
        onUpdateAmount={onUpdateGoalAmount}
      />
    </div>
  );
};
