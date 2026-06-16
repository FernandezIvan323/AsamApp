import { createContext, useCallback, useContext, useState } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

const ToastContext = createContext(null);

const VARIANTS = {
  success: 'border-green-500/40 bg-green-500/10 text-green-400',
  error: 'border-destructive/40 bg-destructive/10 text-destructive',
  info: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
  warning: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400',
};

function ToastItem({ id, message, variant = 'success', onDismiss }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-sm animate-in slide-in-from-top-2',
        VARIANTS[variant] || VARIANTS.info,
      )}
      role="alert"
    >
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={() => onDismiss(id)}
        className="shrink-0 rounded p-0.5 opacity-60 transition-opacity hover:opacity-100"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, variant = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed right-4 top-4 z-[9999] flex w-80 flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem {...t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
