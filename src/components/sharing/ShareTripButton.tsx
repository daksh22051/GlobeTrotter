import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Trip } from '../../types/trip';
import { ShareTripModal } from './ShareTripModal';

interface ShareTripButtonProps {
  trip: Trip;
  variant?: 'primary' | 'outline' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ShareTripButton: React.FC<ShareTripButtonProps> = ({
  trip,
  variant = 'outline',
  size = 'sm',
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const baseStyles =
    'inline-flex items-center justify-center gap-1.5 rounded-full font-bold transition-all cursor-pointer select-none';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-xs sm:text-sm',
    lg: 'px-5 py-2.5 text-sm',
  }[size];

  const variantStyles = {
    primary: 'bg-[#FF6B4A] hover:bg-[#E55837] text-white shadow-xs',
    outline:
      'bg-white border border-[#EAE6DD] hover:border-[#17201D] text-[#17201D] hover:bg-[#FAF8F5] shadow-2xs',
    ghost: 'text-[#68736F] hover:text-[#17201D] hover:bg-[#F4F1EA]',
    icon: 'p-2 rounded-2xl bg-white border border-[#EAE6DD] hover:border-[#17201D] text-[#17201D]',
  }[variant];

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
        title="Share trip with friends"
      >
        <Share2 className="w-3.5 h-3.5 text-[#FF6B4A]" />
        {variant !== 'icon' && <span>Share</span>}
      </button>

      <ShareTripModal isOpen={isModalOpen} trip={trip} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
