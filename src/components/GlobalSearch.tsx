import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  ArrowRight,
  Target,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Clock,
  Command
} from 'lucide-react';
import { Category, FinancialGoal, Transaction } from '../types/finance';
import { formatBRL, formatDateBR } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface GlobalSearchProps {
  transactions: Transaction[];
  categories: Category[];
  goals: FinancialGoal[];
  onSelectTransaction: (tx: Transaction) => void;
  onSelectGoal: (goal: FinancialGoal) => void;
  onSelectCategory: (categoryId: string) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  transactions,
  categories,
  goals,
  onSelectTransaction,
  onSelectGoal,
  onSelectCategory,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Category map for quick lookup
  const categoryLookup = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c]));
  }, [categories]);

  // Global hotkey: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter items in real time
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        matchedTransactions: [],
        matchedGoals: [],
        matchedCategories: [],
        totalCount: 0,
      };
    }

    // 1. Transactions
    const matchedTransactions = transactions
      .filter((tx) => {
        const cat = categoryLookup.get(tx.categoryId);
        return (
          tx.description.toLowerCase().includes(q) ||
          (tx.notes && tx.notes.toLowerCase().includes(q)) ||
          (cat && cat.name.toLowerCase().includes(q)) ||
          tx.amount.toString().includes(q)
        );
      })
      .slice(0, 6); // Top 6

    // 2. Goals
    const matchedGoals = goals
      .filter((g) => {
        return (
          g.title.toLowerCase().includes(q) ||
          (g.notes && g.notes.toLowerCase().includes(q)) ||
          g.targetAmount.toString().includes(q)
        );
      })
      .slice(0, 4); // Top 4

    // 3. Categories
    const matchedCategories = categories
      .filter((c) => {
        return (
          c.name.toLowerCase().includes(q) ||
          (c.type === 'expense' && 'despesa'.includes(q)) ||
          (c.type === 'income' && 'receita'.includes(q))
        );
      })
      .slice(0, 4); // Top 4

    const totalCount =
      matchedTransactions.length + matchedGoals.length + matchedCategories.length;

    return {
      matchedTransactions,
      matchedGoals,
      matchedCategories,
      totalCount,
    };
  }, [query, transactions, goals, categories, categoryLookup]);

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
  };

  const handleTransactionClick = (tx: Transaction) => {
    onSelectTransaction(tx);
    setIsOpen(false);
    setQuery('');
  };

  const handleGoalClick = (goal: FinancialGoal) => {
    onSelectGoal(goal);
    setIsOpen(false);
    setQuery('');
  };

  const handleCategoryClick = (categoryId: string) => {
    onSelectCategory(categoryId);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xs sm:max-w-sm lg:max-w-md">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar transações, categorias, metas..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-9 pr-14 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/60 dark:hover:bg-slate-800 border border-transparent focus:border-slate-300 dark:focus:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-slate-400/20 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
        />

        {query ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-flex items-center gap-0.5 absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-700/60 border border-slate-200 dark:border-slate-700 rounded shadow-2xs pointer-events-none">
            <span className="text-[9px]">⌘</span>K
          </kbd>
        )}
      </div>

      {/* Floating Results Dropdown Panel */}
      {isOpen && query.trim() !== '' && (
        <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[75vh] overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-150 p-2 space-y-3">
          {searchResults.totalCount === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
              <Search className="w-6 h-6 mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                Nenhum resultado para "{query}"
              </p>
              <p className="text-[11px] mt-0.5">
                Tente buscar por descrição de despesa/receita, nome de categoria ou objetivo financeiro.
              </p>
            </div>
          ) : (
            <>
              {/* Category Results */}
              {searchResults.matchedCategories.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      Categorias ({searchResults.matchedCategories.length})
                    </span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {searchResults.matchedCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategoryClick(cat.id)}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
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
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {cat.name}
                            </p>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              {cat.type === 'expense' ? 'Despesa' : 'Receita'}
                              {cat.budgetLimit ? ` · Teto: ${formatBRL(cat.budgetLimit)}` : ''}
                            </span>
                          </div>
                        </div>

                        <span className="text-[11px] text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 font-medium flex items-center gap-1 shrink-0 ml-2">
                          Filtrar gastos <ArrowRight className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Financial Goals Results */}
              {searchResults.matchedGoals.length > 0 && (
                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-blue-500" />
                      Metas Financeiras ({searchResults.matchedGoals.length})
                    </span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {searchResults.matchedGoals.map((goal) => {
                      const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                      return (
                        <button
                          key={goal.id}
                          type="button"
                          onClick={() => handleGoalClick(goal)}
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                              style={{ backgroundColor: goal.color || '#3B82F6' }}
                            >
                              <CategoryIcon
                                name={goal.icon || 'Target'}
                                className="w-3.5 h-3.5 text-white"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                                {goal.title}
                              </p>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Calendar className="w-2.5 h-2.5" />
                                Prazo: {formatDateBR(goal.deadline)}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0 ml-2">
                            <span className="text-xs font-bold font-mono text-slate-900 dark:text-slate-100 block">
                              {formatBRL(goal.currentAmount)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {pct}% de {formatBRL(goal.targetAmount)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Transactions Results */}
              {searchResults.matchedTransactions.length > 0 && (
                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      Movimentações ({searchResults.matchedTransactions.length})
                    </span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {searchResults.matchedTransactions.map((tx) => {
                      const isIncome = tx.type === 'income';
                      const cat = categoryLookup.get(tx.categoryId);

                      return (
                        <button
                          key={tx.id}
                          type="button"
                          onClick={() => handleTransactionClick(tx)}
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                              style={{ backgroundColor: cat?.bgColor || '#F1F5F9' }}
                            >
                              <CategoryIcon
                                name={cat?.icon || 'Tag'}
                                className="w-3.5 h-3.5"
                                style={{ color: cat?.color || '#64748B' }}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                                {tx.description}
                              </p>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <span>{formatDateBR(tx.date)}</span>
                                <span aria-hidden="true">·</span>
                                <span>{cat?.name || 'Geral'}</span>
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0 ml-2">
                            <span
                              className={`text-xs font-bold font-mono tabular-nums ${
                                isIncome
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {isIncome ? '+' : '-'} {formatBRL(tx.amount)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Quick Footer hint */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 px-2 py-1 flex items-center justify-between text-[10px] text-slate-400">
            <span>Pressione <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">ESC</kbd> para fechar</span>
            <span>{searchResults.totalCount} resultados encontrados</span>
          </div>
        </div>
      )}
    </div>
  );
};
