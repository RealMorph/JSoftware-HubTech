import React, { createContext, useContext, ReactNode } from 'react';

/**
 * StateModuleConfig defines the configuration for a state module
 */
export interface StateModuleConfig {
  name: string;
  initialState: Record<string, any>;
  actions?: Record<string, (...args: any[]) => any>;
  selectors?: Record<string, (state: any) => any>;
}

/**
 * StateConfig defines the configuration for the entire state system
 */
export interface StateConfig {
  modules: Record<string, StateModuleConfig>;
}

/**
 * StateContextValue represents the value stored in the StateContext
 */
interface StateContextValue {
  state: Record<string, any>;
  dispatch: (moduleName: string, actionName: string, payload?: any) => any;
  select: (moduleName: string, selectorName: string) => any;
  getState: (moduleName: string) => any;
}

// Create the context with a default value
const StateContext = createContext<StateContextValue | undefined>(undefined);

/**
 * StateProvider props
 */
interface StateProviderProps {
  children: ReactNode;
  config: StateConfig;
}

/**
 * StateProvider component that manages the state for the application
 * based on the provided configuration
 */
export const StateProvider: React.FC<StateProviderProps> = ({ children, config }) => {
  // Initialize state with all module initial states
  const [state, setState] = React.useState(() => {
    const initialState: Record<string, any> = {};
    
    // Initialize each module's state
    Object.entries(config.modules).forEach(([moduleName, moduleConfig]) => {
      initialState[moduleName] = { ...moduleConfig.initialState };
    });
    
    return initialState;
  });
  
  // Create a dispatch function that will update state based on module actions
  const dispatch = React.useCallback((moduleName: string, actionName: string, payload?: any) => {
    const module = config.modules[moduleName];
    
    if (!module) {
      console.error(`Module "${moduleName}" not found in state configuration`);
      return;
    }
    
    const action = module.actions?.[actionName];
    
    if (!action) {
      console.error(`Action "${actionName}" not found in module "${moduleName}"`);
      return;
    }
    
    // Get the current module state
    const currentModuleState = state[moduleName];
    
    // Execute the action with the current state and payload
    const result = action(currentModuleState, payload);
    
    // If the result is a function, it's a state updater
    if (typeof result === 'function') {
      setState(prevState => {
        const newModuleState = result(prevState[moduleName]);
        return {
          ...prevState,
          [moduleName]: newModuleState
        };
      });
      return;
    }
    
    // Otherwise, it's a new state value
    setState(prevState => ({
      ...prevState,
      [moduleName]: result
    }));
    
    return result;
  }, [state, config.modules]);
  
  // Select function to get derived state using module selectors
  const select = React.useCallback((moduleName: string, selectorName: string) => {
    const module = config.modules[moduleName];
    
    if (!module) {
      console.error(`Module "${moduleName}" not found in state configuration`);
      return undefined;
    }
    
    const selector = module.selectors?.[selectorName];
    
    if (!selector) {
      console.error(`Selector "${selectorName}" not found in module "${moduleName}"`);
      return undefined;
    }
    
    // Execute the selector with the current module state
    return selector(state[moduleName]);
  }, [state, config.modules]);
  
  // Getter for module state
  const getState = React.useCallback((moduleName: string) => {
    return state[moduleName];
  }, [state]);
  
  // Create the context value
  const contextValue: StateContextValue = {
    state,
    dispatch,
    select,
    getState
  };
  
  return (
    <StateContext.Provider value={contextValue}>
      {children}
    </StateContext.Provider>
  );
};

/**
 * useStateContext hook to access the state context
 */
export const useStateContext = () => {
  const context = useContext(StateContext);
  
  if (context === undefined) {
    throw new Error('useStateContext must be used within a StateProvider');
  }
  
  return context;
};

/**
 * Custom hook factory to create module-specific hooks
 */
export const createModuleHook = (moduleName: string) => {
  return () => {
    const { state, dispatch, select } = useStateContext();
    
    return {
      state: state[moduleName],
      dispatch: (actionName: string, payload?: any) => dispatch(moduleName, actionName, payload),
      select: (selectorName: string) => select(moduleName, selectorName)
    };
  };
}; 