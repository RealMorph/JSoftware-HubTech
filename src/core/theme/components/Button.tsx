import React from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../DirectThemeProvider';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

interface ThemeStyles {
  colors: {
    primary: {
      main: string;
      light: string;
      dark: string;
      hover: string;
      focus: string;
    };
    text: {
      primary: string;
      secondary: string;
    };
    background: {
      default: string;
      hover: string;
      disabled: string;
    };
  };
  typography: {
    size: {
      sm: string;
      base: string;
      lg: string;
    };
    weight: {
      medium: number;
    };
  };
  spacing: {
    sm: string;
    md: string;
    lg: string;
  };
  borders: {
    radius: {
      base: string;
    };
    width: {
      thin: string;
    };
  };
  animation: {
    duration: {
      fast: string;
    };
    easing: {
      easeInOut: string;
    };
  };
  states: {
    opacity: {
      disabled: number;
    };
  };
}

const createThemeStyles = (theme: ReturnType<typeof useDirectTheme>): ThemeStyles => ({
  colors: {
    primary: {
      main: theme.getColor('primary.main', '#1976d2'),
      light: theme.getColor('primary.light', '#4791db'),
      dark: theme.getColor('primary.dark', '#115293'),
      hover: theme.getColor('primary.hover', '#1565c0'),
      focus: theme.getColor('primary.focus', '#2196f3'),
    },
    text: {
      primary: theme.getColor('text.primary', '#ffffff'),
      secondary: theme.getColor('text.secondary', '#666666'),
    },
    background: {
      default: theme.getColor('background.default', '#ffffff'),
      hover: theme.getColor('background.hover', '#f5f5f5'),
      disabled: theme.getColor('background.disabled', '#e0e0e0'),
    },
  },
  typography: {
    size: {
      sm: String(theme.getTypography('scale.sm', '0.875rem')),
      base: String(theme.getTypography('scale.base', '1rem')),
      lg: String(theme.getTypography('scale.lg', '1.125rem')),
    },
    weight: {
      medium: Number(theme.getTypography('weights.medium', 500)),
    },
  },
  spacing: {
    sm: theme.getSpacing('2', '0.5rem'),
    md: theme.getSpacing('4', '1rem'),
    lg: theme.getSpacing('6', '1.5rem'),
  },
  borders: {
    radius: {
      base: theme.getBorderRadius('base', '0.375rem'),
    },
    width: {
      thin: '1px',
    },
  },
  animation: {
    duration: {
      fast: '200ms',
    },
    easing: {
      easeInOut: 'ease-in-out',
    },
  },
  states: {
    opacity: {
      disabled: 0.5,
    },
  },
});

const StyledButton = styled.button<ButtonProps & { $themeStyles: ThemeStyles }>`
  font-size: ${props => {
    switch (props.size) {
      case 'sm':
        return props.$themeStyles.typography.size.sm;
      case 'lg':
        return props.$themeStyles.typography.size.lg;
      default:
        return props.$themeStyles.typography.size.base;
    }
  }};
  padding: ${props => {
    switch (props.size) {
      case 'sm':
        return props.$themeStyles.spacing.sm;
      case 'lg':
        return props.$themeStyles.spacing.lg;
      default:
        return props.$themeStyles.spacing.md;
    }
  }};
  color: ${props =>
    props.variant === 'outline'
      ? props.$themeStyles.colors.primary.main
      : props.$themeStyles.colors.text.primary};
  background-color: ${props => {
    switch (props.variant) {
      case 'primary':
        return props.$themeStyles.colors.primary.main;
      case 'secondary':
        return props.$themeStyles.colors.background.default;
      default:
        return 'transparent';
    }
  }};
  border: ${props =>
    props.variant === 'outline'
      ? `${props.$themeStyles.borders.width.thin} solid ${props.$themeStyles.colors.primary.main}`
      : 'none'};
  border-radius: ${props => props.$themeStyles.borders.radius.base};
  font-weight: ${props => props.$themeStyles.typography.weight.medium};
  cursor: pointer;
  transition: all ${props => props.$themeStyles.animation.duration.fast} ${props =>
    props.$themeStyles.animation.easing.easeInOut};
  width: ${props => (props.fullWidth ? '100%' : 'auto')};

  &:hover {
    background-color: ${props => {
      switch (props.variant) {
        case 'primary':
          return props.$themeStyles.colors.primary.hover;
        case 'secondary':
          return props.$themeStyles.colors.background.hover;
        default:
          return props.$themeStyles.colors.primary.light;
      }
    }};
    border-color: ${props =>
      props.variant === 'outline'
        ? props.$themeStyles.colors.primary.hover
        : 'transparent'};
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px ${props => props.$themeStyles.colors.primary.focus};
  }

  &:disabled {
    opacity: ${props => props.$themeStyles.states.opacity.disabled};
    cursor: not-allowed;
    background-color: ${props => props.$themeStyles.colors.background.disabled};
  }
`;

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  const theme = useDirectTheme();
  const themeStyles = createThemeStyles(theme);

  return (
    <StyledButton $themeStyles={themeStyles} {...props}>
      {children}
    </StyledButton>
  );
};
