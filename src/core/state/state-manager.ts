export type StateValue = string | number | boolean | null | StateObject | StateArray;
type StateObject = { [key: string]: StateValue };
type StateArray = StateValue[];

export interface StateManager<T extends StateObject = StateObject> {
  state: T;
  initialize(): Promise<void>;
  get<K extends StateValue>(key: string): K | undefined;
  set<K extends StateValue>(key: string, value: K): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  subscribe(callback: (state: T) => void): () => void;
}

export class DefaultStateManager<T extends StateObject = StateObject> implements StateManager<T> {
  protected _state: T = {} as T;
  private _subscribers: ((state: T) => void)[] = [];

  get state(): T {
    return { ...this._state };
  }

  async initialize(): Promise<void> {
    // Load saved state from storage
    // This will be implemented later
  }

  get<K extends StateValue>(key: keyof T): K | undefined {
    return (this._state as any)[key] as K;
  }

  async set<K extends StateValue>(key: keyof T, value: K): Promise<void> {
    (this._state as any)[key] = value;
    this._notifySubscribers();
  }

  async remove(key: string): Promise<void> {
    delete this._state[key];
    this._notifySubscribers();
  }

  async clear(): Promise<void> {
    this._state = {} as T;
    this._notifySubscribers();
  }

  subscribe(callback: (state: T) => void): () => void {
    this._subscribers.push(callback);
    return () => {
      const index = this._subscribers.indexOf(callback);
      if (index !== -1) {
        this._subscribers.splice(index, 1);
      }
    };
  }

  protected _notifySubscribers(): void {
    const state = this.state;
    this._subscribers.forEach(callback => callback(state));
  }
}
