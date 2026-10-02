import React from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Percent,
  AlertTriangle,
  AlertCircle,
  Target,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  Download
} from 'lucide-react';
import {
  BudgetAlert,
  Category,
  FinancialGoal,
  Transaction,
  TransactionType,
} from '../types/finance';
import {
  calculateCategorySummaries,
  calculateMonthlyEvolution,
  exportToCSV,
  formatBRL,
  formatDateBR,
  formatMonthLabel,
} from '../utils/formatters';
import { calculateGoalMetrics } from '../utils/goalUtils';
import { CategoryDonutChart } from './charts/CategoryDonutChart';
import { MonthlyEvolutionChart } from './charts/MonthlyEvolutionChart';
import { CategoryIcon } from './CategoryIcon';

interface DashboardViewProps {
  transactions: Transaction[];
  categories: Category[];
  goals: FinancialGoal[];
  alerts: BudgetAlert[];
  currentMonthKey: string;
  onChangeMonthKey: (key: string) => void;
  onNewTransaction: (type?: TransactionType) => void;
  onNavigateToTab: (tab: 'dashboard' | 'transactions' | 'budgets' | 'goals' | 'reports' | 'categories') => void;
  onFilterByCategory: (categoryId: string) => void;
  onOpenBudgetManager: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  categories,
  goals,
  alerts,
  currentMonthKey,
  onChangeMonthKey,
  onNewTransaction,
  onNavigateToTab,
  onFilterByCategory,
  onOpenBudgetManager,
}) => {
  // Current month transactions
  const monthTransactions = transactions.filter((t) =>
    t.date.startsWith(currentMonthKey)
  );

  const monthIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthExpense = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthBalance = monthIncome - monthExpense;

  // Cumulative all-time balance
  const cumulativeBalance = transactions.reduce((acc, t) => {
    return t.type === 'income' ? acc + t.amount : acc - t.amount;
  }, 0);

  // Savings rate
  const savingsRate =
    monthIncome > 0 ? Math.max(0, ((monthIncome - monthExpense) / monthIncome) * 100) : 0;

  // Category Summaries for current month
  const categorySummaries = calculateCategorySummaries(
    monthTransactions,
    categories,
    'expense'
  );

  // Monthly Evolution data (last 6 months)
  const monthlyEvolution = calculateMonthlyEvolution(transactions, 6);

  // Expense categories with budget limits
  const expenseCategories = categories.filter((c) => c.type === 'expense' || c.type === 'both');
  const monthSpentByCategory = new Map<string, number>();
  for (const t of monthTransactions.filter((t) => t.type === 'expense')) {
    monthSpentByCategory.set(
      t.categoryId,
      (monthSpentByCategory.get(t.categoryId) || 0) + t.amount
    );
  }

  // Active goals with monthly savings suggestion
  const activeGoals = goals.slice(0, 3).map((g) => ({
    goal: g,
    metrics: calculateGoalMetrics(g, '2026-10-02'),
  }));

  // Recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const categoryLookup = new Map(categories.map((c) => [c.id, c]));

  // Available distinct months in data for dropdown
  const availableMonths = Array.from(
    new Set(transactions.map((t) => t.date.slice(0, 7)))
  ).sort().reverse();

  return (
    <div className="space-y-6">
      {/* Month Selector & Quick Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Visão Geral Financeira
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Acompanhe em tempo real seu saldo, orçamentos, metas e evolução patrimonial
          </p>
        </div>

        {/* Month selector dropdown & CSV Export */}
        <div className="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Mês:
            </span>
            <select
              value={currentMonthKey}
              onChange={(e) => onChangeMonthKey(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 text-slate-800 dark:text-slate-200"
            >
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonthLabel(m)}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => exportToCSV(transactions, categories, `Dashboard_${currentMonthKey}`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg shadow-2xs transition-colors"
            title="Exportar transações registradas para arquivo CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Saldo Atual Acumulado */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Saldo Atual Total</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 tracking-tight">
              {formatBRL(cumulativeBalance)}
            </span>
            <div className="mt-1 flex items-center text-xs text-slate-500 dark:text-slate-400">
              <span>Balanço deste mês:</span>
              <strong
                className={`ml-1 font-mono font-semibold ${
                  monthBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {monthBalance >= 0 ? '+' : ''}
                {formatBRL(monthBalance)}
              </strong>
            </div>
          </div>
        </div>

        {/* Receitas do Mês */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Receitas ({formatMonthLabel(currentMonthKey)})</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatBRL(monthIncome)}
            </span>
            <div className="mt-1 flex items-center text-xs text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={() => onNewTransaction('income')}
                className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 font-semibold"
              >
                + Adicionar receita
              </button>
            </div>
          </div>
        </div>

        {/* Despesas do Mês */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Despesas ({formatMonthLabel(currentMonthKey)})</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400 tracking-tight">
              {formatBRL(monthExpense)}
            </span>
            <div className="mt-1 flex items-center text-xs text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={() => onNewTransaction('expense')}
                className="text-rose-700 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-300 font-semibold"
              >
                + Adicionar despesa
              </button>
            </div>
          </div>
        </div>

        {/* Taxa de Poupança */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Taxa de Poupança</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono tabular-nums text-blue-700 dark:text-blue-400 tracking-tight">
              {savingsRate.toFixed(1)}%
            </span>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {savingsRate >= 20 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Excelente disciplina financeira</span>
              ) : (
                <span className="text-slate-500 dark:text-slate-400">Meta recomendada: 20%</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Orçamentos por Categoria (Gasto vs Orçado) & Alertas 80% / 100% */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Progresso do Orçamento Mensal
              </h2>
              {alerts.length > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold font-mono rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {alerts.length} alertas ativos
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comparativo de gastos realizados vs. valores orçados em cada categoria de despesa
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenBudgetManager}
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
            >
              Definir Valores Orçados
            </button>
            <button
              type="button"
              onClick={() => onNavigateToTab('budgets')}
              className="text-xs font-semibold text-slate-900 dark:text-white hover:underline flex items-center gap-1"
            >
              Ver todos &rarr;
            </button>
          </div>
        </div>

        {/* Budget Cards Horizontal Scroll / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {expenseCategories.slice(0, 4).map((cat) => {
            const spent = monthSpentByCategory.get(cat.id) || 0;
            const limit = cat.budgetLimit || 0;
            const percentage = limit > 0 ? (spent / limit) * 100 : 0;
            const isOver = limit > 0 && spent > limit;
            const isWarning = limit > 0 && percentage >= 80 && percentage < 100;

            return (
              <div
                key={cat.id}
                onClick={() => onFilterByCategory(cat.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isOver
                    ? 'border-rose-300 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/30 hover:bg-rose-50/70 dark:hover:bg-rose-950/50'
                    : isWarning
                    ? 'border-amber-300 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/30 hover:bg-amber-50/70 dark:hover:bg-amber-950/50'
                    : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: cat.bgColor }}
                    >
                      <CategoryIcon
                        name={cat.icon}
                        className="w-3.5 h-3.5"
                        style={{ color: cat.color }}
                      />
                    </div>
                    <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {cat.name}
                    </span>
                  </div>

                  {limit > 0 && (
                    <span
                      className={`text-[11px] font-bold font-mono px-1.5 py-0.5 rounded ${
                        isOver
                          ? 'bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200'
                          : isWarning
                          ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {percentage.toFixed(0)}%
                    </span>
                  )}
                </div>

                {limit > 0 ? (
                  <div className="mt-3 space-y-1.5">
                    <div className="w-full bg-slate-200/80 dark:bg-slate-700/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOver
                            ? 'bg-rose-600'
                            : isWarning
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                      <span>
                        Gasto: <strong className="font-mono tabular-nums text-slate-900 dark:text-slate-100">{formatBRL(spent)}</strong>
                      </span>
                      <span>
                        Orçado: <strong className="font-mono tabular-nums text-slate-900 dark:text-slate-100">{formatBRL(limit)}</strong>
                      </span>
                    </div>

                    {isOver && (
                      <p className="text-[10px] text-rose-700 dark:text-rose-400 font-bold flex items-center gap-1 mt-0.5">
                        <AlertCircle className="w-3 h-3" />
                        Ultrapassou teto em {formatBRL(spent - limit)}
                      </p>
                    )}
                    {isWarning && (
                      <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                        <AlertTriangle className="w-3 h-3" />
                        Atingiu 80% do limite orçado
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    Gasto: <strong className="font-mono tabular-nums text-slate-800 dark:text-slate-200">{formatBRL(spent)}</strong>
                    <span className="block text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Sem teto orçado</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Interactive Charts: Category Donut & Monthly Evolution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gastos por Categoria (Donut Chart) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                Gastos por Categoria
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Distribuição percentual das despesas em {formatMonthLabel(currentMonthKey)}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <CategoryDonutChart
              categories={categorySummaries}
              totalExpense={monthExpense}
              onSelectCategory={onFilterByCategory}
            />
          </div>
        </div>

        {/* Evolução Mensal (Receitas vs Despesas vs Saldo) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                Evolução Mensal do Fluxo de Caixa
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comparativo histórico dos últimos 6 meses com gráfico interativo
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('reports')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors self-start sm:self-auto"
            >
              <span>Ver Análise com Recharts</span>
              <span>&rarr;</span>
            </button>
          </div>

          <div className="pt-2">
            <MonthlyEvolutionChart data={monthlyEvolution} />
          </div>
        </div>
      </div>

      {/* Metas Financeiras em Destaque */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-slate-800 dark:text-slate-200" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Metas Financeiras & Sugestão Mensal de Economia
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Objetivos planejados com o cálculo de quanto guardar por mês para alcançá-los
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTab('goals')}
            className="text-xs font-semibold text-slate-900 dark:text-slate-100 hover:underline flex items-center gap-1"
          >
            Ver todas as metas &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeGoals.map(({ goal, metrics }) => (
            <div
              key={goal.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                    style={{ backgroundColor: goal.color || '#3B82F6' }}
                  >
                    <CategoryIcon name={goal.icon} className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {goal.title}
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Prazo: {formatDateBR(goal.deadline)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {formatBRL(goal.currentAmount)}
                    </span>
                    <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                      alvo: {formatBRL(goal.targetAmount)}
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${metrics.percentage}%`,
                        backgroundColor: goal.color || '#3B82F6',
                      }}
                    />
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
                    <span>{metrics.percentage.toFixed(0)}% guardado</span>
                    <span>{metrics.statusText}</span>
                  </div>
                </div>

                {/* Suggestion pill */}
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 rounded-lg text-[11px] text-blue-900 dark:text-blue-300">
                  <span className="font-semibold block flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    Economia recomendada:
                  </span>
                  <span className="font-mono font-bold text-blue-950 dark:text-blue-100">
                    {formatBRL(metrics.monthlySavingsNeeded)}/mês
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Últimas Movimentações */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Últimas Movimentações Registradas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Lançamentos mais recentes no extrato financeiro
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => exportToCSV(transactions, categories, 'Ultimas_Transacoes')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg shadow-2xs transition-colors"
              title="Exportar transações para arquivo CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Exportar CSV</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToTab('transactions')}
              className="text-xs font-semibold text-slate-900 dark:text-slate-100 hover:underline flex items-center gap-1"
            >
              Ver extrato completo &rarr;
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                const cat = categoryLookup.get(tx.categoryId);

                return (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 dark:text-slate-400 font-medium">
                      {formatDateBR(tx.date)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 block truncate max-w-xs">
                        {tx.description}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                          style={{ backgroundColor: cat?.bgColor || '#F1F5F9' }}
                        >
                          <CategoryIcon
                            name={cat?.icon || 'Tag'}
                            className="w-3 h-3"
                            style={{ color: cat?.color || '#64748B' }}
                          />
                        </div>
                        <span className="text-slate-600 dark:text-slate-300">{cat?.name || 'Geral'}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap font-mono tabular-nums font-bold">
                      <span className={isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                        {isIncome ? '+' : '-'} {formatBRL(tx.amount)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
