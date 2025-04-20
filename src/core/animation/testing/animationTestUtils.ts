import { AnimationConfig } from '../../theme/consolidated-types';

/**
 * Mock animation configuration for testing
 */
export const mockAnimationConfig: AnimationConfig = {
  duration: {
    shortest: '100ms',
    shorter: '150ms',
    short: '200ms',
    standard: '300ms',
    medium: '400ms',
    long: '500ms',
    longer: '700ms',
    longest: '1000ms',
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    cubic: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  },
  variants: {
    fade: {
      in: { opacity: '0', opacity_to: '1' },
      out: { opacity: '1', opacity_to: '0' },
    },
    slide: {
      up: { transform: 'translateY(20px)', transform_to: 'translateY(0)' },
      down: { transform: 'translateY(-20px)', transform_to: 'translateY(0)' },
      left: { transform: 'translateX(20px)', transform_to: 'translateX(0)' },
      right: { transform: 'translateX(-20px)', transform_to: 'translateX(0)' },
    },
    scale: {
      in: { transform: 'scale(0.9)', transform_to: 'scale(1)' },
      out: { transform: 'scale(1)', transform_to: 'scale(0.9)' },
    },
    rotate: {
      in: { transform: 'rotate(-5deg)', transform_to: 'rotate(0deg)' },
      out: { transform: 'rotate(0deg)', transform_to: 'rotate(5deg)' },
    },
  },
  motionSafe: {
    enabled: true,
    reducedIntensity: false,
  },
  performance: {
    highPerformance: true,
    willChangeEnabled: true,
    gpuRenderingEnabled: true,
  },
};

/**
 * Create a mock theme provider for testing animations
 * @param motionEnabled Whether motion is enabled
 * @param reducedMotion Whether reduced motion is preferred
 * @returns Mock theme configuration
 */
export function createMockThemeForAnimationTesting(
  motionEnabled = true,
  reducedMotion = false
) {
  return {
    animation: {
      ...mockAnimationConfig,
      motionSafe: {
        enabled: motionEnabled,
        reducedIntensity: reducedMotion,
      }
    }
  };
}

/**
 * Mock the window.matchMedia API for testing animation preferences
 * @param matches Whether the media query matches
 */
export function mockReducedMotionMediaQuery(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: query.includes('prefers-reduced-motion') ? matches : false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

/**
 * Reset the mocked window.matchMedia API
 */
export function resetMockedMediaQuery() {
  if ('matchMedia' in window) {
    // @ts-ignore
    delete window.matchMedia;
  }
}

/**
 * Animation-specific Jest matchers
 */
export const animationMatchers = {
  /**
   * Check if an element has a transition style
   */
  toHaveTransition: (element: HTMLElement, expectedProperty?: string): jest.CustomMatcherResult => {
    const transition = element.style.transition || '';
    const pass = expectedProperty 
      ? Boolean(transition && transition.includes(expectedProperty))
      : Boolean(transition);
    
    return {
      pass,
      message: () => 
        pass
          ? `Expected element not to have transition${expectedProperty ? ` for ${expectedProperty}` : ''}, but it has: ${transition}`
          : `Expected element to have transition${expectedProperty ? ` for ${expectedProperty}` : ''}, but got: ${transition}`,
    };
  },
  
  /**
   * Check if an element has a transform style
   */
  toHaveTransform: (element: HTMLElement, expectedTransform?: string): jest.CustomMatcherResult => {
    const transform = element.style.transform || '';
    const pass = expectedTransform 
      ? transform === expectedTransform
      : Boolean(transform);
    
    return {
      pass,
      message: () => 
        pass
          ? `Expected element not to have transform${expectedTransform ? ` "${expectedTransform}"` : ''}, but it has: ${transform}`
          : `Expected element to have transform${expectedTransform ? ` "${expectedTransform}"` : ''}, but got: ${transform}`,
    };
  },
  
  /**
   * Check if an element has an opacity style
   */
  toHaveOpacity: (element: HTMLElement, expectedOpacity: string | number): jest.CustomMatcherResult => {
    const opacity = element.style.opacity || '';
    const expectedOpacityStr = expectedOpacity.toString();
    const pass = opacity === expectedOpacityStr;
    
    return {
      pass,
      message: () => 
        pass
          ? `Expected element not to have opacity "${expectedOpacityStr}", but it has: ${opacity}`
          : `Expected element to have opacity "${expectedOpacityStr}", but got: ${opacity}`,
    };
  },
  
  /**
   * Check if an animation was applied to an element
   */
  toHaveAnimation: (element: HTMLElement, expectedAnimation?: string): jest.CustomMatcherResult => {
    const animation = element.style.animation || '';
    const pass = expectedAnimation 
      ? animation === expectedAnimation
      : Boolean(animation);
    
    return {
      pass,
      message: () => 
        pass
          ? `Expected element not to have animation${expectedAnimation ? ` "${expectedAnimation}"` : ''}, but it has: ${animation}`
          : `Expected element to have animation${expectedAnimation ? ` "${expectedAnimation}"` : ''}, but got: ${animation}`,
    };
  },
} as const;

/**
 * Snapshot comparison helper for animated components
 * @param element The element to get snapshot data from
 * @returns Snapshot data with animation properties
 */
export function getAnimationSnapshot(element: HTMLElement) {
  return {
    style: {
      transition: element.style.transition,
      transform: element.style.transform,
      opacity: element.style.opacity,
      animation: element.style.animation,
    },
    className: element.className,
  };
}

/**
 * Wait for animations to complete
 * @param duration The duration to wait in milliseconds
 * @returns A promise that resolves after the specified duration
 */
export function waitForAnimation(duration = 300) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

/**
 * Add the animation matchers to Jest
 */
export function setupAnimationMatchers() {
  expect.extend(animationMatchers);
}

// Add TypeScript support for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveTransition(expectedProperty?: string): R;
      toHaveTransform(expectedTransform?: string): R;
      toHaveOpacity(expectedOpacity: string | number): R;
      toHaveAnimation(expectedAnimation?: string): R;
    }
  }
}

/**
 * Create a complete mock theme for testing animations
 * @param motionEnabled Whether motion is enabled
 * @param reducedMotion Whether reduced motion is preferred
 * @returns Complete mock theme configuration
 */
export function createCompleteMockTheme(
  motionEnabled = true,
  reducedMotion = false
) {
  return {
    colors: {
      primary: '#007AFF',
      secondary: '#5856D6',
      error: '#FF3B30',
      warning: '#FF9500',
      info: '#0062CC',
      success: '#34C759',
      background: '#FFFFFF',
      surface: '#FFFFFF',
      border: '#C7C7CC',
      text: {
        primary: '#000000',
        secondary: '#3C3C43',
        disabled: '#8E8E93'
      },
      hover: {
        background: '#F5F5F5',
        border: '#E0E0E0'
      },
      focus: {
        border: '#0062CC',
        shadow: 'rgba(0, 98, 204, 0.25)'
      },
      private: {
        buttonBg: '#E5E5EA',
        buttonHover: '#D1D1D6',
        googleButton: '#4285F4'
      },
      node: {
        default: '#DDDDDD',
        active: '#007AFF',
        hover: '#F5F5F5',
        text: '#000000'
      },
      edge: {
        default: '#CCCCCC',
        active: '#007AFF',
        hover: '#F5F5F5',
        text: '#000000'
      }
    },
    typography: {
      fontFamily: {
        base: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
        heading: 'system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
        monospace: 'SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        md: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      lineHeight: {
        none: 1,
        tight: 1.25,
        snug: 1.375,
        normal: 1.5,
        relaxed: 1.625,
        loose: 2,
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
      },
    },
    spacing: {
      none: '0',
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '2.5rem',
      '3xl': '3rem',
    },
    breakpoints: {
      xs: '320px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    },
    shadows: {
      none: 'none',
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      input: '0 2px 4px rgba(0, 0, 0, 0.05)',
      button: '0 2px 4px rgba(0, 0, 0, 0.12)',
    },
    transitions: {
      fastest: '50ms',
      faster: '100ms',
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '750ms',
      slowest: '1000ms',
    },
    zIndex: {
      hide: -1,
      auto: 'auto' as const,
      base: 0,
      docked: 10,
      dropdown: 1000,
      sticky: 1100,
      banner: 1200,
      overlay: 1300,
      modal: 1400,
      popover: 1500,
      toast: 1700,
      tooltip: 1800,
    },
    animation: {
      ...mockAnimationConfig,
      motionSafe: {
        enabled: motionEnabled,
        reducedIntensity: reducedMotion,
      }
    },
    id: 'mock-theme',
    name: 'Mock Theme',
    description: 'Mock theme for testing',
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
} 