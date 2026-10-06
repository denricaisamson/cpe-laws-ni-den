'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../gsap-client';

interface MotionContextValue {
  /** True when OS prefers reduced motion OR the user switched on 2D mode. */
  reduced: boolean;
  userReduced: boolean;
  toggleReduced: () => void;
}

const MotionContext = createContext<MotionContextValue>({
  reduced: false,
  userReduced: false,
  toggleReduced: () => {},
});

export function useMotionPref() {
  return useContext(MotionContext);
}

const STORAGE_KEY = 'fsl-landing-2d-mode';

/**
 * Provides motion preferences and Lenis smooth scrolling synced to GSAP's ticker.
 * Smooth scroll and all scroll animations are disabled in reduced-motion / 2D mode.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [osReduced, setOsReduced] = useState(false);
  const [userReduced, setUserReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setOsReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setOsReduced(e.matches);
    mq.addEventListener('change', onChange);
    setUserReduced(window.localStorage.getItem(STORAGE_KEY) === '1');
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const reduced = osReduced || userReduced;

  const toggleReduced = useCallback(() => {
    setUserReduced((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      return next;
    });
  }, []);

  useEffect(() => {
    if (reduced) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, [reduced]);

  return (
    <MotionContext.Provider value={{ reduced, userReduced, toggleReduced }}>
      {children}
    </MotionContext.Provider>
  );
}
