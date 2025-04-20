import React from 'react';
import { useTheme } from '../../theme/ThemeContext';
import AnimatedButton from './AnimatedButton';

/**
 * Example component showing different uses of the AnimatedButton
 */
const ButtonExample: React.FC = () => {
  const theme = useTheme();
  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginBottom: theme.spacing.lg }}>Button Examples</h1>
      
      {/* Variants */}
      <section style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Button Variants</h2>
        <div style={{ display: 'flex', gap: theme.spacing.md, flexWrap: 'wrap' }}>
          <AnimatedButton variant="primary">
            Primary
          </AnimatedButton>
          
          <AnimatedButton variant="secondary">
            Secondary
          </AnimatedButton>
          
          <AnimatedButton variant="outlined">
            Outlined
          </AnimatedButton>
          
          <AnimatedButton variant="text">
            Text
          </AnimatedButton>
        </div>
      </section>
      
      {/* Sizes */}
      <section style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Button Sizes</h2>
        <div style={{ display: 'flex', gap: theme.spacing.md, flexWrap: 'wrap', alignItems: 'center' }}>
          <AnimatedButton size="small">
            Small
          </AnimatedButton>
          
          <AnimatedButton size="medium">
            Medium
          </AnimatedButton>
          
          <AnimatedButton size="large">
            Large
          </AnimatedButton>
        </div>
      </section>
      
      {/* Colors */}
      <section style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Button Colors</h2>
        <div style={{ display: 'flex', gap: theme.spacing.md, flexWrap: 'wrap' }}>
          <AnimatedButton color="primary">
            Primary
          </AnimatedButton>
          
          <AnimatedButton color="secondary">
            Secondary
          </AnimatedButton>
          
          <AnimatedButton color="success">
            Success
          </AnimatedButton>
          
          <AnimatedButton color="error">
            Error
          </AnimatedButton>
          
          <AnimatedButton color="warning">
            Warning
          </AnimatedButton>
          
          <AnimatedButton color="info">
            Info
          </AnimatedButton>
        </div>
      </section>
      
      {/* Outlined with colors */}
      <section style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Outlined Buttons with Colors</h2>
        <div style={{ display: 'flex', gap: theme.spacing.md, flexWrap: 'wrap' }}>
          <AnimatedButton variant="outlined" color="primary">
            Primary
          </AnimatedButton>
          
          <AnimatedButton variant="outlined" color="secondary">
            Secondary
          </AnimatedButton>
          
          <AnimatedButton variant="outlined" color="success">
            Success
          </AnimatedButton>
          
          <AnimatedButton variant="outlined" color="error">
            Error
          </AnimatedButton>
        </div>
      </section>
      
      {/* With icons */}
      <section style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Buttons with Icons</h2>
        <div style={{ display: 'flex', gap: theme.spacing.md, flexWrap: 'wrap' }}>
          <AnimatedButton 
            icon={<span role="img" aria-label="star">⭐</span>}
            iconPosition="left"
          >
            With Icon Left
          </AnimatedButton>
          
          <AnimatedButton 
            icon={<span role="img" aria-label="rocket">🚀</span>}
            iconPosition="right"
          >
            With Icon Right
          </AnimatedButton>
        </div>
      </section>
      
      {/* Full width */}
      <section style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Full Width Button</h2>
        <AnimatedButton fullWidth>
          Full Width Button
        </AnimatedButton>
      </section>
      
      {/* Disabled */}
      <section style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Disabled Buttons</h2>
        <div style={{ display: 'flex', gap: theme.spacing.md, flexWrap: 'wrap' }}>
          <AnimatedButton disabled>
            Disabled Primary
          </AnimatedButton>
          
          <AnimatedButton variant="outlined" disabled>
            Disabled Outlined
          </AnimatedButton>
          
          <AnimatedButton variant="text" disabled>
            Disabled Text
          </AnimatedButton>
        </div>
      </section>
      
      {/* Animation Controls */}
      <section style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Animation Controls</h2>
        <div style={{ display: 'flex', gap: theme.spacing.md, flexWrap: 'wrap' }}>
          <AnimatedButton>
            Default Animations
          </AnimatedButton>
          
          <AnimatedButton animateOnHover={false}>
            No Hover Animation
          </AnimatedButton>
          
          <AnimatedButton disableRipple>
            No Ripple Effect
          </AnimatedButton>
          
          <AnimatedButton animateOnHover={false} disableRipple>
            No Animations
          </AnimatedButton>
        </div>
      </section>
    </div>
  );
};

export default ButtonExample; 