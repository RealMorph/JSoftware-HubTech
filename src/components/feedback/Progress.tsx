import React from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// Types
export type ProgressType = 'linear' | 'circular';
export type ProgressVariant = 'determinate' | 'indeterminate';
export type ProgressSize = 'small' | 'medium' | 'large';
export type ProgressColor = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';

// Theme styles interface
interface ThemeStyles {
  colors: {
    primary: {
      100: string;
      500: string;
    };
    secondary: {
      100: string;
      500: string;
    };
    success: {
      100: string;
      500: string;
    };
    error: {
      100: string;
      500: string;
    };
    warning: {
      100: string;
      500: string;
    };
    info: {
      100: string;
      500: string;
    };
    gray: {
      100: string;
      500: string;
    };
    text: {
      primary: string;
      secondary: string;
    };
  };
  typography: {
    scale: {
      xs: string;
      sm: string;
      base: string;
    };
  };
}

// Function to create theme styles from theme context
const createThemeStyles = (themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles => {
  return {
    colors: {
      primary: {
        100: themeContext.getColor('primary.100', '#e0e7ff'),
        500: themeContext.getColor('primary.500', '#6366f1'),
      },
      secondary: {
        100: themeContext.getColor('secondary.100', '#e0e7ff'),
        500: themeContext.getColor('secondary.500', '#8b5cf6'),
      },
      success: {
        100: themeContext.getColor('success.100', '#dcfce7'),
        500: themeContext.getColor('success.500', '#22c55e'),
      },
      error: {
        100: themeContext.getColor('error.100', '#fee2e2'),
        500: themeContext.getColor('error.500', '#ef4444'),
      },
      warning: {
        100: themeContext.getColor('warning.100', '#fef3c7'),
        500: themeContext.getColor('warning.500', '#f59e0b'),
      },
      info: {
        100: themeContext.getColor('info.100', '#dbeafe'),
        500: themeContext.getColor('info.500', '#3b82f6'),
      },
      gray: {
        100: themeContext.getColor('gray.100', '#f3f4f6'),
        500: themeContext.getColor('gray.500', '#6b7280'),
      },
      text: {
        primary: themeContext.getColor('text.primary'),
        secondary: themeContext.getColor('text.secondary'),
      },
    },
    typography: {
      scale: {
        xs: String(themeContext.getTypography('scale.xs', '0.75rem')),
        sm: String(themeContext.getTypography('scale.sm', '0.875rem')),
        base: String(themeContext.getTypography('scale.base', '1rem')),
      },
    },
  };
};

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

const LinearProgressBase = styled.div<{ color: ProgressColor; $themeStyles: ThemeStyles }>(
  ({ color, $themeStyles }) => {
    const getBackgroundColor = () => {
      switch (color) {
        case 'primary':
          return $themeStyles.colors.primary[100];
        case 'secondary':
          return $themeStyles.colors.secondary[100];
        case 'success':
          return $themeStyles.colors.success[100];
        case 'error':
          return $themeStyles.colors.error[100];
        case 'warning':
          return $themeStyles.colors.warning[100];
        case 'info':
          return $themeStyles.colors.info[100];
        default:
          return $themeStyles.colors.gray[100];
      }
    };

    return {
      width: '100%',
      height: '100%',
      backgroundColor: getBackgroundColor(),
    };
  }
);

const LinearProgressBar = styled.div<{
  color: ProgressColor;
  value: number;
  variant: ProgressVariant;
  $themeStyles: ThemeStyles;
}>(({ color, value, variant, $themeStyles }) => {
  const getColor = () => {
    switch (color) {
      case 'primary':
        return $themeStyles.colors.primary[500];
      case 'secondary':
        return $themeStyles.colors.secondary[500];
      case 'success':
        return $themeStyles.colors.success[500];
      case 'error':
        return $themeStyles.colors.error[500];
      case 'warning':
        return $themeStyles.colors.warning[500];
      case 'info':
        return $themeStyles.colors.info[500];
      default:
        return $themeStyles.colors.gray[500];
    }
  };

  const indeterminateAnimation = {
    animation:
      variant === 'indeterminate' ? 'indeterminate-animation 1.5s infinite linear' : 'none',
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
});

const CircularProgressContainer = styled.div<{ size: ProgressSize }>(({ size }) => ({
  position: 'relative',
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: getCircularSize(size),
  height: getCircularSize(size),
}));

const CircularProgressSvg = styled.svg({
  transform: 'rotate(-90deg)',
});

const CircularProgressBackground = styled.circle<{
  color: ProgressColor;
  $themeStyles: ThemeStyles;
}>(({ color, $themeStyles }) => {
  const getColor = () => {
    switch (color) {
      case 'primary':
        return $themeStyles.colors.primary[100];
      case 'secondary':
        return $themeStyles.colors.secondary[100];
      case 'success':
        return $themeStyles.colors.success[100];
      case 'error':
        return $themeStyles.colors.error[100];
      case 'warning':
        return $themeStyles.colors.warning[100];
      case 'info':
        return $themeStyles.colors.info[100];
      default:
        return $themeStyles.colors.gray[100];
    }
  };

  return {
    fill: 'none',
    stroke: getColor(),
  };
});

const CircularProgressCircle = styled.circle<{
  color: ProgressColor;
  variant: ProgressVariant;
  $themeStyles: ThemeStyles;
}>(({ color, variant, $themeStyles }) => {
  const getColor = () => {
    switch (color) {
      case 'primary':
        return $themeStyles.colors.primary[500];
      case 'secondary':
        return $themeStyles.colors.secondary[500];
      case 'success':
        return $themeStyles.colors.success[500];
      case 'error':
        return $themeStyles.colors.error[500];
      case 'warning':
        return $themeStyles.colors.warning[500];
      case 'info':
        return $themeStyles.colors.info[500];
      default:
        return $themeStyles.colors.gray[500];
    }
  };

  const indeterminateAnimation =
    variant === 'indeterminate'
      ? {
          animation: 'circular-rotate 1.4s linear infinite',
          '@keyframes circular-rotate': {
            '0%': {
              strokeDasharray: '1px, 200px',
              strokeDashoffset: '0px',
            },
            '50%': {
              strokeDasharray: '100px, 200px',
              strokeDashoffset: '-15px',
            },
            '100%': {
              strokeDasharray: '100px, 200px',
              strokeDashoffset: '-125px',
            },
          },
        }
      : {};

  return {
    fill: 'none',
    stroke: getColor(),
    transition: variant === 'determinate' ? 'stroke-dashoffset 0.4s ease-in-out' : 'none',
    ...indeterminateAnimation,
  };
});

const Label = styled.div<{ $themeStyles: ThemeStyles }>(({ $themeStyles }) => ({
  marginBottom: '0.5rem',
  fontSize: $themeStyles.typography.scale.base,
  color: $themeStyles.colors.text.primary,
}));

const PercentageText = styled.div<{ size: ProgressSize; $themeStyles: ThemeStyles }>(
  ({ size, $themeStyles }) => {
    const getFontSize = () => {
      switch (size) {
        case 'small':
          return $themeStyles.typography.scale.xs;
        case 'large':
          return $themeStyles.typography.scale.base;
        case 'medium':
        default:
          return $themeStyles.typography.scale.sm;
      }
    };

    return {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: getFontSize(),
      fontWeight: 600,
      color: $themeStyles.colors.text.primary,
    };
  }
);

/**
 * Linear Progress component
 */
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
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  // Clamp value between 0 and 100
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <ProgressContainer className={className} style={style}>
      {label && <Label $themeStyles={themeStyles}>{label}</Label>}
      <LinearProgressWrapper
        size={size}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={variant === 'determinate' ? clampedValue : undefined}
        aria-label={ariaLabel}
      >
        <LinearProgressBase color={color} $themeStyles={themeStyles} />
        <LinearProgressBar
          color={color}
          value={clampedValue}
          variant={variant}
          $themeStyles={themeStyles}
        />
      </LinearProgressWrapper>
      {showPercentage && variant === 'determinate' && (
        <div
          style={{
            textAlign: 'right',
            marginTop: '0.25rem',
            fontSize: themeStyles.typography.scale.sm,
          }}
        >
          {clampedValue}%
        </div>
      )}
    </ProgressContainer>
  );
};

/**
 * Circular Progress component
 */
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
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  // Clamp value between 0 and 100
  const clampedValue = Math.min(Math.max(value, 0), 100);

  // Calculate SVG properties
  const THICKNESS = 4;
  const sizeValue = parseInt(getCircularSize(size), 10);
  const radius = (sizeValue - THICKNESS) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    variant === 'determinate' ? ((100 - clampedValue) / 100) * circumference : 0;

  return (
    <CircularProgressContainer
      size={size}
      className={className}
      style={style}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={variant === 'determinate' ? clampedValue : undefined}
      aria-label={ariaLabel}
    >
      <CircularProgressSvg
        width={sizeValue}
        height={sizeValue}
        viewBox={`0 0 ${sizeValue} ${sizeValue}`}
      >
        <CircularProgressBackground
          cx={sizeValue / 2}
          cy={sizeValue / 2}
          r={radius}
          strokeWidth={THICKNESS}
          color={color}
          $themeStyles={themeStyles}
        />
        <CircularProgressCircle
          cx={sizeValue / 2}
          cy={sizeValue / 2}
          r={radius}
          strokeWidth={THICKNESS}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          color={color}
          variant={variant}
          $themeStyles={themeStyles}
        />
      </CircularProgressSvg>
      {showPercentage && variant === 'determinate' && (
        <PercentageText size={size} $themeStyles={themeStyles}>
          {Math.round(clampedValue)}%
        </PercentageText>
      )}
    </CircularProgressContainer>
  );
};

/**
 * Progress component that renders either a Linear or Circular progress indicator
 */
export const Progress: React.FC<ProgressProps> = ({ type = 'linear', ...props }) => {
  return type === 'linear' ? <LinearProgress {...props} /> : <CircularProgress {...props} />;
};

export default Progress;
