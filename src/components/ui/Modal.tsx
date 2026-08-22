import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { IconButton } from './IconButton';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
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

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#17201D]/40 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog card */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative w-full bg-white rounded-[24px] border border-[#EAE6DD] shadow-[0_20px_60px_rgba(23,32,29,0.15)] overflow-hidden z-10 transition-all transform animate-in fade-in zoom-in-95 duration-200 p-6 sm:p-8',
          sizeClasses[size]
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#EAE6DD]">
            <div>
              {title && <h3 className="text-xl font-bold text-[#17201D]">{title}</h3>}
              {description && (
                <p className="text-sm text-[#68736F] mt-1">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <IconButton
                ariaLabel="Close modal"
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-[#68736F] hover:text-[#17201D]"
              >
                <X className="w-4 h-4" />
              </IconButton>
            )}
          </div>
        )}

        {/* Content */}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};
