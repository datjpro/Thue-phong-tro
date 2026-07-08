'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToasts } from '../../store/useToasts';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToasts();

  return (
    <div className="fixed bottom-6 right-6 z-55 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 35, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
            className={`pointer-events-auto flex items-center justify-between w-full p-4 rounded-xl shadow-xl glass-card text-foreground border-l-4 ${
              toast.type === 'success' ? 'border-l-emerald-500' :
              toast.type === 'error' ? 'border-l-rose-500' : 'border-l-primary'
            }`}
          >
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
              <span className="text-xs md:text-sm font-bold tracking-tight">{toast.message}</span>
            </div>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
            >
              <X size={13} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
