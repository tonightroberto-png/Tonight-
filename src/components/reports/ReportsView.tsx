import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Percent,
  Wallet,
  BarChart3,
  Layers
} from 'lucide-react';
import { Category, Transaction } from '../../types/finance';
import {
  calculateNetWorthEvolution,
  exportToCSV,
  formatBRL,
  formatShortBRL,
} from '../../utils/formatters';

interface ReportsViewProps {
  transactions: Transaction[];
  categories: Category[];
  isDarkMode: boolean;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  categories,
  isDarkMode,
}) => {
  const [selectedRange, setSelectedRange] = useState<'all' | '6m' | '12m'>('all');

  // Compute Net Worth and Monthly data
  const fullEvolutionData = useMemo(() => {
    return calculateNetWorthEvolution(transactions);
  }, [transactions]);

  // Apply selected time range filter
  const chartData = useMemo(() => {
    if (selectedRange === '6m') {
      return fullEvolutionData.slice(-6);
    }
    if (selectedRange === '12m') {
      return fullEvolutionData.slice(-12);
    }
    return fullEvolutionData;
  }, [fullEvolutionData, selectedRange]);

  // Key KPI metrics
  const latestPoint = fullEvolutionData[fullEvolutionData.length - 1] || {
    income: 0,
    expense: 0,
    monthlyNet: 0,
    netWorth: 0,
    savingsRate: 0,
  };

  const initialPoint = fullEvolutionData[0] || latestPoint;
  const netWorthGrowth = latestPoint.netWorth - (initialPoint ? initialPoint.monthlyNet : 0);

  const avgMonthlyIncome =
    fullEvolutionData.length > 0
      ? fullEvolutionData.reduce((acc, p) => acc + p.income, 0) / fullEvolutionData.length
      : 0;

  const avgMonthlyExpense =
    fullEvolutionData.length > 0
      ? fullEvolutionData.reduce((acc, p) => acc + p.expense, 0) / fullEvolutionData.length
      : 0;

  const avgSavingsRate =
    fullEvolutionData.length > 0
      ? fullEvolutionData.reduce((acc, p) => acc + p.savingsRate, 0) / fullEvolutionData.length
      : 0;

  // Custom Recharts Tooltip for Income vs Expense Line Chart
  const CustomLineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-3.5 text-xs space-y-2">
          <div className="flex items-center justify-between gap-4 pb-1.5 border-b border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {label}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Taxa: {dataPoint.savingsRate.toFixed(1)}%
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Receitas:
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                {formatBRL(dataPoint.income)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Despesas:
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                {formatBRL(dataPoint.expense)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400 font-semibold">
                Saldo do Mês:
              </span>
              <span
                className={`font-mono font-bold ${
                  dataPoint.monthlyNet >= 0
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {dataPoint.monthlyNet >= 0 ? '+' : ''}
                {formatBRL(dataPoint.monthlyNet)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Recharts Tooltip for Net Worth Chart
  const CustomNetWorthTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-3.5 text-xs space-y-1.5">
          <div className="font-bold text-slate-900 dark:text-slate-100 pb-1 border-b border-slate-100 dark:border-slate-800">
            {label}
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500 dark:text-slate-400">Patrimônio Líquido Acumulado:</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
              {formatBRL(dataPoint.netWorth)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 text-[11px] text-slate-400">
            <span>Aporte no Mês:</span>
            <span className="font-mono">
              {dataPoint.monthlyNet >= 0 ? '+' : ''}
              {formatBRL(dataPoint.monthlyNet)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const gridStroke = isDarkMode ? '#1E293B' : '#F1F5F9';
  const axisStroke = isDarkMode ? '#64748B' : '#94A3B8';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-slate-800 dark:text-slate-200" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Relatórios & Análise Patrimonial
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evolução do patrimônio líquido acumulado e comparativo mensal de receitas versus despesas
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
            {/* Range Toggle */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setSelectedRange('6m')}
                className={`px-3 py-1 font-semibold rounded-lg transition-all ${
                  selectedRange === '6m'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                6 Meses
              </button>
              <button
                type="button"
                onClick={() => setSelectedRange('12m')}
                className={`px-3 py-1 font-semibold rounded-lg transition-all ${
                  selectedRange === '12m'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                12 Meses
              </button>
              <button
                type="button"
                onClick={() => setSelectedRange('all')}
                className={`px-3 py-1 font-semibold rounded-lg transition-all ${
                  selectedRange === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Todo Histórico
              </button>
            </div>

            <button
              type="button"
              onClick={() => exportToCSV(transactions, categories, 'Relatorio_Patrimonial')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg shadow-2xs transition-colors whitespace-nowrap"
              title="Exportar dados para CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Patrimônio Líquido Acumulado
            </span>
            <span className="text-xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400 mt-0.5 block">
              {formatBRL(latestPoint.netWorth)}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
              Saldo acumulado de todas as entradas e saídas
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Média Mensal de Receitas
            </span>
            <span className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              {formatBRL(avgMonthlyIncome)}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
              Baseado no histórico do período
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Média Mensal de Despesas
            </span>
            <span className="text-xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400 mt-0.5 block">
              {formatBRL(avgMonthlyExpense)}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
              Custo médio de vida mensal
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
              Taxa Média de Poupança
            </span>
            <span className="text-xl font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400 mt-0.5 block">
              {avgSavingsRate.toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
              Percentual médio da renda poupada por mês
            </span>
          </div>
        </div>
      </div>

      {/* Main Chart 1: Line Chart Comparing Income vs Expenses (using Recharts) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              Comparativo Mensal: Receitas vs. Despesas (Gráfico de Linha Recharts)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Linha contínua comparando o volume de entradas (verde) versus o volume de despesas (vermelho)
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-500 shrink-0" />
              <span>Receitas Mensais</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-rose-500 shrink-0" />
              <span>Despesas Mensais</span>
            </div>
          </div>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis
                dataKey="label"
                stroke={axisStroke}
                tick={{ fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                stroke={axisStroke}
                tick={{ fontSize: 10, fontFamily: 'monospace' }}
                tickFormatter={(val) => formatShortBRL(val)}
                tickLine={false}
              />
              <Tooltip content={<CustomLineTooltip />} />
              <Line
                type="monotone"
                dataKey="income"
                name="Receitas"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#FFFFFF' }}
                activeDot={{ r: 6, fill: '#059669', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="expense"
                name="Despesas"
                stroke="#F43F5E"
                strokeWidth={3}
                dot={{ r: 4, fill: '#F43F5E', strokeWidth: 2, stroke: '#FFFFFF' }}
                activeDot={{ r: 6, fill: '#E11D48', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Chart 2: Evolution of Net Worth Over Time (using Recharts AreaChart) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Evolução do Patrimônio Líquido Acumulado ao Longo do Tempo
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Crescimento do saldo patrimonial acumulado mês a mês
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/60">
            <span>Patrimônio Atual:</span>
            <span>{formatBRL(latestPoint.netWorth)}</span>
          </div>
        </div>

        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis
                dataKey="label"
                stroke={axisStroke}
                tick={{ fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                stroke={axisStroke}
                tick={{ fontSize: 10, fontFamily: 'monospace' }}
                tickFormatter={(val) => formatShortBRL(val)}
                tickLine={false}
              />
              <Tooltip content={<CustomNetWorthTooltip />} />
              <Area
                type="monotone"
                dataKey="netWorth"
                stroke="#2563EB"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#netWorthGradient)"
                dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#FFFFFF' }}
                activeDot={{ r: 6, fill: '#1D4ED8', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Detalhamento Mensal do Patrimônio
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tabela histórica de receitas, despesas, aportes e saldo acumulado
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Mês</th>
                <th className="py-3 px-4 text-right">Receitas</th>
                <th className="py-3 px-4 text-right">Despesas</th>
                <th className="py-3 px-4 text-right">Saldo do Mês</th>
                <th className="py-3 px-4 text-right">Patrimônio Acumulado</th>
                <th className="py-3 px-4 text-center">Taxa de Poupança</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {[...chartData].reverse().map((row) => (
                <tr
                  key={row.monthKey}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {row.label}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    +{formatBRL(row.income)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-rose-600 dark:text-rose-400 whitespace-nowrap">
                    -{formatBRL(row.expense)}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-mono tabular-nums font-semibold whitespace-nowrap ${
                      row.monthlyNet >= 0
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {row.monthlyNet >= 0 ? '+' : ''}
                    {formatBRL(row.monthlyNet)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {formatBRL(row.netWorth)}
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                        row.savingsRate >= 20
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : row.savingsRate > 0
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {row.savingsRate.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
