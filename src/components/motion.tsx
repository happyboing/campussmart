import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

/**
 * Lightweight motion helpers. They intentionally avoid a heavy animation
 * dependency so the prototype stays fast on low-end phones and respects the
 * operating system's reduced-motion preference.
 */

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  return reduced;
}

export function CountUp({
  value,
  decimals = 0,
  duration = 900,
  prefix = '',
  suffix = '',
}: {
  value: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const [display, setDisplay] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    if (reduced) return;

    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [value, duration, reduced]);

  const shown = reduced ? value : display;
  const precision = decimals || (Number.isInteger(value) ? 0 : 2);
  const text = shown.toLocaleString('en-PH', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });

  return (
    <>
      {prefix}
      {text}
      {suffix}
    </>
  );
}

/**
 * Fades and lifts a block into place the first time it enters the app's scroll
 * viewport. Falls back to immediately visible when reduced motion is on.
 */
export function Reveal({
  children,
  delay = 0,
  className = '',
  style,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const canObserve =
    typeof window !== 'undefined' &&
    typeof IntersectionObserver !== 'undefined' &&
    !prefersReducedMotion();
  const [visible, setVisible] = useState(() => !canObserve);

  useEffect(() => {
    if (visible) return;
    const element = ref.current;
    if (!element) return;

    const root = element.closest('.app-scroll, .device') as HTMLElement | null;
    let observer: IntersectionObserver | null = null;
    let done = false;
    let cleanup = () => {};

    const reveal = () => {
      if (done) return;
      done = true;
      setVisible(true);
      cleanup();
    };

    // Fast scrolls and anchor jumps can skip an intersection entirely, so also
    // reveal once the block has moved above the bottom edge of the viewport.
    const check = () => {
      const bottom = root
        ? root.getBoundingClientRect().bottom
        : window.innerHeight;
      if (element.getBoundingClientRect().top < bottom + 24) reveal();
    };

    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) reveal();
      },
      { root, rootMargin: '0px 0px -6% 0px', threshold: 0.06 },
    );

    cleanup = () => {
      observer?.disconnect();
      root?.removeEventListener('scroll', check);
      window.removeEventListener('scroll', check);
    };

    observer.observe(element);
    root?.addEventListener('scroll', check, { passive: true });
    window.addEventListener('scroll', check, { passive: true });
    check();

    return cleanup;
  }, [visible]);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`.trim()}
      style={{ ...style, transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
