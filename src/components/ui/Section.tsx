import React from 'react';
import { cn } from '../../utils/cn';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  background?: 'transparent' | 'canvas' | 'subtle' | 'card';
}

export const Section: React.FC<SectionProps> = ({
  spacing = 'lg',
  background = 'transparent',
  className,
  children,
  ...props
}) => {
  const spacingClasses = {
    sm: 'py-6 sm:py-8',
    md: 'py-10 sm:py-14',
    lg: 'py-16 sm:py-20',
    xl: 'py-20 sm:py-28',
  };

  const bgClasses = {
    transparent: 'bg-transparent',
    canvas: 'bg-[#FFFDF8]',
    subtle: 'bg-[#FFF8ED] border-y border-[#EAE6DD]',
    card: 'bg-white border-y border-[#EAE6DD]',
  };

  return (
    <section
      className={cn('w-full relative', spacingClasses[spacing], bgClasses[background], className)}
      {...props}
    >
      {children}
    </section>
  );
};
