require('@testing-library/jest-dom');

// Mock window.matchMedia
global.window.matchMedia = query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
});

// Mock document.documentElement.style
Object.defineProperty(document.documentElement, 'style', {
  writable: true,
  value: {
    setProperty: () => {},
  },
});

// Mock URL methods
global.URL.createObjectURL = () => 'mock-url';
global.URL.revokeObjectURL = () => {};

// Mock console.warn to avoid noise in tests
global.console.warn = () => {};

// Setup axe for accessibility testing
const { toHaveNoViolations } = require('jest-axe');
expect.extend(toHaveNoViolations);
