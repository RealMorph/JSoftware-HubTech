// Export all component categories
import { Button, TextField } from './base';
import {
  Card as BaseCard,
  CardHeader as BaseCardHeader,
  CardContent as BaseCardContent,
  CardFooter as BaseCardFooter,
  List as BaseList,
  ListItem as BaseListItem,
  Table as BaseTable,
  TableHeader as BaseTableHeader,
  TableBody as BaseTableBody,
  TableRow as BaseTableRow,
  TableCell as BaseTableCell,
  TableHeaderCell as BaseTableHeaderCell,
} from './base';

import {
  Card as DataDisplayCard,
  CardDemo as DataDisplayCardDemo,
  List as DataDisplayList,
  ListDemo as DataDisplayListDemo,
  ListItem as DataDisplayListItem,
  Table as DataDisplayTable,
  TableDemo as DataDisplayTableDemo,
} from './data-display';

// Re-export base components
export { Button, TextField };

// Re-export renamed base data display components
export {
  BaseCard,
  BaseCardHeader,
  BaseCardContent,
  BaseCardFooter,
  BaseList,
  BaseListItem,
  BaseTable,
  BaseTableHeader,
  BaseTableBody,
  BaseTableRow,
  BaseTableCell,
  BaseTableHeaderCell,
};

// Re-export renamed data-display components
export {
  DataDisplayCard,
  DataDisplayCardDemo,
  DataDisplayList,
  DataDisplayListDemo,
  DataDisplayListItem,
  DataDisplayTable,
  DataDisplayTableDemo,
};

// Base Components
export * from './base/Button';
export * from './base/TextField';
export * from './base/Select';
export * from './base/Checkbox';
export * from './base/Radio';
export * from './base/Form';
export * from './base/FormContainer';
export * from './base/Card';
export * from './base/List';
export * from './base/Table';
export * from './base/DatePicker';
export * from './base/TimePicker';
export * from './base/FileUpload';

// Demo Components
export * from './base/ButtonDemo';
export * from './base/TextFieldDemo';
export * from './base/SelectDemo';
export * from './base/CheckboxDemo';
export * from './base/RadioDemo';
export * from './base/FormDemo';
export * from './base/FormContainerDemo';
export * from './base/CardDemo';
export * from './base/ListDemo';
export * from './base/TableDemo';
export * from './base/DatePickerDemo';
export * from './base/TimePickerDemo';
export * from './base/FileUploadDemo';

// Layout components
export * from './layout';

// Feedback components
export * from './feedback';
