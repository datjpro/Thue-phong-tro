import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={twMerge(
          clsx(
            'inline-flex items-center justify-center rounded-xl font-extrabold tracking-wide uppercase transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:ring-offset-2 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50 cursor-pointer shadow-sm text-xs',
            {
              // Variants
              'bg-gradient-primary text-white hover:opacity-95 hover:shadow-[0_0_24px_hsl(var(--primary)/0.45)] hover:-translate-y-[1px]': variant === 'primary',
              'bg-secondary text-secondary-foreground hover:bg-secondary/85 hover:shadow-sm': variant === 'secondary',
              'border border-border/80 bg-background/50 text-foreground hover:bg-muted/50 hover:border-border hover:shadow-sm': variant === 'outline',
              'bg-transparent text-foreground hover:bg-muted/65 shadow-none': variant === 'ghost',
              'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 hover:shadow-[0_0_20px_rgba(225,29,72,0.4)]': variant === 'danger',
              
              // Sizes
              'h-9 px-3.5 rounded-lg': size === 'sm',
              'h-11 px-5.5': size === 'md',
              'h-12.5 px-7 rounded-2xl': size === 'lg',
            },
            className
          )
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
