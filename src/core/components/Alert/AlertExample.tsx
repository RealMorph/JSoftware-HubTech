import React, { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import AnimatedAlert from './AnimatedAlert';
import AnimatedButton from '../Button/AnimatedButton';

/**
 * Example component showing different uses of the AnimatedAlert
 */
const AlertExample: React.FC = () => {
  const theme = useTheme();
  
  // State for managing alerts
  const [alerts, setAlerts] = useState<{
    id: number;
    variant: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    message: string;
    autoClose: boolean;
    isOpen: boolean;
    animationType: 'fade' | 'slide' | 'scale';
  }[]>([
    {
      id: 1,
      variant: 'info',
      title: 'Information',
      message: 'This is an information alert with a title.',
      autoClose: false,
      isOpen: true,
      animationType: 'fade',
    },
  ]);
  
  // Counter for generating unique IDs
  const [nextId, setNextId] = useState(2);
  
  // Handle closing an alert
  const handleCloseAlert = (id: number) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, isOpen: false } : alert
    ));
    
    // Remove alert from state after animation completes
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, 500);
  };
  
  // Add a new alert
  const addAlert = (variant: 'info' | 'success' | 'warning' | 'error', animationType: 'fade' | 'slide' | 'scale' = 'fade', autoClose = false) => {
    const titles = {
      info: 'Information',
      success: 'Success',
      warning: 'Warning',
      error: 'Error',
    };
    
    const messages = {
      info: 'This is an informational message.',
      success: 'Operation completed successfully!',
      warning: 'Please be cautious with this action.',
      error: 'An error occurred while processing your request.',
    };
    
    const newAlert = {
      id: nextId,
      variant,
      title: titles[variant],
      message: messages[variant],
      autoClose,
      isOpen: true,
      animationType,
    };
    
    setAlerts(prev => [...prev, newAlert]);
    setNextId(prev => prev + 1);
  };
  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginBottom: theme.spacing.lg }}>Alert Examples</h1>
      
      {/* Alert Variants */}
      <section style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Alert Variants</h2>
        <AnimatedAlert variant="info" title="Information">
          This is an information alert.
        </AnimatedAlert>
        
        <AnimatedAlert variant="success" title="Success">
          This is a success alert.
        </AnimatedAlert>
        
        <AnimatedAlert variant="warning" title="Warning">
          This is a warning alert.
        </AnimatedAlert>
        
        <AnimatedAlert variant="error" title="Error">
          This is an error alert.
        </AnimatedAlert>
      </section>
      
      {/* Simple Alert */}
      <section style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Simple Alert (No Title)</h2>
        <AnimatedAlert variant="info">
          This is a simple alert without a title.
        </AnimatedAlert>
      </section>
      
      {/* Alert without Icon */}
      <section style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Alert without Icon</h2>
        <AnimatedAlert variant="success" showIcon={false} title="No Icon">
          This alert doesn't display an icon.
        </AnimatedAlert>
      </section>
      
      {/* Alert without Close Button */}
      <section style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Alert without Close Button</h2>
        <AnimatedAlert variant="warning" showCloseButton={false} title="No Close Button">
          This alert doesn't have a close button.
        </AnimatedAlert>
      </section>
      
      {/* Auto-closing Alert */}
      <section style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Auto-closing Alert</h2>
        <div style={{ marginBottom: theme.spacing.md }}>
          <AnimatedButton
            onClick={() => addAlert('info', 'fade', true)}
            variant="outlined"
          >
            Show Auto-closing Alert (5s)
          </AnimatedButton>
        </div>
      </section>
      
      {/* Different Animation Types */}
      <section style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Animation Types</h2>
        <div style={{ display: 'flex', gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
          <AnimatedButton
            onClick={() => addAlert('success', 'fade')}
            variant="outlined"
            color="success"
          >
            Fade Animation
          </AnimatedButton>
          
          <AnimatedButton
            onClick={() => addAlert('warning', 'slide')}
            variant="outlined"
            color="warning"
          >
            Slide Animation
          </AnimatedButton>
          
          <AnimatedButton
            onClick={() => addAlert('error', 'scale')}
            variant="outlined"
            color="error"
          >
            Scale Animation
          </AnimatedButton>
        </div>
      </section>
      
      {/* Dynamic Alerts Container */}
      <section>
        <h2 style={{ marginBottom: theme.spacing.md }}>Dynamic Alerts</h2>
        <div style={{ marginBottom: theme.spacing.md }}>
          {alerts.map(alert => (
            <AnimatedAlert
              key={alert.id}
              variant={alert.variant}
              title={alert.title}
              onClose={() => handleCloseAlert(alert.id)}
              autoClose={alert.autoClose}
              autoCloseDelay={5000}
              animationType={alert.animationType}
              isOpen={alert.isOpen}
            >
              {alert.message}
            </AnimatedAlert>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AlertExample; 