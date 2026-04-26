'use client';

import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

type ScrollFadeProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  /** Animate on mount (above-the-fold). When false, animate on scroll-into-view. */
  immediate?: boolean;
};

// React 19 / framer-motion type interop: cast to bypass dual React types in monorepo
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MotionDiv: any = motion.div;

export function ScrollFade({
  children,
  delay = 0,
  y = 24,
  className,
  immediate = false,
}: ScrollFadeProps) {
  const transition = { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] };

  if (immediate) {
    // Above-the-fold: animate on mount, no scroll detection
    return (
      <MotionDiv
        className={className}
        initial={{ opacity: 0, y }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
      >
        {children}
      </MotionDiv>
    );
  }

  // Below-the-fold: animate when entering viewport (early threshold)
  return (
    <MotionDiv
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05, margin: '0px 0px -60px 0px' }}
      transition={transition}
    >
      {children}
    </MotionDiv>
  );
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};
