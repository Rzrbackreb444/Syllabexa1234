import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  title?: string;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType, duration?: number, title?: string) => void;
  removeToast: (id: string) => void;
  showToast: (message: string, type?: ToastType) => void;
  toasts: Toast[];
  triggerFirestoreError: (error: any, op: string, path: string | null) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 5000, title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration, title }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    addToast(message, type, 4000);
  }, [addToast]);

  const triggerFirestoreError = useCallback((error: any, op: string, path: string | null) => {
    let errMsg = error instanceof Error ? error.message : String(error);
    
    // Check if the error message is a stringified JSON (FirestoreErrorInfo)
    let parsedInfo: any = null;
    try {
      if (errMsg.startsWith('{') && errMsg.endsWith('}')) {
        parsedInfo = JSON.parse(errMsg);
        errMsg = parsedInfo.error || errMsg;
      }
    } catch (e) {
      // Not JSON, use as-is
    }

    const friendlyMessage = `Operation: ${op.toUpperCase()}\nPath: ${path || 'unknown'}\nError: ${errMsg}`;
    
    addToast(
      friendlyMessage, 
      'error', 
      12000, // Error alerts last 12 seconds
      'Database Sync Failure'
    );
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, showToast, toasts, triggerFirestoreError }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-md w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const isError = toast.type === 'error';
            const isSuccess = toast.type === 'success';
            const isWarning = toast.type === 'warning';

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={`pointer-events-auto p-4 rounded-2xl border flex items-start gap-3 shadow-2xl backdrop-blur-md select-none ${
                  isError
                    ? 'bg-[#180a0a]/95 border-red-500/30 text-red-300 shadow-red-950/50'
                    : isSuccess
                    ? 'bg-[#061810]/95 border-emerald-500/30 text-emerald-300 shadow-emerald-950/50'
                    : isWarning
                    ? 'bg-[#1a1205]/95 border-amber-500/40 text-amber-300 shadow-amber-950/50 ring-1 ring-amber-500/20'
                    : 'bg-[#0a0d14]/95 border-indigo-500/30 text-slate-200 shadow-indigo-950/50 ring-1 ring-indigo-500/10'
                }`}
              >
                {isError && <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />}
                {isSuccess && <CheckCircle size={18} className="text-emerald-400 shrink-0 mt-0.5" />}
                {isWarning && <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />}
                {!isError && !isSuccess && !isWarning && <Info size={18} className="text-indigo-400 shrink-0 mt-0.5" />}

                <div className="flex-1 space-y-0.5 text-xs">
                  <p className="font-bold font-mono uppercase tracking-wider text-[11px] text-slate-100 flex items-center gap-2">
                    <span>{toast.title || (isError ? 'System Alert' : isSuccess ? 'Pipeline Verified' : isWarning ? 'Telemetry Warning' : 'Orchestrator Telemetry')}</span>
                  </p>
                  <p className="font-medium leading-relaxed whitespace-pre-line text-slate-300 font-sans">{toast.message}</p>
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-500 hover:text-white transition-colors p-0.5 rounded cursor-pointer shrink-0"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
