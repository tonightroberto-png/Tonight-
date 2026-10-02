import React, { useState } from 'react';
import { CategorySummary } from '../../types/finance';
import { formatBRL } from '../../utils/formatters';
import { CategoryIcon } from '../CategoryIcon';

interface CategoryDonutChartProps {
  categories: CategorySummary[];
  totalExpense: number;
  onSelectCategory?: (categoryId: string) => void;
  selectedCategoryId?: string;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  categories,
  totalExpense,
  onSelectCategory,
  selectedCategoryId,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (categories.length === 0 || totalExpense <= 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 dark:text-slate-500">
        <p className="text-sm font-medium">Nenhuma despesa registrada neste período</p>
        <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">Cadastre novas despesas para visualizar a distribuição</p>
      </div>
    );
  }

  // SVG Geometry
  const size = 220;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate slice offsets
  let accumulatedOffset = 0;
  const slices = categories.map((cat) => {
    const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedOffset;
    accumulatedOffset += (cat.percentage / 100) * circumference;
    return {
      ...cat,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeCategory = categories.find(
    (c) => c.categoryId === (hoveredId || selectedCategoryId)
  );

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
      {/* SVG Donut Visual */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90 origin-center transition-transform duration-300"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background circle track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            className="text-slate-100 dark:text-slate-800"
            strokeWidth={strokeWidth}
          />
          {slices.map((slice) => {
            const isHovered = (hoveredId || selectedCategoryId) === slice.categoryId;
            return (
              <circle
                key={slice.categoryId}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 5 : strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap="butt"
                className="cursor-pointer transition-all duration-200"
                style={{
                  filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.25))' : 'none',
                  opacity: (hoveredId || selectedCategoryId) && !isHovered ? 0.45 : 1,
                }}
                onMouseEnter={() => setHoveredId(slice.categoryId)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onSelectCategory && onSelectCategory(slice.categoryId)}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          {activeCategory ? (
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate max-w-[120px]">
                {activeCategory.categoryName}
              </span>
              <span className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
                {formatBRL(activeCategory.total)}
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5 font-mono">
                {activeCategory.percentage.toFixed(1)}%
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Gastos
              </span>
              <span className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
                {formatBRL(totalExpense)}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {categories.length} {categories.length === 1 ? 'categoria' : 'categorias'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Legend List */}
      <div className="flex-1 w-full space-y-2 max-h-[220px] overflow-y-auto pr-1">
        {categories.map((cat) => {
          const isSelected = (hoveredId || selectedCategoryId) === cat.categoryId;
          return (
            <div
              key={cat.categoryId}
              onMouseEnter={() => setHoveredId(cat.categoryId)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelectCategory && onSelectCategory(cat.categoryId)}
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-sm ${
                isSelected
                  ? 'bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <CategoryIcon name={cat.icon} className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                <span className="truncate text-slate-700 dark:text-slate-300 font-medium">{cat.categoryName}</span>
              </div>

              <div className="flex items-center gap-3 shrink-0 ml-2">
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 font-mono w-10 text-right">
                  {cat.percentage.toFixed(1)}%
                </span>
                <span className="font-semibold font-mono tabular-nums text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                  {formatBRL(cat.total)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
