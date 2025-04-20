import React from 'react';
import styled from '@emotion/styled';
import { filterTransientProps } from '../../core/styled-components/transient-props';
import { useTheme } from '../../core/theme/ThemeContext';
import { createThemeStyles } from '../../core/theme/utils/themeUtils';
import { ThemeStyles, StyledComponentProps } from '../../core/theme/types';

// Define props interface
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

// Create filtered button for transient props
const FilteredButton = filterTransientProps(styled.button``);

// Define styled component props
interface ButtonStyledProps extends StyledComponentProps {
  $variant: string;
  $size: string;
  $fullWidth: boolean;
  $hasIcon: boolean;
  $iconPosition: string;
}

// Styled Components
const Button = styled(FilteredButton)<ButtonStyledProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${props => props.$themeStyles.typography.fontSize.md};
  border-radius: ${props => props.$themeStyles.borders.radius.medium};
  font-weight: ${props => props.$themeStyles.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
  border: none;
  position: relative;
  overflow: hidden;
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
  
  /* Size styles */
  padding: ${props => {
    switch (props.$size) {
      case 'small':
        return '8px 16px';
      case 'large':
        return '16px 32px';
      default:
        return '12px 24px';
    }
  }};
  
  font-size: ${props => {
    switch (props.$size) {
      case 'small':
        return props.$themeStyles.typography.fontSize.sm;
      case 'large':
        return props.$themeStyles.typography.fontSize.lg;
      default:
        return props.$themeStyles.typography.fontSize.md;
    }
  }};
  
  /* Icon styles */
  gap: ${props => props.$hasIcon ? '8px' : '0'};
  flex-direction: ${props => props.$iconPosition === 'right' ? 'row-reverse' : 'row'};
  
  /* Variant styles */
  background-color: ${props => {
    switch (props.$variant) {
      case 'primary':
        return props.$themeStyles.colors.primary.main;
      case 'secondary':
        return 'transparent';
      case 'tertiary':
        return 'transparent';
      case 'danger':
        return props.$themeStyles.colors.text.primary;
      default:
        return props.$themeStyles.colors.primary.main;
    }
  }};
  
  color: ${props => {
    switch (props.$variant) {
      case 'primary':
        return props.$themeStyles.colors.primary.contrastText;
      case 'secondary':
        return props.$themeStyles.colors.primary.main;
      case 'tertiary':
        return props.$themeStyles.colors.text.primary;
      case 'danger':
        return '#ffffff';
      default:
        return props.$themeStyles.colors.primary.contrastText;
    }
  }};
  
  border: ${props => {
    switch (props.$variant) {
      case 'secondary':
        return `2px solid ${props.$themeStyles.colors.primary.main}`;
      case 'tertiary':
        return 'none';
      default:
        return 'none';
    }
  }};
  
  &:hover {
    background-color: ${props => {
      switch (props.$variant) {
        case 'primary':
          return props.$themeStyles.colors.primary.dark;
        case 'secondary':
          return props.$themeStyles.colors.primary.main + '10'; // 10% opacity
        case 'tertiary':
          return props.$themeStyles.colors.text.primary + '10'; // 10% opacity
        case 'danger':
          return props.$themeStyles.colors.text.disabled;
        default:
          return props.$themeStyles.colors.primary.dark;
      }
    }};
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    
    &:hover {
      background-color: ${props => {
        switch (props.$variant) {
          case 'primary':
            return props.$themeStyles.colors.primary.main;
          case 'secondary':
            return 'transparent';
          case 'tertiary':
            return 'transparent';
          case 'danger':
            return props.$themeStyles.colors.text.primary;
          default:
            return props.$themeStyles.colors.primary.main;
        }
      }};
    }
  }
  
  &:focus-visible {
    outline: 2px solid ${props => props.$themeStyles.colors.primary.main};
    outline-offset: 2px;
  }
`;

// Demo component that displays various button examples
const ButtonDemo: React.FC = () => {
  return (
    <div>
      <h1>Button Demo</h1>
      <p>This is a placeholder for the Button demo component.</p>
    </div>
  );
};

export default ButtonDemo; 