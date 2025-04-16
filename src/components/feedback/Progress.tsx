import React from 'react';
import styled from '@emotion/styled';
import { Theme } from '@emotion/react';
import { getThemeValue } from '../../core/theme/styled';

// Types
export type ProgressType = 'linear' | 'circular';
export type ProgressVariant = 'determinate' | 'indeterminate';
export type ProgressSize = 'small' | 'medium' | 'large';
export type ProgressColor = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';

export interface ProgressProps {
  /**
   * The type of progress indicator
   * @default 'linear'
   */
  type?: ProgressType;
  
  /**
   * The variant of the progress indicator
   * @default 'determinate'
   */
  variant?: ProgressVariant;
  
  /**
   * The current value of the progress indicator (0-100)
   * @default 0
   */
  value?: number;
  
  /**
   * The size of the progress indicator
   * @default 'medium'
   */
  size?: ProgressSize;
  
  /**
   * The color of the progress indicator
   * @default 'primary'
   */
  color?: ProgressColor;
  
  /**
   * Additional className for the progress
   */
  className?: string;
  
  /**
   * Label to display with the progress indicator
   */
  label?: string;
  
  /**
   * Show percentage with the progress indicator
   * @default false
   */
  showPercentage?: boolean;
  
  /**
   * Additional CSS styling via style prop
   */
  style?: React.CSSProperties;
  
  /**
   * Aria label for accessibility
   */
  ariaLabel?: string;
}

// Helper function for theming
const themeValue = (theme: Theme) => (path: string, fallback?: string) => {
  const value = getThemeValue(theme, path);
  return value || fallback || '';
};

// Get size values
const getLinearSize = (size: ProgressSize) => {
  switch (size) {
    case 'small':
      return '4px';
    case 'large':
      return '12px';
    case 'medium':
    default:
      return '8px';
  }
};

const getCircularSize = (size: ProgressSize) => {
  switch (size) {
    case 'small':
      return '32px';
    case 'large':
      return '64px';
    case 'medium':
    default:
      return '48px';
  }
};

// Styled Components
const ProgressContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

const LinearProgressWrapper = styled.div<{ size: ProgressSize }>(({ size }) => ({
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  height: getLinearSize(size),
  borderRadius: '999px',
}));

const LinearProgressBase = styled.div<{ color: ProgressColor }>(({ color, theme }) => {
  const tv = themeValue(theme);
  
  const getBackgroundColor = () => {
    switch (color) {
      case 'primary':
        return tv('colors.primary.100', '#e0e7ff');
      case 'secondary':
        return tv('colors.secondary.100', '#e0e7ff');
      case 'success':
        return tv('colors.success.100', '#dcfce7');
      case 'error':
        return tv('colors.error.100', '#fee2e2');
      case 'warning':
        return tv('colors.warning.100', '#fef3c7');
      case 'info':
        return tv('colors.info.100', '#dbeafe');
      default:
        return tv('colors.gray.100', '#f3f4f6');
    }
  };
  
  return {
    width: '100%',
    height: '100%',
    backgroundColor: getBackgroundColor(),
  };
});

const LinearProgressBar = styled.div<{ color: ProgressColor; value: number; variant: ProgressVariant }>(
  ({ color, value, variant, theme }) => {
    const tv = themeValue(theme);
    
    const getColor = () => {
      switch (color) {
        case 'primary':
          return tv('colors.primary.500', '#6366f1');
        case 'secondary':
          return tv('colors.secondary.500', '#8b5cf6');
        case 'success':
          return tv('colors.success.500', '#22c55e');
        case 'error':
          return tv('colors.error.500', '#ef4444');
        case 'warning':
          return tv('colors.warning.500', '#f59e0b');
        case 'info':
          return tv('colors.info.500', '#3b82f6');
        default:
          return tv('colors.gray.500', '#6b7280');
      }
    };
    
    const indeterminateAnimation = {
      animation: variant === 'indeterminate' ? 'indeterminate-animation 1.5s infinite linear' : 'none',
      '@keyframes indeterminate-animation': {
        '0%': {
          transform: 'translateX(-100%)',
          width: '50%',
        },
        '100%': {
          transform: 'translateX(200%)',
          width: '50%',
        },
      },
    };
    
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      height: '100%',
      backgroundColor: getColor(),
      width: variant === 'determinate' ? `${value}%` : '100%',
      transition: variant === 'determinate' ? 'width 0.4s ease-in-out' : 'none',
      ...indeterminateAnimation,
    };
  }
);

const CircularProgressContainer = styled.div<{ size: ProgressSize }>(({ size }) => ({
  position: 'relative',
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: getCircularSize(size),
  height: getCircularSize(size),
}));

const CircularProgressSVG = styled.svg({
  transform: 'rotate(-90deg)',
});

const CircularProgressBackground = styled.circle<{ color: ProgressColor }>(({ color, theme }) => {
  const tv = themeValue(theme);
  
  const getColor = () => {
    switch (color) {
      case 'primary':
        return tv('colors.primary.100', '#e0e7ff');
      case 'secondary':
        return tv('colors.secondary.100', '#e0e7ff');
      case 'success':
        return tv('colors.success.100', '#dcfce7');
      case 'error':
        return tv('colors.error.100', '#fee2e2');
      case 'warning':
        return tv('colors.warning.100', '#fef3c7');
      case 'info':
        return tv('colors.info.100', '#dbeafe');
      default:
        return tv('colors.gray.100', '#f3f4f6');
    }
  };
  
  return {
    stroke: getColor(),
    fill: 'none',
  };
});

const CircularProgressBar = styled.circle<{ color: ProgressColor; variant: ProgressVariant }>(
  ({ color, variant, theme }) => {
    const tv = themeValue(theme);
    
    const getColor = () => {
      switch (color) {
        case 'primary':
          return tv('colors.primary.500', '#6366f1');
        case 'secondary':
          return tv('colors.secondary.500', '#8b5cf6');
        case 'success':
          return tv('colors.success.500', '#22c55e');
        case 'error':
          return tv('colors.error.500', '#ef4444');
        case 'warning':
          return tv('colors.warning.500', '#f59e0b');
        case 'info':
          return tv('colors.info.500', '#3b82f6');
        default:
          return tv('colors.gray.500', '#6b7280');
      }
    };
    
    const indeterminateAnimation = {
      animation: variant === 'indeterminate' ? 'circular-rotate 1.5s linear infinite' : 'none',
      strokeDasharray: '80, 200',
      strokeDashoffset: 0,
      '@keyframes circular-rotate': {
        '0%': {
          strokeDashoffset: 0,
          transform: 'rotate(0deg)',
        },
        '50%': {
          strokeDashoffset: 100,
          transform: 'rotate(135deg)',
        },
        '100%': {
          strokeDashoffset: 200,
          transform: 'rotate(360deg)',
        },
      },
    };
    
    return {
      stroke: getColor(),
      fill: 'none',
      strokeLinecap: 'round',
      transformOrigin: 'center',
      transition: variant === 'determinate' ? 'stroke-dashoffset 0.4s ease-in-out' : 'none',
      ...indeterminateAnimation,
    };
  }
);

const Label = styled.div(({ theme }) => {
  const tv = themeValue(theme);
  return {
    marginBottom: tv('spacing.2', '8px'),
    fontSize: tv('typography.scale.sm', '14px'),
    fontWeight: tv('typography.weights.medium', '500'),
    color: tv('colors.text', '#374151'),
  };
});

const Percentage = styled.div<{ size: ProgressSize }>(({ size, theme }) => {
  const tv = themeValue(theme);
  
  const getFontSize = () => {
    switch (size) {
      case 'small':
        return tv('typography.scale.xs', '12px');
      case 'large':
        return tv('typography.scale.lg', '18px');
      case 'medium':
      default:
        return tv('typography.scale.md', '16px');
    }
  };
  
  return {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: getFontSize(),
    fontWeight: tv('typography.weights.semibold', '600'),
    color: tv('colors.text', '#374151'),
  };
});

// Main Components
export const LinearProgress: React.FC<Omit<ProgressProps, 'type'>> = ({
  variant = 'determinate',
  value = 0,
  size = 'medium',
  color = 'primary',
  className,
  label,
  showPercentage = false,
  style,
  ariaLabel,
}) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  
  return (
    <ProgressContainer className={className} style={style}>
      {(label || (showPercentage && variant === 'determinate')) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {label && <Label>{label}</Label>}
          {showPercentage && variant === 'determinate' && (
            <span style={{ fontSize: '14px' }}>{Math.round(clampedValue)}%</span>
          )}
        </div>
      )}
      <LinearProgressWrapper size={size} role="progressbar" aria-valuenow={variant === 'determinate' ? clampedValue : undefined} aria-valuemin={0} aria-valuemax={100} aria-label={ariaLabel}>
        <LinearProgressBase color={color} />
        <LinearProgressBar color={color} value={clampedValue} variant={variant} />
      </LinearProgressWrapper>
    </ProgressContainer>
  );
};

export const CircularProgress: React.FC<Omit<ProgressProps, 'type'>> = ({
  variant = 'determinate',
  value = 0,
  size = 'medium',
  color = 'primary',
  className,
  showPercentage = false,
  style,
  ariaLabel,
}) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const sizeValue = getCircularSize(size);
  const radius = parseInt(sizeValue) * 0.4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;
  
  return (
    <CircularProgressContainer
      size={size}
      className={className}
      style={style}
      role="progressbar"
      aria-valuenow={variant === 'determinate' ? clampedValue : undefined}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
    >
      <CircularProgressSVG width={sizeValue} height={sizeValue} viewBox={`0 0 ${parseInt(sizeValue)} ${parseInt(sizeValue)}`}>
        <CircularProgressBackground
          color={color}
          cx={parseInt(sizeValue) / 2}
          cy={parseInt(sizeValue) / 2}
          r={radius}
          strokeWidth={parseInt(getLinearSize(size))}
        />
        <CircularProgressBar
          color={color}
          variant={variant}
          cx={parseInt(sizeValue) / 2}
          cy={parseInt(sizeValue) / 2}
          r={radius}
          strokeWidth={parseInt(getLinearSize(size))}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={variant === 'determinate' ? strokeDashoffset : 0}
        />
      </CircularProgressSVG>
      {showPercentage && variant === 'determinate' && (
        <Percentage size={size}>{Math.round(clampedValue)}%</Percentage>
      )}
    </CircularProgressContainer>
  );
};

// Main Progress Component
export const Progress: React.FC<ProgressProps> = ({
  type = 'linear',
  ...props
}) => {
  if (type === 'circular') {
    return <CircularProgress {...props} />;
  }
  
  return <LinearProgress {...props} />;
};

export default Progress; 