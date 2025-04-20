// Export animation provider and hooks
export { 
  AnimationProvider, 
  useAnimation 
} from './AnimationProvider';

// Export hooks for animation configuration
export {
  useAnimationPreset,
  useEntranceAnimation,
  useExitAnimation,
  useHoverAnimation
} from './hooks/useAnimationPreset';

// Export motion preference hook
export { default as useMotionPreference } from './hooks/useMotionPreference';

// Export scroll animation hook
export { 
  useScrollAnimation,
  type ScrollAnimationOptions 
} from './hooks/useScrollAnimation';

// Export higher-order components from withAnimation.tsx
// The simple entrance animation is renamed for backwards compatibility
export { 
  withEntranceAnimation as withSimpleEntranceAnimation 
} from './withAnimation';

// Export enhanced higher-order components and their props from ./withAnimation
export {
  withEntranceAnimation,
  withInteractionAnimation,
  withCustomEntranceAnimation,
  WithEntranceAnimationProps,
  WithInteractionAnimationProps
} from './withAnimation';

// Export all types from the types file
export * from './types';

// Export all core animated components
export { default as AnimatedCard } from '../components/Card/AnimatedCard';
export { default as AnimatedModal } from '../components/Modal/AnimatedModal';
export { default as AnimatedDrawer } from '../components/Drawer/AnimatedDrawer';
export { default as AnimatedAccordion } from '../components/Accordion/AnimatedAccordion';
export { default as AnimatedTooltip } from '../components/Tooltip/AnimatedTooltip';
export { default as AnimatedButton } from '../components/Button/AnimatedButton';
export { default as AnimatedAlert } from '../components/Alert/AnimatedAlert';

// Export all animation components from the components directory
export {
  AccessibleAnimation,
  AnimatedLottie,
  AnimationSequence,
  StaggeredAnimation,
  type AccessibleAnimationProps,
  type AnimatedLottieProps,
  type AnimationSequenceProps,
  type SequenceItem,
  type StaggeredAnimationProps
} from './components'; 