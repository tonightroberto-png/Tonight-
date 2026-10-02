import { BudgetAlert, Category, CategorySummary, MonthlySummary, NetWorthPoint, PaymentMethod, Transaction } from '../types/finance';

export const formatBRL = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatShortBRL = (value: number): string => {
  if (Math.abs(value) >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1).replace('.', ',')}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `R$ ${(value / 1_000).toFixed(1).replace('.', ',')}k`;
  }
  return formatBRL(value);
};

export const formatDateBR = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  return `${day}/${month}/${year}`;
};

export const formatShortDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const monthIdx = parseInt(month, 10) - 1;
  return `${day} ${months[monthIdx] || ''}`;
};

export const formatMonthLabel = (monthKey: string): string => {
  // YYYY-MM
  const [year, month] = monthKey.split('-');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const monthIdx = parseInt(month, 10) - 1;
  return `${months[monthIdx] || month}/${year}`;
};

export const getMonthKey = (dateStr: string): string => {
  return dateStr.slice(0, 7);
};

export const getTodayISO = (): string => {
  // Use 2026-10-02 as anchor or system today
  return '2026-10-02';
};

export const calculateBudgetAlerts = (
  transactions: Transaction[],
  categories: Category[],
  monthKey: string
): BudgetAlert[] => {
  // Filter expenses for specified month
  const monthExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(monthKey)
  );

  const spentByCategory = new Map<string, number>();
  for (const t of monthExpenses) {
    spentByCategory.set(t.categoryId, (spentByCategory.get(t.categoryId) || 0) + t.amount);
  }

  const alerts: BudgetAlert[] = [];

  for (const cat of categories) {
    if (cat.type !== 'expense' && cat.type !== 'both') continue;
    if (!cat.budgetLimit || cat.budgetLimit <= 0) continue;

    const spent = spentByCategory.get(cat.id) || 0;
    const percentage = (spent / cat.budgetLimit) * 100;

    if (percentage >= 80) {
      alerts.push({
        categoryId: cat.id,
        categoryName: cat.name,
        categoryIcon: cat.icon,
        color: cat.color,
        spent,
        limit: cat.budgetLimit,
        percentage,
        severity: percentage >= 100 ? 'danger' : 'warning',
        overAmount: Math.max(0, spent - cat.budgetLimit),
      });
    }
  }

  // Sort: danger first, then by highest percentage
  return alerts.sort((a, b) => {
    if (a.severity === 'danger' && b.severity !== 'danger') return -1;
    if (b.severity === 'danger' && a.severity !== 'danger') return 1;
    return b.percentage - a.percentage;
  });
};

export const calculateCategorySummaries = (
  transactions: Transaction[],
  categories: Category[],
  type: 'expense' | 'income' = 'expense'
): CategorySummary[] => {
  const filtered = transactions.filter((t) => t.type === type);
  const totalAmount = filtered.reduce((acc, t) => acc + t.amount, 0);

  const catMap = new Map<string, { total: number; count: number }>();
  for (const t of filtered) {
    const current = catMap.get(t.categoryId) || { total: 0, count: 0 };
    catMap.set(t.categoryId, {
      total: current.total + t.amount,
      count: current.count + 1,
    });
  }

  const summaries: CategorySummary[] = [];
  for (const [catId, data] of catMap.entries()) {
    const category = categories.find((c) => c.id === catId);
    summaries.push({
      categoryId: catId,
      categoryName: category?.name || 'Outros',
      color: category?.color || '#94A3B8',
      icon: category?.icon || 'HelpCircle',
      total: data.total,
      count: data.count,
      percentage: totalAmount > 0 ? (data.total / totalAmount) * 100 : 0,
      budgetLimit: category?.budgetLimit,
    });
  }

  // Sort descending by total amount
  return summaries.sort((a, b) => b.total - a.total);
};

export const calculateMonthlyEvolution = (
  transactions: Transaction[],
  monthsCount: number = 6
): MonthlySummary[] => {
  // Collect all months
  const monthMap = new Map<string, { income: number; expense: number }>();

  for (const t of transactions) {
    const key = t.date.slice(0, 7);
    if (!monthMap.has(key)) {
      monthMap.set(key, { income: 0, expense: 0 });
    }
    const current = monthMap.get(key)!;
    if (t.type === 'income') {
      current.income += t.amount;
    } else {
      current.expense += t.amount;
    }
  }

  // Sort keys ascending
  const sortedKeys = Array.from(monthMap.keys()).sort();
  const recentKeys = sortedKeys.slice(-monthsCount);

  return recentKeys.map((key) => {
    const data = monthMap.get(key)!;
    return {
      monthKey: key,
      label: formatMonthLabel(key),
      income: data.income,
      expense: data.expense,
      balance: data.income - data.expense,
    };
  });
};

export const calculateNetWorthEvolution = (
  transactions: Transaction[]
): NetWorthPoint[] => {
  const monthMap = new Map<string, { income: number; expense: number }>();

  for (const t of transactions) {
    const key = t.date.slice(0, 7);
    if (!monthMap.has(key)) {
      monthMap.set(key, { income: 0, expense: 0 });
    }
    const current = monthMap.get(key)!;
    if (t.type === 'income') {
      current.income += t.amount;
    } else {
      current.expense += t.amount;
    }
  }

  const sortedKeys = Array.from(monthMap.keys()).sort();
  let runningNetWorth = 0;

  return sortedKeys.map((key) => {
    const data = monthMap.get(key)!;
    const monthlyNet = data.income - data.expense;
    runningNetWorth += monthlyNet;
    const savingsRate = data.income > 0 ? Math.max(0, (monthlyNet / data.income) * 100) : 0;

    return {
      monthKey: key,
      label: formatMonthLabel(key),
      income: data.income,
      expense: data.expense,
      monthlyNet,
      netWorth: runningNetWorth,
      savingsRate,
    };
  });
};

export const exportToCSV = (
  transactions: Transaction[],
  categories: Category[],
  filenameSuffix?: string
): void => {
  const catLookup = new Map(categories.map((c) => [c.id, c.name]));
  const paymentLabels: Record<PaymentMethod, string> = {
    pix: 'Pix',
    credit_card: 'Cartão de Crédito',
    debit_card: 'Cartão de Débito',
    cash: 'Dinheiro',
    bank_transfer: 'Transferência / TED',
    bank_slip: 'Boleto Bancário',
  };

  const headers = ['Data', 'Tipo', 'Descrição', 'Categoria', 'Valor (R$)', 'Forma de Pagamento', 'Status', 'Observações'];
  const rows = transactions.map((t) => [
    formatDateBR(t.date),
    t.type === 'income' ? 'Receita' : 'Despesa',
    `"${(t.description || '').replace(/"/g, '""')}"`,
    `"${(catLookup.get(t.categoryId) || 'Outros').replace(/"/g, '""')}"`,
    t.amount.toFixed(2).replace('.', ','),
    `"${paymentLabels[t.paymentMethod] || t.paymentMethod}"`,
    t.status === 'completed' ? 'Concluído' : 'Pendente',
    `"${(t.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const suffix = filenameSuffix ? `_${filenameSuffix}` : `_${getTodayISO()}`;
  link.setAttribute('download', `FinControl_Extrato${suffix}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
