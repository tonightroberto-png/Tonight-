import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Edit2,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  Plus
} from 'lucide-react';
import {
  Category,
  FilterState,
  PaymentMethod,
  Transaction,
  TransactionType,
} from '../types/finance';
import { PAYMENT_METHODS } from '../data/defaultData';
import {
  exportToCSV,
  formatBRL,
  formatDateBR,
} from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface TransactionHistoryProps {
  transactions: Transaction[];
  categories: Category[];
  currentMonthKey: string;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onNewTransaction: (type?: TransactionType) => void;
  initialCategoryIdFilter?: string;
  onClearInitialCategoryFilter?: () => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  categories,
  currentMonthKey,
  onEditTransaction,
  onDeleteTransaction,
  onNewTransaction,
  initialCategoryIdFilter,
  onClearInitialCategoryFilter,
}) => {
  const [filterState, setFilterState] = useState<FilterState>({
    search: '',
    type: 'all',
    categoryId: initialCategoryIdFilter || '',
    paymentMethod: '',
    period: 'this_month',
    startDate: '',
    endDate: '',
    status: 'all',
    sortBy: 'date_desc',
  });

  // Keep category filter in sync if passed from outside
  React.useEffect(() => {
    if (initialCategoryIdFilter) {
      setFilterState((prev) => ({ ...prev, categoryId: initialCategoryIdFilter }));
    }
  }, [initialCategoryIdFilter]);

  const categoryLookup = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c]));
  }, [categories]);

  const paymentMethodLookup = useMemo(() => {
    return new Map(PAYMENT_METHODS.map((pm) => [pm.id, pm]));
  }, []);

  // Filter & sort logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Search
      if (filterState.search) {
        const query = filterState.search.toLowerCase();
        const matchesDesc = t.description.toLowerCase().includes(query);
        const matchesNotes = (t.notes || '').toLowerCase().includes(query);
        const cat = categoryLookup.get(t.categoryId);
        const matchesCat = cat ? cat.name.toLowerCase().includes(query) : false;
        if (!matchesDesc && !matchesNotes && !matchesCat) return false;
      }

      // Type
      if (filterState.type !== 'all' && t.type !== filterState.type) {
        return false;
      }

      // Category
      if (filterState.categoryId && t.categoryId !== filterState.categoryId) {
        return false;
      }

      // Payment Method
      if (filterState.paymentMethod && t.paymentMethod !== filterState.paymentMethod) {
        return false;
      }

      // Status
      if (filterState.status !== 'all' && t.status !== filterState.status) {
        return false;
      }

      // Period
      if (filterState.period === 'this_month') {
        if (!t.date.startsWith(currentMonthKey)) return false;
      } else if (filterState.period === 'last_month') {
        const [year, month] = currentMonthKey.split('-').map(Number);
        const lastMonth = month === 1 ? 12 : month - 1;
        const lastYear = month === 1 ? year - 1 : year;
        const lastMonthKey = `${lastYear}-${String(lastMonth).padStart(2, '0')}`;
        if (!t.date.startsWith(lastMonthKey)) return false;
      } else if (filterState.period === 'this_year') {
        const year = currentMonthKey.slice(0, 4);
        if (!t.date.startsWith(year)) return false;
      } else if (filterState.period === 'custom') {
        if (filterState.startDate && t.date < filterState.startDate) return false;
        if (filterState.endDate && t.date > filterState.endDate) return false;
      }

      return true;
    }).sort((a, b) => {
      if (filterState.sortBy === 'date_desc') {
        return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
      }
      if (filterState.sortBy === 'date_asc') {
        return a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt);
      }
      if (filterState.sortBy === 'amount_desc') {
        return b.amount - a.amount;
      }
      if (filterState.sortBy === 'amount_asc') {
        return a.amount - b.amount;
      }
      return 0;
    });
  }, [transactions, filterState, currentMonthKey, categoryLookup]);

  // Aggregate stats for filtered items
  const filteredIncome = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const filteredExpense = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const handleResetFilters = () => {
    setFilterState({
      search: '',
      type: 'all',
      categoryId: '',
      paymentMethod: '',
      period: 'all',
      startDate: '',
      endDate: '',
      status: 'all',
      sortBy: 'date_desc',
    });
    if (onClearInitialCategoryFilter) {
      onClearInitialCategoryFilter();
    }
  };

  const isFilterActive =
    Boolean(filterState.search) ||
    filterState.type !== 'all' ||
    Boolean(filterState.categoryId) ||
    Boolean(filterState.paymentMethod) ||
    filterState.period !== 'all' ||
    filterState.status !== 'all';

  return (
    <div className="space-y-4">
      {/* Top Action & Quick Metrics Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Histórico de Movimentações</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {filteredTransactions.length}{' '}
            {filteredTransactions.length === 1 ? 'registro encontrado' : 'registros encontrados'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => exportToCSV(filteredTransactions, categories, 'Extrato_Filtrado')}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors shadow-xs"
            title="Exportar dados filtrados para arquivo CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          <button
            type="button"
            onClick={() => onNewTransaction('expense')}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Movimentação</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Panel */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 transition-colors">
        {/* Row 1: Search & Type & Period */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por descrição, notas..."
              value={filterState.search}
              onChange={(e) => setFilterState((prev) => ({ ...prev, search: e.target.value }))}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Type Selector */}
          <div>
            <select
              value={filterState.type}
              onChange={(e) =>
                setFilterState((prev) => ({
                  ...prev,
                  type: e.target.value as 'all' | 'income' | 'expense',
                }))
              }
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="all">Todos os tipos (Entradas e Saídas)</option>
              <option value="expense">Apenas Despesas</option>
              <option value="income">Apenas Receitas</option>
            </select>
          </div>

          {/* Category Selector */}
          <div>
            <select
              value={filterState.categoryId}
              onChange={(e) =>
                setFilterState((prev) => ({ ...prev, categoryId: e.target.value }))
              }
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="">Todas as Categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type === 'expense' ? 'Despesa' : 'Receita'})
                </option>
              ))}
            </select>
          </div>

          {/* Period Selector */}
          <div>
            <select
              value={filterState.period}
              onChange={(e) =>
                setFilterState((prev) => ({
                  ...prev,
                  period: e.target.value as FilterState['period'],
                }))
              }
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="this_month">Mês Atual (Outubro 2026)</option>
              <option value="last_month">Mês Anterior</option>
              <option value="this_year">Ano de 2026</option>
              <option value="all">Todo o Histórico</option>
              <option value="custom">Período Personalizado</option>
            </select>
          </div>
        </div>

        {/* Row 2: Payment Method, Sorting & Custom Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
          {/* Payment Method */}
          <div>
            <select
              value={filterState.paymentMethod}
              onChange={(e) =>
                setFilterState((prev) => ({ ...prev, paymentMethod: e.target.value }))
              }
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="">Todas Formas de Pagamento</option>
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm.id} value={pm.id}>
                  {pm.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={filterState.status}
              onChange={(e) =>
                setFilterState((prev) => ({
                  ...prev,
                  status: e.target.value as FilterState['status'],
                }))
              }
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="all">Todas as Situações</option>
              <option value="completed">Concluídos</option>
              <option value="pending">Pendentes</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={filterState.sortBy}
              onChange={(e) =>
                setFilterState((prev) => ({
                  ...prev,
                  sortBy: e.target.value as FilterState['sortBy'],
                }))
              }
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="date_desc">Mais Recentes Primeiro</option>
              <option value="date_asc">Mais Antigas Primeiro</option>
              <option value="amount_desc">Maior Valor</option>
              <option value="amount_asc">Menor Valor</option>
            </select>
          </div>

          {/* Reset Filters CTA */}
          <div className="flex items-center justify-end">
            {isFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Limpar Filtros
              </button>
            )}
          </div>
        </div>

        {/* Custom date range inputs */}
        {filterState.period === 'custom' && (
          <div className="flex items-center gap-3 pt-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">De:</span>
            <input
              type="date"
              value={filterState.startDate}
              onChange={(e) =>
                setFilterState((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
            <span className="text-slate-500 dark:text-slate-400 font-medium">Até:</span>
            <input
              type="date"
              value={filterState.endDate}
              onChange={(e) =>
                setFilterState((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>
        )}
      </div>

      {/* Filtered Totals Summary Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Entradas Filtradas</span>
          <span className="text-sm font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            +{formatBRL(filteredIncome)}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Saídas Filtradas</span>
          <span className="text-sm font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
            -{formatBRL(filteredExpense)}
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Resultado do Filtro</span>
          <span
            className={`text-sm font-bold font-mono tabular-nums ${
              filteredIncome - filteredExpense >= 0
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {formatBRL(filteredIncome - filteredExpense)}
          </span>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-colors">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <Filter className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nenhuma movimentação encontrada</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Tente redefinir os filtros aplicados ou cadastre uma nova receita/despesa.
            </p>
            {isFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Limpar Todos os Filtros
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Descrição</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Pagamento</th>
                  <th className="py-3 px-4">Situação</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const cat = categoryLookup.get(tx.categoryId);
                  const pm = paymentMethodLookup.get(tx.paymentMethod);

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400 font-medium">
                        {formatDateBR(tx.date)}
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {tx.description}
                        </div>
                        {tx.notes && (
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                            {tx.notes}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                            style={{ backgroundColor: cat?.bgColor || '#F1F5F9' }}
                          >
                            <CategoryIcon
                              name={cat?.icon || 'HelpCircle'}
                              className="w-3.5 h-3.5"
                              style={{ color: cat?.color || '#64748B' }}
                            />
                          </div>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {cat?.name || 'Não categorizado'}
                          </span>
                        </div>
                      </td>

                      {/* Payment Method */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400 font-medium">
                        <div className="flex items-center gap-1.5">
                          <CategoryIcon
                            name={pm?.icon || 'CreditCard'}
                            className="w-3.5 h-3.5 text-slate-400"
                          />
                          <span>{pm?.label || tx.paymentMethod}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                            tx.status === 'completed'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              tx.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          {tx.status === 'completed' ? 'Concluído' : 'Pendente'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-bold font-mono tabular-nums text-sm ${
                            isIncome
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isIncome ? '+' : '-'} {formatBRL(tx.amount)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => onEditTransaction(tx)}
                            title="Editar movimentação"
                            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Excluir "${tx.description}"?`)) {
                                onDeleteTransaction(tx.id);
                              }
                            }}
                            title="Excluir movimentação"
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
