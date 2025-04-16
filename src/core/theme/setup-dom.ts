import { JSDOM } from 'jsdom';

// Create a new JSDOM instance
const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  runScripts: 'dangerously',
});

// Set up the global environment
global.window = dom.window as any;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.HTMLStyleElement = dom.window.HTMLStyleElement;
global.performance = {
  now: () => process.hrtime.bigint() / BigInt(1e6),
} as any;

// Add any missing browser APIs that might be needed
if (!global.requestAnimationFrame) {
  global.requestAnimationFrame = (callback: FrameRequestCallback) => setTimeout(callback, 0);
}

if (!global.cancelAnimationFrame) {
  global.cancelAnimationFrame = (id: number) => clearTimeout(id);
}
