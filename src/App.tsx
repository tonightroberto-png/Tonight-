/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Category,
  FinancialGoal,
  ToastMessage,
  Transaction,
  TransactionType,
} from './types/finance';
import {
  DEFAULT_CATEGORIES,
  SEED_GOALS,
  SEED_TRANSACTIONS,
} from './data/defaultData';
import {
  calculateBudgetAlerts,
  formatBRL,
  getTodayISO,
} from './utils/formatters';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TransactionHistory } from './components/TransactionHistory';
import { BudgetOverview } from './components/BudgetOverview';
import { GoalsView } from './components/goals/GoalsView';
import { ReportsView } from './components/reports/ReportsView';
import { CategoryManager } from './components/categories/CategoryManager';
import { TransactionModal } from './components/TransactionModal';
import { BudgetManagerModal } from './components/BudgetManagerModal';
import { ToastContainer } from './components/ToastContainer';
import { BudgetAlertsBanner } from './components/BudgetAlertsBanner';

const STORAGE_KEYS = {
  TRANSACTIONS: 'fincontrol_transactions_v2',
  CATEGORIES: 'fincontrol_categories_v2',
  GOALS: 'fincontrol_goals_v2',
  THEME: 'fincontrol_theme_v2',
};

export default function App() {
  // --- Persistent State ---
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME);
      if (stored) return stored === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, isDarkMode ? 'dark' : 'light');
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error('Failed syncing theme', e);
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed reading transactions from localStorage', e);
    }
    return SEED_TRANSACTIONS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed reading categories from localStorage', e);
    }
    return DEFAULT_CATEGORIES;
  });

  const [goals, setGoals] = useState<FinancialGoal[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed reading goals from localStorage', e);
    }
    return SEED_GOALS;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed saving transactions', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed saving categories', e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    } catch (e) {
      console.error('Failed saving goals', e);
    }
  }, [goals]);

  // --- UI Navigation & Modals ---
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'transactions' | 'budgets' | 'goals' | 'reports' | 'categories'
  >('dashboard');
  const [currentMonthKey, setCurrentMonthKey] = useState<string>('2026-10');
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [defaultTxType, setDefaultTxType] = useState<TransactionType>('expense');
  const [isBudgetManagerOpen, setIsBudgetManagerOpen] = useState(false);
  const [filterCategoryId, setFilterCategoryId] = useState<string>('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Push Toast Helper
  const addToast = useCallback(
    (type: ToastMessage['type'], title: string, message: string) => {
      const newToast: ToastMessage = {
        id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type,
        title,
        message,
        timestamp: Date.now(),
      };
      setToasts((prev) => [...prev, newToast]);

      // Auto dismiss after 6s
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 6000);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- Budget Alerts Calculation ---
  const budgetAlerts = useMemo(() => {
    return calculateBudgetAlerts(transactions, categories, currentMonthKey);
  }, [transactions, categories, currentMonthKey]);

  // --- Initial Welcome Alert Check ---
  useEffect(() => {
    // Notify user if starting with exceeded or warning categories
    if (budgetAlerts.length > 0) {
      const danger = budgetAlerts.filter((a) => a.severity === 'danger');
      if (danger.length > 0) {
        addToast(
          'danger',
          'Alerta de Orçamento Excedido',
          `${danger[0].categoryName} ultrapassou o teto estipulado em ${formatBRL(danger[0].overAmount)}.`
        );
      }
    }
  }, []); // Run on mount

  // --- Transaction Handlers ---
  const handleOpenNewTransaction = (type: TransactionType = 'expense') => {
    setEditingTx(null);
    setDefaultTxType(type);
    setIsTxModalOpen(true);
  };

  const handleOpenEditTransaction = (tx: Transaction) => {
    setEditingTx(tx);
    setIsTxModalOpen(true);
  };

  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === existingId ? { ...t, ...txData } : t))
      );
      addToast('success', 'Movimentação Atualizada', `"${txData.description}" foi alterada com sucesso.`);
    } else {
      const newTx: Transaction = {
        ...txData,
        id: `tx-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setTransactions((prev) => [newTx, ...prev]);
      addToast(
        txData.type === 'income' ? 'success' : 'info',
        txData.type === 'income' ? 'Receita Registrada' : 'Despesa Registrada',
        `${txData.description} no valor de ${formatBRL(txData.amount)}.`
      );

      // Check if this expense caused an alert for its category
      if (txData.type === 'expense') {
        const cat = categories.find((c) => c.id === txData.categoryId);
        if (cat && cat.budgetLimit && cat.budgetLimit > 0) {
          const monthTx = [
            newTx,
            ...transactions.filter(
              (t) =>
                t.categoryId === cat.id &&
                t.type === 'expense' &&
                t.date.startsWith(currentMonthKey)
            ),
          ];
          const newSpent = monthTx.reduce((sum, t) => sum + t.amount, 0);
          const pct = (newSpent / cat.budgetLimit) * 100;

          if (pct >= 100) {
            addToast(
              'danger',
              'Alerta de Limite Excedido (100%+)',
              `A categoria ${cat.name} atingiu ${pct.toFixed(0)}% do orçamento planejado!`
            );
          } else if (pct >= 80) {
            addToast(
              'warning',
              'Alerta de Atenção (80%+)',
              `A categoria ${cat.name} atingiu ${pct.toFixed(0)}% do orçamento planejado.`
            );
          }
        }
      }
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    addToast('info', 'Movimentação Excluída', 'O registro foi removido com sucesso.');
  };

  // --- Category Handlers ---
  const handleAddCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...categoryData,
      id: `cat-custom-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    addToast('success', 'Categoria Criada', `A categoria "${newCat.name}" foi adicionada.`);
  };

  const handleEditCategory = (
    categoryData: Omit<Category, 'id'>,
    id: string
  ) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...categoryData } : c))
    );
    addToast('success', 'Categoria Atualizada', `"${categoryData.name}" foi atualizada.`);
  };

  const handleDeleteCategory = (id: string) => {
    const catToDelete = categories.find((c) => c.id === id);
    if (!catToDelete) return;

    // Reassign transactions of deleted category to generic fallback
    const fallbackId =
      catToDelete.type === 'income' ? 'cat-outras-receitas' : 'cat-outros-gastos';

    setTransactions((prev) =>
      prev.map((t) => (t.categoryId === id ? { ...t, categoryId: fallbackId } : t))
    );

    setCategories((prev) => prev.filter((c) => c.id !== id));
    addToast(
      'info',
      'Categoria Excluída',
      `"${catToDelete.name}" foi removida. Transações foram reatribuídas para "Outros".`
    );
  };

  // --- Budget Limit Updates ---
  const handleUpdateCategoryLimits = (updatedLimits: Record<string, number>) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (updatedLimits[c.id] !== undefined) {
          return {
            ...c,
            budgetLimit: updatedLimits[c.id] > 0 ? updatedLimits[c.id] : undefined,
          };
        }
        return c;
      })
    );
    addToast('success', 'Orçamentos Atualizados', 'Os novos limites por categoria foram salvos.');
  };

  // --- Financial Goals Handlers ---
  const handleAddGoal = (goalData: Omit<FinancialGoal, 'id' | 'createdAt'>) => {
    const newGoal: FinancialGoal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setGoals((prev) => [newGoal, ...prev]);
    addToast(
      'success',
      'Meta Financeira Criada',
      `Objetivo "${newGoal.title}" cadastrado com sucesso.`
    );
  };

  const handleEditGoal = (
    goalData: Omit<FinancialGoal, 'id' | 'createdAt'>,
    id: string
  ) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...goalData } : g))
    );
    addToast('success', 'Meta Atualizada', `"${goalData.title}" foi atualizada.`);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    addToast('info', 'Meta Excluída', 'A meta foi removida.');
  };

  const handleUpdateGoalAmount = (goalId: string, newAmount: number) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, currentAmount: newAmount } : g))
    );
    addToast('success', 'Aporte Registrado', 'O saldo da meta foi atualizado com sucesso.');
  };

  // Quick navigation helper to jump to filtered transactions
  const handleFilterByCategory = (catId: string) => {
    setFilterCategoryId(catId);
    setActiveTab('transactions');
  };

  const handleSelectTransactionFromSearch = (tx: Transaction) => {
    setActiveTab('transactions');
    setEditingTx(tx);
    setIsTxModalOpen(true);
  };

  const handleSelectGoalFromSearch = (_goal: FinancialGoal) => {
    setActiveTab('goals');
  };

  // Reset Demo Data
  const handleResetDemoData = () => {
    setTransactions(SEED_TRANSACTIONS);
    setCategories(DEFAULT_CATEGORIES);
    setGoals(SEED_GOALS);
    addToast('info', 'Dados Restaurados', 'Os dados originais de demonstração foram restabelecidos.');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      {/* Top Navbar with Global Search */}
      <Navbar
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'transactions') {
            setFilterCategoryId('');
          }
        }}
        onNewTransaction={() => handleOpenNewTransaction('expense')}
        alerts={budgetAlerts}
        onResetDemoData={handleResetDemoData}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        transactions={transactions}
        categories={categories}
        goals={goals}
        onSelectTransaction={handleSelectTransactionFromSearch}
        onSelectGoal={handleSelectGoalFromSearch}
        onSelectCategory={handleFilterByCategory}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner Alert for Budgets exceeding 80% / 100% on Dashboard and Budgets tabs */}
        {(activeTab === 'dashboard' || activeTab === 'budgets') && budgetAlerts.length > 0 && (
          <BudgetAlertsBanner
            alerts={budgetAlerts}
            onFilterByCategory={handleFilterByCategory}
            onOpenBudgetManager={() => setIsBudgetManagerOpen(true)}
          />
        )}

        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <DashboardView
            transactions={transactions}
            categories={categories}
            goals={goals}
            alerts={budgetAlerts}
            currentMonthKey={currentMonthKey}
            onChangeMonthKey={setCurrentMonthKey}
            onNewTransaction={handleOpenNewTransaction}
            onNavigateToTab={setActiveTab}
            onFilterByCategory={handleFilterByCategory}
            onOpenBudgetManager={() => setIsBudgetManagerOpen(true)}
          />
        )}

        {/* Tab 2: Movimentações (Ledger & Filters) */}
        {activeTab === 'transactions' && (
          <TransactionHistory
            transactions={transactions}
            categories={categories}
            currentMonthKey={currentMonthKey}
            onEditTransaction={handleOpenEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onNewTransaction={handleOpenNewTransaction}
            initialCategoryIdFilter={filterCategoryId}
            onClearInitialCategoryFilter={() => setFilterCategoryId('')}
          />
        )}

        {/* Tab 3: Orçamentos Mensais */}
        {activeTab === 'budgets' && (
          <BudgetOverview
            categories={categories}
            transactions={transactions}
            currentMonthKey={currentMonthKey}
            onOpenBudgetManager={() => setIsBudgetManagerOpen(true)}
            onFilterByCategory={handleFilterByCategory}
          />
        )}

        {/* Tab 4: Metas Financeiras */}
        {activeTab === 'goals' && (
          <GoalsView
            goals={goals}
            onAddGoal={handleAddGoal}
            onEditGoal={handleEditGoal}
            onDeleteGoal={handleDeleteGoal}
            onUpdateGoalAmount={handleUpdateGoalAmount}
          />
        )}

        {/* Tab 5: Relatórios & Análise Patrimonial (Recharts) */}
        {activeTab === 'reports' && (
          <ReportsView
            transactions={transactions}
            categories={categories}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Tab 6: Gerenciador de Categorias & Configurações */}
        {activeTab === 'categories' && (
          <CategoryManager
            categories={categories}
            transactions={transactions}
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}
      </main>

      {/* Transaction Create / Edit Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleSaveTransaction}
        categories={categories}
        initialTransaction={editingTx}
        defaultType={defaultTxType}
      />

      {/* Budget Limit Manager Modal */}
      <BudgetManagerModal
        isOpen={isBudgetManagerOpen}
        onClose={() => setIsBudgetManagerOpen(false)}
        categories={categories}
        transactions={transactions}
        currentMonthKey={currentMonthKey}
        onUpdateCategoryLimits={handleUpdateCategoryLimits}
      />

      {/* Floating Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
