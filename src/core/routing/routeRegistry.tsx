import React, { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  createPublicRoute, 
  createProtectedRoute, 
  createRoleBasedRoute, 
  createPermissionBasedRoute,
  createRedirectRoute,
  RouteDefinition 
} from './RouteConfig';
import { ProtectedRoute, PermissionCheckOperator } from '../auth/ProtectedRoute';
import LoginPage from '../../pages/LoginPage';
import RegisterPage from '../../pages/RegisterPage';

// Loading component for lazy-loaded routes
const LoadingFallback = () => <div className="route-loading">Loading...</div>;

// Lazy-load components to reduce initial bundle size
const FormDemo = lazy(() => import('../../components/base/FormDemo'));
const ButtonDemo = lazy(() => import('../../components/base/ButtonDemo'));
const TextFieldDemo = lazy(() => import('../../components/base/TextFieldDemo'));
const SelectDemo = lazy(() => import('../../components/base/SelectDemo'));
const CheckboxDemo = lazy(() => import('../../components/base/CheckboxDemo'));
const RadioDemo = lazy(() => import('../../components/base/RadioDemo'));
const CardDemo = lazy(() => import('../../components/base/CardDemo'));
const ListDemo = lazy(() => import('../../components/base/ListDemo'));
const TableDemo = lazy(() => import('../../components/base/TableDemo'));
const DatePickerDemo = lazy(() => import('../../components/base/DatePickerDemo'));
const TimePickerDemo = lazy(() => import('../../components/base/TimePickerDemo'));
const FileUploadDemo = lazy(() => import('../../components/base/FileUploadDemo'));
const MultiSelectDemo = lazy(() => import('../../components/base/MultiSelectDemo'));
const TypeaheadDemo = lazy(() => import('../../components/base/TypeaheadDemo'));
const FormContainerDemo = lazy(() => import('../../components/base/FormContainerDemo'));

// Feedback components demos
const AlertDemo = lazy(() => import('../../components/feedback/AlertDemo'));
const ToastDemo = lazy(() => import('../../components/feedback/ToastDemo'));
const ModalDemo = lazy(() => import('../../components/feedback/ModalDemo'));
const ProgressDemo = lazy(() => import('../../components/feedback/ProgressDemo'));
const FeedbackDemo = lazy(() => import('../../components/feedback/FeedbackDemo'));

// Data visualization demos
const DataGridDemo = lazy(() => import('../../components/data-visualization/DataGridDemo'));
const DataVisualizationDemo = lazy(() => import('../../components/data-visualization/DataVisualizationDemo'));
const LeafletMapDemo = lazy(() => import('../../components/data-visualization/LeafletMapDemo'));
const DashboardTemplateDemo = lazy(() => import('../../components/dashboard/DashboardTemplateDemo'));

// Create placeholders for components that don't exist yet
const DashboardView = lazy(() => Promise.resolve({ 
  default: () => <div>Dashboard Placeholder</div> 
}));

const ProfilePage = lazy(() => Promise.resolve({ 
  default: () => <div>Profile Placeholder</div> 
}));

const AdminPage = lazy(() => Promise.resolve({ 
  default: () => <div>Admin Dashboard Placeholder</div> 
}));

const UnauthorizedPage = lazy(() => import('../../pages/UnauthorizedPage'));

const NotFoundPage = lazy(() => Promise.resolve({
  default: () => <div>Page Not Found - 404</div>
}));

// Wrap components with Suspense for lazy loading
const wrapWithSuspense = (Component: React.ReactNode) => (
  <Suspense fallback={<LoadingFallback />}>
    {Component}
  </Suspense>
);

// Wrap with appropriate ProtectedRoute based on route definition
const wrapWithProtection = (routeDef: RouteDefinition) => {
  if (routeDef.redirectTo) {
    return <Navigate to={routeDef.redirectTo} replace />;
  }
  
  if (routeDef.protectionLevel === 'public') {
    return routeDef.element;
  }
  
  return (
    <ProtectedRoute
      requiredPermissions={routeDef.requiredPermissions}
      requiredRoles={routeDef.requiredRoles}
      permissionCheckOperator={routeDef.permissionCheckOperator}
      protectionLevel={routeDef.protectionLevel}
    >
      {routeDef.element}
    </ProtectedRoute>
  );
};

// Public routes accessible without authentication
export const publicRoutes: RouteDefinition[] = [
  createPublicRoute({
    path: '/login',
    element: <LoginPage />,
    title: 'Login'
  }),
  createPublicRoute({
    path: '/register',
    element: <RegisterPage />,
    title: 'Register'
  }),
  createPublicRoute({
    path: '/forgot-password',
    element: wrapWithSuspense(<div>Forgot Password Page</div>),
    title: 'Forgot Password'
  }),
  createPublicRoute({
    path: '/unauthorized',
    element: wrapWithSuspense(<UnauthorizedPage />),
    title: 'Unauthorized'
  }),
  createRedirectRoute('/', '/dashboard')
];

// Demo routes organized by category
export const demoRoutes: RouteDefinition[] = [
  // Base Components Demos
  createProtectedRoute({
    path: '/demos/base/button',
    element: wrapWithSuspense(<ButtonDemo />),
    title: 'Button Demo',
    showInMenu: true,
    menuOrder: 100,
    menuIcon: 'smart_button',
    menuCategory: 'Base Components'
  }),
  createProtectedRoute({
    path: '/demos/base/textfield',
    element: wrapWithSuspense(<TextFieldDemo />),
    title: 'TextField Demo',
    showInMenu: true,
    menuOrder: 101,
    menuIcon: 'text_fields',
    menuCategory: 'Base Components'
  }),
  createProtectedRoute({
    path: '/demos/base/select',
    element: wrapWithSuspense(<SelectDemo />),
    title: 'Select Demo',
    showInMenu: true,
    menuOrder: 102,
    menuIcon: 'expand_more',
    menuCategory: 'Base Components'
  }),
  createProtectedRoute({
    path: '/demos/base/checkbox',
    element: wrapWithSuspense(<CheckboxDemo />),
    title: 'Checkbox Demo',
    showInMenu: true,
    menuOrder: 103,
    menuIcon: 'check_box',
    menuCategory: 'Base Components'
  }),
  createProtectedRoute({
    path: '/demos/base/radio',
    element: wrapWithSuspense(<RadioDemo />),
    title: 'Radio Demo',
    showInMenu: true,
    menuOrder: 104,
    menuIcon: 'radio_button_checked',
    menuCategory: 'Base Components'
  }),
  createProtectedRoute({
    path: '/demos/base/card',
    element: wrapWithSuspense(<CardDemo />),
    title: 'Card Demo',
    showInMenu: true,
    menuOrder: 105,
    menuIcon: 'view_agenda',
    menuCategory: 'Base Components'
  }),
  createProtectedRoute({
    path: '/demos/base/list',
    element: wrapWithSuspense(<ListDemo />),
    title: 'List Demo',
    showInMenu: true,
    menuOrder: 106,
    menuIcon: 'list',
    menuCategory: 'Base Components'
  }),
  createProtectedRoute({
    path: '/demos/base/table',
    element: wrapWithSuspense(<TableDemo />),
    title: 'Table Demo',
    showInMenu: true,
    menuOrder: 107,
    menuIcon: 'table_chart',
    menuCategory: 'Base Components'
  }),
  createProtectedRoute({
    path: '/demos/base/datepicker',
    element: wrapWithSuspense(<DatePickerDemo />),
    title: 'DatePicker Demo',
    showInMenu: true,
    menuOrder: 108,
    menuIcon: 'calendar_today',
    menuCategory: 'Base Components'
  }),
  createProtectedRoute({
    path: '/demos/base/timepicker',
    element: wrapWithSuspense(<TimePickerDemo />),
    title: 'TimePicker Demo',
    showInMenu: true,
    menuOrder: 109,
    menuIcon: 'access_time',
    menuCategory: 'Base Components'
  }),
  createProtectedRoute({
    path: '/demos/base/fileupload',
    element: wrapWithSuspense(<FileUploadDemo />),
    title: 'FileUpload Demo',
    showInMenu: true,
    menuOrder: 110,
    menuIcon: 'upload_file',
    menuCategory: 'Base Components'
  }),
  createProtectedRoute({
    path: '/demos/base/multiselect',
    element: wrapWithSuspense(<MultiSelectDemo />),
    title: 'MultiSelect Demo',
    showInMenu: true,
    menuOrder: 111,
    menuIcon: 'checklist',
    menuCategory: 'Base Components'
  }),
  createProtectedRoute({
    path: '/demos/base/typeahead',
    element: wrapWithSuspense(<TypeaheadDemo />),
    title: 'Typeahead Demo',
    showInMenu: true,
    menuOrder: 112,
    menuIcon: 'search',
    menuCategory: 'Base Components'
  }),
  createProtectedRoute({
    path: '/demos/base/form',
    element: wrapWithSuspense(<FormDemo />),
    title: 'Form Demo',
    showInMenu: true,
    menuOrder: 113,
    menuIcon: 'description',
    menuCategory: 'Base Components'
  }),
  createProtectedRoute({
    path: '/demos/base/formcontainer',
    element: wrapWithSuspense(<FormContainerDemo />),
    title: 'Form Container Demo',
    showInMenu: true,
    menuOrder: 114,
    menuIcon: 'dynamic_form',
    menuCategory: 'Base Components'
  }),
  
  // Feedback Components Demos
  createProtectedRoute({
    path: '/demos/feedback/alert',
    element: wrapWithSuspense(<AlertDemo />),
    title: 'Alert Demo',
    showInMenu: true,
    menuOrder: 200,
    menuIcon: 'announcement',
    menuCategory: 'Feedback Components'
  }),
  createProtectedRoute({
    path: '/demos/feedback/toast',
    element: wrapWithSuspense(<ToastDemo />),
    title: 'Toast Demo',
    showInMenu: true,
    menuOrder: 201,
    menuIcon: 'notification_important',
    menuCategory: 'Feedback Components'
  }),
  createProtectedRoute({
    path: '/demos/feedback/modal',
    element: wrapWithSuspense(<ModalDemo />),
    title: 'Modal Demo',
    showInMenu: true,
    menuOrder: 202,
    menuIcon: 'add_box',
    menuCategory: 'Feedback Components'
  }),
  createProtectedRoute({
    path: '/demos/feedback/progress',
    element: wrapWithSuspense(<ProgressDemo />),
    title: 'Progress Demo',
    showInMenu: true,
    menuOrder: 203,
    menuIcon: 'hourglass_top',
    menuCategory: 'Feedback Components'
  }),
  createProtectedRoute({
    path: '/demos/feedback/all',
    element: wrapWithSuspense(<FeedbackDemo />),
    title: 'Feedback Overview',
    showInMenu: true,
    menuOrder: 204,
    menuIcon: 'feedback',
    menuCategory: 'Feedback Components'
  }),
  
  // Data Visualization Demos
  createProtectedRoute({
    path: '/demos/data-viz/datagrid',
    element: wrapWithSuspense(<DataGridDemo />),
    title: 'DataGrid Demo',
    showInMenu: true,
    menuOrder: 300,
    menuIcon: 'grid_on',
    menuCategory: 'Data Visualization'
  }),
  createProtectedRoute({
    path: '/demos/data-viz/charts',
    element: wrapWithSuspense(<DataVisualizationDemo />),
    title: 'Charts Demo',
    showInMenu: true,
    menuOrder: 301,
    menuIcon: 'bar_chart',
    menuCategory: 'Data Visualization'
  }),
  createProtectedRoute({
    path: '/demos/data-viz/maps',
    element: wrapWithSuspense(<LeafletMapDemo />),
    title: 'Maps Demo',
    showInMenu: true,
    menuOrder: 302,
    menuIcon: 'map',
    menuCategory: 'Data Visualization'
  }),
  createProtectedRoute({
    path: '/demos/data-viz/dashboard',
    element: wrapWithSuspense(<DashboardTemplateDemo />),
    title: 'Dashboard Templates',
    showInMenu: true,
    menuOrder: 303,
    menuIcon: 'dashboard',
    menuCategory: 'Data Visualization'
  })
];

// Protected routes requiring authentication
export const protectedRoutes: RouteDefinition[] = [
  createProtectedRoute({
    path: '/dashboard',
    element: wrapWithSuspense(<DashboardView />),
    title: 'Dashboard',
    showInMenu: true,
    menuOrder: 1,
    menuIcon: 'dashboard'
  }),
  createProtectedRoute({
    path: '/profile',
    element: wrapWithSuspense(<ProfilePage />),
    title: 'User Profile',
    showInMenu: true,
    menuOrder: 2,
    menuIcon: 'person'
  })
];

// Role-based routes requiring specific roles
export const roleBasedRoutes: RouteDefinition[] = [
  createRoleBasedRoute({
    path: '/admin',
    element: wrapWithSuspense(<AdminPage />),
    title: 'Admin Dashboard',
    requiredRoles: ['admin'],
    showInMenu: true,
    menuOrder: 10,
    menuIcon: 'admin_panel_settings'
  }),
  createRoleBasedRoute({
    path: '/manager',
    element: wrapWithSuspense(<div>Manager Dashboard</div>),
    title: 'Manager Dashboard',
    requiredRoles: ['manager', 'admin'],
    showInMenu: true,
    menuOrder: 11,
    menuIcon: 'manage_accounts'
  })
];

// Permission-based routes requiring specific permissions
export const permissionBasedRoutes: RouteDefinition[] = [
  createPermissionBasedRoute({
    path: '/settings',
    element: wrapWithSuspense(<div>Settings Page</div>),
    title: 'Settings',
    requiredPermissions: ['settings:read', 'settings:write'],
    permissionCheckOperator: PermissionCheckOperator.AND,
    showInMenu: true,
    menuOrder: 20,
    menuIcon: 'settings'
  }),
  createPermissionBasedRoute({
    path: '/analytics',
    element: wrapWithSuspense(<div>Analytics Dashboard</div>),
    title: 'Analytics',
    requiredPermissions: ['analytics:read'],
    showInMenu: true,
    menuOrder: 21,
    menuIcon: 'analytics'
  })
];

// Error/fallback routes
export const errorRoutes: RouteDefinition[] = [
  createPublicRoute({
    path: '*',
    element: wrapWithSuspense(<NotFoundPage />),
    title: 'Not Found'
  })
];

// Combine all routes
export const allRoutes: RouteDefinition[] = [
  ...publicRoutes,
  ...protectedRoutes,
  ...roleBasedRoutes,
  ...permissionBasedRoutes,
  ...demoRoutes,
  ...errorRoutes
];

// Get menu items for navigation
export const getMenuItems = () => {
  return allRoutes
    .filter(route => route.showInMenu)
    .sort((a, b) => (a.menuOrder || 100) - (b.menuOrder || 100));
};

// Export the routes with their protection wrappers applied
export const getRoutesWithProtection = () => {
  return allRoutes.map(route => ({
    ...route,
    element: wrapWithProtection(route)
  }));
}; 