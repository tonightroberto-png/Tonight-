import { FinancialGoal } from '../types/finance';
import { formatBRL, formatDateBR } from './formatters';

export interface GoalCalculationResult {
  percentage: number;
  remainingAmount: number;
  monthsRemaining: number;
  daysRemaining: number;
  monthlySavingsNeeded: number;
  isCompleted: boolean;
  isExpired: boolean;
  statusText: string;
  suggestionText: string;
}

export const calculateGoalMetrics = (
  goal: FinancialGoal,
  referenceDateStr: string = '2026-10-02'
): GoalCalculationResult => {
  const current = Math.max(0, goal.currentAmount);
  const target = Math.max(1, goal.targetAmount);
  const remaining = Math.max(0, target - current);
  const percentage = Math.min(100, (current / target) * 100);

  const refDate = new Date(`${referenceDateStr}T00:00:00`);
  const deadlineDate = new Date(`${goal.deadline}T23:59:59`);

  const diffTime = deadlineDate.getTime() - refDate.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Compute months difference
  const refYear = refDate.getFullYear();
  const refMonth = refDate.getMonth();
  const deadYear = deadlineDate.getFullYear();
  const deadMonth = deadlineDate.getMonth();

  let monthsRemaining = (deadYear - refYear) * 12 + (deadMonth - refMonth);
  if (deadlineDate.getDate() < refDate.getDate()) {
    monthsRemaining -= 0.5;
  }
  // At least 1 month if deadline is within this month
  const effectiveMonths = Math.max(1, Math.round(monthsRemaining));

  const isCompleted = remaining <= 0;
  const isExpired = daysRemaining < 0 && !isCompleted;

  let monthlySavingsNeeded = 0;
  if (!isCompleted && !isExpired) {
    monthlySavingsNeeded = remaining / effectiveMonths;
  }

  let statusText = '';
  let suggestionText = '';

  if (isCompleted) {
    statusText = 'Meta Concluída!';
    suggestionText = `Parabéns! Você atingiu o objetivo de ${formatBRL(target)}.`;
  } else if (isExpired) {
    statusText = 'Prazo expirado';
    suggestionText = `O prazo encerrou em ${formatDateBR(goal.deadline)}. Faltaram ${formatBRL(remaining)}.`;
  } else {
    statusText = `${effectiveMonths} ${effectiveMonths === 1 ? 'mês restante' : 'meses restantes'}`;
    suggestionText = `Economize ${formatBRL(monthlySavingsNeeded)} por mês até ${formatDateBR(goal.deadline)} para atingir a meta.`;
  }

  return {
    percentage,
    remainingAmount: remaining,
    monthsRemaining: Math.max(0, effectiveMonths),
    daysRemaining: Math.max(0, daysRemaining),
    monthlySavingsNeeded,
    isCompleted,
    isExpired,
    statusText,
    suggestionText,
  };
};
