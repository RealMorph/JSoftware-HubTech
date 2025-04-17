import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './Router';

// Check if production or development mode
const isProduction = process.env.NODE_ENV === 'production';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
