'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Dialog = ({ isOpen, onClose, title, children, size = 'md' }: DialogProps) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Đóng khi ấn ESC
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  // Mobile sheet animation (slide from bottom)
  const mobileVariants = {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
  };

  // Desktop center scale animation
  const desktopVariants = {
    initial: { opacity: 0, scale: 0.93, y: 16 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.93, y: 16 },
  };

  const variants = isMobile ? mobileVariants : desktopVariants;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed inset-0 z-50 flex ${isMobile ? 'items-end' : 'items-center'} justify-center ${isMobile ? '' : 'p-4'}`}>
          {/* Backdrop — gradient blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.45) 100%)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          />

          {/* Modal Container */}
          <motion.div
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              type: isMobile ? 'tween' : 'spring',
              duration: isMobile ? 0.35 : 0.4,
              ease: isMobile ? [0.16, 1, 0.3, 1] : undefined,
            }}
            className={`relative w-full ${sizeClasses[size]} z-10 overflow-hidden bg-card shadow-2xl border border-border/60 flex flex-col ${
              isMobile
                ? 'rounded-t-2xl rounded-b-none max-h-[92vh]'
                : 'rounded-2xl max-h-[90vh]'
            }`}
          >
            {/* Mobile drag handle */}
            {isMobile && (
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-border/60" />
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
              {title ? (
                <h3 className="text-base font-black text-card-foreground tracking-tight">{title}</h3>
              ) : (
                <div />
              )}
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer ml-3"
              >
                <X size={17} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 max-h-[80vh] overflow-y-auto px-6 py-5 scrollbar-thin">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
