import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Types for the animation variants
export interface AnimationVariants {
  initial: object;
  animate: object;
  exit: object;
}

// Types for the component
export interface AnimatedRoutesProps {
  children: React.ReactNode;
  variants?: AnimationVariants;
  transition?: object;
  mode?: 'wait' | 'sync' | 'popLayout';
}

// Default animation variants
const defaultVariants: AnimationVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

// Default transition settings
const defaultTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.3
};

/**
 * AnimatedRoutes component that wraps route content with transition animations
 */
export const AnimatedRoutes: React.FC<AnimatedRoutesProps> = ({
  children,
  variants = defaultVariants,
  transition = defaultTransition,
  mode = 'wait'
}) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode={mode} initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={transition}
        style={{ width: '100%', height: '100%', position: 'relative' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Fade animation variant
 */
export const fadeVariants: AnimationVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

/**
 * Slide animation variant
 */
export const slideVariants: AnimationVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

/**
 * Scale animation variant
 */
export const scaleVariants: AnimationVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

/**
 * Slide up animation variant
 */
export const slideUpVariants: AnimationVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

/**
 * Page transition animation variant
 */
export const pageTransitionVariants: AnimationVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 }
}; 