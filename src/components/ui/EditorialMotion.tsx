import { useEffect, useRef, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/** Each naturally wrapped line shares a delay; the accessible heading stays intact. */
export function RevealHeading({ children, as: Tag = 'h2', className = '' }: {
  children: string; as?: 'h1' | 'h2' | 'h3'; className?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const heading = ref.current;
    if (!heading) return;
    const measure = () => {
      let line = -1;
      let top = -Infinity;
      heading.querySelectorAll<HTMLElement>('.reveal-word').forEach(word => {
        const y = word.offsetTop;
        if (y > top + 2) { line++; top = y; }
        word.style.setProperty('--line-delay', `${line * 70}ms`);
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(heading);
    return () => observer.disconnect();
  }, [children]);
  return <Tag ref={ref} aria-label={children} className={`editorial-heading ${className}`}>
    <span aria-hidden="true">{children.split(/\s+/).map((word, i) => <span key={i}><span className="reveal-word"><span>{word}</span></span>{' '}</span>)}</span>
  </Tag>;
}

export function ImageReveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return <div className={`relative ${className}`}>
    {children}
    {!reduced && <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 origin-right bg-[#fdfbf7]"
      initial={{ scaleX: 1 }} whileInView={{ scaleX: 0 }} viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }} />}
  </div>;
}

/** Navigation controls remain outside the transition and immediately usable. */
export function MediaTransition({ children, direction = 1, className = '' }: { children: ReactNode; direction?: number; className?: string }) {
  const reduced = useReducedMotion();
  return <motion.div initial={{ opacity: reduced ? 1 : 0, x: reduced ? 0 : direction * 10 }}
    animate={{ opacity: 1, x: 0 }} transition={{ duration: reduced ? 0 : 0.24, ease: 'easeOut' }} className={className}>
    {children}
  </motion.div>;
}
