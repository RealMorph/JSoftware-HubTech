import React from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../DirectThemeProvider';
import { ThemeConfig } from '../consolidated-types';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

declare module '@emotion/react' {
  export interface Theme extends ThemeConfig {}
}

const StyledButton = styled.button<ButtonProps>(
  ({ theme, variant = 'primary', size = 'md', fullWidth, loading }) => {
    // Map sizes to font size keys
    const fontSizeKey = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md';
    // Map sizes to spacing keys
    const paddingKey = size === 'sm' ? 'sm' : size === 'lg' ? 'xl' : 'md';

    // Get theme properties using direct access with fallbacks
    const primaryColor = theme.colors?.primary || '#1976d2';
    const primaryColorLight = theme.colors?.primary?.['100'] || '#bbdefb';
    const primaryColorDark = theme.colors?.primary?.['600'] || '#0d47a1';
    const grayColor = theme.colors?.gray?.['200'] || '#eeeeee';
    const grayColorDark = theme.colors?.gray?.['300'] || '#e0e0e0';

    // Get border radius
    const borderRadius = theme.borderRadius?.base || '4px';

    // Get font size and other typography values
    const fontSize = theme.typography?.fontSize?.[fontSizeKey] || '1rem';
    const fontWeight = theme.typography?.fontWeight?.medium || 500;

    // Get spacing/padding
    const padding = theme.spacing?.[paddingKey] || '1rem';

    // Get transition
    const transition = theme.transitions?.duration?.normal || '300ms';

    return {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize,
      padding,
      color: variant === 'outline' ? primaryColor : 'white',
      backgroundColor:
        variant === 'primary' ? primaryColor : variant === 'secondary' ? grayColor : 'transparent',
      border: variant === 'outline' ? `1px solid ${primaryColor}` : 'none',
      borderRadius,
      fontWeight,
      cursor: loading ? 'wait' : 'pointer',
      transition: `all ${transition}`,
      width: fullWidth ? '100%' : 'auto',
      position: 'relative',
      opacity: loading ? 0.8 : 1,
      '&:hover': {
        backgroundColor:
          variant === 'primary'
            ? primaryColorDark
            : variant === 'secondary'
              ? grayColorDark
              : primaryColorLight,
        borderColor: variant === 'outline' ? primaryColorDark : 'transparent',
      },
      '&:focus': {
        outline: 'none',
        boxShadow: `0 0 0 3px ${primaryColorLight}`,
      },
      '&:disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
        pointerEvents: 'none',
      },
    };
  }
);

// Loading spinner component
const Spinner = styled.span`
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const Button: React.FC<ButtonProps> = ({ children, loading, ...props }) => {
  return (
    <StyledButton loading={loading} disabled={loading || props.disabled} {...props}>
      {loading && <Spinner />}
      {children}
    </StyledButton>
  );
};
