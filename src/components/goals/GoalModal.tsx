import React, { useState, useEffect } from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { FinancialGoal } from '../../types/finance';
import { AVAILABLE_COLORS, AVAILABLE_ICONS, CategoryIcon } from '../CategoryIcon';
import { calculateGoalMetrics } from '../../utils/goalUtils';
import { formatBRL } from '../../utils/formatters';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<FinancialGoal, 'id' | 'createdAt'>, existingId?: string) => void;
  initialGoal?: FinancialGoal | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialGoal,
}) => {
  const [title, setTitle] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [currentAmountStr, setCurrentAmountStr] = useState('');
  const [deadline, setDeadline] = useState('2027-06-30');
  const [icon, setIcon] = useState('Plane');
  const [color, setColor] = useState('#0284C7');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialGoal) {
        setTitle(initialGoal.title);
        setTargetAmountStr(initialGoal.targetAmount.toString());
        setCurrentAmountStr(initialGoal.currentAmount.toString());
        setDeadline(initialGoal.deadline);
        setIcon(initialGoal.icon || 'Plane');
        setColor(initialGoal.color || '#0284C7');
        setNotes(initialGoal.notes || '');
      } else {
        setTitle('');
        setTargetAmountStr('');
        setCurrentAmountStr('0');
        setDeadline('2027-06-30');
        setIcon('Plane');
        setColor('#0284C7');
        setNotes('');
      }
      setErrorMsg('');
    }
  }, [isOpen, initialGoal]);

  if (!isOpen) return null;

  // Real-time calculation preview
  const parsedTarget = parseFloat(targetAmountStr.replace(',', '.')) || 0;
  const parsedCurrent = parseFloat(currentAmountStr.replace(',', '.')) || 0;

  const previewMetrics = calculateGoalMetrics(
    {
      id: 'preview',
      title: title || 'Objetivo',
      targetAmount: parsedTarget,
      currentAmount: parsedCurrent,
      deadline,
      icon,
      color,
      createdAt: '',
    },
    '2026-10-02'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMsg('Por favor, informe o título da meta.');
      return;
    }

    if (parsedTarget <= 0) {
      setErrorMsg('O valor alvo deve ser maior que zero.');
      return;
    }

    if (!deadline) {
      setErrorMsg('Por favor, informe uma data limite.');
      return;
    }

    onSave(
      {
        title: title.trim(),
        targetAmount: parsedTarget,
        currentAmount: Math.max(0, parsedCurrent),
        deadline,
        icon,
        color,
        notes: notes.trim() || undefined,
      },
      initialGoal ? initialGoal.id : undefined
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {initialGoal ? 'Editar Meta Financeira' : 'Nova Meta Financeira'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Defina seu objetivo e receba o cálculo automático da economia mensal
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Title input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nome do Objetivo <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Viagem de Férias, Entrada da Casa..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Target & Current Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Valor Alvo (R$) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                  R$
                </span>
                <input
                  type="number"
                  step="50"
                  min="1"
                  required
                  placeholder="Ex: 15000"
                  value={targetAmountStr}
                  onChange={(e) => setTargetAmountStr(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm font-mono tabular-nums font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Valor Já Guardado (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                  R$
                </span>
                <input
                  type="number"
                  step="50"
                  min="0"
                  placeholder="0,00"
                  value={currentAmountStr}
                  onChange={(e) => setCurrentAmountStr(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm font-mono tabular-nums font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Data Limite (Prazo Final) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Real-time Calculation Suggestion Box */}
          {parsedTarget > 0 && deadline && (
            <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Plano de Economia Sugerido
                </span>
                <span className="font-mono font-bold text-blue-800 dark:text-blue-200">
                  {previewMetrics.percentage.toFixed(0)}% guardado
                </span>
              </div>
              <p className="text-blue-800 dark:text-blue-200">
                {previewMetrics.suggestionText}
              </p>
              {!previewMetrics.isCompleted && !previewMetrics.isExpired && (
                <div className="pt-1.5 border-t border-blue-200/60 dark:border-blue-900/60 flex items-center justify-between text-blue-950 dark:text-blue-100 font-medium">
                  <span>Aporte Mensal Recomendado:</span>
                  <span className="text-sm font-bold font-mono">
                    {formatBRL(previewMetrics.monthlySavingsNeeded)}/mês
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Ícone Representativo
            </label>
            <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
              {AVAILABLE_ICONS.map((item) => {
                const isSelected = icon === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setIcon(item.name)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                        : 'bg-white dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/70 dark:border-slate-600'
                    }`}
                    title={item.label}
                  >
                    <CategoryIcon name={item.name} className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Cor de Destaque
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_COLORS.map((c) => {
                const isSelected = color === c.hex;
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      isSelected ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110' : 'hover:scale-105'
                    }`}
                    title={c.label}
                  />
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Observações ou Detalhes (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Aplicação em CDB, meta conjunta..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 rounded-xl transition-colors shadow-xs"
            >
              <Check className="w-4 h-4" />
              {initialGoal ? 'Salvar Alterações' : 'Criar Meta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
