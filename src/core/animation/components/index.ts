/**
 * Animation Components Index
 * 
 * This file exports all animation components for easy access.
 */

export { default as AccessibleAnimation } from './AccessibleAnimation';
export { default as AnimatedLottie } from './AnimatedLottie';
export { default as AnimationSequence } from './AnimationSequence';
export { default as StaggeredAnimation } from './StaggeredAnimation';

// Also export component types
export type { 
  AccessibleAnimationProps 
} from './AccessibleAnimation';

export type { 
  AnimatedLottieProps 
} from './AnimatedLottie';

export type { 
  AnimationSequenceProps,
  SequenceItem
} from './AnimationSequence';

export type { 
  StaggeredAnimationProps 
} from './StaggeredAnimation'; 