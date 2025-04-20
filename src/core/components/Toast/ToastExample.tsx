import React, { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { AnimatedToast, ToastManager, ToastProps } from './AnimatedToast';
import AnimatedButton from '../Button/AnimatedButton';

/**
 * Example component showing different uses of the AnimatedToast
 */
const ToastExample: React.FC = () => {
  const theme = useTheme();
  
  // State for managing toasts
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const [nextId, setNextId] = useState(1);
  
  // Add a new toast with unique ID
  const addToast = (
    type: 'info' | 'success' | 'warning' | 'error', 
    position: ToastProps['position'] = 'top-right',
    animationType: 'fade' | 'slide' | 'scale' = 'slide',
    duration: number = 5000
  ) => {
    const titles = {
      info: 'Information',
      success: 'Success!',
      warning: 'Warning',
      error: 'Error',
    };
    
    const messages = {
      info: 'This is an informational message that might be useful.',
      success: 'The operation completed successfully!',
      warning: 'This action might cause issues.',
      error: 'An error occurred. Please try again.',
    };
    
    const newToast: ToastProps = {
      id: nextId,
      type,
      title: titles[type],
      message: messages[type],
      position,
      animationType,
      duration,
      showIcon: true,
      showCloseButton: true,
    };
    
    setToasts(prev => [...prev, newToast]);
    setNextId(prev => prev + 1);
  };
  
  // Remove a toast by ID
  const removeToast = (id: string | number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  // Clear all toasts
  const clearAllToasts = () => {
    // Mark all toasts for closing with animation
    setToasts(prev => prev.map(toast => ({ ...toast, isClosing: true })));
  };
  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginBottom: theme.spacing.lg }}>Toast Notifications</h1>
      
      {/* Basic usage */}
      <section style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Toast Types</h2>
        <div style={{ display: 'flex', gap: theme.spacing.md, flexWrap: 'wrap' }}>
          <AnimatedButton
            onClick={() => addToast('info')}
            color="info"
          >
            Show Info Toast
          </AnimatedButton>
          
          <AnimatedButton
            onClick={() => addToast('success')}
            color="success"
          >
            Show Success Toast
          </AnimatedButton>
          
          <AnimatedButton
            onClick={() => addToast('warning')}
            color="warning"
          >
            Show Warning Toast
          </AnimatedButton>
          
          <AnimatedButton
            onClick={() => addToast('error')}
            color="error"
          >
            Show Error Toast
          </AnimatedButton>
        </div>
      </section>
      
      {/* Different positions */}
      <section style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Toast Positions</h2>
        <div style={{ display: 'flex', gap: theme.spacing.md, flexWrap: 'wrap' }}>
          <AnimatedButton
            onClick={() => addToast('info', 'top-left')}
            variant="outlined"
            color="info"
          >
            Top Left
          </AnimatedButton>
          
          <AnimatedButton
            onClick={() => addToast('info', 'top-center')}
            variant="outlined"
            color="info"
          >
            Top Center
          </AnimatedButton>
          
          <AnimatedButton
            onClick={() => addToast('info', 'top-right')}
            variant="outlined"
            color="info"
          >
            Top Right
          </AnimatedButton>
        </div>
        <div style={{ display: 'flex', gap: theme.spacing.md, flexWrap: 'wrap', marginTop: theme.spacing.md }}>
          <AnimatedButton
            onClick={() => addToast('info', 'bottom-left')}
            variant="outlined"
            color="info"
          >
            Bottom Left
          </AnimatedButton>
          
          <AnimatedButton
            onClick={() => addToast('info', 'bottom-center')}
            variant="outlined"
            color="info"
          >
            Bottom Center
          </AnimatedButton>
          
          <AnimatedButton
            onClick={() => addToast('info', 'bottom-right')}
            variant="outlined"
            color="info"
          >
            Bottom Right
          </AnimatedButton>
        </div>
      </section>
      
      {/* Animation types */}
      <section style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Animation Types</h2>
        <div style={{ display: 'flex', gap: theme.spacing.md, flexWrap: 'wrap' }}>
          <AnimatedButton
            onClick={() => addToast('success', 'top-right', 'fade')}
            variant="outlined"
            color="success"
          >
            Fade Animation
          </AnimatedButton>
          
          <AnimatedButton
            onClick={() => addToast('success', 'top-right', 'slide')}
            variant="outlined"
            color="success"
          >
            Slide Animation
          </AnimatedButton>
          
          <AnimatedButton
            onClick={() => addToast('success', 'top-right', 'scale')}
            variant="outlined"
            color="success"
          >
            Scale Animation
          </AnimatedButton>
        </div>
      </section>
      
      {/* Duration options */}
      <section style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Duration Options</h2>
        <div style={{ display: 'flex', gap: theme.spacing.md, flexWrap: 'wrap' }}>
          <AnimatedButton
            onClick={() => addToast('warning', 'top-right', 'slide', 2000)}
            variant="outlined"
            color="warning"
          >
            Short Duration (2s)
          </AnimatedButton>
          
          <AnimatedButton
            onClick={() => addToast('warning', 'top-right', 'slide', 5000)}
            variant="outlined"
            color="warning"
          >
            Medium Duration (5s)
          </AnimatedButton>
          
          <AnimatedButton
            onClick={() => addToast('warning', 'top-right', 'slide', 10000)}
            variant="outlined"
            color="warning"
          >
            Long Duration (10s)
          </AnimatedButton>
          
          <AnimatedButton
            onClick={() => addToast('warning', 'top-right', 'slide', 0)}
            variant="outlined"
            color="warning"
          >
            No Auto-Close
          </AnimatedButton>
        </div>
      </section>
      
      {/* Clear all toasts */}
      <section>
        <AnimatedButton
          onClick={clearAllToasts}
          variant="outlined"
          color="error"
          fullWidth
        >
          Clear All Toasts
        </AnimatedButton>
      </section>
      
      {/* Toast manager (renders all toasts) */}
      <ToastManager 
        toasts={toasts} 
        onClose={removeToast} 
      />
    </div>
  );
};

export default ToastExample; 