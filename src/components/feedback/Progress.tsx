import React from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import { css } from '@emotion/react';

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
      main: string;
    };
    secondary: {
      100: string;
      500: string;
      main: string;
    };
    success: {
      100: string;
      500: string;
      main: string;
    };
    error: {
      100: string;
      500: string;
      main: string;
    };
    warning: {
      100: string;
      500: string;
      main: string;
    };
    info: {
      100: string;
      500: string;
      main: string;
    };
    gray: {
      100: string;
      500: string;
    };
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    background: {
      default: string;
      paper: string;
      disabled: string;
    };
  };
  typography: {
    family: string;
    size: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
    };
    weight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      none: number;
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  spacing: {
    unit: string;
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borders: {
    width: {
      thin: string;
      normal: string;
      thick: string;
    };
    radius: {
      none: string;
      small: string;
      medium: string;
      large: string;
      full: string;
    };
    style: {
      solid: string;
      dashed: string;
    };
  };
  animation: {
    duration: {
      fastest: string;
      fast: string;
      normal: string;
      slow: string;
      slowest: string;
    };
    easing: {
      linear: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
}

// Function to create theme styles from theme context
const createThemeStyles = (theme: ReturnType<typeof useDirectTheme>): ThemeStyles => {
  return {
    colors: {
      primary: {
        100: theme.getColor('primary.100', '#e0e7ff'),
        500: theme.getColor('primary.500', '#6366f1'),
        main: theme.getColor('primary.main', '#4f46e5'),
      },
      secondary: {
        100: theme.getColor('secondary.100', '#e0e7ff'),
        500: theme.getColor('secondary.500', '#8b5cf6'),
        main: theme.getColor('secondary.main', '#7c3aed'),
      },
      success: {
        100: theme.getColor('success.100', '#dcfce7'),
        500: theme.getColor('success.500', '#22c55e'),
        main: theme.getColor('success.main', '#16a34a'),
      },
      error: {
        100: theme.getColor('error.100', '#fee2e2'),
        500: theme.getColor('error.500', '#ef4444'),
        main: theme.getColor('error.main', '#dc2626'),
      },
      warning: {
        100: theme.getColor('warning.100', '#fef3c7'),
        500: theme.getColor('warning.500', '#f59e0b'),
        main: theme.getColor('warning.main', '#d97706'),
      },
      info: {
        100: theme.getColor('info.100', '#dbeafe'),
        500: theme.getColor('info.500', '#3b82f6'),
        main: theme.getColor('info.main', '#2563eb'),
      },
      gray: {
        100: theme.getColor('gray.100', '#f3f4f6'),
        500: theme.getColor('gray.500', '#6b7280'),
      },
      text: {
        primary: theme.getColor('text.primary', '#111827'),
        secondary: theme.getColor('text.secondary', '#4b5563'),
        disabled: theme.getColor('text.disabled', '#9ca3af'),
      },
      background: {
        default: theme.getColor('background.default', '#ffffff'),
        paper: theme.getColor('background.paper', '#ffffff'),
        disabled: theme.getColor('background.disabled', '#f3f4f6'),
      },
    },
    typography: {
      family: String(theme.getTypography('family.base', 'system-ui')),
      size: {
        xs: String(theme.getTypography('scale.xs', '0.75rem')),
        sm: String(theme.getTypography('scale.sm', '0.875rem')),
        base: String(theme.getTypography('scale.base', '1rem')),
        lg: String(theme.getTypography('scale.lg', '1.125rem')),
        xl: String(theme.getTypography('scale.xl', '1.25rem')),
      },
      weight: {
        normal: Number(theme.getTypography('weights.normal', 400)),
        medium: Number(theme.getTypography('weights.medium', 500)),
        semibold: Number(theme.getTypography('weights.semibold', 600)),
        bold: Number(theme.getTypography('weights.bold', 700)),
      },
      lineHeight: {
        none: 1,
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
      },
    },
    spacing: {
      unit: theme.getSpacing('1', '0.25rem'),
      xs: theme.getSpacing('2', '0.5rem'),
      sm: theme.getSpacing('3', '0.75rem'),
      md: theme.getSpacing('4', '1rem'),
      lg: theme.getSpacing('6', '1.5rem'),
      xl: theme.getSpacing('8', '2rem'),
    },
    borders: {
      width: {
        thin: '1px',
        normal: '2px',
        thick: '3px',
      },
      radius: {
        none: '0',
        small: theme.getBorderRadius('sm', '0.25rem'),
        medium: theme.getBorderRadius('md', '0.375rem'),
        large: theme.getBorderRadius('lg', '0.5rem'),
        full: '9999px',
      },
      style: {
        solid: 'solid',
        dashed: 'dashed',
      },
    },
    animation: {
      duration: {
        fastest: '100ms',
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
        slowest: '400ms',
      },
      easing: {
        linear: 'linear',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
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
const ProgressContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  font-family: ${props => props.$themeStyles.typography.family};
`;

const LinearProgressWrapper = styled.div<{ size: ProgressSize; $themeStyles: ThemeStyles }>`
  width: 100%;
  position: relative;
  overflow: hidden;
  height: ${props => getLinearSize(props.size)};
  border-radius: ${props => props.$themeStyles.borders.radius.full};
  background-color: ${props => props.$themeStyles.colors.background.disabled};
`;

const LinearProgressBar = styled.div<{
  color: ProgressColor;
  value: number;
  variant: ProgressVariant;
  $themeStyles: ThemeStyles;
}>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: ${props => props.$themeStyles.colors[props.color].main};
  width: ${props => (props.variant === 'determinate' ? `${props.value}%` : '100%')};
  transition: width ${props => props.$themeStyles.animation.duration.normal} ${props => props.$themeStyles.animation.easing.easeInOut};

  ${props =>
    props.variant === 'indeterminate' &&
    css`
      animation: indeterminate 2s ease-in-out infinite;
      @keyframes indeterminate {
        0% {
          left: -35%;
          right: 100%;
        }
        60% {
          left: 100%;
          right: -90%;
        }
        100% {
          left: 100%;
          right: -90%;
        }
      }
    `}
`;

const CircularProgressContainer = styled.div<{ size: ProgressSize; $themeStyles: ThemeStyles }>`
  position: relative;
  display: inline-flex;
  font-family: ${props => props.$themeStyles.typography.family};
`;

const CircularProgressSvg = styled.svg`
  transform: rotate(-90deg);
`;

const CircularProgressBackground = styled.circle<{
  color: ProgressColor;
  $themeStyles: ThemeStyles;
}>`
  fill: none;
  stroke: ${props => props.$themeStyles.colors[props.color][100]};
`;

const CircularProgressCircle = styled.circle<{
  color: ProgressColor;
  variant: ProgressVariant;
  $themeStyles: ThemeStyles;
}>`
  fill: none;
  stroke: ${props => props.$themeStyles.colors[props.color].main};
  transition: stroke-dashoffset ${props => props.$themeStyles.animation.duration.normal} ${props => props.$themeStyles.animation.easing.easeInOut};

  ${props =>
    props.variant === 'indeterminate' &&
    css`
      animation: circular-rotate 1.4s linear infinite;
      @keyframes circular-rotate {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `}
`;

const Label = styled.div<{ $themeStyles: ThemeStyles }>`
  margin-bottom: ${props => props.$themeStyles.spacing.xs};
  font-size: ${props => props.$themeStyles.typography.size.base};
  color: ${props => props.$themeStyles.colors.text.primary};
  line-height: ${props => props.$themeStyles.typography.lineHeight.normal};
`;

const PercentageText = styled.div<{ size: ProgressSize; $themeStyles: ThemeStyles }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: ${props => props.$themeStyles.typography.size[props.size === 'small' ? 'xs' : props.size === 'large' ? 'base' : 'sm']};
  font-weight: ${props => props.$themeStyles.typography.weight.semibold};
  color: ${props => props.$themeStyles.colors.text.primary};
  line-height: ${props => props.$themeStyles.typography.lineHeight.none};
`;

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
    <ProgressContainer className={className} style={style} $themeStyles={themeStyles}>
      {label && <Label $themeStyles={themeStyles}>{label}</Label>}
      <LinearProgressWrapper
        size={size}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={variant === 'determinate' ? clampedValue : undefined}
        aria-label={ariaLabel}
        $themeStyles={themeStyles}
      >
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
            marginTop: themeStyles.spacing.xs,
            fontSize: themeStyles.typography.size.sm,
            color: themeStyles.colors.text.primary,
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
      $themeStyles={themeStyles}
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
