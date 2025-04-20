export { default as DataDisplayPage } from './DataDisplayPage';
export { default as FormDemoPage } from './FormDemoPage';
export { default as DataGridDemoPage } from './DataGridDemoPage';
export { default as DemoLandingPage } from './DemoLandingPage';

// These components are now also accessible via the React Router
// See src/Router.tsx for the implementation of the routing system
// Routes:
// - /demos - Demo home page (centralized landing page for all component demos)
// - /demos/base/* - Base component demos (Button, TextField, etc.)
// - /demos/feedback/* - Feedback component demos (Alert, Toast, etc.)
// - /demos/data-viz/* - Data visualization demos (Charts, Maps, etc.)
// - /demos/navigation/* - Navigation component demos (Breadcrumbs, Tabs, etc.)
