import React from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

// Use the styled function with theme access through props
const StyledButton = styled.button<ButtonProps & { $themeStyles: any }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.$themeStyles.padding};
  border-radius: ${props => props.$themeStyles.borderRadius};
  font-weight: ${props => props.$themeStyles.fontWeight};
  font-size: ${props => props.$themeStyles.fontSize};
  background-color: ${props => props.$themeStyles.backgroundColor};
  color: ${props => props.$themeStyles.textColor};
  border: ${props => props.$themeStyles.border};
  transition: ${props => props.$themeStyles.transition};
  cursor: ${props => (props.disabled || props.loading ? 'not-allowed' : 'pointer')};
  width: ${props => (props.fullWidth ? '100%' : 'auto')};
  opacity: ${props => (props.disabled ? 0.6 : 1)};
  text-shadow: ${props => props.$themeStyles.textShadow};
  box-shadow: ${props => props.$themeStyles.boxShadow};

  &:hover:not(:disabled) {
    background-color: ${props => props.$themeStyles.hoverBackgroundColor};
    box-shadow: ${props => props.$themeStyles.hoverBoxShadow};
  }

  &:focus {
    outline: none;
    box-shadow: ${props => props.$themeStyles.focusBoxShadow};
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }
`;

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  // Use the direct theme hook to access theme utilities
  const { getColor, getTypography, getSpacing, getBorderRadius, getTransition, getShadow } =
    useDirectTheme();

  // Determine variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: getColor('gray.700', '#374151'),
          textColor: '#FFFFFF',
          hoverBackgroundColor: getColor('gray.800', '#1F2937'),
          border: '1px solid rgba(0, 0, 0, 0.15)',
        };
      case 'accent':
        return {
          backgroundColor: getColor('accent', '#8B5CF6'),
          textColor: '#FFFFFF',
          hoverBackgroundColor: getColor('accentDark', '#7C3AED'),
          border: '1px solid rgba(0, 0, 0, 0.15)',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          textColor: getColor('text.primary', '#374151'),
          hoverBackgroundColor: 'rgba(0, 0, 0, 0.05)',
          border: 'none',
        };
      default: // primary
        return {
          backgroundColor: getColor('primary', '#0062CC'),
          textColor: '#FFFFFF',
          hoverBackgroundColor: getColor('primaryDark', '#004C9E'),
          border: '1px solid rgba(0, 0, 0, 0.15)',
        };
    }
  };

  // Determine size-specific styles
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          fontSize: getTypography('fontSize.sm', '0.875rem'),
          padding: `${getSpacing('2', '0.375rem')} ${getSpacing('4', '0.75rem')}`,
        };
      case 'lg':
        return {
          fontSize: getTypography('fontSize.lg', '1.125rem'),
          padding: `${getSpacing('4', '0.75rem')} ${getSpacing('8', '1.5rem')}`,
        };
      default: // md
        return {
          fontSize: getTypography('fontSize.base', '1rem'),
          padding: `${getSpacing('3', '0.5rem')} ${getSpacing('6', '1rem')}`,
        };
    }
  };

  // Combine all styles
  const themeStyles = {
    ...getVariantStyles(),
    ...getSizeStyles(),
    borderRadius: getBorderRadius('md', '0.375rem'),
    fontWeight: getTypography('fontWeight.medium', 500),
    transition: getTransition('duration.normal', '0.2s') + ' ease-in-out',
    textShadow: '0 -1px 0 rgba(0, 0, 0, 0.1)',
    boxShadow: 'none',
    hoverBoxShadow: getShadow('sm', '0 2px 4px rgba(0,0,0,0.2)'),
    focusBoxShadow: `0 0 0 3px ${getColor('primary', '#0062CC')}40`,
  };

  return (
    <StyledButton $themeStyles={themeStyles} variant={variant} size={size} {...props}>
      {props.loading ? <span>Loading...</span> : children}
    </StyledButton>
  );
};
