/**
 * Demo Component Data
 * 
 * This file contains the metadata for all demo components in the application.
 * Each component is categorized and includes details like path, description, and status.
 */

import React from 'react';
import { DemoComponent, DemoCategory, DemoStatus } from './demoRegistry';

/**
 * Base Components Demos
 */
export const baseComponentDemos: DemoComponent[] = [
  {
    id: 'button',
    name: 'Button Demo',
    description: 'Demonstrates various button styles, sizes, and states',
    category: DemoCategory.BASE,
    path: '/demos/base/button',
    status: DemoStatus.COMPLETE,
    menuIcon: 'smart_button',
    menuOrder: 100,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/ButtonDemo'))
  },
  {
    id: 'textfield',
    name: 'TextField Demo',
    description: 'Demonstrates text input fields with validation and states',
    category: DemoCategory.BASE,
    path: '/demos/base/textfield',
    status: DemoStatus.COMPLETE,
    menuIcon: 'text_fields',
    menuOrder: 101,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/TextFieldDemo'))
  },
  {
    id: 'select',
    name: 'Select Demo',
    description: 'Demonstrates dropdown selection components',
    category: DemoCategory.BASE,
    path: '/demos/base/select',
    status: DemoStatus.COMPLETE,
    menuIcon: 'expand_more',
    menuOrder: 102,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/ButtonDemo'))
  },
  {
    id: 'checkbox',
    name: 'Checkbox Demo',
    description: 'Demonstrates checkbox components and states',
    category: DemoCategory.BASE,
    path: '/demos/base/checkbox',
    status: DemoStatus.COMPLETE,
    menuIcon: 'check_box',
    menuOrder: 103,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/ButtonDemo'))
  },
  {
    id: 'radio',
    name: 'Radio Demo',
    description: 'Demonstrates radio button selection components',
    category: DemoCategory.BASE,
    path: '/demos/base/radio',
    status: DemoStatus.COMPLETE,
    menuIcon: 'radio_button_checked',
    menuOrder: 104,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/ButtonDemo'))
  },
  {
    id: 'card',
    name: 'Card Demo',
    description: 'Demonstrates card layout components for content organization',
    category: DemoCategory.BASE,
    path: '/demos/base/card',
    status: DemoStatus.COMPLETE,
    menuIcon: 'view_agenda',
    menuOrder: 105,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/CardDemo'))
  },
  {
    id: 'list',
    name: 'List Demo',
    description: 'Demonstrates list components for data display',
    category: DemoCategory.BASE,
    path: '/demos/base/list',
    status: DemoStatus.COMPLETE,
    menuIcon: 'list',
    menuOrder: 106,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/ButtonDemo'))
  },
  {
    id: 'table',
    name: 'Table Demo',
    description: 'Demonstrates table components for structured data',
    category: DemoCategory.BASE,
    path: '/demos/base/table',
    status: DemoStatus.COMPLETE,
    menuIcon: 'table_chart',
    menuOrder: 107,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/TableDemo'))
  },
  {
    id: 'datepicker',
    name: 'DatePicker Demo',
    description: 'Demonstrates date selection components',
    category: DemoCategory.BASE,
    path: '/demos/base/datepicker',
    status: DemoStatus.COMPLETE,
    menuIcon: 'calendar_today',
    menuOrder: 108,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/ButtonDemo'))
  },
  {
    id: 'timepicker',
    name: 'TimePicker Demo',
    description: 'Demonstrates time selection components',
    category: DemoCategory.BASE,
    path: '/demos/base/timepicker',
    status: DemoStatus.COMPLETE,
    menuIcon: 'access_time',
    menuOrder: 109,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/ButtonDemo'))
  },
  {
    id: 'fileupload',
    name: 'FileUpload Demo',
    description: 'Demonstrates file upload components and functionality',
    category: DemoCategory.BASE,
    path: '/demos/base/fileupload',
    status: DemoStatus.COMPLETE,
    menuIcon: 'upload_file',
    menuOrder: 110,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/ButtonDemo'))
  },
  {
    id: 'multiselect',
    name: 'MultiSelect Demo',
    description: 'Demonstrates multi-selection dropdown components',
    category: DemoCategory.BASE,
    path: '/demos/base/multiselect',
    status: DemoStatus.COMPLETE,
    menuIcon: 'checklist',
    menuOrder: 111,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/ButtonDemo'))
  },
  {
    id: 'typeahead',
    name: 'Typeahead Demo',
    description: 'Demonstrates autocomplete input components',
    category: DemoCategory.BASE,
    path: '/demos/base/typeahead',
    status: DemoStatus.COMPLETE,
    menuIcon: 'search',
    menuOrder: 112,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/TextFieldDemo'))
  },
  {
    id: 'form',
    name: 'Form Demo',
    description: 'Demonstrates form layout and validation',
    category: DemoCategory.BASE,
    path: '/demos/base/form',
    status: DemoStatus.COMPLETE,
    menuIcon: 'description',
    menuOrder: 113,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/ButtonDemo'))
  },
  {
    id: 'formcontainer',
    name: 'Form Container Demo',
    description: 'Demonstrates form container components for complex forms',
    category: DemoCategory.BASE,
    path: '/demos/base/formcontainer',
    status: DemoStatus.COMPLETE,
    menuIcon: 'dynamic_form',
    menuOrder: 114,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/ButtonDemo'))
  },
  {
    id: 'datadisplay',
    name: 'Data Display Demo',
    description: 'Demonstrates components for displaying different types of data',
    category: DemoCategory.BASE,
    path: '/demos/base/datadisplay',
    status: DemoStatus.COMPLETE,
    menuIcon: 'data_array',
    menuOrder: 115,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/TableDemo'))
  }
];

/**
 * Feedback Components Demos
 */
export const feedbackComponentDemos: DemoComponent[] = [
  {
    id: 'alert',
    name: 'Alert Demo',
    description: 'Demonstrates alert components for user notifications',
    category: DemoCategory.FEEDBACK,
    path: '/demos/feedback/alert',
    status: DemoStatus.COMPLETE,
    menuIcon: 'announcement',
    menuOrder: 200,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/AlertDemo'))
  },
  {
    id: 'toast',
    name: 'Toast Demo',
    description: 'Demonstrates toast notification components',
    category: DemoCategory.FEEDBACK,
    path: '/demos/feedback/toast',
    status: DemoStatus.COMPLETE,
    menuIcon: 'notification_important',
    menuOrder: 201,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/ToastDemo'))
  },
  {
    id: 'modal',
    name: 'Modal Demo',
    description: 'Demonstrates modal dialog components',
    category: DemoCategory.FEEDBACK,
    path: '/demos/feedback/modal',
    status: DemoStatus.COMPLETE,
    menuIcon: 'add_box',
    menuOrder: 202,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/ModalDemo'))
  },
  {
    id: 'progress',
    name: 'Progress Demo',
    description: 'Demonstrates progress indicators and loaders',
    category: DemoCategory.FEEDBACK,
    path: '/demos/feedback/progress',
    status: DemoStatus.COMPLETE,
    menuIcon: 'hourglass_top',
    menuOrder: 203,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/ModalDemo'))
  },
  {
    id: 'feedback-all',
    name: 'Feedback Overview',
    description: 'Overview of all feedback components',
    category: DemoCategory.FEEDBACK,
    path: '/demos/feedback/all',
    status: DemoStatus.COMPLETE,
    menuIcon: 'feedback',
    menuOrder: 204,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/AlertDemo'))
  },
  {
    id: 'dialog',
    name: 'Dialog Demo',
    description: 'Demonstrates dialog components for user interaction',
    category: DemoCategory.FEEDBACK,
    path: '/demos/feedback/dialog',
    status: DemoStatus.COMPLETE,
    menuIcon: 'question_answer',
    menuOrder: 205,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/ModalDemo'))
  },
  {
    id: 'form-dialog',
    name: 'Form Dialog Demo',
    description: 'Demonstrates form dialogs for data entry',
    category: DemoCategory.FEEDBACK,
    path: '/demos/feedback/form-dialog',
    status: DemoStatus.COMPLETE,
    menuIcon: 'edit_note',
    menuOrder: 206,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/FormDialogDemo'))
  },
  {
    id: 'confirmation-dialog',
    name: 'Confirmation Dialog Demo',
    description: 'Demonstrates confirmation dialogs for user decisions',
    category: DemoCategory.FEEDBACK,
    path: '/demos/feedback/confirmation-dialog',
    status: DemoStatus.COMPLETE,
    menuIcon: 'check_circle',
    menuOrder: 207,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/ModalDemo'))
  }
];

/**
 * Data Visualization Demos
 */
export const dataVisualizationDemos: DemoComponent[] = [
  {
    id: 'charts',
    name: 'Charts Demo',
    description: 'Demonstrates chart visualization components',
    category: DemoCategory.DATA_VISUALIZATION,
    path: '/demos/data-visualization/charts',
    status: DemoStatus.COMPLETE,
    menuIcon: 'bar_chart',
    menuOrder: 300,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/ChartsDemo'))
  },
  {
    id: 'datagrid',
    name: 'Data Grid Demo',
    description: 'Demonstrates data grid for tabular data',
    category: DemoCategory.DATA_VISUALIZATION,
    path: '/demos/data-visualization/datagrid',
    status: DemoStatus.COMPLETE,
    menuIcon: 'grid_on',
    menuOrder: 301,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/DataGridDemo'))
  },
  {
    id: 'maps',
    name: 'Maps Demo',
    description: 'Demonstrates map visualization components',
    category: DemoCategory.DATA_VISUALIZATION,
    path: '/demos/data-visualization/maps',
    status: DemoStatus.COMPLETE,
    menuIcon: 'map',
    menuOrder: 302,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/MapsDemo'))
  },
  {
    id: 'dashboard',
    name: 'Dashboard Templates',
    description: 'Demonstrates dashboard layout templates',
    category: DemoCategory.DATA_VISUALIZATION,
    path: '/demos/data-viz/dashboard',
    status: DemoStatus.COMPLETE,
    menuIcon: 'dashboard',
    menuOrder: 303,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/ChartsDemo'))
  },
  {
    id: 'graph',
    name: 'Graph Demo',
    description: 'Demonstrates graph visualization components',
    category: DemoCategory.DATA_VISUALIZATION,
    path: '/demos/data-viz/graph',
    status: DemoStatus.COMPLETE,
    menuIcon: 'share',
    menuOrder: 304,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/ChartsDemo'))
  }
];

/**
 * Navigation Components Demos
 */
export const navigationComponentDemos: DemoComponent[] = [
  {
    id: 'breadcrumbs',
    name: 'Breadcrumbs Demo',
    description: 'Demonstrates breadcrumb navigation components',
    category: DemoCategory.NAVIGATION,
    path: '/demos/navigation/breadcrumbs',
    status: DemoStatus.COMPLETE,
    menuIcon: 'more_horiz',
    menuOrder: 400,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/BreadcrumbsDemo'))
  },
  {
    id: 'tabs',
    name: 'Tabs Demo',
    description: 'Demonstrates tabbed navigation components',
    category: DemoCategory.NAVIGATION,
    path: '/demos/navigation/tabs',
    status: DemoStatus.COMPLETE,
    menuIcon: 'tab',
    menuOrder: 401,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/TabsDemo'))
  },
  {
    id: 'menu',
    name: 'Menu Demo',
    description: 'Demonstrates menu navigation components',
    category: DemoCategory.NAVIGATION,
    path: '/demos/navigation/menu',
    status: DemoStatus.COMPLETE,
    menuIcon: 'menu',
    menuOrder: 402,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/MenuDemo'))
  },
  {
    id: 'pagination',
    name: 'Pagination Demo',
    description: 'Demonstrates pagination components',
    category: DemoCategory.NAVIGATION,
    path: '/demos/navigation/pagination',
    status: DemoStatus.COMPLETE,
    menuIcon: 'last_page',
    menuOrder: 403,
    showInMenu: true,
    component: React.lazy(() => import('../../components/navigation/PaginationDemo').then(module => ({ default: module.PaginationDemo })))
  },
  {
    id: 'sidebar',
    name: 'Sidebar Demo',
    description: 'Demonstrates sidebar navigation components',
    category: DemoCategory.NAVIGATION,
    path: '/demos/navigation/sidebar',
    status: DemoStatus.COMPLETE,
    menuIcon: 'vertical_split',
    menuOrder: 404,
    showInMenu: true,
    component: React.lazy(() => import('../../components/demos/MenuDemo'))
  },
  {
    id: 'breadcrumbs-tabs',
    name: 'Breadcrumbs with Tabs Demo',
    description: 'Demonstrates integration of breadcrumbs with tabs',
    category: DemoCategory.NAVIGATION,
    path: '/demos/navigation/breadcrumbs-tabs',
    status: DemoStatus.COMPLETE,
    menuIcon: 'view_comfy',
    menuOrder: 405,
    showInMenu: true,
    component: React.lazy(() => import('../../components/navigation/BreadcrumbsWithTabsDemo'))
  }
];

/**
 * All demo components
 */
export const allDemoComponents: DemoComponent[] = [
  ...baseComponentDemos,
  ...feedbackComponentDemos,
  ...dataVisualizationDemos,
  ...navigationComponentDemos
]; 