/**
 * Animation system type definitions
 */

// Animation types
export type AnimationType = 'fade' | 'slide' | 'scale' | 'rotate';

// Animation direction variants
export type FadeDirection = 'in' | 'out';
export type SlideDirection = 'up' | 'down' | 'left' | 'right';
export type ScaleDirection = 'in' | 'out';
export type RotateDirection = 'in' | 'out';
export type DirectionType = FadeDirection | SlideDirection | ScaleDirection | RotateDirection;

// Duration types
export type DurationType = 'shortest' | 'shorter' | 'short' | 'standard' | 'medium' | 'long' | 'longer' | 'longest';

// Easing types
export type EasingType = 'easeInOut' | 'easeIn' | 'easeOut' | 'sharp' | 'elastic' | 'bounce' | 'cubic';

// Animation variant data
export interface VariantData {
  [key: string]: any;
  transform?: string;
  transform_to?: string;
  opacity?: number;
  opacity_to?: number;
}

// Animation preset
export interface AnimationPreset {
  initial: object;
  animate: object;
  exit?: object;
  transition: {
    duration: string | number;
    easing?: string;
    delay?: number;
    [key: string]: any;
  };
}

// Performance settings
export interface PerformanceSettings {
  highPerformance: boolean;
  willChangeEnabled: boolean;
  gpuRenderingEnabled: boolean;
}

// Motion preferences
export interface MotionPreferences {
  enabled: boolean;
  reducedIntensity: boolean;
} 