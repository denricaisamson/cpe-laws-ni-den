'use client';

import { useRef, type ReactNode, type PointerEvent } from 'react';
import { cn } from '@/lib/utils';
import { useMotionPref } from '../providers/SmoothScroll';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Max tilt in degrees. */
  max?: number;
}

/** Glass card that tilts in 3D toward the pointer with a moving light glare. */
export function TiltCard({ children, className, max = 10 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionPref();

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || reduced || e.pointerType === 'touch') return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    el.style.setProperty('--rx', `${(0.5 - py) * max}deg`);
    el.style.setProperty('--ry', `${(px - 0.5) * max}deg`);
    el.style.setProperty('--gx', `${px * 100}%`);
    el.style.setProperty('--gy', `${py * 100}%`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  return (
    <div className="[perspective:1000px]">
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className={cn(
          'tilt-card glass relative h-full rounded-3xl transition-transform duration-300 ease-out will-change-transform',
          className
        )}
      >
        <div aria-hidden className="tilt-glare pointer-events-none absolute inset-0 rounded-3xl" />
        <div className="relative [transform:translateZ(40px)]">{children}</div>
      </div>
    </div>
  );
}
