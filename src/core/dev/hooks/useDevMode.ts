import { useEffect, useState, useRef, useCallback } from 'react';
import { useDevTools } from '../DevToolsProvider';

/**
 * Type definition for component debug info
 */
interface ComponentDebugInfo {
  renderCount: number;
  mountTime: number;
  lastRenderTime: number;
  renderDuration: number;
  props: Record<string, any>;
  state: Record<string, any>;
}

/**
 * Type definition for the hook return value
 */
interface DevModeReturn {
  isDevMode: boolean;
  debugInfo: ComponentDebugInfo;
  logRender: (componentName: string) => void;
  trackState: <T>(state: T, name: string) => void;
  trackProps: <T extends Record<string, any>>(props: T) => void;
  measure: (label: string, fn: () => any) => any;
  logMessage: (message: string, level?: 'info' | 'warn' | 'error' | 'debug') => void;
  exposeFunction: (name: string, fn: Function) => void;
}

/**
 * Hook for component-level developer tools
 * 
 * @param componentName - Name of the component using this hook
 * @param initialState - Optional initial state to track
 * @returns Object with developer tools utilities
 */
export const useDevMode = (componentName: string, initialState: Record<string, any> = {}): DevModeReturn => {
  const { isEnabled, config } = useDevTools();
  const isDevMode = isEnabled;
  
  // Initialize debug info
  const [debugInfo, setDebugInfo] = useState<ComponentDebugInfo>({
    renderCount: 0,
    mountTime: Date.now(),
    lastRenderTime: Date.now(),
    renderDuration: 0,
    props: {},
    state: initialState,
  });
  
  // Create references to track component lifecycle
  const renderStartTimeRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);
  
  // Track render performance
  useEffect(() => {
    if (!isDevMode) return;
    
    renderCountRef.current += 1;
    const now = Date.now();
    const renderDuration = renderStartTimeRef.current ? now - renderStartTimeRef.current : 0;
    
    setDebugInfo(prev => ({
      ...prev,
      renderCount: renderCountRef.current,
      lastRenderTime: now,
      renderDuration,
    }));
    
    // Log render info if performance monitoring is enabled
    if (config.performanceMonitoring && renderDuration > 16) { // 16ms = 60fps threshold
      console.warn(
        `%c[DEV] Slow render in ${componentName}: ${renderDuration}ms`,
        'color: orange; font-weight: bold;'
      );
    }
    
    // Log to performance timeline
    if (config.performanceMonitoring) {
      performance.mark(`${componentName}-render-start`);
      return () => {
        performance.mark(`${componentName}-render-end`);
        performance.measure(
          `${componentName} render`,
          `${componentName}-render-start`,
          `${componentName}-render-end`
        );
      };
    }
  }, [componentName, isDevMode, config]);
  
  // Track render start time before each render
  renderStartTimeRef.current = Date.now();
  
  // Log render with formatted message
  const logRender = useCallback((message: string = '') => {
    if (!isDevMode || !config.logRenders) return;
    
    console.log(
      `%c[DEV] ${componentName} rendered ${message ? ': ' + message : ''}`,
      'color: #6b9eec; font-weight: bold;'
    );
  }, [componentName, isDevMode, config]);
  
  // Track component state changes
  const trackState = useCallback(<T,>(state: T, name: string) => {
    if (!isDevMode || !config.stateInspector) return;
    
    setDebugInfo(prev => ({
      ...prev,
      state: {
        ...prev.state,
        [name]: state,
      },
    }));
  }, [isDevMode, config]);
  
  // Track component props
  const trackProps = useCallback(<T extends Record<string, any>>(props: T) => {
    if (!isDevMode || !config.componentHighlighting) return;
    
    setDebugInfo(prev => ({
      ...prev,
      props,
    }));
  }, [isDevMode, config]);
  
  // Measure execution time of a function
  const measure = useCallback((label: string, fn: () => any) => {
    if (!isDevMode || !config.performanceMonitoring) {
      return fn();
    }
    
    const startTime = performance.now();
    try {
      return fn();
    } finally {
      const duration = performance.now() - startTime;
      console.log(
        `%c[DEV] ${componentName} - ${label}: ${duration.toFixed(2)}ms`,
        'color: #9c27b0; font-weight: bold;'
      );
    }
  }, [componentName, isDevMode, config]);
  
  // Enhanced console logging
  const logMessage = useCallback((message: string, level: 'info' | 'warn' | 'error' | 'debug' = 'info') => {
    if (!isDevMode || !config.logRenders) return;
    
    const styles = {
      info: 'color: #2196f3; font-weight: bold;',
      warn: 'color: #ff9800; font-weight: bold;',
      error: 'color: #f44336; font-weight: bold;',
      debug: 'color: #9e9e9e; font-weight: bold;',
    };
    
    console[level](
      `%c[DEV] ${componentName}: ${message}`,
      styles[level]
    );
  }, [componentName, isDevMode, config]);
  
  // Expose component functions to window for debugging
  const exposeFunction = useCallback((name: string, fn: Function) => {
    if (!isDevMode) return;
    
    if (!window.__DEV_COMPONENTS__) {
      window.__DEV_COMPONENTS__ = {};
    }
    
    if (!window.__DEV_COMPONENTS__[componentName]) {
      window.__DEV_COMPONENTS__[componentName] = {};
    }
    
    window.__DEV_COMPONENTS__[componentName][name] = fn;
  }, [componentName, isDevMode]);
  
  return {
    isDevMode,
    debugInfo,
    logRender,
    trackState,
    trackProps,
    measure,
    logMessage,
    exposeFunction,
  };
};

// Declare window extension for TypeScript
declare global {
  interface Window {
    __DEV_COMPONENTS__?: Record<string, {
      __DEBUG_INFO__?: {
        props: Record<string, any>;
        state: Record<string, any>;
        renderCount: number;
        lastRenderTime: number;
        renderDuration: number;
        domRef: React.RefObject<HTMLElement>;
      };
      [key: string]: any;
    }>;
  }
}

export default useDevMode; 