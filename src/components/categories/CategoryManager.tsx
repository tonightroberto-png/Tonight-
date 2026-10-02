import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import { Category, Transaction } from '../../types/finance';
import { formatBRL } from '../../utils/formatters';
import { CategoryIcon } from '../CategoryIcon';
import { CategoryModal } from './CategoryModal';

interface CategoryManagerProps {
  categories: Category[];
  transactions: Transaction[];
  onAddCategory: (categoryData: Omit<Category, 'id'>) => void;
  onEditCategory: (categoryData: Omit<Category, 'id'>, id: string) => void;
  onDeleteCategory: (id: string) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  transactions,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Count transactions per category
  const txCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of transactions) {
      map.set(tx.categoryId, (map.get(tx.categoryId) || 0) + 1);
    }
    return map;
  }, [transactions]);

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      if (filterType === 'expense') return c.type === 'expense' || c.type === 'both';
      if (filterType === 'income') return c.type === 'income' || c.type === 'both';
      return true;
    });
  }, [categories, filterType]);

  const handleOpenNew = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleDelete = (cat: Category) => {
    const count = txCountMap.get(cat.id) || 0;
    let message = `Deseja realmente excluir a categoria "${cat.name}"?`;
    if (count > 0) {
      message += `\n\nAtenção: Existem ${count} movimentações associadas a esta categoria. Elas serão reatribuídas para a categoria padrão "Outros".`;
    }
    if (confirm(message)) {
      onDeleteCategory(cat.id);
    }
  };

  const handleSaveCategory = (
    categoryData: Omit<Category, 'id'>,
    existingId?: string
  ) => {
    if (existingId) {
      onEditCategory(categoryData, existingId);
    } else {
      onAddCategory(categoryData);
    }
  };

  const expenseCount = categories.filter((c) => c.type === 'expense' || c.type === 'both').length;
  const incomeCount = categories.filter((c) => c.type === 'income' || c.type === 'both').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-slate-800 dark:text-slate-200" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Gerenciador de Categorias
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Crie, edite e personalize categorias para receitas e despesas com seus respectivos orçamentos
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenNew}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Categoria</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-all ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todas ({categories.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-all ${
                filterType === 'expense'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Despesas ({expenseCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('income')}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-all ${
                filterType === 'income'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Receitas ({incomeCount})
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredCategories.map((cat) => {
          const isExpense = cat.type === 'expense' || cat.type === 'both';
          const txCount = txCountMap.get(cat.id) || 0;

          return (
            <div
              key={cat.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                      style={{ backgroundColor: cat.bgColor }}
                    >
                      <CategoryIcon
                        name={cat.icon}
                        className="w-4 h-4"
                        style={{ color: cat.color }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {cat.name}
                      </h4>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        {isExpense ? (
                          <>
                            <ArrowDownLeft className="w-3 h-3 text-rose-500" />
                            <span>Despesa</span>
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                            <span>Receita</span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span>{txCount} {txCount === 1 ? 'lançamento' : 'lançamentos'}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Editar categoria"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Excluir categoria"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Budget Limit Information if expense */}
                {isExpense && (
                  <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Orçamento Mensal:</span>
                    <strong className="font-mono tabular-nums text-slate-900 dark:text-slate-100">
                      {cat.budgetLimit ? formatBRL(cat.budgetLimit) : 'Sem limite definido'}
                    </strong>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCategory}
        initialCategory={editingCategory}
      />
    </div>
  );
};
