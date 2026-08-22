import React, { useEffect } from 'react';
import { CheckCircle2, Bookmark, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface ToastNotificationProps {
  message: string | null;
  type?: 'added' | 'saved' | 'info';
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  type = 'added',
  onClose,
}) => {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 2800);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none select-none">
      <motion.div
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
        className="pointer-events-auto flex items-center gap-3 px-4 py-3 bg-[#17201D] text-white rounded-2xl shadow-xl border border-white/10 text-xs font-semibold"
      >
        {type === 'saved' ? (
          <Bookmark className="w-4 h-4 text-[#FF6B4A] fill-[#FF6B4A]" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-[#20B8A6]" />
        )}
        <span>{message}</span>
        <button
          type="button"
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </div>
  );
};
