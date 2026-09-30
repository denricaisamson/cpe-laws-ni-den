import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, helperText, error, id, options, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const errorId = error ? `${selectId}-error` : undefined;
    const helperId = helperText ? `${selectId}-helper` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-bold text-slate-900 mb-1.5 select-none"
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            'w-full min-h-[48px] px-4 py-2.5 bg-white text-slate-950 font-medium rounded-lg border-2 transition-all',
            error
              ? 'border-rose-600 focus:border-rose-700 focus:ring-4 focus:ring-rose-200'
              : 'border-slate-300 hover:border-slate-400 focus:border-blue-700 focus:ring-4 focus:ring-blue-100',
            'focus-visible:outline-none',
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
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

Select.displayName = 'Select';
