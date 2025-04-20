/**
 * Global type declarations for the application
 */

// Redux DevTools Extension
declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: {
      connect: () => void;
      init: (state: any) => void;
      send: (action: any, state: any) => void;
      disconnect: () => void;
    };
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: any;
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: {
      supportsFiber: boolean;
      renderers: Map<number, any>;
      on: (event: string, callback: (fiber: any) => void) => void;
      off: (event: string, callback: (fiber: any) => void) => void;
    };
  }
}

// Performance memory interface
interface Performance {
  memory?: {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  };
}

// Additional global declarations can be added here as needed 