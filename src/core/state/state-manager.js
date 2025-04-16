export class DefaultStateManager {
  constructor() {
    Object.defineProperty(this, '_state', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: {},
    });
    Object.defineProperty(this, '_subscribers', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: [],
    });
  }
  get state() {
    return { ...this._state };
  }
  async initialize() {}
  get(key) {
    return this._state[key];
  }
  async set(key, value) {
    this._state[key] = value;
    this._notifySubscribers();
  }
  async remove(key) {
    delete this._state[key];
    this._notifySubscribers();
  }
  async clear() {
    this._state = {};
    this._notifySubscribers();
  }
  subscribe(callback) {
    this._subscribers.push(callback);
    return () => {
      const index = this._subscribers.indexOf(callback);
      if (index !== -1) {
        this._subscribers.splice(index, 1);
      }
    };
  }
  _notifySubscribers() {
    const state = this.state;
    this._subscribers.forEach(callback => callback(state));
  }
}
