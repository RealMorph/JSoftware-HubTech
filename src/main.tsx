import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Check if production or development mode
const isProduction = process.env.NODE_ENV === 'production';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
