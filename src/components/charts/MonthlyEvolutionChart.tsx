import React, { useState } from 'react';
import { MonthlySummary } from '../../types/finance';
import { formatBRL, formatShortBRL } from '../../utils/formatters';

interface MonthlyEvolutionChartProps {
  data: MonthlySummary[];
}

export const MonthlyEvolutionChart: React.FC<MonthlyEvolutionChartProps> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'bars' | 'balance'>('bars');

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400 dark:text-slate-500">
        <p className="text-sm font-medium">Nenhum histórico mensal disponível</p>
        <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">Adicione receitas e despesas para gerar a evolução</p>
      </div>
    );
  }

  // Find max value for scaling
  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.income, d.expense)),
    1000
  );
  // Round to nice ceiling
  const yTicksCount = 4;
  const tickStep = Math.ceil(maxValue / yTicksCount / 500) * 500;
  const yMax = tickStep * yTicksCount;

  // Chart dimensions in SVG coordinates
  const svgWidth = 640;
  const svgHeight = 240;
  const paddingLeft = 65;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const groupWidth = chartWidth / data.length;
  const barWidth = Math.min(groupWidth * 0.32, 24);

  // Y coordinate calculation helper
  const getY = (val: number) => {
    return paddingTop + chartHeight - (val / yMax) * chartHeight;
  };

  const activeItem = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <div className="flex flex-col w-full">
      {/* Chart Header Controls */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 shrink-0" />
            <span>Receitas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500 shrink-0" />
            <span>Despesas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-600 shrink-0" />
            <span>Saldo Líquido</span>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setViewMode('bars')}
            className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
              viewMode === 'bars'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Barras
          </button>
          <button
            type="button"
            onClick={() => setViewMode('balance')}
            className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
              viewMode === 'balance'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Linha Saldo
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full overflow-x-auto">
        <div className="min-w-[480px]">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto overflow-visible select-none"
          >
            {/* Horizontal Gridlines & Y-Axis Labels */}
            {Array.from({ length: yTicksCount + 1 }).map((_, i) => {
              const tickVal = tickStep * i;
              const y = getY(tickVal);
              return (
                <g key={i}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={svgWidth - paddingRight}
                    y2={y}
                    stroke="currentColor"
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth="1"
                    strokeDasharray={i === 0 ? '0' : '4 4'}
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[10px] font-mono fill-slate-400 dark:fill-slate-500 tabular-nums"
                  >
                    {formatShortBRL(tickVal)}
                  </text>
                </g>
              );
            })}

            {/* Bars View */}
            {viewMode === 'bars' &&
              data.map((item, idx) => {
                const groupCenterX = paddingLeft + idx * groupWidth + groupWidth / 2;
                const incomeHeight = (item.income / yMax) * chartHeight;
                const expenseHeight = (item.expense / yMax) * chartHeight;

                const incomeY = paddingTop + chartHeight - incomeHeight;
                const expenseY = paddingTop + chartHeight - expenseHeight;

                const isHovered = hoveredIdx === idx;

                return (
                  <g
                    key={item.monthKey}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    {/* Hover column background highlight */}
                    <rect
                      x={paddingLeft + idx * groupWidth}
                      y={paddingTop}
                      width={groupWidth}
                      height={chartHeight}
                      className={isHovered ? 'fill-slate-100/70 dark:fill-slate-800/40' : 'fill-transparent'}
                      rx="4"
                    />

                    {/* Income Bar */}
                    <rect
                      x={groupCenterX - barWidth - 2}
                      y={incomeY}
                      width={barWidth}
                      height={Math.max(incomeHeight, 2)}
                      rx="3"
                      className="fill-emerald-500 transition-opacity"
                      opacity={hoveredIdx !== null && !isHovered ? 0.4 : 0.9}
                    />

                    {/* Expense Bar */}
                    <rect
                      x={groupCenterX + 2}
                      y={expenseY}
                      width={barWidth}
                      height={Math.max(expenseHeight, 2)}
                      rx="3"
                      className="fill-rose-500 transition-opacity"
                      opacity={hoveredIdx !== null && !isHovered ? 0.4 : 0.9}
                    />

                    {/* X-axis Month Label */}
                    <text
                      x={groupCenterX}
                      y={svgHeight - 12}
                      textAnchor="middle"
                      className={`text-[11px] font-medium transition-colors ${
                        isHovered
                          ? 'fill-slate-900 dark:fill-slate-100 font-semibold'
                          : 'fill-slate-500 dark:fill-slate-400'
                      }`}
                    >
                      {item.label}
                    </text>
                  </g>
                );
              })}

            {/* Line / Balance View */}
            {viewMode === 'balance' && (
              <>
                {/* Area Gradient */}
                <defs>
                  <linearGradient id="balanceAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Area Path */}
                {(() => {
                  const points = data.map((item, idx) => {
                    const x = paddingLeft + idx * groupWidth + groupWidth / 2;
                    const normalized = Math.max(0, item.balance);
                    const y = getY(normalized);
                    return { x, y };
                  });

                  if (points.length < 2) return null;

                  const pathD = `M ${points[0].x} ${points[0].y} ` +
                    points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ') +
                    ` L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

                  const lineD = `M ${points[0].x} ${points[0].y} ` +
                    points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ');

                  return (
                    <>
                      <path d={pathD} fill="url(#balanceAreaGrad)" />
                      <path d={lineD} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
                    </>
                  );
                })()}

                {/* Points on Line */}
                {data.map((item, idx) => {
                  const x = paddingLeft + idx * groupWidth + groupWidth / 2;
                  const y = getY(Math.max(0, item.balance));
                  const isHovered = hoveredIdx === idx;

                  return (
                    <g
                      key={item.monthKey}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? 6 : 4}
                        fill="#FFFFFF"
                        stroke="#2563EB"
                        strokeWidth="2.5"
                      />
                      <text
                        x={x}
                        y={svgHeight - 12}
                        textAnchor="middle"
                        className={`text-[11px] font-medium transition-colors ${
                          isHovered
                            ? 'fill-slate-900 dark:fill-slate-100 font-semibold'
                            : 'fill-slate-500 dark:fill-slate-400'
                        }`}
                      >
                        {item.label}
                      </text>
                    </g>
                  );
                })}
              </>
            )}
          </svg>
        </div>
      </div>

      {/* Floating or pinned Tooltip Details */}
      <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs gap-3">
        {activeItem ? (
          <>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Mês: {activeItem.label}
            </span>
            <div className="flex items-center gap-4">
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                Receitas: <strong className="font-mono tabular-nums">{formatBRL(activeItem.income)}</strong>
              </span>
              <span className="text-rose-700 dark:text-rose-400 font-medium">
                Despesas: <strong className="font-mono tabular-nums">{formatBRL(activeItem.expense)}</strong>
              </span>
              <span className={`font-semibold ${activeItem.balance >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-amber-700 dark:text-amber-400'}`}>
                Saldo: <strong className="font-mono tabular-nums">{formatBRL(activeItem.balance)}</strong>
              </span>
            </div>
          </>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 italic">
            Passe o cursor sobre os meses para inspecionar os valores exatos de receitas, despesas e saldo líquido.
          </span>
        )}
      </div>
    </div>
  );
};
