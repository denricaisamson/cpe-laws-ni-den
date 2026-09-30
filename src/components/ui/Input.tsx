import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, helperText, error, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-bold text-slate-900 mb-1.5 select-none"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            'w-full min-h-[48px] px-4 py-2.5 bg-white text-slate-950 font-medium rounded-lg border-2 transition-all placeholder:text-slate-500',
            error
              ? 'border-rose-600 focus:border-rose-700 focus:ring-4 focus:ring-rose-200'
              : 'border-slate-300 hover:border-slate-400 focus:border-blue-700 focus:ring-4 focus:ring-blue-100',
            'focus-visible:outline-none',
            className
          )}
          {...props}
        />
        {helperText && !error && (
          <p id={helperId} className="mt-1.5 text-xs font-semibold text-slate-600">
            {helperText}
          </p>
        )}
        {error && (
          <p id={errorId} className="mt-1.5 text-xs font-bold text-rose-800 flex items-center gap-1">
            <span aria-hidden="true">⚠</span> {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
