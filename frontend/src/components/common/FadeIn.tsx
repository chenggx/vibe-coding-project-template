import { motion, useInView } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  stagger?: number;
  delay?: number;
  className?: string;
}

const containerVariants = (stagger: number) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren: 0,
    },
  },
});

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2 },
  },
};

export default function FadeIn({
  children,
  stagger = 0.05,
  delay = 0,
  className,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants(stagger)}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ delayChildren: delay }}
    >
      {children}
    </motion.div>
  );
}

export function FadeInItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}
