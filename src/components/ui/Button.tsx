import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold rounded-lg transition-colors min-h-[48px] px-4 py-2 text-base focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none';

    const variants = {
      primary: 'bg-blue-800 text-white hover:bg-blue-900 active:bg-blue-950 border-2 border-blue-800 shadow-sm',
      secondary: 'bg-slate-800 text-white hover:bg-slate-900 active:bg-black border-2 border-slate-800 shadow-sm',
      outline: 'bg-white text-slate-900 hover:bg-slate-100 active:bg-slate-200 border-2 border-slate-400 hover:border-slate-600',
      danger: 'bg-rose-800 text-white hover:bg-rose-900 active:bg-rose-950 border-2 border-rose-800 shadow-sm',
      ghost: 'bg-transparent text-slate-800 hover:bg-slate-100 active:bg-slate-200 border-2 border-transparent',
      success: 'bg-emerald-800 text-white hover:bg-emerald-900 active:bg-emerald-950 border-2 border-emerald-800 shadow-sm',
    };

    const sizes = {
      sm: 'min-h-[40px] px-3 py-1.5 text-sm',
      md: 'min-h-[48px] px-5 py-2.5 text-base',
      lg: 'min-h-[56px] px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
