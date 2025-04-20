import React from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { 
  withEntranceAnimation, 
  withInteractionAnimation,
  WithEntranceAnimationProps,
  WithInteractionAnimationProps
} from '../../animation';

// Base Card component props
export interface CardProps {
  title?: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  elevation?: 'none' | 'low' | 'medium' | 'high';
  variant?: 'default' | 'outlined' | 'filled';
}

/**
 * Base Card component that uses the theme directly
 */
export const Card: React.FC<CardProps> = ({ 
  title, 
  children, 
  onClick, 
  className = '',
  elevation = 'low',
  variant = 'default'
}) => {
  const theme = useTheme();
  
  // Compute styles based on theme and props
  const getShadow = () => {
    switch (elevation) {
      case 'none': return theme.shadows.none;
      case 'low': return theme.shadows.sm;
      case 'medium': return theme.shadows.md;
      case 'high': return theme.shadows.lg;
      default: return theme.shadows.sm;
    }
  };
  
  const getBackground = () => {
    switch (variant) {
      case 'default': return theme.colors.surface;
      case 'outlined': return 'transparent';
      case 'filled': return theme.colors.background;
      default: return theme.colors.surface;
    }
  };
  
  const getBorder = () => {
    return variant === 'outlined' ? `1px solid ${theme.colors.border}` : 'none';
  };

  return (
    <div 
      className={`card ${className}`}
      onClick={onClick}
      style={{
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        boxShadow: getShadow(),
        margin: theme.spacing.sm,
        background: getBackground(),
        border: getBorder(),
        color: theme.colors.text.primary,
        transition: `all ${theme.transitions.normal} ${theme.animation.easing.easeInOut}`
      }}
    >
      {title && (
        <h3 style={{ 
          marginTop: 0,
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.semibold,
          marginBottom: theme.spacing.sm
        }}>
          {title}
        </h3>
      )}
      <div>{children}</div>
    </div>
  );
};

// Create animated variants
export type AnimatedCardProps = CardProps & WithEntranceAnimationProps;
export const EntranceAnimatedCard = withEntranceAnimation(Card);

export type InteractiveCardProps = CardProps & WithInteractionAnimationProps;
export const InteractiveCard = withInteractionAnimation(Card);

// Combining both animations
export type FullyAnimatedCardProps = CardProps & WithEntranceAnimationProps & WithInteractionAnimationProps;
export const FullyAnimatedCard = withInteractionAnimation(
  withEntranceAnimation(Card)
);

// Export default as the base card for consistency
export default Card; 