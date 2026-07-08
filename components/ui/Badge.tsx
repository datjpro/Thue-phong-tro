import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
}

export const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => {
  return (
    <div
      className={twMerge(
        clsx(
          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider transition-all duration-200 select-none shadow-sm',
          {
            'border-transparent bg-gradient-primary text-primary-foreground': variant === 'default',
            'border-transparent bg-secondary text-secondary-foreground': variant === 'secondary',
            'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400': variant === 'success',
            'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400': variant === 'warning',
            'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400': variant === 'danger',
            'border-border text-muted-foreground bg-background/40': variant === 'outline',
          },
          className
        )
      )}
      {...props}
    />
  );
};
