import React, { forwardRef } from 'react';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';
import styled from '@emotion/styled';

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Variant of the panel */
  variant?: 'default' | 'outlined' | 'flat';
  /** Padding level */
  padding?: 'none' | 'small' | 'medium' | 'large';
  /** Custom background color from theme */
  bgColor?: string;
  /** Custom border color from theme */
  borderColor?: string;
  /** Whether the panel should take up the full width of its container */
  fullWidth?: boolean;
  /** Whether the panel should take up the full height of its container */
  fullHeight?: boolean;
  /** Children elements */
  children: React.ReactNode;
  /** Custom class name */
  className?: string;
}

// Styled components for Panel
const StyledPanel = styled.div<{
  $variant: string;
  $padding: string;
  $bgColor: string;
  $borderColor: string;
  $fullWidth: boolean;
  $fullHeight: boolean;
  $boxShadow: string;
  $borderRadius: string;
}>`
  display: flex;
  flex-direction: column;
  position: relative;
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
  height: ${props => (props.$fullHeight ? '100%' : 'auto')};
  padding: ${props => props.$padding};
  background-color: ${props => props.$bgColor};
  border-radius: ${props => props.$borderRadius};
  box-shadow: ${props => props.$boxShadow};
  border: ${props => (props.$variant === 'outlined' ? `1px solid ${props.$borderColor}` : 'none')};
  overflow: hidden;
`;

/**
 * Panel component - A simple container with customizable styling
 */
export const Panel = forwardRef<HTMLDivElement, PanelProps>(
  (
    {
      variant = 'default',
      padding = 'medium',
      bgColor,
      borderColor,
      fullWidth = false,
      fullHeight = false,
      children,
      className,
      ...props
    },
    ref
  ) => {
    // Use DirectThemeProvider hook for theme properties
    const { getColor, getSpacing, getBorderRadius, getShadow } = useDirectTheme();

    const getPaddingValue = (): string => {
      switch (padding) {
        case 'none':
          return '0';
        case 'small':
          return getSpacing('4', '1rem');
        case 'large':
          return getSpacing('8', '2rem');
        default:
          return getSpacing('6', '1.5rem'); // medium (default)
      }
    };

    const getBackgroundColor = (): string => {
      if (bgColor) {
        // Try to get color from theme first, fallback to raw value
        return getColor(bgColor, bgColor);
      }
      return getColor('surface', getColor('background', '#ffffff'));
    };

    const getBorderColor = (): string => {
      if (borderColor) {
        // Try to get color from theme first, fallback to raw value
        return getColor(borderColor, borderColor);
      }
      return getColor('border', getColor('gray.200', '#e5e7eb'));
    };

    const getBoxShadow = (): string => {
      if (variant === 'flat' || variant === 'outlined') return 'none';
      return getShadow('sm', '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)');
    };

    const getBorderRadiusValue = (): string => {
      return getBorderRadius('md', '0.375rem');
    };

    return (
      <StyledPanel
        ref={ref}
        $variant={variant}
        $padding={getPaddingValue()}
        $bgColor={getBackgroundColor()}
        $borderColor={getBorderColor()}
        $fullWidth={fullWidth}
        $fullHeight={fullHeight}
        $boxShadow={getBoxShadow()}
        $borderRadius={getBorderRadiusValue()}
        className={className}
        {...props}
      >
        {children}
      </StyledPanel>
    );
  }
);

Panel.displayName = 'Panel';

// PanelHeader component with direct theme access
export interface PanelHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to show a divider at the bottom */
  divider?: boolean;
}

export const PanelHeader = forwardRef<HTMLDivElement, PanelHeaderProps>(
  ({ divider = false, children, style, ...props }, ref) => {
    const { getColor, getSpacing } = useDirectTheme();

    const customStyles: React.CSSProperties = {
      padding: getSpacing('md', '1rem'),
      borderBottom: divider ? `1px solid ${getColor('border', '#e5e7eb')}` : undefined,
      ...style,
    };

    return (
      <div ref={ref} style={customStyles} {...props}>
        {children}
      </div>
    );
  }
);

PanelHeader.displayName = 'PanelHeader';

// PanelBody component
export const PanelBody = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, style, ...props }, ref) => {
    const customStyles: React.CSSProperties = {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      ...style,
    };

    return (
      <div ref={ref} style={customStyles} {...props}>
        {children}
      </div>
    );
  }
);

PanelBody.displayName = 'PanelBody';

// PanelFooter component with direct theme access
export interface PanelFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to show a divider at the top */
  divider?: boolean;
}

export const PanelFooter = forwardRef<HTMLDivElement, PanelFooterProps>(
  ({ divider = false, children, style, ...props }, ref) => {
    const { getColor, getSpacing } = useDirectTheme();

    const customStyles: React.CSSProperties = {
      padding: getSpacing('md', '1rem'),
      borderTop: divider ? `1px solid ${getColor('border', '#e5e7eb')}` : undefined,
      ...style,
    };

    return (
      <div ref={ref} style={customStyles} {...props}>
        {children}
      </div>
    );
  }
);

PanelFooter.displayName = 'PanelFooter';
