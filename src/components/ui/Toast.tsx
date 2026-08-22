import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastMessage } from '../../types';
import { cn } from '../../utils/cn';

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
    warning: (title: string, description?: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, description, type = 'info', duration = 4000 }: Omit<ToastMessage, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, description, type, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: (title: string, description?: string) =>
      addToast({ title, description, type: 'success' }),
    error: (title: string, description?: string) =>
      addToast({ title, description, type: 'error' }),
    info: (title: string, description?: string) =>
      addToast({ title, description, type: 'info' }),
    warning: (title: string, description?: string) =>
      addToast({ title, description, type: 'warning' }),
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastContainer: React.FC<{
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 p-4 rounded-[18px] border shadow-[0_10px_30px_rgba(23,32,29,0.12)] bg-white transition-all duration-300 transform translate-y-0',
            t.type === 'success' && 'border-[#20B8A6]/30',
            t.type === 'error' && 'border-red-200',
            t.type === 'warning' && 'border-[#FFC857]/50',
            t.type === 'info' && 'border-[#FF6B4A]/30'
          )}
        >
          <div className="shrink-0 mt-0.5">
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#20B8A6]" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
            {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-[#FFC857]" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-[#FF6B4A]" />}
          </div>
          <div className="flex-1 text-left">
            <h4 className="text-sm font-bold text-[#17201D]">{t.title}</h4>
            {t.description && (
              <p className="text-xs text-[#68736F] mt-0.5 leading-relaxed">
                {t.description}
              </p>
            )}
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            className="shrink-0 text-[#9BA3A0] hover:text-[#17201D] p-1 rounded-md transition-colors"
            aria-label="Dismiss toast"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
