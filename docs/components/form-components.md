# Form Components

This document provides an overview of the form components available in our component library.

## Overview

Our form components provide a comprehensive solution for building forms with validation, different layouts, and various input types. The system is designed to be modular, flexible, and easy to use while maintaining a consistent API.

## Components

### FormContainer

The `FormContainer` is a high-level component that simplifies creating forms with validation. It acts as a wrapper around individual form controls and provides a consistent interface for handling form state, validation, and submission.

#### Features

- Declarative field configuration
- Built-in validation rules with custom validation support
- Horizontal and vertical layouts
- Loading states
- Error handling and display
- Embedded mode for use within other components
- Consistent styling with theme integration

#### Usage

```tsx
import { FormContainer, FieldConfig } from '../components/base/FormContainer';

// Define field configurations
const fields: FieldConfig[] = [
  {
    name: 'fullName',
    label: 'Full Name',
    required: true,
    placeholder: 'Enter your full name'
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    placeholder: 'Enter your email address',
    helperText: 'We will never share your email with anyone else.'
  },
  {
    name: 'message',
    label: 'Message',
    type: 'textarea',
    required: true,
    placeholder: 'Enter your message',
    fullWidth: true
  }
];

// Use the FormContainer component
<FormContainer
  title="Contact Us"
  description="Fill out this form to send us a message."
  fields={fields}
  onSubmit={handleSubmit}
  isLoading={loading}
  submitButtonText="Send Message"
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Title for the form |
| `description` | `string` | - | Description text |
| `fields` | `FieldConfig[]` | - | Field configurations (required) |
| `defaultValues` | `Record<string, any>` | `{}` | Default values for form fields |
| `submitButtonText` | `string` | `'Submit'` | Submit button text |
| `cancelButtonText` | `string` | `'Cancel'` | Cancel button text |
| `onSubmit` | `(values: Record<string, any>) => void` | - | Handler for form submission (required) |
| `onCancel` | `() => void` | - | Handler for cancel button click |
| `isLoading` | `boolean` | `false` | Whether the form is loading/processing |
| `embedded` | `boolean` | `false` | Whether the form is embedded (no Card container) |
| `className` | `string` | - | Custom class name |
| `style` | `React.CSSProperties` | - | Custom style |
| `additionalContent` | `React.ReactNode` | - | Additional content to render after form fields |
| `layout` | `'vertical' \| 'horizontal'` | `'vertical'` | Form layout |
| `renderField` | `Function` | - | Custom renderer for specific fields |

#### Field Configuration

The `FieldConfig` type allows for detailed configuration of each form field:

```tsx
export type FieldConfig = {
  /** Field name */
  name: string;
  /** Field label */
  label: string;
  /** Field type (text, email, password, etc.) */
  type?: string;
  /** Whether field is required */
  required?: boolean;
  /** Default value */
  defaultValue?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Helper text */
  helperText?: string;
  /** Validation rules */
  validationRules?: ValidationRule[];
  /** Whether the field spans full width */
  fullWidth?: boolean;
};
```

#### Validation

The FormContainer supports built-in validation rules for common field types, as well as custom validation rules:

```tsx
// Email validation rule
const emailRule: ValidationRule = {
  validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  message: 'Please enter a valid email address'
};

// Password validation rule
const passwordRule: ValidationRule = {
  validator: (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(value),
  message: 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character'
};

// Field matching validation (e.g., confirm password)
const confirmPasswordRule: ValidationRule = {
  validator: (value, values) => value === values?.password,
  message: 'Passwords do not match'
};
```

### Form

The underlying `Form` component provides the foundation for form state management and validation. It can be used directly for more complex form scenarios that require custom layouts and behaviors.

```tsx
import { Form, ValidationRule } from '../components/base/Form';

<Form
  defaultValues={initialValues}
  onSubmit={handleSubmit}
  onValidationError={handleValidationError}
>
  {/* Form fields and custom layout */}
</Form>
```

## Form Demos

### Basic Forms

The `FormDemo` component demonstrates various form configurations:

1. **Simple Contact Form**: A basic form with required field validation
2. **Complex Validation Form**: Demonstrates advanced validation rules including password requirements and field matching
3. **Horizontal Layout Form**: Shows a login form with horizontal layout
4. **Embedded Form**: Demonstrates a form without the Card container, embedded inside another component

### Advanced Forms

For more complex scenarios, the `FormContainerDemo` component demonstrates:

1. **Basic Form**: A contact form with simple validation
2. **Advanced Form with Custom Validation**: A registration form with dynamic validation rules
3. **Horizontal Layout Form**: A login form with compact layout

## Best Practices

1. **Field Names**: Use consistent naming conventions for field names
2. **Validation**: Provide clear validation error messages to guide users
3. **Layout**: Choose the appropriate layout based on the form's purpose and complexity
4. **Loading States**: Always implement loading states for forms that perform async operations
5. **Error Handling**: Provide visual feedback for form errors 