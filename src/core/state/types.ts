export interface StateAction {
  type: string;
  payload?: any;
  source?: string; // ID of the tab that dispatched the action
  target?: string; // ID of the tab that should receive the action
}

export interface StateManager {
  dispatch: (action: StateAction) => void;
  getState: () => any;
  subscribe: (callback: (state: any) => void) => () => void;
  registerReducer: (namespace: string, reducer: (state: any, action: StateAction) => any) => void;
  getTabState: (tabId: string) => any;
  setTabState: (tabId: string, state: any) => void;
}

export interface StateSubscription {
  unsubscribe: () => void;
  getState: () => any;
}
