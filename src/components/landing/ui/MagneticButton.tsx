'use client';

import Link from 'next/link';
import { useRef, type ReactNode, type PointerEvent } from 'react';
import { cn } from '@/lib/utils';
import { useMotionPref } from '../providers/SmoothScroll';

interface MagneticButtonProps {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'ghost';
  className?: string;
}

/** Link-button that is gently pulled toward the cursor. */
export function MagneticButton({ href, children, variant = 'primary', className }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const { reduced } = useMotionPref();

  const onMove = (e: PointerEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el || reduced || e.pointerType === 'touch') return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
  };

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = 'translate(0, 0)';
  };

  return (
    <Link
      ref={ref}
      href={href}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn(
        'group relative inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-7 py-3 text-base font-bold transition-[transform,background-color,box-shadow] duration-300 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/70',
        variant === 'primary'
          ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-300 text-emerald-950 shadow-[0_10px_40px_-10px_rgba(245,168,0,0.7)] hover:shadow-[0_14px_50px_-8px_rgba(245,168,0,0.9)]'
          : 'border border-white/20 bg-white/5 text-white backdrop-blur-md hover:bg-white/10',
        className
      )}
    >
      {children}
    </Link>
  );
}
