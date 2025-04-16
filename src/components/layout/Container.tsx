import React, { ReactNode } from 'react';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// === Types ===
export type ContainerProps = {
  children: ReactNode;
  className?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'none';
  padding?: string | number;
  paddingX?: string | number;
  paddingY?: string | number;
  center?: boolean;
  fluid?: boolean;
  testId?: string;
  'data-testid'?: string;
};

// Helper function to get spacing values
const getSpacingValue = (
  value: number | string | undefined, 
  themeGetSpacing: (key: string, fallback?: string) => string,
  defaultValue: string = '0'
): string => {
  if (value === undefined) return defaultValue;
  
  if (typeof value === 'number') {
    return `${value}px`;
  }
  
  if (typeof value === 'string') {
    // Check if value is a theme spacing key (like 'md', 'lg', etc.)
    return themeGetSpacing(value, value);
  }
  
  return defaultValue;
};

// === Component ===
export const Container = ({
  children,
  className,
  maxWidth = 'lg',
  padding,
  paddingX,
  paddingY,
  center = true,
  fluid = false,
  testId,
  'data-testid': dataTestId,
  ...rest
}: ContainerProps) => {
  const theme = useDirectTheme();
  
  // Determine max-width based on theme breakpoints
  const getMaxWidth = () => {
    if (maxWidth === 'none') return 'none';
    if (maxWidth === 'full') return '100%';
    if (fluid) return '100%';
    
    // Get the breakpoint value from theme using direct access
    const breakpointValue = theme.theme?.breakpoints?.[maxWidth];
    return breakpointValue || '1280px'; // Default to lg size if not found
  };
  
  // Determine padding values
  const paddingHorizontal = paddingX !== undefined 
    ? getSpacingValue(paddingX, theme.getSpacing) 
    : (padding !== undefined ? getSpacingValue(padding, theme.getSpacing) : theme.getSpacing('4', '1rem'));
  
  const paddingVertical = paddingY !== undefined 
    ? getSpacingValue(paddingY, theme.getSpacing) 
    : (padding !== undefined ? getSpacingValue(padding, theme.getSpacing) : '0');
  
  const containerStyle = {
    width: '100%',
    maxWidth: getMaxWidth(),
    paddingLeft: paddingHorizontal,
    paddingRight: paddingHorizontal,
    paddingTop: paddingVertical,
    paddingBottom: paddingVertical,
    marginLeft: center ? 'auto' : undefined,
    marginRight: center ? 'auto' : undefined,
  };
  
  // Use the provided data-testid or fallback to testId
  const actualTestId = dataTestId || testId;
  
  return (
    <div 
      className={className} 
      style={containerStyle}
      data-testid={actualTestId}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Container; 