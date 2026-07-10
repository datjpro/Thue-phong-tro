'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToasts } from '../../store/useToasts';

const TOAST_DURATION = 4000; // ms

const ToastItem = ({ toast, onRemove }: { toast: { id: string; message: string; type: 'success' | 'error' | 'info' }; onRemove: (id: string) => void }) => {
  const progressClass =
    toast.type === 'success'
      ? 'toast-progress-success'
      : toast.type === 'error'
      ? 'toast-progress-error'
      : 'toast-progress-info';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 35, scale: 0.92, x: 20 }}
      animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.92, x: 40, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`relative pointer-events-auto flex items-center justify-between w-full p-4 rounded-xl shadow-xl glass-card text-foreground border-l-4 overflow-hidden ${
        toast.type === 'success'
          ? 'border-l-emerald-500'
          : toast.type === 'error'
          ? 'border-l-rose-500'
          : 'border-l-primary'
      }`}
    >
      {/* Progress bar countdown */}
      <div
        className={`toast-progress ${progressClass}`}
        style={{ animationDuration: `${TOAST_DURATION}ms` }}
      />

      <div className="flex items-center gap-3">
        {toast.type === 'success' && (
          <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={18} />
        )}
        {toast.type === 'error' && (
          <AlertCircle className="text-rose-500 flex-shrink-0" size={18} />
        )}
        {toast.type === 'info' && (
          <Info className="text-primary flex-shrink-0" size={18} />
        )}
        <span className="text-xs md:text-sm font-bold tracking-tight pr-2">{toast.message}</span>
      </div>

      <button
        onClick={() => onRemove(toast.id)}
        className="ml-2 flex-shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
      >
        <X size={13} />
      </button>
    </motion.div>
  );
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToasts();

  return (
    <div className="fixed bottom-6 right-4 md:right-6 z-55 flex flex-col gap-2.5 w-[calc(100vw-2rem)] max-w-sm pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};
