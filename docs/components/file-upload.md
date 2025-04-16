# FileUpload Component

The FileUpload component provides a user-friendly interface for uploading files, supporting both drag-and-drop and traditional file selection methods. It follows the project's modular architecture principles with theme integration and accessibility support.

## Features

- Drag and drop file upload
- Traditional file browser support
- File type restrictions
- File size limits (min/max)
- Multiple file upload
- Maximum file count enforcement
- Custom validation
- File previews for images
- List view for non-image files
- Error handling and validation feedback
- Accessibility support
- Theme integration
- Multiple variants and sizes

## Usage

```tsx
import { FileUpload } from '../components/base/FileUpload';

// Basic usage
<FileUpload 
  label="Upload File"
  onFilesAdded={(files) => console.log(files)}
  helperText="Click or drag a file to upload"
/>

// With file type restrictions
<FileUpload 
  label="Upload Image"
  accept="image/*"
  onFilesAdded={(files) => console.log(files)}
  onFileRejected={(file, reason) => console.warn(file.name, reason)}
  helperText="Only image files are accepted"
/>

// With size limits
<FileUpload 
  label="Upload File (Size Limited)"
  maxSize={1024 * 1024 * 5} // 5MB
  minSize={1024 * 10} // 10KB
  onFilesAdded={(files) => console.log(files)}
  onFileRejected={(file, reason) => console.warn(file.name, reason)}
  helperText="Files must be between 10KB and 5MB"
/>

// Multiple file upload
<FileUpload 
  label="Upload Multiple Files"
  multiple
  maxFiles={3}
  onFilesAdded={(files) => console.log(files)}
  helperText="You can select up to 3 files"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `accept` | `string` | - | MIME types or file extensions to accept (e.g., "image/*", ".pdf,.doc") |
| `multiple` | `boolean` | `false` | Allow multiple file selection |
| `maxSize` | `number` | - | Maximum file size in bytes |
| `minSize` | `number` | - | Minimum file size in bytes |
| `maxFiles` | `number` | - | Maximum number of files allowed |
| `validator` | `(file: File) => { valid: boolean; message?: string }` | - | Custom validation function |
| `onFilesAdded` | `(files: File[]) => void` | - | Called when files are added |
| `onFileRejected` | `(file: File, reason: string) => void` | - | Called when a file is rejected |
| `dropZoneText` | `string` | `'Drag and drop files here, or'` | Custom drop zone text |
| `buttonText` | `string` | `'Browse Files'` | Custom button text |
| `helperText` | `string` | - | Helper text to display |
| `error` | `string \| boolean` | - | Error message or error state |
| `disabled` | `boolean` | `false` | Whether the component is disabled |
| `variant` | `'default' \| 'inline' \| 'card'` | `'default'` | Component visual variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Component size |
| `showPreview` | `boolean` | `true` | Show file preview (for images) |
| `className` | `string` | - | Custom class name |
| `label` | `string` | - | Label for the file input |
| `required` | `boolean` | `false` | Whether the field is required |

## Variants

### Default Variant
The standard variant with a centered layout and prominent drop zone.

### Inline Variant
A more compact, horizontal layout that takes up less vertical space.

### Card Variant
Similar to the default but with a card-like appearance and subtle shadow.

## Sizes

The component supports three sizes:
- `sm` - Small, compact size
- `md` - Medium size (default)
- `lg` - Large size with more padding and larger text

## File Preview

The component provides two view modes for selected files:

### Thumbnail Preview
When `showPreview` is `true` (default), the component will:
- Display image thumbnails for image files
- Show file extensions in styled boxes for non-image files

### List View
When `showPreview` is `false`, files are displayed in a list format with:
- Filename
- File size

## Validation

The component supports several validation methods:

### Built-in Validation
- File type validation via the `accept` prop
- File size validation via `minSize` and `maxSize` props
- File count validation via the `maxFiles` prop

### Custom Validation
Custom validation logic can be implemented using the `validator` prop, which should return an object with:
- `valid`: Boolean indicating if the file is valid
- `message`: Optional error message to display if invalid

## Accessibility

The FileUpload component follows accessibility best practices:

- Proper labeling via `aria-label` and visible labels
- Keyboard navigation support
- Interactive elements have appropriate roles
- Error states are properly announced
- Focus management for keyboard users

## Theme Integration

The component uses the theme system for consistent styling, accessing:

- Color palette (`primary`, `error`, `text`, `background`, `border`)
- Typography (font family, size)
- Border radius
- Transition settings
- Spacing

## Examples

For comprehensive examples, see the `FileUploadDemo` component which showcases:

- Basic usage
- File type restrictions
- Size limits
- Multiple file upload
- Custom validation
- Variants and sizes
- Error states
- Disabled state
- Preview options 