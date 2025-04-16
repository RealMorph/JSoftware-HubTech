# Feedback Components

The feedback components provide essential UI elements for user interaction and feedback in the application. These components are designed to be modular, self-contained, and independently enable/disable-able.

## Toast/Notification System

The Toast component provides a non-intrusive way to display notifications to users. It supports different types of notifications (success, error, warning, info), customizable positions, and automatic dismissal.

### Features

- Multiple notification types (success, error, warning, info)
- Customizable positions (top-right, top-left, bottom-right, bottom-left, top-center, bottom-center)
- Progress bar for automatic dismissal
- Close button option
- Stacking support for multiple notifications
- Accessibility support

### Usage

```tsx
import { ToastProvider, useToast } from '../components/feedback';

// Wrap your application with the ToastProvider
const App = () => {
  return (
    <ToastProvider>
      <YourApp />
    </ToastProvider>
  );
};

// Use the toast in your components
const YourComponent = () => {
  const { showToast } = useToast();

  const handleSuccess = () => {
    showToast({
      type: 'success',
      title: 'Success',
      message: 'Operation completed successfully!',
      duration: 5000,
      showProgressBar: true,
      showCloseButton: true,
    });
  };

  return (
    <button onClick={handleSuccess}>Show Success Toast</button>
  );
};
```

## Progress Indicators

The Progress component provides visual feedback for ongoing processes. It supports both linear and circular progress indicators, with determinate and indeterminate variants.

### Features

- Linear and circular progress indicators
- Determinate and indeterminate variants
- Multiple sizes (small, medium, large)
- Color customization
- Label and percentage display options
- Accessibility support

### Usage

```tsx
import { Progress } from '../components/feedback';

// Linear progress
const LinearProgressExample = () => {
  return (
    <Progress 
      type="linear" 
      variant="determinate" 
      value={75} 
      color="primary"
      label="Loading Progress"
      showPercentage
    />
  );
};

// Circular progress
const CircularProgressExample = () => {
  return (
    <Progress 
      type="circular" 
      variant="indeterminate" 
      color="secondary"
    />
  );
};
```

## Modal/Dialog System

The Modal component provides a way to display content in a dialog overlay. It supports different sizes, positions, and animations.

### Features

- Multiple sizes (small, medium, large, full)
- Customizable positions (center, top, right, bottom, left)
- Animation options (fade, slide, scale, none)
- Custom header, content, and footer
- Backdrop click and Escape key closing options
- Focus trap for accessibility
- Accessibility support

### Usage

```tsx
import { Modal } from '../components/feedback';
import { useState } from 'react';

const ModalExample = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button onClick={handleOpenModal}>Open Modal</button>
      
      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        title="Modal Example"
        size="medium"
        position="center"
        animation="fade"
      >
        <div style={{ padding: '16px' }}>
          <p>This is the modal content.</p>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '8px', 
          padding: '16px',
          borderTop: '1px solid #e0e0e0'
        }}>
          <button onClick={handleCloseModal}>Cancel</button>
          <button onClick={handleCloseModal}>Confirm</button>
        </div>
      </Modal>
    </>
  );
};
```

## Demo Components

The feedback components package includes demo components to showcase the features of each component:

- `ToastDemo`: Demonstrates the Toast component with different types and positions
- `ProgressDemo`: Demonstrates the Progress component with different types, variants, and sizes
- `ModalDemo`: Demonstrates the Modal component with different sizes, positions, and animations
- `FeedbackDemo`: A comprehensive demo that combines all three feedback components

To preview the demos, you can import and use these components in your application:

```tsx
import { ToastDemo, ProgressDemo, ModalDemo, FeedbackDemo } from '../components/feedback';

// Use the demo components in your application
const DemosPage = () => {
  return (
    <div>
      <h1>Feedback Component Demos</h1>
      <ToastDemo />
      <ProgressDemo />
      <ModalDemo />
      <FeedbackDemo />
    </div>
  );
};
``` 