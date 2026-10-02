export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 
  | 'pix' 
  | 'credit_card' 
  | 'debit_card' 
  | 'cash' 
  | 'bank_transfer' 
  | 'bank_slip';

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  icon: string;
  color: string;
  bgColor: string;
  budgetLimit?: number; // Monthly budget limit in BRL (for expense categories)
  isCustom?: boolean;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string; // ISO YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  status: 'completed' | 'pending';
  createdAt: string;
}

export interface BudgetAlert {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  color: string;
  spent: number;
  limit: number;
  percentage: number;
  severity: 'warning' | 'danger'; // warning: 80-99.9%, danger: >=100%
  overAmount: number;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  icon: string;
  color: string;
  category?: string;
  notes?: string;
  createdAt: string;
}

export interface MonthlySummary {
  monthKey: string; // YYYY-MM
  label: string; // Out/2026
  income: number;
  expense: number;
  balance: number;
}

export interface NetWorthPoint {
  monthKey: string; // YYYY-MM
  label: string; // Out/2026
  income: number;
  expense: number;
  monthlyNet: number;
  netWorth: number;
  savingsRate: number;
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  color: string;
  icon: string;
  total: number;
  count: number;
  percentage: number;
  budgetLimit?: number;
}

export type PeriodFilter = 
  | 'this_month'
  | 'last_month'
  | 'last_3_months'
  | 'this_year'
  | 'all'
  | 'custom';

export interface FilterState {
  search: string;
  type: 'all' | 'income' | 'expense';
  categoryId: string;
  paymentMethod: string;
  period: PeriodFilter;
  startDate: string;
  endDate: string;
  status: 'all' | 'completed' | 'pending';
  sortBy: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  timestamp: number;
}
