import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types/finance';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isDanger = toast.type === 'danger';
        const isWarning = toast.type === 'warning';
        const isSuccess = toast.type === 'success';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-xs transition-all duration-300 animate-in slide-in-from-bottom-5 ${
              isDanger
                ? 'bg-rose-900/95 text-white border-rose-700'
                : isWarning
                ? 'bg-amber-900/95 text-white border-amber-700'
                : isSuccess
                ? 'bg-emerald-900/95 text-white border-emerald-700'
                : 'bg-slate-900/95 text-white border-slate-700'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isDanger && <AlertCircle className="w-5 h-5 text-rose-300" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-300" />}
              {isSuccess && <CheckCircle className="w-5 h-5 text-emerald-300" />}
              {!isDanger && !isWarning && !isSuccess && <Info className="w-5 h-5 text-blue-300" />}
            </div>

            <div className="flex-1 min-w-0 text-xs">
              <p className="font-bold text-sm leading-tight">{toast.title}</p>
              <p className="text-white/80 mt-0.5 leading-snug">{toast.message}</p>
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-white/60 hover:text-white p-1 rounded-md transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
