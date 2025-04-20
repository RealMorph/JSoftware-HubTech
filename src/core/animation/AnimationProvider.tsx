import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useDirectTheme } from '../theme/hooks/useDirectTheme';
import {
  AnimationType,
  FadeDirection,
  SlideDirection,
  ScaleDirection,
  RotateDirection,
  DurationType,
  EasingType,
  VariantData,
  PerformanceSettings,
  MotionPreferences
} from './types';

interface AnimationContextType {
  // Motion preferences
  isMotionEnabled: boolean;
  isReducedMotion: boolean;
  toggleMotionEnabled: () => void;
  setIsReducedMotion: (reduced: boolean) => void;
  
  // Theme-based animation properties
  durations: {
    shortest: string;
    shorter: string;
    short: string;
    standard: string;
    medium: string;
    long: string;
    longer: string;
    longest: string;
  };
  easings: {
    easeInOut: string;
    easeIn: string;
    easeOut: string;
    sharp: string;
    elastic: string;
    bounce: string;
    cubic: string;
  };
  
  // Animation variants
  variants: {
    fade: {
      in: VariantData;
      out: VariantData;
    };
    slide: {
      up: VariantData;
      down: VariantData;
      left: VariantData;
      right: VariantData;
    };
    scale: {
      in: VariantData;
      out: VariantData;
    };
    rotate: {
      in: VariantData;
      out: VariantData;
    };
  };
  
  // Performance settings
  performance: PerformanceSettings;
  
  // Helper functions
  getVariant: (type: AnimationType, direction: string) => VariantData;
  getTransition: (duration: DurationType, easing?: EasingType) => { duration: string; easing: string };
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export const useAnimation = (): AnimationContextType => {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};

interface AnimationProviderProps {
  children: ReactNode;
}

export const AnimationProvider: React.FC<AnimationProviderProps> = ({ children }) => {
  const { theme } = useDirectTheme();
  const [isMotionEnabled, setIsMotionEnabled] = useState(
    theme.animation?.motionSafe?.enabled ?? true
  );
  const [isReducedMotion, setIsReducedMotion] = useState(
    theme.animation?.motionSafe?.reducedIntensity ?? false
  );
  
  // Check user's system preference for reduced motion
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (motionQuery.matches) {
      setIsReducedMotion(true);
    }
    
    const handleMotionChange = (event: MediaQueryListEvent) => {
      setIsReducedMotion(event.matches);
    };
    
    motionQuery.addEventListener('change', handleMotionChange);
    
    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);
  
  const toggleMotionEnabled = () => {
    setIsMotionEnabled((prev) => !prev);
  };
  
  // Animation properties from theme
  const durations = theme.animation?.duration ?? {
    shortest: '100ms',
    shorter: '150ms',
    short: '200ms',
    standard: '300ms',
    medium: '400ms',
    long: '500ms',
    longer: '700ms',
    longest: '1000ms',
  };
  
  const easings = theme.animation?.easing ?? {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    cubic: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  };
  
  const variants = theme.animation?.variants ?? {
    fade: {
      in: { opacity: 0, opacity_to: 1 } as VariantData,
      out: { opacity: 1, opacity_to: 0 } as VariantData,
    },
    slide: {
      up: { transform: 'translateY(20px)', transform_to: 'translateY(0)' } as VariantData,
      down: { transform: 'translateY(-20px)', transform_to: 'translateY(0)' } as VariantData,
      left: { transform: 'translateX(20px)', transform_to: 'translateX(0)' } as VariantData,
      right: { transform: 'translateX(-20px)', transform_to: 'translateX(0)' } as VariantData,
    },
    scale: {
      in: { transform: 'scale(0.9)', transform_to: 'scale(1)' } as VariantData,
      out: { transform: 'scale(1)', transform_to: 'scale(0.9)' } as VariantData,
    },
    rotate: {
      in: { transform: 'rotate(-5deg)', transform_to: 'rotate(0deg)' } as VariantData,
      out: { transform: 'rotate(0deg)', transform_to: 'rotate(5deg)' } as VariantData,
    },
  };
  
  const performance = theme.animation?.performance ?? {
    highPerformance: true,
    willChangeEnabled: true,
    gpuRenderingEnabled: true,
  };
  
  // Helper functions
  const getVariant = (type: AnimationType, direction: string): VariantData => {
    if (type === 'fade' && (direction === 'in' || direction === 'out')) {
      return variants.fade[direction as FadeDirection];
    } 
    else if (type === 'slide' && (direction === 'up' || direction === 'down' || direction === 'left' || direction === 'right')) {
      return variants.slide[direction as SlideDirection];
    }
    else if (type === 'scale' && (direction === 'in' || direction === 'out')) {
      return variants.scale[direction as ScaleDirection];
    }
    else if (type === 'rotate' && (direction === 'in' || direction === 'out')) {
      return variants.rotate[direction as RotateDirection];
    }
    return {} as VariantData;
  };
  
  const getTransition = (duration: DurationType, easing: EasingType = 'easeInOut'): { duration: string; easing: string } => {
    return {
      duration: durations[duration],
      easing: easings[easing],
    };
  };
  
  const value: AnimationContextType = {
    isMotionEnabled,
    isReducedMotion,
    toggleMotionEnabled,
    setIsReducedMotion,
    durations,
    easings,
    variants,
    performance,
    getVariant,
    getTransition,
  };
  
  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
};

export default AnimationProvider; 