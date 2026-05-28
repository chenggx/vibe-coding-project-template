import { useRef, useEffect } from 'react';
import { useInView, useSpring, useTransform, motion } from 'framer-motion';

interface CountUpProps {
  value: number;
  duration?: number;
  className?: string;
}

export default function CountUp({
  value,
  duration = 1.5,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const hasAnimated = useRef(false);

  const springValue = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  const displayValue = useTransform(springValue, (v) => Math.floor(v));

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      springValue.set(value);
      hasAnimated.current = true;
    }
  }, [isInView, springValue, value]);

  return (
    <motion.span ref={ref} className={className}>
      {displayValue}
    </motion.span>
  );
}
