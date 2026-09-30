import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  onClose?: () => void;
}

export function Alert({
  variant = 'info',
  title,
  children,
  className,
  onClose,
  ...props
}: AlertProps) {
  const configs = {
    success: {
      container: 'bg-emerald-50 border-2 border-emerald-600 text-emerald-950',
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-700 flex-shrink-0" aria-hidden="true" />,
      defaultTitle: 'Success',
    },
    warning: {
      container: 'bg-amber-50 border-2 border-amber-600 text-amber-950',
      icon: <AlertTriangle className="w-6 h-6 text-amber-700 flex-shrink-0" aria-hidden="true" />,
      defaultTitle: 'Notice',
    },
    error: {
      container: 'bg-rose-50 border-2 border-rose-600 text-rose-950',
      icon: <AlertOctagon className="w-6 h-6 text-rose-700 flex-shrink-0" aria-hidden="true" />,
      defaultTitle: 'Action Required',
    },
    info: {
      container: 'bg-blue-50 border-2 border-blue-600 text-blue-950',
      icon: <Info className="w-6 h-6 text-blue-700 flex-shrink-0" aria-hidden="true" />,
      defaultTitle: 'Information',
    },
  };

  const current = configs[variant];

  return (
    <div
      role="alert"
      className={cn(
        'p-4 rounded-xl flex items-start gap-3 shadow-xs',
        current.container,
        className
      )}
      {...props}
    >
      {current.icon}
      <div className="flex-1">
        {title && <h4 className="font-black text-base tracking-tight mb-1">{title}</h4>}
        <div className="text-sm font-medium leading-relaxed">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          className="p-1 rounded-md hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current transition-colors"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
