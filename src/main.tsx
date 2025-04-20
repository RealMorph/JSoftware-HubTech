import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { registerServiceWorker } from './utils/sw-register';

// Check if production or development mode
const isProduction = import.meta.env.PROD;

// Register service worker in production mode
if (isProduction) {
  // Register the service worker after the page has loaded to avoid blocking rendering
  window.addEventListener('load', () => {
    registerServiceWorker();
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
