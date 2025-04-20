import React, { createContext, useContext, useReducer, useCallback, useMemo, useRef, ReactNode } from 'react';
import { PersistentStorage, createStorage, StorageConfig } from './PersistentStorage';

// Types for the state management system
export type StateSelector<State, Selected> = (state: State) => Selected;
export type ActionCreator<Payload = void> = Payload extends void
  ? { type: string }
  : { type: string; payload: Payload };
export type ActionCreatorWithPayload<T> = { type: string; payload: T };
export type ActionCreatorWithoutPayload = { type: string };
export type AnyAction = ActionCreatorWithPayload<any> | ActionCreatorWithoutPayload;

// Generic action creators
export function createAction<T = void>(type: string): T extends void
  ? () => ActionCreatorWithoutPayload
  : (payload: T) => ActionCreatorWithPayload<T> {
  return ((payload?: T) => (payload === undefined ? { type } : { type, payload })) as any;
}

// State manager configuration
export interface StateManagerConfig<State> {
  initialState: State;
  reducers: Record<string, (state: State, action: any) => State>;
  middleware?: Array<(api: MiddlewareAPI<State>) => (next: (action: AnyAction) => any) => (action: AnyAction) => any>;
  enableDevTools?: boolean;
  storageConfig?: StorageConfig & { enabled: boolean; key: string };
}

// Middleware API
export interface MiddlewareAPI<State> {
  getState: () => State;
  dispatch: (action: AnyAction) => any;
}

/**
 * Creates a state manager with the provided configuration
 */
export function createStateManager<State>(config: StateManagerConfig<State>) {
  // Create context for the state and dispatch
  const StateContext = createContext<State | undefined>(undefined);
  const DispatchContext = createContext<React.Dispatch<AnyAction> | undefined>(undefined);
  
  // Reference for subscribers
  const subscribers = new Set<(state: State, prevState: State) => void>();
  
  // Root reducer that combines all reducers
  const rootReducer = (state: State, action: AnyAction): State => {
    const handler = config.reducers[action.type];
    if (handler) {
      return handler(state, action);
    }
    return state;
  };
  
  // Create storage if persistence is enabled
  let storage: PersistentStorage | null = null;
  if (config.storageConfig?.enabled) {
    const { enabled, key, ...storageOptions } = config.storageConfig;
    storage = createStorage(storageOptions);
  }
  
  // Provider component
  const Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // State reference for middleware
    const stateRef = useRef<State>(config.initialState);
    
    // Load initial state from storage if enabled
    const [initialStateLoaded, setInitialStateLoaded] = React.useState(false);
    
    React.useEffect(() => {
      const loadInitialState = async () => {
        if (storage && config.storageConfig?.key) {
          try {
            const storedState = await storage.getItem<State>(config.storageConfig.key);
            if (storedState) {
              stateRef.current = storedState;
              dispatchRef.current({ type: '@@INIT', payload: storedState });
            }
          } catch (error) {
            console.error('Failed to load state from storage:', error);
          }
        }
        setInitialStateLoaded(true);
      };
      
      loadInitialState();
    }, []);
    
    // Middleware chain setup
    const getState = useCallback(() => stateRef.current, []);
    
    const dispatchWithoutMiddleware = useCallback((action: AnyAction) => {
      const prevState = stateRef.current;
      const nextState = rootReducer(prevState, action);
      
      if (nextState !== prevState) {
        stateRef.current = nextState;
        
        // Persist state if storage is enabled
        if (storage && config.storageConfig?.key) {
          storage.setItem(config.storageConfig.key, nextState).catch(error => {
            console.error('Failed to persist state to storage:', error);
          });
        }
        
        // Notify subscribers
        subscribers.forEach(subscriber => subscriber(nextState, prevState));
        
        // Log to Redux DevTools if enabled
        if (config.enableDevTools && typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__) {
          window.__REDUX_DEVTOOLS_EXTENSION__.send(action, nextState);
        }
      }
      
      return action;
    }, []);
    
    // Set up middleware chain
    const middlewareAPI: MiddlewareAPI<State> = {
      getState,
      dispatch: (action: AnyAction) => dispatchRef.current(action)
    };
    
    const dispatchRef = useRef(dispatchWithoutMiddleware);
    
    // Apply middleware if provided
    React.useEffect(() => {
      if (config.middleware && config.middleware.length > 0) {
        const middlewareChain = config.middleware.map(middleware => middleware(middlewareAPI));
        
        const enhancedDispatch = middlewareChain.reduceRight(
          (next, middleware) => middleware(next),
          dispatchWithoutMiddleware
        );
        
        dispatchRef.current = enhancedDispatch;
      } else {
        dispatchRef.current = dispatchWithoutMiddleware;
      }
    }, [dispatchWithoutMiddleware]);
    
    // Initialize Redux DevTools if enabled
    React.useEffect(() => {
      if (config.enableDevTools && typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__) {
        window.__REDUX_DEVTOOLS_EXTENSION__.connect();
        window.__REDUX_DEVTOOLS_EXTENSION__.init(stateRef.current);
        
        return () => {
          window.__REDUX_DEVTOOLS_EXTENSION__?.disconnect();
        };
      }
    }, []);
    
    // Use reducer for React state management
    const [state, dispatch] = useReducer((state: State, action: AnyAction & { payload?: State }) => {
      // Special init action to synchronize with the ref
      if (action.type === '@@INIT' && action.payload) {
        return action.payload;
      }
      
      // For all other actions, dispatch through the middleware chain
      dispatchRef.current(action);
      // Return the current state from the ref
      return stateRef.current;
    }, config.initialState);
    
    // Update state ref when reducer state changes
    React.useEffect(() => {
      stateRef.current = state;
    }, [state]);
    
    // Don't render until the initial state is loaded from storage
    if (!initialStateLoaded && storage && config.storageConfig?.enabled) {
      return null; // Or a loading indicator
    }
    
    // JSX needs to be rendered properly
    return React.createElement(
      StateContext.Provider,
      { value: state },
      React.createElement(
        DispatchContext.Provider,
        { value: dispatch },
        children
      )
    );
  };
  
  // Hook to access state
  function useState<Selected = State>(
    selector?: StateSelector<State, Selected>
  ): Selected {
    const state = useContext(StateContext);
    
    if (state === undefined) {
      throw new Error('useState must be used within a Provider');
    }
    
    return selector ? selector(state) : (state as unknown as Selected);
  }
  
  // Hook to access dispatch
  function useDispatch(): React.Dispatch<AnyAction> {
    const dispatch = useContext(DispatchContext);
    
    if (dispatch === undefined) {
      throw new Error('useDispatch must be used within a Provider');
    }
    
    return dispatch;
  }
  
  // Hook that combines state and dispatch with a selector
  function useStateWithDispatch<Selected = State>(
    selector?: StateSelector<State, Selected>
  ): [Selected, React.Dispatch<AnyAction>] {
    return [useState(selector), useDispatch()];
  }
  
  // Subscribe to state changes
  function subscribe(callback: (state: State, prevState: State) => void) {
    subscribers.add(callback);
    return () => {
      subscribers.delete(callback);
    };
  }
  
  // Get current state (mainly for middleware)
  function getState(): State {
    return config.initialState; // This will be overridden when the provider mounts
  }
  
  // Create a hook for a specific action
  function useAction<T = void>(
    actionCreator: T extends void
      ? () => ActionCreatorWithoutPayload
      : (payload: T) => ActionCreatorWithPayload<T>
  ) {
    const dispatch = useDispatch();
    
    return useCallback(
      ((payload?: T) => {
        const action = (actionCreator as any)(payload);
        return dispatch(action);
      }) as T extends void ? () => void : (payload: T) => void,
      [dispatch]
    );
  }
  
  // Create a selector hook
  function createSelector<Selected>(
    selector: StateSelector<State, Selected>
  ) {
    return () => useState(selector);
  }
  
  // Built-in middleware
  const thunkMiddleware = (api: MiddlewareAPI<State>) => (next: (action: AnyAction) => any) => (action: AnyAction | any) => {
    if (typeof action === 'function') {
      return action(api.dispatch, api.getState);
    }
    return next(action);
  };
  
  const loggerMiddleware = (api: MiddlewareAPI<State>) => (next: (action: AnyAction) => any) => (action: AnyAction) => {
    const result = next(action);
    return result;
  };
  
  // Return all the hooks and utilities
  return {
    Provider,
    useState,
    useDispatch,
    useStateWithDispatch,
    useAction,
    createSelector,
    subscribe,
    getState,
    thunkMiddleware,
    loggerMiddleware
  };
}

// Declare the Redux DevTools Extension interface
declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__?: {
      connect: () => void;
      init: (state: any) => void;
      send: (action: any, state: any) => void;
      disconnect: () => void;
    };
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: any;
  }
} 