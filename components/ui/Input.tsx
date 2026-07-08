import * as React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={twMerge(
            clsx(
              'flex h-11 w-full rounded-xl border border-border/80 bg-background/50 px-3.5 py-2.5 text-xs font-semibold placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 shadow-inner',
              {
                'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500': error,
              }
            ),
            className
          )}
          {...props}
        />
        {error && (
          <span className="text-[10px] font-bold text-rose-500">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
