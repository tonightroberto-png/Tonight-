import React, { useState } from 'react';
import {
  Plus,
  Bell,
  Wallet,
  Menu,
  X,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Sun,
  Moon,
  Search
} from 'lucide-react';
import { BudgetAlert, Category, FinancialGoal, Transaction } from '../types/finance';
import { formatBRL } from '../utils/formatters';
import { GlobalSearch } from './GlobalSearch';

interface NavbarProps {
  activeTab: 'dashboard' | 'transactions' | 'budgets' | 'goals' | 'reports' | 'categories';
  onChangeTab: (tab: 'dashboard' | 'transactions' | 'budgets' | 'goals' | 'reports' | 'categories') => void;
  onNewTransaction: () => void;
  alerts: BudgetAlert[];
  onResetDemoData: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  transactions: Transaction[];
  categories: Category[];
  goals: FinancialGoal[];
  onSelectTransaction: (tx: Transaction) => void;
  onSelectGoal: (goal: FinancialGoal) => void;
  onSelectCategory: (categoryId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onChangeTab,
  onNewTransaction,
  alerts,
  onResetDemoData,
  isDarkMode,
  onToggleDarkMode,
  transactions,
  categories,
  goals,
  onSelectTransaction,
  onSelectGoal,
  onSelectCategory,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alertsDropdownOpen, setAlertsDropdownOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'transactions', label: 'Movimentações' },
    { id: 'budgets', label: 'Orçamentos' },
    { id: 'goals', label: 'Metas' },
    { id: 'reports', label: 'Relatórios' },
    { id: 'categories', label: 'Categorias' },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onChangeTab('dashboard')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-800 border border-transparent dark:border-slate-700 flex items-center justify-center text-white shadow-xs group-hover:bg-slate-800 dark:group-hover:bg-slate-700 transition-colors">
                <Wallet className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                FinControl
              </span>
            </button>
          </div>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChangeTab(item.id)}
                  className={`relative py-1 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                  {item.id === 'budgets' && alerts.length > 0 && (
                    <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-rose-500" />
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 dark:bg-white rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Global Search Input (Desktop & Tablets) */}
          <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm justify-center">
            <GlobalSearch
              transactions={transactions}
              categories={categories}
              goals={goals}
              onSelectTransaction={onSelectTransaction}
              onSelectGoal={onSelectGoal}
              onSelectCategory={onSelectCategory}
            />
          </div>

          {/* Zone 3: Actions + theme toggle */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Dark mode toggle */}
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDarkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Noturno'}
              aria-label="Alternar tema claro/escuro"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setAlertsDropdownOpen(!alertsDropdownOpen)}
                className={`relative p-2 rounded-lg border transition-colors ${
                  alerts.length > 0
                    ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 hover:bg-amber-100/60 dark:hover:bg-amber-950/60'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Notificações e Alertas de Limites"
              >
                <Bell className="w-4 h-4" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center font-mono">
                    {alerts.length}
                  </span>
                )}
              </button>

              {/* Alerts dropdown panel */}
              {alertsDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-3 px-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      Alertas de Limite Orçamentário
                    </span>
                    <button
                      type="button"
                      onClick={() => setAlertsDropdownOpen(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {alerts.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="font-medium text-slate-800 dark:text-slate-200">Todos os gastos sob controle</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        Nenhuma categoria atingiu 80% ou 100% do orçamento.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-2 space-y-2 max-h-64 overflow-y-auto pr-1">
                      {alerts.map((al) => {
                        const isDanger = al.severity === 'danger';
                        return (
                          <div
                            key={al.categoryId}
                            className={`p-2.5 rounded-lg border text-xs ${
                              isDanger
                                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-950 dark:text-rose-200'
                                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-950 dark:text-amber-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold">{al.categoryName}</span>
                              <span className="font-mono font-bold">
                                {al.percentage.toFixed(0)}%
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
                              Gasto: {formatBRL(al.spent)} / Teto: {formatBRL(al.limit)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        onChangeTab('budgets');
                        setAlertsDropdownOpen(false);
                      }}
                      className="text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white"
                    >
                      Gerenciar Orçamentos &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Nova Transação Primary CTA */}
            <button
              type="button"
              onClick={onNewTransaction}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-emerald-400 dark:text-white" />
              <span className="hidden sm:inline">Nova Transação</span>
              <span className="sm:hidden">Nova</span>
            </button>

            {/* Mobile Hamburger toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-in slide-in-from-top-2 duration-150">
            {/* Mobile Search input */}
            <div className="px-1">
              <GlobalSearch
                transactions={transactions}
                categories={categories}
                goals={goals}
                onSelectTransaction={(tx) => {
                  onSelectTransaction(tx);
                  setMobileMenuOpen(false);
                }}
                onSelectGoal={(goal) => {
                  onSelectGoal(goal);
                  setMobileMenuOpen(false);
                }}
                onSelectCategory={(catId) => {
                  onSelectCategory(catId);
                  setMobileMenuOpen(false);
                }}
              />
            </div>

            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onChangeTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg flex items-center justify-between ${
                    activeTab === item.id
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.id === 'budgets' && alerts.length > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                      {alerts.length} alertas
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 px-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Restaurar dados de demonstração originais?')) {
                    onResetDemoData();
                    setMobileMenuOpen(false);
                  }
                }}
                className="w-full text-left text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1.5 py-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar dados de demonstração</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
